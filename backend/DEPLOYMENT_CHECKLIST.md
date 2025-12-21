# Render.com Deployment Checklist

## Pre-Deployment ✅

- [ ] Code is committed to GitHub repository
- [ ] MongoDB Atlas database is set up and accessible
- [ ] MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- [ ] All environment variables are documented
- [ ] `.gitignore` is configured to exclude `.env` and `node_modules`
- [ ] `package.json` has correct start script: `"start": "node server.js"`

## Render.com Setup ✅

- [ ] Create account at https://render.com
- [ ] Click "New +" → "Web Service"
- [ ] Connect GitHub repository
- [ ] Select correct repository and branch

## Service Configuration ✅

**Basic Settings:**
- [ ] Name: `bims-backend` (or your choice)
- [ ] Region: Oregon (or closest to users)
- [ ] Branch: `main`
- [ ] Root Directory: Leave empty OR `backend` if in subdirectory
- [ ] Environment: `Node`
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`
- [ ] Instance Type: Free (or paid)

## Environment Variables ✅

Add these in Render Dashboard → Environment:

```
NODE_ENV=production
MONGO_URI_ATLAS=mongodb+srv://munyemola:Muler%4021@cluster0.rkolfwv.mongodb.net/bims2?appName=Cluster0
JWT_SECRET=a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890
CHAPA_SECRET_KEY=CHASECK_TEST-Mjm641Qj3CVKgoNuaMmdOvSeXL8cbFGn
CHAPA_WEBHOOK_SECRET=a3d4ef019aae12600012b2aeb81f718a3598acc884a888f53c30c3d9e6a7e489
BACKEND_URL=https://YOUR-APP-NAME.onrender.com
FRONTEND_URL=https://your-frontend-url.com
```

**Important:** Replace `YOUR-APP-NAME` with your actual Render service name!

## Deploy ✅

- [ ] Click "Create Web Service"
- [ ] Wait for build to complete (2-5 minutes)
- [ ] Check deployment logs for errors
- [ ] Note your backend URL: `https://YOUR-APP-NAME.onrender.com`

## Post-Deployment Testing ✅

Test these endpoints in browser or Postman:

- [ ] `https://YOUR-APP-NAME.onrender.com/` - Should return API info
- [ ] `https://YOUR-APP-NAME.onrender.com/health` - Should return status OK
- [ ] `https://YOUR-APP-NAME.onrender.com/api/listings` - Should return listings data

## Update Frontend ✅

- [ ] Update frontend API URL to: `https://YOUR-APP-NAME.onrender.com`
- [ ] Test frontend connection to backend
- [ ] Verify authentication works
- [ ] Test all major features

## Final Checks ✅

- [ ] All API endpoints responding correctly
- [ ] Database connections working
- [ ] File uploads working (or cloud storage configured)
- [ ] CORS configured for frontend domain
- [ ] Payment integration working
- [ ] Error logging set up

## Common Issues & Solutions

### Build Fails
- Check `package.json` has all dependencies
- Verify Node version compatibility
- Review build logs in Render dashboard

### Server Won't Start
- Verify all environment variables are set
- Check MongoDB connection string
- Review server logs

### 502 Bad Gateway
- Wait 30-60 seconds (free tier spin-up time)
- Check if server is listening on `process.env.PORT`
- Verify start command is correct

### Database Connection Failed
- Check MongoDB Atlas IP whitelist (should include 0.0.0.0/0)
- Verify connection string is correct
- Check database user permissions

## Notes

- **Free Tier:** Server spins down after 15 minutes of inactivity
- **First Request:** May take 30-60 seconds after spin-down
- **Logs:** Available in Render Dashboard → Your Service → Logs
- **Auto-Deploy:** Enabled by default on git push

## Your Deployment URL

After deployment, your backend will be at:
```
https://YOUR-APP-NAME.onrender.com
```

Save this URL and update it in your frontend configuration!
