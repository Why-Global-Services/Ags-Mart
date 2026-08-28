const ApiError = require("../utils/apiError");
const config = require("../config/config");
const { ncrypt } = require("ncrypt-js");
const httpStatus = require("http-status");
const { BannerDetailsModel } = require("../models/banner.model");
const { uploadToCloud } = require("../utils/uploadFileToS3");
const { CouponModel } = require("../models/coupons.model");
const { uploads } = require("../middlwares/multer");
const { Product } = require("../models/Product.model");
const { CategoryModel } = require("../models/category.model");
const { subCategory } = require("../models/subCategory.model");
const { User } = require("../models/users.model");
const { Brand } = require("../models/brand.model");
const { offers } = require("../models/offers.model");
const { orderDetailsModel } = require("../models/orders.model");
const { admin } = require("../models/AdminUser.model");
const { emailSettings } = require("../models/settingsemail.model");
const Aboutus = require("../models/aboutus");
const contactus = require("../models/contactus");
const PrivacyPolicy = require("../models/privacypolicy.model");
const ShippingMethod = require("../models/ShippingMethod.model");
const TermsandCondition = require("../models/terms&condition");
const ReturnPolicy = require("../models/returnpolicy");
const ShippingPolicy = require("../models/shippingpolicy");
const AdminPolicy = require("../models/adminpolicy");
const DeliveryPolicy = require("../models/deliverypolicy");
const Bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { equal } = require("joi");
const generateOrderReportPDF = require("../utils/generateOrderReportPDF");
const { reviewsRatings } = require("../models/reviewRating.model");
const sendmail = require("../utils/sendmail");
const Notify = require("../models/notification.model");
const { featuredSection } = require("../models/featuredSection.model");
const { offerProducts } = require("../models/offerProducts.model");
const { featuredProducts } = require("../models/featuredSectionProducts.model");
const { storeSettings } = require("../models/StoreSettings.model");
const { paymentMethod } = require("../models/paymentMethods.model");
const { PurchaseCode } = require("../models/Purchase.model");
const { shippingTimeSlot } = require("../models/shippingTimeSlot.model");
const { hoildayDateSlot } = require("../models/holidayDateSlot.model");
const { moduleManager } = require("../models/moduleManager.model");

const createBanner = async (req, res) => {
  const { title, subtitle, offer } = req.body;
  const image = req.file;

  // if (!title || !subtitle || !offer) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, "Provide All details");
  // }

  if (!image) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No Image provided");
  }

  const key = `banner/POVIS_${Date.now()}_${image.originalname}`;
  const imageURL = await uploadToCloud(image, key);

  const createBanner = await BannerDetailsModel.create({
    ...req.body,
    bgImage: imageURL,
  });

  return {
    success: true,
    message: "Banner created successfully",
    bannerDetails: createBanner,
  };
};

const updateBanner = async (req, res) => {
  try {
    console.log("Received update request for banner");
    const { title, subtitle, offer } = req.body;
    const { bannerId } = req.query;
    const image = req.file;

    console.log("Request body:", req.body);
    console.log("Banner ID:", bannerId);
    console.log("Image file:", image);

    if (image) {
      console.log("Uploading image...");
      const key = `banner/POVIS_${Date.now()}_${image.originalname}`;
      const imageURL = await uploadToCloud(image, key);
      console.log("Image uploaded:", imageURL);

      console.log("Updating banner with new image...");
      const editBanner = await BannerDetailsModel.findByIdAndUpdate(
        bannerId,
        { ...req.body, bgImage: imageURL },
        { new: true }
      );
      console.log("Banner updated:", editBanner);

      return {
        success: true,
        message: "Banner Updated successfully",
        editBannerDetails: editBanner,
      };
    }

    console.log("No image provided. Updating banner without image...");
    const editBanner = await BannerDetailsModel.findByIdAndUpdate(
      bannerId,
      { ...req.body },
      { new: true }
    );
    console.log("Banner updated:", editBanner);

    return {
      success: true,
      message: "Banner Updated successfully",
      editBannerDetails: editBanner,
    };
  } catch (error) {
    console.error("Error updating banner:", error);
    throw error;
  }
};


const getBanner = async (req, res) => {
  const getBanner = await BannerDetailsModel.find();

  const getActiveCategroy = await CategoryModel.aggregate([
    {
      $match: { status: "active" },
    },
    {
      $project: {
        _id: 1,
        categoryTitle: 1,
      },
    },
  ]);
  const getActiveSubCategory = await subCategory.aggregate([
    {
      $match: { status: "active" },
    },
    {
      $project: {
        _id: 1,
        subCategoryTitle: 1,
      },
    },
  ]);

  if (!getBanner) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No Banners found");
  }

  return {
    success: true,
    getBannerDetails: getBanner,
    category: getActiveCategroy,
    subCategory: getActiveSubCategory,
  };
};

const editBanner = async (req, res) => {
  const { _id } = req.body;
  const image = req.file;

  if (!_id) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No ID provided");
  }

  if (image) {
    const key = `banner/POVIS_${Date.now()}_${image.originalname}`;
    const imageURL = await uploadToCloud(image, key);

    const editBanner = BannerDetailsModel.findByIdAndUpdate(
      _id,
      { ...req.body, bgImage: imageURL },
      { new: true }
    );
    return { success: true, editBannerDetails: editBanner };
  }
  const editBanner = BannerDetailsModel.findByIdAndUpdate(
    _id,
    { ...req.body },
    { new: true }
  );

  return { success: true, editBannerDetails: editBanner };
};

const deleteBanner = async (req, res) => {
  const { bannerId } = req.query;

  if (!bannerId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No ID provided");
  }

  const deleteBanner = await BannerDetailsModel.findByIdAndDelete({ _id: bannerId });


  return { success: true, message: "Banner deleted successfully", deletedBanner: deleteBanner };
};

const validateCouponPayload = (body) => {
  const { offerType, discountType, discountValue, freeProduct } = body;

  /* DISCOUNT Validation */
  if (offerType === "DISCOUNT") {
    if (!discountType || discountValue == null || discountValue <= 0) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Discount type and valid discount value are required for DISCOUNT coupons"
      );
    }
  }

  /* FREE PRODUCT Validation */
  if (offerType === "FREE_PRODUCT") {
    // Parse freeProduct if it's a string
    const parsedFreeProduct = typeof freeProduct === 'string' 
      ? JSON.parse(freeProduct) 
      : freeProduct;

    if (
      !parsedFreeProduct ||
      !parsedFreeProduct.productId ||
      !parsedFreeProduct.productType
    ) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Free product details (productId and productType) are required for FREE_PRODUCT coupons"
      );
    }

    // Validate variant is provided for variant products
    if (parsedFreeProduct.productType === "variant" && !parsedFreeProduct.variantId) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Variant ID is required for variant products"
      );
    }
  }
};


const createCoupen = async (req) => {
  const body = req.body;
  const couponImage = req.file;

  if (!body.code || !couponImage) {
    throw new ApiError(400, "Coupon code and image are required");
  }

  /* Validate type */
  validateCouponPayload(body);

  /* Duplicate check */
  const exists = await CouponModel.findOne({ code: body.code.toUpperCase() });

  if (exists) {
    throw new ApiError(400, "Coupon code already exists");
  }

  /* Only ONE first-order coupon */
  if (body.firstOrderOnly === true || body.firstOrderOnly === 'true') {
    const existing = await CouponModel.findOne({ firstOrderOnly: true });

    if (existing) {
      throw new ApiError(
        400,
        `First order coupon already exists (${existing.code})`
      );
    }
  }

  /* Upload Image */
  const key = `coupon/POVIS_${Date.now()}_${couponImage.originalname}`;
  const imageURL = await uploadToCloud(couponImage, key);

  // Prepare coupon data
  const couponData = {
    code: body.code.toUpperCase(),
    message: body.message,
    offerType: body.offerType,
    minPurchaseAmount: body.minPurchaseAmount || 0,
    validFrom: body.validFrom,
    validUntil: body.validUntil,
    usageLimit: body.usageLimit || 1,
    repeatUsage: body.repeatUsage || 'allowed',
    cashBack: body.cashBack === true || body.cashBack === 'true',
    status: body.status || 'active',
    firstOrderOnly: body.firstOrderOnly === true || body.firstOrderOnly === 'true',
    couponImage: imageURL,
  };

  // Add type-specific fields
  if (body.offerType === "DISCOUNT") {
    couponData.discountValue = body.discountValue;
    couponData.discountType = body.discountType;
    couponData.maxDiscountAmount = body.maxDiscountAmount || 0;
  } else if (body.offerType === "FREE_PRODUCT") {
    // Parse freeProduct if it's a string
    couponData.freeProduct = typeof body.freeProduct === 'string' 
      ? JSON.parse(body.freeProduct) 
      : body.freeProduct;
  }

  const coupon = await CouponModel.create(couponData);

  return {
    success: true,
    message: "Coupon created successfully",
    data: coupon,
  };
};


const getCoupon = async () => {
  const coupons = await CouponModel.find().sort({ createdAt: -1 });

  return {
    success: true,
    count: coupons.length,
    data: coupons,
  };
};


const getOneCoupon = async (req) => {
  const { _id } = req.params;

  if (!_id) {
    throw new ApiError(404, "Coupon ID is required");
  }

  const coupon = await CouponModel.findById(_id);

  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  return {
    success: true,
    message: "Coupon fetched successfully",
    data: coupon,
  };
};


const editCoupon = async (req) => {
  const { _id } = req.params;
  const body = req.body;
  const image = req.file;

  if (!_id) {
    throw new ApiError(400, "Coupon ID is required");
  }

  /* Validate */
  validateCouponPayload(body);

  /* Duplicate Code Check */
  if (body.code) {
    const duplicate = await CouponModel.findOne({
      code: body.code.toUpperCase(),
      _id: { $ne: _id },
    });

    if (duplicate) {
      throw new ApiError(400, "Coupon code already exists");
    }
  }

  /* First Order Fix */
  if (body.firstOrderOnly === true || body.firstOrderOnly === 'true') {
    const existing = await CouponModel.findOne({
      firstOrderOnly: true,
      _id: { $ne: _id },
    });

    if (existing) {
      throw new ApiError(
        400,
        `First order coupon already exists (${existing.code})`
      );
    }
  }

  // Prepare update data
  const updateData = {
    message: body.message,
    offerType: body.offerType,
    minPurchaseAmount: body.minPurchaseAmount || 0,
    validFrom: body.validFrom,
    validUntil: body.validUntil,
    usageLimit: body.usageLimit || 1,
    repeatUsage: body.repeatUsage || 'allowed',
    cashBack: body.cashBack === true || body.cashBack === 'true',
    status: body.status || 'active',
    firstOrderOnly: body.firstOrderOnly === true || body.firstOrderOnly === 'true',
  };

  // Update code if provided
  if (body.code) {
    updateData.code = body.code.toUpperCase();
  }

  // Add type-specific fields
  if (body.offerType === "DISCOUNT") {
    updateData.discountValue = body.discountValue;
    updateData.discountType = body.discountType;
    updateData.maxDiscountAmount = body.maxDiscountAmount || 0;
    // Clear freeProduct if switching from FREE_PRODUCT to DISCOUNT
    updateData.freeProduct = undefined;
  } else if (body.offerType === "FREE_PRODUCT") {
    // Parse freeProduct if it's a string
    updateData.freeProduct = typeof body.freeProduct === 'string' 
      ? JSON.parse(body.freeProduct) 
      : body.freeProduct;
    // Clear discount fields if switching from DISCOUNT to FREE_PRODUCT
    updateData.discountValue = undefined;
    updateData.discountType = undefined;
    updateData.maxDiscountAmount = undefined;
  }

  /* Update Image if provided */
  if (image) {
    const key = `coupon/POVIS_${Date.now()}_${image.originalname}`;
    const imageURL = await uploadToCloud(image, key);
    updateData.couponImage = imageURL;
  }

  const updated = await CouponModel.findByIdAndUpdate(
    _id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!updated) {
    throw new ApiError(404, "Coupon not found");
  }

  return {
    success: true,
    message: "Coupon updated successfully",
    data: updated,
  };
};


const updateCouponStatus = async (req) => {
  const { _id } = req.params;
  const { status } = req.body;

  if (!_id) {
    throw new ApiError(404, "Coupon ID is required");
  }

  if (!['active', 'inactive'].includes(status)) {
    throw new ApiError(400, "Invalid status. Must be 'active' or 'inactive'");
  }

  const updated = await CouponModel.findByIdAndUpdate(
    _id,
    { status },
    { new: true }
  );

  if (!updated) {
    throw new ApiError(404, "Coupon not found");
  }

  return {
    success: true,
    message: "Status updated successfully",
    data: updated,
  };
};


