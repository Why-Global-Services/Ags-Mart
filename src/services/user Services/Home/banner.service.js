const { BannerDetailsModel } = require("../../../models/banner.model");
const ApiError = require("../../../utils/apiError");
const httpStatus = require("http-status");


const getBanner = async(placeForBanner)=>{
    const getActiveBanner = await BannerDetailsModel.aggregate([{
        $match: {
          placeForBanner: placeForBanner, status: "active"
        }
      }])

    if(getActiveBanner.length == 0){
      return {success: true, message: `No Banners found at ${placeForBanner}`, data: getActiveBanner}
    }

    return {success: true, message: "Fetched banner data successfully", data: getActiveBanner}
}


module.exports = {
    getBanner
}