const dotenv = require("dotenv");
dotenv.config(); // MUST be at the top

console.log("CHAPA KEY:", process.env.CHAPA_SECRET_KEY);

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const brokerRoutes = require("./routes/brokerRoutes");
const listingRoutes = require("./routes/listingRoutes");

const app = express();

// Connect Database (non-blocking)
connectDB().catch(err => {
  console.error('Failed to connect to database:', err.message);
  // Server will still run, but database operations will fail
});

// Middleware
app.use(express.json());
app.use(cors());

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check endpoint
app.get("/health", (req, res) => {
  const mongoose = require('mongoose');
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: dbStatus,
    port: process.env.PORT || 5000
  });
});

app.get("/", (req, res) => {
  res.status(200).json({
    message: "BIMS Backend API",
    version: "1.0.0",
    status: "running"
  });
});


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/brokers", brokerRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/verification-notes", require("./routes/verificationNoteRoutes"));
app.use("/api/commissions", require("./routes/commissionRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/public", require("./routes/publicRoutes"));

const PORT = process.env.PORT || 5000;

// Start the server (works for both local development and Render.com)
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Export the app for compatibility
module.exports = app;
