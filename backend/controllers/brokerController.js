const Broker = require("../models/Broker");
const User = require("../models/User");

// @desc    Get all brokers (Users with role 'broker')
// @route   GET /api/brokers
// @access  Public
const getBrokers = async (req, res) => {
  try {
    // Fetch brokers from Broker collection (if populated) and fallback to Users with role 'broker'
    const brokerDocs = await Broker.find()
      .populate("user", "fullName email _id")
      .lean();

    const fromBrokerCollection = (brokerDocs || [])
      .filter((b) => b.user) // Safety check: ensure user exists
      .map((b) => ({
        id: String(b.user._id),
        fullName: b.user.fullName,
        email: b.user.email,
      }));

    // Also include any Users with role 'broker' who may not have a Broker profile
    const userBrokers = await User.find({ role: "broker" })
      .select("fullName email _id")
      .lean();
    const fromUsers = (userBrokers || []).map((u) => ({
      id: String(u._id),
      fullName: u.fullName,
      email: u.email,
    }));

    // Merge and dedupe by id
    const merged = [...fromBrokerCollection, ...fromUsers];
    const deduped = merged.reduce((acc, cur) => {
      if (!acc.find((a) => a.id === cur.id)) acc.push(cur);
      return acc;
    }, []);

    res.json(deduped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a broker profile
// @route   POST /api/brokers
// @access  Private (should be)
const createBroker = async (req, res) => {
  const { user, licenseNumber, agency, bio } = req.body;

  try {
    const broker = await Broker.create({
      user,
      licenseNumber,
      agency,
      bio,
    });
    res.status(201).json(broker);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const BrokerRequest = require("../models/BrokerRequest");

// @desc    Submit broker application
// @route   POST /api/brokers/request
// @access  Private
const submitBrokerRequest = async (req, res) => {
  try {
    const { businessName, licenseNumber } = req.body;

    // Check existing
    const existing = await BrokerRequest.findOne({
      userId: req.user.id,
      status: "pending",
    });
    if (existing) {
      return res.status(400).json({ message: "Request already pending" });
    }

    const request = await BrokerRequest.create({
      userId: req.user.id,
      businessName,
      licenseNumber,
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my broker application status
// @route   GET /api/brokers/request/me
// @access  Private
const getBrokerRequest = async (req, res) => {
  try {
    const request = await BrokerRequest.findOne({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all broker requests (Admin)
// @route   GET /api/brokers/requests
// @access  Private/Admin
const getAllBrokerRequests = async (req, res) => {
  try {
    const requests = await BrokerRequest.find({})
      .populate("userId", "fullName email")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update broker request status
// @route   PUT /api/brokers/requests/:id
// @access  Private/Admin
const updateBrokerRequestStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const request = await BrokerRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = status;
    request.adminNotes = adminNotes;
    await request.save();

    if (status === "approved") {
      await User.findByIdAndUpdate(request.userId, { role: "broker" });
    }

    res.json(request);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getBrokers,
  createBroker,
  submitBrokerRequest,
  getBrokerRequest,
  getAllBrokerRequests,
  updateBrokerRequestStatus,
};
