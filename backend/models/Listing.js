const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: ['property', 'vehicle'],
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'success', 'failed'],
        default: 'pending',
    },
    transactionId: {
        type: String,
    },
    images: [{
        type: String
    }],
    status: {
        type: String,
        enum: ['active', 'sold', 'pending', 'inactive'],
        default: 'pending',
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'assigned', 'approved', 'rejected'],
        default: 'pending',
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    assignedBroker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    verificationNotes: {
        type: String,
    }
}, {
    timestamps: true,
});

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;
