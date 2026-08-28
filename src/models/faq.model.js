const mongoose = require("mongoose");
const { v4 } = require("uuid");


const faqItemSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: v4
    },
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
  }, { _id: false }); // _id: false prevents automatic _id for subdocs

const faqSchema = new mongoose.Schema({
    _id:{
        type: String,
        default: v4
    },
    faq:{
        type: [faqItemSchema],
        required: true
    }
},{
    timestamps: true, 
    collection: "faq"
})


const FAQ = mongoose.model("faq", faqSchema)


module.exports = {
    FAQ
}