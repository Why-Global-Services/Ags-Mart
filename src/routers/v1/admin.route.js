const express = require("express");
const AdminRouter = express.Router();
const adminController = require("../../controller/admin.controller");
const userController = require("../../controller/user.controller");
const { uploads } = require("../../middlwares/multer");
const { verifyToken } = require("../../middlwares/authentication");

// Banner
AdminRouter.route("/createUpdateBanner").post(
  uploads.single("bgImage"),
  adminController.createBanner
);
AdminRouter.route("/updateBanner").put(
  uploads.single("bgImage"),
  adminController.updateBanner
);
AdminRouter.route("/getBanner").get(adminController.getBanner);
AdminRouter.route("/editBanner").put(
  uploads.single("bgImage"),
  adminController.editBanner
);
AdminRouter.route("/deleteBanner").delete(adminController.deleteBanner);

//Coupone
AdminRouter.route("/createCoupon").post(
  uploads.single("couponImage"),
  adminController.createCoupone
);
AdminRouter.route("/getCoupon").get(adminController.getCoupon);
AdminRouter.route("/getOneCoupon/:_id").get(adminController.getOneCoupon);
AdminRouter.route("/editCoupon/:_id").put(
  uploads.single("couponImage"),
  adminController.editCoupon
);
AdminRouter.route("/updateCouponStatus/:_id").put(
  adminController.updateCouponStatus
);
AdminRouter.route("/deleteCoupon/:_id").delete(adminController.deleteCoupon);

// Products
AdminRouter.route("/createProduct").post(adminController.createProduct);

//Sub Category
AdminRouter.route("/createSubCategory").post(
  uploads.single("subCategoryImage"),
  adminController.createSubCategory
);
AdminRouter.route("/getSubCategory").get(adminController.getSubCategory);
AdminRouter.route("/getSubCategoryBasedOnCategory/:categoryId").get(
  adminController.getSubCategoryBasedOnCategory
);
AdminRouter.route("/getOneSubCategory/:_id").get(
  adminController.getOneSubCategory
);
AdminRouter.route("/updateSubCategory/:_id").put(
  uploads.single("subCategoryImage"),
  adminController.updateSubCategory
);
AdminRouter.route("/deleteSubCategory/:_id").delete(
  adminController.deleteSubCategory
);
//Category

AdminRouter.route("/createCategory").post(
  uploads.single("categoryImage"),
  adminController.createCategory
);

AdminRouter.route("/getAllCategory").get(adminController.fetchCategory);
AdminRouter.route("/getOneCategory/:_id").get(
  adminController.fetchSingleCategory
);

AdminRouter.route("/getActiveCategories").get(
  userController.getCategories
);

AdminRouter.route("/getActiveSubcategories").get(
  userController.getSubCategoryData
);

AdminRouter.route("/editcategory/:_id").put(
  uploads.single("categoryImage"),
  adminController.changeCategory
);

AdminRouter.route("/deleteCategory/:_id").delete(
  adminController.removeCategory
);

AdminRouter.route("/createCategory").post(
  uploads.single("categoryImage"),
  adminController.createCategory
);

AdminRouter.route("/customer").get(adminController.getCustomer);
AdminRouter.route("/editcustomer/:_id").put(adminController.changeCustomer);
AdminRouter.route("/onecustomer/:_id").get(adminController.singleCustomer);

AdminRouter.route("/createBrand").post(
  uploads.single("brandImage"),
  adminController.createBrand
);

AdminRouter.route("/getBrand").get(adminController.getAllBrand);
AdminRouter.route("/getOneBrand/:_id").get(adminController.getSingleBrand);

AdminRouter.route("/editBrand/:_id").put(
  uploads.single("brandImage"),
  adminController.changeBrand
);

AdminRouter.route("/deleteBrand/:_id").delete(adminController.removeBrand);

// Offers
AdminRouter.route("/createOffers").post(
  uploads.single("offerImage"),
  adminController.createOffer
);
AdminRouter.route("/getOffers").get(adminController.getOffers);
AdminRouter.route("/getOneOffers/:_id").get(adminController.getOneOffer);
AdminRouter.route("/updateOffers/:offerId").put(
  uploads.single("offerImage"),
  adminController.updateOffers
);
AdminRouter.route("/updateOfferStatus/:_id").put(
  adminController.updateOfferStatus
);
AdminRouter.route("/deleteOffer/:offerId").delete(adminController.deleteOffers);

// Report
AdminRouter.route("/getReport").get(adminController.getReport);
AdminRouter.route("/getInventoryReport").get(
  adminController.getInventoryReport
);

//produts
AdminRouter.route("/addProducts").post(
  uploads.any(),
  adminController.postProduct
);

