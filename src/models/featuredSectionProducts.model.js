const mongoose = require("mongoose")
const {v4} = require("uuid")


const featuredProductsSchema =  new mongoose.Schema({
    _id:{
        type: String,
        default: v4
    },
    featuredId: {
        type: String,
        ref: "featruedSection"
    },
    productIds: {
        type: [String],
        ref: "product"
    }
},{
    timestamps: true,
    collection: "featuredProducts"
})

const featuredProducts = mongoose.model("featuredProducts", featuredProductsSchema)

module.exports = {
    featuredProducts
}