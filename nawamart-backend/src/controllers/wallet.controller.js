const WalletLedger = require('../models/WalletLedger');
const { getWalletBalance } = require('../services/WalletService');
const { asyncHandler, apiResponse } = require('../utils/helpers');

const getBalance = asyncHandler(async (req, res) => {
  const balance = await getWalletBalance(req.user._id);

  return apiResponse(res, {
    message: 'تم جلب رصيد المحفظة',
    data: { balance },
  });
});

const getLedger = asyncHandler(async (req, res) => {
  const entries = await WalletLedger.find({ merchant: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);

  return apiResponse(res, {
    message: 'تم جلب سجل المحفظة',
    data: entries,
  });
});

module.exports = { getBalance, getLedger };
