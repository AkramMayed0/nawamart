const Product = require('../models/Product');
const Store = require('../models/Store');
const { apiResponse, asyncHandler, getPaginationParams, paginateResponse } = require('../utils/helpers');

/**
 * POST /api/products
 * Create a new product (Merchant only)
 */
const createProduct = asyncHandler(async (req, res) => {
  const { storeId, name, description, price, salePrice, stock, category } = req.body;

  // 1. Verify that the store belongs to the merchant
  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) {
    return res.status(403).json({
      success: false,
      message: 'المتجر غير موجود أو لا تملك صلاحية الإضافة إليه',
      data: null,
    });
  }

  // 2. Handle image upload if provided
  let image = null;
  if (req.file) {
    image = req.file.path;
  }

  // 3. Create the product
  const product = await Product.create({
    store: storeId,
    merchant: store.merchant, // store.merchant is the merchant's _id
    name,
    description,
    price,
    salePrice: salePrice || undefined,
    stock: stock || 0,
    category,
    ...(image ? { images: [image] } : {}),
  });

  return apiResponse(res, {
    statusCode: 201,
    message: 'تم إضافة المنتج بنجاح',
    data: product,
  });
});

/**
 * GET /api/products/store/:storeId
 * Get all products for a specific store (Public)
 */
const getProductsByStore = asyncHandler(async (req, res) => {
  const { storeId } = req.params;
  const { limit, skip, page } = getPaginationParams(req);
  const { search, category } = req.query;

  // Build query
  const query = { store: storeId, isDeleted: false };
  if (category) {
    query.category = category;
  }
  if (search) {
    query.$text = { $search: search };
  }

  const [products, total] = await Promise.all([
    Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Product.countDocuments(query),
  ]);

  return res.status(200).json({
    success: true,
    message: 'تم جلب المنتجات بنجاح',
    data: products,
    pagination: paginateResponse(total, page, limit),
  });
});

/**
 * PUT /api/products/:id
 * Update a product (Merchant only)
 */
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // 1. Find product
  let product = await Product.findById(id).populate('store', 'merchant');
  
  if (!product || product.isDeleted) {
    return res.status(404).json({
      success: false,
      message: 'المنتج غير موجود',
      data: null,
    });
  }

  // 2. Ensure merchant owns the store of this product
  if (product.store.merchant.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'لا تملك صلاحية تعديل هذا المنتج',
      data: null,
    });
  }

  const { name, description, price, salePrice, stock, category, isActive } = req.body;

  let images = product.images;
  if (req.file) {
    images = [req.file.path];
  }

  product.name = name || product.name;
  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = price;
  
  // Reset salePrice if empty string or null passed, else update
  if (salePrice === '' || salePrice === null) {
    product.salePrice = undefined;
  } else if (salePrice !== undefined) {
    product.salePrice = salePrice;
  }

  if (stock !== undefined) {
    product.stock = stock;
    // Auto-enable if stock restocked
    if (stock > 0 && !product.isActive) product.isActive = true;
  }
  if (category !== undefined) product.category = category;
  if (isActive !== undefined) product.isActive = isActive;
  product.images = images;

  await product.save();

  return apiResponse(res, {
    message: 'تم تحديث المنتج بنجاح',
    data: product,
  });
});

/**
 * DELETE /api/products/:id
 * Soft delete a product (Merchant only)
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let product = await Product.findById(id).populate('store', 'merchant');

  if (!product || product.isDeleted) {
    return res.status(404).json({
      success: false,
      message: 'المنتج غير موجود',
      data: null,
    });
  }

  if (product.store.merchant.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'لا تملك صلاحية حذف هذا المنتج',
      data: null,
    });
  }

  // Soft delete
  product.isDeleted = true;
  product.isActive = false;
  await product.save();

  return apiResponse(res, {
    message: 'تم حذف المنتج بنجاح',
    data: null,
  });
});

module.exports = {
  createProduct,
  getProductsByStore,
  updateProduct,
  deleteProduct,
};
