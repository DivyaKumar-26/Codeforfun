// routes.js

const express = require('express');
const router = express.Router();

// Import controller functions (assuming they're defined in a separate file)
const {
    homeController,
    loginGetController,
    loginPostController,
    registerGetController,
    registerPostController
} = require('./controllers');

// Home route
router.get('/', homeController);

// Login routes
router.get('/login', loginGetController);
router.post('/login', loginPostController);

// Register routes
router.get('/register', registerGetController);
router.post('/register', registerPostController);

module.exports = router;