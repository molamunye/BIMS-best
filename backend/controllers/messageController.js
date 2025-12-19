const Message = require("../models/Message");
const User = require("../models/User");

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { recipientId, listingId, content } = req.body;

    const message = await Message.create({
      sender: req.user.id,
      recipient: recipientId,
      listing: listingId,
      content,
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get my messages
// @route   GET /api/messages
// @access  Private
const getMyMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { recipient: req.user.id }],
    })
      .populate("sender", "fullName")
      .populate("recipient", "fullName")
      .populate("listing", "title")
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark message as read
// @route   PUT /api/messages/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Only recipient can mark as read
    if (message.recipient.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    message.isRead = true;
    await message.save();

    res.json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Only sender, recipient or admin can delete
    const isSender = message.sender.toString() === req.user.id;
    const isRecipient = message.recipient.toString() === req.user.id;
    const isAdmin = req.user && req.user.role === "admin";

    if (!isSender && !isRecipient && !isAdmin) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // use deleteOne on the document instead of remove() which may not exist
    await message.deleteOne();

    res.json({ message: "Message deleted", id: req.params.id });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { sendMessage, getMyMessages, markAsRead, deleteMessage };
