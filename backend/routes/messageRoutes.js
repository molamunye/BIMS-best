const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  sendMessage,
  getMyMessages,
  markAsRead,
  deleteMessage,
} = require("../controllers/messageController");

router.use(protect);

router.route("/").post(sendMessage).get(getMyMessages);
router.route("/:id/read").put(markAsRead);
router.route("/:id").delete(deleteMessage);

module.exports = router;
