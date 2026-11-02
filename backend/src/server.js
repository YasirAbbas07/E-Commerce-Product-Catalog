require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
connectDB().then(() => app.listen(process.env.PORT || 5000, () => console.log('API on :' + (process.env.PORT || 5000))))
  .catch((e) => { console.error(e); process.exit(1); });
