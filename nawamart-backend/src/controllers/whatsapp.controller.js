const WhatsAppAutomation = require('../models/WhatsAppAutomation');
const { apiResponse, asyncHandler } = require('../utils/helpers');

const getWhatsAppSettings = asyncHandler(async (req, res) => {
  const store = req.featureStore;
  const settings = await WhatsAppAutomation.findOne({ store: store._id });
  return apiResponse(res, { message: 'WhatsApp settings loaded', data: settings });
});

const upsertWhatsAppSettings = asyncHandler(async (req, res) => {
  const store = req.featureStore;
  const allowed = [
    'commerceBotEnabled',
    'botGreeting',
    'cartRetrieverEnabled',
    'abandonedCartDelayMinutes',
    'discountEnabled',
    'discountPercent',
    'quietHours',
    'connectedPhone',
  ];

  const update = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) update[key] = req.body[key];
  }

  const settings = await WhatsAppAutomation.findOneAndUpdate(
    { store: store._id },
    {
      $set: {
        ...update,
        merchant: req.user._id,
      },
      $setOnInsert: { store: store._id },
    },
    { new: true, upsert: true, runValidators: true }
  );

  return apiResponse(res, { message: 'WhatsApp settings saved', data: settings });
});

module.exports = {
  getWhatsAppSettings,
  upsertWhatsAppSettings,
};
