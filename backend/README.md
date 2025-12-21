# BIMS Backend API

Backend server for the Business Information Management System (BIMS) - A platform for managing business listings, brokers, and client interactions.

## 🚀 Quick Start

### Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

Server will run on `http://localhost:5000`

## 📦 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT (jsonwebtoken)
- **File Upload:** Multer + Cloudinary
- **Payment Gateway:** Chapa
- **Security:** bcryptjs for password hashing

## 🌐 Deployment

### Render.com (Recommended)

See detailed instructions in:
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Step-by-step checklist
- **[RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)** - Complete deployment guide

**Quick Deploy:**
1. Push code to GitHub
2. Create new Web Service on Render.com
3. Connect your repository
4. Add environment variables
5. Deploy!

Your backend will be live at: `https://your-app-name.onrender.com`

## 🔧 Environment Variables

Required environment variables (see `.env.example`):

```env
NODE_ENV=production
MONGO_URI_ATLAS=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CHAPA_SECRET_KEY=your_chapa_key
CHAPA_WEBHOOK_SECRET=your_webhook_secret
BACKEND_URL=https://your-backend-url.com
FRONTEND_URL=https://your-frontend-url.com
PORT=5000
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## 📁 Project Structure

```
backend/
├── config/
│   └── db.js                 # Database connection
├── controllers/              # Route controllers
├── middleware/              # Custom middleware (auth, etc.)
├── models/                  # Mongoose models
├── routes/                  # API routes
├── services/                # Business logic services
├── uploads/                 # File upload directory
├── utils/                   # Utility functions
├── .env                     # Environment variables (not in git)
├── .env.example            # Environment template
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies
├── render.yaml             # Render.com config
└── server.js               # Application entry point
```

## 🛣️ API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Listings
- `GET /api/listings` - Get all listings
- `GET /api/listings/:id` - Get single listing
- `POST /api/listings` - Create listing (auth required)
- `PUT /api/listings/:id` - Update listing (auth required)
- `DELETE /api/listings/:id` - Delete listing (auth required)

### Brokers
- `GET /api/brokers` - Get all brokers
- `GET /api/brokers/:id` - Get single broker
- `POST /api/brokers` - Create broker (admin only)

### Payments
- `POST /api/payments/initialize` - Initialize payment
- `POST /api/payments/verify` - Verify payment
- `POST /api/payments/webhook` - Chapa webhook

### Messages
- `GET /api/messages` - Get user messages
- `POST /api/messages` - Send message
- `PUT /api/messages/:id` - Mark as read

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/upload/avatar` - Upload avatar

### Analytics (Admin)
- `GET /api/analytics/dashboard` - Dashboard stats
- `GET /api/analytics/revenue` - Revenue analytics

### Public
- `GET /api/public/listings` - Public listings (no auth)
- `GET /api/public/featured` - Featured listings

### Health Check
- `GET /health` - Server health status
- `GET /` - API information

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

**Protected Routes:**
Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

**Token Expiration:** 30 days (configurable)

## 💾 Database

**MongoDB Atlas** is used for production.

**Collections:**
- `users` - User accounts
- `listings` - Business listings
- `brokers` - Broker profiles
- `messages` - User messages
- `payments` - Payment records
- `notifications` - User notifications
- `commissions` - Broker commissions
- `verificationnotes` - Listing verification notes

## 📤 File Uploads

Files are uploaded to **Cloudinary** using Multer with Cloudinary storage.

**Supported Types:**
- Images: JPG, PNG, GIF, WebP
- Documents: PDF

**Configuration:**
- Files are stored in Cloudinary's `bims-uploads` folder
- Images are automatically optimized (max 1920x1080, auto quality)
- PDFs are stored as raw files
- URLs are returned as Cloudinary CDN URLs

**Environment Variables Required:**
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

See [CLOUDINARY_SETUP.md](./CLOUDINARY_SETUP.md) for detailed setup instructions.

## 🔔 Webhooks

### Chapa Payment Webhook
- **Endpoint:** `POST /api/payments/webhook`
- **Purpose:** Receive payment confirmation from Chapa
- **Security:** Verified using `CHAPA_WEBHOOK_SECRET`

## 🧪 Testing

Test your deployment:

```bash
# Health check
curl https://your-app-name.onrender.com/health

# API info
curl https://your-app-name.onrender.com/

# Get listings
curl https://your-app-name.onrender.com/api/listings
```

## 🐛 Troubleshooting

### Server won't start
- Check environment variables are set
- Verify MongoDB connection string
- Review logs for specific errors

### Database connection failed
- Ensure MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Verify credentials in connection string
- Check network access settings

### CORS errors
- Verify `FRONTEND_URL` is set correctly
- Check CORS configuration in `server.js`

### File upload issues
- Ensure `uploads/` directory exists
- Check file size limits
- Verify file type restrictions

## 📊 Monitoring

**Render Dashboard:**
- View real-time logs
- Monitor resource usage
- Check deployment status

**Health Endpoint:**
```bash
curl https://your-app-name.onrender.com/health
```

## 🔄 Updates & Maintenance

**Auto-Deploy:**
Render automatically redeploys when you push to your connected branch.

**Manual Deploy:**
Trigger manual deploy from Render Dashboard.

**Database Backups:**
Set up automated backups in MongoDB Atlas.

## 📝 License

Private - All rights reserved

## 👥 Support

For issues or questions:
1. Check deployment guides
2. Review Render logs
3. Verify environment variables
4. Test database connection

## 🎯 Production Checklist

Before going live:
- [ ] Use strong JWT_SECRET
- [ ] Enable MongoDB Atlas backups
- [ ] Set up error logging/monitoring
- [ ] Configure CORS for production domain
- [ ] Use production Chapa keys
- [ ] Set up cloud storage for files
- [ ] Enable HTTPS (automatic on Render)
- [ ] Test all critical endpoints
- [ ] Set up database indexes
- [ ] Configure rate limiting (if needed)

---

**Happy Deploying! 🚀**
