const express = require('express');
const router = express.Router();
const { createListing, getListings, assignBroker, verifyListing, getListingById, updateListing, deleteListing, sellListing } = require('../controllers/listingController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');

router.route('/')
    .get(optionalProtect, getListings)
    .post(protect, createListing);

router.route('/:id')
    .get(getListingById)
    .put(protect, updateListing)
    .delete(protect, deleteListing);

router.route('/:id/assign')
    .put(protect, assignBroker);

router.route('/:id/verify')
    .put(protect, verifyListing);

router.route('/:id/sell')
    .post(protect, sellListing);

module.exports = router;
