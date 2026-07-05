const https = require('https');
const http = require('http');
const crypto = require('crypto');
const Webhook = require('../models/Webhook');
const WebhookDelivery = require('../models/WebhookDelivery');

const RETRY_DELAYS = [60, 300, 900];
const MAX_PAYLOAD_SIZE = 100 * 1024;
const MAX_BODY_LOG = 5000;
const TIMEOUT_MS = 10000;

function signPayload(secret, payload) {
  if (!secret) return null;
  return crypto
    .createHmac('sha256', secret)
    .update(typeof payload === 'string' ? payload : JSON.stringify(payload))
    .digest('hex');
}

function deliver(webhook, payload, event) {
  return new Promise((resolve) => {
    const body = JSON.stringify(payload);
    const urlObj = new URL(webhook.url);
    const isHttps = urlObj.protocol === 'https:';
    const startTime = Date.now();

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'User-Agent': 'NawaMart-Webhook/1.0',
        'X-Webhook-Event': event,
        'X-Webhook-Signature': signPayload(webhook.secret, body),
        'X-Webhook-Delivery': crypto.randomUUID(),
      },
      timeout: TIMEOUT_MS,
    };

    if (webhook.headers && webhook.headers.size > 0) {
      for (const [key, value] of webhook.headers) {
        options.headers[key] = value;
      }
    }

    const lib = isHttps ? https : http;
    const req = lib.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const duration = Date.now() - startTime;
        const bodyStr = Buffer.concat(chunks).toString('utf-8').slice(0, MAX_BODY_LOG);
        resolve({
          statusCode: res.statusCode,
          body: bodyStr,
          duration,
          success: res.statusCode >= 200 && res.statusCode < 300,
        });
      });
    });

    req.on('error', (err) => {
      const duration = Date.now() - startTime;
      resolve({
        statusCode: null,
        body: null,
        duration,
        success: false,
        error: err.message,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      const duration = Date.now() - startTime;
      resolve({
        statusCode: null,
        body: null,
        duration,
        success: false,
        error: 'Request timeout',
      });
    });

    if (body.length <= MAX_PAYLOAD_SIZE) {
      req.write(body);
    } else {
      req.destroy(new Error('Payload too large'));
      const duration = Date.now() - startTime;
      resolve({
        statusCode: null,
        body: null,
        duration,
        success: false,
        error: 'Payload exceeds maximum size',
      });
      return;
    }

    req.end();
  });
}

async function deliverWebhook(webhook, event, payload) {
  const delivery = await WebhookDelivery.create({
    webhook: webhook._id,
    merchant: webhook.merchant,
    store: webhook.store,
    event,
    payload,
    status: 'pending',
    attempts: 0,
    maxAttempts: RETRY_DELAYS.length + 1,
  });

  await triggerDelivery(delivery, webhook, payload);
  return delivery;
}

async function triggerDelivery(delivery, webhook, payload) {
  const result = await deliver(webhook, payload, delivery.event);

  delivery.attempts += 1;
  delivery.responseStatusCode = result.statusCode;
  delivery.responseBody = result.body;
  delivery.duration = result.duration;
  delivery.error = result.error || null;

  if (result.success) {
    delivery.status = 'success';
    delivery.completedAt = new Date();

    webhook.lastTriggeredAt = new Date();
    webhook.lastSuccessAt = new Date();
    webhook.consecutiveFailures = 0;
  } else {
    if (delivery.attempts >= delivery.maxAttempts) {
      delivery.status = 'failed';
      delivery.completedAt = new Date();

      webhook.lastTriggeredAt = new Date();
      webhook.lastFailureAt = new Date();
      webhook.consecutiveFailures = (webhook.consecutiveFailures || 0) + 1;
    } else {
      const delayIndex = delivery.attempts - 1;
      const delaySeconds = RETRY_DELAYS[delayIndex] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
      delivery.nextRetryAt = new Date(Date.now() + delaySeconds * 1000);
      delivery.status = 'pending';

      webhook.lastTriggeredAt = new Date();
      webhook.lastFailureAt = new Date();
      webhook.consecutiveFailures = (webhook.consecutiveFailures || 0) + 1;

      setTimeout(() => {
        retryDelivery(delivery._id);
      }, delaySeconds * 1000);
    }
  }

  await delivery.save();
  await webhook.save();
}

async function retryDelivery(deliveryId) {
  try {
    const delivery = await WebhookDelivery.findById(deliveryId);
    if (!delivery || delivery.status === 'success' || delivery.status === 'failed') return;

    const webhook = await Webhook.findById(delivery.webhook);
    if (!webhook || !webhook.isActive) return;

    await triggerDelivery(delivery, webhook, delivery.payload);
  } catch (err) {
    console.error('Webhook retry failed:', err.message);
  }
}

async function processRetryQueue() {
  try {
    const pending = await WebhookDelivery.find({
      status: 'pending',
      nextRetryAt: { $lte: new Date() },
      attempts: { $lt: 10 },
    }).populate('webhook');

    for (const delivery of pending) {
      if (!delivery.webhook || !delivery.webhook.isActive) {
        delivery.status = 'failed';
        delivery.completedAt = new Date();
        delivery.error = 'Webhook disabled or deleted';
        await delivery.save();
        continue;
      }

      await triggerDelivery(delivery, delivery.webhook, delivery.payload);
    }
  } catch (err) {
    console.error('Webhook retry queue processing error:', err.message);
  }
}

async function fire(event, payload, storeId, merchantId) {
  try {
    const webhooks = await Webhook.find({
      store: storeId,
      merchant: merchantId,
      isActive: true,
      events: event,
    });

    const results = [];
    for (const webhook of webhooks) {
      const delivery = await deliverWebhook(webhook, event, {
        event,
        storeId: storeId.toString(),
        merchantId: merchantId.toString(),
        timestamp: new Date().toISOString(),
        data: payload,
      });
      results.push(delivery);
    }

    return results;
  } catch (err) {
    console.error(`Webhook fire error for event ${event}:`, err.message);
    return [];
  }
}

async function getPendingDeliveriesCount() {
  return WebhookDelivery.countDocuments({
    status: 'pending',
    nextRetryAt: { $ne: null },
  });
}

setInterval(processRetryQueue, 60 * 1000);

module.exports = {
  fire,
  deliverWebhook,
  processRetryQueue,
  getPendingDeliveriesCount,
};
