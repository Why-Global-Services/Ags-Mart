const { User } = require("../models/users.model");
const Bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const ApiError = require("../utils/apiError");
const httpStatus = require("http-status");
const { wishlistSchema } = require("../models/wishlist.model");
const { Product } = require("../models/Product.model");
const { cart } = require("../models/cart.model");
const { saveLater } = require("../models/saveLater.model");
const generateOtp = require("../utils/generateOtp");
const sendmail = require("../utils/sendmail");
const { now } = require("mongoose");
const { paymentDetailsModel } = require("../models/payment.model");
const { orderDetailsModel } = require("../models/orders.model");
const { generateOrderId } = require("../utils/generateId");
const { reviewsRatings } = require("../models/reviewRating.model");
const { uploadToCloud } = require("../utils/uploadFileToS3");
const { uploads } = require("../middlwares/multer");
const { CategoryModel } = require("../models/category.model");
const { offers } = require("../models/offers.model");

/** Create JWT Token */


/** Register User */
const createUser = async (req) => {
  const { name, email, password } = req.body;

  console.log("body",req.body)

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User already exists");
  }

  console.log("existing", existing)

  const salt = await Bcrypt.genSalt(10);
  const hashedPassword = await Bcrypt.hash(password, salt);

  const userData = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  return {
    success: true,
    message: "Registered Successfully",
    userId: userData._id,
  };
};

// Login User 
const loginUser = async (req) => {
  const { email, password } = req.body;
  console.log("Request body:", req.body);

  if (!email || !password) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email and password are required");
  }

  // Find user and explicitly select password field
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email not found");
  }
console.log(user);

  // Access password field explicitly
  const userPassword = await Bcrypt.compare(password, user.password)
  console.log(userPassword);
  
  if (!userPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid password");
  }

  // Check if user is blocked
  if (user.status === 'block') {
    throw new ApiError(httpStatus.FORBIDDEN, "Your account has been blocked");
  }

  // Generate token
  const token = generateToken(user._id, "user");

  return {
    success: true,
    message: "Login successful",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  };
};

const OTPgenerator = async (req) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(400, "User Not Found, Please Sign Up first");
  }

  const makeOtp = await generateOtp(6);
  const expire = Date.now() + 60 * 1000;

  const emailSend = await sendmail.sendUserOtp({
    email: user.email,
    OTP: makeOtp,
    name: user.name,
  });

  const userData = await User.updateOne(
    { email },
    { otp: makeOtp, otpExpire: expire }
  );

  console.log(user);
  return { success: true, message: "Otp send successfully", OTP: makeOtp };
};

const Otpverify = async (req) => {
  console.log(req.body);
  const { otp, email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "user not found");
  }
  if (user.otp !== otp) {
    throw new ApiError(400, "otp not matching , please ensure otp");
  }
  console.log("hiiiiii");

  if (user.otpExpire < Date.now()) {
    throw new ApiError(
      400,
      "otp enter time finished , kindly generate otp  again "
    );
  }
  const token = generateToken(user._id, "user");
  return { success: true, message: "otp verify successfully", token };
};

const addWishlist = async (req) => {
  const { _id } = req.params;
  console.log(_id);
  const userId = req.user._id;
  console.log("UserID", userId);

  if (!userId) {
    throw new ApiError(400, "User must login first");
  }

  const findProduct = await Product.findById(_id);
  if (!findProduct) {
    throw new ApiError(404, "Product not Found");
  }

  const data = await wishlistSchema.create({
    userId,
    productId: _id,
  });

  return {
    success: true,
    message: "Product Add to Wishlist Successfully",
    data,
  };
};

const getWishlist = async (req) => {
  const userId = "b0ca14d5-e34d-46f3-b43c-7b0a78bc115e";

  if (!userId) {
    throw new ApiError(400, "User must login");
  }

  const wishlistItems = await wishlistSchema.find({ userId });

  if (!wishlistItems.length) {
    return {
      success: true,
      message: "No products in the Wishlist",
      findProducts: [],
    };
  }

  const productIds = wishlistItems.map((item) => item.productId);

  const products = await Product.find({ _id: { $in: productIds } });

  const cartItems = await cart.find({ userId });
  const cartProductIds = cartItems.map((item) => item.productId);

  const findProducts = wishlistItems.map((item) => {
    const product = products.find((p) => p._id === item.productId);

    return {
      ...item,
      product,
      alreadyInCart: cartProductIds.includes(item.productId.toString()),
    };
  });

  return {
    success: true,
    message: "Wishlist product(s) found successfully",
    findProducts,
  };
};

