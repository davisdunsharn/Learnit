const ocrService = require('../services/ocrService');

const extract = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
  try {
    const text = await ocrService.extractText(req.file.buffer, req.file.mimetype);
    res.json({ text });
  } catch (err) {
    console.error('OCR error:', err.message);
    res.status(500).json({ error: 'Could not extract text from image' });
  }
};

module.exports = { extract };