const deleteCoupon = async (req) => {
  const { _id } = req.params;

  if (!_id) {
    throw new ApiError(400, "Coupon ID is required");
  }

  const deleted = await CouponModel.findByIdAndDelete(_id);

  if (!deleted) {
    throw new ApiError(404, "Coupon not found");
  }

  return {
    success: true,
    message: "Coupon deleted successfully",
  };
};


const createProduct = async (req, res) => {

  const createdProduct = await Product.create({ ...req.body });

  return {
    success: true,
    message: "New Product Created",
    createdProduct,
  };
};

const AddCategory = async (req) => {
  const { categoryTitle, categoryDescription } = req.body;
  const image = req.file;

  if (!categoryTitle || !categoryDescription) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Provide All details");
  }

  const key = `category/POVIS_${Date.now()}_${image.originalname}`;
  const imageURL = await uploadToCloud(image, key);

  const createCategroy = await CategoryModel.create({
    ...req.body,
    categoryImage: imageURL,
  });

  return { success: true, CategoryDetails: createCategroy };
};

const getAllCategory = async (req) => {
  const getCategory = await CategoryModel.find();
  if (!getCategory) {
    throw new ApiError(404, "No item in the Category");
  }
  return {
    success: true,
    message: "Category Fetched Successfully",
    data: getCategory,
  };
};

const getOneCategory = async (req) => {
  const { _id } = req.params;
  console.log("id", _id);
  const findCategory = await CategoryModel.findById(_id);
  console.log("category", findCategory);
  if (!findCategory) {
    throw new ApiError(404, "Category not found");
  }
  console.log("category", findCategory);
  return {
    success: true,
    message: "category found successfully",
    data: findCategory,
  };
};

const editCategory = async (req) => {
  const { _id } = req.params;
  const image = req.file;
  const { categoryTitle, status, categoryDescription } = req.body;

  const updateFields = {};
  if (categoryTitle) updateFields.categoryTitle = categoryTitle;
  if (status) updateFields.status = status;
  if (categoryDescription)
    updateFields.categoryDescription = categoryDescription;

  if (image) {
    const key = `category/POVIS_${Date.now()}_${image.originalname}`;
    const imageURL = await uploadToCloud(image, key);
    updateFields.categoryImage = imageURL;
  }

  const updatedCategory = await CategoryModel.findByIdAndUpdate(
    { _id: _id },
    updateFields,
    { new: true }
  );

  if (!updatedCategory) {
    throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
  }

  return { success: true, CategoryDetails: updatedCategory };
};

const deleteCategory = async (req) => {
  const { _id } = req.params;
  const findCategory = await CategoryModel.findById(_id);
  if (!findCategory) {
    throw new ApiError(404, "category not found");
  }
  const deleteCategory = await CategoryModel.findByIdAndDelete(_id);

  return {
    success: true,
    message: "Category deleted Successfully",
  };
};

const createSubCategory = async (req, res) => {
  const { subCategoryTitle, category } = req.body;
  const subCategoryImage = req.file;

  if (!subCategoryTitle) {
    throw new ApiError(httpStatus.NOT_FOUND, "No Title provided");
  }

  if (!subCategoryImage) {
    throw new ApiError(httpStatus.NOT_FOUND, "No Image provided");
  }

  const key = `subcategory/POVIS_${Date.now()}_${subCategoryImage.originalname}`;
  const imageURL = await uploadToCloud(subCategoryImage, key);

  const normalizedText = subCategoryTitle.replace(/\s+/g, "").toLowerCase();

  const duplicateSubCategory = await subCategory.findOne({ normalizedText });

  if (duplicateSubCategory) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Title already exists");
  }

  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, "No Category provided");
  }

  const newSubCategory = await subCategory.create({
    ...req.body,
    normalizedText,
    subCategoryImage: imageURL,
  });

  return {
    success: true,
    message: "Sub Category created",
    subCategory: newSubCategory,
  };
};

const getSubCategory = async (req, res) => {
  const allSubCategory = await subCategory.find();

  if (!allSubCategory) {
    throw new ApiError(httpStatus.NOT_FOUND, "Create Sub Category");
  }

  const subCategories = await subCategory.aggregate([
    {
      $match: {},
    },
    {
      $lookup: {
        from: "Category",
        foreignField: "_id",
        localField: "category",
        as: "category",
      },
    },
    {
      $unwind: "$category",
    },
    {
      $project: {
        _id: 1,
        subCategoryTitle: 1,
        subCategoryDescription: 1,
        subCategoryImage: 1,
        status: 1,
        categoryTitle: "$category.categoryTitle",
        categoryId: "$category._id",
      },
    },
  ]);

  return {
    success: true,
    message: "All Sub Category",
    subCategories: subCategories,
  };
};

const getOneSubCategory = async (req) => {
  const { _id } = req.params;
  const oneSubCategory = await subCategory.aggregate([
    {
      $match: { _id: "8a590d45-5521-43e1-b055-6f745e6d075f" },
    },
    {
      $lookup: {
        from: "Category",
        foreignField: "_id",
        localField: "category",
        as: "categoryDetails",
      },
    },
    {
      $unwind: "$category",
    },
    {
      $project: {
        _id: 1,
        subCategoryTitle: 1,
        subCategoryDescription: 1,
        subCategoryImage: 1,
        status: 1,
        categoryTitle: { $first: "$categoryDetails.categoryTitle" },
        categoryid: { $first: "$categoryDetails._id" },
      },
    },
  ]);
  if (!oneSubCategory) {
    throw new ApiError(404, "Category not found");
  }
  return {
    success: true,
    message: "category found successfully",
    data: oneSubCategory,
  };
};

const updateSubCategory = async (req, res) => {
  const { subCategoryTitle, category, status } = req.body;
  const { _id } = req.params;
  console.log(_id);
  const subCategoryImage = req.file;

  if (!_id) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No SubCategory ID provided");
  }

  const findId = await subCategory.findById(_id);

  if (!findId) {
    throw new ApiError(httpStatus.NOT_FOUND, "Sub Category not found");
  }

  if (status || !subCategoryTitle) {
    const updateSubCategory = await subCategory.findByIdAndUpdate(
      _id,
      { ...req.body },
      { new: true }
    );

    return {
      success: true,
      message: "SubCategory Status Updated Successfully",
      updateSubCategory,
    };
  }
  const normalizedText = subCategoryTitle.replace(/\s+/g, "").toLowerCase();

  const duplicateSubCategory = await subCategory.findOne({
    normalizedText,
    _id: { $ne: _id },
  });

  if (duplicateSubCategory) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Title already exists");
  }

  if (!category) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No Category provided");
  }
  if (subCategoryImage) {
    const key = `subcategory/POVIS_${Date.now()}_${subCategoryImage.originalname}`;
    const imageURL = await uploadToCloud(subCategoryImage, key);

    const updateSubCategory = await subCategory.findByIdAndUpdate(
      _id,
      { ...req.body, normalizedText, subCategoryImage: imageURL },
      { new: true }
    );

    return {
      success: true,
      message: "Sub CAtegory updated",
      updateSubCategory,
    };
  }

  const updateSubCategory = await subCategory.findByIdAndUpdate(
    _id,
    { ...req.body, normalizedText },
    { new: true }
  );

  return { success: true, message: "Sub CAtegory updated", updateSubCategory };
};

const deleteSubCategory = async (req, res) => {
  const { _id } = req.params;

  const deletedSubCategory = await subCategory.findByIdAndDelete(_id);

  return {
    success: true,
    message: "SubCategory DEleted Successfully",
    deletedSubCategory,
  };
};

const Customer = async (req) => {
  const getUser = await User.aggregate([
    {
      $match: {},
    },
    {
      $project: {
        email: 1,
        name: 1,
        address: 1,
        role: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);
  if (getUser.length === 0) {
    throw new ApiError(404, "No User Found");
  }

  return {
    success: true,
    message: "Customer got Successfully",
    data: getUser,
  };
};

const editCustomer = async (req) => {
  const { _id } = req.params;
  const { status } = req.body;
  const updateUser = await User.findOneAndUpdate(
    { _id },
    { status: status },
    { new: true }
  );
  if (!updateUser) {
    throw new ApiError(404, "no user found");
  }
  return {
    success: true,
    message: `user ${status} successfully`,
    data: updateUser,
  };
};

const oneCustomer = async (req) => {
  const { _id } = req.params;

  const getCustomer = await User.aggregate([
    {
      $match: {
        _id: _id,
      },
    },
    {
      $lookup: {
        from: "orders",
        localField: "_id",
        foreignField: "userId",
        as: "result",
      },
    },
  ]);

  if (!getCustomer || getCustomer.length === 0) {
    throw new ApiError(404, "User Not Found");
  }

  const customer = getCustomer[0];

  const productIds = customer.result
    .flatMap((order) => order.orderDetails.map((item) => item.products))
    .flat();

  const details = await Promise.all(
    productIds.map(async (productId) => {
      const product = await Product.findById(productId);
      return product;
    })
  );

  const response = {
    ...customer,
    result: customer.result.map((order) => ({
      ...order,
      orderDetails: order.orderDetails.map((item) => ({
        ...item,
        product: details.find(
          (product) => product._id.toString() === item.products.toString()
        ),
      })),
    })),
  };

  return {
    success: true,
    message: "User found Successfully",
    data: response,
  };
};

const brand = async (req) => {
  const { brandName } = req.body;
  const image = req.file;

  const key = `brand/POVIS_${Date.now()}_${image.originalname}`;
  const imageURL = await uploadToCloud(image, key);

  const createBrand = await Brand.create({
    brandName,
    brandImage: imageURL,
  });

  return {
    succes: true,
    message: "brand Created Successfully",
    data: createBrand,
  };
};

const getBrand = async (req) => {
  const findBrand = await Brand.find();
  if (findBrand.length === 0) {
    throw new ApiError(404, "Brand is Empty");
  }
  return {
    success: true,
    message: "get all the brands",
    data: findBrand,
  };
};

const getOneBrand = async (req) => {
  const { _id } = req.params;
  const findBrand = await Brand.findById(_id);
  if (!findBrand) {
    throw new ApiError(404, "Brand Bot Found");
  }

  return {
    success: true,
    message: "brand found Successfully",
    data: findBrand,
  };
};

const editBrand = async (req) => {
  const { _id } = req.params;
  const { brandName, status } = req.body;
  const image = req.file;

  const findOrder = await Brand.findOne({ _id });

  if (!findOrder) {
    throw new ApiError(404, "Order not found");
  }

  let updateFields = { brandName, status };

  if (image) {
    const key = `brand/POVIS_${Date.now()}_${image.originalname}`;
    const imageURL = await uploadToCloud(image, key);
    updateFields.brandImage = imageURL;
  }

  const updateBrand = await Brand.findOneAndUpdate({ _id }, updateFields, {
    new: true,
  });

  return {
    success: true,
    message: "Brand Edited Successfully",
    data: updateBrand,
  };
};

const deleteBrand = async (req) => {
  const { _id } = req.params;
  const findDelete = await Brand.findOneAndDelete({ _id });
  return {
    success: true,
    message: "Brand Deleted Successfully",
  };
};

const createOffer = async (req, res) => {
  const { offerTitle, discountPercentage, validFrom, validTo } = req.body;
  console.log(req.body);
  const offerImage = req.file;
  console.log(offerImage);

  if (!offerTitle || !discountPercentage || !validFrom || !validTo) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Provide all details: offerTitle=${offerTitle}, discountPercentage=${discountPercentage}, validFrom=${validFrom}, validTo=${validTo}`
    );
  }
  const duplicateTitle = await offers.findOne({ offerTitle });

  if (duplicateTitle) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Title already exists");
  }

  const key = `offer/POVIS_${Date.now()}_${image.originalname}`;
  const imageURL = await uploadToCloud(image, key);

  const createdOffer = await offers.create({
    ...req.body,
    offerImage: imageURL,
  });

  return {
    success: true,
    message: "Offer created successfully",
    data: createdOffer,
  };
};

const getOffers = async (req, res) => {
  const getOffers = await offers.find();

  if (!getOffers) {
    throw new ApiError(httpStatus.NOT_FOUND, "No offers found");
  }

  return {
    success: true,
    message: "Offers feched successfully",
    data: getOffers,
  };
};

const getOneOffer = async (req, res) => {
  const { _id } = req.params;
  const getOneOffer = await offers.findById(_id);

  if (!getOneOffer) {
    throw new ApiError(httpStatus.NOT_FOUND, "Offer not found");
  }

  return { success: true, message: "Offer fetched successfully", getOneOffer };
};

const updateOffers = async (req, res) => {
  const { offerTitle, discountPercentage, validFrom, validTo } = req.body;
  const offerImage = req.file;
  const { offerId } = req.params;

  if (!offerTitle || !discountPercentage || !validFrom || !validTo) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Provide all details: offerTitle=${offerTitle}, discountPercentage=${discountPercentage}, validFrom=${validFrom}, validTo=${validTo}`
    );
  }
  const duplicateTitle = await offers.findOne({
    offerTitle,
    _id: { $ne: offerId },
  });

  if (duplicateTitle) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Title already exists");
  }

  if (offerImage) {
    const key = `offer/POVIS_${Date.now()}_${offerImage.originalname}`;
    const imageURL = await uploadToCloud(offerImage, key);

    const createdOffer = await offers.create({
      ...req.body,
      offerImage: imageURL,
    });

    return {
      success: true,
      message: "Offer created successfully",
      data: createdOffer,
    };
  }

  const createdOffer = await offers.findByIdAndUpdate(
    { _id: offerId },
    { ...req.body }
  );

  return {
    success: true,
    message: "Offer created successfully",
    data: createdOffer,
  };
};

