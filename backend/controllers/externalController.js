const dictionaryService = require('../services/dictionaryService');

const define = async (req, res) => {
  const { word } = req.params;
  if (!word) return res.status(400).json({ error: 'Word is required' });
  try {
    const result = await dictionaryService.getDefinition(word);
    if (!result) return res.status(404).json({ error: 'Word not found' });
    res.json(result);
  } catch (err) {
    console.error('dictionary error:', err.message);
    res.status(500).json({ error: 'Could not fetch definition' });
  }
};

module.exports = { define };
