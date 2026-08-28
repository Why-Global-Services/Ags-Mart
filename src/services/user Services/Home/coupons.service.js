const httpStatus = require("http-status");
const { BannerDetailsModel } = require("../../../models/banner.model");
const { CouponModel } = require("../../../models/coupons.model");
const ApiError = require("../../../utils/apiError");



const getCoupons = async(req, res)=>{
    const getActiveCoupons = await CouponModel.aggregate([
        {
            $match: {status: "active"}
        }
    ])

    if(getActiveCoupons.length == 0){
        return {success: true, message: "No coupons found", data: getActiveCoupons}
    }

    return {success: true, message: "Fetched coupons successfully", data: getActiveCoupons}
}

module.exports = {
    getCoupons
}