const updateOfferStatus = async (req, res) => {
  const { status } = req.body;
  const { _id } = req.params;

  if (!_id) {
    throw new ApiError(httpStatus.NOT_FOUND, "No OfferId provided");
  }

  const findOffer = await offers.findById({ _id });
  if (!findOffer) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No offer found");
  }

  const updatedOffer = await offers.findByIdAndUpdate(
    { _id },
    { status: status },
    { new: true }
  );

  return { succes: true, message: "Offer Status updated", data: updatedOffer };
};

const deleteOffers = async (req, res) => {
  const { offerId } = req.params;

  if (!offerId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No offerId provided");
  }

  const findOffer = await offers.findById({ _id: offerId });
  if (!findOffer) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No offer found");
  }

  const deletedOffer = await offers.findByIdAndDelete({ _id: offerId });

  const deletedOfferProducts = await offerProducts.findOneAndDelete({
    offerId,
  });

  return {
    success: true,
    message: "Offer Deleted successfully",
    data: { deletedOffer, deletedOfferProducts },
  };
};

const addProducts = async (req, res) => {
  const files = req.files; // req.files will be an object with field names as keys
  const bodyData = req.body; // The parsed body data

  console.log("========== STEP 1: Incoming Request ==========");
  console.log("Received Body:", JSON.stringify(bodyData, null, 2));
  console.log("Uploaded Files:", files);

  if (bodyData.productType === "nonVarition") {
    const productData = bodyData;

    const productImageFiles = files["productImage"]; // Array of product images
    console.log("productImage", productImageFiles);
    const productImageUrls = [];

    if (productImageFiles && Array.isArray(productImageFiles)) {
      console.log(`Found ${productImageFiles.length} Product Images`);

      for (let i = 0; i < productImageFiles.length; i++) {
        console.log(`Uploading Product Image ${i}:`, productImageFiles[i].path);
        const uploadedUrl = await uploadToCloud(productImageFiles[i], "product");
        console.log(`Uploaded Product Image ${i}:`, uploadedUrl);
        productImageUrls.push(uploadedUrl);
      }
    }

    const updatedProductData = {
      ...productData,
      productImage: productImageUrls, // Add Cloudinary URLs to product images
      // Trim spaces from inventory.trackStock and shipping.shippingClass
      inventory: {
        ...productData.inventory,
        trackStock: productData.inventory.trackStock.trim(),
      },
      shipping: {
        ...productData.shipping,
        shippingClass: productData.shipping.shippingClass.trim(),
      },
    };

    console.log("Prepared Product Data Object with Cloudinary URLs:");
    console.log(JSON.stringify(updatedProductData, null, 2));

    // STEP 5: Save the product to the database
    const createProduct = await Product.create(updatedProductData);
    console.log("Product Created in DB:", createProduct);

    // STEP 6: Success Response
    return res.status(201).json({
      message: "Product created successfully",
      data: createProduct,
    });
  } else {
    const productData = bodyData; // Access the first product object

    // Check if 'varient' exists and is an array, otherwise default to an empty array
    const variants = Array.isArray(productData.varient)
      ? productData.varient
      : [];

    // STEP 2: Upload product images to Cloudinary
    const productImageFiles = files["productImage"]; // Array of product images
    const productImageUrls = [];

    if (productImageFiles && Array.isArray(productImageFiles)) {
      console.log(`Found ${productImageFiles.length} Product Image`);

      for (let i = 0; i < productImageFiles.length; i++) {
        console.log(`Uploading Product Image ${i}:`, productImageFiles[i].path);
        const uploadedUrl = await uploadToCloud(productImageFiles[i], "product");
        console.log(`Uploaded Product Image ${i}:`, uploadedUrl);
        productImageUrls.push(uploadedUrl);
      }
    }

    // STEP 3: Upload variant images to Cloudinary if present
    const variantImageFiles = files["variantImages"]; // Array of variant images
    const variantImageUrls = [];

    if (variantImageFiles && Array.isArray(variantImageFiles)) {
      console.log(`Found ${variantImageFiles.length} Variant Images`);

      for (let i = 0; i < variantImageFiles.length; i++) {
        console.log(`Uploading Variant Image ${i}:`, variantImageFiles[i].path);
        const uploadedVariantUrl = await uploadToCloud(
          variantImageFiles[i], "VariantProduct");
        // const uploadedUrl = await uploadToCloud(productImageFiles[i], "product"
        // );
        console.log(`Uploaded Variant Image ${i}:`, uploadedVariantUrl);
        variantImageUrls.push(uploadedVariantUrl);
      }
    }

    // STEP 4: Prepare the product data with updated URLs
    const updatedProductData = {
      ...productData,
      productImage: productImageUrls, // Add Cloudinary URLs to product images
      varient: variants.map((variant, index) => ({
        ...variant,
        varientImage: variantImageUrls[index] || null, // Assign the variant image URL
        // Trim spaces from productUnit and varientType
        productUnit: variant.productUnit.trim(),
        varientType: variant.varientType.trim(),
      })),
      // Trim spaces from inventory.trackStock and shipping.shippingClass
      inventory: {
        ...productData.inventory,
        trackStock: productData.inventory.trackStock.trim(),
      },
      shipping: {
        ...productData.shipping,
        shippingClass: productData.shipping.shippingClass.trim(),
      },
    };

    console.log("Prepared Product Data Object with Cloudinary URLs:");
    console.log(JSON.stringify(updatedProductData, null, 2));

    // STEP 5: Save the product to the database
    const createProduct = await Product.create(updatedProductData);
    console.log("Product Created in DB:", createProduct);

    // STEP 6: Success Response
    return {
      message: "Product created successfully",
      data: createProduct,
    };
  }
};

const editProducts = async (req, res) => {
  const { _id } = req.params;
  const files = req.files || {}; // Default to empty object if undefined
  const bodyData = req.body || {}; // Default to empty object if undefined

  console.log("_id", _id);
  console.log("========== STEP 1: Incoming Request ==========");
  console.log("Received Body:", bodyData);
  console.log("Received Files:", files);
  console.log("Content-Type:", req.headers["content-type"]); // Log to debug request type

  if (bodyData.productType === "nonVarition") {
    const productData = bodyData;

    const productImageFiles = files["productImage"] || []; // Default to empty array
    const productImageUrls = [];

    for (let i = 0; i < productImageFiles.length; i++) {
      const uploadedUrl = await uploadToCloud(productImageFiles[i], "product");
      productImageUrls.push(uploadedUrl);
    }

    const updatedProductData = {
      ...productData,
      productImage: productImageUrls,
      inventory: productData.inventory
        ? {
          ...productData.inventory,
          trackStock: productData.inventory.trackStock?.trim() || "",
        }
        : {},
      shipping: productData.shipping
        ? {
          ...productData.shipping,
          shippingClass: productData.shipping.shippingClass?.trim() || "",
        }
        : {},
    };

    const updateProduct = await Product.findByIdAndUpdate(
      _id,
      updatedProductData,
      { new: true }
    );

    return {
      message: "Product updated successfully",
      data: updateProduct,
    };
  } else {
    const productData = bodyData;
    const variants = Array.isArray(productData.varient)
      ? productData.varient
      : [];

    const productImageFiles = files["productImage"] || []; // Default to empty array
    const productImageUrls = [];

    for (let i = 0; i < productImageFiles.length; i++) {
      const uploadedUrl = await uploadToCloud(productImageFiles[i], "product");
      productImageUrls.push(uploadedUrl);
    }

    const variantImageFiles = files["variantImages"] || []; // Default to empty array
    const variantImageUrls = [];

    for (let i = 0; i < variantImageFiles.length; i++) {
      const uploadedVariantUrl = await uploadToCloud(variantImageFiles[i], "VariantProduct");
      variantImageUrls.push(uploadedVariantUrl);
    }

    const updatedProductData = {
      ...productData,
      productImage: productImageUrls,
      varient: variants.map((variant, index) => ({
        ...variant,
        varientImage: variantImageUrls[index] || null,
        productUnit: variant.productUnit?.trim() || "",
        varientType: variant.varientType?.trim() || "",
      })),
      inventory: productData.inventory
        ? {
          ...productData.inventory,
          trackStock: productData.inventory.trackStock?.trim() || "",
        }
        : {},
      shipping: productData.shipping
        ? {
          ...productData.shipping,
          shippingClass: productData.shipping.shippingClass?.trim() || "",
        }
        : {},
    };

    const updateProduct = await Product.findByIdAndUpdate(
      _id,
      updatedProductData,
      { new: true }
    );

    return {
      message: "Product updated successfully",
      data: updateProduct,
    };
  }
};

const getAllProducts = async (req, res) => {
  const products = await Product.aggregate([
    {
      $lookup: {
        from: "product",
        localField: "linkProducts.upSellProducts",
        foreignField: "_id",
        as: "upSellProducts"
      }
    },
    {
      $lookup: {
        from: "product",
        localField: "linkProducts.crossSellProducts",
        foreignField: "_id",
        as: "crossSellProducts"
      }
    },
    {
      $project: {
        _id: 1,
        productImage: 1,
        productType: 1,
        productBrand: 1,
        brand_id: 1,
        productCategory: 1,
        category_id: 1,
        productSubCategory: 1,
        subcategory_id: 1,
        productName: 1,
        varient: 1,
        productBenifits: 1,
        productDescription: 1,
        ingredients: 1,
        inventory: 1,
        shipping: 1,
        linkProducts: 1,
        createdAt: 1,
        updatedAt: 1,
        status: 1,
        nonVarient: 1,
        "upSellProducts.productName": 1,
        "crossSellProducts.productName": 1
      }
    }
  ]
  );

  return {
    success: true,
    message: "Products fetched successfully",
    data: products,
  };
};

