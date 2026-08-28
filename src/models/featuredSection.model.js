const mongoose = require("mongoose")
const {v4} = require("uuid")


const featuerdSectionSchema = new mongoose.Schema({
    _id:{
        type: String,
        default: v4
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    status: {
        type: String,
        enum:["active", "inactive"],
        default: "active"
    }
},{
    timestamps: true,
    collection: "featruedSection"
})

const featuredSection = mongoose.model("featruedSection", featuerdSectionSchema)

module.exports = {
    featuredSection
}