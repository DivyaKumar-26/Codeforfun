const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
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
    phoneVerified: {
        type: Boolean,
        default: false
    },
    phoneVerificationCode: String,
    phoneVerificationExpires: Date,
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    role: {
        type: String,
        enum: ['student', 'faculty', 'staff'],
        default: 'student'
    },
    department: {
        type: String,
        required: true
    },
    joinedDate: {
        type: Date,
        default: Date.now
    },
    lendingScore: {
        type: Number,
        default: 0
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
// For example:

userSchema.pre('save', async function (next) {
    // If password is modified, hash it
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12);
    }
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;