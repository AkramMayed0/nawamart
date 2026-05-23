const { apiResponse, asyncHandler } = require('../utils/helpers');

/**
 * POST /api/upload/wasl
 * Upload a payment receipt (Customer only usually, but could be general)
 */
const uploadWasl = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'لم يتم إرفاق أي صورة',
      data: null,
    });
  }

  return apiResponse(res, {
    statusCode: 201,
    message: 'تم رفع الإيصال بنجاح',
    data: {
      url: req.file.path,
    },
  });
});

const uploadChatFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'لم يتم إرفاق أي ملف',
      data: null,
    });
  }

  return apiResponse(res, {
    statusCode: 201,
    message: 'تم رفع الملف بنجاح',
    data: {
      url: req.file.path,
    },
  });
});

module.exports = {
  uploadWasl,
  uploadChatFile,
};
