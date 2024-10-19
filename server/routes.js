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
    logout,
    about,
    forgotPasswordGetController,
    feedback,
    profile
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
router.get('/forgot-password', authMiddlewareOpp, forgotPasswordGetController);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

//verify email
router.get('/verify-email/:token', verifyEmail);
// resend verfication email 
// router.post('/resend-verification-email', authMiddlewareOpp, resendVerificationEmail);

//about
router.get("/about", about)

//feedback
router.get('/feedback', authMiddleware, feedback)

//profile
router.get('/profile', authMiddleware, profile)

module.exports = router;