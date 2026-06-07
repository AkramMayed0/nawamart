const Store = require('../models/Store');
const { apiResponse, asyncHandler } = require('../utils/helpers');
const { FEATURES, getFeatureAccessMap } = require('../services/FeatureService');

const getMyFeatures = asyncHandler(async (req, res) => {
  const storeId = req.query.storeId || req.params.storeId;
  const query = { merchant: req.user._id };
  if (storeId) query._id = storeId;

  const store = await Store.findOne(query).sort({ createdAt: -1 });
  if (!store) {
    return res.status(404).json({
      success: false,
      data: null,
      message: 'Store not found',
    });
  }

  return apiResponse(res, {
    message: 'Feature access loaded',
    data: {
      store: {
        _id: store._id,
        name: store.name,
        plan: store.plan,
        type: store.type,
      },
      features: getFeatureAccessMap(store),
      catalog: FEATURES,
    },
  });
});

module.exports = { getMyFeatures };
