const mongoose = require('mongoose')
const {v4} = require('uuid')

const bannerDetailsSchema = new mongoose.Schema({

    _id:{
        type: String,
        required: true,
        default: v4
    },
    bgImage: {
        type: String,
        // required: true,
        default:" "
    },
    title: {
        type: String,
        // required: true,
    },
    subtitle: {
        type: String,
        // required: true,
    },
    offer: {
        type: String,
        // required: true,
    },
    link: {
        type: String,
        required: true,
    },
    type:{
        type: String,
        // required: true,
    },
    buttonText: {
        type: String,
        // required: true,
    },
    placeForBanner:{
        type: String,
        enum: ["Top", "Middle", "Bottom"],
        required: true
    },
    position: {
        type: Boolean,
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
      },
},{
    timestamps: true,
    collection: "banner"
})

const BannerDetailsModel = mongoose.model("banner", bannerDetailsSchema)

module.exports = {
    BannerDetailsModel
}