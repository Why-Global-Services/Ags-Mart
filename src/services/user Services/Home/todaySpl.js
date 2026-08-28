const httpStatus = require("http-status");
const { Product } = require("../../../models/Product.model");
const ApiError = require("../../../utils/apiError");

const getTodaySpecialProducts = async () => {
  const todaySpecialProducts = await Product.find({
    isTodaySpecial: true,
    status: "active",
  })

  if (!todaySpecialProducts || todaySpecialProducts.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No today's special products found.");
  }

  return todaySpecialProducts;
};

module.exports = {
  getTodaySpecialProducts,
};