// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  handlePaymentWebhook, 
  prepareListingPayment, 
  prepareContactPayment,
  manuallyVerifyPayment,
  handleTestPayment,
} = require('../controllers/paymentController');

// Chapa webhook endpoint (public)
// Note: Chapa calls this as POST. GET is added only for simple manual checks.
router.post('/webhook', handlePaymentWebhook);
router.get('/webhook', (req, res) => {
  console.log('[PAYMENTS] GET /api/payments/webhook hit - health check');
  return res.status(200).json({ message: 'Webhook endpoint is live', method: 'GET' });
});

// Prepare payment data for inline checkout (protected)
router.post('/prepare-listing', protect, prepareListingPayment);
router.post('/prepare-contact', protect, prepareContactPayment);
router.post('/test-payment', protect, handleTestPayment);

// Manual payment verification (for testing/debugging) - Admin only
router.post('/verify/:tx_ref', protect, manuallyVerifyPayment);

module.exports = router;
