const { Product } = require("../../../models/Product.model");
const httpStatus = require('http-status');
const ApiError = require("../../../utils/apiError");
const { uploadToCloud } = require("../../../utils/uploadFileToS3");

const getActiveProducts = async (req, res) => {
  const { categoryId } = req.query;

  const products = await Product.aggregate([
    {
      $match: { status: "active", category_id: categoryId }
    }
  ]);

  return {
    success: true,
    message: "Active Products fetched successfully",
    data: products,
  };
}

const createProduct = async (req, res) => {
  console.log("🟢 Incoming product creation request");
  console.log("📦 Body:", req.body);
  console.log("📸 Files:", req.files);

  // Helper function to safely parse JSON
  const safeParse = (data) => {
    if (!data) return undefined;
    try {
      return typeof data === "string" ? JSON.parse(data) : data;
    } catch (error) {
      console.error("❌ Error parsing data:", error);
      return typeof data === "object" ? data : undefined;
    }
  };

  // Helper to collect array fields from req.body
  const collectArrayFields = (fieldName) => {
    console.log(fieldName, "this is the field name");

    const result = [];
    let index = 0;
    while (req.body[`${fieldName}[${index}]`] !== undefined) {
      result.push(req.body[`${fieldName}[${index}]`]);
      index++;
    }
    return result.length > 0 ? result : undefined;
  };

  const {
    productName,
    productTitle,
    productCategory,
    category_id,
    productSubCategory,
    subcategory_id,
    productType,
    productDescription,
    productUsage,
    variant,
    nonVariant,
    inventory,
    shipping,
    linkProducts,
    status,
    createdBy,
    isReturnable,
    isTodaySpecial
  } = req.body;

  // Collect array fields
  const productBenifits = safeParse(req.body.productBenifits);

  const productIngrediants = safeParse(req.body.productIngrediants);
  const searchTags = safeParse(req.body.searchTags);

  console.log("📋 Collected Arrays:", {
    productBenifits,
    productIngrediants,
    searchTags,
  });

  // 📸 Extract image files
  const productImageFiles = Array.isArray(req.files)
    ? req.files.filter((file) => file.fieldname === "productImages")
    : [];

  const variantImageFiles = Array.isArray(req.files)
    ? req.files.filter((file) => file.fieldname.startsWith("variantImages_"))
    : [];

  const nonVariantImageFiles = Array.isArray(req.files)
    ? req.files.filter((file) => file.fieldname === "nonVariantImages")
    : [];

  console.log("🖼️ Image Files:", {
    productImages: productImageFiles.length,
    variantImages: variantImageFiles.length,
    nonVariantImages: nonVariantImageFiles.length,
  });

  // 1️⃣ Validate required fields
  if (!productName || !productCategory || !productSubCategory || !productType) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Missing required fields: productName, productCategory, productSubCategory, productType"
    );
  }

  if (!productDescription || productDescription.length < 20) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Product description must be at least 20 characters"
    );
  }

  if (!productUsage || productUsage.length < 10) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Product usage must be at least 10 characters"
    );
  }

  if (!productBenifits || productBenifits.length === 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "At least one product benefit is required"
    );
  }

  if (!productIngrediants || productIngrediants.length === 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "At least one product ingredient is required"
    );
  }

  // 2️⃣ Validate product type
  if (productType === "variant" && !variant) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Variant data required");
  }

  if (productType === "nonVariant" && !nonVariant) {
    throw new ApiError(httpStatus.BAD_REQUEST, "NonVariant data required");
  }

  // 3️⃣ Upload main product images
  const productImageUrls = [];
  if (productImageFiles.length > 0) {
    console.log(`🚀 Uploading ${productImageFiles.length} product images`);
    for (const file of productImageFiles) {
      const uploadedUrl = await uploadToCloud(file, "products");
      productImageUrls.push(uploadedUrl);
      console.log(`✅ Uploaded: ${uploadedUrl}`);
    }
  }

  if (productImageUrls.length === 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "At least one product image is required"
    );
  }

  // 4️⃣ Build main product object
  const productData = {
    productName,
    productTitle: productTitle || productName, // Fallback to productName if title is empty
    productCategory: productCategory,
    category_id,
    productSubCategory: productSubCategory,
    subcategory_id,
    productType,
    productImages: productImageUrls,
    productDescription,
    productBenifits: productBenifits,
    productUsage: productUsage,
    productIngrediants: productIngrediants,
    searchTags: searchTags || [],
    status: status || "active",
    createdBy: createdBy || undefined,
    isReturnable: isReturnable === "true" || isReturnable === true,
    isTodaySpecial: isTodaySpecial === "true" || isTodaySpecial === true,
  };

  console.log("🧱 Base Product Data:", productData);

  // 5️⃣ Handle VARIANT products
  if (productType === "variant") {
    console.log("⚙️ Processing VARIANT Product");
    const variantData = safeParse(variant);

    if (!variantData) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid variant data");
    }

    // Upload variant images
    const variantImagesByIndex = {};
    if (variantImageFiles.length > 0) {
      console.log(`🚀 Uploading ${variantImageFiles.length} variant images`);

      for (const file of variantImageFiles) {
        const match = file.fieldname.match(/variantImages_(\d+)/);
        if (match) {
          const variantIndex = parseInt(match[1], 10);
          if (!variantImagesByIndex[variantIndex]) {
            variantImagesByIndex[variantIndex] = [];
          }
          const uploadedUrl = await uploadToCloud(file, "products/variants");
          variantImagesByIndex[variantIndex].push(uploadedUrl);
        }
      }
    }

    console.log("📦 Variant images by index:", variantImagesByIndex);

    // Assign images based on variant type
    if (variantData.variantType === "colorOnly" && variantData.colorOnlyVariants) {
      variantData.colorOnlyVariants.forEach((v, index) => {
        const key = index + 1;
        if (variantImagesByIndex[key]) {
          v.variantImages = variantImagesByIndex[key];
        }
      });
    } else if (variantData.variantType === "sizeOnly" && variantData.sizeOnlyVariants) {
      variantData.sizeOnlyVariants.forEach((v, index) => {
        const key = index + 1;
        if (variantImagesByIndex[key]) {
          v.variantImages = variantImagesByIndex[key];
        }
      });
    } else if (variantData.variantType === "sizeColor" && variantData.sizeColorVariants) {
      variantData.sizeColorVariants.forEach((v, index) => {
        const key = index + 1;
        if (variantImagesByIndex[key]) {
          v.variantImages = variantImagesByIndex[key];
        }
      });
    }

    productData.variant = variantData;
  }

  // 6️⃣ Handle NON-VARIANT products
  else if (productType === "nonVariant") {
    console.log("⚙️ Processing NON-VARIANT Product");
    const nonVariantData = safeParse(nonVariant);

    if (!nonVariantData) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid nonVariant data");
    }

    // Upload non-variant images
    const nonVariantImageUrls = [];
    if (nonVariantImageFiles.length > 0) {
      console.log(`🚀 Uploading ${nonVariantImageFiles.length} nonVariant images`);
      for (const file of nonVariantImageFiles) {
        const uploadedUrl = await uploadToCloud(file, "products/nonVariant");
        nonVariantImageUrls.push(uploadedUrl);
        console.log(`✅ Uploaded: ${uploadedUrl}`);
      }
    }

    // Use productTitle from main form if nonVariant.productTitle is empty
    const finalProductTitle = nonVariantData.productTitle || productTitle || productName;

    productData.nonVariant = {
      productTitle: finalProductTitle,
      price: nonVariantData.price || {
        costPrice: 0,
        salePrice: 0,
        discount: 0,
        tax: 0,
      },
      stockCount: nonVariantData.stockCount || 0,
      skuCode: nonVariantData.skuCode || "",
      productCode: nonVariantData.productCode || "",
      nonVariantImages: nonVariantImageUrls,
    };

    console.log("✅ NonVariant data:", productData.nonVariant);
  }

  // 7️⃣ Optional fields
  if (inventory) {
    productData.inventory = safeParse(inventory);
  }

  if (shipping) {
    productData.shipping = safeParse(shipping);
  }

  if (linkProducts) {
    productData.linkProducts = safeParse(linkProducts);
  }

  // 8️⃣ Save to DB
  console.log("💾 Saving product to database...");

  try {
    const product = new Product(productData);
    await product.save();

    console.log("✅ Product created successfully:", product._id);

    return {
      success: true,
      message: "Product created successfully",
      data: product,
    };
  } catch (error) {
    console.error("❌ Database error:", error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to create product: ${error.message}`
    );
  }
};
// Get all products with filters and pagination
const getAllProducts = async (req, res) => {
  const {
    page = 1,
    limit = 1000,
    productCategory,
    productSubCategory,
    productType,
    status,
    search,
    minPrice,
    maxPrice,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  // Build filter object
  const filter = {};

  if (productCategory) filter.productCategory = productCategory;
  if (productSubCategory) filter.productSubCategory = productSubCategory;
  if (productType) filter.productType = productType;
  if (status) filter.status = status;

  // Text search
  if (search) {
    filter.$or = [
      { productName: { $regex: search, $options: 'i' } },
      { productDescription: { $regex: search, $options: 'i' } },
      { searchTags: { $in: [new RegExp(search, 'i')] } },
    ];
  }

  // Price range filter
  if (minPrice || maxPrice) {
    const priceFilter = {};
    if (minPrice) priceFilter.$gte = Number(minPrice);
    if (maxPrice) priceFilter.$lte = Number(maxPrice);

    filter.$or = [
      { 'nonVariant.price.salePrice': priceFilter },
      { 'variant.sizeColorVariants.price.salePrice': priceFilter },
      { 'variant.colorOnlyVariants.price.salePrice': priceFilter },
      { 'variant.sizeOnlyVariants.price.salePrice': priceFilter },
      { 'combo.comboPrice.salePrice': priceFilter },
    ];
  }

  // Pagination
  const skip = (Number(page) - 1) * Number(limit);
  const sortOptions = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  // Execute query
  const products = await Product.find(filter).sort(sortOptions).skip(skip).limit(Number(limit)).lean();

  const total = await Product.countDocuments(filter);

  if (!products || products.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No products found');
  }

  return {
    success: true,
    data: products,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      totalProducts: total,
      limit: Number(limit),
    },
  };
};

// Get single product by ID
const getProductById = async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id).lean();

  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }

  return {
    success: true,
    data: product,
  }
};

const updateProduct = async (req, res) => {
  const { _id } = req.params;
  const updateData = req.body;

  console.log("========== UPDATE PRODUCT START ==========");
  console.log("Product ID:", _id);
  console.log("Request Body Keys:", Object.keys(updateData));

  // ---------------- HELPERS ----------------
  const safeParse = (data) => {
    if (!data) return undefined;
    try {
      return typeof data === "string" ? JSON.parse(data) : data;
    } catch {
      return undefined;
    }
  };

  // ---------------- FILE EXTRACTION ----------------
  let newProductImages = [];
  let newVariantImages = {};
  let newNonVariantImages = [];

  console.log("\n--- FILE EXTRACTION ---");
  console.log("req.files type:", Array.isArray(req.files) ? "Array" : typeof req.files);
  console.log("req.files:", req.files);

  // Group variant images by index
  if (Array.isArray(req.files)) {
    newProductImages = req.files.filter(
      (f) => f.fieldname === "productImages"
    );

    // Group variant images by their index
    req.files.forEach((file) => {
      const match = file.fieldname.match(/variantImages_(\d+)/);
      if (match) {
        const index = match[1];
        if (!newVariantImages[index]) {
          newVariantImages[index] = [];
        }
        newVariantImages[index].push(file);
      }
    });

    newNonVariantImages = req.files.filter(
      (f) => f.fieldname === "nonVariantImages"
    );
  } else if (req.files) {
    newProductImages = req.files.productImages || [];

    // Group variant images by their index
    Object.keys(req.files).forEach((fieldname) => {
      const match = fieldname.match(/variantImages_(\d+)/);
      if (match) {
        const index = match[1];
        const files = req.files[fieldname];
        newVariantImages[index] = Array.isArray(files) ? files : [files];
      }
    });

    newNonVariantImages = req.files.nonVariantImages || [];
  }

  console.log("New Product Images Count:", newProductImages.length);
  console.log("New Variant Images:", Object.keys(newVariantImages));
  console.log("New NonVariant Images Count:", newNonVariantImages.length);

  // ---------------- PRODUCT CHECK ----------------
  const existingProduct = await Product.findById(_id);
  if (!existingProduct) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }

  console.log("\n--- EXISTING PRODUCT ---");
  console.log("Product Type:", existingProduct.productType);
  console.log("Existing Product Images:", existingProduct.productImages);
  if (existingProduct.variant) {
    const vType = existingProduct.variant.variantType;
    const vKey = `${vType}Variants`;
    console.log("Existing Variant Type:", vType);
    console.log("Existing Variants Count:", existingProduct.variant[vKey]?.length || 0);
  }
  if (existingProduct.nonVariant) {
    console.log("Existing NonVariant Images:", existingProduct.nonVariant.nonVariantImages);
  }

  const updateFields = {};

  // ---------------- BASIC FIELDS ----------------
  [
    "productName",
    "productTitle",
    "productDescription",
    "status",
    "updatedBy",
    "category_id",
    "subcategory_id",
    "productCategory",
    "productSubCategory",
    "productUsage",
    "isReturnable",
    "isTodaySpecial"
  ].forEach((key) => {
    if (key === "isReturnable" || key === "isTodaySpecial") {
      updateFields[key] =
        updateData[key] === "true" || updateData[key] === true;
    } else {
      updateFields[key] = updateData[key];
    }
  });

  if (updateData.productBenifits) {
    updateFields.productBenifits = safeParse(updateData.productBenifits);
  }

  if (updateData.productIngrediants) {
    updateFields.productIngrediants = safeParse(updateData.productIngrediants);
  }

  // =========================================================
  // 🖼️ PRODUCT MAIN IMAGES
  // =========================================================
  console.log("\n--- PRODUCT MAIN IMAGES ---");
  const keptProductImages = safeParse(updateData.existingProductImages) || [];
  console.log("Kept Product Images:", keptProductImages);

  const uploadedProductImages = [];
  for (const file of newProductImages) {
    console.log("Uploading product image:", file.originalname);
    const url = await uploadToCloud(file, "products");
    console.log("Uploaded URL:", url);
    uploadedProductImages.push(url);
  }

  console.log("Uploaded Product Images:", uploadedProductImages);

  // const removedProductImages = (existingProduct.productImages || []).filter(
  //   (img) => !keptProductImages.includes(img)
  // );
  // for (const img of removedProductImages) {
  //   await deleteFromCloud(img);
  // }

  updateFields.productImages = [
    ...keptProductImages,
    ...uploadedProductImages,
  ];
  console.log("Final Product Images:", updateFields.productImages);

  // =========================================================
  // 🔹 NON-VARIANT
  // =========================================================
  if (
    existingProduct.productType === "nonVariant" &&
    updateData.nonVariant
  ) {
    console.log("\n--- NON-VARIANT UPDATE ---");
    const nonVariantData = safeParse(updateData.nonVariant) || {};
    console.log("NonVariant Data from request:", nonVariantData);

    const keptImages = safeParse(updateData.existingNonVariantImages) || [];
    console.log("Kept NonVariant Images:", keptImages);

    const uploadedImages = [];
    for (const file of newNonVariantImages) {
      console.log("Uploading nonVariant image:", file.originalname);
      const url = await uploadToCloud(file, "products/nonVariant");
      console.log("Uploaded URL:", url);
      uploadedImages.push(url);
    }

    console.log("Uploaded NonVariant Images:", uploadedImages);

    // const removedImages =
    //   (existingProduct.nonVariant?.nonVariantImages || []).filter(
    //     (img) => !keptImages.includes(img)
    //   );
    // for (const img of removedImages) {
    //   await deleteFromCloud(img);
    // }

    // Build final images first
    const finalNonVariantImages = [...keptImages, ...uploadedImages];
    console.log("Final NonVariant Images to save:", finalNonVariantImages);

    // Remove nonVariantImages from nonVariantData to prevent overwriting
    const { nonVariantImages: _, ...cleanNonVariantData } = nonVariantData;

    updateFields.nonVariant = {
      ...(existingProduct.nonVariant?.toObject?.() || {}),
      ...cleanNonVariantData,
      nonVariantImages: finalNonVariantImages, // Set this LAST
    };
    console.log("Final NonVariant:", updateFields.nonVariant);
  }


  // =========================================================
  // 🔹 VARIANT (FIXED + SAFE)
  // =========================================================
  if (
    existingProduct.productType === "variant" &&
    updateData.variant
  ) {
    console.log("\n--- VARIANT UPDATE ---");

    const variantData = safeParse(updateData.variant);
    if (!variantData?.variantType) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "variantType is required"
      );
    }

    const variantType = variantData.variantType;
    const variantKey = `${variantType}Variants`;

    const existingVariants =
      existingProduct.variant?.[variantKey] || [];
    const incomingVariants = variantData[variantKey] || [];

    const finalVariants = [];

    for (let i = 0; i < incomingVariants.length; i++) {
      const frontendIndex = i + 1;

      // 🧲 Existing images kept by frontend
      const keptImages =
        safeParse(updateData[`existingVariantImages_${frontendIndex}`]) || [];

      // ⬆️ Upload new images for this variant
      const uploadedImages = [];
      const variantFiles = newVariantImages[frontendIndex] || [];

      for (const file of variantFiles) {
        const url = await uploadToCloud(file, "products/variants");
        uploadedImages.push(url);
      }

      const finalVariantImages = [...keptImages, ...uploadedImages];

      // 🚨 CRITICAL FIX — convert subdocument to plain object
      const baseVariant =
        existingVariants[i]?.toObject?.() || {};

      // ❌ Remove accidental overwrite
      const { variantImages: _, ...cleanIncoming } =
        incomingVariants[i] || {};

      const variantToSave = {
        ...baseVariant,        // plain object
        ...cleanIncoming,      // new fields
        variantImages: finalVariantImages, // ALWAYS set explicitly
      };

      // Ensure price always exists
      if (!variantToSave.price) {
        variantToSave.price = {
          costPrice: 0,
          salePrice: 0,
          discount: 0,
          tax: 0,
        };
      }

      finalVariants.push(variantToSave);
    }

    updateFields.variant = {
      variantType,
      sizeColorVariants:
        variantType === "sizeColor" ? finalVariants : [],
      sizeOnlyVariants:
        variantType === "sizeOnly" ? finalVariants : [],
      colorOnlyVariants:
        variantType === "colorOnly" ? finalVariants : [],
    };
  }


  // =========================================================
  // 🔹 OTHER OPTIONAL FIELDS
  // =========================================================
  [
    "inventory",
    "shipping",
    "searchTags",
    "linkProducts",
    "sareeAttributes",
    "mensKidsAttributes",
    "jewelleryAttributes",
    "otherAttributes",
  ].forEach((key) => {
    if (updateData[key]) {
      updateFields[key] = safeParse(updateData[key]);
    }
  });

  console.log("\n--- FINAL UPDATE FIELDS ---");
  console.log("Update Fields Keys:", Object.keys(updateFields));

  // ---------------- SAVE ----------------
  console.log("\n--- SAVING TO DATABASE ---");
  const updatedProduct = await Product.findByIdAndUpdate(
    _id,
    { $set: updateFields },
    { new: true }
  );

  if (!updatedProduct) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Product update failed"
    );
  }

  console.log("\n--- UPDATE SUCCESSFUL ---");
  console.log("Updated Product Images:", updatedProduct.productImages);
  if (updatedProduct.variant) {
    const vType = updatedProduct.variant.variantType;
    const vKey = `${vType}Variants`;
    console.log("Updated Variant Type:", vType);
    console.log("Updated Variants:", updatedProduct.variant[vKey]);
  }
  if (updatedProduct.nonVariant) {
    console.log("Updated NonVariant Images:", updatedProduct.nonVariant.nonVariantImages);
  }
  console.log("========== UPDATE PRODUCT END ==========\n");

  return {
    success: true,
    message: "Product updated successfully",
    data: updatedProduct,
  };
};




// Partial update for specific fields (PATCH)
const partialUpdateProduct = async (req, res) => {
  const { _id } = req.params;
  const { field, value } = req.body;

  // ✅ YES, field can be sent as string like "variant.sizeColorVariants.0.stockCount"
  if (!field) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Field path is required');
  }

  // Parse value if it's a JSON string
  let parsedValue = value;
  if (typeof value === 'string') {
    try {
      parsedValue = JSON.parse(value);
    } catch (e) {
      // If parsing fails, keep as string
      parsedValue = value;
    }
  }

  const updateQuery = { $set: { [field]: parsedValue } };

  const updatedProduct = await Product.findByIdAndUpdate(_id, updateQuery, { new: true, runValidators: true });

  if (!updatedProduct) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }

  return {
    success: true,
    message: 'Product field updated successfully',
    data: updatedProduct,
  };
};

// ========================================
// 🗑️ DELETE PRODUCT (DELETE)
// ========================================

// Soft delete
const softDeleteProduct = async (req, res) => {
  const { id } = req.params;

  const product = await Product.findByIdAndUpdate(id, { $set: { status: 'inactive' } }, { new: true });

  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }

  return {
    success: true,
    message: 'Product deactivated successfully',
    data: product,
  };
};

// Hard delete
const hardDeleteProduct = async (req, res) => {
  const { _id } = req.params;

  const product = await Product.findByIdAndDelete(_id);

  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }

  return {
    success: true,
    message: 'Product permanently deleted',
  };
};

// ========================================
// 📊 BULK OPERATIONS
// ========================================

const bulkUpdateStock = async (req, res) => {
  const { updates } = req.body;

  if (!updates || !Array.isArray(updates) || updates.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Updates array is required');
  }

  const bulkOps = updates.map((update) => {
    if (update.variantId) {
      return {
        updateOne: {
          filter: {
            _id: update.productId,
            'variant.sizeColorVariants._id': update.variantId,
          },
          update: {
            $set: { 'variant.sizeColorVariants.$.stockCount': update.stockCount },
          },
        },
      };
    } else {
      return {
        updateOne: {
          filter: { _id: update.productId },
          update: { $set: { 'nonVariant.stockCount': update.stockCount } },
        },
      };
    }
  });

  const result = await Product.bulkWrite(bulkOps);

  return {
    success: true,
    message: 'Bulk stock update completed',
    data: result,
  };
};

module.exports = {
  createProduct,
  getActiveProducts,
  getAllProducts,
  getProductById,
  updateProduct,
  partialUpdateProduct,
  softDeleteProduct,
  hardDeleteProduct,
  bulkUpdateStock,
};