const catchAsync = require("../utils/catchAsync");
const userService = require("../services/user.service");
const { category } = require("../services/user Services/Home/category.service");
const {
  getSubCategory,
  getSubCategoryBasedProducts,
} = require("../services/user Services/Home/subCategory.service");
const { getBanner } = require("../services/user Services/Home/banner.service");
const {
  getCoupons,
} = require("../services/user Services/Home/coupons.service");
const Brands = require("../services/user Services/Home/brands.service");
const search = require("../services/user Services/Home/search.service");
const Prodcut = require("../services/user Services/Product.service");
const bestOfferProducts = require("../services/user Services/Home/bestOfferProducts.service");
const {
  getNewProducts,
} = require("../services/user Services/Home/newProducts.service");
const {
  getBestSellingProducts,
} = require("../services/user Services/Home/bestSellerProducts.service");
const {
  addToCart,
  getCart,
  deleteCart,
  editCart,
  addAddressToCart,
  mergeCart

} = require("../services/user Services/Cart/cart.service");
const {
  saveLaterProduct,
  getSaveLaterProduct,
  removeSaveLater,
  moveToCart,
} = require("../services/user Services/SaveForLater/saveForLater.service");
const {
  addWishlist,
  removeWishlist,
  updateWishList,
  getWishlist,
  mergeWishlist
} = require("../services/user Services/Wishlist/wishlist.service");
const {
  createUser,
  OTPgenerator,
  Otpverify,
  loginUser,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} = require("../services/user Services/User/user.service");
const {
  addAddress,
  getAddress,
  updateAddress,
  deleteAddress,
} = require("../services/user Services/User/address.service");

const Orders = require("../services/user Services/Orders/Orders.service");
const {
  verifyStripePayment,
} = require("../services/user Services/Payment/payment.service");
const { checkOut } = require("../services/user Services/checkOut.service");

const Navbar = require("../services/user Services/Navbar.service");

const myaccount = require("../services/user Services/myAccounts/address");
const details = require("../services/user Services/myAccounts/account");
const AccountOrders = require("../services/user Services/myAccounts/orders");
const { dashBoard } = require("../services/user Services/myAccounts/dashboard");
const { filter } = require("../services/user Services/filter.service");
const { getAboutUs } = require("../services/admin Services/aboutUs.service");
const Coupon = require("../services/user Services/Coupon.service");
const {
  getproductsBasedOnBrands,
} = require("../services/user Services/brands/brands.service");
const { getContactus, getProfile } = require("../services/admin.service");
const {
  createUserQuery,
} = require("../services/user Services/userQueries/userQueries.JS");
const {
  getAllUserQueries,
} = require("../services/admin Services/userQueries/userQueries.JS");
const { homeapis } = require("../services/user Services/Home/home.services");
const policy = require("../services/user Services/Policy.service");
const { getFAQ } = require("../services/admin Services/faq/faq.service");
const { createTestimonial, getTestimonial, updateTestimonial, deleteTestimonial } = require("../services/user Services/testimonial/testimonial.service");
const { getActiveTopbarMessages } = require("../services/admin Services/topbarMessage/topbarMessage.service");
const { idGenerator } = require("../services/user Services/guestId")


const CreateUsers = catchAsync(async (req, res) => {
  const data = await createUser(req);
  res.status(201).send(data);
});

const LoginUser = catchAsync(async (req, res) => {
  const data = await loginUser(req);
  res.status(201).send(data);
});
const addHeart = catchAsync(async (req, res) => {
  const data = await addWishlist(req);
  res.status(201).send(data);
});

const wishlistController = catchAsync(async (req, res) => {
  const data = await getWishlist(req);
  res.status(200).send(data);
});

const updateWishlistData = catchAsync(async (req, res) => {
  const data = await updateWishList(req);
  res.status(200).send(data);
});

const deleteWishlist = catchAsync(async (req, res) => {
  const data = await removeWishlist(req);
  res.status(200).send(data);
});

