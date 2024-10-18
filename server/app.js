// Load environment variables
require('dotenv').config();
const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

// Import routes
const routes = require('./routes');

// Connect to MongoDB
connectDB();

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use the routes
app.use('/', routes);

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});