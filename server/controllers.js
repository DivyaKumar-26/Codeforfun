// controllers.js
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const crypto = require('crypto');

function homeController(req, res) {
    res.render("home");
}

function loginGetController(req, res) {
    res.render("login")
}

async function loginPostController(req, res) {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.render("confirm", { msg: "Invalid Credentials", redirect: "/login" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.render("confirm", { msg: "Invalid Credentials", redirect: "/login" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

        res.cookie("access_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 1000 * 60 * 60 * 24 * 30 // 30 days
        }).redirect("/")
    } catch (error) {
        res.render("confirm", { msg: "Server Error. Please try again.", redirect: "/login" });
    }
}

function registerGetController(req, res) {
    res.render('register');
}

async function registerPostController(req, res) {
    const { enrollmentNo, email, password, fullName, phoneNumber, address, department, role } = req.body;

    try {
        const emailExistsVerified = await User.findOne({ email, emailVerified: true })
        const enrollmentNoExistsVerified = await User.findOne({ enrollmentNo, emailVerified: true })
        const emailExists = await User.findOne({ email });
        const enrollmentNoExists = await User.findOne({ enrollmentNo });

        if (emailExistsVerified) {
            return res.render("confirm", { msg: "Email already exists", redirect: "/register" })
        }

        if (enrollmentNoExistsVerified) {
            return res.render("confirm", { msg: "Enrollment number already exists", redirect: "/register" })
        }

        if (emailExists) {
            await User.deleteOne({ email });
        }
        if (enrollmentNoExists) {
            await User.deleteOne({ enrollmentNo });
        }

        // Generate verification token
        const verificationToken = crypto.randomBytes(20).toString('hex');

        const user = new User({
            enrollmentNo,
            email,
            password,
            fullName,
            phoneNumber,
            address,
            department,
            role,
            emailVerificationToken: verificationToken,
            emailVerificationExpires: Date.now() + 1 * 60 * 60 * 1000 // 1 hour
        });

        await user.save();
        await User.sendVerificationEmail(user._id, req);

        res.render("confirm", { msg: "Registration successful. Please verify your email.", redirect: "/login" });
    } catch (error) {
        res.render("confirm", { msg: "Server Error. Please try again.", redirect: "/register" });
        console.log(error);

    }
}

// verify email and resend verification link to user
const verifyEmail = async (req, res) => {
    try {
        const user = await User.findOne({
            emailVerificationToken: req.params.token,
            emailVerificationExpires: { $gt: Date.now() }
        });

        const userAlreadyVerified = await User.findOne({
            emailVerificationToken: req.params.token,
            emailVerified: true
        });

        if (!user) {
            return res.render("confirm", { msg: "Verification link has expired. Please register again.", redirect: "/register" });
        }

        if (userAlreadyVerified) {
            return res.render("confirm", { msg: "Email already verified. Please login.", redirect: "/login" });
        }

        user.emailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;

        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

        // res.render("confirm", { msg: "Email verified successfully. Now login.", redirect: "/login" });
        res.cookie("access_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 1000 * 60 * 60 * 24 * 30 // 30 days
        }).redirect("/")
    } catch (error) {
        console.error(error);
        res.render("confirm", { msg: "Server Error. Please try again.", redirect: "/register" });
    }
};
// const resendVerificationEmail = async (req, res) => {
//     try {
//         const user = await User.findOne({ email: req.body.email });

//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         if (user.emailVerified) {
//             return res.status(400).json({ message: 'Email already verified' });
//         }

//         // Email options
//         const mailOptions = {
//             subject: 'Verify Your Email Address',
//             html: `
//       <h1>Welcome to ${process.env.COMPANY_NAME}!</h1>
//       <p>Please click the link below to verify your email address:</p>
//       <a href="${verificationUrl}">${verificationUrl}</a>
//       <p>This link will expire in 1 hour.</p>
//     `
//         };

//         await User.sendVerificationEmail(user._id, mailOptions);

//         res.status(200).json({ message: 'Verification email resent successfully' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Error resending verification email', error: error.message });
//     }
// };

// Middleware
//middleware for home and pages which require login
function authMiddleware(req, res, next) {
    const token = req.cookies.access_token;

    if (!token) {
        return res.redirect("/login")
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.id;
        console.log(decoded)
        next();
    } catch (error) {
        res.redirect("/login")
    }
}

// middleware for login and register pages
function authMiddlewareOpp(req, res, next) {
    const token = req.cookies.access_token;

    if (!token) {
        return next()
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.id;
        res.redirect("/")
    } catch (error) {
        next()
    }
}

//logout 
const logout = async (req, res) => {
    res.clearCookie("access_token").redirect("/");
};

//Forgot and reset password
const forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email, emailVerified: true });

        if (!user) {
            return res.render("confirm", { msg: "No such email exists.", redirect: "/login" });
        }

        // Get reset token
        // const resetToken = user.createPasswordResetToken();
        // await user.save({ validateBeforeSave: false });

        // Create reset URL
        // const resetUrl = `${req.protocol}://${req.get('host')}/resetPassword/${resetToken}`;

        try {
            await User.handleForgotPassword(req.body.email, req);
            await user.save({ validateBeforeSave: false });

            res.render("confirm", { msg: "Password reset email sent. Please check your email.", redirect: "/login" });
        } catch (err) {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });
            console.log(err);

            return res.render("confirm", { msg: "Server error. Please try again.", redirect: "/login" });
        }
    } catch (error) {
        console.log(error);

        return res.render("confirm", { msg: "Server error. Please try again.", redirect: "/login" });
    }
};

const resetPassword = async (req, res) => {
    try {
        // Get user based on the token
        const hashedToken = req.params.token;

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        // If token has not expired, and there is user, set the new password
        if (!user) {
            return res.render("confirm", { msg: "Token is invalid or has expired.", redirect: "/login" });
        }

        user.password = req.body.password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        // Log the user in, send JWT
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        res.cookie("access_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 1000 * 60 * 60 * 24 * 30 // 30 days
        }).redirect("/")
    } catch (error) {
        res.render("confirm", { msg: "Server error. Please try again.", redirect: "/login" });
    }
};

// Export all controllers and middleware
module.exports = {
    homeController,
    loginGetController,
    loginPostController,
    registerGetController,
    registerPostController,
    authMiddleware,
    authMiddlewareOpp,
    verifyEmail,
    forgotPassword,
    resetPassword,
    logout
};