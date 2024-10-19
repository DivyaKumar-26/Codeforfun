// Load environment variables
require('dotenv').config();
const express = require("express");
const path = require('path');

const cookieParser = require('cookie-parser');

const connectDB = require('./connDB');
const app = express();
const port = process.env.PORT;

// Import routes
const routes = require('./routes.js');

// Connect to MongoDB
connectDB();

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

app.use(cookieParser());

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use the routes
app.use('/', routes);

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});