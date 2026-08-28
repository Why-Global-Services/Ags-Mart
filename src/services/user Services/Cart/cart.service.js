const { Product } = require("../../../models/Product.model");
const { cart } = require("../../../models/cart.model");
const ApiError = require("../../../utils/apiError");
const httpStatus = require("http-status");

const addToCart = async (req) => {
  const { quantity = 1 } = req.body;
  const { productId, variantId } = req.query;

  const userId = req.user?._id || null;
  const guestId = req.headers.guestid || req.headers["guest-id"] || null;

  console.log("GUEST ID:", guestId);

  // ❗ At least one must exist
  if (!userId && !guestId) {
    throw new ApiError(400, "User or Guest ID required");
  }

  // 🟢 Decide cart owner
  const cartQuery = userId ? { userId } : { guestId };

  // ================= PRODUCT CHECK =================
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  const { productType, variant, nonVariant } = product;
  let selectedVariant;

  if (productType === "variant") {
    const variantGroups = {
      sizeColor: variant?.sizeColorVariants,
      colorOnly: variant?.colorOnlyVariants,
      sizeOnly: variant?.sizeOnlyVariants,
    };

    selectedVariant = variantGroups[variant?.variantType]?.find(
      (v) => String(v._id) === String(variantId),
    );

    if (!selectedVariant) throw new ApiError(404, "Variant not found");
    if (selectedVariant.stockCount < quantity)
      throw new ApiError(400, "Insufficient stock");
  } else if (productType === "nonVariant") {
    if (!nonVariant) throw new ApiError(404, "Product details missing");
    if (nonVariant.stockCount < quantity)
      throw new ApiError(400, "Insufficient stock");
  } else {
    throw new ApiError(400, "Invalid product type");
  }

  // ================= CART LOGIC =================
  let userCart = await cart.findOne(cartQuery);

  if (!userCart) {
    userCart = await cart.create({
      ...cartQuery,
      items: [{ productId, variantId, productType, quantity }],
    });

    return {
      success: true,
      message: "Product added to cart",
      data: userCart,
    };
  }

  const item = userCart.items.find(
    (item) =>
      String(item.productId) === String(productId) &&
      String(item.variantId) === String(variantId),
  );

  if (item) {
    item.quantity = quantity;
  } else {
    userCart.items.push({ productId, variantId, productType, quantity });
  }

  await userCart.save();

  return {
    success: true,
    message: item ? "Cart updated" : "Product added to cart",
    data: userCart,
  };
};

