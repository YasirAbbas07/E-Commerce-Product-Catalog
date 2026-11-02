const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '50kb' }));
app.use(mongoSanitize());                       // strips $ and . operators from input (NoSQL injection)
app.use(rateLimit({ windowMs: 60_000, max: 200 }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/v1/products', require('./routes/product.routes'));
app.use('/api/v1/categories', require('./routes/category.routes'));
app.use(notFound);
app.use(errorHandler);
module.exports = app;
