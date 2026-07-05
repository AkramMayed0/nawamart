const ThemeAsset = require('../models/ThemeAsset');
const Store = require('../models/Store');
const { asyncHandler, apiResponse } = require('../utils/helpers');
const cloudinary = require('../utils/cloudinary');
const fs = require('fs');
const path = require('path');

const getAssets = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;
  const { type, folder, search, tags } = req.query;

  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'المتجر غير موجود' });
  }

  const query = { store: storeId };
  if (type) query.type = type;
  if (folder) query.folder = folder;
  if (tags) query.tags = { $in: tags.split(',') };
  if (search) {
    query.$or = [
      { originalName: { $regex: search, $options: 'i' } },
      { alt: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } },
    ];
  }

  const assets = await ThemeAsset.find(query).sort({ createdAt: -1 });
  return apiResponse(res, { data: assets, message: 'تم جلب الملفات بنجاح' });
});

const uploadAsset = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;

  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'المتجر غير موجود' });
  }

  if (!req.file) {
    return apiResponse(res, { statusCode: 400, success: false, message: 'الملف مطلوب' });
  }

  const { folder: assetFolder = '/', alt, tags } = req.body;

  let type = 'image';
  const mime = req.file.mimetype;
  if (mime.startsWith('video/')) type = 'video';
  else if (mime.startsWith('font/') || mime.endsWith('ttf') || mime.endsWith('woff') || mime.endsWith('woff2') || mime.endsWith('eot')) type = 'font';
  else if (mime.startsWith('image/')) type = 'image';

  let url = req.file.path;
  let publicId = null;
  let width = null;
  let height = null;

  if (req.file.path && req.file.filename) {
    url = req.file.path;
  }

  try {
    const cloudResult = await cloudinary.uploader.upload(req.file.path, {
      folder: `nawamart/themes/${storeId}`,
      resource_type: type === 'video' ? 'video' : 'image',
    });
    url = cloudResult.secure_url;
    publicId = cloudResult.public_id;
    width = cloudResult.width || null;
    height = cloudResult.height || null;

    fs.unlink(req.file.path, () => {});
  } catch (uploadErr) {
    // If Cloudinary fails, keep the local path
  }

  const asset = await ThemeAsset.create({
    store: storeId,
    originalName: req.file.originalname,
    url,
    type,
    mimeType: mime,
    size: req.file.size,
    width,
    height,
    alt: alt || null,
    tags: tags ? tags.split(',').map((t) => t.trim()) : [],
    folder: assetFolder,
    publicId,
  });

  return apiResponse(res, { data: asset, message: 'تم رفع الملف بنجاح' });
});

const updateAsset = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;
  const { assetId } = req.params;

  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'المتجر غير موجود' });
  }

  const allowed = ['alt', 'tags', 'folder'];
  const update = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      update[key] = req.body[key];
    }
  }

  const asset = await ThemeAsset.findOneAndUpdate(
    { _id: assetId, store: storeId },
    { $set: update },
    { new: true, runValidators: true }
  );

  if (!asset) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'الملف غير موجود' });
  }

  return apiResponse(res, { data: asset, message: 'تم تحديث الملف بنجاح' });
});

const deleteAsset = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;
  const { assetId } = req.params;

  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'المتجر غير موجود' });
  }

  const asset = await ThemeAsset.findOneAndDelete({ _id: assetId, store: storeId });
  if (!asset) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'الملف غير موجود' });
  }

  if (asset.publicId) {
    try {
      await cloudinary.uploader.destroy(asset.publicId);
    } catch (err) {
      // ignore
    }
  }

  return apiResponse(res, { message: 'تم حذف الملف بنجاح' });
});

const getFolders = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;

  const folders = await ThemeAsset.distinct('folder', { store: storeId });
  const folderList = folders
    .filter(Boolean)
    .sort()
    .map((f) => ({ path: f, name: f.replace(/^\/+/, '').replace(/\/+$/, '') || 'root' }));

  return apiResponse(res, { data: folderList, message: 'تم جلب المجلدات بنجاح' });
});

module.exports = {
  getAssets,
  uploadAsset,
  updateAsset,
  deleteAsset,
  getFolders,
};