const getCart = async (req) => {
  const userId = req.user?._id || null;
  const guestId = req.headers.guestid || req.headers["guest-id"] || null;

  console.log("GUEST ID:", req.headers.guestid);

  // ❗ At least one must exist
  if (!userId && !guestId) {
    throw new ApiError(400, "User or Guest ID required");
  }

  // 🟢 Decide cart owner
  const cartQuery = userId ? { userId } : { guestId };

  const cartData = await cart.aggregate([
    { $match: cartQuery },
    { $unwind: "$items" },
    {
      $lookup: {
        from: "product",
        localField: "items.productId",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },

    // ✅ Check if product is variant type
    {
      $addFields: {
        isVariantType: {
          $in: [{ $toLower: "$items.productType" }, ["variant", "varient"]],
        },
      },
    },

    // ✅ First: find the actual variant object
    {
      $addFields: {
        selectedVariantRaw: {
          $arrayElemAt: [
            {
              $filter: {
                input: {
                  $concatArrays: [
                    { $ifNull: ["$product.variant.sizeColorVariants", []] },
                    { $ifNull: ["$product.variant.colorOnlyVariants", []] },
                    { $ifNull: ["$product.variant.sizeOnlyVariants", []] },
                  ],
                },
                as: "v",
                cond: {
                  $eq: [
                    { $toString: "$$v._id" },
                    { $toString: "$items.variantId" },
                  ],
                },
              },
            },
            0,
          ],
        },
      },
    },

    // ✅ Second: decide selectedVariant (variant or nonVariant)
    {
      $addFields: {
        selectedVariant: {
          $cond: {
            if: "$isVariantType",
            then: { $ifNull: ["$selectedVariantRaw", "$product.nonVariant"] },
            else: "$product.nonVariant",
          },
        },
      },
    },

    // ✅ Third: now we can safely read color/size from selectedVariant
    {
      $addFields: {
        selectedColor: "$selectedVariant.color",
        selectedSize: "$selectedVariant.size",
      },
    },

    // ✅ Prices & images from selectedVariant
    {
      $addFields: {
        salePrice: { $ifNull: ["$selectedVariant.price.salePrice", 0] },
        costPrice: { $ifNull: ["$selectedVariant.price.costPrice", 0] },
        productImagesResolved: {
          $cond: {
            if: "$isVariantType",
            then: {
              $ifNull: [
                "$selectedVariant.variantImages",
                "$product.productImages",
              ],
            },
            else: {
              $ifNull: [
                "$product.nonVariant.nonVariantImages",
                "$product.productImages",
              ],
            },
          },
        },
      },
    },

    // compute totals per item
    {
      $addFields: {
        quantityResolved: { $ifNull: ["$items.quantity", 1] },
        discountPercentage: {
          $cond: {
            if: { $gt: ["$costPrice", 0] },
            then: {
              $multiply: [
                {
                  $divide: [
                    { $subtract: ["$costPrice", "$salePrice"] },
                    "$costPrice",
                  ],
                },
                100,
              ],
            },
            else: 0,
          },
        },
        discountAmount: { $subtract: ["$costPrice", "$salePrice"] },
      },
    },
    {
      $addFields: {
        totalItemPrice: { $multiply: ["$salePrice", "$quantityResolved"] },
        totalDiscountAmount: {
          $multiply: ["$discountAmount", "$quantityResolved"],
        },
      },
    },

    // final projection
    {
      $project: {
        _id: 0,
        productId: "$items.productId",
        variantId: "$items.variantId",
        quantity: "$quantityResolved",
        productName: "$product.productName",
        productType: "$items.productType",
        productImages: {
          $ifNull: [
            "$productImagesResolved", // variant images or nonVariant images
            { $ifNull: ["$product.productImages", []] }, // fallback → main product images
          ],
        },

        selectedVariant: 1,
        selectedColor: 1, // ✅
        selectedSize: 1, // ✅
        status: "$product.status",
        priceBreakdown: {
          costPrice: "$costPrice",
          salePrice: "$salePrice",
          discountPercentage: "$discountPercentage",
          discountAmount: "$discountAmount",
          totalItemPrice: "$totalItemPrice",
          totalDiscountAmount: "$totalDiscountAmount",
        },
      },
    },
  ]);

  if (!cartData.length) {
    return {
      success: false,
      message: "No products in the cart",
      totalPrice: 0,
      totalCostPrice: 0,
      totalDiscount: 0,
      items: [],
    };
  }

  const totalPrice = cartData.reduce((sum, item) => {
    if (item.status === "active")
      return sum + (item.priceBreakdown.totalItemPrice || 0);
    return sum;
  }, 0);

  const totalCostPrice = cartData.reduce((sum, item) => {
    if (item.status === "active")
      return sum + (item.priceBreakdown.costPrice || 0) * (item.quantity || 1);
    return sum;
  }, 0);

  const totalDiscount = cartData.reduce((sum, item) => {
    if (item.status === "active")
      return sum + (item.priceBreakdown.totalDiscountAmount || 0);
    return sum;
  }, 0);

  return {
    success: true,
    message: "Cart fetched successfully",
    totalPrice,
    totalCostPrice,
    totalDiscount,
    items: cartData.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      productName: item.productName,
      productType: item.productType,
      productImages: item.productImages || [],
      status: item.status,
      selectedColor: item.selectedColor || null, // ✅ send to frontend
      selectedSize: item.selectedSize || null, // ✅ send to frontend
      priceBreakdown: item.priceBreakdown,
    })),
  };
};


