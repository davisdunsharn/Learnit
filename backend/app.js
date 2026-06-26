// Node < 22 has no native WebSocket, but @supabase/supabase-js (v2.106+) requires
// one when createClient() initialises its realtime client — otherwise it throws,
// which in verifyToken gets caught and surfaces as a 401 on every AI/OCR request.
if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = require('ws');
}

const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app = express();

app.disable('x-powered-by');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// only keeping routes that need server-side processing
// auth, notes, subjects all go through supabase directly from the frontend
const aiRoutes       = require('./routes/aiRoutes');
const ocrRoutes      = require('./routes/ocrRoutes');
const externalRoutes = require('./routes/externalRoutes');

app.use('/api/ai',       aiRoutes);
app.use('/api/ocr',      ocrRoutes);
app.use('/api/external', externalRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'LearnIt API is running' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5001;

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

app.listen(PORT, () => console.log(`LearnIt server running on port ${PORT}`));

module.exports = app;
