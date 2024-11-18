// server.js

// Import required modules
const express = require('express');
const path = require('path');

// Create an instance of an Express application
const app = express();

// Set the port number for the server to listen on
const PORT = 3000;

// Serve static files (like HTML, CSS, and JS files) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Define the default route to serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