const moveToCartData = catchAsync(async (req, res) => {
  const data = await moveToCart(req);
  res.status(200).send(data);
});

const cart = catchAsync(async (req, res) => {
  const data = await addToCart(req);
  res.status(201).send(data);
});

const fetchCart = catchAsync(async (req, res) => {
  const data = await getCart(req);
  res.status(200).send(data);
});

const editCartData = catchAsync(async (req, res) => {
  const data = await editCart(req);
  res.status(200).send(data);
});

const removeCart = catchAsync(async (req, res) => {
  const data = await deleteCart(req);
  res.status(200).send(data);
});

const AfterUse = catchAsync(async (req, res) => {
  const data = await saveLaterProduct(req);
  res.status(200).send(data);
});

const getSaveLaterProductData = catchAsync(async (req, res) => {
  const data = await getSaveLaterProduct(req);
  res.status(200).send(data);
});

const removeSaveLaterData = catchAsync(async (req, res) => {
  const data = await removeSaveLater(req);
  res.status(200).send(data);
});

const otp = catchAsync(async (req, res) => {
  const data = await OTPgenerator(req);
  res.status(200).send(data);
});

const otpVerify = catchAsync(async (req, res) => {
  const data = await Otpverify(req);
  res.status(200).send(data);
});

const getCheckout = catchAsync(async (req, res) => {
  const data = await checkOut(req);
  res.status(200).send(data);
});

const addAddressData = catchAsync(async (req, res) => {
  const data = await addAddress(req);
  res.status(200).send(data);
});

const getAddressData = catchAsync(async (req, res) => {
  const data = await getAddress(req);
  res.status(200).send(data);
});

const updateAddressData = catchAsync(async (req, res) => {
  const data = await updateAddress(req);
  res.status(200).send(data);
});

const deleteAddressData = catchAsync(async (req, res) => {
  const data = await deleteAddress(req);
  res.status(200).send(data);
});

const placePayment = catchAsync(async (req, res) => {
  const data = await userService.placePayment(req);
  res.status(201).send(data);
});

const placeOrder = catchAsync(async (req, res) => {
  const data = await Orders.placeOrder(req);
  res.status(201).send(data);
});

const getOrder = catchAsync(async (req, res) => {
  const data = await userService.getOrder(req);
  res.status(200).send(data);
});

const getOneOrder = catchAsync(async (req, res) => {
  const data = await userService.getSingleOrders(req);
  res.status(200).send(data);
});

const changeOrder = catchAsync(async (req, res) => {
  const data = await userService.editOrders(req);
  res.status(200).send(data);
});

const addReviewRating = catchAsync(async (req, res) => {
  const data = await userService.addReviewRating(req);
  res.status(201).send(data);
});

const getUserReviewRating = catchAsync(async (req, res) => {
  const data = await userService.getUserReviewRating(req);
  res.status(200).send(data);
});

const getReviewRatingBasedOnProduct = catchAsync(async (req, res) => {
  const data = await userService.getReviewRatingBasedOnProduct(req);
  res.status(200).send(data);
});

const searchProducts = catchAsync(async (req, res) => {
  const data = await search.Search(req);
  res.status(200).send(data);
});

const getCategories = catchAsync(async (req, res) => {
  const data = await category(req);
  res.status(200).send(data);
});

const getSubCategoryData = catchAsync(async (req, res) => {
  const data = await getSubCategory(req);
  res.status(200).send(data);
});

const getBannerData = catchAsync(async (req, res) => {
  const data = await getBanner(req);
  res.status(200).send(data);
});

const getCouponsData = catchAsync(async (req, res) => {
  const data = await getCoupons(req);
  res.status(200).send(data);
});

const getbrands = catchAsync(async (req, res) => {
  const data = await Brands.brands(req);
  res.status(200).send(data);
});

const fetchallBrands = catchAsync(async (req, res) => {
  const data = await Brands.allBrands(req);
  res.status(200).send(data);
});