const editCart = async (req, res) => {
  const userId = req.user?._id || null;
  const guestId = req.headers.guestid || req.headers["guest-id"] || null;

  console.log("GUEST ID:", req.headers.guestid);

  // ❗ At least one must exist
  if (!userId && !guestId) {
    throw new ApiError(400, "User or Guest ID required");
  }

  // 🟢 Decide cart owner
  const cartQuery = userId ? { userId } : { guestId };
  const { variantId } = req.query;

  if (!guestId && !userId) {
    throw new ApiError(httpStatus.NOT_FOUND, "UserId or Guest Id not provided");
  }

  if (!variantId) {
    throw new ApiError(httpStatus.NOT_FOUND, "No variantId provided ");
  }

  const findcart = await cart.findOne(cartQuery);

  if (!findcart) {
    throw new ApiError(httpStatus.NOT_FOUND, "No cart found");
  }

  const items = findcart.items.filter((item) => item.variantId != variantId);

  const data = await cart.findOneAndUpdate(
    cartQuery,
    { $set: { items: items } },
    { new: true }
  );

  return { success: true, message: "Cart edited successfully", data: data };
};

const deleteCart = async (req) => {
 const userId = req.user?._id || null;
  const guestId = req.headers.guestid || req.headers["guest-id"] || null;

  console.log("GUEST ID:", req.headers.guestid);

  // ❗ At least one must exist
  if (!userId && !guestId) {
    throw new ApiError(400, "User or Guest ID required");
  }

 
  const { _id } = req.params; // ✅ use params instead of query for cleaner REST design

  if (!_id) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Cart item ID is required");
  }

  // ✅ Delete specific cart item by ID
  const deletedCartItem = await cart.findByIdAndDelete(_id);

  if (!deletedCartItem) {
    throw new ApiError(httpStatus.NOT_FOUND, "Cart item not found");
  }

  return {
    success: true,
    message: "Product removed from the cart successfully",
    data: deletedCartItem,
  };
};

const addAddressToCart = async (req, res) => {
  const { deliveryAddress, billingAddress } = req.body;
  console.log(req.body, "htsnfuw sajdnja");

  const address = {};
  if (deliveryAddress) {
    address.deliveryAddressId = deliveryAddress;
  }

  if (billingAddress) {
    address.billingAddressId = billingAddress;
  }
  const userId = req.user._id;

  const updateCartAddress = await cart.findOneAndUpdate(
    { userId: userId },
    address,
    { new: true },
  );

  return { success: true, message: "Address Updated", data: updateCartAddress };
};


const mergeCart = async (req, res) => {
  try {
    // 1️⃣ userId comes ONLY from auth middleware
    const userId = req.user?._id;

    // 2️⃣ guestId comes from frontend header
    const guestId = req.headers.guestid || req.headers["guest-id"];

    // 3️⃣ If no guestId, nothing to merge
    if (!guestId) {
      return {
        success: true,
        message: "No guest cart to merge",
      }
    }

    // 4️⃣ Fetch carts
    const guestCart = await cart.findOne({ guestId });
    const userCart = await cart.findOne({ userId });

    // 5️⃣ CASE 1: GuestCart + UserCart exists → MERGE
    if (guestCart && userCart) {
      guestCart.items.forEach((gItem) => {
        const existingItem = userCart.items.find(
          (uItem) =>
            uItem.productId.toString() === gItem.productId.toString()
        );

        if (existingItem) {
          existingItem.qty += gItem.qty;
        } else {
          userCart.items.push(gItem);
        }
      });

      await userCart.save();
      await cart.deleteOne({ guestId });
    }

    // 6️⃣ CASE 2: GuestCart exists, UserCart NOT exists → CONVERT
    else if (guestCart && !userCart) {
      guestCart.userId = userId;
      guestCart.guestId = null;
      await guestCart.save();
    }

    // 7️⃣ CASE 3: No guestCart → nothing to do

    return {
      success: true,
      message: "Cart merged successfully",
    }
  } catch (error) {
    console.error("Merge cart error:", error);
    return {
      success: false,
      message: "Cart merge failed",
    }
  }
};



module.exports = {
  addToCart,
  getCart,
  editCart,
  deleteCart,
  addAddressToCart,
  mergeCart
};