const removeWishlist = async (req) => {
  const userId = "b0ca14d5-e34d-46f3-b43c-7b0a78bc115e";

  if (!userId) {
    throw new ApiError(400, "user Must Login");
  }
  const { _id } = req.params;

  const findproduct = await wishlistSchema.findOneAndDelete({
    userId: userId,
    productId: _id,
  });

  if (!findproduct) {
    throw new ApiError(404, "Product not found in the Wishlist");
  }

  return {
    success: true,
    message: "Product removed from the Wishlist Successfully",
  };
};

const addToCart = async (req) => {
  const { quantity } = req.body;
  const { _id } = req.params;
  console.log(_id);
  const userId = req.user._id;
  console.log("UserID", userId);

  const findProduct = await Product.findById(_id);
  console.log(findProduct);

  if (!userId) {
    throw new ApiError(400, "User must login first");
  }

  if (!findProduct) {
    throw new ApiError(404, "Product not Found");
  }

  if (findProduct.Quantity < quantity) {
    throw new ApiError(400, "Insufficient Stock");
  }

  const existingCartItem = await cart.findOne({ userId, productId: _id });
  console.log("exist", existingCartItem);

  if (existingCartItem) {
    data = await cart.findOneAndUpdate(
      { userId, productId: _id },
      { $set: { quantity } },
      { new: true }
    );

    return {
      success: true,
      message: "Quantity Updated Successfully",
      data,
    };
  } else {
    const data = await cart.create({
      userId,
      productId: _id,
      quantity,
    });

    return {
      success: true,
      message: "Product Add to Cart Successfully",
      data,
    };
  }
};

const getCart = async (req) => {
  const userId = req.user._id;

  const findCart = await cart.aggregate([
    {
      $match: {
        userId,
      },
    },
    {
      $lookup: {
        from: "Product",
        localField: "productId",
        foreignField: "_id",
        as: "result",
      },
    },
  ]);
  if (findCart.length === 0) {
    return {
      success: true,
      message: "No products in the cart",
    };
  }

  console.log("carts", findCart);

  let total = 0;

  const calclulateTotal = findCart.map((item) => {
    const product = item.result[0];

    console.log("products", product);

    if (product && product.price) {
      total += item.quantity * product.price;
    }
  });

  // console.log("Price", price);

  return {
    success: true,
    message: "Products in the cart fetched successfully",
    findCart,
    total,
  };
};

const deleteCart = async (req) => {
  const userId = req.user._id;
  const { _id } = req.params;

  const deleteProduct = await cart.findOneAndDelete({ userId, productId: _id });

  if (!deleteProduct) {
    throw new ApiError(404, "Product not found in the cart");
  }

  return {
    success: true,
    message: "Product removed from the cart Successfully",
  };
};

// 


const getCheckout = async (req, res) => {
  const userId = req.user._id;
  const findCart = await getCart(req);

  const userAddress = await User.findById(userId);

  return {
    success: true,
    message: "Details for checkout is fetched successfully",
    cart: findCart,
    userAddress: userAddress,
  };
};

const addAddress = async (req, res) => {
  const {
    fullName,
    addressLine1,
    city,
    state,
    zipCode,
    country,
    phone,
    addressType,
    checkoutAddress,
  } = req.body;
  const userId = req.user._id;

  if (!userId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No userId provided");
  }

  if (
    !fullName ||
    !addressLine1 ||
    !city ||
    !state ||
    !zipCode ||
    !country ||
    !phone
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Provide all Details");
  }

  let userDetails = await User.findById(userId);

  if (userDetails.address.length == 0) {
    const newAddress = await User.findByIdAndUpdate(userId, {
      address: { ...req.body, id: 1 },
    });

    return { success: true, message: "New Address added", newAddress };
  }

  const newAddress = {
    fullName,
    addressLine1,
    city,
    state,
    zipCode,
    country,
    phone,
    addressType: addressType || "home",
    checkoutAddress: checkoutAddress || "billingAddress",
  };
  userDetails.address.push(newAddress);
  await userDetails.save();

  return { success: true, message: "New Address added", userDetails };
};

