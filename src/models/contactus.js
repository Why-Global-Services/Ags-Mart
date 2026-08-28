const mongoose = require("mongoose");
const { v4 } = require("uuid");

const Contactus = new mongoose.Schema({
  _id: { type: String, default: v4 },
  title: { type: String, required: true },
  content: { type: String, required: true },
  contactusBgImage: {type: String, required: true},
  storeAddress: {type: String, required: true},
  storePhone: {type: String, required: true},
  storeEmail: {type: String, required: true},
  storeTiming: {type: String, required: true}
},{
  timestamps: true,
  collection: "Contactus"
});

module.exports = mongoose.model("Contactus", Contactus);