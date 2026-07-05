const Order = require('../models/Order');
const OrderFulfillment = require('../models/OrderFulfillment');
const OrderNote = require('../models/OrderNote');
const InventoryService = require('./InventoryService');

class OrderService {

  /**
   * Add a timeline event to the order
   */
  static async addTimelineEvent(orderId, event) {
    return Order.findByIdAndUpdate(
      orderId,
      {
        $push: {
          orderTimeline: {
            action: event.action,
            label: event.label,
            performedBy: event.performedBy || null,
            performedByName: event.performedByName || 'النظام',
            timestamp: new Date(),
            details: event.details || null,
          },
        },
      },
      { new: true }
    );
  }

  /**
   * Mark order as processing (between confirmed and shipped)
   */
  static async processOrder(order, userId) {
    if (order.status !== 'confirmed') {
      throw new Error('لا يمكن معالجة الطلب وحالته الحالية');
    }
    order.status = 'processing';
    order.processingAt = new Date();
    order.processingBy = userId;

    this.addTimelineEvent(order._id, {
      action: 'order.process',
      label: 'قيد المعالجة',
      performedBy: userId,
      performedByName: 'التاجر',
      details: 'بدأت معالجة الطلب',
    });

    await order.save();
    return order;
  }

  /**
   * Fulfill an order (partial or full)
   */
  static async fulfillOrder(order, data, userId) {
    if (order.status !== 'confirmed' && order.status !== 'processing') {
      throw new Error('لا يمكن تنفيذ الطلب وحالته الحالية');
    }

    const fulfillment = await OrderFulfillment.create({
      order: order._id,
      store: order.store,
      merchant: order.merchant,
      status: data.carrier ? 'shipped' : 'pending',
      items: data.items,
      carrier: data.carrier || null,
      trackingNumber: data.trackingNumber || null,
      trackingUrl: data.trackingUrl || null,
      shippedAt: data.carrier ? new Date() : null,
      notes: data.notes || null,
      createdBy: userId,
    });

    // Track fulfilled quantity
    const fulfilledQty = data.items.reduce((sum, i) => sum + i.quantity, 0);
    order.fulfilledQuantity = (order.fulfilledQuantity || 0) + fulfilledQty;

    const totalOrderQty = order.items.reduce((sum, i) => sum + i.quantity, 0);
    if (order.fulfilledQuantity >= totalOrderQty) {
      order.isFullyFulfilled = true;
    }

    // Auto-advance status if fully fulfilled
    if (order.isFullyFulfilled && order.status === 'processing') {
      order.status = 'shipped';
      order.shippedAt = new Date();
      order.shippedBy = userId;
    } else if (order.isFullyFulfilled && order.status === 'confirmed') {
      order.status = 'shipped';
      order.shippedAt = new Date();
      order.shippedBy = userId;
    }

    this.addTimelineEvent(order._id, {
      action: 'order.fulfill',
      label: 'تم التنفيذ الجزئي',
      performedBy: userId,
      performedByName: 'التاجر',
      details: `تم تنفيذ ${fulfilledQty} وحدة${data.trackingNumber ? ' (رقم التتبع: ' + data.trackingNumber + ')' : ''}`,
    });

    await order.save();

    return { fulfillment, order };
  }

  /**
   * Get all fulfillments for an order
   */
  static async getFulfillments(orderId) {
    return OrderFulfillment.find({ order: orderId })
      .sort({ createdAt: -1 });
  }

  /**
   * Cancel an order (before shipping) and restore stock
   */
  static async cancelOrder(order, reason, userId) {
    if (['shipped', 'delivered', 'cancelled', 'returned'].includes(order.status)) {
      throw new Error('لا يمكن إلغاء الطلب وحالته الحالية');
    }

    // Restore stock
    await InventoryService.restoreStock({
      items: order.items,
      storeId: order.store,
      merchantId: order.merchant,
      performedBy: userId,
    });

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancelledBy = userId;
    order.cancellationReason = reason || null;

    this.addTimelineEvent(order._id, {
      action: 'order.cancel',
      label: 'تم الإلغاء',
      performedBy: userId,
      performedByName: 'التاجر',
      details: reason || 'تم إلغاء الطلب',
    });

    await order.save();
    return order;
  }

  /**
   * Mark order as returned (post-delivery)
   */
  static async returnOrder(order, reason, userId) {
    if (order.status !== 'delivered') {
      throw new Error('يمكن إرجاع الطلبات المسلمة فقط');
    }

    // Restore stock
    await InventoryService.restoreStock({
      items: order.items,
      storeId: order.store,
      merchantId: order.merchant,
      performedBy: userId,
    });

    order.status = 'returned';
    order.returnedAt = new Date();
    order.returnedBy = userId;

    this.addTimelineEvent(order._id, {
      action: 'order.return',
      label: 'تم الإرجاع',
      performedBy: userId,
      performedByName: 'التاجر',
      details: reason || 'تم إرجاع الطلب',
    });

    await order.save();
    return order;
  }

