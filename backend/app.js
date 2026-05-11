const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// remove the 'X-Powered-By: Express' header so attackers
// can't easily identify our server technology
app.disable('x-powered-by');

// parse incoming JSON request bodies
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
const authRoutes     = require('./routes/authRoutes');
const subjectRoutes  = require('./routes/subjectRoutes');
const noteRoutes     = require('./routes/noteRoutes');
const aiRoutes       = require('./routes/aiRoutes');
const ocrRoutes      = require('./routes/ocrRoutes');
const externalRoutes = require('./routes/externalRoutes');

app.use('/api/auth',     authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/notes',    noteRoutes);
app.use('/api/ai',       aiRoutes);
app.use('/api/ocr',      ocrRoutes);
app.use('/api/external', externalRoutes);

// health check
app.get('/', (req, res) => {
  res.json({ message: 'LearnIt API is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`LearnIt server running on port ${PORT}`);
});

module.exports = app;
