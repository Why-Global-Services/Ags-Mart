const mongoose = require("mongoose")
const {v4} = require("uuid")


const reviewsRatingsSchema = new mongoose.Schema({
    _id:{
        type: String,
        default:v4
    },
    review: {
        type: String
    },
    rating: {
        type: Number
    },
    reviewImages: {
        type: [String]
    },
    productId: {
        type: String,
        ref: "product"
    },
    variantId: {
        type: String,
        ref: "product"
    },
    productType: {
        type: String,
        enum: ["variant", "nonVariant"],
        required: true,
      },
    userId: {
        type: String,
        ref: "users"
    }
}, {
    timestamps: true,
    collection: "reviewsRatings"
})

const reviewsRatings = mongoose.model("reviewsRatings", reviewsRatingsSchema)

module.exports = {
    reviewsRatings
}