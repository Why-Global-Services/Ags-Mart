const mongoose = require("mongoose");
const { v4 } = require("uuid");

const CategorySchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      default: v4,
    },
    categoryImage: {
      type: String,
      required: true,
    },
    categoryTitle: {
      type: String,
      required: true,
    },
    categoryDescription: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
    collection: "Category",
  }
);

const CategoryModel = mongoose.model("Category", CategorySchema);

module.exports = {
  CategoryModel,
};
