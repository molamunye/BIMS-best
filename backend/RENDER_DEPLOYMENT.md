# BIMS Backend - Render.com Deployment Guide

## Prerequisites
- A Render.com account (sign up at https://render.com)
- MongoDB Atlas database (already configured)
- Your environment variables ready

## Deployment Steps

### 1. Push Your Code to GitHub
Make sure your backend code is pushed to a GitHub repository.

### 2. Create New Web Service on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the repository containing your backend code

### 3. Configure the Service

**Basic Settings:**
- **Name:** `bims-backend` (or your preferred name)
- **Region:** Choose closest to your users (e.g., Oregon)
- **Branch:** `main` (or your default branch)
- **Root Directory:** `backend` (if backend is in a subdirectory)
- **Environment:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

**Instance Type:**
- Select **Free** tier (or paid if you need better performance)

### 4. Add Environment Variables

Click **"Advanced"** and add these environment variables:

```
NODE_ENV=production
MONGO_URI_ATLAS=mongodb+srv://munyemola:Muler%4021@cluster0.rkolfwv.mongodb.net/bims2?appName=Cluster0
JWT_SECRET=a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890
CHAPA_SECRET_KEY=CHASECK_TEST-Mjm641Qj3CVKgoNuaMmdOvSeXL8cbFGn
CHAPA_WEBHOOK_SECRET=a3d4ef019aae12600012b2aeb81f718a3598acc884a888f53c30c3d9e6a7e489
BACKEND_URL=https://your-app-name.onrender.com
FRONTEND_URL=https://your-frontend-url.com
```

**Important:** 
- Replace `your-app-name` with your actual Render service name
- Replace `your-frontend-url.com` with your actual frontend URL
- The `BACKEND_URL` will be provided after deployment

### 5. Deploy

1. Click **"Create Web Service"**
2. Render will automatically build and deploy your application
3. Wait for the deployment to complete (usually 2-5 minutes)
4. Your backend will be available at: `https://your-app-name.onrender.com`

### 6. Update Frontend Configuration

After deployment, update your frontend's API URL to point to:
```
https://your-app-name.onrender.com
```

### 7. Test Your Deployment

Test these endpoints:
- `https://your-app-name.onrender.com/api/auth/test` (if you have a test route)
- `https://your-app-name.onrender.com/api/listings`

## Important Notes

### Free Tier Limitations
- **Spin down after 15 minutes of inactivity** - First request after inactivity may take 30-60 seconds
- **750 hours/month** of runtime
- Consider upgrading to paid tier for production use

### CORS Configuration
Make sure your frontend URL is properly configured in the CORS settings if you have specific CORS rules.

### File Uploads
The `uploads` folder is ephemeral on Render's free tier. For production, consider using:
- AWS S3
- Cloudinary
- Other cloud storage services

### Database Connection
- Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0) or add Render's IP addresses
- Check MongoDB Atlas → Network Access → IP Whitelist

### Monitoring
- View logs in Render Dashboard → Your Service → Logs
- Set up health check endpoint if needed

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Verify Node version compatibility
- Check build logs for specific errors

### Server Won't Start
- Verify environment variables are set correctly
- Check that `PORT` is not hardcoded (use `process.env.PORT`)
- Review startup logs

### Database Connection Issues
- Verify MongoDB Atlas connection string
- Check IP whitelist in MongoDB Atlas
- Ensure credentials are correct

### 502 Bad Gateway
- Server might be starting up (wait 30-60 seconds on free tier)
- Check logs for startup errors
- Verify the start command is correct

## Updating Your Deployment

Render automatically redeploys when you push to your connected branch:
1. Make changes to your code
2. Commit and push to GitHub
3. Render will automatically detect changes and redeploy

## Alternative: Manual Deploy with render.yaml

You can also use the included `render.yaml` file:
1. Go to Render Dashboard
2. Click **"New +"** → **"Blueprint"**
3. Connect your repository
4. Render will read the `render.yaml` configuration
5. Add environment variables as prompted

## Support

For issues:
- Check Render documentation: https://render.com/docs
- View deployment logs in Render Dashboard
- Contact Render support for platform-specific issues
