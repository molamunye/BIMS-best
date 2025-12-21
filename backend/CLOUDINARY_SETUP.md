# Cloudinary Integration Setup

This document describes the Cloudinary integration for handling file uploads (photos and PDFs) in the BIMS backend.

## Overview

Cloudinary is used to store uploaded files (images and PDFs) instead of local storage. This ensures files persist on Render.com and are accessible via CDN URLs.

## Configuration

### Environment Variables

Add these environment variables to your `.env` file or Render.com environment settings:

```env
CLOUDINARY_CLOUD_NAME=dysxkumbl
CLOUDINARY_API_KEY=529697741674514
CLOUDINARY_API_SECRET=AF9S5Fz4gYr-gwG5JxbmZgm69qc
```

### Required Packages

The following packages are required (already added to `package.json`):

- `cloudinary` - Cloudinary Node.js SDK
- `multer-storage-cloudinary` - Multer storage engine for Cloudinary

Install dependencies:
```bash
npm install
```

## File Structure

- `config/cloudinary.js` - Cloudinary configuration and storage setup
- `routes/uploadRoutes.js` - Upload routes using Cloudinary storage

## Upload Endpoints

### Single File Upload
- **Endpoint:** `POST /api/upload`
- **Field name:** `file`
- **Response:**
  ```json
  {
    "message": "File uploaded successfully",
    "url": "https://res.cloudinary.com/...",
    "filename": "original-filename.pdf",
    "mimetype": "application/pdf",
    "public_id": "bims-uploads/file-1234567890-123456789"
  }
  ```

### Multiple Files Upload
- **Endpoint:** `POST /api/upload/multiple`
- **Field name:** `files` (array)
- **Response:**
  ```json
  {
    "message": "Files uploaded successfully",
    "urls": [
      "https://res.cloudinary.com/...",
      "https://res.cloudinary.com/..."
    ]
  }
  ```

## Supported File Types

- **Images:** JPG, JPEG, PNG, GIF, WebP
- **Documents:** PDF

## File Storage

- Files are stored in the `bims-uploads` folder on Cloudinary
- Images are automatically optimized (max 1920x1080, auto quality)
- PDFs are stored as raw files
- Each file gets a unique public_id based on timestamp and random number

## Frontend Integration

The frontend expects:
- Single upload: `response.data.url` (string)
- Multiple upload: `response.data.urls` (array of strings)

These URLs are Cloudinary CDN URLs that can be directly used in `<img>` tags or PDF links.

## MongoDB Storage

After upload, the URLs are saved to MongoDB:
- **Listings:** `images` array contains image URLs
- **Listings:** `metadata.license_document` contains PDF URL

## Deployment on Render

1. Add the Cloudinary environment variables to your Render.com service
2. Deploy the updated code
3. Files will automatically upload to Cloudinary instead of local storage

## Testing

Test the upload endpoints:

```bash
# Single file upload
curl -X POST https://your-backend.onrender.com/api/upload \
  -F "file=@test-image.jpg"

# Multiple files upload
curl -X POST https://your-backend.onrender.com/api/upload/multiple \
  -F "files=@image1.jpg" \
  -F "files=@image2.jpg"
```

## Troubleshooting

### Upload fails
- Verify Cloudinary credentials are set correctly
- Check file size (max 10MB)
- Ensure file type is supported (images or PDFs only)

### URLs not working
- Cloudinary URLs should start with `https://res.cloudinary.com/`
- Check that files are public (default behavior)
- Verify the URL format in the response

### Files not displaying
- Ensure frontend uses the returned URL directly
- Check CORS settings if accessing from different domain
- Verify the URL is complete (includes protocol)

