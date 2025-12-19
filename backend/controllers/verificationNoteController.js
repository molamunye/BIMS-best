const VerificationNote = require("../models/VerificationNote");
const Listing = require("../models/Listing");
const User = require("../models/User");

// @desc Get verification notes
// @route GET /api/verification-notes
// @access Private (broker/admin)
const getNotes = async (req, res) => {
  try {
    // If user is broker, return their notes. Admin can pass brokerId query to view.
    const { brokerId } = req.query;
    let filter = {};

    if (req.user && req.user.role === "broker") {
      filter.broker = req.user.id;
    } else if (brokerId) {
      filter.broker = brokerId;
    }

    const notes = await VerificationNote.find(filter)
      .sort({ createdAt: -1 })
      .populate("broker", "fullName email")
      .lean();

    res.json(notes);
  } catch (error) {
    console.error("Failed to get verification notes", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc Create a verification note
// @route POST /api/verification-notes
// @access Private (broker)
const createNote = async (req, res) => {
  try {
    const { listingId, listingTitle, note } = req.body;
    if (!note)
      return res.status(400).json({ message: "Note text is required" });

    const newNote = await VerificationNote.create({
      listingId: listingId || null,
      listingTitle: listingTitle || "",
      broker: req.user.id,
      note,
    });

    const populated = await newNote
      .populate("broker", "fullName email")
      .execPopulate();
    res.status(201).json(populated);
  } catch (error) {
    console.error("Failed to create verification note", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc Delete a note
// @route DELETE /api/verification-notes/:id
// @access Private (broker/admin) - brokers may delete their own notes
const deleteNote = async (req, res) => {
  try {
    const note = await VerificationNote.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    // Allow delete if admin or the owner broker
    if (
      req.user.role !== "admin" &&
      String(note.broker) !== String(req.user.id)
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await note.deleteOne();
    res.json({ message: "Deleted" });
  } catch (error) {
    console.error("Failed to delete verification note", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { getNotes, createNote, deleteNote };
