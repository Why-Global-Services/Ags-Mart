const express = require("express");
const router = express.Router();
const { uploads } = require("../../middlwares/multer");
const userController = require("../../controller/user.controller");
const { verifyToken } = require("../../middlwares/authentication");
const {
  GetTermsAndCondition,
  GetPrivacyPolicy,
  GetReturnPolicy,
  GetAdminPolicy,
  GetDeliveryPolicy,
  GetShippingPolicy,
} = require("../../controller/admin.controller");

const googleAuth = require("../../middlwares/auth.google");

const jwt = require("jsonwebtoken");
const { User } = require("../../models/users.model");
const { admin } = require("../../models/AdminUser.model");

async function optionalVerifyToken(req, res, next) {
  const tokenHeader = req.headers["authorization"];
  req.isAuthenticated = false; // Default to false

  if (!tokenHeader) return next();

  const token = tokenHeader.split(" ")[1];
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if token is expired
    if (decoded.exp * 1000 < Date.now()) {
      req.tokenError = "expired";
      return next();
    }

    const models = { user: User, Admin: admin };
    const { id, role } = decoded;
    const Model = models[role];

    if (!Model) {
      req.tokenError = "invalid_role";
      return next();
    }

    const user = await Model.findById(id).select("-password");
    if (!user) {
      req.tokenError = "user_not_found";
      return next();
    }

    req[role] = user;
    req.isAuthenticated = true; // Only set to true if everything is valid
  } catch (error) {
    console.log("Optional JWT verification failed:", error.message);
    req.tokenError = error.name === "TokenExpiredError" ? "expired" : "invalid";
  }
  next();
}

router.route("/getProfile").get( userController.fetchAdminProfile);

router.route("/wishlist").post(optionalVerifyToken, userController.addHeart);

router.route("/register").post(userController.CreateUsers);
router.route("/login").post(userController.LoginUser);
router.route("/otp").post(userController.otp);
router.route("/otpVerify").post(userController.otpVerify);
router.route("/forgot-password").post(userController.ForgotPassword);
router.route("/verify-reset-otp").post(userController.VerifyResetOtp);
router.route("/reset-password").post(userController.ResetPassword);

router
  .route("/getWishlist")
  .get(optionalVerifyToken, userController.wishlistController);
router
  .route("/updateWishlistData")
  .put(optionalVerifyToken, userController.updateWishlistData);
router
  .route("/deleteWishlist")
  .delete(verifyToken, userController.deleteWishlist);
router.route("/mergeWish").post(optionalVerifyToken, userController.wishMerge)

router.route("/cart").post(optionalVerifyToken, userController.cart);
router.route("/getCart").get(optionalVerifyToken, userController.fetchCart);
router.route("/editCartData").put(optionalVerifyToken, userController.editCartData);
router.route("/removeCart").delete(optionalVerifyToken, userController.removeCart);
router.route("/mergeCart").post(optionalVerifyToken, userController.cartMerge)

router.route("/savelater").post(verifyToken, userController.AfterUse);
router
  .route("/getSaveLaterProduct")
  .get(verifyToken, userController.getSaveLaterProductData);
router
  .route("/removeSaveLater")
  .put(verifyToken, userController.removeSaveLaterData);

router.route("/moveToCart").put(verifyToken, userController.moveToCartData);

router.route("/getCheckout").get(verifyToken, userController.getCheckout);

// Address
router.route("/addAddress").post(verifyToken, userController.addAddressData);
router.route("/getAddress").get(verifyToken, userController.getAddressData);
router
  .route("/updateAddress")
  .put(verifyToken, userController.updateAddressData);
router
  .route("/deleteAddress")
  .put(verifyToken, userController.deleteAddressData);

// Orders
router.route("/placeOrder").post(verifyToken, userController.placeOrder);
// router.route("/getOrders").get(verifyToken, userController.getOrder);
// router.route("/getOneOrders/:_id").get(verifyToken, userController.getOneOrder);
router
  .route("/editOrders/:_id")
  .put(uploads.single("returnImage"), verifyToken, userController.changeOrder);

// Payment
router.route("/placePayment").post(verifyToken, userController.placePayment);

// Reviews Ratings
router
  .route("/addEditReviewRating")
  .post(
    verifyToken,
    uploads.array("reviewImages", 10),
    userController.addReviewRating
  );
