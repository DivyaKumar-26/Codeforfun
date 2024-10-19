// routes.js

const express = require('express');
const router = express.Router();

// Import controller functions (assuming they're defined in a separate file)
const {
    homeController,
    loginGetController,
    loginPostController,
    registerGetController,
    registerPostController,
    authMiddleware,
    authMiddlewareOpp,
    forgotPassword,
    resetPassword,
    logout
} = require('./controllers');
const { verifyEmail } = require('./controllers');

// Home route
router.get('/', authMiddleware, homeController);

// Login routes
router.get('/login', authMiddlewareOpp, loginGetController);
router.post('/login', loginPostController);

//logout routes
router.get('/logout', authMiddleware, logout);

// Register routes
router.get('/register', authMiddlewareOpp, registerGetController);
router.post('/register', registerPostController);

// Password reset and forgot routes
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

//verify email
router.get('/verify-email/:token', verifyEmail);
// resend verfication email 
// router.post('/resend-verification-email', authMiddlewareOpp, resendVerificationEmail);

module.exports = router;