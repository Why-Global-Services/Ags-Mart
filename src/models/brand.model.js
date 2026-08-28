const mongoose = require("mongoose");
const { v4 } = require("uuid");

const BrandSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    brandImage: {
      type: String,
    },
    brandName: {
      type: String,
    },
    status:{
      type:String,
      default:"active"
    }
  },
  { timestamp: true }
);

const Brand = mongoose.model("Brand", BrandSchema);

module.exports = { Brand };
