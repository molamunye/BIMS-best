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

        // Debug: Log the file object to see what Cloudinary returns
        console.log('Uploaded file object keys:', Object.keys(req.file));
        console.log('Uploaded file object:', {
            path: req.file.path,
            secure_url: req.file.secure_url,
            url: req.file.url,
            public_id: req.file.public_id,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            resource_type: req.file.resource_type
        });

        // Cloudinary returns the file object with path property containing the URL
        // multer-storage-cloudinary typically puts the URL in req.file.path
        // For secure URLs, we might need to construct it or use secure_url if available
        let fileUrl = req.file.path || req.file.secure_url || req.file.url;

        // If we have public_id but no URL, construct it manually
        if (!fileUrl && req.file.public_id) {
            const cloudinary = require('../config/cloudinary').cloudinary;
            const resourceType = req.file.resource_type || (req.file.mimetype === 'application/pdf' ? 'raw' : 'image');
            fileUrl = cloudinary.url(req.file.public_id, {
                resource_type: resourceType,
                secure: true
            });
            console.log('Constructed URL from public_id:', fileUrl);
        }

        if (!fileUrl) {
            console.error('No URL found in file object. Full object:', JSON.stringify(req.file, null, 2));
            return res.status(500).json({ 
                message: 'Failed to get file URL from Cloudinary',
                debug: {
                    hasPath: !!req.file.path,
                    hasSecureUrl: !!req.file.secure_url,
                    hasUrl: !!req.file.url,
                    hasPublicId: !!req.file.public_id,
                    allKeys: Object.keys(req.file)
                }
            });
        }

        console.log('✓ Returning file URL:', fileUrl);

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

        console.log(`Processing ${req.files.length} uploaded files`);

        const cloudinary = require('../config/cloudinary').cloudinary;

        // Cloudinary returns file objects with path property containing the URL
        const urls = req.files.map((file, index) => {
            // Debug: Log each file object
            console.log(`File ${index + 1} object keys:`, Object.keys(file));
            console.log(`File ${index + 1}:`, {
                path: file.path,
                secure_url: file.secure_url,
                url: file.url,
                public_id: file.public_id,
                originalname: file.originalname,
                mimetype: file.mimetype,
                resource_type: file.resource_type
            });

            // Try to get URL from file object
            let url = file.path || file.secure_url || file.url;

            // If no URL but we have public_id, construct it
            if (!url && file.public_id) {
                const resourceType = file.resource_type || (file.mimetype === 'application/pdf' ? 'raw' : 'image');
                url = cloudinary.url(file.public_id, {
                    resource_type: resourceType,
                    secure: true
                });
                console.log(`✓ Constructed URL for file ${index + 1} from public_id:`, url);
            }

            if (!url) {
                console.error(`✗ Missing URL for file ${index + 1}. All keys:`, Object.keys(file));
            }
            return url;
        }).filter(url => url); // Filter out any undefined URLs

        if (urls.length === 0) {
            console.error('No URLs extracted from uploaded files');
            return res.status(500).json({ 
                message: 'Failed to get file URLs from Cloudinary',
                debug: {
                    filesCount: req.files.length,
                    firstFileKeys: req.files[0] ? Object.keys(req.files[0]) : []
                }
            });
        }

        console.log(`Successfully extracted ${urls.length} URLs:`, urls);

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
