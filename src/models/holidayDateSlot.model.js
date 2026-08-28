const mongoose = require("mongoose")
const {v4} = require("uuid")


const holidayTimeSlotSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: v4
    },
    title: {
        type: String,
        required: true
    }, 
    fromDate:{
        type: Date,
        required:true
    }, 
    toDate: {
        type: Date,
        required: true
    }, 
    startDate: {
        type: Date,
        required: true
    }, 
    adminId: {
        type: String,
        ref: "Admins"
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "inactive"
    }
},{
    timestamps: true,
    collection: "hoildayDateSlot"
})


const hoildayDateSlot = mongoose.model("hoildayDateSlot", holidayTimeSlotSchema)

module.exports = {
    hoildayDateSlot
}