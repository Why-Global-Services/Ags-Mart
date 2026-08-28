const { getCart } = require("../Cart/cart.service");
const { Navbar } = require("../Navbar.service");
const { getTestimonial } = require("../testimonial/testimonial.service");
const { getWishlist } = require("../Wishlist/wishlist.service");
const { getBanner } = require("./banner.service");
const { bestOfferProducts } = require("./bestOfferProducts.service");
const { getBestSellingProducts } = require("./bestSellerProducts.service");
const { brands, allBrands } = require("./brands.service");
const { category } = require("./category.service");
const { getCoupons } = require("./coupons.service");
const { GetAllProductsGroupedByCategory } = require("./getProdcutByCategory.service");
const { getJustForYouProduct } = require("./justForYou");
const { getLuxuryCollectionProducts } = require("./luxuryCollection.service");
const { getNewProducts } = require("./newProducts.service");
const { getTodaySpecialProducts } = require("./todaySpl")

const homeapis = async (req) => {
  const results = await Promise.allSettled([
    // Navbar(req),
    getBanner("Top"),
    getBanner("Middle"),
    getBanner("Bottom"),
    getNewProducts(req),
    getBestSellingProducts(req),
    getTodaySpecialProducts(req),
    // bestOfferProducts(req),
    brands(req),
    getCoupons(req),
    // allBrands(req),
    category(),
    getLuxuryCollectionProducts(req),
    // getJustForYouProduct(req),
    getTestimonial(req),
    GetAllProductsGroupedByCategory(req),
  ]);

  const [
    // navbarResult,
    topBannerResult,
    middleBannerResult,
    bottomBannerResult,
    newProductsResult,
    bestSellingProductsResult,
    todaySpecialProductsResult,
    // bestOfferProductsResult,
    // brandsResult,
    couponsResult,
    allBrandsResult,
    categoryResult,
    luxuryCollectionResult,
    // getJustForYouProductResult,
    getTetimonialResult,
    getAllProductsGroupedByCategoryResult,
  ] = results;

  // Safe assignments with fallbacks
  // const navbarDatas =
  //   navbarResult.status === "fulfilled"
  //     ? navbarResult.value
  //     : { success: false, data: null };
  const topBannerDatas =
    topBannerResult.status === "fulfilled"
      ? topBannerResult.value
      : { success: false, data: [] };
  const middleBannerDatas =
    middleBannerResult.status === "fulfilled"
      ? middleBannerResult.value
      : { success: false, data: [] };
  const bottomBannerDatas =
    bottomBannerResult.status === "fulfilled"
      ? bottomBannerResult.value
      : { success: false, data: [] };
  const newProductsData =
    newProductsResult.status === "fulfilled"
      ? newProductsResult.value
      : { success: false, data: [] };
  const bestSellingProductsData =
    bestSellingProductsResult.status === "fulfilled"
      ? bestSellingProductsResult.value
      : { success: false, data: [] };
  // const bestOfferProductsData =
  //   bestOfferProductsResult.status === "fulfilled"
  //     ? bestOfferProductsResult.value
  //     : { success: false, data: [] };
  // const brandsData =
  //   brandsResult.status === "fulfilled"
  //     ? brandsResult.value
  //     : { success: false, data: [] };
  const getCouponsData =
    couponsResult.status === "fulfilled"
      ? couponsResult.value
      : { success: false, data: [] };
  const allBrandsData =
    allBrandsResult.status === "fulfilled"
      ? allBrandsResult.value
      : { success: false, data: [] };
  const allCategory =
    categoryResult.status === "fulfilled"
      ? categoryResult.value
      : { success: false, data: [] };
  const luxuryCollection = 
  luxuryCollectionResult.status === "fulfilled"
      ? luxuryCollectionResult.value
      : {success: false, data: []}
  // const justForYou = 
  // getJustForYouProductResult.status === "fulfilled"
  //     ? getJustForYouProductResult.value
  //     : {success: false, data: []}
  const getTetimonial = 
  getTetimonialResult.status === "fulfilled"
      ? getTetimonialResult.value
      : {success: false, data: []}
  const getAllProductsGroupedByCategory = 
  getAllProductsGroupedByCategoryResult.status === "fulfilled"
      ? getAllProductsGroupedByCategoryResult.value
      : {success: false, data: []}

  const todaySpecialProducts =
  todaySpecialProductsResult.status === "fulfilled"
    ? todaySpecialProductsResult.value
    : { success: false, data: [] };  

  // Log failed ones
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(`❌ API ${i + 1} failed:`, r.reason?.message || r.reason);
    }
  });

  // Wishlist and Cart
  let wishlist = [];
  let cart = [];

  if (req.isAuthenticated) {
    try {
      [wishlist, cart] = await Promise.all([getWishlist(req), getCart(req)]);
    } catch (err) {
      console.log("❌ Failed to fetch wishlist/cart:", err.message);
      req.isAuthenticated = false;
      wishlist = [];
      cart = [];
    }
  }

  return {
    // navbarDatas,
    topBannerDatas,
    middleBannerDatas,
    bottomBannerDatas,
    newProductsData,
    bestSellingProductsData,
    todaySpecialProducts,
    // bestOfferProductsData,
    // brandsData,
    getCouponsData,
    allBrandsData,
    allCategory,
    wishlist,
    cart,
    luxuryCollection,
    isAuthenticated: req.isAuthenticated || false,
    tokenError: req.tokenError || null,
    // justForYou,
    getTetimonial,
    getAllProductsGroupedByCategory,
  };
};

module.exports = { homeapis };
