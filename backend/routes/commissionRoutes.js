const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
    getCommissions, 
    requestPayout, 
    chapaWebhook, 
    initiateCommissionPayment, 
    handleCommissionPaymentWebhook 
} = require('../controllers/commissionController');

// Existing Routes
router.route('/').get(protect, getCommissions);
router.route('/payout').post(protect, requestPayout);
router.route('/payout/callback').post(chapaWebhook);

// New Routes for Seller-side Commission Payment
router.route('/:id/pay').post(protect, initiateCommissionPayment);
router.route('/payment/webhook').post(handleCommissionPaymentWebhook);

module.exports = router;
