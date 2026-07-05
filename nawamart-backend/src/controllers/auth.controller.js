const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const Merchant = require('../models/Merchant');
const Customer = require('../models/Customer');
const Store = require('../models/Store');
const Session = require('../models/Session');
const StoreStaff = require('../models/StoreStaff');
const { sendPasswordResetEmail } = require('../services/email');
const { validatePasswordStrength } = require('../utils/password');
const { signAccessToken, signRefreshToken, signMfaToken } = require('../utils/tokens');
const { ROLES } = require('../utils/permissions');
const { authenticator } = require('otplib');

const MAX_CONCURRENT_SESSIONS = 5;

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function createSession(user, req) {
  const activeSessions = await Session.countDocuments({
    user: user._id,
    isRevoked: false,
    expiresAt: { $gt: new Date() },
  });
  if (activeSessions >= MAX_CONCURRENT_SESSIONS) {
    const oldest = await Session.findOne({
      user: user._id,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    }).sort({ lastActivity: 1 });
    if (oldest) {
      oldest.isRevoked = true;
      await oldest.save();
    }
  }
  const refreshToken = signRefreshToken();
  const session = await Session.create({
    user: user._id,
    refreshToken,
    deviceInfo: req.headers['user-agent'] || null,
    ip: req.ip || req.connection?.remoteAddress || null,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  return { session, refreshToken };
}

function sendAuthResponse(res, statusCode, user, role, message, options = {}) {
  const { refreshToken, session } = options;
  const storeId = user.store || null;
  const accessToken = signAccessToken({ id: user._id, role, storeId, storeRole: user.storeRole || null });
  const safeUser = user.toSafeJSON ? user.toSafeJSON() : user;
  return res.status(statusCode).json({
    success: true,
    message,
    data: {
      token: accessToken,
      refreshToken,
      sessionId: session?._id,
      user: { ...safeUser, role, store: storeId },
      role,
      storeRole: user.storeRole || null,
      requiresMfa: false,
    },
  });
}

// ─── Merchant Auth ────────────────────────────────────────────────────────────

const merchantRegister = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'جميع الحقول مطلوبة: الاسم، البريد الإلكتروني، الهاتف، كلمة المرور',
      });
    }
    const pwErrors = validatePasswordStrength(password);
    if (pwErrors.length > 0) {
      return res.status(400).json({
        success: false,
        data: null,
        message: pwErrors[0],
        errors: pwErrors,
      });
    }
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
    const merchant = await Merchant.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password,
    });
    const { session, refreshToken } = await createSession(merchant, req);
    return sendAuthResponse(res, 201, merchant, 'merchant', 'تم تسجيل حساب التاجر بنجاح', { refreshToken, session });
  } catch (error) {
    next(error);
  }
};

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
    const merchant = await Merchant.findOne({
      email: email.toLowerCase().trim(),
    }).select('+password +mfaSecret +mfaEnabled');
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
    if (merchant.mfaEnabled) {
      const mfaToken = signMfaToken(merchant._id);
      return res.status(200).json({
        success: true,
        message: 'يرجى إكمال المصادقة الثنائية',
        data: {
          requiresMfa: true,
          mfaToken,
          userId: merchant._id,
        },
      });
    }
    const { session, refreshToken } = await createSession(merchant, req);
    return sendAuthResponse(res, 200, merchant, 'merchant', 'تم تسجيل الدخول بنجاح', { refreshToken, session });
  } catch (error) {
    next(error);
  }
};

const merchantMfaVerify = async (req, res, next) => {
  try {
    const { mfaToken, code } = req.body;
    if (!mfaToken || !code) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'رمز MFA ورمز المصادقة مطلوبان',
      });
    }
    let decoded;
    try {
      decoded = jwt.verify(mfaToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'انتهت صلاحية جلسة MFA — يرجى تسجيل الدخول مجدداً',
      });
    }
    if (decoded.purpose !== 'mfa') {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'رمز MFA غير صالح',
      });
    }
    const merchant = await Merchant.findById(decoded.id).select('+mfaSecret +mfaEnabled +mfaBackupCodes');
    if (!merchant || !merchant.mfaEnabled) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'MFA غير مفعل لهذا الحساب',
      });
    }
    let isValid = false;
    try {
      authenticator.options = { window: 1 };
      isValid = authenticator.check(code, merchant.mfaSecret);
    } catch (e) { }
    if (!isValid) {
      const backupIdx = merchant.mfaBackupCodes.findIndex(
        (bc) => bc.code === code && !bc.used
      );
      if (backupIdx !== -1) {
        merchant.mfaBackupCodes[backupIdx].used = true;
        await merchant.save();
        isValid = true;
      }
    }
    if (!isValid) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'رمز MFA غير صحيح',
      });
    }
    const { session, refreshToken } = await createSession(merchant, req);
    return sendAuthResponse(res, 200, merchant, 'merchant', 'تم تسجيل الدخول بنجاح', { refreshToken, session });
  } catch (error) {
    next(error);
  }
};