router
  .route("/getUserReviewRating")
  .get(verifyToken, userController.getUserReviewRating);
router
  .route("/getReviewRatingBasedOnProduct")
  .get(verifyToken, userController.getReviewRatingBasedOnProduct);

router.route("/getCategories").get(userController.getCategories);
router.route("/getSubCategory").get(userController.getSubCategoryData);
router.route("/getBannerData").get(userController.getBannerData);
router.route("/getCouponsData").get(userController.getCouponsData);

router.route("/search").get(userController.searchProducts);
router.route("/brands").get(userController.getbrands);
router.route("/allBrands").get(userController.fetchallBrands);

router.route("/offerProducts").get(userController.offerProducts);
router
  .route("/Products/:_id")
  .get(optionalVerifyToken, userController.fetchProduct);
router.route("/getNewProductsData").get(userController.getNewProductsData);
router
  .route("/getBestSellingProductsData")
  .get(userController.getBestSellingProductsData);

router
  .route("/verifyPayment/:orderId")
  .post(verifyToken, userController.paymentVerify);
router
  .route("/verifyStripePayment")
  .post(userController.verifyStripePaymentData);

router
  .route("/verifyPaypal")
  .post(verifyToken, userController.verifyPayPalPaymentData);

// Account
router.route("/dashboard").get(verifyToken, userController.dashboardData);
router.route("/address").post(verifyToken, userController.newAddress);
router.route("/getaddress").get(verifyToken, userController.getNewAddress);
router
  .route("/editaddress/:addressId")
  .put(verifyToken, userController.editNewAddress);
router
  .route("/deleteaddress/:addressId")
  .delete(verifyToken, userController.deleteNewAddress);

router.route("/getOrders").get(verifyToken, userController.fetchOrder);
router
  .route("/getOneOrders/:_id")
  .get(verifyToken, userController.fetchSingleOrder);
router
  .route("/editOrder/:_id")
  .put(uploads.single("returnImage"), verifyToken, userController.changeOrders);

router.route("/getDetails").get(verifyToken, userController.fetchDetails);
router.route("/editDetails").put(verifyToken, userController.changeDetails);

router.route("/getNavbar").get(optionalVerifyToken, userController.getNavbarData);
router.route("/coupon").post(verifyToken, userController.VerifyCoupon);

router
  .route("/getUserBasedCoupon")
  .get( userController.fetchCoupon);
router.route("/getCategoryBasedProduct/:_id").get(userController.Product);
router
  .route("/getSubCategoryBasedProduct/:_id")
  .get(userController.subcategoryProducts);
router
  .route("/getproductsBasedOnBrands/:_id")
  .get(userController.getproductsBasedOnBrandsData);

router.route("/filter").post(userController.filterData);
router.route("/getAboutUs").get(userController.Getaboutus);
router
  .route("/addAddressToCart")
  .post(verifyToken, userController.addAddressToCartData);
router.route("/gettermsandcondition").get(GetTermsAndCondition);

router.route("/getcontactus").get(userController.getcontactusData);
router.route("/createUserQuery").post(userController.CreateUserQuery);
router
  .route("/getHomePageAllData")
  .get(optionalVerifyToken, userController.GetHomePageDatas);

router.route("/getprivacypolicy").get(GetPrivacyPolicy);

router.route("/getreturnpolicy").get(GetReturnPolicy);
router.route("/getWebSettings").get(userController.fetchWebSetting);

router.route("/getadminpolicy").get(GetAdminPolicy);

router.route("/getshippingpolicy").get(GetShippingPolicy);

router.route("/getdeliverypolicy").get(GetDeliveryPolicy);

router.route("/google").post(googleAuth.userGoogleSignUp);

router.route("/getFAQ").get(userController.fetchFAQ);

router
  .route("/getSubCategoryBasedProducts")
  .get(userController.getSubCategoryBasedProductsData);

router.route("/createTest").post( uploads.single("imageURL") ,userController.CreateTestimonial)
router.route("/getTest").get(userController.getTestimonials)

router.route("/getActiveTopbar")
  .get(userController.getActiveTopbarsController);


  //Idgenarate
router.get("/idGenerator",userController.IDGenerator);


module.exports = router;
