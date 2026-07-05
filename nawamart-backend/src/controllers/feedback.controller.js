const Feedback = require('../models/Feedback');
const FeedbackService = require('../services/FeedbackService');
const { asyncHandler, apiResponse, getPaginationParams, paginateResponse } = require('../utils/helpers');

const submitFeedback = asyncHandler(async (req, res) => {
  const { feedbackType, npsScore, rating, message, featureTitle, featureDescription, featureCategory } = req.body;

  if (!feedbackType) {
    return res.status(400).json({ success: false, data: null, message: 'نوع الملاحظات مطلوب' });
  }

  const feedback = await FeedbackService.submitFeedback({
    feedbackType,
    merchant: req.userRole === 'merchant' ? req.user._id : undefined,
    customer: req.userRole === 'customer' ? req.user._id : undefined,
    npsScore: npsScore ?? undefined,
    rating: rating ?? undefined,
    message,
    featureTitle,
    featureDescription,
    featureCategory,
    source: 'in_app',
  });

  return apiResponse(res, {
    statusCode: 201,
    message: 'تم إرسال ملاحظاتك بنجاح',
    data: feedback,
  });
});

const getFeatureRequests = asyncHandler(async (req, res) => {
  const { status, category } = req.query;
  const requests = await FeedbackService.getFeatureRequests({ status, category });
  return apiResponse(res, {
    message: 'تم جلب طلبات الميزات',
    data: requests,
  });
});

const voteFeatureRequest = asyncHandler(async (req, res) => {
  const feedback = await FeedbackService.voteFeatureRequest(req.params.id, req.user._id, req.userRole);
  if (!feedback) {
    return res.status(404).json({ success: false, data: null, message: 'طلب الميزة غير موجود' });
  }
  return apiResponse(res, {
    message: 'تم التصويت',
    data: { votes: feedback.votes },
  });
});

const unvoteFeatureRequest = asyncHandler(async (req, res) => {
  const feedback = await FeedbackService.unvoteFeatureRequest(req.params.id, req.user._id);
  if (!feedback) {
    return res.status(404).json({ success: false, data: null, message: 'طلب الميزة غير موجود' });
  }
  return apiResponse(res, {
    message: 'تم إلغاء التصويت',
    data: { votes: feedback.votes },
  });
});

const updateFeatureRequestStatus = asyncHandler(async (req, res) => {
  const { status, adminResponse } = req.body;

  if (!['under_review', 'planned', 'in_progress', 'completed', 'declined'].includes(status)) {
    return res.status(400).json({ success: false, data: null, message: 'الحالة غير صالحة' });
  }

  const feedback = await FeedbackService.updateFeatureRequestStatus(req.params.id, status, adminResponse);
  if (!feedback) {
    return res.status(404).json({ success: false, data: null, message: 'طلب الميزة غير موجود' });
  }

  return apiResponse(res, {
    message: 'تم تحديث حالة طلب الميزة',
    data: feedback,
  });
});

const getNPSReport = asyncHandler(async (req, res) => {
  const report = await FeedbackService.getNPSReport();
  return apiResponse(res, {
    message: 'تم جلب تقرير NPS',
    data: report,
  });
});

const getRecentFeedback = asyncHandler(async (req, res) => {
  const { limit } = req.query;
  const feedback = await FeedbackService.getRecentFeedback(parseInt(limit) || 20);
  return apiResponse(res, {
    message: 'تم جلب أحدث الملاحظات',
    data: feedback,
  });
});

const getFeedbackStats = asyncHandler(async (req, res) => {
  const stats = await FeedbackService.getFeedbackStats();
  return apiResponse(res, {
    message: 'تم جلب إحصائيات الملاحظات',
    data: stats,
  });
});

const getAllFeedback = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req);
  const { feedbackType, status } = req.query;

  const filter = {};
  if (feedbackType) filter.feedbackType = feedbackType;
  if (status) filter.status = status;

  const [feedback, total] = await Promise.all([
    Feedback.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('merchant', 'name email')
      .populate('customer', 'name email'),
    Feedback.countDocuments(filter),
  ]);

  return apiResponse(res, {
    message: 'تم جلب الملاحظات',
    data: feedback,
    pagination: paginateResponse(total, page, limit),
  });
});

module.exports = {
  submitFeedback,
  getFeatureRequests,
  voteFeatureRequest,
  unvoteFeatureRequest,
  updateFeatureRequestStatus,
  getNPSReport,
  getRecentFeedback,
  getFeedbackStats,
  getAllFeedback,
};