// ─── Customer Auth ────────────────────────────────────────────────────────────

const customerRegister = async (req, res, next) => {
  try {
    const { name, email, phone, password, storeId } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'جميع الحقول مطلوبة: الاسم، البريد الإلكتروني، الهاتف، كلمة المرور',
      });
    }
    if (!storeId) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'معرّف المتجر مطلوب للتسجيل',
      });
    }
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'المتجر غير موجود',
      });
    }
    const existingCustomer = await Customer.findOne({
      email: email.toLowerCase().trim(),
      store: storeId,
    });
    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        data: null,
        message: 'هذا البريد مسجل بالفعل في هذا المتجر — يرجى تسجيل الدخول',
      });
    }
    const customer = await Customer.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password,
      store: storeId,
    });
    const token = signAccessToken({ id: customer._id, role: 'customer', storeId });
    const safeUser = customer.toSafeJSON ? customer.toSafeJSON() : customer;
    return res.status(201).json({
      success: true,
      message: 'تم تسجيل حسابك بنجاح',
      data: {
        token,
        user: { ...safeUser, role: 'customer', store: storeId },
        role: 'customer',
      },
    });
  } catch (error) {
    next(error);
  }
};

const customerLogin = async (req, res, next) => {
  try {
    const { email, password, storeId } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'البريد الإلكتروني وكلمة المرور مطلوبان',
      });
    }
    const query = { email: email.toLowerCase().trim() };
    if (storeId) {
      query.store = storeId;
    }
    const customer = await Customer.findOne(query).select('+password');
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
    const token = signAccessToken({ id: customer._id, role: 'customer', storeId: customer.store });
    const safeUser = customer.toSafeJSON ? customer.toSafeJSON() : customer;
    return res.status(200).json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      data: {
        token,
        user: { ...safeUser, role: 'customer', store: customer.store },
        role: 'customer',
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Google Auth ──────────────────────────────────────────────────────────────

async function verifyGoogleCredential(credential) {
  try {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload();
  } catch (idTokenErr) {
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

const customerGoogleLogin = async (req, res, next) => {
  try {
    const { credential, storeId: rawStoreId } = req.body;
    const storeId = rawStoreId || null;
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
    const normalizedEmail = email.toLowerCase().trim();
    let customer = storeId
      ? await Customer.findOne({ email: normalizedEmail, store: storeId })
      : null;
    if (!customer) {
      customer = await Customer.findOne({ googleId });
    }
    if (customer) {
      if (!customer.googleId) {
        customer.googleId = googleId;
        customer.authProvider = 'google';
        if (!customer.profileImage && picture) {
          customer.profileImage = picture;
        }
        await customer.save();
      }
    } else {
      customer = await Customer.create({
        name: name || 'مستخدم Google',
        email: normalizedEmail,
        phone: '0000000000',
        password: crypto.randomBytes(16).toString('hex'),
        googleId,
        authProvider: 'google',
        profileImage: picture || null,
        store: storeId,
      });
    }
    const token = signAccessToken({ id: customer._id, role: 'customer', storeId: customer.store });
    const safeUser = customer.toSafeJSON ? customer.toSafeJSON() : customer;
    return res.status(200).json({
      success: true,
      message: 'تم تسجيل الدخول بحساب Google بنجاح',
      data: {
        token,
        user: { ...safeUser, role: 'customer', store: customer.store },
        role: 'customer',
      },
    });
  } catch (error) {
    next(error);
  }
};

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
    let merchant = await Merchant.findOne({
      $or: [{ googleId }, { email: email.toLowerCase().trim() }],
    });
    if (merchant) {
      if (!merchant.googleId) {
        merchant.googleId = googleId;
        merchant.authProvider = 'google';
        if (!merchant.profileImage && picture) {
          merchant.profileImage = picture;
        }
        await merchant.save();
      }
    } else {
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
    const { session, refreshToken } = await createSession(merchant, req);
    return sendAuthResponse(res, 200, merchant, 'merchant', 'تم تسجيل الدخول بحساب Google بنجاح', { refreshToken, session });
  } catch (error) {
    next(error);
  }
};

// ─── Session / Token Refresh ──────────────────────────────────────────────────

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'رمز التحديث مطلوب',
      });
    }
    const session = await Session.findOne({
      refreshToken: token,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    });
    if (!session) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'رمز التحديث غير صالح أو منتهي الصلاحية',
      });
    }
    const merchant = await Merchant.findById(session.user);
    if (!merchant || !merchant.isActive) {
      session.isRevoked = true;
      await session.save();
      return res.status(401).json({
        success: false,
        data: null,
        message: 'الحساب غير نشط',
      });
    }
    session.isRevoked = true;
    await session.save();
    const { session: newSession, refreshToken: newRefreshToken } = await createSession(merchant, req);
    const accessToken = signAccessToken({
      id: merchant._id,
      role: 'merchant',
      storeRole: merchant.storeRole || null,
    });
    const safeUser = merchant.toSafeJSON ? merchant.toSafeJSON() : merchant;
    return res.status(200).json({
      success: true,
      message: 'تم تحديث الجلسة بنجاح',
      data: {
        token: accessToken,
        refreshToken: newRefreshToken,
        sessionId: newSession._id,
        user: { ...safeUser, role: 'merchant' },
      },
    });
  } catch (error) {
    next(error);
  }
};

