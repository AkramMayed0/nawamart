const Ticket = require('../models/Ticket');
const TicketMessage = require('../models/TicketMessage');
const TicketService = require('../services/TicketService');
const { asyncHandler, apiResponse, getPaginationParams, paginateResponse } = require('../utils/helpers');

const createTicket = asyncHandler(async (req, res) => {
  const { subject, description, category, priority, storeId, tags } = req.body;

  if (!subject || !description) {
    return res.status(400).json({
      success: false,
      data: null,
      message: 'عنوان التذكرة ووصفها مطلوبان',
    });
  }

  const ticket = await TicketService.createTicket({
    merchant: req.userRole === 'merchant' ? req.user._id : undefined,
    customer: req.userRole === 'customer' ? req.user._id : undefined,
    senderId: req.user._id,
    senderRole: req.userRole,
    store: storeId || null,
    subject,
    description,
    category,
    priority,
    source: 'in_app',
    tags,
    senderName: req.user.name,
  });

  return apiResponse(res, {
    statusCode: 201,
    message: 'تم إنشاء التذكرة بنجاح',
    data: ticket,
  });
});

const getTickets = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req);
  const { status, priority, category, search } = req.query;

  const filter = {};
  if (req.userRole === 'merchant') filter.merchant = req.user._id;
  if (req.userRole === 'customer') filter.customer = req.user._id;
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (category) filter.category = category;
  if (search) {
    filter.$or = [
      { subject: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const [tickets, total] = await Promise.all([
    Ticket.find(filter)
      .populate('merchant', 'name email')
      .populate('customer', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit),
    Ticket.countDocuments(filter),
  ]);

  return apiResponse(res, {
    message: 'تم جلب التذاكر',
    data: tickets,
    pagination: paginateResponse(total, page, limit),
  });
});

const getTicketById = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id)
    .populate('merchant', 'name email phone')
    .populate('customer', 'name email phone')
    .populate('store', 'name slug')
    .populate('assignedTo', 'name email')
    .populate('internalNotes.addedBy', 'name email');

  if (!ticket) {
    return res.status(404).json({ success: false, data: null, message: 'التذكرة غير موجودة' });
  }

  const messages = await TicketMessage.find({ ticket: ticket._id })
    .sort({ createdAt: 1 })
    .lean();

  return apiResponse(res, {
    message: 'تم جلب التذكرة',
    data: { ticket, messages },
  });
});

const addMessage = asyncHandler(async (req, res) => {
  const { content, isInternal } = req.body;

  if (!content) {
    return res.status(400).json({ success: false, data: null, message: 'محتوى الرسالة مطلوب' });
  }

  const message = await TicketService.addMessage(
    req.params.id,
    req.user._id,
    req.userRole,
    content,
    { isInternal: isInternal || false, senderName: req.user.name }
  );

  if (!message) {
    return res.status(404).json({ success: false, data: null, message: 'التذكرة غير موجودة' });
  }

  return apiResponse(res, {
    statusCode: 201,
    message: 'تم إضافة الرسالة',
    data: message,
  });
});

const changeStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['open', 'in_progress', 'waiting_on_merchant', 'waiting_on_customer', 'resolved', 'closed'].includes(status)) {
    return res.status(400).json({ success: false, data: null, message: 'الحالة غير صالحة' });
  }

  const ticket = await TicketService.changeStatus(req.params.id, status, req.user._id, req.userRole);
  if (!ticket) {
    return res.status(404).json({ success: false, data: null, message: 'التذكرة غير موجودة' });
  }

  return apiResponse(res, {
    message: 'تم تحديث حالة التذكرة',
    data: ticket,
  });
});

const assignTicket = asyncHandler(async (req, res) => {
  const { adminId } = req.body;

  const ticket = await TicketService.assignTicket(req.params.id, adminId || req.user._id);
  if (!ticket) {
    return res.status(404).json({ success: false, data: null, message: 'التذكرة غير موجودة' });
  }

  return apiResponse(res, {
    message: 'تم تعيين المشرف للتذكرة',
    data: ticket,
  });
});

const addInternalNote = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ success: false, data: null, message: 'محتوى الملاحظة مطلوب' });
  }

  const ticket = await TicketService.addInternalNote(req.params.id, req.user._id, content);
  if (!ticket) {
    return res.status(404).json({ success: false, data: null, message: 'التذكرة غير موجودة' });
  }

  return apiResponse(res, {
    message: 'تم إضافة ملاحظة داخلية',
    data: ticket,
  });
});

const rateSatisfaction = asyncHandler(async (req, res) => {
  const { score, comment } = req.body;

  if (!score || score < 1 || score > 5) {
    return res.status(400).json({ success: false, data: null, message: 'التقييم يجب أن يكون بين 1 و 5' });
  }

  const ticket = await TicketService.rateSatisfaction(req.params.id, score, comment);
  if (!ticket) {
    return res.status(404).json({ success: false, data: null, message: 'التذكرة غير موجودة' });
  }

  return apiResponse(res, {
    message: 'تم تسجيل تقييم الرضا',
    data: ticket,
  });
});

const getTicketStats = asyncHandler(async (req, res) => {
  const stats = await TicketService.getTicketStats();
  return apiResponse(res, {
    message: 'تم جلب إحصائيات التذاكر',
    data: stats,
  });
});

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  addMessage,
  changeStatus,
  assignTicket,
  addInternalNote,
  rateSatisfaction,
  getTicketStats,
};
