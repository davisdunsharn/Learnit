const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  getNotes,
  createNote,
  updateNote,
  deleteNote
} = require('../controllers/noteController');

// all note routes require a valid token
router.get('/',       auth, getNotes);
router.post('/',      auth, createNote);
router.put('/:id',    auth, updateNote);
router.delete('/:id', auth, deleteNote);

module.exports = router;