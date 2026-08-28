const mongoose = require("mongoose");
const { v4 } = require("uuid");

const userQueries = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const userQueriesSchema = mongoose.model("userqueries", userQueries);

module.exports = {
  userQueriesSchema,
};
