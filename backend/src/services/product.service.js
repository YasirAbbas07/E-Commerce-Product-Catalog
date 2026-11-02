const Product = require('../models/product.model');
const Category = require('../models/category.model');
const categoryService = require('./category.service');
const ApiError = require('../utils/ApiError');
const slugify = require('../utils/slugify');

const SORTS = { newest: { createdAt: -1 }, price_asc: { price: 1 }, price_desc: { price: -1 }, rating: { rating: -1, createdAt: -1 } };

exports.list = async (f) => {
  const query = {};
  if (f.q) query.$text = { $search: f.q };
  if (f.category) {
    const ids = await categoryService.idsWithDescendants(f.category);
    query.category = { $in: ids };
  }
  if (f.brand) query.brand = { $in: f.brand.split(',').map((b) => b.trim()).filter(Boolean) };
  if (f.minPrice !== undefined || f.maxPrice !== undefined)
    query.price = { ...(f.minPrice !== undefined && { $gte: f.minPrice }), ...(f.maxPrice !== undefined && { $lte: f.maxPrice }) };
  if (f.inStock) query.stock = { $gt: 0 };
  if (f.minRating) query.rating = { $gte: f.minRating };

  const useScore = f.q && f.sort === 'relevance';
  const sort = useScore ? { score: { $meta: 'textScore' } } : SORTS[f.sort] || SORTS.newest;
  const projection = useScore ? { score: { $meta: 'textScore' } } : {};
  const skip = (f.page - 1) * f.limit;

  const [items, total] = await Promise.all([
    Product.find(query, projection).sort(sort).skip(skip).limit(f.limit).populate('category', 'name slug').lean(),
    Product.countDocuments(query),
  ]);
  return { items, pagination: { page: f.page, limit: f.limit, total, pages: Math.ceil(total / f.limit) } };
};

exports.brands = () => Product.distinct('brand').then((b) => b.sort());

exports.get = async (id) => {
  const p = await Product.findById(id).populate('category', 'name slug').lean();
  if (!p) throw new ApiError(404, 'Product not found');
  return p;
};

exports.create = async (data) => {
  if (!(await Category.exists({ _id: data.category }))) throw new ApiError(400, 'Category not found');
  const base = slugify(data.name);
  const slug = (await Product.exists({ slug: base })) ? `${base}-${Date.now().toString(36)}` : base;
  return Product.create({ ...data, slug });
};

exports.update = async (id, data) => {
  const p = await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!p) throw new ApiError(404, 'Product not found');
  return p;
};

exports.remove = async (id) => {
  if (!(await Product.findByIdAndDelete(id))) throw new ApiError(404, 'Product not found');
};
