const mongoose = require('mongoose');

const brokerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    licenseNumber: {
        type: String,
        required: true,
    },
    agency: {
        type: String,
    },
    bio: {
        type: String,
    },
    metrics: {
        totalListings: { type: Number, default: 0 },
        activeListings: { type: Number, default: 0 },
        soldListings: { type: Number, default: 0 },
    }
}, {
    timestamps: true,
});

const Broker = mongoose.model('Broker', brokerSchema);

module.exports = Broker;
