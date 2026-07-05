const ChangelogEntry = require('../models/ChangelogEntry');
const { apiResponse, asyncHandler, getPaginationParams, paginateResponse } = require('../utils/helpers');

const listEntries = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req);
  const query = { isPublished: true };

  if (req.query.type) query.type = req.query.type;
  if (req.query.featureKey) query.featureKey = req.query.featureKey;

  const [entries, total] = await Promise.all([
    ChangelogEntry.find(query).sort({ publishedAt: -1 }).skip(skip).limit(limit).lean(),
    ChangelogEntry.countDocuments(query),
  ]);

  return apiResponse(res, {
    message: 'تم جلب التحديثات',
    data: entries,
    pagination: paginateResponse(total, page, limit),
  });
});

const getEntry = asyncHandler(async (req, res) => {
  const entry = await ChangelogEntry.findById(req.params.id).lean();
  if (!entry) return res.status(404).json({ success: false, data: null, message: 'التحديث غير موجود' });
  return apiResponse(res, { message: 'تم جلب التحديث', data: entry });
});

const createEntry = asyncHandler(async (req, res) => {
  const entry = await ChangelogEntry.create({
    ...req.body,
    publishedAt: req.body.isPublished ? new Date() : null,
    createdBy: req.user._id,
  });
  return apiResponse(res, { statusCode: 201, message: 'تم إنشاء التحديث', data: entry });
});

const updateEntry = asyncHandler(async (req, res) => {
  const entry = await ChangelogEntry.findById(req.params.id);
  if (!entry) return res.status(404).json({ success: false, data: null, message: 'التحديث غير موجود' });

  Object.assign(entry, req.body);
  if (req.body.isPublished && !entry.publishedAt) entry.publishedAt = new Date();
  await entry.save();

  return apiResponse(res, { message: 'تم تحديث التحديث', data: entry });
});

const deleteEntry = asyncHandler(async (req, res) => {
  const entry = await ChangelogEntry.findByIdAndDelete(req.params.id);
  if (!entry) return res.status(404).json({ success: false, data: null, message: 'التحديث غير موجود' });
  return apiResponse(res, { message: 'تم حذف التحديث', data: null });
});

const adminListEntries = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req);
  const query = {};
  if (req.query.type) query.type = req.query.type;
  if (req.query.isPublished !== undefined) query.isPublished = req.query.isPublished === 'true';

  const [entries, total] = await Promise.all([
    ChangelogEntry.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ChangelogEntry.countDocuments(query),
  ]);

  return apiResponse(res, {
    message: 'تم جلب التحديثات',
    data: entries,
    pagination: paginateResponse(total, page, limit),
  });
});

module.exports = {
  listEntries,
  getEntry,
  createEntry,
  updateEntry,
  deleteEntry,
  adminListEntries,
};
