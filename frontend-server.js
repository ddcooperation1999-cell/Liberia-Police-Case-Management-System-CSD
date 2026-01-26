const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the frontend public directory
app.use(express.static(path.join(__dirname, 'frontend', 'public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', frontend: 'running' });
});

// All other routes serve index.html for SPA routing
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ LNPMS Frontend Dashboard Running!`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`📚 API Backend: http://localhost:3001\n`);
});
