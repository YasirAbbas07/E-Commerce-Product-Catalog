const svc = require('../services/category.service');
const wrap = require('../utils/asyncHandler');
exports.tree = wrap(async (_req, res) => res.json({ success: true, data: await svc.tree() }));
exports.create = wrap(async (req, res) => res.status(201).json({ success: true, data: await svc.create(req.validated.body) }));