const offerProducts = catchAsync(async (req, res) => {
  const data = await bestOfferProducts.bestOfferProducts(req);
  res.status(200).send(data);
});

const fetchProduct = catchAsync(async (req, res) => {
  const data = await Prodcut.ProductDetials(req);
  res.status(200).send(data);
});

const getNewProductsData = catchAsync(async (req, res) => {
  const data = await getNewProducts(req);
  res.status(200).send(data);
});

const getBestSellingProductsData = catchAsync(async (req, res) => {
  const data = await getBestSellingProducts(req);
  res.status(200).send(data);
});

const paymentVerify = catchAsync(async (req, res) => {
  const data = await Orders.verifyRazorpay(req);
  res.status(200).send(data);
});

const verifyStripePaymentData = catchAsync(async (req, res) => {
  const data = await verifyStripePayment(req);
  res.status(200).send(data);
});

const verifyPayPalPaymentData = catchAsync(async (req, res) => {
  const data = await Orders.verifyPaypal(req);
  res.status(200).send(data);
});

const ForgotPassword = catchAsync(async (req, res) => {
  const data = await forgotPassword(req);
  res.status(200).send(data);
});

const VerifyResetOtp = catchAsync(async (req, res) => {
  const data = await verifyResetOtp(req);
  res.status(200).send(data);
});

const ResetPassword = catchAsync(async (req, res) => {
  const data = await resetPassword(req);
  res.status(200).send(data);
});

const newAddress = catchAsync(async (req, res) => {
  const data = await myaccount.addAddress(req);
  res.status(200).send(data);
});

const getNewAddress = catchAsync(async (req, res) => {
  const data = await myaccount.getAddress(req);
  res.status(200).send(data);
});

const editNewAddress = catchAsync(async (req, res) => {
  const data = await myaccount.editAddress(req);
  res.status(200).send(data);
});

const deleteNewAddress = catchAsync(async (req, res) => {
  const data = await myaccount.deleteAddress(req);
  res.status(200).send(data);
});

const fetchOrder = catchAsync(async (req, res) => {
  const data = await AccountOrders.getOrder(req);
  res.status(200).send(data);
});

const fetchSingleOrder = catchAsync(async (req, res) => {
  const data = await AccountOrders.getSingleOrders(req);
  res.status(200).send(data);
});

const changeOrders = catchAsync(async (req, res) => {
  const data = await AccountOrders.editOrders(req);
  res.status(200).send(data);
});

const fetchDetails = catchAsync(async (req, res) => {
  const data = await details.getAccountDetails(req);
  res.status(200).send(data);
});

const changeDetails = catchAsync(async (req, res) => {
  const data = await details.editDetails(req);
  res.status(200).send(data);
});

const dashboardData = catchAsync(async (req, res) => {
  const data = await dashBoard(req);
  res.status(200).send(data);
});

const getNavbarData = catchAsync(async (req, res) => {
  const data = await Navbar.Navbar(req);
  res.status(200).send(data);
});

const filterData = catchAsync(async (req, res) => {
  const data = await filter(req);
  res.status(200).send(data);
});

const Getaboutus = catchAsync(async (req, res) => {
  const data = await getAboutUs(req);
  res.status(200).send(data);
});

const VerifyCoupon = catchAsync(async (req, res) => {
  const data = await Coupon.Coupon(req);
  res.status(200).send(data);
});

const fetchCoupon = catchAsync(async (req, res) => {
  const data = await Coupon.getCoupon(req);
  res.status(200).send(data);
});

const Product = catchAsync(async (req, res) => {
  const data = await Prodcut.getAllProducts(req);
  res.status(200).send(data);
});

const subcategoryProducts = catchAsync(async (req, res) => {
  const data = await Prodcut.getSubCategoryBasedProducts(req);
  res.status(200).send(data);
});

