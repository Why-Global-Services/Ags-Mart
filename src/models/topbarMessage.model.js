// models/topbarMessage.model.js
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const topbarMessageSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    text: { type: String, required: true },
    highlightText: { type: String }, // FREE SHIPPING, EASY RETURNS, etc.
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 1 },
  },
  { timestamps: true, collection: "topbarMessages" }
);

module.exports = mongoose.model("topbarMessages", topbarMessageSchema);