const getAddress = async (req, res) => {
  const userId = req.user._id;

  if (!userId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No userId provided");
  }

  const user = await User.findById(userId).select("address");

  return {
    success: true,
    message: "Fetched Address",
    address: user?.address || [],
  };
};

const updateAddress = async (req, res) => {
  const userId = req.user._id;
  const {
    _id,
    fullName,
    addressLine1,
    city,
    state,
    zipCode,
    country,
    phone,
    addressType,
    checkoutAddress,
  } = req.body;

  if (!userId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No userId provided");
  }

  if (!_id) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No address ID provided");
  }

  let userDetails = await User.findById(userId);

  userDetails.address = userDetails.address.map((item) => {
    if (item._id.toString() == _id.toString()) {
      item = {
        fullName,
        addressLine1,
        city,
        state,
        zipCode,
        country,
        phone,
        addressType,
        checkoutAddress,
      };
      return item;
    }

    return item;
  });

  userDetails.save();
  return {
    success: true,
    message: "Address updated Successfully",
    data: userDetails,
  };
};

const deleteAddress = async (req, res) => {
  const userId = req.user._id;
  const { id } = req.body;

  if (!userId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No userId provided");
  }

  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No address ID provided");
  }

  let updatedAddress = await User.findById(userId);

  const data = updatedAddress.address.filter(
    (item) => item._id.toString() !== id.toString()
  );
  console.log(data, "thsi is filter data");

  updatedAddress.address = data;

  await updatedAddress.save();

  return { success: true, message: "The address deleted", updatedAddress };
};

const placePayment = async (req, res) => {
  const userId = req.user._id;
  console.log(req.body, "this is the body");
  const data = paymentDetailsModel.create({ ...req.body, userId: userId });
  console.log(data, "this is the payement data");

  return { success: true, message: "THis is paluemt", data };
};

const placeOrder = async (req) => {
  const userId = req.user?._id;

  if (!userId) throw new ApiError(401, "Unauthorized: No user ID");

  const userCart = await cart.findOne({ userId });

  if (!userCart || !userCart.productId?.length) {
    throw new ApiError(400, "Cart is empty");
  }

  const { paymentMethod } = req.body;
  const addressId = userCart.address_id;

  if (!addressId) throw new ApiError(400, "No address selected");
  if (!paymentMethod) throw new ApiError(400, "Payment method is required");

  const user = await User.findOne(
    { _id: userId, "address._id": addressId },
    { "address.$": 1, email: 1 }
  );

  const userData = user?.address?.[0];
  if (!userData) throw new ApiError(404, "Address not found");

  const orderedUserEmail = user.email;

  // Fetch all product details at once
  const productIds = userCart.productId.map((item) => item.id);
  const adminProducts = await Product.find({
    _id: { $in: productIds },
  });
  // const offers = await offers.find({ productIds: { $in: productIds } });
  // const offerMap = {};

  // for (const offer of offers) {
  //   const discountInfo = await offers.findById(offer.offerId).select("discount");
  //   if (discountInfo) offerMap[offer.productIds] = discountInfo.discount;
  // }

  let totalAmount = 0;
  let orderItems = [];

  for (const cartItem of userCart.productId) {
    const product = Product.find(
      (p) => p._id.toString() === cartItem.id
    );
    if (!product) continue;

    const discount = offerMap[cartItem.id] || 0;
    const price = product.price * (1 - discount / 100);
    totalAmount += price * cartItem.quantitys;

    orderItems.push(cartItem.id);
  }

  const orderId = await generateOrderId.generateOrderId();

  const userOrder = await orderDetailsModel.create({
    ...req.body,
    orderId,
    userId,
    email: orderedUserEmail,
    userName: userData.userName,
    contactNumber: userData.contactNumber,
    address: addressId,
    orderDetails: {
      products: orderItems,
      totalPrice: totalAmount,
    },
    paymentMethod,
  });

  let razorpayOrder = null;

  if (paymentMethod !== "COD") {
    razorpayOrder = await razorpayInstance.orders.create({
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `REC_${orderId}`,
    });
  }

  await paymentModel.create({
    userId,
    orderId: userOrder._id,
    amount: totalAmount,
    paymentMethod,
    razorpayOrderId: razorpayOrder?.id || null,
  });

  if (paymentMethod === "COD") {
    await cartSchema.findOneAndDelete({ userId });
  }

  return {
    success: true,
    message: "order Created Successfully",
    data: {
      userOrder,
      razorpayOrder,
    },
  };
};

