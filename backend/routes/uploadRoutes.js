const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');

// Filter file types
const fileFilter = (req, file, cb) => {
    // Accept images and PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file type'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: fileFilter
});

// @route   POST /api/upload
// @desc    Upload a single file
// @access  Public (or Private if using auth middleware)
router.post('/', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Cloudinary returns the file object with path/secure_url property
        // Prefer secure_url for HTTPS, fallback to path
        const fileUrl = req.file.secure_url || req.file.path || req.file.url;

        if (!fileUrl) {
            return res.status(500).json({ message: 'Failed to get file URL from Cloudinary' });
        }

        res.status(200).json({
            message: 'File uploaded successfully',
            url: fileUrl,
            filename: req.file.originalname || req.file.filename,
            mimetype: req.file.mimetype,
            public_id: req.file.public_id
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: error.message || 'Failed to upload file' });
    }
});

// @route   POST /api/upload/multiple
// @desc    Upload multiple files
// @access  Public
router.post('/multiple', upload.array('files', 10), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        // Cloudinary returns file objects with secure_url/path property containing the URL
        // Prefer secure_url for HTTPS, fallback to path
        const urls = req.files.map(file => {
            const url = file.secure_url || file.path || file.url;
            if (!url) {
                console.error('Missing URL for file:', file);
            }
            return url;
        }).filter(url => url); // Filter out any undefined URLs

        if (urls.length === 0) {
            return res.status(500).json({ message: 'Failed to get file URLs from Cloudinary' });
        }

        res.status(200).json({
            message: 'Files uploaded successfully',
            urls: urls
        });
    } catch (error) {
        console.error('Multiple upload error:', error);
        res.status(500).json({ message: error.message || 'Failed to upload files' });
    }
});

module.exports = router;