const getProductById = async (req, res) => {
  const { _id } = req.params;

  const product = await Product.findById(_id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return {
    success: true,
    message: "Product fetched successfully",
    data: product,
  };
};

const editProductStatus = async (req, res) => {
  const { _id } = req.params;
  const { status } = req.body;

  if (!_id) {
    throw new ApiError(httpStatus.NOT_FOUND, "No product id provided");
  }

  const findProduct = await Product.findById(_id);

  if (!findProduct) {
    throw new ApiError(httpStatus.NOT_FOUND, "No product found");
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    _id,
    { status },
    { new: true, runValidators: false },
    { new: true }
  );

  return {
    success: true,
    message: "Product ststus updated successfully",
    data: updatedProduct,
  };
};

const deleteProduct = async (req, res) => {
  const { _id } = req.params;

  const product = await Product.findById(_id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  await Product.findByIdAndDelete(_id);

  return {
    success: true,
    message: "Product deleted successfully",
  };
};

const getReport = async (req, res) => {
  const { time, startDate: reqStart, endDate: reqEnd, format } = req.query;
  let fetchedOrders = [];
  let start, end;

  // Switch logic to filter orders by date range
  switch (time) {
    case "ThisMonth":
      start = new Date();
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end = new Date();
      break;

    case "LastMonth":
      const now = new Date();
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      break;

    case "Last3Months":
      const now3 = new Date();
      start = new Date(now3.getFullYear(), now3.getMonth() - 2, 1);
      end = new Date();
      break;

    case "Last6Months":
      const now6 = new Date();
      start = new Date(now6.getFullYear(), now6.getMonth() - 5, 1);
      end = new Date();
      break;

    case "ThisYear":
      start = new Date(new Date().getFullYear(), 0, 1);
      end = new Date();
      break;

    case "Custom":
      if (!reqStart || !reqEnd) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Start date and end date are required for custom range"
        );
      }
      start = new Date(reqStart);
      end = new Date(reqEnd);
      end.setHours(23, 59, 59, 999); // include the whole day
      break;

    default:
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid time range selected");
  }

  fetchedOrders = await getFilteredOrders(start, end);
  const graphData = await generateGraphData(start, end);

  const totalOrders = fetchedOrders.length;
  const totalSales = fetchedOrders.reduce(
    (sum, order) => sum + (order.totalPrice || 0),
    0
  );
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  const orderCancelled = fetchedOrders.filter(
    (order) => order.orderStatus === "Cancelled"
  ).length;
  const orderDelivered = fetchedOrders.filter(
    (order) => order.orderStatus === "Delivered"
  ).length;
  const orderPending = fetchedOrders.filter((order) =>
    ["Ordered", "Packing", "Shipped"].includes(order.orderStatus)
  ).length;

  if (format === "pdf") {
    const stats = {
      totalOrders: totalOrders,
      totalSales: totalSales,
      averageOrderValue: averageOrderValue,
      orderCancelled: orderCancelled,
      orderDelivered: orderDelivered,
      orderPending: orderPending,
    };
    const pdfBuffer = await generateOrderReportPDF({ time, stats, graphData });

    return {
      isPdf: true,
      buffer: pdfBuffer,
    };
  }
  return {
    success: true,
    message: `Orders filtered by time: ${time}`,
    orders: fetchedOrders,
    stats: {
      totalOrders,
      totalSales,
      averageOrderValue,
      orderCancelled,
      orderDelivered,
      orderPending,
      graphData,
    },
  };

  async function getFilteredOrders(startDate, endDate) {
    return await orderDetailsModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      { $unwind: "$orderDetails" },
      {
        $lookup: {
          from: "product",
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
  }

  async function generateGraphData(startDate, endDate) {
    const graphData = await orderDetailsModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          Sales: { $sum: "$totalPrice" },
          Orders: { $sum: 1 },
          Returns: {
            $sum: {
              $cond: [{ $eq: ["$orderStatus", "Cancelled"] }, 1, 0],
            },
          },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return graphData.map((entry) => ({
      year: entry._id.year,
      month: monthNames[entry._id.month - 1],
      Sales: entry.Sales,
      Orders: entry.Orders,
      Returns: entry.Returns,
    }));
  }
};

const getOrder = async (req, res) => {
  const fetchedOrders = await orderDetailsModel.aggregate([
    { $unwind: "$orderDetails" },
    { $unwind: "$orderDetails.products" },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    {
      $unwind: "$userDetails",
    },
    {
      $lookup: {
        from: "product",
        localField: "orderDetails.products.productId",
        foreignField: "_id",
        as: "productInfo",
      },
    },

    { $unwind: "$productInfo" },
    {
      $addFields: {
        "orderDetails.products.selectedVariant": {
          $let: {
            vars: {
              variantType: "$productInfo.variant.variantType",
              variantId: "$orderDetails.products.variantId"
            },
            in: {
              $cond: [
                { $eq: ["$orderDetails.products.productType", "variation"] },
                {
                  $mergeObjects: [
                    {
                      productTitle: "$productInfo.productTitle",
                      productName: "$productInfo.productName"
                    },
                    {
                      $switch: {
                        branches: [
                          {
                            case: { $eq: ["$$variantType", "sizeColor"] },
                            then: {
                              $first: {
                                $filter: {
                                  input: "$productInfo.variant.sizeColorVariants",
                                  as: "v",
                                  cond: { $eq: ["$$v._id", "$$variantId"] }
                                }
                              }
                            }
                          },
                          {
                            case: { $eq: ["$$variantType", "colorOnly"] },
                            then: {
                              $first: {
                                $filter: {
                                  input: "$productInfo.variant.colorOnlyVariants",
                                  as: "v",
                                  cond: { $eq: ["$$v._id", "$$variantId"] }
                                }
                              }
                            }
                          },
                          {
                            case: { $eq: ["$$variantType", "sizeOnly"] },
                            then: {
                              $first: {
                                $filter: {
                                  input: "$productInfo.variant.sizeOnlyVariants",
                                  as: "v",
                                  cond: { $eq: ["$$v._id", "$$variantId"] }
                                }
                              }
                            }
                          }
                        ],
                        default: null
                      }
                    }
                  ]
                },
                {
                  $mergeObjects: [
                    "$productInfo.nonVariant",
                    {
                      productTitle: "$productInfo.productTitle",
                      productName: "$productInfo.productName"
                    }
                  ]
                }
              ]
            }
          }
        }
      }

    }

    ,
    {
      $project: {
        _id: 1,
        orderId: 1,
        userId: 1,
        orderStatus: 1,
        returnStatus: 1,
        paymentStatus: 1,
        totalPrice: 1,
        paymentMethod: 1,
        reason: 1,
        returnImage: 1,
        deliveryAddress: 1,
        billingAddress: 1,
        createdAt: 1,
        updatedAt: 1,
        userDetails: {
          name: "$userDetails.name",
          email: "$userDetails.email",
        },
        __v: 1,
        orderDetails: {
          _id: "$orderDetails._id",
          cartQuantity: "$orderDetails.cartQuantity",
          couponCode: "$orderDetails.couponCode",
          price: "$orderDetails.price",
          products: {
            productId: "$orderDetails.products.productId",
            variantId: "$orderDetails.products.variantId",
            productType: "$orderDetails.products.productType",
            quantity: "$orderDetails.products.quantity",
            price: "$orderDetails.products.price",
            subtotal: "$orderDetails.products.subtotal",
            productImage: "$productInfo.productImage",
            productBrand: "$productInfo.productBrand",
            orderStatus: "$orderDetails.products.orderStatus",
            returnReason: "$orderDetails.products.returnReason",
            returnImage: "$orderDetails.products.returnImage",
            selectedVariant: "$orderDetails.products.selectedVariant",
          },
        },
      },
    },
    {
      $group: {
        _id: "$_id",
        rootDoc: { $first: "$$ROOT" },
        products: { $push: "$orderDetails.products" },
      },
    },
    {
      $addFields: {
        "rootDoc.orderDetails.products": "$products",
      },
    },
    {
      $replaceRoot: {
        newRoot: "$rootDoc",
      },
    },
    { $sort: { createdAt: -1 } }
  ]);

  return { success: true, message: "Fetched orders", data: fetchedOrders };
};

const editOrders = async (req, res) => {
  const { _id } = req.params;
  const { orderStatus, paymentStatus } = req.body;

  if (!_id) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No Order ID provided");
  }

  const findOrder = await orderDetailsModel.findById(_id);
  if (!findOrder) {
    throw new ApiError(httpStatus.NOT_FOUND, "No order found");
  }

  // ✅ Update order-level status
  const updateFields = {};
  if (orderStatus) updateFields.orderStatus = orderStatus;
  if (paymentStatus) updateFields.paymentStatus = paymentStatus;

  // Update order timestamps based on status
  if (orderStatus === "Ordered" && !findOrder.orderConfirmedAt) {
    updateFields.orderConfirmedAt = new Date();
    updateFields.expiresAt = null; // Remove TTL expiry once confirmed
  }

  const updateOrder = await orderDetailsModel.findByIdAndUpdate(
    _id,
    { $set: updateFields },
    { new: true }
  );

  // ✅ Update product-level statuses ONLY for non-return products
  if (orderStatus && !["Return Request", "Returned", "Partial"].includes(orderStatus)) {
    await orderDetailsModel.findByIdAndUpdate(
      _id,
      {
        $set: {
          "orderDetails.$[].products.$[elem].orderStatus": orderStatus
        }
      },
      {
        arrayFilters: [
          { 
            "elem.returnStatus": { $nin: ["Request", "In Process", "Approved"] }
          }
        ],
        new: true
      }
    );
  }

  // ✅ Update payment status for all products if changed
  if (paymentStatus) {
    await orderDetailsModel.findByIdAndUpdate(
      _id,
      {
        $set: {
          "orderDetails.$[].products.$[].paymentStatus": paymentStatus
        }
      },
      { new: true }
    );
  }

  return {
    success: true,
    message: "Order updated successfully",
    data: updateOrder,
  };
};

const editReturnStatus = async (req) => {
  const { orderId, productId, variantId, status } = req.body;

  // Validation
  if (!orderId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Order ID is required");
  }
  if (!productId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product ID is required");
  }
  if (!status || !["Approved", "Rejected"].includes(status)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid status. Must be 'Approved' or 'Rejected'");
  }

  // Find order
  const order = await orderDetailsModel.findById(orderId);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
  }

  // Validate order structure
  if (!order.orderDetails?.[0]?.products?.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Order has no products");
  }

  const products = order.orderDetails[0].products;

  // Find product (match by productId and variantId if provided)
  const productIndex = products.findIndex((p) => {
    const productMatch = p.productId.toString() === productId.toString();
    
    if (variantId) {
      return productMatch && p.variantId?.toString() === variantId.toString();
    }
    
    return productMatch;
  });

  if (productIndex === -1) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found in order");
  }

  const product = products[productIndex];

  // Validate current status
  if (product.orderStatus !== "Return Request") {
    throw new ApiError(
      httpStatus.BAD_REQUEST, 
      "Product is not in return request status"
    );
  }

  // Map status to proper enum values
  let productOrderStatus, productReturnStatus, productPaymentStatus;

  if (status === "Approved") {
    productOrderStatus = "Returned";
    productReturnStatus = "Approved";
    productPaymentStatus = "Refunded"; // Mark as refunded when approved
  } else if (status === "Rejected") {
    productOrderStatus = "Delivered"; // Revert to Delivered
    productReturnStatus = "Rejected";
    // paymentStatus remains "Completed"
  }

  // Update product-level status
  products[productIndex].orderStatus = productOrderStatus;
  products[productIndex].returnStatus = productReturnStatus;
  if (productPaymentStatus) {
    products[productIndex].paymentStatus = productPaymentStatus;
  }

  // ✅ CRITICAL: Recalculate order-level status based on ALL products
  const statusCounts = {
    returned: 0,
    delivered: 0,
    returnRequested: 0,
    others: 0,
    total: products.length
  };

  products.forEach(p => {
    if (p.orderStatus === "Returned") {
      statusCounts.returned++;
    } else if (p.orderStatus === "Delivered") {
      statusCounts.delivered++;
    } else if (p.orderStatus === "Return Request") {
      statusCounts.returnRequested++;
    } else {
      statusCounts.others++;
    }
  });

  // Determine order-level status
  if (statusCounts.returned === statusCounts.total) {
    // All products returned
    order.orderStatus = "Returned";
    order.returnStatus = "Approved";
    // order.paymentStatus = "Refunded";
  } else if (statusCounts.returned > 0) {
    // Partial return
    order.orderStatus = "Partial";
    order.returnStatus = "Approved"; // Some approved
    // order.paymentStatus = "Partial"; // Partially refunded
  } else if (statusCounts.returnRequested > 0) {
    // Still has pending return requests
    order.orderStatus = "Return Request";
    order.returnStatus = "In Process";
  } else if (statusCounts.delivered === statusCounts.total) {
    // All delivered (no returns)
    order.orderStatus = "Delivered";
    order.returnStatus = null;
    // order.paymentStatus = "Completed";
  }

  // Save changes
  await order.save();

  return {
    success: true,
    message: `Return request ${status.toLowerCase()} successfully`,
    data: {
      orderId: order.orderId,
      orderStatus: order.orderStatus,
      updatedProduct: {
        productId: product.productId,
        variantId: product.variantId,
        orderStatus: product.orderStatus,
        returnStatus: product.returnStatus,
        paymentStatus: product.paymentStatus
      }
    }
  };
};


const systemUser = async (req) => {
  const {
    userName,
    role,
    mobileNumber,
    email,
    password,
    userRole,
    conformPassword,
    permissions = {},
  } = req.body;

  console.log("Request body:", req.body);

  const findEmail = await admin.findOne({ email });
  if (findEmail) {
    throw new ApiError(400, "Email already exists");
  }

  if (password !== conformPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  const salt = await Bcrypt.genSalt(10);
  const hash = await Bcrypt.hash(password, salt);

  const createAdmin = await admin.create({
    userName,
    role,
    userRole,
    mobileNumber,
    email,
    password: hash,
    permissions,
  });

  return {
    success: true,
    message: "Admin created successfully",
    data: createAdmin,
  };
};

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const Login = async (req) => {
  const { password, email } = req.body;

  // console.log("Login attempt for email:", email);

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const findAdmin = await admin
    .findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") }
    })
    .select("+password");

  console.log("Found admin:", findAdmin ? findAdmin.email : "none");

  if (!findAdmin) {
    throw new ApiError(404, "Invalid email or password. Please try again.");
  }

  if (findAdmin.status === "inactive") {
    throw new ApiError(404, "Account Inactived by Super Admin");
  }

  const isPasswordValid = await Bcrypt.compare(password, findAdmin.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const token = await generateToken(findAdmin._id, findAdmin.role);

  return {
    success: true,
    message: "Login successful",
    token: token,
    admin: {
      id: findAdmin._id,
      email: findAdmin.email,
      role: findAdmin.role,
      userName: findAdmin.userName,
      mobileNumber: findAdmin.mobileNumber,
      permissions: findAdmin.permissions,
    },
  };
};