const addAddressToCartData = catchAsync(async (req, res) => {
  const data = await addAddressToCart(req);
  res.status(200).send(data);
});

const getproductsBasedOnBrandsData = catchAsync(async (req, res) => {
  const data = await getproductsBasedOnBrands(req);
  res.status(200).send(data);
});

const getcontactusData = catchAsync(async (req, res) => {
  const data = await getContactus(req);
  res.status(200).send(data);
});

const CreateUserQuery = catchAsync(async (req, res) => {
  const data = await createUserQuery(req);
  res.status(200).send(data);
});

const GetHomePageDatas = catchAsync(async (req, res) => {
  const data = await homeapis(req);
  res.status(200).send(data);
});

const fetchWebSetting = catchAsync(async (req, res) => {
  const data = await policy.getWebSettings(req);
  res.status(200).send(data);
});

const fetchFAQ = catchAsync(async (req, res) => {
  const data = await getFAQ(req);
  res.status(200).send(data);
});

const getSubCategoryBasedProductsData = catchAsync(async (req, res) => {
  const data = await getSubCategoryBasedProducts(req);
  res.status(200).send(data);
});

const CreateTestimonial =catchAsync(async (req,res)=>{
  const data = await createTestimonial(req)
  res.status(200).send(data)
})

const getTestimonials = catchAsync(async(req,res)=>{
  const data = await getTestimonial(req);
  res.status(200).send(data)
}) 


const fetchAdminProfile = catchAsync(async(req,res)=>{
  const data = await getProfile(req);
  res.status(200).send(data)
}) 


const getActiveTopbarsController = catchAsync(async (req, res) => {
  const data = await getActiveTopbarMessages(req);
  res.status(200).send(data);
});

const cartMerge = catchAsync(async(req,res)=>{
  const data = await mergeCart(req);
  res.status(200).send(data)

})
const wishMerge = catchAsync(async(req,res)=>{
  const data = await mergeWishlist(req);
  res.status(200).send(data)

})

const IDGenerator = async (req, res) => {
  const data = await idGenerator(req);
  res.status(200).send(data);
};

module.exports = {
  CreateUserQuery,
  ForgotPassword,
  VerifyResetOtp,
  subcategoryProducts,
  ResetPassword,
  CreateUsers,
  addHeart,
  LoginUser,
  wishlistController,
  deleteWishlist,
  cart,
  fetchCart,
  editCartData,
  removeCart,
  AfterUse,
  getSaveLaterProductData,
  removeSaveLaterData,
  otp,
  otpVerify,
  getCheckout,
  addAddressData,
  getAddressData,
  updateAddressData,
  deleteAddressData,
  placePayment,
  placeOrder,
  getOrder,
  getOneOrder,
  changeOrder,
  addReviewRating,
  getUserReviewRating,
  getReviewRatingBasedOnProduct,
  getCategories,
  getSubCategoryData,
  getBannerData,
  getCouponsData,
  searchProducts,
  getbrands,
  fetchallBrands,
  offerProducts,
  fetchProduct,
  getNewProductsData,
  getBestSellingProductsData,
  paymentVerify,
  verifyStripePaymentData,
  verifyPayPalPaymentData,
  updateWishlistData,
  moveToCartData,
  newAddress,
  getNewAddress,
  editNewAddress,
  deleteNewAddress,
  fetchOrder,
  fetchSingleOrder,
  changeOrders,
  fetchDetails,
  changeDetails,
  dashboardData,
  getNavbarData,
  filterData,
  Getaboutus,
  VerifyCoupon,
  fetchCoupon,
  Product,
  addAddressToCartData,
  getproductsBasedOnBrandsData,
  getcontactusData,
  GetHomePageDatas,
  fetchWebSetting,
  fetchFAQ,
  getSubCategoryBasedProductsData,
  CreateTestimonial,
  getTestimonials,
  fetchAdminProfile,
  getActiveTopbarsController,
  IDGenerator,
  cartMerge,
  wishMerge
};
