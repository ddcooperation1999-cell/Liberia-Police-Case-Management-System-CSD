const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve static files from the frontend build directory
app.use(express.static(path.join(__dirname, 'frontend', 'build')));
app.use(express.static(path.join(__dirname, 'frontend', 'public')));

// Handle React routing - all requests go to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Frontend server running on http://localhost:${PORT}`);
});
