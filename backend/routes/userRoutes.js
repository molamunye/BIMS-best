const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getDashboardStats, updateProfile, updateSettings, uploadAvatar, getAllUsers, updateUserRole } = require('../controllers/userController');

router.get('/', protect, getAllUsers); // Should be admin protected ideally
router.get('/stats', protect, getDashboardStats);
router.put('/profile', protect, updateProfile);
router.put('/settings', protect, updateSettings);
router.post('/avatar', protect, uploadAvatar);
router.put('/:id/role', protect, updateUserRole);

module.exports = router;
