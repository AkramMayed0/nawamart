const Invoice = require('../models/Invoice');
const { asyncHandler, apiResponse } = require('../utils/helpers');

const getMyInvoices = asyncHandler(async (req, res) => {
  const invoices = await Invoice.find({ merchant: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);

  return apiResponse(res, {
    message: 'تم جلب الفواتير',
    data: invoices,
  });
});

module.exports = { getMyInvoices };