const getUserById = async (req) => {
  const userId = req.Admin?._id;
  const findUser = await admin.findById(userId);
  if (!findUser) {
    throw new ApiError(404, "User not found");
  }
  return {
    success: true,
    message: "User found successfully",
    data: findUser,
  };
};

const getAllAdmin = async (req) => {
  const userId = req.Admin._id;
  console.log("userId", userId);
  if (!userId) {
    throw new ApiError(401, "User Must Login");
  }
  const findAdmin = await admin.find();
  if (findAdmin.length === 0) {
    throw new ApiError(404, "no Admin found");
  }

  return {
    success: true,
    message: "user get successfully",
    data: findAdmin,
  };
};

const editSystemUser = async (req) => {
  console.log("hi");
  const { _id } = req.params;
  console.log("_id", _id);

  console.log("body", req.body);
  const {
    userName,
    userRole,
    mobileNumber,
    email,
    status,
    password,
    conformPassword,
    permissions,
  } = req.body;

  const existingUser = await admin.findById(_id);
  if (!existingUser) throw new ApiError(404, "Admin not found");

  console.log("");

  if (email && email !== existingUser.email) {
    const emailExists = await admin.findOne({ email });
    if (emailExists) throw new ApiError(400, "Email already in use");
  }

  const updateFields = {};

  if (userName) updateFields.userName = userName;
  if (userRole) updateFields.userRole = userRole;
  if (mobileNumber) updateFields.mobileNumber = mobileNumber;
  if (email) updateFields.email = email;
  if (permissions) updateFields.permissions = permissions;
  if (status) updateFields.status = status;

  if (password) {
    const salt = await Bcrypt.genSalt(10);
    const hashedPassword = await Bcrypt.hash(password, salt);
    updateFields.password = hashedPassword;
  }

  const updatedUser = await admin.findByIdAndUpdate(_id, updateFields, {
    new: true,
  });

  console.log;

  return {
    success: true,
    message: "Admin updated successfully",
    data: updatedUser,
  };
};

