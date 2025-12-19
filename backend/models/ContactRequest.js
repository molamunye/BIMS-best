// models/ContactRequest.js
const mongoose = require('mongoose');

const contactRequestSchema = new mongoose.Schema({
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    transactionId: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('ContactRequest', contactRequestSchema);
