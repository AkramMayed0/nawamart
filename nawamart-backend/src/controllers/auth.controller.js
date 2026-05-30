const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const Merchant = require('../models/Merchant');
const Customer = require('../models/Customer');
const Store = require('../models/Store');

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
  const safeUser = user.toSafeJSON ? user.toSafeJSON() : user;

  return res.status(statusCode).json({
    success: true,
    message,
    data: {
      token,
      user: { ...safeUser, role },
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
      if (merchant.suspendedUntil && new Date(merchant.suspendedUntil) <= new Date()) {
        merchant.isActive = true;
        merchant.suspendedUntil = null;
        await merchant.save();
      } else {
        const remaining = merchant.suspendedUntil
          ? ` حتى ${new Date(merchant.suspendedUntil).toLocaleDateString('ar-YE')}`
          : ' — يرجى التواصل مع الدعم';
        return res.status(403).json({
          success: false,
          data: null,
          message: `تم تعليق حسابك${remaining}`,
        });
      }
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
      if (customer.suspendedUntil && new Date(customer.suspendedUntil) <= new Date()) {
        customer.isActive = true;
        customer.suspendedUntil = null;
        await customer.save();
      } else {
        const remaining = customer.suspendedUntil
          ? ` حتى ${new Date(customer.suspendedUntil).toLocaleDateString('ar-YE')}`
          : ' — يرجى التواصل مع الدعم';
        return res.status(403).json({
          success: false,
          data: null,
          message: `تم تعليق حسابك${remaining}`,
        });
      }
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

/**
 * GET /api/auth/me
 * Validate the current merchant/customer token and return fresh session data.
 */
const getMe = async (req, res, next) => {
  try {
    let stores = [];

    if (req.userRole === 'merchant') {
      stores = await Store.find({ merchant: req.user._id }).sort({ createdAt: -1 });
    }

    return res.status(200).json({
      success: true,
      message: 'تم جلب بيانات الجلسة بنجاح',
      data: {
        user: {
          ...(req.user.toSafeJSON ? req.user.toSafeJSON() : req.user),
          role: req.userRole,
        },
        role: req.userRole,
        stores,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/auth/me
 * Update the authenticated user's profile (name, phone, profileImage, password)
 */
const updateMe = async (req, res, next) => {
  try {
    const { name, phone, currentPassword, newPassword } = req.body;
    const user = req.user;
    const Model = req.userRole === 'merchant' ? Merchant : Customer;

    // If changing password, verify current password first
    if (currentPassword || newPassword) {
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'كلمة المرور الحالية والجديدة مطلوبتان لتغيير كلمة المرور',
        });
      }

      const userWithPassword = await Model.findById(user._id).select('+password');
      const isMatch = await userWithPassword.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'كلمة المرور الحالية غير صحيحة',
        });
      }

      user.password = newPassword;
    }

    if (name !== undefined) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();

    // Handle profile image upload
    if (req.file) {
      user.profileImage = req.file.path;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'تم تحديث الملف الشخصي بنجاح',
      data: {
        user: {
          ...(user.toSafeJSON ? user.toSafeJSON() : user.toObject()),
          role: req.userRole,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify a Google credential (ID token or access token) and return user payload
 */
async function verifyGoogleCredential(credential) {
  // Try ID token verification first
  try {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload();
  } catch (idTokenErr) {
    // Fallback: treat as access token
    try {
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      const tokenInfo = await client.getTokenInfo(credential);
      return {
        sub: tokenInfo.sub,
        email: tokenInfo.email,
        name: tokenInfo.email ? tokenInfo.email.split('@')[0] : 'مستخدم Google',
        picture: null,
      };
    } catch (accessTokenErr) {
      throw new Error('رمز Google غير صالح');
    }
  }
}

/**
 * POST /api/auth/customer/google
 * Login/register with Google OAuth ID token
 */
const customerGoogleLogin = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'رمز Google مطلوب',
      });
    }

    let payload;
    try {
      payload = await verifyGoogleCredential(credential);
    } catch (err) {
      return res.status(401).json({
        success: false,
        data: null,
        message: err.message || 'رمز Google غير صالح',
      });
    }

    const { sub: googleId, email, name, picture } = payload;

    // Find existing customer by googleId or email
    let customer = await Customer.findOne({
      $or: [{ googleId }, { email: email.toLowerCase().trim() }],
    });

    if (customer) {
      // Link googleId if not already linked
      if (!customer.googleId) {
        customer.googleId = googleId;
        customer.authProvider = 'google';
        if (!customer.profileImage && picture) {
          customer.profileImage = picture;
        }
        await customer.save();
      }
    } else {
      // Create new customer
      customer = await Customer.create({
        name: name || 'مستخدم Google',
        email: email.toLowerCase().trim(),
        phone: '0000000000', // placeholder — customer can update later
        password: crypto.randomBytes(16).toString('hex'),
        googleId,
        authProvider: 'google',
        profileImage: picture || null,
      });
    }

    return sendAuthResponse(res, 200, customer, 'customer', 'تم تسجيل الدخول بحساب Google بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/merchant/google
 * Login/register with Google OAuth ID token for merchants
 */
const merchantGoogleLogin = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'رمز Google مطلوب',
      });
    }

    let payload;
    try {
      payload = await verifyGoogleCredential(credential);
    } catch (err) {
      return res.status(401).json({
        success: false,
        data: null,
        message: err.message || 'رمز Google غير صالح',
      });
    }

    const { sub: googleId, email, name, picture } = payload;

    // Find existing merchant by googleId or email
    let merchant = await Merchant.findOne({
      $or: [{ googleId }, { email: email.toLowerCase().trim() }],
    });

    if (merchant) {
      // Link googleId if not already linked
      if (!merchant.googleId) {
        merchant.googleId = googleId;
        merchant.authProvider = 'google';
        if (!merchant.profileImage && picture) {
          merchant.profileImage = picture;
        }
        await merchant.save();
      }
    } else {
      // Create new merchant
      merchant = await Merchant.create({
        name: name || 'تاجر Google',
        email: email.toLowerCase().trim(),
        phone: '0000000000',
        password: crypto.randomBytes(16).toString('hex'),
        googleId,
        authProvider: 'google',
        profileImage: picture || null,
      });
    }

    return sendAuthResponse(res, 200, merchant, 'merchant', 'تم تسجيل الدخول بحساب Google بنجاح');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  merchantRegister,
  merchantLogin,
  merchantGoogleLogin,
  customerRegister,
  customerLogin,
  customerGoogleLogin,
  getMe,
  updateMe,
};
