const { Product } = require("../../models/Product.model");

const filter = async (req, res) => {
  try {
    const brands = req.body?.brands || [];
    const minPriceRange = req.body?.minPriceRange || 1;
    const maxPriceRange = req.body?.maxPriceRange || Number.MAX_SAFE_INTEGER;
    const rating = req.body?.rating;
    const category = req.body?.category;

    // Build dynamic match query
    const matchQuery = {
      salePriceNum: { $gte: minPriceRange, $lte: maxPriceRange },
      ...(brands.length > 0 ? { productBrand: { $in: brands } } : {}),
      ...(category ? { productCategory: category } : {}),
    };

    if (rating) {
      matchQuery.rating = { $gte: rating };
    }

    const filterProducts = await Product.aggregate([
      // Lookup ratings
      {
        $lookup: {
          from: "reviewsratings",
          localField: "_id",
          foreignField: "productId",
          as: "ratings",
        },
      },
      {
        $addFields: {
          avgRating: {
            $cond: [
              { $gt: [{ $size: "$ratings" }, 0] },
              { $avg: "$ratings.rating" },
              0,
            ],
          },
        },
      },
      // Add a salePriceNum field dynamically
      {
        $addFields: {
          salePriceNum: {
            $cond: {
              if: { $eq: ["$productType", "variation"] },
              then: { $toDouble: { $first: "$varient.price.salePrice" } },
              else: { $toDouble: "$nonVariant.price.salePrice" },
            },
          },
        },
      },
      // Extract brand properly
      {
        $addFields: {
          productBrand: "$otherAttributes.brand",
          rating: "$avgRating",
        },
      },
      {
        $match: matchQuery,
      },
    ]);

    return {
      success: true,
      message: "Filtered products fetched successfully",
      data: filterProducts,
    };
  } catch (error) {
    console.error("Filter error:", error);
    return {
      success: false,
      message: "Error while filtering products",
      error: error.message,
    };
  }
};

module.exports = {
  filter,
};
