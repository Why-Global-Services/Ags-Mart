const httpStatus = require("http-status");
const { Product } = require("../../../models/Product.model");
const { orderDetailsModel } = require("../../../models/orders.model");
const ApiError = require("../../../utils/apiError");

const getBestSellingProducts = async () => {
  const bestSellingProducts = await orderDetailsModel.aggregate([
    // 1️⃣ Unwind orderDetails array
    {
      $unwind: "$orderDetails"
    },

    // 2️⃣ Unwind products inside orderDetails
    {
      $unwind: "$orderDetails.products"
    },

    // 3️⃣ Group by productId and SUM quantity
    {
      $group: {
        _id: "$orderDetails.products.productId",
        totalSold: {
          $sum: "$orderDetails.products.quantity"
        }
      }
    },

    // 4️⃣ Sort by quantity sold
    {
      $sort: { totalSold: -1 }
    },

    // 5️⃣ Limit top 10
    {
      $limit: 10
    },

    // 6️⃣ Lookup product details
    {
      $lookup: {
        from: "product", // ✅ correct collection
        localField: "_id", // productId (string)
        foreignField: "_id", // product _id (string UUID)
        as: "product"
      }
    },

    // 7️⃣ Unwind product array
    {
      $unwind: "$product"
    },

    // 8️⃣ Only active products
    {
      $match: {
        "product.status": "active"
      }
    }
  ]);

  return {
    success: true,
    message: "Best selling products fetched successfully",
    data: bestSellingProducts
  };
};


module.exports = {
  getBestSellingProducts,
};