const listSessions = async (req, res, next) => {
  try {
    const sessions = await Session.find({
      user: req.user._id,
      isRevoked: false,
    }).sort({ lastActivity: -1 }).limit(10);
    return res.status(200).json({
      success: true,
      message: 'تم جلب الجلسات بنجاح',
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
};

const revokeSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findOne({ _id: sessionId, user: req.user._id });
    if (!session) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'الجلسة غير موجودة',
      });
    }
    session.isRevoked = true;
    await session.save();
    return res.status(200).json({
      success: true,
      message: 'تم إنهاء الجلسة بنجاح',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Profile ──────────────────────────────────────────────────────────────────

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
          storeRole: req.user.storeRole || null,
          mfaEnabled: req.user.mfaEnabled || false,
        },
        role: req.userRole,
        stores,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const { name, phone, currentPassword, newPassword } = req.body;
    const user = req.user;
    const Model = req.userRole === 'merchant' ? Merchant : Customer;
    if (currentPassword || newPassword) {
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'كلمة المرور الحالية والجديدة مطلوبتان لتغيير كلمة المرور',
        });
      }
      const pwErrors = validatePasswordStrength(newPassword);
      if (pwErrors.length > 0) {
        return res.status(400).json({
          success: false,
          data: null,
          message: pwErrors[0],
          errors: pwErrors,
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
          mfaEnabled: user.mfaEnabled || false,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Password Reset ──────────────────────────────────────────────────────────

function getClientOrigin(req) {
  return (
    process.env.CLIENT_URL?.split(',')[0]?.trim() ||
    req.headers.referer?.replace(/\/+$/, '') ||
    req.headers.origin ||
    'http://localhost:5173'
  );
}

const forgotPassword = (Model, role) => {
  return async (req, res, next) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'البريد الإلكتروني مطلوب',
        });
      }
      const user = await Model.findOne({ email: email.toLowerCase().trim() });
      if (!user) {
        return res.status(200).json({
          success: true,
          data: null,
          message: 'إذا كان البريد الإلكتروني مسجلاً، ستتلقى رابط إعادة تعيين كلمة المرور',
        });
      }
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = Date.now() + 3600000;
      await user.save({ validateBeforeSave: false });
      const clientOrigin = getClientOrigin(req);
      const resetLink = `${clientOrigin}/${role}/reset-password/${resetToken}`;
      try {
        const result = await sendPasswordResetEmail({
          to: user.email,
          name: user.name,
          resetLink,
        });
        return res.status(200).json({
          success: true,
          data: result?.sent ? null : { resetLink },
          message: 'إذا كان البريد الإلكتروني مسجلاً، ستتلقى رابط إعادة تعيين كلمة المرور',
        });
      } catch (emailError) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return res.status(500).json({
          success: false,
          data: null,
          message: 'فشل إرسال البريد الإلكتروني — يرجى المحاولة لاحقاً',
        });
      }
    } catch (error) {
      next(error);
    }
  };
};

const resetPassword = (Model) => {
  return async (req, res, next) => {
    try {
      const { token } = req.params;
      const { password } = req.body;
      if (!password) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'كلمة المرور الجديدة مطلوبة',
        });
      }
      const pwErrors = validatePasswordStrength(password);
      if (pwErrors.length > 0) {
        return res.status(400).json({
          success: false,
          data: null,
          message: pwErrors[0],
          errors: pwErrors,
        });
      }
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      const user = await Model.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() },
      }).select('+password');
      if (!user) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'الرابط غير صالح أو منتهي الصلاحية',
        });
      }
      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return res.status(200).json({
        success: true,
        data: null,
        message: 'تم إعادة تعيين كلمة المرور بنجاح — يمكنك تسجيل الدخول الآن',
      });
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  merchantRegister,
  merchantLogin,
  merchantMfaVerify,
  merchantGoogleLogin,
  customerRegister,
  customerLogin,
  customerGoogleLogin,
  getMe,
  updateMe,
  forgotPassword,
  resetPassword,
  refreshToken,
  listSessions,
  revokeSession,
};
