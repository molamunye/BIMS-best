const express = require("express");
const router = express.Router();
const {
  getPublicStats,
  getPublicMetrics,
} = require("../controllers/userController");

// Public stats for homepage
router.get("/stats", getPublicStats);
// Public metrics with comparisons
router.get("/metrics", getPublicMetrics);

module.exports = router;
