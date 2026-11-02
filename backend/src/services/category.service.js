const Category = require('../models/category.model');
const ApiError = require('../utils/ApiError');
const slugify = require('../utils/slugify');

exports.create = async ({ name, parent }) => {
  if (parent && !(await Category.exists({ _id: parent }))) throw new ApiError(400, 'Parent category not found');
  return Category.create({ name, parent: parent || null, slug: slugify(name) });
};
// Returns the category tree built in memory from a single query.
exports.tree = async () => {
  const all = await Category.find().sort('name').lean();
  const map = new Map(all.map((c) => [String(c._id), { ...c, children: [] }]));
  const roots = [];
  map.forEach((c) => (c.parent ? map.get(String(c.parent))?.children.push(c) : roots.push(c)));
  return roots;
};
// A category slug plus all descendants, so filtering "Electronics" includes "Phones".
exports.idsWithDescendants = async (slug) => {
  const root = await Category.findOne({ slug }).lean();
  if (!root) return [];
  const ids = [root._id]; let frontier = [root._id];
  while (frontier.length) {
    const kids = await Category.find({ parent: { $in: frontier } }, '_id').lean();
    frontier = kids.map((k) => k._id); ids.push(...frontier);
  }
  return ids;
};
