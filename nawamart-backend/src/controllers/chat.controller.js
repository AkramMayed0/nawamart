const Chat = require('../models/Chat');
const Product = require('../models/Product');
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
      .populate('store', 'name logo type')
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
  const { storeId, orderId } = req.body;

  const store = await Store.findById(storeId);
  if (!store) {
    return res.status(404).json({ success: false, message: 'المتجر غير موجود', data: null });
  }

  // Check if chat already exists for this order/store
  const chatType = orderId ? 'delivery' : 'sales';
  const query = { customer: req.user._id, store: storeId, chatType };
  if (orderId) {
    query.order = orderId;
  }

  let chat = await Chat.findOne(query);

  if (!chat) {
    chat = await Chat.create({
      chatType,
      customer: req.user._id,
      merchant: store.merchant,
      store: storeId,
      order: orderId || null,
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
    .populate('store', 'name logo plan')
    .populate('order');

  if (!chat || !hasChatAccess(chat, req.user._id, req.userRole)) {
    return res.status(404).json({ success: false, message: 'المحادثة غير موجودة أو لا تملك صلاحية الوصول', data: null });
  }

  // Reset unread count for the active viewer
  if (req.userRole === 'customer') {
    chat.customerUnread = 0;
  } else {
    chat.merchantUnread = 0;
  }
  await chat.save();

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

  const type = req.body.type || 'text';
  const content = req.body.content || req.body.text || '';

  if (!content && type === 'text') {
    return res.status(400).json({ success: false, message: 'محتوى الرسالة مطلوب', data: null });
  }

  const newMessage = {
    sender: req.user._id,
    senderRole: req.userRole,
    senderType: req.userRole,
    type,
    content,
    isRead: false,
    delivered: false,
    createdAt: new Date(),
  };

  if (req.body.replyTo) {
    newMessage.replyTo = req.body.replyTo;
    newMessage.replyContent = req.body.replyContent || null;
    newMessage.replyType = req.body.replyType || null;
  }

  chat.messages.push(newMessage);
  chat.lastMessage = type === 'text' ? content : `[مرفق]`;
  chat.lastMessageAt = new Date();

  if (req.userRole === 'customer') {
    chat.merchantUnread += 1;
  } else {
    chat.customerUnread += 1;
  }

  await chat.save();

  // Socket broadcast to room
  const io = req.app.get('io');
  if (io) {
    io.to(chat._id.toString()).emit('receiveMessage', newMessage);
  }

  return apiResponse(res, {
    statusCode: 201,
    message: 'تم إرسال الرسالة',
    data: newMessage,
  });
});

/**
 * POST /api/chats/:chatId/attachment
 * Upload an attachment to a chat (Merchant or Customer)
 */
const uploadAttachment = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.chatId);

  if (!chat || !hasChatAccess(chat, req.user._id, req.userRole)) {
    return res.status(404).json({ success: false, message: 'المحادثة غير موجودة أو لا تملك صلاحية الوصول', data: null });
  }

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'لم يتم إرفاق أي ملف', data: null });
  }

  const isImage = req.file.mimetype.startsWith('image/');
  const type = isImage ? 'image' : 'file';

  const newMessage = {
    sender: req.user._id,
    senderRole: req.userRole,
    senderType: req.userRole,
    type,
    content: req.file.path, // Cloudinary URL
    fileName: req.file.originalname || 'ملف مرفق',
    isRead: false,
    createdAt: new Date(),
  };

  chat.messages.push(newMessage);
  chat.lastMessage = isImage ? '[صورة]' : `[ملف: ${newMessage.fileName}]`;
  chat.lastMessageAt = new Date();

  if (req.userRole === 'customer') {
    chat.merchantUnread += 1;
  } else {
    chat.customerUnread += 1;
  }

  await chat.save();

  // Socket broadcast to room
  const io = req.app.get('io');
  if (io) {
    io.to(chat._id.toString()).emit('receiveMessage', newMessage);
  }

  return apiResponse(res, {
    statusCode: 201,
    message: 'تم رفع وإرسال الملف بنجاح',
    data: newMessage,
  });
});

/**
 * POST /api/chats/:chatId/confirm-receipt
 * Confirm order receipt inside chat (Customer only)
 */
const confirmReceipt = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.chatId);

  if (!chat || !hasChatAccess(chat, req.user._id, req.userRole)) {
    return res.status(404).json({ success: false, message: 'المحادثة غير موجودة أو لا تملك صلاحية الوصول', data: null });
  }

  if (req.userRole !== 'customer') {
    return res.status(403).json({ success: false, message: 'تأكيد الاستلام مسموح للمشتري فقط', data: null });
  }

  chat.receiptConfirmed = true;
  await chat.save();

  // If there's an associated digital order, update its status to 'delivered'!
  if (chat.order) {
    const Order = require('../models/Order');
    await Order.findByIdAndUpdate(chat.order, { status: 'delivered' });
  }

  // Socket broadcast to room
  const io = req.app.get('io');
  if (io) {
    io.to(chat._id.toString()).emit('receiptConfirmed');
  }

  return apiResponse(res, {
    message: 'تم تأكيد استلام الطلب بنجاح',
    data: chat,
  });
});

/**
 * POST /api/chats/init-delivery
 * Merchant initiates a delivery chat for a confirmed order
 */
