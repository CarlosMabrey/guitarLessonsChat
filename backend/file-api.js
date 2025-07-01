// Simple Express backend for reading and writing files (FeatureStatus.md)
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;
const FEATURE_STATUS_PATH = path.join(__dirname, '../public/FeatureStatus.md');

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Read FeatureStatus.md
app.get('/api/feature-status', (req, res) => {
  fs.readFile(FEATURE_STATUS_PATH, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read file.' });
    res.json({ content: data });
  });
});

// Write FeatureStatus.md
app.post('/api/feature-status', (req, res) => {
  const { content } = req.body;
  if (typeof content !== 'string') {
    return res.status(400).json({ error: 'Invalid content.' });
  }
  fs.writeFile(FEATURE_STATUS_PATH, content, 'utf8', err => {
    if (err) return res.status(500).json({ error: 'Failed to write file.' });
    res.json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`File API server running on http://localhost:${PORT}`);
});
