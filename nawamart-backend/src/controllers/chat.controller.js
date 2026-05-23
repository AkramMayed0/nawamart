const Chat = require('../models/Chat');
const Store = require('../models/Store');
const { apiResponse, asyncHandler, getPaginationParams, paginateResponse } = require('../utils/helpers');

/**
 * Helper to check access
 */
const hasChatAccess = (chat, userId, role) => {
  const customerId = chat.customer._id ? chat.customer._id.toString() : chat.customer.toString();
  const merchantId = chat.merchant._id ? chat.merchant._id.toString() : chat.merchant.toString();

  if (role === 'customer') {
    return customerId === userId.toString();
  } else if (role === 'merchant') {
    return merchantId === userId.toString();
  }
  return false;
};

/**
 * GET /api/chats
 * Get all chats for the logged-in user (merchant or customer)
 */
const getMyChats = asyncHandler(async (req, res) => {
  const { limit, skip, page } = getPaginationParams(req);
  
  const query = {};
  if (req.userRole === 'customer') query.customer = req.user._id;
  if (req.userRole === 'merchant') query.merchant = req.user._id;

  const [chats, total] = await Promise.all([
    Chat.find(query)
      .populate('customer', 'name')
      .populate('merchant', 'name')
      .populate('store', 'name logo')
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(limit),
    Chat.countDocuments(query),
  ]);

  return res.status(200).json({
    success: true,
    message: 'تم جلب المحادثات بنجاح',
    data: chats,
    pagination: paginateResponse(total, page, limit),
  });
});

/**
 * POST /api/chats
 * Initialize a chat with a store (Customer only)
 */
const initChat = asyncHandler(async (req, res) => {
  const { storeId } = req.body;

  const store = await Store.findById(storeId);
  if (!store) {
    return res.status(404).json({ success: false, message: 'المتجر غير موجود', data: null });
  }

  // Check if chat already exists
  let chat = await Chat.findOne({
    customer: req.user._id,
    store: storeId,
  });

  if (!chat) {
    chat = await Chat.create({
      customer: req.user._id,
      merchant: store.merchant,
      store: storeId,
      messages: [],
    });
  }

  return apiResponse(res, {
    statusCode: 201,
    message: 'تم فتح المحادثة',
    data: chat,
  });
});

/**
 * GET /api/chats/:chatId
 * Get chat messages
 */
const getChat = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.chatId)
    .populate('customer', 'name')
    .populate('merchant', 'name')
    .populate('store', 'name logo');

  if (!chat || !hasChatAccess(chat, req.user._id, req.userRole)) {
    return res.status(404).json({ success: false, message: 'المحادثة غير موجودة أو لا تملك صلاحية الوصول', data: null });
  }

  return apiResponse(res, {
    message: 'تم جلب المحادثة',
    data: chat,
  });
});

/**
 * POST /api/chats/:chatId/message
 * Send a message
 */
const sendMessage = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.chatId);

  if (!chat || !hasChatAccess(chat, req.user._id, req.userRole)) {
    return res.status(404).json({ success: false, message: 'المحادثة غير موجودة أو لا تملك صلاحية الوصول', data: null });
  }

  const { content, image } = req.body;

  if ((!content || content.trim().length === 0) && !image) {
    return res.status(400).json({ success: false, message: 'يجب إرسال نص أو صورة', data: null });
  }

  const newMessage = {
    sender: req.userRole === 'customer' ? 'customer' : 'merchant',
    senderId: req.user._id,
    text: content || null,
    image: image || null,
    isRead: false,
  };

  chat.messages.push(newMessage);
  chat.lastMessageAt = new Date();
  
  await chat.save();

  const io = req.app.get('io');
  if (io) {
    io.to(chat._id.toString()).emit('receiveMessage', newMessage);
  }

  return apiResponse(res, {
    statusCode: 201,
    message: 'تم إرسال الرسالة',
    data: newMessage, // returning only the new message for efficiency
  });
});

module.exports = {
  getMyChats,
  initChat,
  getChat,
  sendMessage,
};
