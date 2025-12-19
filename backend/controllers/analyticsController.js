const Listing = require('../models/Listing');
const User = require('../models/User');
const Commission = require('../models/Commission');
const ContactRequest = require('../models/ContactRequest');
const Message = require('../models/Message');

// @desc    Get Admin Analytics Stats
// @route   GET /api/analytics/admin
// @access  Private (Admin)
const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ status: 'active' }); // Assuming 'status' field exists or we just count all
        
        const totalListings = await Listing.countDocuments();
        const activeListings = await Listing.countDocuments({ status: 'active' });
        
        const totalMessages = await Message.countDocuments();
        
        // Calculate total commission volume (paid)
        const paidCommissions = await Commission.find({ status: 'paid' });
        const totalCommissionRevenue = paidCommissions.reduce((acc, curr) => acc + curr.amount, 0);

        // Recent Activity (Approximated by recent listings for now)
        const recentListings = await Listing.find().sort({ createdAt: -1 }).limit(5);

        // Mock conversion rate for now as we don't track views strictly
        const conversionRate = totalListings > 0 ? ((paidCommissions.length / totalListings) * 100).toFixed(1) : 0;

        res.json({
            users: {
                total: totalUsers,
                active: activeUsers
            },
            listings: {
                total: totalListings,
                active: activeListings
            },
            messages: {
                total: totalMessages
            },
            financials: {
                totalRevenue: totalCommissionRevenue
            },
            performance: {
                conversionRate: `${conversionRate}%`
            }
        });
    } catch (error) {
        console.error("Admin Analytics Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Broker Analytics Stats
// @route   GET /api/analytics/broker
// @access  Private (Broker)
const getBrokerStats = async (req, res) => {
    try {
        const brokerId = req.user.id;

        // Listings assigned to this broker OR owned by this broker (if they act as owner too)
        // Usually, brokers verify listings. Let's count listings they are assigned to.
        const assignedListingsCount = await Listing.countDocuments({ assignedBroker: brokerId });
        const verifiedListingsCount = await Listing.countDocuments({ assignedBroker: brokerId, verificationStatus: 'approved' });

        // Commissions
        const myCommissions = await Commission.find({ broker: brokerId });
        const totalEarned = myCommissions
            .filter(c => c.status === 'paid')
            .reduce((acc, c) => acc + c.amount, 0);
        
        const pendingCommission = myCommissions
            .filter(c => c.status === 'pending')
            .reduce((acc, c) => acc + c.amount, 0);

        // Messages received
        const receivedMessages = await Message.countDocuments({ recipient: brokerId });

        res.json({
            listings: {
                assigned: assignedListingsCount,
                verified: verifiedListingsCount
            },
            financials: {
                totalEarned,
                pending: pendingCommission
            },
            messages: {
                received: receivedMessages
            }
        });

    } catch (error) {
        console.error("Broker Analytics Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get System Health/Alerts
// @route   GET /api/analytics/alerts
// @access  Private (Admin)
const getSystemAlerts = async (req, res) => {
    try {
        // logic to check system health
        // For now, we return static "Healthy" statuses but this endpoint allows expansion
        const dbStatus = "operational"; // If code runs, DB is likely up
        
        // Check for recent failed jobs or errors (mock logic or real if error logs existed in DB)
        const recentErrors = 0; 

        // Unread Admin Notifications
        const Notification = require('../models/Notification');
        const unreadNotifications = await Notification.countDocuments({ recipient: req.user.id, isRead: false });

        res.json({
            system: {
                status: dbStatus,
                uptime: process.uptime()
            },
            security: {
                threats: 0 // Placeholder
            },
            notifications: {
                unread: unreadNotifications
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getAdminStats,
    getBrokerStats,
    getSystemAlerts
};
