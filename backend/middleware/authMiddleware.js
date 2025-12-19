const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];
            console.log("Token received:", token);

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
            console.log("Decoded:", decoded);

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password');
            console.log("User found:", req.user ? req.user._id : "None");

            if (!req.user) {
                throw new Error('User not found');
            }

            next();
        } catch (error) {
            console.log("Auth Error:", error.message);
            if (!token) {
                return res.status(401).json({ message: 'Not authorized, no token' });
            }
            // Provide more specific error messages
            if (error.message === 'invalid signature') {
                return res.status(401).json({ 
                    message: 'Token signature invalid. Please log in again to get a new token.',
                    hint: 'This usually happens when JWT_SECRET changed. Make sure JWT_SECRET is set in your .env file and log in again.'
                });
            }
            if (error.message === 'jwt expired') {
                return res.status(401).json({ message: 'Token expired. Please log in again.' });
            }
            res.status(401).json({ message: 'Not authorized' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const optionalProtect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
            req.user = await User.findById(decoded.id).select('-password');
        } catch (error) {
            // Do nothing, just don't populate req.user
            console.log("Optional auth failed:", error.message);
        }
    }
    next();
};

module.exports = { protect, optionalProtect };
