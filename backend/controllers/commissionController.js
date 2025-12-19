const Commission = require('../models/Commission');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { initializePayment, verifyPayment } = require('../services/chapaService');
const crypto = require('crypto');

// @desc    Get commissions for logged in user (broker or seller)
// @route   GET /api/commissions
// @access  Private
const getCommissions = async (req, res) => {
    try {
        let query;
        // Brokers see commissions where they are the broker
        if (req.user.role === 'broker') {
            query = { broker: req.user.id };
        } 
        // Clients see commissions where they are the seller
        else if (req.user.role === 'client') {
            query = { seller: req.user.id };
        } 
        // Admins see all commissions
        else if (req.user.role === 'admin') {
            query = {};
        }
        else {
            return res.status(403).json({ message: 'User role not authorized to view commissions.' });
        }

        const commissions = await Commission.find(query)
            .populate('listing', 'title price')
            .populate('broker', 'fullName email')
            .populate('seller', 'fullName email')
            .populate('buyer', 'fullName email')
            .sort({ createdAt: -1 });

        res.json(commissions);
    } catch (error) {
        console.error("Error getting commissions:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Initiate payment for a single commission
// @route   POST /api/commissions/:id/pay
// @access  Private (Seller)
const initiateCommissionPayment = async (req, res) => {
    try {
        const commission = await Commission.findById(req.params.id).populate('seller');
        
        if (!commission) {
            return res.status(404).json({ message: 'Commission not found.' });
        }

        // Authorize: ensure the user paying is the seller
        if (commission.seller._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to pay this commission.' });
        }

        if (commission.status !== 'pending') {
            return res.status(400).json({ message: `Commission status is '${commission.status}', not 'pending'.` });
        }

        const tx_ref = `BIMS-commission-${crypto.randomBytes(8).toString('hex')}-${commission._id}`;
        
        const [firstName, ...lastNameParts] = commission.seller.fullName.split(' ');
        const lastName = lastNameParts.join(' ');

        const chapaResponse = await initializePayment({
            amount: commission.amount,
            currency: 'ETB', // Assuming ETB, make this dynamic if needed
            email: commission.seller.email,
            first_name: firstName,
            last_name: lastName,
            tx_ref,
            callback_url: `${process.env.BACKEND_URL}/api/commissions/payment/webhook`,
            return_url: `${process.env.FRONTEND_URL}/client-dashboard/commissions?payment_status=success`,
        });

        if (chapaResponse && chapaResponse.status === 'success') {
            commission.transactionId = tx_ref;
            commission.status = 'in_progress';
            await commission.save();
            res.json({ checkout_url: chapaResponse.data.checkout_url });
        } else {
            console.error('Chapa initialization failed:', chapaResponse);
            res.status(500).json({ message: 'Failed to initialize Chapa payment.' });
        }

    } catch (error) {
        console.error("Commission payment initiation error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Chapa webhook to handle commission payment status
// @route   POST /api/commissions/payment/webhook
// @access  Public
const handleCommissionPaymentWebhook = async (req, res) => {
    // For security, it's best to verify the event by calling Chapa's verify endpoint
    const { tx_ref } = req.body;
    
    try {
        const verification = await verifyPayment(tx_ref);

        if (verification && verification.status === 'success' && verification.data.status === 'success') {
            const commission = await Commission.findOne({ transactionId: tx_ref });
            if (commission && commission.status !== 'paid') {
                commission.status = 'paid';
                await commission.save();

                // Notify seller of success
                await Notification.create({
                    recipient: commission.seller,
                    title: 'Commission Payment Successful',
                    message: `Your payment of $${commission.amount.toFixed(2)} for listing "${commission.listing.title}" was successful.`,
                    type: 'success',
                });

                // Notify broker of payment
                await Notification.create({
                    recipient: commission.broker,
                    title: 'Commission Received',
                    message: `The commission of $${commission.amount.toFixed(2)} for listing "${commission.listing.title}" has been paid by the seller.`,
                    type: 'success',
                });
            }
        } else {
            const commission = await Commission.findOne({ transactionId: tx_ref });
            if (commission) {
                commission.status = 'failed';
                await commission.save();
                 // Notify seller of failure
                 await Notification.create({
                    recipient: commission.seller,
                    title: 'Commission Payment Failed',
                    message: `Your payment for listing "${commission.listing.title}" failed. Please try again.`,
                    type: 'error',
                });
            }
        }
        // Respond to Chapa to acknowledge receipt
        res.sendStatus(200);
    } catch (error) {
        console.error('Commission Webhook Error:', error);
        res.sendStatus(500);
    }
};

// @desc    Request a payout for pending commissions
// @route   POST /api/commissions/payout
// @access  Private (Broker)
const requestPayout = async (req, res) => {
    try {
        const broker = await User.findById(req.user.id);
        if (!broker) {
            return res.status(404).json({ message: 'Broker not found' });
        }

        const pendingCommissions = await Commission.find({ broker: req.user.id, status: 'pending' });

        if (pendingCommissions.length === 0) {
            return res.status(400).json({ message: 'No pending commissions to pay out.' });
        }

        const totalAmount = pendingCommissions.reduce((acc, commission) => acc + commission.amount, 0);
        const tx_ref = `BIMS-payout-${crypto.randomBytes(8).toString('hex')}-${Date.now()}`;

        const [firstName, ...lastNameParts] = broker.fullName.split(' ');
        const lastName = lastNameParts.join(' ');

        const chapaResponse = await initializePayment({
            amount: totalAmount,
            currency: 'ETB',
            email: broker.email,
            first_name: firstName,
            last_name: lastName,
            tx_ref,
            callback_url: `${process.env.BACKEND_URL}/api/commissions/payout/callback`,
            return_url: `${process.env.FRONTEND_URL}/broker-dashboard`, // Or a dedicated success page
        });
        
        if (chapaResponse && chapaResponse.status === 'success') {
            await Commission.updateMany(
                { _id: { $in: pendingCommissions.map(c => c._id) } },
                { $set: { status: 'in_progress', transactionId: tx_ref } }
            );
            res.json({ checkout_url: chapaResponse.data.checkout_url });
        } else {
            res.status(500).json({ message: 'Failed to initialize Chapa payment.' });
        }

    } catch (error) {
        console.error("Payout request error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Chapa webhook to handle payment status
// @route   POST /api/commissions/payout/callback
// @access  Public
const chapaWebhook = async (req, res) => {
    // For security, you should verify the webhook signature from Chapa
    const { tx_ref, status } = req.body;

    try {
        if (status === 'success') {
            const commissions = await Commission.find({ transactionId: tx_ref });
            if (commissions.length > 0) {
                await Commission.updateMany(
                    { transactionId: tx_ref },
                    { $set: { status: 'paid' } }
                );

                const brokerId = commissions[0].broker;
                const totalAmount = commissions.reduce((acc, c) => acc + c.amount, 0);

                await Notification.create({
                    recipient: brokerId,
                    title: 'Commission Payout Successful',
                    message: `Your payout of $${totalAmount.toFixed(2)} has been successfully processed.`,
                    type: 'success',
                });
            }
        } else {
            // Handle failed or other statuses
            await Commission.updateMany(
                { transactionId: tx_ref },
                { $set: { status: 'failed' } }
            );

            const commissions = await Commission.find({ transactionId: tx_ref });
            if(commissions.length > 0){
                const brokerId = commissions[0].broker;
                await Notification.create({
                    recipient: brokerId,
                    title: 'Commission Payout Failed',
                    message: `Your payout request failed. Please contact support.`,
                    type: 'error',
                });
            }
        }
        res.sendStatus(200);
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.sendStatus(500);
    }
};


module.exports = {
    getCommissions,
    initiateCommissionPayment,
    handleCommissionPaymentWebhook,
    requestPayout,
    chapaWebhook,
};
