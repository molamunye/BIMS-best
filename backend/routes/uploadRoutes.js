const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/';
        // Ensure directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Create unique filename: fieldname-timestamp-random.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

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

        // Return the URL to access the file
        // Assuming server serves 'uploads' folder at /uploads
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        res.status(200).json({
            message: 'File uploaded successfully',
            url: fileUrl,
            filename: req.file.filename,
            mimetype: req.file.mimetype
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
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

        const urls = req.files.map(file => {
            return `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
        });

        res.status(200).json({
            message: 'Files uploaded successfully',
            urls: urls
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
