const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getBrokers, createBroker, submitBrokerRequest, getBrokerRequest, getAllBrokerRequests, updateBrokerRequestStatus } = require('../controllers/brokerController');

router.route('/').get(getBrokers).post(createBroker);
router.post('/request', protect, submitBrokerRequest);
router.get('/request/me', protect, getBrokerRequest);
router.get('/requests', protect, getAllBrokerRequests);
router.put('/requests/:id', protect, updateBrokerRequestStatus);

module.exports = router;