const forgotPassword = async (req) => {
  const { email } = req.body;

  const adminData = await admin.findOne({ email });
  if (!adminData) {
    return { success: false, message: "Admin not found" };
  }

  // ⛔ If OTP already valid, don’t spam
  if (adminData.otpExpire && adminData.otpExpire > Date.now()) {
    return {
      success: false,
      message: "OTP already sent. Please check your email",
    };
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  adminData.otp = otp;
  adminData.otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  await adminData.save();

  await sendmail.sendUserOtp({
    email: adminData.email,
    OTP: otp,
    purpose: "password reset",
  });

  return {
    success: true,
    message: "OTP sent to registered email",
  };
};


const resendOtp = async (req) => {
  const { email } = req.body;

  const adminData = await admin.findOne({ email });
  if (!adminData) {
    return { success: false, message: "Admin not found" };
  }

  // ⛔ If current OTP still valid
  if (adminData.otpExpire && adminData.otpExpire > Date.now()) {
    return {
      success: false,
      message: "OTP already sent. Please wait before resending",
    };
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  adminData.otp = otp;
  adminData.otpExpire = Date.now() + 10 * 60 * 1000;
  await adminData.save();

  await sendmail.sendUserOtp({
    email: adminData.email,
    OTP: otp,
    purpose: "password reset",
  });

  return {
    success: true,
    message: "OTP resent successfully",
  };
};


const verifyResetOtp = async (req) => {
  const { email, otp } = req.body;

  const adminData = await admin.findOne({ email });
  if (!adminData) {
    return { success: false, message: "Admin not found" };
  }

  if (!adminData.otp || !adminData.otpExpire) {
    return { success: false, message: "No OTP request found" };
  }

  if (adminData.otpExpire < Date.now()) {
    return { success: false, message: "OTP expired" };
  }

  if (adminData.otp !== otp) {
    return { success: false, message: "Invalid OTP" };
  }

  return {
    success: true,
    message: "OTP verified successfully",
  };
};


const resetPassword = async (req) => {
  const { email, otp, newPassword } = req.body;

  const adminData = await admin.findOne({ email });
  if (!adminData) {
    return { success: false, message: "Admin not found" };
  }

  if (!adminData.otp || !adminData.otpExpire) {
    return { success: false, message: "OTP verification required" };
  }

  if (adminData.otpExpire < Date.now()) {
    return { success: false, message: "OTP expired" };
  }

  if (adminData.otp !== otp) {
    return { success: false, message: "Invalid OTP" };
  }

  const hashedPassword = await Bcrypt.hash(newPassword, 10);

  adminData.password = hashedPassword;
  adminData.otp = null;
  adminData.otpExpire = null;

  await adminData.save();

  return {
    success: true,
    message: "Password reset successfully",
  };
};



const deleteSystemUser = async (req) => {
  const { _id } = req.params;

  const existingUser = await admin.findById(_id);
  if (!existingUser) throw new ApiError(404, "Admin not found");

  await admin.findByIdAndDelete(_id);

  return {
    success: true,
    message: "Admin deleted successfully",
  };
};

const getReviewRatings = async (req, res) => {
  const reviewRatings = await reviewsRatings.aggregate([
    {
      $lookup: {
        from: "product",
        localField: "productId",
        foreignField: "_id",
        as: "productInfo",
      },
    },
    {
      $unwind: {
        path: "$productInfo",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    {
      $unwind: {
        path: "$userDetails",
      },
    },
    {
      $group: {
        _id: "$productId",
        totalReviews: { $sum: 1 },
        averageRating: { $avg: "$rating" },
        product: { $first: "$productInfo" },
        reviews: {
          $push: {
            _id: "$_id",
            userName: "$userDetails.name",
            rating: "$rating",
            review: "$review",
            reviewImages: "$reviewImages",
            createdAt: "$createdAt",
          },
        },
      },
    },
  ]);

  return {
    succes: true,
    message: "reviews and rating fetched successfully",
    data: reviewRatings,
  };
};

const deleteReviewsRatings = async (req, res) => {
  const { _id } = req.params;
  const existingReview = await reviewsRatings.findById(_id);
  if (!existingReview) throw new ApiError(404, "Review not found");

  await reviewsRatings.findByIdAndDelete(_id);

  return {
    success: true,
    message: "Review deleted successfully",
  };
}

const notification = async (req) => {
  console.log(req.body);
  const { sendTo, title, message } = req.body;
  const Image = req.file;
  let imageURL = null;

  if (Image) {
    imageURL = await uploadToCloud(Image, "notification");
  }


  let users = [];

  if (sendTo === "all") {
    users = await User.find();
  }

  if (users.length === 0) {
    throw new ApiError(404, "No users found for the specified type.");
  }

  const emails = users.map((user) => user.email);
  // console.log("emails", emails);

  const send = await Promise.all(
    emails.map(async (email) => {
      const emailSend = await sendmail.sendNotification({
        email,
        title,
        message,
        imageURL,
      });
      return emailSend;
    })
  );

  const createNotification = await Notify.create({
    title,
    message,
    image: imageURL,
    sendTo,
  });

  console.log("created", createNotification);

  return {
    success: true,
    message: "Mail send Successfully",
    createNotification,
  };
};

const getNotification = async (req) => {
  const findNotification = await Notify.find();

  if (findNotification.length === 0) {
    throw new ApiError(404, "Notification is empty");
  }

  return {
    success: true,
    message: "notification get successfully",
    data: findNotification,
  };
};

const filterNotification = async (req) => {
  const { date } = req.body;
  const findNotification = await Notify.find({ date });
};
const createFeaturedSection = async (req, res) => {
  const { title } = req.body;

  if (!title) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `provide details: title: ${title}`
    );
  }

  const dupilicateTitle = await featuredSection.find({ title });

  if (dupilicateTitle.length != 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Featured section alredy exists"
    );
  }

  const addFeaturedSection = await featuredSection.create({ ...req.body });

  return {
    success: true,
    message: "Featured section created successfully",
    data: addFeaturedSection,
  };
};

const getFeaturedSection = async (req, res) => {

  const getFeaturedSection = await featuredSection.find();

  if (!getFeaturedSection) {
    throw new ApiError(httpStatus.NOT_FOUND, "No featured section found");
  }

  return {
    success: true,
    message: "Fetched featued section successfully",
    data: getFeaturedSection,
  };
};

const updateFeaturedSection = async (req, res) => {
  const { title } = req.body;
  const { _id } = req.params;

  const findDuplicate = await featuredSection.find({
    title,
    _id: { $ne: _id },
  });

  if (findDuplicate.length > 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Title already exists");
  }

  const updatedFeaturedSection = await featuredSection.findByIdAndUpdate(
    { _id },
    { ...req.body },
    { new: true }
  );

  return {
    success: true,
    message: "Updated Featured Section",
    data: updatedFeaturedSection,
  };
};

const updateStatusFeatureSection = async (req, res) => {
  const { _id } = req.params;
  const { status } = req.body;

  if (!_id) {
    throw new ApiError(httpStatus.NOT_FOUND, "No Id provided");
  }

  const updatedStatus = await featuredSection.findByIdAndUpdate(
    _id,
    { status: status },
    { new: true }
  );

  if (!updatedStatus) {
    throw new ApiError(httpStatus.NOT_FOUND, "Feature Section not found");
  }

  return {
    success: true,
    message: "Status updated successfully",
    data: updatedStatus,
  };
};

const deleteFeaturedSection = async (req, res) => {
  const { _id } = req.params;

  if (!_id) {
    throw new ApiError(httpStatus.NOT_FOUND, "No Id provided");
  }

  const deletdFeaturedSection = await featuredSection.findByIdAndDelete({
    _id,
  });

  return {
    success: true,
    message: "Featued Section deleted successfully",
    data: deletdFeaturedSection,
  };
};

const addOfferProducts = async (req, res) => {
  const { productIds, offerId } = req.body;

  if (!offerId) {
    throw new ApiError(httpStatus.NOT_FOUND, "No offer id provided");
  }

  const offeredProducts = await offerProducts.create({ ...req.body });

  return {
    success: true,
    message: "Offer products created",
    data: offeredProducts,
  };
};

const getOfferProducts = async (req, res) => {
  const { _id } = req.params;
  const offeredProducts = await offerProducts.aggregate([
    {
      $match: {
        offerId: _id,
      },
    },
    {
      $lookup: {
        from: "offers",
        localField: "offerId",
        foreignField: "_id",
        as: "offerDetails",
      },
    },
    {
      $unwind: {
        path: "$offerDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: "$productIds",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "product",
        localField: "productIds",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    {
      $unwind: {
        path: "$productDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "category",
        localField: "productDetails.category",
        foreignField: "_id",
        as: "categoryDetails",
      },
    },
    {
      $group: {
        _id: "$_id",
        offerId: { $first: "$offerId" },
        offerDetails: { $first: "$offerDetails" },
        productIds: { $push: "$productIds" },
        productDetails: { $push: "$productDetails" },
        categoryDetails: { $push: { $first: "$categoryDetails" } },
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
      },
    },
  ]);

  if (!offeredProducts) {
    throw new ApiError(httpStatus.NOT_FOUND, "No offer or products found");
  }

  return {
    success: true,
    message: "Fetched all products",
    data: offeredProducts,
  };
};

const updateOfferProducts = async (req, res) => {
  const { _id } = req.params;
  const { productIds } = req.body;

  if (!_id) {
    throw new ApiError(httpStatus.NOT_FOUND, "No offer Id provided");
  }

  const updatedOfferProducts = await offerProducts.findOneAndUpdate(
    { offerId: _id },
    { productIds },
    { new: true }
  );

  return {
    success: true,
    message: "Offer products updated successfully",
    data: updatedOfferProducts,
  };
};

const getOfferAndNotAppliedProducts = async (req, res) => {
  const { _id } = req.params;

  const getOfferAppliedProdcuts = await offerProducts.aggregate([
    {
      $match: { offerId: _id },
    },
    {
      $project: {
        productIds: 1,
      },
    },
  ]);

  const appliedProductIds = getOfferAppliedProdcuts?.[0]?.productIds || [];

  const products = await Product.find();

  const productsChecked = products.map((product) => {
    if (appliedProductIds.includes(product._id)) {
      return {
        ...product.toObject(), // convert mongoose document to plain object
        checked: true,
      };
    } else {
      return product;
    }
  });

  return {
    success: true,
    message: "Fetched checkd and not checked products",
    data: productsChecked,
  };
};

const addFeaturedProducts = async (req, res) => {
  const { productIds, featuredId } = req.body;

  if (!featuredId) {
    throw new ApiError(httpStatus.NOT_FOUND, "No feature id provided");
  }

  const existingFeaturedProdcuts = await featuredProducts.findOne({
    featuredId,
  });

  if (existingFeaturedProdcuts) {
    const updatedFeaturedProducts = await featuredProducts.findOneAndUpdate(
      { featuredId },
      { productIds },
      { new: true }
    );

    return {
      success: true,
      message: "Feature products updated successfully",
      data: updatedFeaturedProducts,
    };
  }

  const featuredProductsData = await featuredProducts.create({ ...req.body });

  return {
    success: true,
    message: "feature products created",
    data: featuredProductsData,
  };
};

const getFeaturedProducts = async (req, res) => {
  const { _id } = req.params;
  const featuredProductsData = await featuredProducts.aggregate([
    {
      $match: {
        featuredId: _id,
      },
    },
    {
      $lookup: {
        from: "featruedSection",
        localField: "featuredId",
        foreignField: "_id",
        as: "featruedSectionDetails",
      },
    },
    {
      $unwind: {
        path: "$featruedSectionDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: "$productIds",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "product",
        localField: "productIds",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    {
      $group: {
        _id: "$_id",
        featuredId: { $first: "$featuredId" },
        featruedSectionDetails: { $first: "$featruedSectionDetails" },
        productIds: { $push: "$productIds" },
        productDetails: { $push: { $first: "$productDetails" } },
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
      },
    },
  ]);

  if (!featuredProducts) {
    throw new ApiError(httpStatus.NOT_FOUND, "No featured or products found");
  }

  return {
    success: true,
    message: "Fetched all products",
    data: featuredProductsData,
  };
};

const updateFeaturedProducts = async (req, res) => {
  const { _id } = req.params;
  const { productIds } = req.body;

  if (!_id) {
    throw new ApiError(httpStatus.NOT_FOUND, "No Feature Id provided");
  }

  const updatedFeaturedProducts = await featuredProducts.findOneAndUpdate(
    { featuredId: _id },
    { productIds },
    { new: true }
  );

  return {
    success: true,
    message: "Feature products updated successfully",
    data: updatedFeaturedProducts,
  };
};
const getFeaturedAndNotAppliedProducts = async (req, res) => {
  const { _id } = req.params;

  const getFeautedAppliedProdcuts = await featuredProducts.aggregate([
    {
      $match: { featuredId: _id },
    },
    {
      $project: {
        productIds: 1,
      },
    },
  ]);

  const appliedProductIds = getFeautedAppliedProdcuts?.[0]?.productIds || [];

  const products = await Product.find();

  const productsChecked = products.map((product) => {
    if (appliedProductIds.includes(product._id)) {
      return {
        ...product.toObject(), // convert mongoose document to plain object
        checked: true,
      };
    } else {
      return product;
    }
  });

  return {
    success: true,
    message: "Fetched checkd and not checked products",
    data: productsChecked,
  };
};

const getSubCategoryBasedOnCategory = async (req, res) => {
  const { categoryId } = req.params;

  if (!categoryId) {
    throw new ApiError(httpStatus.NOT_FOUND, "No categoryId provided");
  }

  const subCategoryBasedOnCategory = await subCategory.aggregate([
    {
      $match: { status: "active", category: categoryId },
    },
  ]);

  if (subCategoryBasedOnCategory.length == 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No SubCategory found");
  }

  return {
    success: true,
    message: "SubCategory based on category fetched successfully",
    data: subCategoryBasedOnCategory,
  };
};

const storeSettingsData = async (req, res) => {
  const { appName } = req.body;
  const { logo, favicon } = req.files;

  if (!appName) {
    throw new ApiError(httpStatus.NOT_FOUND, "App name not provided");
  }

  const logoImageURL = await uploadToCloud(logo[0], "logo");
  const faviconImageURL = await uploadToCloud(favicon[0], "favicon");

  const storeSettingsData = await storeSettings.create({
    ...req.body,
    logo: logoImageURL,
    favicon: faviconImageURL,
  });

  return {
    success: true,
    message: "store Settings created",
    data: storeSettingsData,
  };
};

const getStoreSettingData = async (req, res) => {
  const getStoreData = await storeSettings.findOne();

  if (!getStoreData) {
    throw new ApiError(httpStatus.NOT_FOUND, "Store Settings Data not found");
  }

  return {
    success: true,
    message: "Store data fetched successfully",
    data: getStoreData,
  };
};

const editStoreSettingsData = async (req, res) => {
  if (req.files && req.files.logo) {
    const logoImageURL = await uploadToCloud(logo[0], "logo");
    const storeSettingsData = await storeSettings.findOneAndUpdate(
      {},
      { logo: logoImageURL }
    );
  }

  if (req.files && req.files.logo) {
    const faviconImageURL = await uploadToCloud(favicon[0], "favicon");
    const storeSettingsData = await storeSettings.findOneAndUpdate(
      {},
      { favicon: faviconImageURL }
    );
  }

  const updatedStoreSettings = await storeSettings.findOneAndUpdate(
    {},
    { ...req.body },
    { new: true }
  );

  if (!updatedStoreSettings) {
    throw new ApiError(httpStatus.NOT_FOUND, "Store settings not found");
  }
  return {
    success: true,
    message: "Store settings updated successfully",
    data: updatedStoreSettings,
  };
};

const createEmailSetting = async (req, res) => {
  let {
    email: emailAddress,
    password,
    smtpHost,
    smtpPort,
    emailContentType,
    smtpEncryption,
  } = req.body;

  // Validate the incoming data
  if (
    !emailAddress ||
    !password ||
    !smtpHost ||
    !smtpPort ||
    !emailContentType ||
    !smtpEncryption
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Please provide all details");
  }

  const ncryptObject = new ncrypt(config.encryptionDecryptionKey);

  emailAddress = ncryptObject.encrypt(emailAddress);
  password = ncryptObject.encrypt(password);
  smtpHost = ncryptObject.encrypt(smtpHost);

  const emailDB = await emailSettings.findOne();

  if (!emailDB) {
    const newEmailSetting = await emailSettings.create({
      email: emailAddress,
      password,
      smtpHost,
      smtpPort,
      emailContentType,
      smtpEncryption,
    });

    return {
      success: true,
      message: "Email Setting created successfully",
      data: newEmailSetting,
    };
  }
  const newEmailSetting = await emailSettings.findOneAndUpdate(
    {},
    {
      email: emailAddress,
      password,
      smtpHost,
      smtpPort,
      emailContentType,
      smtpEncryption,
    },
    { new: true }
  );

  return {
    success: true,
    message: "Email Setting Updated successfully",
    data: newEmailSetting,
  };
};

const getEmailSetting = async (req, res) => {
  const emailSettingsDB = await emailSettings.findOne();

  if (!emailSettings) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No email settings found");
  }

  let {
    email,
    password,
    smtpHost,
    smtpPort,
    emailContentType,
    smtpEncryption,
  } = emailSettingsDB;

  const ncryptObject = new ncrypt(config.encryptionDecryptionKey);

  email = ncryptObject.decrypt(email);
  password = ncryptObject.decrypt(password);
  smtpHost = ncryptObject.decrypt(smtpHost);

  return {
    success: true,
    message: "Email settings data fetched successfully",
    data: {
      smtpPort,
      emailContentType,
      smtpEncryption,
      email,
      password,
      smtpHost,
    },
  };
};

const createShippingMethod = async (req) => {
  let { localDelivery, standard, webhookUrl, webhookToken, email, password } =
    req.body;

  // Validate required fields
  if (!email || !password) throw new Error("Email & Password are required");
  if (standard && (!webhookUrl || !webhookToken)) {
    throw new Error("Webhook URL & Token required for Standard Shipping");
  }

  const ShippingMethodDB = await ShippingMethod.findOne();

  const ncryptObject = new ncrypt(config.encryptionDecryptionKey);

  email = ncryptObject.encrypt(email);
  password = ncryptObject.encrypt(password);
  webhookToken = ncryptObject.encrypt(webhookToken);

  if (!ShippingMethodDB) {
    const newMethod = await ShippingMethod.create({
      localDelivery,
      standard,
      webhookUrl,
      webhookToken,
      email,
      password,
    });

    return {
      success: true,
      message: "Shipping method + SMTP saved!",
      data: newMethod,
    };
  }

  const newMethod = await ShippingMethod.findOneAndUpdate(
    {},
    {
      localDelivery,
      standard,
      webhookUrl,
      webhookToken,
      email,
      password,
    },
    { new: true }
  );

  return {
    success: true,
    message: "Shipping method + SMTP Updated!",
    data: newMethod,
  };
};

const getShippingMethod = async () => {
  const methods = await ShippingMethod.findOne();
  if (!methods) throw new Error("No shipping methods found");

  let { localDelivery, standard, webhookUrl, webhookToken, email, password } =
    methods;

  const ncryptObject = new ncrypt(config.encryptionDecryptionKey);

  email = ncryptObject.decrypt(email);
  password = ncryptObject.decrypt(password);
  webhookToken = ncryptObject.decrypt(webhookToken);

  return {
    success: true,
    data: {
      localDelivery,
      standard,
      webhookUrl,
      webhookToken,
      email,
      password,
    },
  };
};

const createAboutus = async (req) => {
  const { title, content } = req.body;

  if (!title || !content) {
    throw new Error("Title and content are required!");
  }

  const aboutUsDB = await Aboutus.findOne();

  if (!aboutUsDB) {
    const cont = [];
    const contents = cont.push(content);
    const newPost = await Aboutus.create({ title, content: cont });
    return {
      success: true,
      message: "Created successfully!",
      data: newPost,
    };
  }

  const cont = [];
  const contents = cont.push(content);

  const newPost = await Aboutus.findOneAndUpdate({}, { title, content: cont });
  return {
    success: true,
    message: "Updated successfully!",
    data: newPost,
  };
};

const getAboutus = async () => {
  const posts = await Aboutus.findOne();
  if (!posts) throw new Error("No posts found!");
  return { success: true, data: posts };
};

const createContactus = async (req) => {
  const contactusBgImage = req.file;
  try {
    const contactUsDB = await contactus.findOne({});
    let contactUsBgImageURL = "";

    // Upload image if available
    if (contactusBgImage) {
      contactUsBgImageURL = await uploadToCloud(contactusBgImage, "contactus");
    }

    if (!contactUsDB) {
      // Create new document
      const newPost = await contactus.create({
        ...req.body,
        contactusBgImage: contactUsBgImageURL,
      });

      return {
        success: true,
        message: "Created successfully!",
        data: newPost,
      };
    }

    // Prepare update data
    const updateData = { ...req.body };
    if (contactUsBgImageURL) {
      console.log(contactUsBgImageURL, "Image url");
      updateData.contactusBgImage = contactUsBgImageURL;
    }

    const updatedPost = await contactus.findByIdAndUpdate(
      contactUsDB._id,
      updateData,
      { new: true }
    );

    return {
      success: true,
      message: "Updated successfully!",
      data: updatedPost,
    };
  } catch (error) {
    return {
      success: false,
      message: "Something went wrong.",
      error: error.message,
    };
  }
};

const getContactus = async () => {
  const posts = await contactus.findOne();
  if (!posts) throw new Error("No posts found!");
  return { success: true, data: posts };
};

const createprivacypolicy = async (req) => {
  const privacyPolicyDB = await PrivacyPolicy.findOne();

  if (!privacyPolicyDB) {
    const newPost = await PrivacyPolicy.create({ ...req.body });
    return {
      success: true,
      message: " created successfully!",
      data: newPost,
    };
  }
  const updatePost = await PrivacyPolicy.findOneAndUpdate(
    {},
    { ...req.body },
    { new: true }
  );
  return {
    success: true,
    message: " Update successfully!",
    data: updatePost,
  };
};

const getprivacypolicy = async () => {
  const posts = await PrivacyPolicy.findOne();
  if (!posts) throw new Error("No posts found!");
  return { success: true, data: posts };
};

const createtermsandcondition = async (req) => {
  const termsAndConditonsDB = await TermsandCondition.findOne();

  if (!termsAndConditonsDB) {
    const newPost = await TermsandCondition.create({ ...req.body });
    return {
      success: true,
      message: "created successfully!",
      data: newPost,
    };
  }
  const newPost = await TermsandCondition.findOneAndUpdate(
    {},
    { ...req.body },
    { new: true }
  );
  return {
    success: true,
    message: " Updated successfully!",
    data: newPost,
  };
};

const gettermsandcondition = async () => {
  const posts = await TermsandCondition.findOne();
  if (!posts) throw new Error("No posts found!");
  return { success: true, message: "Data fetched successfully", data: posts };
};

const createreturnpolicy = async (req) => {
  const returnPolicyDB = await ReturnPolicy.findOne();

  if (!returnPolicyDB) {
    const newPost = await ReturnPolicy.create({ ...req.body });
    return {
      success: true,
      message: " created successfully!",
      data: newPost,
    };
  }
  const newPost = await ReturnPolicy.findOneAndUpdate(
    {},
    { ...req.body },
    { new: true }
  );
  return {
    success: true,
    message: " Updated successfully!",
    data: newPost,
  };
};

const getreturnpolicy = async () => {
  const posts = await ReturnPolicy.findOne();
  if (!posts) throw new Error("No posts found!");
  return { success: true, data: posts };
};

const createshippingpolicy = async (req) => {
  const shippingPolicyDB = await ShippingPolicy.findOne();

  if (!shippingPolicyDB) {
    const newPost = await ShippingPolicy.create({ ...req.body });
    return {
      success: true,
      message: " created successfully!",
      data: newPost,
    };
  }
  const newPost = await ShippingPolicy.findOneAndUpdate(
    {},
    { ...req.body },
    { new: true }
  );
  return {
    success: true,
    message: "Updated successfully!",
    data: newPost,
  };
};

const getshippingpolicy = async () => {
  const posts = await ShippingPolicy.findOne();
  if (!posts) throw new Error("No posts found!");
  return { success: true, data: posts };
};

const createadminpolicy = async (req) => {
  const adminPolicyDB = await AdminPolicy.findOne();

  if (!adminPolicyDB) {
    const newPost = await AdminPolicy.create({ ...req.body });
    return {
      success: true,
      message: " created successfully!",
      data: newPost,
    };
  }
  const newPost = await AdminPolicy.findOneAndUpdate(
    {},
    { ...req.body },
    { new: true }
  );
  return {
    success: true,
    message: "Updated successfully!",
    data: newPost,
  };
};

const getadminpolicy = async () => {
  const posts = await AdminPolicy.findOne();
  if (!posts) throw new Error("No posts found!");
  return { success: true, data: posts };
};

const createdeliverypolicy = async (req) => {
  const deliveryPolicyDB = await DeliveryPolicy.findOne();

  if (!deliveryPolicyDB) {
    const newPost = await DeliveryPolicy.create({ ...req.body });
    return {
      success: true,
      message: " created successfully!",
      data: newPost,
    };
  }
  const newPost = await DeliveryPolicy.findOneAndUpdate(
    {},
    { ...req.body },
    { new: true }
  );
  return {
    success: true,
    message: "Updated successfully!",
    data: newPost,
  };
};

const getdeliverypolicy = async () => {
  const posts = await DeliveryPolicy.findOne();
  if (!posts) throw new Error("No posts found!");
  return { success: true, data: posts };
};

const getInventoryReport = async (req, res) => {
  const { time, startDate: reqStart, endDate: reqEnd, format } = req.query;
  let fetchedOrders = [];
  let start, end;

  // Switch logic to filter orders by date range
  switch (time) {
    case "ThisMonth":
      start = new Date();
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end = new Date();
      break;

    case "LastMonth":
      const now = new Date();
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      break;

    case "Last3Months":
      const now3 = new Date();
      start = new Date(now3.getFullYear(), now3.getMonth() - 2, 1);
      end = new Date();
      break;

    case "Last6Months":
      const now6 = new Date();
      start = new Date(now6.getFullYear(), now6.getMonth() - 5, 1);
      end = new Date();
      break;

    case "ThisYear":
      start = new Date(new Date().getFullYear(), 0, 1);
      end = new Date();
      break;

    case "Custom":
      if (!reqStart || !reqEnd) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Start date and end date are required for custom range"
        );
      }
      start = new Date(reqStart);
      end = new Date(reqEnd);
      end.setHours(23, 59, 59, 999); // include the whole day
      break;

    default:
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid time range selected");
  }

  const unitsReport = await getUnitReports(start, end);
  const productsReport = await getProductsReport(start, end);
  const category = await CategoryModel.find();
  const categorydata = category?.length;
  const products = productsReport[0]?.products;
  const avgUnints = unitsReport[0]?.totalUnits / products?.length;
  const roundedAverageOfAverages = Math.round(avgUnints);
  const unitsSold = await getUnitsSoldData(start, end);
  const productIds = unitsSold.map((item) => item._id);

  const productsData = await Product.find({ _id: { $in: productIds } });

  const filteredGetData = productsData.map((prod) => { });

  const stats = {
    unitsReport: unitsReport[0]?.totalUnits,
    roundedAverageOfAverages,
    categorydata,
  };

  const data = {
    stats,
    productsData,
  };

  async function getUnitsSoldData(start, end) {
    return await orderDetailsModel.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $unwind: {
          path: "$orderDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$orderDetails.products",
          total: {
            $sum: "$orderDetails.cartQuantity",
          },
        },
      },
    ]);
  }

  async function getUnitReports(start, end) {
    return await orderDetailsModel.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $unwind: {
          path: "$orderDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "_id",
          totalUnits: {
            $sum: "$orderDetails.cartQuantity",
          },
        },
      },
    ]);
  }

  async function getProductsReport(start, end) {
    return await orderDetailsModel.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $unwind: {
          path: "$orderDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: null, // Grouping by order ID (or use null if you want across all docs)
          products: {
            $addToSet: "$orderDetails.products",
          },
        },
      },
    ]);
  }

  return {
    success: true,
    message: "Inventory data fetched successfully",
    data: data,
  };
};

