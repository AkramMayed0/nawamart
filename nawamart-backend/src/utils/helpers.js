/**
 * Wrap async route handlers to avoid try/catch boilerplate.
 * Usage: router.get('/path', asyncHandler(myController))
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/**
 * Build a standard API response object
 */
const apiResponse = (res, { statusCode = 200, success = true, data = null, message = '' }) => {
  return res.status(statusCode).json({ success, data, message });
};

/**
 * Extract pagination params from a request's query string.
 * Returns { page, limit, skip }
 */
const getPaginationParams = (req) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 20);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Build a standard pagination object for API responses.
 */
const paginateResponse = (total, page, limit) => ({
  page,
  limit,
  total,
  pages: Math.ceil(total / limit),
  hasNext: page * limit < total,
  hasPrev: page > 1,
});

/**
 * Full paginate helper (wraps Model.find + countDocuments)
 */
const paginate = async (Model, query = {}, options = {}) => {
  const page = Math.max(1, parseInt(options.page) || 1);
  const limit = Math.min(100, parseInt(options.limit) || 20);
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Model.find(query)
      .sort(options.sort || { createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select(options.select || '')
      .populate(options.populate || ''),
    Model.countDocuments(query),
  ]);

  return {
    data,
    pagination: paginateResponse(total, page, limit),
  };
};

module.exports = { asyncHandler, apiResponse, paginate, getPaginationParams, paginateResponse };
