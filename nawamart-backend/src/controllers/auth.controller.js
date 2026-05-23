const jwt = require('jsonwebtoken');
const Merchant = require('../models/Merchant');
const Customer = require('../models/Customer');

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Sign a JWT with role embedded in payload
 */
const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Standard auth response shape
 */
const sendAuthResponse = (res, statusCode, user, role, message) => {
  const token = signToken(user._id, role);
  return res.status(statusCode).json({
    success: true,
    message,
    data: {
      token,
      user: user.toSafeJSON ? user.toSafeJSON() : user,
      role,
    },
  });
};

// ─── Merchant Auth ────────────────────────────────────────────────────────────

/**
 * POST /api/auth/merchant/register
 */
const merchantRegister = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'جميع الحقول مطلوبة: الاسم، البريد الإلكتروني، الهاتف، كلمة المرور',
      });
    }

    // Check duplicate email
    const existingMerchant = await Merchant.findOne({
      email: email.toLowerCase().trim(),
    });
    if (existingMerchant) {
      return res.status(409).json({
        success: false,
        data: null,
        message: 'البريد الإلكتروني مستخدم بالفعل — يرجى استخدام بريد آخر أو تسجيل الدخول',
      });
    }

    // Create merchant (password hashing handled in pre-save hook)
    const merchant = await Merchant.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password,
    });

    return sendAuthResponse(res, 201, merchant, 'merchant', 'تم تسجيل حساب التاجر بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/merchant/login
 */
const merchantLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'البريد الإلكتروني وكلمة المرور مطلوبان',
      });
    }

    // Explicitly select password (it's select: false on schema)
    const merchant = await Merchant.findOne({
      email: email.toLowerCase().trim(),
    }).select('+password');

    if (!merchant) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
      });
    }

    if (!merchant.isActive) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'تم تعليق حسابك — يرجى التواصل مع الدعم',
      });
    }

    const isMatch = await merchant.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
      });
    }

    return sendAuthResponse(res, 200, merchant, 'merchant', 'تم تسجيل الدخول بنجاح');
  } catch (error) {
    next(error);
  }
};

// ─── Customer Auth ────────────────────────────────────────────────────────────

/**
 * POST /api/auth/customer/register
 */
const customerRegister = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'جميع الحقول مطلوبة: الاسم، البريد الإلكتروني، الهاتف، كلمة المرور',
      });
    }

    const existingCustomer = await Customer.findOne({
      email: email.toLowerCase().trim(),
    });
    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        data: null,
        message: 'البريد الإلكتروني مستخدم بالفعل — يرجى استخدام بريد آخر أو تسجيل الدخول',
      });
    }

    const customer = await Customer.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password,
    });

    return sendAuthResponse(res, 201, customer, 'customer', 'تم تسجيل حسابك بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/customer/login
 */
const customerLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'البريد الإلكتروني وكلمة المرور مطلوبان',
      });
    }

    const customer = await Customer.findOne({
      email: email.toLowerCase().trim(),
    }).select('+password');

    if (!customer) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
      });
    }

    if (!customer.isActive) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'تم تعليق حسابك — يرجى التواصل مع الدعم',
      });
    }

    const isMatch = await customer.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
      });
    }

    return sendAuthResponse(res, 200, customer, 'customer', 'تم تسجيل الدخول بنجاح');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  merchantRegister,
  merchantLogin,
  customerRegister,
  customerLogin,
};
