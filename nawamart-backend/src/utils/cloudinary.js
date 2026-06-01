const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ─── Local Storage Helper ─────────────────────────────────────────────────────
const createStorage = (folderName) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, '../../uploads', folderName);
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  });
};

// Helper middleware to convert req.file.path and req.files.*.path to URLs
const mapToUrl = (folderName) => (req, res, next) => {
  const baseUrl = `${req.protocol}://${req.get('host')}/uploads/${folderName}/`;
  if (req.file) {
    req.file.path = baseUrl + req.file.filename;
  }
  if (Array.isArray(req.files)) {
    req.files = req.files.map(file => {
      file.path = baseUrl + file.filename;
      return file;
    });
  } else if (req.files) {
    for (const key in req.files) {
      req.files[key] = req.files[key].map(file => {
        file.path = baseUrl + file.filename;
        return file;
      });
    }
  }
  next();
};

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
const uploadProduct = {
  single: (field) => [multer({ storage: createStorage('products'), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter }).single(field), mapToUrl('products')],
  array: (field, maxCount) => [multer({ storage: createStorage('products'), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter }).array(field, maxCount), mapToUrl('products')],
  fields: (fields) => [multer({ storage: createStorage('products'), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter }).fields(fields), mapToUrl('products')],
};

const uploadWasl = {
  single: (field) => [multer({ storage: createStorage('wasl'), limits: { fileSize: 10 * 1024 * 1024 }, fileFilter }).single(field), mapToUrl('wasl')],
};

const uploadStore = {
  single: (field) => [multer({ storage: createStorage('stores'), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter }).single(field), mapToUrl('stores')],
  fields: (fields) => [multer({ storage: createStorage('stores'), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter }).fields(fields), mapToUrl('stores')],
};

const uploadAvatar = {
  single: (field) => [multer({ storage: createStorage('avatars'), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter }).single(field), mapToUrl('avatars')],
};

const uploadChatFile = {
  single: (field) => [multer({ storage: createStorage('chat'), limits: { fileSize: 10 * 1024 * 1024 }, fileFilter }).single(field), mapToUrl('chat')],
};

/**
 * Delete a local file (polyfill for Cloudinary delete)
 */
const deleteFromCloudinary = async (url) => {
  try {
    if (!url) return;
    // URL looks like: http://localhost:5000/uploads/products/images-1234.jpg
    const parts = url.split('/uploads/');
    if (parts.length === 2) {
      const localPath = path.join(__dirname, '../../uploads', parts[1]);
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
    }
  } catch (err) {
    console.error('[Cloudinary] Failed to delete local file:', err.message);
  }
};

module.exports = {
  cloudinary: {}, // Dummy export so requires don't break
  uploadProduct,
  uploadWasl,
  uploadStore,
  uploadAvatar,
  uploadChatFile,
  deleteFromCloudinary,
};

