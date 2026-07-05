const Report = require('../models/Report');
const MetricSnapshot = require('../models/MetricSnapshot');
const Merchant = require('../models/Merchant');
const Store = require('../models/Store');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { getTransporter } = require('./email');

class ReportService {
  async createReport(data) {
    const report = await Report.create(data);
    if (report.schedule.enabled && report.schedule.frequency) {
      report.schedule.nextRunAt = this.calculateNextRun(report.schedule.frequency);
      await report.save();
    }
    return report;
  }

  async updateReport(reportId, data) {
    const report = await Report.findById(reportId);
    if (!report) return null;

    Object.assign(report, data);
    if (data.schedule && data.schedule.frequency) {
      report.schedule.nextRunAt = this.calculateNextRun(data.schedule.frequency);
    }
    await report.save();
    return report;
  }

  calculateNextRun(frequency) {
    const now = new Date();
    switch (frequency) {
      case 'daily':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 6, 0, 0);
      case 'weekly':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() + (7 - now.getDay()), 6, 0, 0);
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth() + 1, 1, 6, 0, 0);
      case 'quarterly':
        return new Date(now.getFullYear(), now.getMonth() + 3, 1, 6, 0, 0);
      default:
        return null;
    }
  }

  async buildReportData(report) {
    const { config } = report;
    const { startDate, endDate } = this.resolveDateRange(config.dateRange);

    if (report.scope === 'platform') {
      return this.buildPlatformData(config.metrics, startDate, endDate, config);
    }
    if (report.scope === 'merchant') {
      return this.buildMerchantData(report.scopeRef, config.metrics, startDate, endDate, config);
    }
    if (report.scope === 'store') {
      return this.buildStoreData(report.scopeRef, config.metrics, startDate, endDate, config);
    }
    return { error: 'نطاق التقرير غير معروف' };
  }

  resolveDateRange(dateRange) {
    const now = new Date();
    let startDate, endDate = now;

    switch (dateRange.preset) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'yesterday':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'last7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'last30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'thisQuarter':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'lastQuarter':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 - 3, 1);
        endDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'thisYear':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'custom':
        startDate = dateRange.startDate ? new Date(dateRange.startDate) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        endDate = dateRange.endDate ? new Date(dateRange.endDate) : now;
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return { startDate, endDate };
  }

  async buildPlatformData(metrics, startDate, endDate, config) {
    const data = {};
    const snapshot = await MetricSnapshot.findOne({
      snapshotType: 'daily',
      scope: 'platform',
      periodEnd: { $gte: startDate, $lte: endDate },
    }).sort({ periodEnd: -1 });

    if (!snapshot) {
      return this.buildPlatformDataFromSources(startDate, endDate, metrics);
    }

    if (metrics.length === 0 || metrics.includes('summary')) {
      data.summary = {
        totalMerchants: snapshot.metrics.platform.totalMerchants,
        totalStores: snapshot.metrics.platform.totalStores,
        totalOrders: snapshot.metrics.platform.totalOrders,
        totalRevenue: snapshot.metrics.platform.totalRevenue,
        totalCustomers: snapshot.metrics.platform.totalCustomers,
        mrr: snapshot.metrics.revenue.mrr,
        arr: snapshot.metrics.revenue.arr,
      };
    }

    return data;
  }

  async buildPlatformDataFromSources(startDate, endDate, metrics) {
    const data = {};

    const [totalMerchants, totalStores, totalOrders, totalCustomers, revenueAgg] = await Promise.all([
      Merchant.countDocuments(),
      Store.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
      Customer.countDocuments(),
      Order.aggregate([
        { $match: { status: { $in: ['confirmed', 'shipped', 'delivered'] }, createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);

    data.summary = {
      totalMerchants,
      totalStores,
      totalOrders,
      totalCustomers,
      totalRevenue: revenueAgg[0]?.total ?? 0,
    };

    return data;
  }

  async buildMerchantData(merchantId, metrics, startDate, endDate, config) {
    const [orders, revenueAgg, products, stores] = await Promise.all([
      Order.find({ merchant: merchantId, createdAt: { $gte: startDate, $lte: endDate } }).lean(),
      Order.aggregate([
        { $match: { merchant: merchantId, status: { $in: ['confirmed', 'shipped', 'delivered'] }, createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Product.countDocuments({ merchant: merchantId, isDeleted: { $ne: true } }),
      Store.find({ merchant: merchantId }).select('name plan storeStatus').lean(),
    ]);

    return {
      orders: orders.length,
      revenue: revenueAgg[0]?.total ?? 0,
      products,
      stores,
      period: { startDate, endDate },
    };
  }

  async buildStoreData(storeId, metrics, startDate, endDate, config) {
    const [orders, revenueAgg, products] = await Promise.all([
      Order.find({ store: storeId, createdAt: { $gte: startDate, $lte: endDate } }).lean(),
      Order.aggregate([
        { $match: { store: storeId, status: { $in: ['confirmed', 'shipped', 'delivered'] }, createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Product.countDocuments({ store: storeId, isDeleted: { $ne: true } }),
    ]);

    return {
      orders: orders.length,
      revenue: revenueAgg[0]?.total ?? 0,
      products,
      period: { startDate, endDate },
    };
  }

  generateEmailHtml(report, data) {
    const summary = data.summary || data;
    const rows = Object.entries(summary)
      .filter(([key]) => !key.includes('period') && !Array.isArray(summary[key]))
      .map(([key, value]) => `<tr><td style="padding:8px 12px;border-bottom:1px solid #e0e0e0;font-size:14px;">${this.translateKey(key)}</td><td style="padding:8px 12px;border-bottom:1px solid #e0e0e0;font-size:14px;font-weight:bold;text-align:left;">${typeof value === 'number' ? value.toLocaleString() : value}</td></tr>`)
      .join('');

    return `
      <div dir="rtl" style="font-family:'Cairo',Tahoma,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <div style="background-color:#0D1B2A;padding:20px;text-align:center;border-radius:8px 8px 0 0;">
          <h1 style="color:#ffffff;margin:0;font-size:24px;">نوامارت</h1>
        </div>
        <div style="background-color:#f9f9f9;padding:30px;border:1px solid #e0e0e0;border-top:none;border-radius:0 0 8px 8px;">
          <h2 style="color:#0D1B2A;font-size:20px;margin-top:0;">${report.name}</h2>
          ${report.description ? `<p style="color:#555;line-height:1.8;">${report.description}</p>` : ''}
          <table style="width:100%;border-collapse:collapse;margin-top:16px;">
            ${rows}
          </table>
          <hr style="border:none;border-top:1px solid #e0e0e0;margin:20px 0;" />
          <p style="color:#999;font-size:12px;text-align:center;">© ${new Date().getFullYear()} نوامارت — منصة التجارة الإلكترونية اليمنية</p>
        </div>
      </div>
    `;
  }

  translateKey(key) {
    const map = {
      totalMerchants: 'إجمالي التجار',
      totalStores: 'إجمالي المتاجر',
      totalOrders: 'إجمالي الطلبات',
      totalRevenue: 'إجمالي الإيرادات',
      totalCustomers: 'إجمالي العملاء',
      totalProducts: 'إجمالي المنتجات',
      mrr: 'الإيرادات الشهرية المتكررة (MRR)',
      arr: 'الإيرادات السنوية المتكررة (ARR)',
      orders: 'الطلبات',
      revenue: 'الإيرادات',
      products: 'المنتجات',
      averageOrderValue: 'متوسط قيمة الطلب',
      conversionRate: 'معدل التحويل',
    };
    return map[key] || key;
  }

  async sendReportEmail(report) {
    const transporter = getTransporter();
    if (!transporter) return { sent: false, reason: 'no_smtp' };

    try {
      const data = await this.buildReportData(report);
      const html = this.generateEmailHtml(report, data);

      const fromName = process.env.EMAIL_FROM_NAME || 'نوامارت';
      const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER;

      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: report.schedule.recipients.join(', '),
        subject: `تقرير ${report.name} — ${new Date().toLocaleDateString('ar-YE')}`,
        html,
      });

      report.lastSentAt = new Date();
      report.totalSent += 1;
      report.schedule.lastRunAt = new Date();
      report.schedule.nextRunAt = this.calculateNextRun(report.schedule.frequency);
      await report.save();

      return { sent: true };
    } catch (err) {
      return { sent: false, error: err.message };
    }
  }

  async processScheduledReports() {
    const now = new Date();
    const reports = await Report.find({
      'schedule.enabled': true,
      'schedule.nextRunAt': { $lte: now },
      isActive: true,
    });

    const results = [];
    for (const report of reports) {
      const result = await this.sendReportEmail(report);
      results.push({ reportId: report._id, name: report.name, ...result });
    }

    return results;
  }
}

module.exports = new ReportService();
