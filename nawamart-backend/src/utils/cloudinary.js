const cloudinary = require('cloudinary').v2; // cloudinary v1 exposes .v2 API
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// ─── Configure Cloudinary ─────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Storage for product images ───────────────────────────────────────────────
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'nawamart/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }],
  },
});

// ─── Storage for payment wasl (receipt) screenshots ──────────────────────────
const waslStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'nawamart/wasl',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
    transformation: [{ quality: 'auto' }],
  },
});

// ─── Storage for store logos / banners ───────────────────────────────────────
const storeStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'nawamart/stores',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
  },
});

// ─── Storage for chat files ────────────────────────────────────────────────────
const chatStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'nawamart/chat',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
    transformation: [{ quality: 'auto' }],
  },
});

// ─── File size / type filter ──────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('نوع الملف غير مدعوم — يُسمح فقط بـ JPG، PNG، WEBP، PDF'), false);
  }
};

// ─── Multer instances ─────────────────────────────────────────────────────────
const uploadProduct = multer({
  storage: productStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter,
});

const uploadWasl = multer({
  storage: waslStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter,
});

const uploadStore = multer({
  storage: storeStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

const uploadChatFile = multer({
  storage: chatStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter,
});

/**
 * Delete a file from Cloudinary by its URL or public_id
 */
const deleteFromCloudinary = async (urlOrPublicId) => {
  try {
    // Extract public_id from URL if a full URL is provided
    let publicId = urlOrPublicId;
    if (urlOrPublicId.startsWith('http')) {
      const parts = urlOrPublicId.split('/');
      const filenameWithExt = parts[parts.length - 1];
      const filename = filenameWithExt.split('.')[0];
      const folder = parts[parts.length - 2];
      publicId = `${folder}/${filename}`;
    }
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('⚠️  Failed to delete from Cloudinary:', err.message);
  }
};

module.exports = {
  cloudinary,
  uploadProduct,
  uploadWasl,
  uploadStore,
  uploadChatFile,
  deleteFromCloudinary,
};
