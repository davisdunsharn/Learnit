const express = require('express');
const router = express.Router();

// placeholder — fully implemented in Sprint 2
router.get('/', (req, res) => {
  res.json({ message: 'AI routes coming in Sprint 2' });
});

module.exports = router;
