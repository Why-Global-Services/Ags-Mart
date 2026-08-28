const httpStatus = require("http-status");
const { CategoryModel } = require("../../../models/category.model");
const ApiError = require("../../../utils/apiError");

const category = async(req, res)=>{
    const activeCategories = await CategoryModel.aggregate([
        {
            $match: {status: "active"}
        }
    ])

    if(activeCategories.length == 0){
        return {success: true, message: "No categories found", data: activeCategories}
    }

    return {success: true, message: "Category fetched successfully", data: activeCategories}
}


module.exports = {
    category
}