const initDeliveryChat = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ success: false, message: 'معرّف الطلب مطلوب', data: null });
  }

  const Order = require('../models/Order');
  const Store = require('../models/Store');
  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({ success: false, message: 'الطلب غير موجود', data: null });
  }

  if (order.merchant.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'لا تملك صلاحية الوصول لهذا الطلب', data: null });
  }

  // Only business plan stores can use delivery chat
  const store = await Store.findById(order.store).select('plan');
  if (!store || store.plan !== 'business') {
    return res.status(403).json({
      success: false,
      message: 'محادثة التسليم متاحة فقط لباقة الأعمال. قم بترقية باقتك للمتابعة.',
      data: null,
    });
  }

  if (!['confirmed', 'shipped'].includes(order.status)) {
    return res.status(400).json({
      success: false,
      message: 'يمكن بدء محادثة التسليم للطلبات المؤكدة أو المشحونة فقط',
      data: null,
    });
  }

  let chat = await Chat.findOne({ order: order._id });

  if (!chat) {
    chat = await Chat.create({
      store:    order.store,
      merchant: order.merchant,
      customer: order.customer,
      order:    order._id,
      messages: [],
    });
  }

  order.chatId = chat._id;
  await order.save();

  return apiResponse(res, {
    statusCode: 201,
    message: 'تم فتح محادثة التسليم',
    data: chat,
  });
});

/**
 * POST /api/chats/:chatId/read
 * Mark all unread messages as read for the current user
 */
const markAsRead = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.chatId);

  if (!chat || !hasChatAccess(chat, req.user._id, req.userRole)) {
    return res.status(404).json({ success: false, message: 'المحادثة غير موجودة', data: null });
  }

  let updated = 0;
  const now = new Date();
  for (const msg of chat.messages) {
    if (!msg.isRead && msg.sender.toString() !== req.user._id.toString()) {
      msg.isRead = true;
      msg.readAt = now;
      msg.delivered = true;
      updated++;
    }
  }

  if (req.userRole === 'customer') {
    chat.customerUnread = 0;
  } else {
    chat.merchantUnread = 0;
  }

  await chat.save();

  const io = req.app.get('io');
  if (io && updated > 0) {
    io.to(chat._id.toString()).emit('messagesRead', { userId: req.user._id, at: now });
  }

  return apiResponse(res, {
    message: updated > 0 ? 'تم تحديث حالة القراءة' : 'جميع الرسائل مقروءة بالفعل',
    data: { updated },
  });
});

/**
 * POST /api/chats/:chatId/retry/:messageId
 * Retry sending a specific message (for reliability)
 */
const retryMessage = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.chatId);
  if (!chat || !hasChatAccess(chat, req.user._id, req.userRole)) {
    return res.status(404).json({ success: false, message: 'المحادثة غير موجودة', data: null });
  }

  const msg = chat.messages.id(req.params.messageId);
  if (!msg) {
    return res.status(404).json({ success: false, message: 'الرسالة غير موجودة', data: null });
  }

  msg.delivered = false;
  msg.isRead = false;
  msg.readAt = null;
  await chat.save();

  const io = req.app.get('io');
  if (io) {
    io.to(chat._id.toString()).emit('retryMessage', msg);
  }

  return apiResponse(res, {
    message: 'تم إعادة إرسال الرسالة',
    data: msg,
  });
});

/**
 * POST /api/chats/:chatId/product-card
 * Merchant sends a product card message inside a chat
 */
const sendProductCard = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.chatId);
  if (!chat || !hasChatAccess(chat, req.user._id, req.userRole)) {
    return res.status(404).json({ success: false, message: 'المحادثة غير موجودة أو لا تملك صلاحية الوصول', data: null });
  }

  if (req.userRole !== 'merchant') {
    return res.status(403).json({ success: false, message: 'إرسال بطاقات المنتجات مسموح للتاجر فقط', data: null });
  }

  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ success: false, message: 'productId مطلوب', data: null });
  }

  const product = await Product.findById(productId).select('name price salePrice images digitalDelivery isActive store');
  if (!product || !product.isActive) {
    return res.status(404).json({ success: false, message: 'المنتج غير موجود', data: null });
  }

  // Fetch store slug for the product page link
  const store = await Store.findById(product.store).select('slug');

  const snapshot = {
    productId: product._id,
    name:      product.name,
    price:     product.price,
    salePrice: product.salePrice || null,
    image:     product.images?.[0] || null,
    isDigital: product.digitalDelivery?.enabled === true,
    storeSlug: store?.slug || null,
    currency:  'YER',
  };

  const newMessage = {
    sender:      req.user._id,
    senderRole:  req.userRole,
    senderType:  req.userRole,
    type:        'product_card',
    content:     product.name,        // fallback text for notifications
    productCard: snapshot,
    isRead:      false,
    delivered:   false,
    createdAt:   new Date(),
  };

  chat.messages.push(newMessage);
  chat.lastMessage  = `[بطاقة منتج: ${product.name}]`;
  chat.lastMessageAt = new Date();
  chat.customerUnread += 1;

  await chat.save();

  const io = req.app.get('io');
  if (io) {
    io.to(chat._id.toString()).emit('receiveMessage', newMessage);
  }

  return apiResponse(res, {
    statusCode: 201,
    message:    'تم إرسال بطاقة المنتج',
    data:       newMessage,
  });
});

module.exports = {
  getMyChats,
  initChat,
  initDeliveryChat,
  getChat,
  sendMessage,
  uploadAttachment,
  confirmReceipt,
  markAsRead,
  retryMessage,
  sendProductCard,
};

