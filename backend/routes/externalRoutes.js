const express = require('express');
const router  = express.Router();
const verify  = require('../middleware/verifyToken');
const { define } = require('../controllers/externalController');

router.get('/dictionary/:word', verify, define);

module.exports = router;
