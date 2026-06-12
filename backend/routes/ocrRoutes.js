const express  = require('express');
const router   = express.Router();
const verify   = require('../middleware/verifyToken');
const upload   = require('../middleware/uploadMiddleware');
const { extract } = require('../controllers/ocrController');

router.post('/extract', verify, upload.single('image'), extract);

module.exports = router;