const getOrder = async (req, res) => {
  const userId = req.user._id;

  const fetchedOrders = await orderDetailsModel.aggregate([
    {
      $match: { userId: userId },
    },
    {
      $unwind: "$orderDetails",
    },
    {
      $lookup: {
        from: "product", // name of the collection (usually lowercase plural)
        localField: "orderDetails.products",
        foreignField: "_id",
        as: "productInfo",
      },
    },
    {
      $unwind: {
        path: "$productInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        "orderDetails.productDetails": "$productInfo",
      },
    },
    {
      $group: {
        _id: "$_id",
        orderId: { $first: "$orderId" },
        userId: { $first: "$userId" },
        totalPrice: { $first: "$totalPrice" },
        orderStatus: { $first: "$orderStatus" },
        returnStatus: { $first: "$returnStatus" },
        paymentStatus: { $first: "$paymentStatus" },
        paymentMethod: { $first: "$paymentMethod" },
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
        reason: { $first: "$reason" },
        returnImage: { $first: "$returnImage" },
        orderDetails: { $push: "$orderDetails" },
      },
    },
  ]);

  if (fetchedOrders.length == 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No orders found");
  }

  return { success: true, message: "Fetched orders", data: fetchedOrders };
};

const getSingleOrders = async (req) => {
  const { _id } = req.params;
  const userId = req.user._id;

  console.log("user", userId);

  if (!userId) {
    throw new ApiError(401, "UnAuthorized User");
  }

  console.log("_id", _id);

  const findOrder = await orderDetailsModel.aggregate([
    {
      $match: {
        userId: userId,
        orderId: _id,
      },
    },
    {
      $unwind: "$orderDetails",
    },
    {
      $lookup: {
        from: "products",
        localField: "orderDetails.products",
        foreignField: "_id",
        as: "orderDetails.products",
      },
    },
  ]);

  console.log("orders", findOrder);

  if (findOrder.length === 0) {
    throw new ApiError(404, "No order is found");
  }

  return {
    success: true,
    message: "Product find Successfully",
    data: findOrder,
  };
};

const editOrders = async (req) => {
  const { _id } = req.params;
  const userId = req.user._id;
  const { status, reason } = req.body;
  const image = req.file;

  const findOrder = await orderDetailsModel.findOne({
    userId,
    orderId: _id,
  });

  if (!findOrder) {
    throw new ApiError(404, "Order not found");
  }

  let updateFields = { orderStatus: status, reason };

  if (status === "Return Request") {
    if (!image) {
      throw new ApiError(400, "Return image is required");
    }

    const imageURL = await uploadToCloud(image, "ReturnOrder");
    updateFields.returnImage = imageURL;
  }

  const updateOrder = await orderDetailsModel.findOneAndUpdate(
    { userId, orderId: _id },
    updateFields,
    { new: true }
  );

  return {
    success: true,
    message: "Order status updated successfully",
    data: updateOrder,
  };
};

const addReviewRating = async (req, res) => {
  const { review, rating, existingImageUrls } = req.body;
  const reviewImages = req.files || [];
  const userId = req.user._id;
  const { productId, variantId } = req.query;

  console.log(req.body);

  let existingUrls = [];
if (req.body.existingImageUrls) {
  try {
    existingUrls = JSON.parse(req.body.existingImageUrls);
  } catch (err) {
    existingUrls = [req.body.existingImageUrls]; // fallback
  }
}

  if (!userId || !productId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `${productId ? "No userId provided" : "No productId provided"}`
    );
  }

  const product = await Product.findById(productId)
  const productType = product.productType

  const reviewRating = await reviewsRatings.findOne({userId, variantId})

  let uploadedUrls = [];

  if(reviewRating){
    const data = {...req.body, reviewImages: existingUrls, productType}
    if(req.files.length > 0){
      try {
        uploadedUrls = await Promise.all(
          reviewImages.map((img) => uploadToCloud(img, "Review"))
        );
      } catch (err) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Image upload failed");
      }
      data.reviewImages = [...(existingUrls || []), ...uploadedUrls]
    }
    
    const updatedReviewRating = await reviewsRatings.findOneAndUpdate({userId, variantId}, {$set: data}, {new: true})
    return {
      success: true,
      message: "Review and Rating updated",
      updatedReviewRating,
    };
  }
  try {
    uploadedUrls = await Promise.all(
      reviewImages.map((img) => uploadToCloud(img, "Review"))
    );
  } catch (err) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Image upload failed");
  }

  const createdReviewRating = await reviewsRatings.create({
    ...req.body,
    userId: userId,
    productId,
    variantId,
    productType,
    reviewImages: uploadedUrls,
  });

  return {
    success: true,
    message: "Review and Rating added",
    createdReviewRating,
  };
};

