const { authenticator } = require('otplib');
const QRCode = require('qrcode');
const crypto = require('crypto');
const Merchant = require('../models/Merchant');

async function generateMfaSecret(req, res, next) {
  try {
    const merchant = await Merchant.findById(req.user._id);
    if (!merchant) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'التاجر غير موجود',
      });
    }
    if (merchant.mfaEnabled) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'مصادقة MFA مفعلة بالفعل — قم بتعطيلها أولاً لإنشاء سر جديد',
      });
    }
    const secret = authenticator.generateSecret();
    const serviceName = 'NawaMart';
    const otpauth = authenticator.keyuri(merchant.email, serviceName, secret);
    const qrCode = await QRCode.toDataURL(otpauth);
    const backupCodes = Array.from({ length: 8 }, () => ({
      code: crypto.randomBytes(4).toString('hex').toUpperCase(),
      used: false,
    }));
    merchant.mfaSecret = secret;
    merchant.mfaBackupCodes = backupCodes;
    await merchant.save();
    return res.status(200).json({
      success: true,
      message: 'تم إنشاء سر MFA بنجاح',
      data: {
        secret,
        qrCode,
        backupCodes: backupCodes.map((bc) => bc.code),
      },
    });
  } catch (error) {
    next(error);
  }
}

async function verifyAndEnableMfa(req, res, next) {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'رمز التحقق مطلوب',
      });
    }
    const merchant = await Merchant.findById(req.user._id).select('+mfaSecret');
    if (!merchant) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'التاجر غير موجود',
      });
    }
    if (merchant.mfaEnabled) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'MFA مفعلة بالفعل',
      });
    }
    if (!merchant.mfaSecret) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'يرجى إنشاء سر MFA أولاً',
      });
    }
    let isValid = false;
    try {
      authenticator.options = { window: 1 };
      isValid = authenticator.check(code, merchant.mfaSecret);
    } catch (e) { }
    if (!isValid) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'رمز التحقق غير صحيح — يرجى المحاولة مجدداً',
      });
    }
    merchant.mfaEnabled = true;
    await merchant.save();
    return res.status(200).json({
      success: true,
      message: 'تم تفعيل المصادقة الثنائية (MFA) بنجاح',
      data: {
        mfaEnabled: true,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function disableMfa(req, res, next) {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'رمز التحقق مطلوب لتعطيل MFA',
      });
    }
    const merchant = await Merchant.findById(req.user._id).select('+mfaSecret +mfaEnabled +mfaBackupCodes');
    if (!merchant || !merchant.mfaEnabled) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'MFA غير مفعلة',
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
        isValid = true;
      }
    }
    if (!isValid) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'رمز التحقق غير صحيح',
      });
    }
    merchant.mfaSecret = undefined;
    merchant.mfaEnabled = false;
    merchant.mfaBackupCodes = [];
    await merchant.save();
    return res.status(200).json({
      success: true,
      message: 'تم تعطيل المصادقة الثنائية (MFA) بنجاح',
      data: null,
    });
  } catch (error) {
    next(error);
  }
}

async function getMfaStatus(req, res, next) {
  try {
    const merchant = await Merchant.findById(req.user._id);
    return res.status(200).json({
      success: true,
      message: 'تم جلب حالة MFA',
      data: {
        mfaEnabled: merchant?.mfaEnabled || false,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function regenerateBackupCodes(req, res, next) {
  try {
    const merchant = await Merchant.findById(req.user._id);
    if (!merchant || !merchant.mfaEnabled) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'MFA غير مفعلة',
      });
    }
    const backupCodes = Array.from({ length: 8 }, () => ({
      code: crypto.randomBytes(4).toString('hex').toUpperCase(),
      used: false,
    }));
    merchant.mfaBackupCodes = backupCodes;
    await merchant.save();
    return res.status(200).json({
      success: true,
      message: 'تم إنشاء رموز احتياطية جديدة',
      data: {
        backupCodes: backupCodes.map((bc) => bc.code),
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  generateMfaSecret,
  verifyAndEnableMfa,
  disableMfa,
  getMfaStatus,
  regenerateBackupCodes,
};