AdminRouter.route("/getProducts").get(adminController.fetchAllProducts);
AdminRouter.route("/getSingleProduct/:_id").get(
  adminController.fetchSingleProducts
);
AdminRouter.route("/editProduct/:_id").put(
  uploads.any(),
  adminController.changeProduct
);
AdminRouter.route("/editProductStatus/:_id").put(
  adminController.editProductStatus
);
AdminRouter.route("/deleteProduct/:_id").delete(adminController.removeProducts);

//Orders
AdminRouter.route("/getOrders").get(adminController.getOrder);
AdminRouter.route("/editOrders/:_id").put(adminController.editOrders);
AdminRouter.route("/returnreject").put(adminController.approveRejectReturns);

AdminRouter.route("/systemUser").post(adminController.createSystemUser);
AdminRouter.route("/adminLogin").post(adminController.userLogin);
AdminRouter.route("/allAdmin").get(verifyToken, adminController.allAdmin);
AdminRouter.route("/forgotPassword").post(adminController.forgotPasswordController);
AdminRouter.route("/resendOtp").post(adminController.resendOtpController);
AdminRouter.route("/verifyResetOtp").post(adminController.verifyResetOtpController);
AdminRouter.route("/resetPassword").post(adminController.resetPasswordController);
AdminRouter.route("/editAdmin/:_id").put(
  verifyToken,
  adminController.editAdmin
);
AdminRouter.route("/deleteAdmin/:_id").delete(
  verifyToken,
  adminController.deleteAdmin
);
AdminRouter.route("/getAdminById/:id").get(adminController.fetchSingleAdmin);
// Review Ratings
AdminRouter.route("/getReviewsRatings").get(adminController.getReviewRatings);
AdminRouter.route("/deleteReviewsRatings/:_id").delete(adminController.deleteReviewsRatings);
AdminRouter.route("/notification").post(
  uploads.single("Image"),
  adminController.addNotification
);

AdminRouter.route("/getNotification").get(adminController.fetchNotification);

// Offer Products
AdminRouter.route("/addOfferProducts").post(adminController.addOfferProducts);
AdminRouter.route("/getOfferProducts/:_id").get(
  adminController.getOfferProducts
);
AdminRouter.route("/updateOfferProducts/:_id").put(
  adminController.updateOfferProducts
);
AdminRouter.route("/getOfferAndNotAppliedProducts/:_id").get(
  adminController.getOfferAndNotAppliedProducts
);

// Feature Section
AdminRouter.route("/createFeaturedSection").post(
  adminController.createFeaturedSection
);
AdminRouter.route("/getFeaturedSection").get(
  adminController.getFeaturedSection
);
AdminRouter.route("/updateFeaturedSection/:_id").put(
  adminController.updateFeaturedSection
);
AdminRouter.route("/updateStatusFeatureSection/:_id").put(
  adminController.updateStatusFeatureSection
);
AdminRouter.route("/deleteFeaturedSection/:_id").delete(
  adminController.deleteFeaturedSection
);

// Featurd prodcuts
AdminRouter.route("/addFeaturedProducts").post(
  adminController.addFeaturedProducts
);
AdminRouter.route("/getFeaturedProducts/:_id").get(
  adminController.getFeaturedProducts
);
AdminRouter.route("/getFeaturedAndNotAppliedProducts/:_id").get(
  adminController.getFeaturedAndNotAppliedProducts
);
AdminRouter.route("/updateFeaturedProducts/:_id").put(
  adminController.updateFeaturedProducts
);

AdminRouter.route("/filterNotification").get(
  adminController.getfilterNotification
);

