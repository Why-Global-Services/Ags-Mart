const mongoose = require("mongoose");
const { v4 } = require("uuid");

const Aboutus = new mongoose.Schema({
  _id: { type: String, default: v4 },
  bannerImage: {
    type: String,
    required: false
  },
  bannerTitle: { type: String, required: false },
  bannerContent: { type: String, required: false },
  content: [{
    contentTitle: {type: String, default: null},
    contentDescription: {type: String, default: null},
    contentImage: {type: String, default: null}
  }],
},{
  timestamps: true,
  collection: "aboutUs"
});

const aboutUs = mongoose.model("aboutUs", Aboutus)

module.exports = {
  aboutUs
}