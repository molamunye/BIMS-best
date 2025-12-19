const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getNotes,
  createNote,
  deleteNote,
} = require("../controllers/verificationNoteController");

router.route("/").get(protect, getNotes).post(protect, createNote);
router.route("/:id").delete(protect, deleteNote);

module.exports = router;
