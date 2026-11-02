exports.notFound = (req, _res, next) => next(Object.assign(new Error(`Route ${req.method} ${req.originalUrl} not found`), { status: 404 }));
exports.errorHandler = (err, _req, res, _next) => {
  let status = err.status || 500, message = err.message;
  if (err.code === 11000) { status = 409; message = 'Duplicate value: ' + Object.keys(err.keyPattern || {}).join(', '); }
  if (err.name === 'CastError') { status = 400; message = 'Invalid id'; }
  if (status === 500) console.error(err);
  res.status(status).json({ success: false, message: status === 500 ? 'Internal server error' : message, details: err.details });
};
