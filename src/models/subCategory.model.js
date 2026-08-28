const mongoose = require("mongoose");
const {v4} = require("uuid")


const subCategorySchema = new mongoose.Schema({
    _id: {
        type: String,
        default: v4,
    },
    subCategoryTitle: {
        type: String,
        required: true
    },
    subCategoryImage: {
        type:String,
        required: true
    },
    normalizedText:{
        type: String,
        required:true,
        unique: true
    },
    category: {
        type: String,
        ref: "category"
    },
    subCategoryDescription: {
        type: String
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    }
}, {
    timestamps: true,
    collection: "subCategory"
})

const subCategory = mongoose.model("subCategory", subCategorySchema)

module.exports = {
    subCategory
}