const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  getAssets,
  uploadAsset,
  updateAsset,
  deleteAsset,
  getFolders,
} = require('../controllers/themeAsset.controller');
const { verifyToken, requireRole } = require('../middleware/verifyToken');

const uploadDir = path.join(__dirname, '../../uploads/themes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/[^a-zA-Z0-9._-]/g, ''));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|svg|mp4|webm|ttf|woff|woff2|eot|ico/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    if (allowed.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error('نوع الملف غير مدعوم'), false);
    }
  },
});

router.get('/folders/:storeId', verifyToken, requireRole('merchant'), getFolders);
router.get('/:storeId', verifyToken, requireRole('merchant'), getAssets);
router.post('/:storeId/upload', verifyToken, requireRole('merchant'), upload.single('file'), uploadAsset);
router.put('/:storeId/:assetId', verifyToken, requireRole('merchant'), updateAsset);
router.delete('/:storeId/:assetId', verifyToken, requireRole('merchant'), deleteAsset);

module.exports = router;
