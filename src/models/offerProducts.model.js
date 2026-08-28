const mongoose = require("mongoose")
const {v4} = require("uuid")


const offerProdcutSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: v4
    },
    offerId: {
        type: String,
        ref: "offers"
    },
    productIds: {
        type: [String],
        ref: "product"
    }
},{
    timestamps: true,
    collection: "offerProducts"
})


const offerProducts = mongoose.model("offerProducts", offerProdcutSchema)

module.exports = {
    offerProducts
}