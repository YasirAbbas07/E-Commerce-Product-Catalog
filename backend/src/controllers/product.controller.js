const svc = require('../services/product.service');
const wrap = require('../utils/asyncHandler');
exports.list = wrap(async (req, res) => { const { items, pagination } = await svc.list(req.validated.query); res.json({ success: true, data: items, pagination }); });
exports.brands = wrap(async (_req, res) => res.json({ success: true, data: await svc.brands() }));
exports.get = wrap(async (req, res) => res.json({ success: true, data: await svc.get(req.params.id) }));
exports.create = wrap(async (req, res) => res.status(201).json({ success: true, data: await svc.create(req.validated.body) }));
exports.update = wrap(async (req, res) => res.json({ success: true, data: await svc.update(req.params.id, req.validated.body) }));
exports.remove = wrap(async (req, res) => { await svc.remove(req.params.id); res.status(204).end(); });
