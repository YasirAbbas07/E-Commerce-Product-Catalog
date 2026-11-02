const Joi = require('joi');
const id = Joi.string().hex().length(24);
const productBody = {
  name: Joi.string().trim().max(140),
  description: Joi.string().trim().allow('').max(4000),
  brand: Joi.string().trim().max(60),
  price: Joi.number().min(0),
  stock: Joi.number().integer().min(0),
  rating: Joi.number().min(0).max(5),
  category: id,
  tags: Joi.array().items(Joi.string().trim().max(30)).max(20),
  attributes: Joi.object().pattern(Joi.string().max(40), Joi.string().max(100)),
  image: Joi.string().uri().allow(''),
};
exports.createProduct = Joi.object({ ...productBody,
  name: productBody.name.required(), brand: productBody.brand.required(),
  price: productBody.price.required(), category: productBody.category.required() });
exports.updateProduct = Joi.object(productBody).min(1);
exports.listProducts = Joi.object({
  q: Joi.string().trim().max(100),
  category: Joi.string().trim().lowercase().max(80),
  brand: Joi.string().trim().max(200),            // comma separated
  minPrice: Joi.number().min(0), maxPrice: Joi.number().min(0),
  inStock: Joi.boolean(), minRating: Joi.number().min(0).max(5),
  sort: Joi.string().valid('relevance', 'price_asc', 'price_desc', 'rating', 'newest').default('newest'),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(12),
});
exports.createCategory = Joi.object({ name: Joi.string().trim().max(60).required(), parent: id.allow(null) });
exports.idParam = Joi.object({ id: id.required() });