const getUserReviewRating = async (req, res) => {
  try {
    const { variantId } = req.query;
    const userId = req.user._id;

    if (!userId) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "User not authenticated");
    }

    if (!variantId) {
      throw new ApiError(httpStatus.BAD_REQUEST, "variantId is required");
    }

    const result = await reviewsRatings.aggregate([
      // Step 1: Match reviews by this user AND this variant
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          variantId: variantId ? new mongoose.Types.ObjectId(variantId) : null,
        },
      },

      // Step 2: Lookup the product to get productName, images, etc.
      {
        $lookup: {
          from: "products", // Make sure this is your actual collection name
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },

      // Step 3: Add variant details (if needed for display)
      {
        $addFields: {
          variantDetails: {
            $cond: {
              if: { $eq: ["$product.productType", "variation"] },
              then: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$product.variant", // Fixed: was "varient"
                      as: "v",
                      cond: { $eq: ["$$v._id", new mongoose.Types.ObjectId(variantId)] },
                    },
                  },
                  0,
                ],
              },
              else: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$product.nonVariant",
                      as: "nv",
                      cond: { $eq: ["$$nv._id", new mongoose.Types.ObjectId(variantId)] },
                    },
                  },
                  0,
                ],
              },
            },
          },
        },
      },

      // Step 4: Final projection
      {
        $project: {
          _id: 1,
          rating: 1,
          review: 1,
          reviewImages: 1,
          createdAt: 1,
          productName: "$product.productName",
          productImage: { $arrayElemAt: ["$product.productImages", 0] },
          variantDetails: 1,
        },
      },
    ]);

    // If no review found for this variant
    if (result.length === 0) {
      return {
        success: true,
        message: "No review found for this product variant",
        productReview: [],
      };
    }

    return {
      success: true,
      message: "Review fetched successfully",
      productReview: result, // array with one item usually
    };
  } catch (error) {
    console.error("Error fetching user review:", error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to fetch review");
  }
};

const getReviewRatingBasedOnProduct = async (req, res) => {
  const { variantId } = req.query;
  const userId = req.user._id

  if (!variantId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No variantId provided");
  }

  const productReview = await reviewsRatings.aggregate([
    {
      $match: {userId: userId, variantId: variantId}
    },
    {
      $lookup: {
        from: "product",
        localField: "productId",
        foreignField: "_id",
        as: "product"
      }
    },{
      $unwind: {
        path: "$product",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $addFields: {
        selectedVariant: {
          $cond: {
            if: { $eq: ["$productType", "variation"] },
            then: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: "$product.varient",   // array to filter
                    as: "itemVar",               // alias used *inside* cond
                    cond: {
                      $eq: [
                        { $toString: "$$itemVar._id" },
                        "$variantId"
                      ]
                    }
                  }
                },
                0
              ]
            },
            else: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: "$product.nonVarient",
                    as: "itemNv",
                    cond: {
                      $eq: [
                        { $toString: "$$itemNv._id" },
                        "$variantId"
                      ]
                    }
                  }
                },
                0
              ]
            }
          }
        }
      }
    },{
      $project: {
        selectedVariant:1,
        userId:1,
        "product.productImage":1,
        rating:1,
        review:1,
        reviewImages:1
      }
    }
  ]);

  if (!productReview) {
    throw new ApiError(httpStatus.NOT_FOUND, "No Reviews or ratings");
  }

  return { success: true, message: "Fetched product Review", productReview };
};

module.exports = {
  createUser,
  loginUser,
  Otpverify,
  addWishlist,
  getCheckout,
  addAddress,
  getAddress,
  updateAddress,
  deleteAddress,
  placePayment,
  placeOrder,
  getOrder,
  getSingleOrders,
  editOrders,
  addReviewRating,
  getUserReviewRating,
  getReviewRatingBasedOnProduct,
};
