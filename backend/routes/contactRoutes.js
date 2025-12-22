// routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { initiateContactPayment, checkContactAccess } = require('../controllers/contactController');
const { submitContactForm } = require('../controllers/contactFormController');

// Contact form submission (public - no auth required)
router.post('/form/submit', submitContactForm);

// Initiate payment to contact broker
router.post('/:listingId/pay', protect, initiateContactPayment);

// Check if payment completed
router.get('/:listingId/status', protect, checkContactAccess);

module.exports = router;
