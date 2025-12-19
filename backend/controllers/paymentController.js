// controllers/paymentController.js
const Listing = require('../models/Listing');
const ContactRequest = require('../models/ContactRequest');
const { verifyPayment, getChapaPaymentDetails } = require('../services/chapaService');
const crypto = require('crypto');

// @desc    Prepare payment data for inline checkout (Listing)
// @route   POST /api/payments/prepare-listing
// @access  Private
const prepareListingPayment = async (req, res) => {
  try {
    const { listingId, listingData } = req.body;
    
    // If listingId provided, use existing listing
    let listing;
    if (listingId) {
      listing = await Listing.findById(listingId);
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }
      if (listing.paymentStatus === 'paid') {
        return res.status(400).json({ message: 'Listing already paid' });
      }
    } else if (listingData) {
      // Create draft listing with pending payment
      const tx_ref = `BIMS-listing-${crypto.randomBytes(8).toString('hex')}-${Date.now()}`;
      listing = await Listing.create({
        ...listingData,
        owner: req.user.id,
        status: 'pending',
        verificationStatus: 'pending',
        paymentStatus: 'pending',
        transactionId: tx_ref,
      });
      console.log('Created draft listing:', listing._id, 'with tx_ref:', tx_ref);
    }

    if (!listing) {
      return res.status(400).json({ message: 'Listing ID or listing data required' });
    }

    const tx_ref = listing.transactionId || `BIMS-listing-${crypto.randomBytes(8).toString('hex')}-${Date.now()}`;
    
    // Update transactionId if not set
    if (!listing.transactionId) {
      listing.transactionId = tx_ref;
      await listing.save();
    }

    const amount = 100; // Flat fee for listing creation
    


    const backendBase = (process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/$/, '');
    const callbackUrl = `${backendBase}/api/payments/webhook`;

    const userDetails = getChapaPaymentDetails(req.user);

    res.json({

      tx_ref,
      amount,
      currency: 'ETB',
      email: userDetails.email,
      first_name: userDetails.first_name,
      last_name: userDetails.last_name,
      callbackUrl,
      listingId: listing._id,
    });
  } catch (error) {
    console.error('Prepare listing payment error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Prepare payment data for inline checkout (Contact)
// @route   POST /api/payments/prepare-contact
// @access  Private
const prepareContactPayment = async (req, res) => {
  try {
    const { listingId } = req.body;
    
    if (!listingId) {
      return res.status(400).json({ message: 'Listing ID required' });
    }

    const listing = await Listing.findById(listingId).populate('assignedBroker');
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    


    // Check if contact already paid
    const existingContact = await ContactRequest.findOne({
      buyer: req.user.id,
      listing: listingId,
      status: 'paid',
    });

    if (existingContact) {
      return res.status(400).json({ message: 'Contact payment already completed' });
    }

    const tx_ref = `BIMS-contact-${crypto.randomBytes(8).toString('hex')}-${Date.now()}`;
    const amount = 50; // Flat fee for contacting broker
    


    const backendBase = (process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/$/, '');
    const callbackUrl = `${backendBase}/api/payments/webhook`;

    const userDetails = getChapaPaymentDetails(req.user);

    // Create pending contact request
    const contact = await ContactRequest.create({
      buyer: req.user.id,
      listing: listingId,
      recipient: listing.owner,
      status: 'pending',
      transactionId: tx_ref,
    });

    res.json({

      tx_ref,
      amount,
      currency: 'ETB',
      email: userDetails.email,
      first_name: userDetails.first_name,
      last_name: userDetails.last_name,
      callbackUrl,
      contactId: contact._id,
      listingId,
    });
  } catch (error) {
    console.error('Prepare contact payment error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Manually verify payment status (for testing/debugging)
// @route   POST /api/payments/verify/:tx_ref
// @access  Private (Admin)
const manuallyVerifyPayment = async (req, res) => {
  try {
    const { tx_ref } = req.params;
    
    if (!tx_ref) {
      return res.status(400).json({ message: 'Transaction reference required' });
    }

    const verification = await verifyPayment(tx_ref);
    
    if (verification && verification.status === 'success' && verification.data && verification.data.status === 'success') {
      // Process the payment same as webhook
      if (tx_ref.startsWith('BIMS-listing-')) {
        const User = require('../models/User');
        const Notification = require('../models/Notification');
        
        const listing = await Listing.findOne({ transactionId: tx_ref });
        if (listing) {
          if (listing.paymentStatus !== 'paid') {
            listing.paymentStatus = 'paid';
            await listing.save();
            
            // Notify owner
            await Notification.create({
              recipient: listing.owner,
              title: 'Listing Payment Successful',
              message: `Your listing "${listing.title}" payment was successful. It will now be sent for admin verification.`,
              type: 'success',
              relatedEntity: listing._id,
            });
            
            // Notify all admins
            const admins = await User.find({ role: 'admin' });
            for (const admin of admins) {
              await Notification.create({
                recipient: admin._id,
                title: 'New Listing Payment Completed',
                message: `Listing "${listing.title}" payment has been completed. Please review and assign a broker for verification.`,
                type: 'info',
                relatedEntity: listing._id,
              });
            }
          }
          
          return res.json({ 
            success: true, 
            message: 'Payment verified and listing updated',
            listing: {
              id: listing._id,
              title: listing.title,
              paymentStatus: listing.paymentStatus,
              verificationStatus: listing.verificationStatus
            }
          });
        } else {
          return res.status(404).json({ message: 'Listing not found for this transaction' });
        }
      }
      
      return res.json({ success: true, verification });
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment not successful or not found',
        verification 
      });
    }
  } catch (error) {
    console.error('Manual payment verification error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Chapa webhook to handle payment verification
// @route   POST /api/payments/webhook
// @access  Public
const handlePaymentWebhook = async (req, res) => {
    const { tx_ref } = req.body;
    console.log('Payment webhook received:', { tx_ref, body: req.body });
    
    if (!tx_ref) {
        return res.status(400).json({ message: 'Missing transaction reference' });
    }
    try {
        const verification = await verifyPayment(tx_ref);
        console.log('Payment verification result:', JSON.stringify(verification, null, 2));
        
        if (verification && verification.status === 'success' && verification.data && verification.data.status === 'success') {
            // Determine type based on tx_ref prefix
            if (tx_ref.startsWith('BIMS-listing-')) {
                const User = require('../models/User');
                const Notification = require('../models/Notification');
                
                const listing = await Listing.findOne({ transactionId: tx_ref });
                if (listing) {
                    console.log('Found listing for payment:', listing._id, listing.title);
                    listing.paymentStatus = 'paid';
                    // Keep status as 'pending' - it will be activated after admin verification
                    // Keep verificationStatus as 'pending' - ready for admin to assign broker
                    // No need to change verificationStatus, it's already 'pending'
                    await listing.save();
                    console.log('Listing payment status updated to paid:', listing._id);
                    
                    // Notify owner
                    await Notification.create({
                        recipient: listing.owner,
                        title: 'Listing Payment Successful',
                        message: `Your listing "${listing.title}" payment was successful. It will now be sent for admin verification.`,
                        type: 'success',
                        relatedEntity: listing._id,
                    });
                    
                    // Notify all admins about payment completion
                    const admins = await User.find({ role: 'admin' });
                    for (const admin of admins) {
                        await Notification.create({
                            recipient: admin._id,
                            title: 'New Listing Payment Completed',
                            message: `Listing "${listing.title}" payment has been completed. Please review and assign a broker for verification.`,
                            type: 'info',
                            relatedEntity: listing._id,
                        });
                    }
                } else {
                    console.error('Listing not found for tx_ref:', tx_ref);
                }
            } else if (tx_ref.startsWith('BIMS-contact-')) {
                const contact = await ContactRequest.findOne({ transactionId: tx_ref });
                if (contact) {
                    contact.status = 'paid';
                    await contact.save();
                }
            }
            // Respond to Chapa
            return res.sendStatus(200);
        } else {
            // Payment failed or not successful
            console.log('Payment verification failed or not successful:', verification);
            // Still return 200 to acknowledge receipt to Chapa, otherwise they retry
            return res.sendStatus(200);
        }
    } catch (error) {
        console.error('Payment webhook error:', error);
        // If we processed it (even if failed), return 200. 
        // Only return 500 if it's a critical server error preventing processing? 
        // Chapa retries on non-200. If code is broken, retrying won't help. 
        // Better to return 200 and log error to stop the loop, unless it's a transient network error.
        // For now, let's return 200 to stop the noise, but log heavily.
        return res.sendStatus(200); 
    }
};

const handleTestPayment = async (req, res) => {
  const { listingId, phone, otp } = req.body;

  const testCredentials = [
      { phone: '0900123456', otp: '12345' },
      { phone: '0900112233', otp: '12345' },
      { phone: '0900881111', otp: '12345' },
      { phone: '0700123456', otp: '12345' },
      { phone: '0700112233', otp: '12345' },
      { phone: '0700881111', otp: '12345' },
  ];

  const isValid = testCredentials.some(cred => cred.phone === phone && cred.otp === otp);

  if (!isValid) {
      return res.status(400).json({ message: 'Invalid test credentials' });
  }

  try {
      const listing = await Listing.findById(listingId);
      if (!listing) {
          return res.status(404).json({ message: 'Listing not found' });
      }

      if (listing.paymentStatus === 'paid') {
          return res.status(200).json({ message: 'Listing already paid' });
      }

      listing.paymentStatus = 'paid';
      await listing.save();

      const User = require('../models/User');
      const Notification = require('../models/Notification');

      // Notify owner
      await Notification.create({
          recipient: listing.owner,
          title: 'Listing Payment Successful',
          message: `Your listing "${listing.title}" payment was successful. It will now be sent for admin verification.`,
          type: 'success',
          relatedEntity: listing._id,
      });

      // Notify all admins
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
          await Notification.create({
              recipient: admin._id,
              title: 'New Listing Payment Completed',
              message: `Listing "${listing.title}" payment has been completed. Please review and assign a broker for verification.`,
              type: 'info',
              relatedEntity: listing._id,
          });
      }

      res.status(200).json({ success: true, message: 'Test payment successful, listing updated.' });

  } catch (error) {
      console.error('Test payment error:', error);
      res.status(500).json({ message: 'Server error during test payment.' });
  }
};


module.exports = { 
  handlePaymentWebhook,
  prepareListingPayment,
  prepareContactPayment,
  manuallyVerifyPayment,
  handleTestPayment,
};