  /**
   * Capture payment (for non-cash orders — marks payment as confirmed)
   */
  static async capturePayment(order, userId) {
    if (order.paymentMethod === 'cash') {
      throw new Error('الدفع عند الاستلام لا يتطلب تأكيد دفع');
    }
    if (order.paymentConfirmed) {
      throw new Error('تم تأكيد الدفع مسبقاً');
    }

    order.paymentConfirmed = true;

    this.addTimelineEvent(order._id, {
      action: 'order.payment_captured',
      label: 'تم تأكيد الدفع',
      performedBy: userId,
      performedByName: 'التاجر',
    });

    await order.save();
    return order;
  }

  /**
   * Process a refund
   */
  static async refundOrder(order, data, userId) {
    if (order.paymentMethod === 'cash') {
      throw new Error('الدفع عند الاستلام لا يتطلب استرداد');
    }

    this.addTimelineEvent(order._id, {
      action: 'order.refund',
      label: 'تم الاسترداد',
      performedBy: userId,
      performedByName: 'التاجر',
      details: `المبلغ: ${data.amount || order.totalAmount} ريال${data.reason ? ' - سبب: ' + data.reason : ''}`,
    });

    return true;
  }

  /**
   * Add a note to an order
   */
  static async addNote(orderId, data, userId) {
    const note = await OrderNote.create({
      order: orderId,
      author: userId,
      authorName: data.authorName || 'التاجر',
      content: data.content,
      isInternal: data.isInternal || false,
      isCustomerVisible: data.isCustomerVisible !== false,
    });

    this.addTimelineEvent(orderId, {
      action: data.isInternal ? 'order.note_internal' : 'order.note',
      label: 'تمت إضافة ملاحظة',
      performedBy: userId,
      performedByName: data.authorName || 'التاجر',
      details: data.isInternal ? 'ملاحظة داخلية' : 'ملاحظة',
    });

    return note;
  }

  /**
   * Get notes for an order
   */
  static async getNotes(orderId, includeInternal = false) {
    const filter = { order: orderId };
    if (!includeInternal) {
      filter.isCustomerVisible = true;
    }
    return OrderNote.find(filter)
      .populate('author', 'name')
      .sort({ createdAt: -1 });
  }

  /**
   * Generate packing slip data
   */
  static async generatePackingSlip(orderId, userId) {
    const order = await Order.findById(orderId)
      .populate('store', 'name logo phone')
      .populate('items.product', 'name sku');

    if (!order) throw new Error('الطلب غير موجود');

    order.packingSlip = {
      generatedAt: new Date(),
      generatedBy: userId,
      printedCount: (order.packingSlip?.printedCount || 0) + 1,
    };
    await order.save();

    this.addTimelineEvent(orderId, {
      action: 'order.packing_slip',
      label: 'تم إنشاء فاتورة التعبئة',
      performedBy: userId,
      performedByName: 'التاجر',
    });

    return order;
  }

  /**
   * Bulk update orders status
   */
  static async bulkAction({ orderIds, action, data, userId }) {
    const results = { succeeded: [], failed: [] };

    for (const id of orderIds) {
      try {
        const order = await Order.findOne({ _id: id, merchant: userId });
        if (!order) {
          results.failed.push({ id, reason: 'الطلب غير موجود' });
          continue;
        }

        switch (action) {
          case 'fulfill':
            await this.fulfillOrder(order, data, userId);
            break;
          case 'cancel':
            await this.cancelOrder(order, data?.reason, userId);
            break;
          case 'process':
            await this.processOrder(order, userId);
            break;
          case 'generate_packing_slip':
            await this.generatePackingSlip(id, userId);
            break;
          default:
            results.failed.push({ id, reason: 'إجراء غير معروف' });
            continue;
        }
        results.succeeded.push(id);
      } catch (err) {
        results.failed.push({ id, reason: err.message });
      }
    }

    return results;
  }

  /**
   * Export orders as CSV-ready array
   */
  static async exportOrders(query, merchantId) {
    const filter = { merchant: merchantId };
    if (query.status) filter.status = query.status;
    if (query.storeId) filter.store = query.storeId;
    if (query.date_from || query.date_to) {
      filter.createdAt = {};
      if (query.date_from) filter.createdAt.$gte = new Date(query.date_from);
      if (query.date_to) filter.createdAt.$lte = new Date(query.date_to);
    }

    const orders = await Order.find(filter)
      .populate('customer', 'name phone email')
      .sort({ createdAt: -1 });

    return orders.map((o) => ({
      'رقم الطلب': String(o._id),
      'الحالة': o.status,
      'العميل': o.deliveryAddress?.name || o.customer?.name || '',
      'الهاتف': o.deliveryAddress?.phone || o.customer?.phone || '',
      'المدينة': o.deliveryAddress?.city || '',
      'المبلغ الإجمالي': o.totalAmount,
      'رسوم الشحن': o.shippingFee,
      'طريقة الدفع': o.paymentMethod,
      'تاريخ الطلب': o.createdAt?.toISOString() || '',
    }));
  }
}

module.exports = OrderService;
