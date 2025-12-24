const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/emailService');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
const registerUser = async (req, res) => {
    let { fullName, email, password, phone } = req.body;
    email = email.trim().toLowerCase();

    // Ensure phone is present since we want to support login with it
    if (!phone) {
        return res.status(400).json({ message: 'Phone number is required' });
    }

    try {
        // Check if user exists by email OR phone
        const userExists = await User.findOne({
            $or: [
                { email },
                { phone }
            ]
        });

        if (userExists) {
            // Determine which field is duplicate
            if (userExists.email === email) {
                return res.status(400).json({ message: 'User with this email already exists' });
            }
            if (userExists.phone === phone) {
                return res.status(400).json({ message: 'User with this phone number already exists' });
            }
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            fullName,
            email,
            password,
            phone,
            role: 'client', // Default to client
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    // accept identifier which can be email or phone
    let { email, password } = req.body;
    let identifier = email; // Fallback for old clients sending 'email'
    if (req.body.identifier) {
        identifier = req.body.identifier;
    }

    identifier = identifier.trim().toLowerCase();

    try {
        // Find user by email OR phone
        const user = await User.findOne({
            $or: [
                { email: identifier },
                { phone: identifier }
            ]
        });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email/phone or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    let { email } = req.body;
    email = email.trim().toLowerCase();

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'There is no user with that email' });
        }

        // Generate a 6-digit random code
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Set reset code and expiry (15 minutes from now)
        user.resetCode = resetCode;
        user.resetCodeExpires = Date.now() + 15 * 60 * 1000;

        await user.save();

        // Send Email
        const message = `Your password reset code is: ${resetCode}. It expires in 15 minutes.`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Code',
                message,
            });

            res.status(200).json({ message: 'Reset code sent to email' });
        } catch (error) {
            user.resetCode = undefined;
            user.resetCodeExpires = undefined;
            await user.save();

            return res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    let { email, code, newPassword } = req.body;
    email = email.trim().toLowerCase();
    code = code.trim();

    try {
        const user = await User.findOne({
            email,
            resetCode: code,
            resetCodeExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset code' });
        }

        // Set new password
        user.password = newPassword;
        user.resetCode = undefined;
        user.resetCodeExpires = undefined;

        await user.save();

        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            res.json({
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                bio: user.bio,
                phone: user.phone,
                location: user.location,
                settings: user.settings
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { registerUser, loginUser, forgotPassword, resetPassword, getMe };
