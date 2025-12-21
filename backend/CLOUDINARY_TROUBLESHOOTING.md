# Cloudinary Upload Troubleshooting Guide

If you're not seeing images and PDFs after uploading, follow these steps:

## Step 1: Check Render Logs

1. Go to your Render dashboard: https://dashboard.render.com
2. Select your backend service (`bims-bplus`)
3. Click on **"Logs"** tab
4. Try uploading an image/PDF and watch the logs

### What to Look For:

**✅ Good Signs:**
```
✓ Cloudinary configured: { cloud_name: 'dysxkumbl', api_key: '52969...' }
Processing 2 uploaded files
File 1 object keys: [ 'fieldname', 'originalname', 'encoding', 'mimetype', 'path', 'public_id', ... ]
✓ Returning file URL: https://res.cloudinary.com/dysxkumbl/image/upload/v1234567890/bims-uploads/...
```

**❌ Bad Signs:**
```
⚠️  Cloudinary configuration missing!
✗ Missing URL for file 1
Failed to get file URL from Cloudinary
```

## Step 2: Verify Environment Variables

In Render Dashboard → Your Service → Environment:

Make sure these are set **exactly** (no extra spaces, quotes, etc.):
```
CLOUDINARY_CLOUD_NAME=dysxkumbl
CLOUDINARY_API_KEY=529697741674514
CLOUDINARY_API_SECRET=AF9S5Fz4gYr-gwG5JxbmZgm69qc
```

**Important:** After adding/changing environment variables, you **MUST** redeploy:
- Click **"Manual Deploy"** → **"Deploy latest commit"**
- OR trigger a new deploy by pushing code

## Step 3: Test Upload Endpoint Directly

Use curl or Postman to test:

```bash
# Test single file upload
curl -X POST https://bims-bplus.onrender.com/api/upload \
  -F "file=@test-image.jpg" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected response:
{
  "message": "File uploaded successfully",
  "url": "https://res.cloudinary.com/dysxkumbl/image/upload/...",
  "filename": "test-image.jpg",
  "mimetype": "image/jpeg",
  "public_id": "bims-uploads/file-..."
}
```

## Step 4: Check MongoDB

Verify that URLs are being saved:

1. Connect to your MongoDB Atlas
2. Find a listing document
3. Check the `images` array - should contain Cloudinary URLs like:
   ```
   "images": [
     "https://res.cloudinary.com/dysxkumbl/image/upload/..."
   ]
   ```

## Step 5: Check Frontend Console

1. Open your frontend: https://bims-plus-app.onrender.com
2. Open browser DevTools (F12)
3. Go to **Console** tab
4. Try uploading an image
5. Look for errors or the API response

### Common Frontend Issues:

**CORS Error:**
```
Access to XMLHttpRequest blocked by CORS policy
```
→ Check backend CORS settings in `server.js`

**Network Error:**
```
Network Error
```
→ Check if backend URL is correct in `frontend/src/lib/api.ts`

**404 Not Found:**
```
POST https://bims-bplus.onrender.com/api/upload 404
```
→ Check that the route is registered in `server.js`

## Step 6: Verify Cloudinary Dashboard

1. Go to: https://console.cloudinary.com/
2. Login with your Cloudinary account
3. Go to **Media Library**
4. Check the `bims-uploads` folder
5. You should see uploaded files there

If files are in Cloudinary but not displaying:
- Check the URLs in MongoDB match Cloudinary URLs
- Verify URLs start with `https://res.cloudinary.com/`
- Check browser console for image loading errors

## Step 7: Common Issues & Fixes

### Issue: "Failed to get file URL from Cloudinary"

**Possible Causes:**
1. Environment variables not set correctly
2. Cloudinary credentials are wrong
3. Network/firewall blocking Cloudinary API

**Fix:**
- Double-check environment variables in Render
- Verify credentials in Cloudinary dashboard
- Check Render logs for specific error messages

### Issue: Files upload but URLs are wrong format

**Check:**
- URLs should start with `https://res.cloudinary.com/dysxkumbl/`
- For images: `.../image/upload/...`
- For PDFs: `.../raw/upload/...`

### Issue: Images display but PDFs don't

**Check:**
- PDF URLs should use `resource_type: 'raw'`
- Frontend should handle PDF URLs differently (download link vs image tag)

## Step 8: Enable Detailed Logging

The code now includes detailed logging. Check Render logs for:

```
Uploaded file object keys: [ ... ]
Uploaded file object: { path: '...', secure_url: '...', ... }
✓ Returning file URL: ...
```

If you see `✗ Missing URL`, check what keys are available and share with support.

## Still Not Working?

Share these details:

1. **Render Logs** - Copy the relevant log lines
2. **MongoDB Document** - Show a listing document with images array
3. **Browser Console** - Any errors when uploading/displaying
4. **Cloudinary Dashboard** - Screenshot showing files are uploaded
5. **Environment Variables** - Confirm they're set (without showing secrets)

## Quick Test Checklist

- [ ] Environment variables set in Render
- [ ] Backend redeployed after setting env vars
- [ ] Files appear in Cloudinary dashboard
- [ ] URLs saved in MongoDB
- [ ] URLs start with `https://res.cloudinary.com/`
- [ ] Frontend can access backend API
- [ ] Browser console shows no errors
- [ ] Network tab shows successful upload requests

