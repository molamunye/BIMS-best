const express = require('express');
const router = express.Router();
const { getAdminStats, getBrokerStats, getSystemAlerts } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/admin', protect, getAdminStats);
router.get('/broker', protect, getBrokerStats);
router.get('/alerts', protect, getSystemAlerts);

module.exports = router;
