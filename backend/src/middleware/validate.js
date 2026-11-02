const ApiError = require('../utils/ApiError');
// validate(schema, 'body' | 'query' | 'params') - strips unknown keys, trims, applies defaults.
module.exports = (schema, source = 'body') => (req, _res, next) => {
  const { value, error } = schema.validate(req[source], { abortEarly: false, stripUnknown: true, convert: true });
  if (error) return next(new ApiError(422, 'Validation failed', error.details.map((d) => d.message)));
  req.validated = { ...(req.validated || {}), [source]: value };
  next();
};
