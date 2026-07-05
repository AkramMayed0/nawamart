const Report = require('../models/Report');
const ReportService = require('../services/ReportService');
const { asyncHandler, apiResponse, getPaginationParams, paginateResponse } = require('../utils/helpers');

const createReport = asyncHandler(async (req, res) => {
  const { name, description, scope, scopeRef, config, schedule, format } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      data: null,
      message: 'اسم التقرير مطلوب',
    });
  }

  const reportData = {
    name,
    description: description || null,
    createdBy: req.user._id,
    createdByRole: req.userRole || 'admin',
    scope: scope || 'platform',
    scopeRef: scopeRef || null,
    config: config || {},
    schedule: schedule || { enabled: false },
  };

  const report = await ReportService.createReport(reportData);

  return apiResponse(res, {
    statusCode: 201,
    message: 'تم إنشاء التقرير بنجاح',
    data: report,
  });
});

const getReports = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req);
  const { scope, isActive } = req.query;

  const filter = {};
  if (req.userRole === 'merchant') {
    filter.createdBy = req.user._id;
  }
  if (scope) filter.scope = scope;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const [reports, total] = await Promise.all([
    Report.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Report.countDocuments(filter),
  ]);

  return apiResponse(res, {
    message: 'تم جلب التقارير',
    data: reports,
    pagination: paginateResponse(total, page, limit),
  });
});

const getReportById = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) {
    return res.status(404).json({
      success: false,
      data: null,
      message: 'التقرير غير موجود',
    });
  }

  return apiResponse(res, {
    message: 'تم جلب التقرير',
    data: report,
  });
});

const updateReport = asyncHandler(async (req, res) => {
  const { name, description, config, schedule, isActive } = req.body;

  const report = await Report.findById(req.params.id);
  if (!report) {
    return res.status(404).json({
      success: false,
      data: null,
      message: 'التقرير غير موجود',
    });
  }

  if (name) report.name = name;
  if (description !== undefined) report.description = description;
  if (config) report.config = { ...report.config, ...config };
  if (schedule) report.schedule = { ...report.schedule, ...schedule };
  if (isActive !== undefined) report.isActive = isActive;

  if (schedule && schedule.frequency) {
    report.schedule.nextRunAt = ReportService.calculateNextRun(schedule.frequency);
  }

  await report.save();

  return apiResponse(res, {
    message: 'تم تحديث التقرير بنجاح',
    data: report,
  });
});

const deleteReport = asyncHandler(async (req, res) => {
  const report = await Report.findByIdAndDelete(req.params.id);
  if (!report) {
    return res.status(404).json({
      success: false,
      data: null,
      message: 'التقرير غير موجود',
    });
  }

  return apiResponse(res, {
    message: 'تم حذف التقرير',
    data: null,
  });
});

const generateReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) {
    return res.status(404).json({
      success: false,
      data: null,
      message: 'التقرير غير موجود',
    });
  }

  const data = await ReportService.buildReportData(report);

  return apiResponse(res, {
    message: 'تم إنشاء التقرير',
    data,
  });
});

const sendReportNow = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) {
    return res.status(404).json({
      success: false,
      data: null,
      message: 'التقرير غير موجود',
    });
  }

  if (!report.schedule.recipients || report.schedule.recipients.length === 0) {
    return res.status(400).json({
      success: false,
      data: null,
      message: 'لا يوجد مستلمين للتقرير',
    });
  }

  const result = await ReportService.sendReportEmail(report);

  return apiResponse(res, {
    message: result.sent ? 'تم إرسال التقرير بنجاح' : 'فشل إرسال التقرير',
    data: result,
  });
});

const toggleReportSchedule = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) {
    return res.status(404).json({
      success: false,
      data: null,
      message: 'التقرير غير موجود',
    });
  }

  report.schedule.enabled = !report.schedule.enabled;
  if (report.schedule.enabled && report.schedule.frequency) {
    report.schedule.nextRunAt = ReportService.calculateNextRun(report.schedule.frequency);
  } else {
    report.schedule.nextRunAt = null;
  }

  await report.save();

  return apiResponse(res, {
    message: report.schedule.enabled ? 'تم تفعيل جدولة التقرير' : 'تم إيقاف جدولة التقرير',
    data: report,
  });
});

module.exports = {
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport,
  generateReport,
  sendReportNow,
  toggleReportSchedule,
};
