const aiService = require('../services/aiService');

const summarise = async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Content is required' });
  try {
    const result = await aiService.summarise(content);
    res.json({ result });
  } catch (err) {
    console.error('summarise error:', err.message);
    res.status(500).json({ error: 'AI request failed' });
  }
};

const explain = async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Content is required' });
  try {
    const result = await aiService.explain(content);
    res.json({ result });
  } catch (err) {
    console.error('explain error:', err.message);
    res.status(500).json({ error: 'AI request failed' });
  }
};

const quiz = async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Content is required' });
  try {
    const result = await aiService.generateQuiz(content);
    res.json({ result });
  } catch (err) {
    console.error('quiz error:', err.message);
    res.status(500).json({ error: 'AI request failed' });
  }
};

const flashcards = async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Content is required' });
  try {
    const result = await aiService.generateFlashcards(content);
    res.json({ result });
  } catch (err) {
    console.error('flashcards error:', err.message);
    res.status(500).json({ error: 'AI request failed' });
  }
};

const chat = async (req, res) => {
  const { messages, system } = req.body;
  if (!messages?.length) return res.status(400).json({ error: 'Messages are required' });
  try {
    const result = await aiService.chat(messages, system);
    res.json({ result });
  } catch (err) {
    console.error('chat error:', err.message);
    res.status(500).json({ error: 'AI request failed' });
  }
};

module.exports = { summarise, explain, quiz, flashcards, chat };
