const { Product } = require("../../../models/Product.model");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiError");
const { uploadToCloud } = require("../../../utils/uploadFileToS3");

// ============================================================
// BASE PRICE HELPER
// ============================================================
const ensureBasePrice = (product) => {
  if (!product) return product;

  if (
    !product.basePrice ||
    product.basePrice === 0
  ) {
    if (
      product.price?.salePrice &&
      product.price.salePrice > 0
    ) {
      product.basePrice =
        product.price.salePrice;
    } else if (
      product.productType === "variant"
    ) {
      const variants =
        product.variant?.unitOnlyVariants ||
        product.variant?.sizeColorVariants ||
        product.variant?.colorOnlyVariants ||
        product.variant?.sizeOnlyVariants ||
        [];

      const prices = variants
        .map(
          (item) =>
            item.price?.salePrice ||
            item.price?.costPrice
        )
        .filter(
          (price) =>
            typeof price === "number" &&
            price > 0
        );

      if (prices.length > 0) {
        product.basePrice =
          Math.min(...prices);
      }
    } else if (
      product.productType === "nonVariant" &&
      product.nonVariant?.price
    ) {
      product.basePrice =
        product.nonVariant.price.salePrice ||
        product.nonVariant.price.costPrice ||
        0;
    }
  }

  return product;
};

// ============================================================
// GET ACTIVE PRODUCTS
// ============================================================
const getActiveProducts = async (
  req,
  res
) => {
  const { categoryId } = req.query;

  const filter = {
    status: "active",
  };

  if (categoryId) {
    filter.category_id = categoryId;
  }

  const products =
    await Product.aggregate([
      {
        $match: filter,
      },
    ]);

  return {
    success: true,
    message:
      "Active Products fetched successfully",
    data: products.map(
      ensureBasePrice
    ),
  };
};

