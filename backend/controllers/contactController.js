// controllers/contactController.js
const Listing = require("../models/Listing");
const ContactRequest = require("../models/ContactRequest");
const { initializePayment } = require("../services/chapaService");
const crypto = require("crypto");

// @desc Initiate payment for contacting broker
// @route POST /api/contact/:listingId/pay
// @access Private (Buyer)
const initiateContactPayment = async (req, res) => {
  const { listingId } = req.params;
  const buyerId = req.user.id;
  try {
    const listing = await Listing.findById(listingId).populate(
      "assignedBroker"
    );
    if (!listing) return res.status(404).json({ message: "Listing not found" });


    // Create a pending contact request
    const tx_ref = `BIMS-contact-${crypto
      .randomBytes(8)
      .toString("hex")}-${Date.now()}`;
    const contact = await ContactRequest.create({
      buyer: buyerId,
      listing: listingId,
      recipient: listing.owner,
      status: "pending",
      transactionId: tx_ref,
    });

    const amount = 50; // flat fee 50 ETB
    const backendBase = (
      process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`
    ).replace(/\/$/, "");
    const frontendBase = (
      process.env.FRONTEND_URL || "http://localhost:8080"
    ).replace(/\/$/, "");
    const userEmail =
      req.user && req.user.email ? req.user.email : "test@example.com";
    const fullName = req.user && req.user.fullName ? req.user.fullName : "";
    const firstName = fullName.split(" ")[0] || "Buyer";
    const lastName = fullName.split(" ").slice(1).join(" ") || "";
    const callbackUrl = `${backendBase}/api/payments/webhook`;
    const returnUrl = `${frontendBase}/contact-payment-success?contactId=${contact._id}`;

    const chapaResponse = await initializePayment({
      amount,
      currency: "ETB",
      email: userEmail,
      first_name: firstName,
      last_name: lastName,
      tx_ref,
      callback_url: callbackUrl,
      return_url: returnUrl,
    });

    if (
      chapaResponse &&
      chapaResponse.status === "success" &&
      chapaResponse.data &&
      chapaResponse.data.checkout_url
    ) {
      res.json({
        checkout_url: chapaResponse.data.checkout_url,
        contactId: contact._id,
        transactionId: tx_ref,
        amount,
      });
    } else {
      console.error("Chapa initialization failed:", chapaResponse);
      res.status(500).json({ message: "Failed to initialize Chapa payment." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc Check if buyer has paid to contact broker
// @route GET /api/contact/:listingId/status
// @access Private (Buyer)
const checkContactAccess = async (req, res) => {
  const { listingId } = req.params;
  const buyerId = req.user.id;
  try {
    const contact = await ContactRequest.findOne({
      buyer: buyerId,
      listing: listingId,
    });
    if (!contact) return res.json({ paid: false });
    res.json({ paid: contact.status === "paid" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { initiateContactPayment, checkContactAccess };
