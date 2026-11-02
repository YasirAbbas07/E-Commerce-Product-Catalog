const { Schema, model } = require('mongoose');
const productSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 140 },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, default: '', maxlength: 4000 },
  brand: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, default: 0, min: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  tags: [String],
  attributes: { type: Map, of: String },   // category-specific fields (e.g. color, RAM)
  image: String,
}, { timestamps: true });

// Indexes: one text index for search, compound indexes matching common filter+sort combos.
productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' }, { weights: { name: 10, brand: 5, tags: 3 } });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ brand: 1, price: 1 });
productSchema.index({ rating: -1, createdAt: -1 });
module.exports = model('Product', productSchema);
