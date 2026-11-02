const router = require('express').Router();
const c = require('../controllers/category.controller');
const validate = require('../middleware/validate');
const s = require('../validators/schemas');
router.get('/', c.tree);
router.post('/', validate(s.createCategory), c.create);
module.exports = router;
