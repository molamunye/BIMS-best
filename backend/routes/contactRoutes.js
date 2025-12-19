// routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { initiateContactPayment, checkContactAccess } = require('../controllers/contactController');

// Initiate payment to contact broker
router.post('/:listingId/pay', protect, initiateContactPayment);

// Check if payment completed
router.get('/:listingId/status', protect, checkContactAccess);

module.exports = router;
