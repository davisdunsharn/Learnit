const express    = require('express');
const router     = express.Router();
const verify     = require('../middleware/verifyToken');
const { summarise, explain, quiz, flashcards, chat } = require('../controllers/aiController');

// all AI routes require a valid supabase session token
router.post('/summary',    verify, summarise);
router.post('/explain',    verify, explain);
router.post('/quiz',       verify, quiz);
router.post('/flashcards', verify, flashcards);
router.post('/chat',       verify, chat);

module.exports = router;
