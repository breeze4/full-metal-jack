// server.js

// Import required modules
const express = require('express');
const path = require('path');

// Create an instance of an Express application
const app = express();

// Set correct MIME types
app.use((req, res, next) => {
  if (req.url.endsWith('.js')) {
    res.setHeader('Content-Type', 'application/javascript');
  }
  next();
});

// Serve static files from the public directory
app.use(express.static('public'));

// Serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server and listen on the specified port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
