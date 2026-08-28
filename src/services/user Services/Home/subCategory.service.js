const { Product } = require("../../../models/Product.model");
const { subCategory } = require("../../../models/subCategory.model");
const ApiError = require("../../../utils/apiError");
const httpStatus = require("http-status");


const getSubCategory = async(req, res)=>{
    const getactivesubCategory = await subCategory.aggregate([
        {
            $match: {status: "active"}
        },
        {
            $lookup:{
                from: "Category",
                localField:"category",
                foreignField: "_id",
                as: "category"
            }
        },
        {
            $unwind: {
                path: "$category",
                preserveNullAndEmptyArrays: true
            }
        }
    ])

    if(getactivesubCategory.length == 0){
        throw new ApiError(httpStatus.NOT_FOUND, "No subcategories found")
    }

    return {success: true, message: "Sub category fetched successfully", data: getactivesubCategory}
}


const getSubCategoryBasedProducts = async(req, res)=>{
    const {subCategoryId} = req.query;

    if(!subCategoryId){
        throw new ApiError(httpStatus.BAD_REQUEST, "No subCategory Id provided")
    }

    const products = await Product.aggregate([
        {
            $match: {subcategory_id: subCategoryId}
        },
        {
            $project: {
              shipping:0,
              linkProducts:0,
              ingredients:0,
              inventory:0,
            }
        }
    ])

    return {success: true, message: "This is subCategory based products", data: products}
}


module.exports = {
    getSubCategory,
    getSubCategoryBasedProducts
}