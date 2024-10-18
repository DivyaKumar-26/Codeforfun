// controllers.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

function homeController(req, res) {
    res.json({ msg: "success" });
}

function loginGetController(req, res) {
    res.json({ msg: "success" });
}

async function loginPostController(req, res) {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '6h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

function registerGetController(req, res) {
    res.send('Registration Page');
}

async function registerPostController(req, res) {
    const { enrollmentNo, email, password, fullName, phoneNumber, address, department, role } = req.body;

    try {
        let emailExists = await User.findOne({ email, emailVerified: true });
        let enrollmentNoExists = await User.findOne({ enrollmentNo, emailVerified: true });

        if (emailExists) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        if (enrollmentNoExists) {
            return res.status(400).json({ message: 'Enrollment number already exists' });
        }

        const user = new User({
            enrollmentNo, email, password, fullName, phoneNumber, address, department, role
        });

        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '6h' });
        res.status(201).json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

// Middleware
//middleware for home and pages which require login
function authMiddleware(req, res, next) {
    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({ msg: 'Login required', redirect: '/login' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.id;
        next();
    } catch (error) {
        res.status(401).json({ msg: 'Login required', redirect: '/login' });
    }
}

// middleware for login and register pages
function authMiddlewareOpp(req, res, next) {
    const token = req.header('x-auth-token');

    if (!token) {
        return next()
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.id;
        res.status(400).json({ msg: "Already logged in", redirect: "" })
    } catch (error) {
        next()
    }
}

// Export all controllers and middleware
module.exports = {
    homeController,
    loginGetController,
    loginPostController,
    registerGetController,
    registerPostController,
    authMiddleware
};