const dashboard = async (req) => {
  const now = new Date();

  // Date Ranges
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfCurrentMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );
  const startOfPreviousMonth = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    1
  );
  const endOfPreviousMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    0,
    23,
    59,
    59,
    999
  );

  const getTrend = (current, previous) => {
    if (current > previous) return "increase";
    if (current < previous) return "decrease";
    return "neutral";
  };

  // Fetch orders for both months
  const [thisMonthOrders, previousMonthOrdersData] = await Promise.all([
    orderDetailsModel.find({
      createdAt: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth },
    }),
    orderDetailsModel.find({
      createdAt: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth },
    }),
  ]);

  const currentMonthOrders = thisMonthOrders.length;
  const previousMonthOrders = previousMonthOrdersData.length;
  const orderTrend = getTrend(currentMonthOrders, previousMonthOrders);

  const increasePercentage =
    previousMonthOrders > 0
      ? ((currentMonthOrders - previousMonthOrders) / previousMonthOrders) * 100
      : currentMonthOrders > 0
        ? 100
        : 0;

  // Revenue & Product Count
  const calculateRevenueAndCount = (orders) => {
    let totalRevenue = 0;
    let productCount = 0;

    orders.forEach((order) => {
      order.orderDetails?.forEach((item) => {
        totalRevenue += item?.price || 0;
        productCount += 1;
      });
    });

    return { totalRevenue, productCount };
  };

  const { totalRevenue: thisRevenue, productCount: thisProductCount } =
    calculateRevenueAndCount(thisMonthOrders);
  const { totalRevenue: prevRevenue, productCount: prevProductCount } =
    calculateRevenueAndCount(previousMonthOrdersData);

  const revenueTrend = getTrend(thisRevenue, prevRevenue);
  const revenueIncreasePercentage =
    prevRevenue > 0
      ? ((thisRevenue - prevRevenue) / prevRevenue) * 100
      : thisRevenue > 0
        ? 100
        : 0;

  const thisMonthProductAverage =
    thisProductCount > 0 ? thisRevenue / thisProductCount : 0;
  const previousMonthProductAverage =
    prevProductCount > 0 ? prevRevenue / prevProductCount : 0;

  const productAverageTrend = getTrend(
    thisMonthProductAverage,
    previousMonthProductAverage
  );
  const AverageProductPercentage =
    previousMonthProductAverage > 0
      ? ((thisMonthProductAverage - previousMonthProductAverage) /
        previousMonthProductAverage) *
      100
      : thisMonthProductAverage > 0
        ? 100
        : 0;

  // Sales Count
  const nowMonthSales = thisProductCount;
  const previousMonthSales = prevProductCount;
  const salesTrend = getTrend(nowMonthSales, previousMonthSales);

  const salesIncrement =
    previousMonthSales > 0
      ? ((nowMonthSales - previousMonthSales) / previousMonthSales) * 100
      : nowMonthSales > 0
        ? 100
        : 0;

  // Best Sellers
  const bestSellers = await orderDetailsModel.aggregate([
    {
      $unwind: { path: "$orderDetails", preserveNullAndEmptyArrays: true },
    },
    {
      $unwind: { path: "$orderDetails.products" },
    },
    {
      $group: {
        _id: "$orderDetails.products.variantId",
        totalBought: { $sum: "$orderDetails.products.quantity" },
      },
    },
    {
      $sort: { totalBought: -1 },
    },
    {
      $lookup: {
        from: "product",
        localField: "_id",
        foreignField: "varient._id",
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
      $match: { "productInfo.status": "active" },
    },
    {
      $limit: 10,
    },
    {
      $project: {
        _id: "$productInfo._id",
        "productInfo.productImage": 1,
        "productInfo.productCategory": 1,
        "productInfo.productBrand": 1,
        "productInfo.linkProducts": 1,
        "productInfo.productName": 1,
        "productInfo.productDescription": 1,
        "productInfo.nonVarient": 1,
        "productInfo.varient": 1,
      },
    },
  ]);

  // User Count Stats
  const [currentMonthCount, previousMonthCount] = await Promise.all([
    User.countDocuments({
      createdAt: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth },
    }),
    User.countDocuments({
      createdAt: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth },
    }),
  ]);

  const userTrend = getTrend(currentMonthCount, previousMonthCount);
  const userIncrementPercentage =
    previousMonthCount > 0
      ? ((currentMonthCount - previousMonthCount) / previousMonthCount) * 100
      : currentMonthCount > 0
        ? 100
        : 0;

  // Latest 10 Orders
  const OrderDetails = await orderDetailsModel
    .find()
    .sort({ createdAt: -1 })
    .limit(10);

  return {
    orderStats: {
      currentMonthOrders,
      previousMonthOrders,
      increasePercentage: increasePercentage.toFixed(2),
      trend: orderTrend,
    },
    revenueStats: {
      thistotal: thisRevenue.toFixed(2),
      previoustotal: prevRevenue.toFixed(2),
      revenueIncreasePercentage: revenueIncreasePercentage.toFixed(2),
      trend: revenueTrend,
    },
    productStats: {
      thisMonthProductAverage: thisMonthProductAverage.toFixed(2),
      previousMonthProductAverage: previousMonthProductAverage.toFixed(2),
      AverageProductPercentage: AverageProductPercentage.toFixed(2),
      trend: productAverageTrend,
    },
    salesStats: {
      nowMonthSales,
      previousMonthSales,
      salesIncrement: salesIncrement.toFixed(2),
      trend: salesTrend,
    },
    userStats: {
      currentMonthCount,
      previousMonthCount,
      incrementPercentage: `${userIncrementPercentage.toFixed(2)}%`,
      trend: userTrend,
    },
    bestSellers,
    OrderDetails,
  };
};

const getAdminById = async (req) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Admin ID is required");
  }

  const foundAdmin = await admin.findById(id);

  if (!foundAdmin) {
    throw new ApiError(404, "Admin not found");
  }

  return {
    success: true,
    message: "Admin retrieved successfully",
    data: foundAdmin,
  };
};

