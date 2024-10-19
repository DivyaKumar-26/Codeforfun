const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const sendEmail = require('../utils/sendEmail');

const userSchema = new mongoose.Schema({
    enrollmentNo: {
        type: Number,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    password: {
        type: String,
        required: true
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    fullName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /\d{10}/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    address: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'faculty', 'staff'],
        default: 'student'
    },
    joinedDate: {
        type: Date,
        default: Date.now
    },
    lendingScore: {
        type: Number,
        default: 500
    },
    itemsLent: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
    }],
    itemsBorrowed: [{
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item'
        },
        borrowDate: {
            type: Date,
            default: Date.now
        },
        returnDate: Date,
        lenderFeedback: String,
        lenderRating: {
            type: Number,
            min: 1,
            max: 5
        },
        status: {
            type: String,
            enum: ['borrowed', 'returned', 'overdue'],
            default: 'borrowed'
        }
    }]
}, {
    timestamps: true
});

// Add any pre-save hooks, methods, or statics here if needed

// Static method to send verification email
userSchema.statics.sendVerificationEmail = async function (userId, req) {
    const user = await this.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

    await user.save();


    const verificationUrl = `${req.protocol}://${req.get('host')}/verify-email/${verificationToken}`;

    // Email options
    const mailOptions = {
        from: `${process.env.COMPANY_NAME} <${process.env.EMAIL_USERNAME}>`,
        to: user.email,
        subject: 'Verify Your Email Address',
        html: `
  <h1>Welcome to ${process.env.COMPANY_NAME}!</h1>
  <p>Please click the link below to verify your email address:</p>
  <a href="${verificationUrl}">${verificationUrl}</a>
  <p>This link will expire in 1 hour.</p>
`
    };

    // Send the email
    await sendEmail(mailOptions);
}

// static method to generate reset password token
// userSchema.methods.createPasswordResetToken = async function () {
//     const resetToken = crypto.randomBytes(32).toString('hex');

//     this.passwordResetToken = crypto
//         .createHash('sha256')
//         .update(resetToken)
//         .digest('hex');

//     this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

//     await sendEmail({
//         from: `${process.env.COMPANY_NAME} <${process.env.EMAIL_USERNAME}>`,
//         to: this.email,
//         subject: 'Reset Password',
//         text: `Click the link below to reset your password: ${resetToken}. The link will expire in 10 minutes.`,
//     })
//     return resetToken;
// };

// userSchema.methods.sendPasswordResetEmail = async function (resetUrl) {
//     // Implement your email sending logic here
//     // You can use nodemailer or any other email service
//     console.log(`Reset URL: ${resetUrl}`);

//     userSchema.pre('save', async function (next) {
//         // If password is modified, hash it
//         if (this.isModified('password')) {
//             this.password = await bcrypt.hash(this.password, 12);
//         }
//         next();
//     });
// }

userSchema.statics.handleForgotPassword = async function (email, req) {
    const user = await this.findOne({ email });

    if (!user) {
        throw new Error('No user found with that email address');
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Token expires in 10 minutes

    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

    // Email options
    const mailOptions = {
        from: `${process.env.COMPANY_NAME} <${process.env.EMAIL_USERNAME}>`,
        to: user.email,
        subject: 'Password Reset Request',
        html: `
        <h1>You have requested a password reset</h1>
        <p>Please click on the following link to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>If you didn't request this, please ignore this email.</p>
        <p>This link will expire in 10 minutes.</p>
      `
    };
    // Send the email
    await sendEmail(mailOptions);
}

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;