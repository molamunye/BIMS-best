const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create storage engine for multer with dynamic resource_type
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    // Determine resource type based on file mimetype
    const isPDF = file.mimetype === 'application/pdf';
    const isImage = file.mimetype.startsWith('image/');
    
    const params = {
      folder: 'bims-uploads',
      public_id: `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1E9)}`,
    };

    if (isPDF) {
      params.resource_type = 'raw'; // PDFs are stored as raw files
      params.format = 'pdf';
    } else if (isImage) {
      params.resource_type = 'image';
      params.transformation = [
        { width: 1920, height: 1080, crop: 'limit', quality: 'auto' }
      ];
    } else {
      params.resource_type = 'auto'; // Auto-detect
    }

    return params;
  },
});

module.exports = { cloudinary, storage };

