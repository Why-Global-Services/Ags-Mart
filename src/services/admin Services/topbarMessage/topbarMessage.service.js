// controllers/topbarMessage.controller.js
const TopbarMessage = require("../../../models/topbarMessage.model");

/**
 * CREATE
 */
const createTopbarMessage = async (req) => {
  const { text, highlightText, order } = req.body;

  if (!text) {
    throw new Error("Message text is required");
  }

  const message = await TopbarMessage.create({
    text,
    highlightText,
    order,
  });

  return {
    success: true,
    message: "Topbar message created",
    data: message,
  };
};

/**
 * READ – ADMIN (all)
 */
const getAllTopbarMessages = async () => {
  const messages = await TopbarMessage.find().sort({ order: 1, createdAt: -1 });

  return {
    success: true,
    data: messages,
  };
};

/**
 * READ – USER (only active)
 */
const getActiveTopbarMessages = async () => {
  const messages = await TopbarMessage.find({ isActive: true }).sort({
    order: 1,
  });

  return {
    success: true,
    data: messages,
  };
};

/**
 * UPDATE
 */
const updateTopbarMessage = async (req) => {
  const { id } = req.params;

  const updated = await TopbarMessage.findByIdAndUpdate(
    id,
    req.body,
    { new: true }
  );

  if (!updated) {
    throw new Error("Message not found");
  }

  return {
    success: true,
    message: "Topbar message updated",
    data: updated,
  };
};

/**
 * TOGGLE ACTIVE / INACTIVE
 */
const toggleTopbarMessage = async (req) => {
  const { id } = req.params;

  const message = await TopbarMessage.findById(id);
  if (!message) throw new Error("Message not found");

  message.isActive = !message.isActive;
  await message.save();

  return {
    success: true,
    message: "Status updated",
    data: message,
  };
};

/**
 * DELETE
 */
const deleteTopbarMessage = async (req) => {
  const { id } = req.params;

  const deleted = await TopbarMessage.findByIdAndDelete(id);
  if (!deleted) throw new Error("Message not found");

  return {
    success: true,
    message: "Topbar message deleted",
  };
};

module.exports = {
  createTopbarMessage,
  getAllTopbarMessages,
  getActiveTopbarMessages,
  updateTopbarMessage,
  toggleTopbarMessage,
  deleteTopbarMessage,
};