const paymentMethods = async (req, res) => {
  const {
    razorPay = {},
    googlePay = {},
    stripe = {},
    phonePe = {},
    payTM = {},
    payPal = {},
    instamojo = {},
    cashOnDelivery = false,
    bankTransfer = {},
  } = req.body;
  const ncryptObject = new ncrypt(config.encryptionDecryptionKey);

  const encryptObject = (obj, fields) => {
    fields.forEach((field) => {
      if (obj[field]) obj[field] = ncryptObject.encrypt(obj[field]);
    });
  };

  encryptObject(razorPay, [
    "keyId",
    "razorPaySecretKey",
    "webhookSecretkey",
    "paymentEndpointURL",
  ]);
  encryptObject(googlePay, [
    "googlePayMerchantID",
    "googlePayMerchantName",
    "merchantInformation",
    "paymentGatewayName",
    "gatewayMerchantID",
  ]);
  encryptObject(stripe, [
    "stripePublishableKey",
    "stripeSecretKey",
    "stripeWebhookSecret",
    "currency",
  ]);
  encryptObject(phonePe, [
    "phonePeMerchantID",
    "phonePeMerchantKey",
    "callbackURL",
    "currency",
  ]);
  encryptObject(payTM, [
    "paytmMerchantID",
    "paytmMerchantKey",
    "paytmWebsiteName",
    "callbackURL",
    "currency",
  ]);
  encryptObject(payPal, [
    "paymentMode",
    "payPalBusinessEmail",
    "notificationURL",
    "currencyCode",
  ]);
  encryptObject(instamojo, [
    "InstamojoAPIKey",
    "InstamojoAuthToken",
    "paymentURL",
    "currencyCode",
  ]);
  encryptObject(bankTransfer, [
    "recipientsfullName",
    "bankAccountNumber",
    "IFSCcode",
  ]);

  const existing = await paymentMethod.findOne();

  if (existing) {
    const updated = await paymentMethod.findByIdAndUpdate(
      existing._id,
      {
        razorPay,
        googlePay,
        stripe,
        phonePe,
        payTM,
        payPal,
        instamojo,
        cashOnDelivery,
        bankTransfer,
      },
      { new: true }
    );
    return { success: true, message: "Edited successfully", data: updated };
  }
  const created = await paymentMethod.create({
    razorPay,
    googlePay,
    stripe,
    phonePe,
    payTM,
    payPal,
    instamojo,
    cashOnDelivery,
    bankTransfer,
  });

  return { success: true, message: "Added successfully", data: created };
};

const getPaymentMethod = async (req, res) => {
  const paymentMethodData = await paymentMethod.findOne();

  const {
    razorPay,
    googlePay,
    stripe,
    phonePe,
    payTM,
    payPal,
    instamojo,
    cashOnDelivery,
    bankTransfer,
  } = paymentMethodData;

  const ncryptObject = new ncrypt(config.encryptionDecryptionKey);

  const decrypttObject = (obj, fields) => {
    fields.forEach((field) => {
      if (obj[field]) obj[field] = ncryptObject.decrypt(obj[field]);
    });
  };

  decrypttObject(razorPay, [
    "keyId",
    "razorPaySecretKey",
    "webhookSecretkey",
    "paymentEndpointURL",
  ]);
  decrypttObject(googlePay, [
    "googlePayMerchantID",
    "googlePayMerchantName",
    "merchantInformation",
    "paymentGatewayName",
    "gatewayMerchantID",
  ]);
  decrypttObject(stripe, [
    "stripePublishableKey",
    "stripeSecretKey",
    "stripeWebhookSecret",
    "currency",
  ]);
  decrypttObject(phonePe, [
    "phonePeMerchantID",
    "phonePeMerchantKey",
    "callbackURL",
    "currency",
  ]);
  decrypttObject(payTM, [
    "paytmMerchantID",
    "paytmMerchantKey",
    "paytmWebsiteName",
    "callbackURL",
    "currency",
  ]);
  decrypttObject(payPal, [
    "paymentMode",
    "payPalBusinessEmail",
    "notificationURL",
    "currencyCode",
  ]);
  decrypttObject(instamojo, [
    "InstamojoAPIKey",
    "InstamojoAuthToken",
    "paymentURL",
    "currencyCode",
  ]);
  decrypttObject(bankTransfer, [
    "recipientsfullName",
    "bankAccountNumber",
    "IFSCcode",
  ]);

  return {
    success: true,
    message: "Data fetched successfully",
    data: {
      razorPay,
      googlePay,
      stripe,
      phonePe,
      payTM,
      payPal,
      instamojo,
      cashOnDelivery,
      bankTransfer,
    },
  };
};

const getProfile = async (req) => {
  // const userId = req.Admin.id;
  // console.log("user", userId);
  const findProfile = await admin.findOne();
  if (!findProfile) {
    throw new ApiError(404, "Profile Not Found");
  }

  return {
    success: true,
    message: "Profile Fetched SUccessfuly",
    data: findProfile,
  };
};

const editProfile = async (req, res) => {
  const userId = req.Admin._id;

  // console.log("_id", _id);
  const updateData = req.body;
  console.log("data", updateData);

  const updatedUser = await admin.findByIdAndUpdate(
    { _id: userId },
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedUser) {
    throw new ApiError(404, "Admin not Found");
  }

  return {
    message: "Profile updated successfully",
    user: updatedUser,
  };
};

const updatePurchaseCode = async (req) => {
  // const userId = req.Admin._id;

  // // console.log("_id", _id);
  const updateData = req.body;
  console.log("data", updateData);

  const updatedCode = await PurchaseCode.findOneAndUpdate({}, updateData, {
    new: true,
    upsert: true,
  });

  return {
    message: "Profile updated successfully",
    data: updatedCode,
  };
};

const getPurchaseCode = async (req) => {
  const findPurchaseCode = await PurchaseCode.findOne({});
  if (!findPurchaseCode) {
    throw new ApiError(404, "Purchase Code not Found");
  }

  return {
    success: true,
    message: "Purchase Code Fetched SUccessfuly",
    data: findPurchaseCode,
  };
};

const editmoduleManager = async (req) => {
  const updateData = req.body;
  console.log("data", updateData);

  const updateModule = await moduleManager.findOneAndUpdate({}, updateData, {
    new: true,
    upsert: true,
  });

  return {
    message: "Permission updated successfully",
    data: updateModule,
  };
};

const getModuleManager = async (req) => {
  const findPermissions = await moduleManager.findOne({});
  if (!findPermissions) {
    throw new ApiError(404, "Permissions not found");
  }

  return {
    success: true,
    message: "Permissions Fetched SUccessfuly",
    data: findPermissions,
  };
};

const shippingTimeSlots = async (req, res) => {
  const { timeSlotStatus, shippingStartFrom, expectedDeliveryDays } = req.body;

  if (!shippingStartFrom || !expectedDeliveryDays) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Provide all Details ShippingStartsFrom=${shippingStartFrom} ExpectedDeliveryDays=${expectedDeliveryDays}`
    );
  }

  const shippingTimeSlotDB = await shippingTimeSlot.findOne();

  if (!shippingTimeSlotDB) {
    const shippingTimeSlotData = await shippingTimeSlot.create({ ...req.body });

    return {
      success: true,
      message: "Shipping time slot created successfully",
      data: shippingTimeSlotData,
    };
  }

  const shippingTimeSlotData = await shippingTimeSlot.findOneAndUpdate(
    {},
    { ...req.body },
    { new: true }
  );

  return {
    success: true,
    message: "Shipping time slot Updated successfully",
    data: shippingTimeSlotData,
  };
};

const getShippingTimeSlots = async (req, res) => {
  const shippingTimeSlotDB = await shippingTimeSlot.findOne();

  if (!shippingTimeSlotDB) {
    throw new ApiError(httpStatus.NOT_FOUND, "No shipping time slot available");
  }

  return {
    success: true,
    message: "shipping time slot fetched successfully",
    data: shippingTimeSlotDB,
  };
};

const createHolidayDateSlot = async (req, res) => {
  const { title, fromDate, toDate, startDate, status } = req.body;
  const adminId = req.Admin._id;

  if (!title || !fromDate || !toDate || !startDate) {
    throw new ApiError(httpStatus.NOT_FOUND, "provide all Details");
  }

  const findDuplicate = await hoildayDateSlot.findOne({ title });
  if (findDuplicate) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Title already exists");
  }

  const createdHolidayDateSlot = await hoildayDateSlot.create({
    ...req.body,
    adminId,
  });

  return {
    success: true,
    message: "Date slot created",
    data: createdHolidayDateSlot,
  };
};

const getHolidayTimeSlot = async (req, res) => {
  const getAllHolidayTimeSlot = await hoildayDateSlot.find();

  if (getAllHolidayTimeSlot.length == 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No slots found");
  }

  return {
    success: true,
    message: "Fetechd time Slot",
    data: getAllHolidayTimeSlot,
  };
};

const editHolidayTimeSlot = async (req, res) => {
  const { id } = req.query;
  const { title } = req.body;

  if (!id) {
    throw new ApiError(httpStatus.NOT_FOUND, "no Id provided");
  }

  if (title) {
    const findDuplicate = await hoildayDateSlot.find({
      _id: { $ne: id },
      title: title,
    });

    if (findDuplicate.length != 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, "title already exists");
    }
  }
  const editedHolidayTimeSlot = await hoildayDateSlot.findByIdAndUpdate(
    { _id: id },
    { ...req.body },
    { new: true }
  );

  return {
    success: true,
    message: "Data edited successfully",
    data: editedHolidayTimeSlot,
  };
};

const hoildayTimeSlotStatus = async (req, res) => {
  const { id } = req.query;
  const { status } = req.body;

  if (!id) {
    throw new ApiError(httpStatus.NOT_FOUND, "no Id provided");
  }
  const udpatedStatus = await hoildayDateSlot.findByIdAndUpdate(
    { _id: id },
    { status: status },
    { new: true }
  );

  if (!udpatedStatus) {
    throw new ApiError(httpStatus.NOT_FOUND, "No time slot found");
  }

  return { success: true, message: "Status updated", data: udpatedStatus };
};

const deleteHolidayTimeSlot = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    throw new ApiError(httpStatus.NOT_FOUND, "no Id provided");
  }

  const deletedTimeSlot = await hoildayDateSlot.findByIdAndDelete({ _id: id });

  if (!deletedTimeSlot) {
    throw new ApiError(httpStatus.NOT_FOUND, "No data found to delete");
  }

  return {
    success: true,
    message: "Time slot Deleted successfully",
    data: deletedTimeSlot,
  };
};
module.exports = {
  createdeliverypolicy,
  getdeliverypolicy,
  createadminpolicy,
  getadminpolicy,
  createshippingpolicy,
  getshippingpolicy,
  createreturnpolicy,
  getreturnpolicy,
  createtermsandcondition,
  gettermsandcondition,
  createprivacypolicy,
  getprivacypolicy,
  createContactus,
  getContactus,
  createAboutus,
  getAboutus,
  createShippingMethod,
  getShippingMethod,
  createBanner,
  updateBanner,
  getBanner,
  editBanner,
  deleteBanner,
  createCoupen,
  getCoupon,
  getOneCoupon,
  editCoupon,
  updateCouponStatus,
  deleteCoupon,
  createProduct,
  createSubCategory,
  getSubCategory,
  getOneSubCategory,
  updateSubCategory,
  deleteSubCategory,
  AddCategory,
  getAllCategory,
  getOneCategory,
  editCategory,
  Customer,
  deleteCategory,
  editCustomer,
  oneCustomer,
  brand,
  getBrand,
  editBrand,
  getOneBrand,
  deleteBrand,
  createOffer,
  getOffers,
  getOneOffer,
  updateOffers,
  updateOfferStatus,
  deleteOffers,
  addProducts,
  getReport,
  getInventoryReport,
  getOrder,
  editOrders,
  systemUser,
  Login,
  getAllAdmin,
  editSystemUser,
  deleteSystemUser,
  getReviewRatings,
  getAllProducts,
  getProductById,
  deleteProduct,
  notification,
  getNotification,
  createFeaturedSection,
  getFeaturedSection,
  getFeaturedAndNotAppliedProducts,
  updateFeaturedSection,
  updateStatusFeatureSection,
  deleteFeaturedSection,
  addOfferProducts,
  getOfferProducts,
  getOfferAndNotAppliedProducts,
  updateOfferProducts,
  addFeaturedProducts,
  getFeaturedProducts,
  updateFeaturedProducts,
  getSubCategoryBasedOnCategory,
  storeSettingsData,
  filterNotification,
  dashboard,
  getStoreSettingData,
  editStoreSettingsData,
  getAdminById,
  getProfile,
  editProfile,
  editProducts,
  paymentMethods,
  getPaymentMethod,
  createEmailSetting,
  getEmailSetting,
  updatePurchaseCode,
  getPurchaseCode,
  shippingTimeSlots,
  getShippingTimeSlots,
  createHolidayDateSlot,
  getHolidayTimeSlot,
  hoildayTimeSlotStatus,
  editHolidayTimeSlot,
  deleteHolidayTimeSlot,
  editmoduleManager,
  getModuleManager,
  getUserById,
  editProductStatus,
  deleteReviewsRatings,
  forgotPassword,
  resendOtp,
  verifyResetOtp,
  resetPassword,
  editReturnStatus,
};