// Settings
AdminRouter.route("/storeSettingsData").post(
  uploads.fields([
    { name: "logo", maxCount: 1 },
    { name: "favicon", maxCount: 1 },
  ]),
  adminController.storeSettingsData
);
AdminRouter.route("/getStoreSettingData").get(
  adminController.getStoreSettingData
);
AdminRouter.route("/editStoreSettingsData").put(
  uploads.fields([
    { name: "logo", maxCount: 1 },
    { name: "favicon", maxCount: 1 },
  ]),
  adminController.editStoreSettingsData
);
AdminRouter.route("/getPaymentMethod").get(adminController.getPaymentMethod);
AdminRouter.route("/paymentMethods").post(adminController.paymentMethods);
AdminRouter.route("/emailsettings").post(adminController.CreateEmailSetting);
AdminRouter.route("/getEmailsettings").get(adminController.GetEmailSetting);
AdminRouter.route("/createshipping").post(adminController.CreateShippingMethod);
AdminRouter.route("/getshipping").get(adminController.GetShippingMethod);
AdminRouter.route("/createaboutus").post(
  uploads.any(),
  adminController.Createaboutus
);
AdminRouter.route("/getaboutus").get(adminController.Getaboutus);
AdminRouter.route("/createcontactus").post(
  uploads.single("contactusBgImage"),
  adminController.Createcontactus
);
AdminRouter.route("/getcontactus").get(adminController.Getcontactus);
AdminRouter.route("/createprivacypolicy").post(
  adminController.CreatePrivacyPolicy
);
AdminRouter.route("/getprivacypolicy").get(adminController.GetPrivacyPolicy);
AdminRouter.route("/createtermsandcondition").post(
  adminController.CreateTermsAndCondition
);
AdminRouter.route("/gettermsandcondition").get(
  adminController.GetTermsAndCondition
);
AdminRouter.route("/createreturnpolicy").post(
  adminController.CreateReturnPolicy
);
AdminRouter.route("/getreturnpolicy").get(adminController.GetReturnPolicy);
AdminRouter.route("/createshippingpolicy").post(
  adminController.CreateShippingPolicy
);
AdminRouter.route("/getshippingpolicy").get(adminController.GetShippingPolicy);
AdminRouter.route("/createadminpolicy").post(adminController.CreateAdminPolicy);
AdminRouter.route("/getadminpolicy").get(adminController.GetAdminPolicy);
AdminRouter.route("/createdeliverypolicy").post(
  adminController.CreateDeliveryPolicy
);
AdminRouter.route("/getdeliverypolicy").get(adminController.GetDeliveryPolicy);
AdminRouter.route("/shippingTimeSlots").post(adminController.shippingTimeSlots);
AdminRouter.route("/getShippingTimeSlots").get(
  adminController.getShippingTimeSlots
);
AdminRouter.route("/dashboard").get(adminController.dashBoardData);

// Date Slots
AdminRouter.route("/createHolidayDateSlot").post(
  verifyToken,
  adminController.createHolidayDateSlot
);
AdminRouter.route("/getHolidayTimeSlot").get(
  verifyToken,
  adminController.getHolidayTimeSlot
);
AdminRouter.route("/hoildayTimeSlotStatus").get(
  verifyToken,
  adminController.hoildayTimeSlotStatus
);
AdminRouter.route("/editHolidayTimeSlot").put(
  verifyToken,
  adminController.editHolidayTimeSlot
);
AdminRouter.route("/deleteHolidayTimeSlot").delete(
  verifyToken,
  adminController.deleteHolidayTimeSlot
);

AdminRouter.route("/getProfile").get(verifyToken, adminController.fetchProfile);
AdminRouter.route("/editProfile").put(
  verifyToken,
  adminController.updateProfile
);

AdminRouter.route("/editPurchaseCode").post(adminController.changePurchaseCode);
AdminRouter.route("/getPurchaseCode").get(adminController.fetchPurchaseCode);

AdminRouter.route("/editModuleManager").post(
  adminController.changeModuleManger
);
AdminRouter.route("/getModuleManager").get(adminController.fetchmoduleManager);
AdminRouter.route("/getOneAdmin").get(verifyToken, adminController.getoneUser);

AdminRouter.route("/getUserQueries").get(adminController.GetAllUserQueries);

AdminRouter.route("/webSettings").post(
  verifyToken,
  uploads.single("Logo"),
  adminController.addWebUi
);

AdminRouter.route("/getwebSettings").get(adminController.getWebUi);

AdminRouter.route("/getActiveProducts").get(adminController.fetchActiveProducts);

AdminRouter.route("/createFAQ").post(adminController.createFaq);

AdminRouter.route("/getFAQ").get(adminController.FetchedFAQ);

AdminRouter.route("/deleteFAQ").put(adminController.removeFAQ);


AdminRouter.route("/createTest").post( uploads.single("imageURL") ,adminController.CreateTestimonial)
AdminRouter.route("/getTest").get(adminController.getTestimonials)
AdminRouter.route("/updateTest/:id").put( uploads.single("imageURL"),adminController.updateTestimonials)
AdminRouter.route("/deleteTest/:id").delete(adminController.deleteTestimonials)

// Topbar CRUD Routes

AdminRouter.route("/createTopbar")
  .post(adminController.createTopbarController);

AdminRouter.route("/getTopbar")
  .get(adminController.getTopbarsController);



AdminRouter.route("/updateTopbar/:id")
  .put(adminController.updateTopbarController);

AdminRouter.route("/toggleTopbar/:id")
  .patch(adminController.toggleTopbarController);

AdminRouter.route("/deleteTopbar/:id")
  .delete(adminController.deleteTopbarController);

module.exports = AdminRouter;
