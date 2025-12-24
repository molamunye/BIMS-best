const Listing = require("../models/Listing");
const User = require("../models/User");
const Notification = require("../models/Notification");
const Commission = require("../models/Commission");
const crypto = require("crypto");
const {
  initializePayment,
  getChapaPaymentDetails,
  verifyChapaTransaction,
} = require("../services/chapaService");

const backendBase = (
  process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`
).replace(/\/$/, "");
const frontendBase = (
  process.env.FRONTEND_URL || "http://localhost:8080"
).replace(/\/$/, "");

// @desc    Create a new listing
// @route   POST /api/listings
// @access  Private (Client)
const createListing = async (req, res) => {
  try {
    const { title, description, price, location, type, metadata, images } =
      req.body;

    // Create listing with pending payment status and a tx_ref
    const tx_ref = `BIMS-listing-${crypto
      .randomBytes(8)
      .toString("hex")}-${Date.now()}`;
    const listing = await Listing.create({
      title,
      description,
      price,
      location,
      type,
      metadata,
      images,
      owner: req.user.id || req.body.ownerId,
      status: "pending",
      verificationStatus: "pending",
      paymentStatus: "pending",
      transactionId: tx_ref,
    });

    console.log('[DEBUG] Created listing:', listing._id);
    console.log('[DEBUG] Metadata saved:', listing.metadata);
    console.log('[DEBUG] Images saved:', listing.images);

    // Notify all admins about new listing creation
    try {
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await Notification.create({
          recipient: admin._id,
          title: 'New Listing Created',
          message: `A new listing "${title}" has been created and is awaiting payment/verification.`,
          type: 'info',
          relatedEntity: listing._id,
        });
      }
    } catch (notifyError) {
      console.error('Failed to notify admins about new listing:', notifyError);
    }

    // Initialize payment after creating listing so we can include listing id in return_url
    const userDetails = getChapaPaymentDetails(req.user);
    // Per your plan, using a flat fee for testing.
    // IMPORTANT: Do not use the property price for the listing fee.
    const amount = 100; // Test amount: 100 ETB
    const callbackUrl = `${backendBase}/api/payments/webhook`;
    const returnUrl = `${frontendBase}/listing-payment-success?listingId=${listing._id}`;

    const chapaResponse = await initializePayment({
      amount,
      ...userDetails,
      tx_ref,
      callback_url: callbackUrl,
      return_url: returnUrl,
    });

    // Return checkout URL and listing ID so frontend can redirect
    if (
      chapaResponse &&
      chapaResponse.status === "success" &&
      chapaResponse.data &&
      chapaResponse.data.checkout_url
    ) {
      res.status(201).json({
        checkout_url: chapaResponse.data.checkout_url,
        listingId: listing._id,
        transactionId: tx_ref,
        amount,
      });
      console.log(`[DEV] Payment initialized for listing ${listing._id}. Transaction ID (tx_ref): ${tx_ref}`);
    } else {
      console.error("Chapa initialization failed:", chapaResponse);
      // Delete the listing if payment initialization failed
      await listing.deleteOne();
      res.status(500).json({ message: "Failed to initialize Chapa payment." });
    }
  } catch (error) {
    console.error("Error creating listing:", error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get listings
// @route   GET /api/listings
// @access  Private/Public
const getListings = async (req, res) => {
  try {
    const { status, type, verificationStatus, paymentStatus } = req.query;
    let query = {};

    if (status) query.status = status;
    if (type) query.type = type;
    if (verificationStatus) query.verificationStatus = verificationStatus;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    // Support for listing verification pending tab filter
    if (req.query.pendingVerification === 'true') {
      query.$or = [
        { verificationStatus: 'pending', paymentStatus: { $in: ['paid', 'success'] } },
        { status: 'active' }
      ];
      // Remove any conflicting top-level filters if they were passed
      delete query.verificationStatus;
      delete query.paymentStatus;
      delete query.status;
    }

    // --- Security Rule for Public Views ---
    // If the request is from a public user (not filtered by owner or a specific role),
    // then ONLY show listings that are fully paid and approved.
    const isPublicQuery = !req.query.owner && !(req.user && ['admin', 'broker'].includes(req.user.role));

    if (isPublicQuery) {
      // If a listing is approved, it should be visible regardless of specific payment status
      // Otherwise, it must be paid/success, status active, and approved.
      // Actually, let's just say: Approved + Active = Visible.
      query.verificationStatus = 'approved';
      query.status = 'active';
      console.log('Public query detected. Enforcing verificationStatus=approved and status=active.');
    }

    // For assigned listings, we should show them regardless of payment status
    // (they should already be paid if they got assigned, but don't filter them out)
    if (verificationStatus === 'assigned') {
      console.log('Admin query for assigned listings - showing all assigned listings');
    }

    console.log('Listing query:', JSON.stringify(query, null, 2));

    if (req.query.owner) {
      query.owner = req.query.owner;
      // Owner can see all their listings regardless of payment status
      // So, if paymentStatus was part of the original query, we remove it here for the owner.
      if (query.paymentStatus && req.query.owner) {
        delete query.paymentStatus;
      }
    }

    // Handle assignedBroker query parameter
    if (req.query.assignedBroker) {
      query.assignedBroker = req.query.assignedBroker;
    } else if (verificationStatus === 'assigned') {
      // If querying for assigned listings but no specific broker requested,
      // ensure we only get listings that have an assignedBroker
      query.assignedBroker = { $exists: true, $ne: null };
    }

    const listings = await Listing.find(query)
      .populate("owner", "fullName email")
      .populate("assignedBroker", "fullName email")
      .populate("verifiedBy", "fullName") // Added population
      .sort({ createdAt: -1 });

    console.log(`Found ${listings.length} listings matching query`);
    if (listings.length > 0) {
      console.log('Sample listing:', {
        id: listings[0]._id,
        title: listings[0].title,
        verificationStatus: listings[0].verificationStatus,
        paymentStatus: listings[0].paymentStatus,
        assignedBroker: listings[0].assignedBroker?._id || listings[0].assignedBroker
      });
    }

    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign broker to listing
// @route   PUT /api/listings/:id/assign
// @access  Private (Admin)
const assignBroker = async (req, res) => {
  try {
    const { brokerId } = req.body;
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    console.log(`[DEBUG] Attempting to assign broker ${brokerId} to listing ${req.params.id}`);
    console.log(`[DEBUG] Current state: status=${listing.status}, paymentStatus=${listing.paymentStatus}, verificationStatus=${listing.verificationStatus}`);

    // Allow assignment if it's paid, active, or if the requester is an admin
    const canAssign =
      ['paid', 'success'].includes(listing.paymentStatus) ||
      listing.status === 'active' ||
      (req.user && req.user.role === 'admin');

    if (!canAssign) {
      console.log('[DEBUG] Assignment blocked: criteria not met');
      return res.status(400).json({
        message: "Cannot assign broker to this listing yet. Payment must be completed first."
      });
    }

    listing.assignedBroker = brokerId;
    listing.verificationStatus = "assigned";
    await listing.save();

    console.log('Broker assigned successfully:', {
      listingId: listing._id,
      listingTitle: listing.title,
      brokerId: brokerId,
      verificationStatus: listing.verificationStatus,
      paymentStatus: listing.paymentStatus,
      assignedBroker: listing.assignedBroker
    });

    // Notify the assigned broker
    await Notification.create({
      recipient: brokerId,
      title: "New Verification Assignment",
      message: `You have been assigned to verify the listing "${listing.title}".`,
      type: "info",
      relatedEntity: listing._id,
    });

    res.json(listing);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Verify listing (Approve/Reject)
// @route   PUT /api/listings/:id/verify
// @access  Private (Broker)
const verifyListing = async (req, res) => {
  try {
    const { status, notes } = req.body; // status: 'approved' or 'rejected'
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    listing.verificationStatus = status;
    listing.verificationNotes = notes;
    listing.verifiedBy = req.user ? req.user.id : null;

    if (status === "approved") {
      listing.status = "active";
    } else if (status === "rejected") {
      listing.status = "inactive";
    }

    await listing.save();

    // Notify the client (owner)
    await Notification.create({
      recipient: listing.owner,
      title: `Listing ${status === "approved" ? "Approved" : "Rejected"}`,
      message: `Your listing "${listing.title}" has been ${status}. ${notes ? `Note: ${notes}` : ""
        }`,
      type: status === "approved" ? "success" : "error",
      relatedEntity: listing._id,
    });

    res.json(listing);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get listing by ID
// @route   GET /api/listings/:id
// @access  Public/Private
const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate("owner", "fullName email phone")
      .populate("assignedBroker", "fullName email phone");

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // If user is not the owner and listing is not paid/approved, don't show it publicly
    const isOwner = req.user && listing.owner && listing.owner._id.toString() === req.user.id;
    const isAdmin = req.user && req.user.role === 'admin';

    // Only show listing publicly if it's paid and approved (or if user is owner/admin)
    if (!isOwner && !isAdmin) {
      // Visibility rule: Must be approved AND active
      if (listing.verificationStatus !== 'approved' || listing.status !== 'active') {
        return res.status(403).json({
          message: "This listing is not available for public viewing. Verification must be completed first."
        });
      }
    }

    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a listing
// @route   PUT /api/listings/:id
// @access  Private (Owner/Admin)
const updateListing = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      location,
      type,
      status,
      images,
      metadata,
    } = req.body;
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Check ownership (or admin role)
    if (listing.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res
        .status(401)
        .json({ message: "Not authorized to update this listing" });
    }

    listing.title = title || listing.title;
    listing.description = description || listing.description;
    listing.price = price || listing.price;
    listing.location = location || listing.location;
    listing.type = type || listing.type;

    if (images) listing.images = images;
    if (metadata) listing.metadata = metadata;

    // Status can be updated here, but it will not trigger commission logic.
    if (status) listing.status = status;

    const updatedListing = await listing.save();
    res.json(updatedListing);
  } catch (error) {
    console.error("Error updating listing:", error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a listing
// @route   DELETE /api/listings/:id
// @access  Private (Owner/Admin)
const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Check ownership (or admin role)
    if (listing.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res
        .status(401)
        .json({ message: "Not authorized to delete this listing" });
    }

    if (req.user.role === "admin") {
      // Soft delete for admin: set status to inactive
      listing.status = "inactive";
      await listing.save();
      res.json({ message: "Listing disabled (soft delete)" });
    } else {
      // Hard delete for owner
      await listing.deleteOne();
      res.json({ message: "Listing removed" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark a listing as sold and create commission
// @route   POST /api/listings/:id/sell
// @access  Private (Admin/Assigned Broker)
const sellListing = async (req, res) => {
  try {
    const { buyerId } = req.body;
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Authorization: Only admin or the assigned broker can mark as sold
    if (
      req.user.role !== "admin" &&
      (!listing.assignedBroker ||
        listing.assignedBroker.toString() !== req.user.id)
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to perform this action" });
    }

    if (listing.status === "sold") {
      return res.status(400).json({ message: "Listing is already sold" });
    }

    if (!listing.assignedBroker) {
      return res.status(400).json({
        message: "Listing has no assigned broker to receive a commission.",
      });
    }

    const buyer = await User.findById(buyerId);
    if (!buyer) {
      return res.status(404).json({ message: "Buyer not found" });
    }

    // --- Commission Logic ---
    const commissionExists = await Commission.findOne({ listing: listing._id });
    if (!commissionExists) {
      const commissionRate = 0.01; // 1% commission rate as requested
      const commissionAmount = listing.price * commissionRate;

      await Commission.create({
        amount: commissionAmount,
        broker: listing.assignedBroker,
        listing: listing._id,
        seller: listing.owner,
        buyer: buyerId,
        status: "pending",
      });

      // Notify broker about the commission
      await Notification.create({
        recipient: listing.assignedBroker,
        title: "Commission Pending",
        message: `A commission of $${commissionAmount.toFixed(
          2
        )} for the sale of "${listing.title
          }" is now pending payment by the seller.`,
        type: "success",
        relatedEntity: listing._id,
      });

      // Notify seller about the payment obligation
      await Notification.create({
        recipient: listing.owner,
        title: "Action Required: Pay Commission",
        message: `Your listing "${listing.title
          }" has been marked as sold. Please pay the 1% commission of $${commissionAmount.toFixed(
            2
          )}.`,
        type: "info",
        relatedEntity: listing._id,
      });
    }

    listing.status = "sold";
    const updatedListing = await listing.save();

    res.json({
      message: "Listing marked as sold and commission generated.",
      listing: updatedListing,
    });
  } catch (error) {
    console.error("Error selling listing:", error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createListing,
  getListings,
  getListingById,
  assignBroker,
  verifyListing,
  updateListing,
  deleteListing,
  sellListing,
};
