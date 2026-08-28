const mongoose = require("mongoose")
const {v4} = require("uuid")


const shippingTimeSlotSchema = new mongoose.Schema({
    _id: {
        type: String, 
        default: v4
    },
    shippingStartFrom: {
        type: String,
        enum:["today", "tomorrow", "thirdDay", "fourthDay", "fifthDay", "sixthDay", "seventhDay"]
    },
    expectedDeliveryDays: {
        type: Number
    },
    timeSlotStatus: {
        type: Boolean,
        default: false
    }
},{
    timestamps: true,
    collection: "shippingTimeSlot"
})


const shippingTimeSlot = mongoose.model("shippingTimeSlot", shippingTimeSlotSchema)


module.exports = {
    shippingTimeSlot
}