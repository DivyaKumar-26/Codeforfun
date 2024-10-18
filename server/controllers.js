// controllers.js

function homeController(req, res) {
    res.send('Welcome to IITR Lending and Giving Platform');
}

function loginGetController(req, res) {
    res.send('Login Page');
}

function loginPostController(req, res) {
    // Handle login logic here
    res.send('Login attempt received');
}

function registerGetController(req, res) {
    res.send('Registration Page');
}

function registerPostController(req, res) {
    // Handle registration logic here
    res.send('Registration attempt received');
}

// Export all controllers
module.exports = {
    homeController,
    loginGetController,
    loginPostController,
    registerGetController,
    registerPostController
};