// ============================================================
// CREATE PRODUCT
// ============================================================
const createProduct = async (
  req,
  res
) => {
  console.log(
    "🟢 Incoming product creation request"
  );

  console.log("📦 Body:", req.body);
  console.log("📸 Files:", req.files);

  // ==========================================================
  // SAFE JSON PARSER
  // ==========================================================
  const safeParse = (data) => {
    if (
      data === undefined ||
      data === null ||
      data === ""
    ) {
      return undefined;
    }

    try {
      return typeof data === "string"
        ? JSON.parse(data)
        : data;
    } catch (error) {
      console.error(
        "❌ JSON parse error:",
        error
      );

      return typeof data === "object"
        ? data
        : undefined;
    }
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
    isTodaySpecial,
  } = req.body;

  // ==========================================================
  // ARRAY FIELDS
  // ==========================================================
  const productBenifits =
    safeParse(
      req.body.productBenifits
    );

  const productIngrediants =
    safeParse(
      req.body.productIngrediants
    );

  const searchTags =
    safeParse(
      req.body.searchTags
    );

  // ==========================================================
  // FILES
  // ==========================================================
  const files = Array.isArray(
    req.files
  )
    ? req.files
    : [];

  const productImageFiles =
    files.filter(
      (file) =>
        file.fieldname ===
        "productImages"
    );

  const variantImageFiles =
    files.filter((file) =>
      file.fieldname.startsWith(
        "variantImages_"
      )
    );

  const nonVariantImageFiles =
    files.filter(
      (file) =>
        file.fieldname ===
        "nonVariantImages"
    );

  // ==========================================================
  // REQUIRED FIELD VALIDATION
  // ==========================================================
  if (
    !productName ||
    !productCategory ||
    !productType
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Missing required fields: productName, productCategory, productType"
    );
  }

  if (
    !productDescription ||
    productDescription.length < 20
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Product description must be at least 20 characters"
    );
  }

  if (
    !productUsage ||
    productUsage.length < 10
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Product usage must be at least 10 characters"
    );
  }

  if (
    !productBenifits ||
    productBenifits.length === 0
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "At least one product benefit is required"
    );
  }

  if (
    !productIngrediants ||
    productIngrediants.length === 0
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "At least one product ingredient is required"
    );
  }

  // ==========================================================
  // PRODUCT TYPE VALIDATION
  // ==========================================================
  if (
    productType === "variant" &&
    !variant
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Variant data is required for variant products"
    );
  }

  // ==========================================================
  // UPLOAD MAIN PRODUCT IMAGES
  // ==========================================================
  const productImageUrls = [];

  for (
    const file of productImageFiles
  ) {
    const uploadedUrl =
      await uploadToCloud(
        file,
        "products"
      );

    productImageUrls.push(
      uploadedUrl
    );
  }

  if (
    productImageUrls.length === 0
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "At least one product image is required"
    );
  }

  // ==========================================================
  // MAIN PRODUCT DATA
  // ==========================================================
  const productData = {
    productName,

    productTitle:
      productTitle ||
      productName,

    productCategory,

    category_id,

    productType,

    productImages:
      productImageUrls,

    productDescription,

    productBenifits,

    productUsage,

    productIngrediants,

    searchTags:
      searchTags || [],

    status:
      status || "active",

    createdBy:
      createdBy || undefined,

    isReturnable:
      isReturnable === "true" ||
      isReturnable === true,

    isTodaySpecial:
      isTodaySpecial === "true" ||
      isTodaySpecial === true,
  };

  // ==========================================================
  // BASE PRICE
  // ==========================================================
  const basePriceInput =
    req.body.basePrice !==
      undefined &&
    req.body.basePrice !== ""
      ? parseFloat(
          req.body.basePrice
        )
      : undefined;

  const priceInput =
    safeParse(req.body.price);

  if (
    basePriceInput !==
      undefined &&
    !isNaN(basePriceInput)
  ) {
    productData.basePrice =
      basePriceInput;

    productData.price = {
      costPrice:
        priceInput?.costPrice !==
          undefined &&
        priceInput?.costPrice !== ""
          ? parseFloat(
              priceInput.costPrice
            )
          : basePriceInput,

      salePrice:
        priceInput?.salePrice !==
          undefined &&
        priceInput?.salePrice !== ""
          ? parseFloat(
              priceInput.salePrice
            )
          : basePriceInput,

      realPrice:
        parseFloat(
          priceInput?.realPrice || 0
        ),

      discount:
        parseFloat(
          priceInput?.discount || 0
        ),

      tax:
        parseFloat(
          priceInput?.tax || 0
        ),
    };
  } else if (
    priceInput &&
    (
      priceInput.salePrice !==
        undefined ||
      priceInput.costPrice !==
        undefined
    )
  ) {
    const salePrice =
      parseFloat(
        priceInput.salePrice ??
          priceInput.costPrice ??
          0
      );

    productData.basePrice =
      salePrice;

    productData.price = {
      costPrice:
        parseFloat(
          priceInput.costPrice ??
            salePrice
        ),

      salePrice,

      realPrice:
        parseFloat(
          priceInput.realPrice || 0
        ),

      discount:
        parseFloat(
          priceInput.discount || 0
        ),

      tax:
        parseFloat(
          priceInput.tax || 0
        ),
    };
  }

  // ==========================================================
  // SUBCATEGORY DISABLED
  // ==========================================================
  if (productSubCategory) {
    productData.productSubCategory =
      productSubCategory;
  }

  if (subcategory_id) {
    productData.subcategory_id =
      subcategory_id;
  }

  // ==========================================================
  // VARIANT PRODUCT
  // ==========================================================
  if (
    productType === "variant"
  ) {
    const variantData =
      safeParse(variant);

    if (!variantData) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Invalid variant data"
      );
    }

    // --------------------------------------------------------
    // Upload variant images
    // --------------------------------------------------------
    const variantImagesByIndex =
      {};

    for (
      const file of variantImageFiles
    ) {
      const match =
        file.fieldname.match(
          /variantImages_(\d+)/
        );

      if (!match) continue;

      const index =
        parseInt(
          match[1],
          10
        );

      if (
        !variantImagesByIndex[index]
      ) {
        variantImagesByIndex[
          index
        ] = [];
      }

      const url =
        await uploadToCloud(
          file,
          "products/variants"
        );

      variantImagesByIndex[
        index
      ].push(url);
    }

    // --------------------------------------------------------
    // Assign variant images
    // --------------------------------------------------------
    const variantType =
      variantData.variantType;

    const variantKey =
      variantType === "unitOnly"
        ? "unitOnlyVariants"
        : `${variantType}Variants`;

    if (
      Array.isArray(
        variantData[variantKey]
      )
    ) {
      variantData[
        variantKey
      ].forEach(
        (variantItem, index) => {
          const key =
            index + 1;

          variantItem.variantImages =
            variantImagesByIndex[
              key
            ] || [];
        }
      );
    }

    // --------------------------------------------------------
    // Variant base price fallback
    // --------------------------------------------------------
    if (
      !productData.basePrice
    ) {
      const variantList =
        variantData.unitOnlyVariants ||
        variantData.sizeColorVariants ||
        variantData.colorOnlyVariants ||
        variantData.sizeOnlyVariants ||
        [];

      const firstPrice =
        variantList[0]?.price
          ?.salePrice ||
        variantList[0]?.price
          ?.costPrice ||
        0;

      if (firstPrice) {
        productData.basePrice =
          firstPrice;

        productData.price = {
          costPrice:
            variantList[0]?.price
              ?.costPrice ||
            firstPrice,

          salePrice:
            firstPrice,

          realPrice: 0,

          discount:
            variantList[0]?.price
              ?.discount || 0,

          tax:
            variantList[0]?.price
              ?.tax || 0,
        };
      }
    }

    productData.variant =
      variantData;
  }

  // ==========================================================
  // NON-VARIANT PRODUCT
  // ==========================================================
  else if (
    productType ===
    "nonVariant"
  ) {
    const nonVariantData =
      safeParse(nonVariant);

    if (!nonVariantData) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Invalid nonVariant data"
      );
    }

    // --------------------------------------------------------
    // Upload nonVariant images
    // --------------------------------------------------------
    const nonVariantImageUrls =
      [];

    for (
      const file of nonVariantImageFiles
    ) {
      const url =
        await uploadToCloud(
          file,
          "products/nonVariant"
        );

      nonVariantImageUrls.push(
        url
      );
    }

    const finalProductTitle =
      nonVariantData.productTitle ||
      productTitle ||
      productName;

    productData.nonVariant = {
      productTitle:
        finalProductTitle,

      price:
        nonVariantData.price || {
          costPrice: 0,
          salePrice: 0,
          discount: 0,
          tax: 0,
        },

      stockCount:
        Number(
          nonVariantData.stockCount ||
            0
        ),

      skuCode:
        nonVariantData.skuCode ||
        "",

      productCode:
        nonVariantData.productCode ||
        "",

      nonVariantImages:
        nonVariantImageUrls,
    };

    // --------------------------------------------------------
    // Base price fallback
    // --------------------------------------------------------
    if (
      !productData.basePrice
    ) {
      productData.basePrice =
        productData.nonVariant
          .price?.salePrice ||
        productData.nonVariant
          .price?.costPrice ||
        0;

      productData.price =
        productData.nonVariant.price;
    }
  }

  // ==========================================================
  // OPTIONAL FIELDS
  // ==========================================================
  if (inventory) {
    productData.inventory =
      safeParse(inventory);
  }

  if (shipping) {
    productData.shipping =
      safeParse(shipping);
  }

  if (linkProducts) {
    productData.linkProducts =
      safeParse(linkProducts);
  }

  // ==========================================================
  // SAVE PRODUCT
  // ==========================================================
  try {
    const product =
      new Product(productData);

    await product.save();

    console.log(
      "✅ Product created:",
      product._id
    );

    return {
      success: true,

      message:
        "Product created successfully",

      data: product,
    };
  } catch (error) {
    console.error(
      "❌ Product create error:",
      error
    );

    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to create product: ${error.message}`
    );
  }
};

// ============================================================
// GET ALL PRODUCTS
// ============================================================
const getAllProducts = async (
  req,
  res
) => {
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
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const filter = {};

  if (productCategory) {
    filter.productCategory =
      productCategory;
  }

  if (productSubCategory) {
    filter.productSubCategory =
      productSubCategory;
  }

  if (productType) {
    filter.productType =
      productType;
  }

  if (status) {
    filter.status = status;
  }

  if (search) {
    filter.$or = [
      {
        productName: {
          $regex: search,
          $options: "i",
        },
      },
      {
        productDescription: {
          $regex: search,
          $options: "i",
        },
      },
      {
        searchTags: {
          $in: [
            new RegExp(
              search,
              "i"
            ),
          ],
        },
      },
    ];
  }

  if (minPrice || maxPrice) {
    const priceFilter = {};

    if (minPrice) {
      priceFilter.$gte =
        Number(minPrice);
    }

    if (maxPrice) {
      priceFilter.$lte =
        Number(maxPrice);
    }

    filter.$or = [
      {
        basePrice:
          priceFilter,
      },
      {
        "price.salePrice":
          priceFilter,
      },
      {
        "variant.unitOnlyVariants.price.salePrice":
          priceFilter,
      },
      {
        "nonVariant.price.salePrice":
          priceFilter,
      },
      {
        "variant.sizeColorVariants.price.salePrice":
          priceFilter,
      },
      {
        "variant.colorOnlyVariants.price.salePrice":
          priceFilter,
      },
      {
        "variant.sizeOnlyVariants.price.salePrice":
          priceFilter,
      },
    ];
  }

  const skip =
    (Number(page) - 1) *
    Number(limit);

  const sortOptions = {
    [sortBy]:
      sortOrder === "asc"
        ? 1
        : -1,
  };

  const products =
    await Product.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .lean();

  const total =
    await Product.countDocuments(
      filter
    );

  if (
    !products ||
    products.length === 0
  ) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "No products found"
    );
  }

  return {
    success: true,

    data: products.map(
      ensureBasePrice
    ),

    pagination: {
      currentPage:
        Number(page),

      totalPages:
        Math.ceil(
          total /
            Number(limit)
        ),

      totalProducts: total,

      limit:
        Number(limit),
    },
  };
};

// ============================================================
// GET PRODUCT BY ID
// ============================================================
const getProductById = async (
  req,
  res
) => {
  const { id } =
    req.params;

  const product =
    await Product.findById(
      id
    ).lean();

  if (!product) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Product not found"
    );
  }

  return {
    success: true,
    data:
      ensureBasePrice(product),
  };
};

// ============================================================
// UPDATE PRODUCT
// ============================================================
const updateProduct = async (
  req,
  res
) => {
  const { _id } =
    req.params;

  const updateData =
    req.body;

  console.log(
    "========== UPDATE PRODUCT START =========="
  );

  console.log(
    "Product ID:",
    _id
  );

  console.log(
    "Request Body Keys:",
    Object.keys(updateData)
  );

  // ==========================================================
  // SAFE PARSE
  // ==========================================================
  const safeParse = (data) => {
    if (
      data === undefined ||
      data === null ||
      data === ""
    ) {
      return undefined;
    }

    try {
      return typeof data === "string"
        ? JSON.parse(data)
        : data;
    } catch {
      return undefined;
    }
  };

  // ==========================================================
  // FILE EXTRACTION
  // ==========================================================
  let newProductImages = [];
  let newVariantImages = {};
  let newNonVariantImages = [];

  if (Array.isArray(req.files)) {
    newProductImages =
      req.files.filter(
        (file) =>
          file.fieldname ===
          "productImages"
      );

    req.files.forEach(
      (file) => {
        const match =
          file.fieldname.match(
            /variantImages_(\d+)/
          );

        if (!match) return;

        const index =
          match[1];

        if (
          !newVariantImages[
            index
          ]
        ) {
          newVariantImages[
            index
          ] = [];
        }

        newVariantImages[
          index
        ].push(file);
      }
    );

    newNonVariantImages =
      req.files.filter(
        (file) =>
          file.fieldname ===
          "nonVariantImages"
      );
  } else if (req.files) {
    newProductImages =
      req.files.productImages ||
      [];

    Object.keys(
      req.files
    ).forEach(
      (fieldname) => {
        const match =
          fieldname.match(
            /variantImages_(\d+)/
          );

        if (!match) return;

        const index =
          match[1];

        const files =
          req.files[fieldname];

        newVariantImages[
          index
        ] = Array.isArray(files)
          ? files
          : [files];
      }
    );

    newNonVariantImages =
      req.files
        .nonVariantImages ||
      [];
  }

  // ==========================================================
  // PRODUCT CHECK
  // ==========================================================
  const existingProduct =
    await Product.findById(_id);

  if (!existingProduct) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Product not found"
    );
  }

  const updateFields = {};

  // ==========================================================
  // BASIC FIELDS
  // ==========================================================
  [
    "productName",
    "productTitle",
    "productDescription",
    "status",
    "updatedBy",
    "category_id",
    "productCategory",
    "productUsage",
  ].forEach(
    (key) => {
      if (
        updateData[key] !==
        undefined
      ) {
        updateFields[key] =
          updateData[key];
      }
    }
  );

  if (
    updateData.isReturnable !==
      undefined
  ) {
    updateFields.isReturnable =
      updateData.isReturnable ===
        "true" ||
      updateData.isReturnable ===
        true;
  }

  if (
    updateData.isTodaySpecial !==
      undefined
  ) {
    updateFields.isTodaySpecial =
      updateData.isTodaySpecial ===
        "true" ||
      updateData.isTodaySpecial ===
        true;
  }

  // ==========================================================
  // SUBCATEGORY DISABLED
  // ==========================================================
  // Existing legacy subcategory values are preserved.
  // Do not overwrite them from the new edit form.

  // ==========================================================
  // ARRAY FIELDS
  // ==========================================================
  if (
    updateData.productBenifits !==
      undefined
  ) {
    updateFields.productBenifits =
      safeParse(
        updateData.productBenifits
      );
  }

  if (
    updateData.productIngrediants !==
      undefined
  ) {
    updateFields.productIngrediants =
      safeParse(
        updateData.productIngrediants
      );
  }

  if (
    updateData.searchTags !==
      undefined
  ) {
    updateFields.searchTags =
      safeParse(
        updateData.searchTags
      ) || [];
  }

  // ==========================================================
  // BASE PRICE
  // ==========================================================
  if (
    updateData.basePrice !==
      undefined &&
    updateData.basePrice !==
      ""
  ) {
    const parsedBasePrice =
      parseFloat(
        updateData.basePrice
      );

    if (
      !isNaN(parsedBasePrice)
    ) {
      const parsedPrice =
        safeParse(
          updateData.price
        ) || {};

      updateFields.basePrice =
        parsedBasePrice;

      updateFields.price = {
        costPrice:
          parsedPrice.costPrice !==
            undefined &&
          parsedPrice.costPrice !==
            ""
            ? parseFloat(
                parsedPrice.costPrice
              )
            : parsedBasePrice,

        salePrice:
          parsedPrice.salePrice !==
            undefined &&
          parsedPrice.salePrice !==
            ""
            ? parseFloat(
                parsedPrice.salePrice
              )
            : parsedBasePrice,

        realPrice:
          parseFloat(
            parsedPrice.realPrice ||
              0
          ),

        discount:
          parseFloat(
            parsedPrice.discount ||
              0
          ),

        tax:
          parseFloat(
            parsedPrice.tax || 0
          ),
      };
    }
  } else if (
    updateData.price !==
      undefined
  ) {
    const parsedPrice =
      safeParse(
        updateData.price
      );

    if (
      parsedPrice &&
      (
        parsedPrice.salePrice !==
          undefined ||
        parsedPrice.costPrice !==
          undefined
      )
    ) {
      const salePrice =
        parseFloat(
          parsedPrice.salePrice ??
            parsedPrice.costPrice ??
            0
        );

      updateFields.basePrice =
        salePrice;

      updateFields.price = {
        costPrice:
          parseFloat(
            parsedPrice.costPrice ??
              salePrice
          ),

        salePrice,

        realPrice:
          parseFloat(
            parsedPrice.realPrice ||
              0
          ),

        discount:
          parseFloat(
            parsedPrice.discount ||
              0
          ),

        tax:
          parseFloat(
            parsedPrice.tax ||
              0
          ),
      };
    }
  }

  // ==========================================================
  // 🖼️ MAIN PRODUCT IMAGES — IMPORTANT FIX
  // ==========================================================
  //
  // If existingProductImages is NOT sent:
  //     KEEP existing DB images.
  //
  // If existingProductImages IS sent:
  //     Use those kept images + newly uploaded images.
  //
  // This prevents old product images from becoming [].
  // ==========================================================

  const hasExistingProductImagesField =
    updateData.existingProductImages !==
    undefined;

  let keptProductImages;

  if (
    hasExistingProductImagesField
  ) {
    keptProductImages =
      safeParse(
        updateData.existingProductImages
      );

    if (
      !Array.isArray(
        keptProductImages
      )
    ) {
      keptProductImages = [];
    }
  } else {
    keptProductImages =
      Array.isArray(
        existingProduct.productImages
      )
        ? existingProduct.productImages
        : [];
  }

  const uploadedProductImages =
    [];

  for (
    const file of newProductImages
  ) {
    const url =
      await uploadToCloud(
        file,
        "products"
      );

    uploadedProductImages.push(
      url
    );
  }

  updateFields.productImages = [
    ...keptProductImages,
    ...uploadedProductImages,
  ];

  console.log(
    "FINAL PRODUCT IMAGES:",
    updateFields.productImages
  );

  // ==========================================================
  // NON-VARIANT UPDATE
  // ==========================================================
  if (
    existingProduct.productType ===
      "nonVariant" &&
    updateData.nonVariant !==
      undefined
  ) {
    const nonVariantData =
      safeParse(
        updateData.nonVariant
      ) || {};

    // --------------------------------------------------------
    // IMPORTANT IMAGE FIX
    // --------------------------------------------------------
    const hasExistingNonVariantImagesField =
      updateData.existingNonVariantImages !==
      undefined;

    let keptNonVariantImages;

    if (
      hasExistingNonVariantImagesField
    ) {
      keptNonVariantImages =
        safeParse(
          updateData.existingNonVariantImages
        );

      if (
        !Array.isArray(
          keptNonVariantImages
        )
      ) {
        keptNonVariantImages =
          [];
      }
    } else {
      keptNonVariantImages =
        Array.isArray(
          existingProduct
            .nonVariant
            ?.nonVariantImages
        )
          ? existingProduct
              .nonVariant
              .nonVariantImages
          : [];
    }

    const uploadedImages =
      [];

    for (
      const file of newNonVariantImages
    ) {
      const url =
        await uploadToCloud(
          file,
          "products/nonVariant"
        );

      uploadedImages.push(
        url
      );
    }

    const finalNonVariantImages =
      [
        ...keptNonVariantImages,
        ...uploadedImages,
      ];

    // Remove image field from incoming object
    const {
      nonVariantImages:
        ignoredImages,
      ...cleanNonVariantData
    } = nonVariantData;

    updateFields.nonVariant = {
      ...(existingProduct.nonVariant?.toObject?.() ||
        {}),

      ...cleanNonVariantData,

      nonVariantImages:
        finalNonVariantImages,
    };

    // Sync base price
    if (
      updateFields.nonVariant
        .price &&
      (
        updateFields.basePrice ===
          undefined ||
        updateFields.basePrice ===
          0
      )
    ) {
      updateFields.basePrice =
        updateFields.nonVariant
          .price.salePrice ||
        updateFields.nonVariant
          .price.costPrice ||
        0;

      updateFields.price =
        updateFields.nonVariant.price;
    }

    console.log(
      "FINAL NONVARIANT IMAGES:",
      finalNonVariantImages
    );
  }

  // ==========================================================
  // VARIANT UPDATE
  // ==========================================================
  if (
    existingProduct.productType ===
      "variant" &&
    updateData.variant !==
      undefined
  ) {
    const variantData =
      safeParse(
        updateData.variant
      );

    if (
      !variantData?.variantType
    ) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "variantType is required"
      );
    }

    const variantType =
      variantData.variantType;

    const variantKey =
      variantType ===
      "unitOnly"
        ? "unitOnlyVariants"
        : `${variantType}Variants`;

    const existingVariants =
      existingProduct.variant?.[
        variantKey
      ] || [];

    const incomingVariants =
      Array.isArray(
        variantData[variantKey]
      )
        ? variantData[variantKey]
        : [];

    const finalVariants =
      [];

    for (
      let i = 0;
      i < incomingVariants.length;
      i++
    ) {
      const frontendIndex =
        i + 1;

      const hasExistingVariantImagesField =
        updateData[
          `existingVariantImages_${frontendIndex}`
        ] !== undefined;

      let keptVariantImages;

      if (
        hasExistingVariantImagesField
      ) {
        keptVariantImages =
          safeParse(
            updateData[
              `existingVariantImages_${frontendIndex}`
            ]
          );

        if (
          !Array.isArray(
            keptVariantImages
          )
        ) {
          keptVariantImages =
            [];
        }
      } else {
        keptVariantImages =
          Array.isArray(
            existingVariants[i]
              ?.variantImages
          )
            ? existingVariants[
                i
              ].variantImages
            : [];
      }

      // ------------------------------------------------------
      // Upload new variant images
      // ------------------------------------------------------
      const uploadedImages =
        [];

      const variantFiles =
        newVariantImages[
          frontendIndex
        ] || [];

      for (
        const file of variantFiles
      ) {
        const url =
          await uploadToCloud(
            file,
            "products/variants"
          );

        uploadedImages.push(
          url
        );
      }

      // ------------------------------------------------------
      // Preserve old images + new images
      // ------------------------------------------------------
      const finalVariantImages =
        [
          ...keptVariantImages,
          ...uploadedImages,
        ];

      const baseVariant =
        existingVariants[i]
          ?.toObject?.() ||
        {};

      const {
        variantImages:
          ignoredVariantImages,
        ...cleanIncomingVariant
      } =
        incomingVariants[i] ||
        {};

      const variantToSave = {
        ...baseVariant,

        ...cleanIncomingVariant,

        variantImages:
          finalVariantImages,
      };

      if (
        !variantToSave.price
      ) {
        variantToSave.price = {
          costPrice: 0,
          salePrice: 0,
          realPrice: 0,
          discount: 0,
          tax: 0,
        };
      }

      finalVariants.push(
        variantToSave
      );
    }

    updateFields.variant = {
      variantType,

      unitOnlyVariants:
        variantType ===
        "unitOnly"
          ? finalVariants
          : [],

      sizeColorVariants:
        variantType ===
        "sizeColor"
          ? finalVariants
          : [],

      colorOnlyVariants:
        variantType ===
        "colorOnly"
          ? finalVariants
          : [],

      sizeOnlyVariants:
        variantType ===
        "sizeOnly"
          ? finalVariants
          : [],
    };
  }

  // ==========================================================
  // OTHER OPTIONAL FIELDS
  // ==========================================================
  [
    "inventory",
    "shipping",
    "linkProducts",
    "sareeAttributes",
    "mensKidsAttributes",
    "jewelleryAttributes",
    "otherAttributes",
  ].forEach(
    (key) => {
      if (
        updateData[key] !==
        undefined
      ) {
        updateFields[key] =
          safeParse(
            updateData[key]
          );
      }
    }
  );

  // ==========================================================
  // SAVE UPDATE
  // ==========================================================
  console.log(
    "FINAL UPDATE FIELD KEYS:",
    Object.keys(
      updateFields
    )
  );

  const updatedProduct =
    await Product.findByIdAndUpdate(
      _id,

      {
        $set: updateFields,
      },

      {
        new: true,
        runValidators: true,
      }
    );

  if (!updatedProduct) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Product update failed"
    );
  }

  console.log(
    "UPDATED PRODUCT IMAGES:",
    updatedProduct.productImages
  );

  if (
    updatedProduct.nonVariant
  ) {
    console.log(
      "UPDATED NONVARIANT IMAGES:",
      updatedProduct.nonVariant
        .nonVariantImages
    );
  }

  console.log(
    "========== UPDATE PRODUCT END =========="
  );

  return {
    success: true,

    message:
      "Product updated successfully",

    data: updatedProduct,
  };
};

// ============================================================
// PARTIAL UPDATE
// ============================================================
const partialUpdateProduct =
  async (req, res) => {
    const { _id } =
      req.params;

    const {
      field,
      value,
    } = req.body;

    if (!field) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Field path is required"
      );
    }

    let parsedValue = value;

    if (
      typeof value ===
      "string"
    ) {
      try {
        parsedValue =
          JSON.parse(value);
      } catch {
        parsedValue =
          value;
      }
    }

    const updateQuery = {
      $set: {
        [field]:
          parsedValue,
      },
    };

    const updatedProduct =
      await Product.findByIdAndUpdate(
        _id,
        updateQuery,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!updatedProduct) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Product not found"
      );
    }

    return {
      success: true,

      message:
        "Product field updated successfully",

      data: updatedProduct,
    };
  };

// ============================================================
// SOFT DELETE
// ============================================================
const softDeleteProduct =
  async (req, res) => {
    const { id } =
      req.params;

    const product =
      await Product.findByIdAndUpdate(
        id,

        {
          $set: {
            status:
              "inactive",
          },
        },

        {
          new: true,
        }
      );

    if (!product) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Product not found"
      );
    }

    return {
      success: true,

      message:
        "Product deactivated successfully",

      data: product,
    };
  };

// ============================================================
// HARD DELETE
// ============================================================
const hardDeleteProduct =
  async (req, res) => {
    const { _id } =
      req.params;

    const product =
      await Product.findByIdAndDelete(
        _id
      );

    if (!product) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Product not found"
      );
    }

    return {
      success: true,

      message:
        "Product permanently deleted",
    };
  };

// ============================================================
// BULK STOCK UPDATE
// ============================================================
const bulkUpdateStock =
  async (req, res) => {
    const { updates } =
      req.body;

    if (
      !Array.isArray(
        updates
      ) ||
      updates.length === 0
    ) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Updates array is required"
      );
    }

    const bulkOps =
      updates.map(
        (update) => {
          if (
            update.variantId
          ) {
            return {
              updateOne: {
                filter: {
                  _id:
                    update.productId,

                  "variant.sizeColorVariants._id":
                    update.variantId,
                },

                update: {
                  $set: {
                    "variant.sizeColorVariants.$.stockCount":
                      update.stockCount,
                  },
                },
              },
            };
          }

          return {
            updateOne: {
              filter: {
                _id:
                  update.productId,
              },

              update: {
                $set: {
                  "nonVariant.stockCount":
                    update.stockCount,
                },
              },
            },
          };
        }
      );

    const result =
      await Product.bulkWrite(
        bulkOps
      );

    return {
      success: true,

      message:
        "Bulk stock update completed",

      data: result,
    };
  };

// ============================================================
// DELETE VARIANT
// ============================================================
const deleteVariant =
  async (req, res) => {
    const {
      productId,
      variantId,
    } = req.params;

    const product =
      await Product.findById(
        productId
      );

    if (!product) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Product not found"
      );
    }

    if (
      product.productType !==
        "variant" ||
      !product.variant
    ) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Product is not a variant product"
      );
    }

    const variantType =
      product.variant.variantType;

    const variantKey =
      variantType ===
      "unitOnly"
        ? "unitOnlyVariants"
        : `${variantType}Variants`;

    if (
      !Array.isArray(
        product.variant[
          variantKey
        ]
      )
    ) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "No variants found for product"
      );
    }

    const initialLength =
      product.variant[
        variantKey
      ].length;

    product.variant[
      variantKey
    ] =
      product.variant[
        variantKey
      ].filter(
        (variant) =>
          variant._id?.toString() !==
            variantId &&
          variant.id?.toString() !==
            variantId
      );

    if (
      product.variant[
        variantKey
      ].length ===
      initialLength
    ) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Variant not found"
      );
    }

    await product.save();

    return {
      success: true,

      message:
        "Variant deleted successfully",

      data: product,
    };
  };

// ============================================================
// EXPORTS
// ============================================================
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
  deleteVariant,
};