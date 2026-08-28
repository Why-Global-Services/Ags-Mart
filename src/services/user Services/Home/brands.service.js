const { Brand } = require("../../../models/brand.model");
const { orderDetailsModel } = require("../../../models/orders.model");

const brands = async (req) => {
  const findBestBrands = await orderDetailsModel.aggregate([
    { $unwind: "$orderDetails" },
    { $unwind: "$orderDetails.products" },

    {
      $group: {
        _id: "$orderDetails.products.productId",
        totalSold: { $sum: "$orderDetails.products.quantity" },
      },
    },
    {
      $lookup: {
        from: "product",
        localField: "_id",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    { $unwind: "$productDetails" },
    {
      $group: {
        _id: "$productDetails.productBrand",
        totalBrandSold: { $sum: "$totalSold" },
      },
    },
    {
      $lookup: {
        from: "brands",
        localField: "_id",
        foreignField: "brandName",
        as: "brandDetails",
      },
    },

    { $unwind: "$brandDetails" },

    {
      $match: {
        "brandDetails.status": "active",
      },
    },
    {
      $sort: {
        totalBrandSold: -1,
      },
    },
    {
      $project: {
        brandName: "$_id",
        totalBrandSold: 1,
        brandDetails: 1,
      },
    },
  ]);

  return {
    success: true,
    message: "brands found Successfully",
    data: findBestBrands,
  };
};

const allBrands = async (req) => {
  const getallbrands = await Brand.aggregate([
    {
      $match: {
        status: "active",
      },
    }
  ]);

  return {
    success: true,
    message: "Successfully get all brands",
    data: getallbrands,
  };
};

module.exports = {
  brands,
  allBrands,
};
