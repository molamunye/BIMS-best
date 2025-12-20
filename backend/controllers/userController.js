const User = require("../models/User");
const Listing = require("../models/Listing");
const Message = require("../models/Message");
const Broker = require("../models/Broker");
const BrokerRequest = require("../models/BrokerRequest");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure Multer for Avatar Uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "uploads/avatars";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `user-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2000000 }, // 2MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("avatar");

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.fullName = req.body.fullName || user.fullName;
      user.bio = req.body.bio || user.bio;
      user.phone = req.body.phone || user.phone;
      user.location = req.body.location || user.location;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        phone: updatedUser.phone,
        location: updatedUser.location,
        settings: updatedUser.settings,
        token: req.token, // Might need to handle token refresh if needed, usually not for profile
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update user settings
// @route   PUT /api/users/settings
// @access  Private
const updateSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      user.settings = { ...user.settings, ...req.body };
      await user.save();
      res.json(user.settings);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Upload avatar
// @route   POST /api/users/avatar
// @access  Private
const uploadAvatar = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    } else {
      if (req.file == undefined) {
        return res.status(400).json({ message: "No file selected!" });
      } else {
        try {
          const user = await User.findById(req.user.id);
          // Construct URL - assumes server is running on localhost/domain
          // Ideally use env var for base URL
          const avatarUrl = `${req.protocol}://${req.get(
            "host"
          )}/${req.file.path.replace(/\\/g, "/")}`;

          user.avatar = avatarUrl;
          await user.save();

          res.json({
            message: "File Uploaded!",
            avatar: avatarUrl,
            user: {
              _id: user._id,
              fullName: user.fullName,
              email: user.email,
              role: user.role,
              avatar: avatarUrl,
              bio: user.bio,
              phone: user.phone,
              location: user.location,
              settings: user.settings
            }
          });
        } catch (error) {
          res.status(500).json({ message: "Server Error" });
        }
      }
    }
  });
};

// @desc    Get dashboard stats
// @route   GET /api/users/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const { role, _id: id } = req.user;
    let stats = {};

    if (role === "admin") {
      const activeListings = await Listing.countDocuments({ status: "active" });
      const totalUsers = await User.countDocuments();
      // Count users with role 'broker' who are NOT yet in the Broker collection or have some flag?
      // Actually, usually "pending brokers" means Broker documents with status pending?
      // Count pending broker requests (User role 'broker' not in Broker table logic simplified)
      // But we have a BrokerRequest model now.
      const pendingBrokers = await BrokerRequest.countDocuments({
        status: "pending",
      });

      // Unread messages for admin (if admin receives messages)
      const unreadMessages = await Message.countDocuments({
        recipient: id,
        isRead: false,
      });

      // Additional admin counts
      let totalBrokers = await Broker.countDocuments();
      // If Broker collection is empty (older deployments may store brokers as Users with role 'broker'),
      // fallback to counting Users with role 'broker'
      if (!totalBrokers) {
        try {
          const userBrokerCount = await User.countDocuments({ role: "broker" });
          if (userBrokerCount) totalBrokers = userBrokerCount;
        } catch (e) {
          console.error("Failed to fallback count broker users", e);
        }
      }
      const assignedListings = await Listing.countDocuments({
        assignedBroker: { $exists: true },
      });

      stats = {
        activeListings,
        totalUsers,
        totalBrokers,
        assignedListings,
        pendingBrokers,
        unreadMessages,
      };
    } else if (role === "broker") {
      // For brokers: Listings assigned to them
      const activeListings = await Listing.countDocuments({
        $or: [{ assignedBroker: id }, { owner: id }],
        status: "active",
      });

      // Total messages received
      const totalMessages = await Message.countDocuments({ recipient: id });

      // Unread messages
      const unreadMessages = await Message.countDocuments({
        recipient: id,
        isRead: false,
      });

      // Pending Verification Tasks (assigned to this broker, status pending/assigned)
      // Assuming tasks are listings assigned to them that are not yet approved/rejected
      const pendingTasks = await Listing.countDocuments({
        assignedBroker: id,
        verificationStatus: { $in: ["assigned", "pending"] },
      });

      // Calculate "total users" interacted with (unique senders)
      const uniqueSenders = await Message.distinct("sender", { recipient: id });

      // Commissions - Mock logic for now as we don't have a Transaction model
      // Maybe 2% of total price of "active" listings, or "sold" listings?
      // Let's count "sold" listings owner/assigned by them.
      const soldListings = await Listing.find({
        $or: [{ assignedBroker: id }, { owner: id }],
        status: "sold",
      });
      const commissionTotal = soldListings.reduce(
        (acc, curr) => acc + curr.price * 0.02,
        0
      ); // 2% commission

      const totalUsers = await User.countDocuments();
      const totalClients = await User.countDocuments({ role: "client" });

      stats = {
        activeListings,
        totalUsers: uniqueSenders.length, // Users they talked with
        // Also expose platform totals for dashboard cards
        platformTotalUsers: totalUsers,
        platformTotalClients: totalClients,

        totalMessages,
        unreadMessages,
        pendingTasks,
        commissions: commissionTotal,
        growth: 0, // advanced calc skipped for now
      };
    } else {
      // Client
      // Active listings they own
      const activeListings = await Listing.countDocuments({
        owner: id,
        status: "active",
      });
      const totalListings = await Listing.countDocuments({ owner: id });

      const totalUsers = await User.countDocuments();
      const totalClients = await User.countDocuments({ role: "client" });

      stats = {
        activeListings,
        totalListings,
        // Platform-level totals for dashboard cards - only paid and approved
        platformActiveListings: await Listing.countDocuments({
          status: "active",
          verificationStatus: "approved",
        }),
        totalUsers: totalUsers,
        totalClients: totalClients,
        unreadMessages: await Message.countDocuments({
          recipient: id,
          isRead: false,
        }),
      };
    }

    // Fetch Recent Activity
    let recentActivity = [];

    if (role === "admin") {
      const [users, listings, requests] = await Promise.all([
        User.find().sort({ createdAt: -1 }).limit(3).lean(),
        Listing.find().sort({ createdAt: -1 }).limit(3).lean(),
        BrokerRequest.find()
          .sort({ createdAt: -1 })
          .limit(3)
          .populate("userId", "fullName")
          .lean(),
      ]);

      recentActivity = [
        ...users.map((u) => ({
          type: "user",
          text: `New user registration: ${u.fullName}`,
          time: u.createdAt,
          id: u._id,
        })),
        ...listings.map((l) => ({
          type: "listing",
          text: `New listing: ${l.title}`,
          time: l.createdAt,
          id: l._id,
        })),
        ...requests.map((r) => ({
          type: "request",
          text: `New broker request: ${r.userId?.fullName || "Unknown"}`,
          time: r.createdAt,
          id: r._id,
        })),
      ]
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 5);
    } else if (role === "broker") {
      const [listings, messages] = await Promise.all([
        Listing.find({ assignedBroker: id })
          .sort({ updatedAt: -1 })
          .limit(3)
          .lean(),
        Message.find({ recipient: id })
          .sort({ createdAt: -1 })
          .limit(3)
          .populate("sender", "fullName")
          .lean(),
      ]);

      recentActivity = [
        ...listings.map((l) => ({
          type: "listing",
          text: `Listing updated: ${l.title}`,
          time: l.updatedAt,
          id: l._id,
        })),
        ...messages.map((m) => ({
          type: "message",
          text: `New message from ${m.sender?.fullName || "User"}`,
          time: m.createdAt,
          id: m._id,
        })),
      ]
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 5);
    } else {
      const [listings, messages] = await Promise.all([
        Listing.find({ owner: id }).sort({ createdAt: -1 }).limit(3).lean(),
        Message.find({ recipient: id })
          .sort({ createdAt: -1 })
          .limit(3)
          .populate("sender", "fullName")
          .lean(),
      ]);

      recentActivity = [
        ...listings.map((l) => ({
          type: "listing",
          text: `You created listing: ${l.title}`,
          time: l.createdAt,
          id: l._id,
        })),
        ...messages.map((m) => ({
          type: "message",
          text: `New message from ${m.sender?.fullName || "Broker"}`,
          time: m.createdAt,
          id: m._id,
        })),
      ]
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 5);
    }

    res.json({ ...stats, recentActivity });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update user role (Admin only)
// @route   PUT /api/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["client", "broker", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  updateProfile,
  updateSettings,
  uploadAvatar,
  getAllUsers,
  updateUserRole,
};

// Public stats for homepage
const getPublicStats = async (req, res) => {
  try {
    // Only count active listings that have been paid and approved (standard public view)
    const activeListings = await Listing.countDocuments({
      status: "active",
      verificationStatus: "approved"
    });

    // Count verified brokers (from Broker collection or User role fallback)
    let verifiedBrokers = await Broker.countDocuments();
    if (verifiedBrokers === 0) {
      verifiedBrokers = await User.countDocuments({ role: "broker" });
    }

    const happyClients = await User.countDocuments({ role: "client" });

    res.json({ activeListings, verifiedBrokers, happyClients });
  } catch (error) {
    console.error("Failed to fetch public stats", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports.getPublicStats = getPublicStats;

// @desc    Public metrics with month-over-month comparisons
// @route   GET /api/public/metrics
// @access  Public
const getPublicMetrics = async (req, res) => {
  try {
    const now = new Date();
    const day30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const day60 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Active listings overall - only count paid and approved listings
    const activeListings = await Listing.countDocuments({
      status: "active",
      verificationStatus: "approved"
    });

    // New active listings in last 30 days and previous 30-day window
    const activeLast30 = await Listing.countDocuments({
      status: "active",
      verificationStatus: "approved",
      createdAt: { $gte: day30 },
    });
    const activePrev30 = await Listing.countDocuments({
      status: "active",
      verificationStatus: "approved",
      createdAt: { $gte: day60, $lt: day30 },
    });

    const activeChangePct =
      activePrev30 === 0
        ? 0
        : Math.round(((activeLast30 - activePrev30) / activePrev30) * 100);

    // Users
    const totalUsers = await User.countDocuments();
    const totalClients = await User.countDocuments({ role: "client" });

    // Commissions: use sold listings and 2% commission model
    const soldAll = await Listing.find({ status: "sold" })
      .select("price createdAt")
      .lean();
    const commissionTotal = soldAll.reduce(
      (acc, l) => acc + (l.price || 0) * 0.02,
      0
    );

    // Commissions this month and previous month (30-day windows)
    const soldLast30 = soldAll.filter((s) => new Date(s.createdAt) >= day30);
    const soldPrev30 = soldAll.filter(
      (s) => new Date(s.createdAt) >= day60 && new Date(s.createdAt) < day30
    );
    const commissionLast30 = soldLast30.reduce(
      (acc, l) => acc + (l.price || 0) * 0.02,
      0
    );
    const commissionPrev30 = soldPrev30.reduce(
      (acc, l) => acc + (l.price || 0) * 0.02,
      0
    );

    const commissionChangePct =
      commissionPrev30 === 0
        ? 0
        : Math.round(
          ((commissionLast30 - commissionPrev30) / commissionPrev30) * 100
        );

    // Growth metric: use active listings change as growth proxy
    const growthPct = activeChangePct;

    res.json({
      activeListings,
      activeLast30,
      activePrev30,
      activeChangePct,
      totalUsers,
      totalClients,
      commissionTotal,
      commissionLast30,
      commissionPrev30,
      commissionChangePct,
      growthPct,
    });
  } catch (error) {
    console.error("Failed to fetch public metrics", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports.getPublicMetrics = getPublicMetrics;
