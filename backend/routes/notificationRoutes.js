const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getUserNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');

router.use(protect);

router.route('/').get(getUserNotifications);
router.route('/:id/read').put(markAsRead);
router.route('/read-all').put(markAllAsRead);

module.exports = router;
