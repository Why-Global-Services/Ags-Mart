const { cart } = require("../../models/cart.model");
const { CategoryModel } = require("../../models/category.model");
const { storeSettings } = require("../../models/StoreSettings.model");
const { wishlistSchema } = require("../../models/wishlist.model");

const Navbar = async (req) => {
  const userId = req?.user?._id;

  let cartSize = 0;
  let WishlistSize = 0;

  if (userId) {
    try {
      const Wishlist = await wishlistSchema.find({ userId });
      const Cart = await cart.find({ userId });

      cartSize = Cart[0]?.items?.length || 0;
      WishlistSize = Wishlist[0]?.items?.length || 0;
    } catch (err) {
      console.warn("Could not fetch user cart/wishlist for navbar:", err.message);
    }
  }

  const findCategory =
    (await CategoryModel.aggregate([
      {
        $match: {
          status: "active",
        },
      },
      {
        $lookup: {
          from: "subCategory",
          localField: "_id",
          foreignField: "category",
          pipeline: [{ $match: { status: "active" } }],
          as: "subCategory",
        },
      },
      {
        $project: {
          "subCategory.subCategoryTitle": 1,
          "subCategory.subCategoryImage": 1,
          "subCategory._id": 1,
          categoryImage: 1,
          categoryTitle: 1,
          _id: 1,
        },
      },
    ])) || [];

  const findDetails = (await storeSettings.find()) || [];
  const details = findDetails.map((item) => ({
    supportEmail: item.supportEmail,
    supportNumber: item.supportNumber,
  }));

  return {
    success: true,
    message: "Navbar Data",
    data: {
      findCategory: findCategory || [],
      details: details || [],
      cartSize,
      WishlistSize,
    },
  };
};

module.exports = {
  Navbar,
};
