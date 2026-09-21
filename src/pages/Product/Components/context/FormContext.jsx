import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useMemo,
} from "react";

const ProductFormContext = createContext();

const EMPTY_PRICE = {
  costPrice: "",
  salePrice: "",
  discount: "",
  tax: "",
};

const EMPTY_NON_VARIANT = {
  productTitle: "",
  nonVariantImages: [],
  price: { ...EMPTY_PRICE },
  stockCount: "",
  skuCode: "",
  productCode: "",
};

const EMPTY_VARIANT = {
  variantType: "unitOnly",
  unitOnlyVariants: [],
};

const INITIAL_FORM_STATE = {
  productName: "",
  productTitle: "",
  productCategory: "",
  category_id: "",

  // SUBCATEGORY TEMPORARILY DISABLED.
  // Legacy subcategory values may still exist on old products,
  // but they are intentionally not generated in new payloads.

  stockCount: "",
  productType: "nonVariant",

  // Product-level base price. This is independent from variant prices.
  basePrice: "",

  productImages: [],
  productIngrediants: [],
  productDescription: "",
  productBenifits: [],
  productUsage: "",

  hasVariation: false,
  hasNonVariation: true,

  // Current supported variant structure.
  variant: {
    variantType: "unitOnly",
    unitOnlyVariants: [],
  },

  nonVariant: {
    ...EMPTY_NON_VARIANT,
    price: { ...EMPTY_PRICE },
  },

  // Kept for backward compatibility with existing non-variant form logic.
  price: { ...EMPTY_PRICE },

  inventory: {
    sku: "",
    productCode: "",
    gtin: "",
    stockManagement: "manual",
    trackStock: "inStock",
    purchaseLimit: 10,
  },

  shipping: {
    productWeight: "",
    dimension: {
      length: "",
      width: "",
      height: "",
    },
    shippingClass: "standard",
  },

  linkProducts: {
    relatedProducts: [],
  },

  searchTags: [],
  status: "active",
};

const createInitialFormState = () => ({
  ...INITIAL_FORM_STATE,
  productImages: [],
  productIngrediants: [],
  productBenifits: [],
  variant: {
    variantType: "unitOnly",
    unitOnlyVariants: [],
  },
  nonVariant: {
    ...EMPTY_NON_VARIANT,
    nonVariantImages: [],
    price: { ...EMPTY_PRICE },
  },
  price: { ...EMPTY_PRICE },
  inventory: { ...INITIAL_FORM_STATE.inventory },
  shipping: {
    ...INITIAL_FORM_STATE.shipping,
    dimension: { ...INITIAL_FORM_STATE.shipping.dimension },
  },
  linkProducts: {
    ...INITIAL_FORM_STATE.linkProducts,
    relatedProducts: [],
  },
  searchTags: [],
});

const normalizePrice = (price = {}) => ({
  costPrice:
    price.costPrice !== undefined && price.costPrice !== null
      ? price.costPrice
      : "",
  salePrice:
    price.salePrice !== undefined && price.salePrice !== null
      ? price.salePrice
      : "",
  discount:
    price.discount !== undefined && price.discount !== null
      ? price.discount
      : "",
  tax: price.tax !== undefined && price.tax !== null ? price.tax : "",
});

const normalizeUnitVariants = (variant = {}) => {
  const unitVariants = Array.isArray(variant?.unitOnlyVariants)
    ? variant.unitOnlyVariants
    : [];

  return {
    variantType: "unitOnly",
    unitOnlyVariants: unitVariants.map((item) => ({
      ...item,
      unit: item?.unit || "",
      stockCount:
        item?.stockCount !== undefined && item?.stockCount !== null
          ? item.stockCount
          : "",
      skuCode: item?.skuCode || "",
      productCode: item?.productCode || "",
      variantImages: Array.isArray(item?.variantImages)
        ? item.variantImages
        : [],
      price: normalizePrice(item?.price),
    })),
  };
};

export const ProductFormProvider = ({ children }) => {
  const [formData, setFormData] = useState(createInitialFormState);
  const [errors, setErrors] = useState({});
  const [uploadedImages, setUploadedImages] = useState([]);
  const [keyIngredients, setKeyIngredients] = useState([]);
  const [keyBenefits, setKeyBenefits] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [productId, setProductId] = useState(null);

  const validateField = useCallback((name, value) => {
    switch (name) {
      case "productName":
        return typeof value === "string" && value.trim()
          ? ""
          : "Product name is required";

      case "productCategory":
        return value ? "" : "Category is required";

      // SUBCATEGORY TEMPORARILY DISABLED.
      // case "productSubCategory":
      //   return value ? "" : "Subcategory is required";

      case "productDescription":
        return typeof value === "string" && value.trim().length >= 20
          ? ""
          : "Description must be at least 20 characters";

      case "productUsage":
        return typeof value === "string" && value.trim().length >= 10
          ? ""
          : "Usage instructions must be at least 10 characters";

      case "stockCount":
        return value === "" ||
          (!isNaN(value) && Number(value) >= 0)
          ? ""
          : "Must be a positive number";

      case "costPrice":
        return value === "" ||
          (!isNaN(value) && Number(value) >= 0)
          ? ""
          : "Valid price required";

      case "basePrice":
        return value === "" ||
          (!isNaN(value) && Number(value) >= 0)
          ? ""
          : "Valid base price required";

      case "discount":
      case "tax":
        return value === "" ||
          (!isNaN(value) && Number(value) >= 0 && Number(value) <= 100)
          ? ""
          : "0-100% only";

      default:
        return "";
    }
  }, []);

  const updateFormData = useCallback(
    (data) => {
      setFormData((prev) => {
        const newData = { ...prev, ...data };
        const newErrors = {};

        Object.keys(data).forEach((key) => {
          newErrors[key] = validateField(key, newData[key]);
        });

        setErrors((prevErrors) => ({
          ...prevErrors,
          ...newErrors,
        }));

        return newData;
      });
    },
    [validateField]
  );

  const validateStep = useCallback(
    (step) => {
      const stepErrors = {};

      switch (step) {
        case "Product": {
          stepErrors.productName = validateField(
            "productName",
            formData.productName
          );

          stepErrors.productCategory = validateField(
            "productCategory",
            formData.productCategory
          );

          // SUBCATEGORY TEMPORARILY DISABLED.
          // stepErrors.productSubCategory = validateField(
          //   "productSubCategory",
          //   formData.productSubCategory
          // );

          stepErrors.productDescription = validateField(
            "productDescription",
            formData.productDescription
          );

          stepErrors.productUsage = validateField(
            "productUsage",
            formData.productUsage
          );

          if (uploadedImages.length === 0) {
            stepErrors.productImages =
              "At least one product image is required";
          }

          if (keyBenefits.length === 0) {
            stepErrors.productBenifits =
              "At least one benefit is required";
          }

          if (keyIngredients.length === 0) {
            stepErrors.productIngrediants =
              "At least one ingredient is required";
          }

          if (formData.productType === "nonVariant") {
            stepErrors.productTitle = validateField(
              "productTitle",
              formData.productTitle
            );

            const nonVariantStock =
              formData.nonVariant?.stockCount !== undefined &&
              formData.nonVariant?.stockCount !== ""
                ? formData.nonVariant.stockCount
                : formData.stockCount;

            const nonVariantCost =
              formData.nonVariant?.price?.costPrice !== undefined &&
              formData.nonVariant?.price?.costPrice !== ""
                ? formData.nonVariant.price.costPrice
                : formData.price?.costPrice;

            stepErrors.stockCount = validateField(
              "stockCount",
              nonVariantStock
            );

            stepErrors.costPrice = validateField(
              "costPrice",
              nonVariantCost
            );

            // Product-level base price is supported for every product.
            if (
              formData.basePrice !== "" &&
              formData.basePrice !== undefined &&
              formData.basePrice !== null
            ) {
              stepErrors.basePrice = validateField(
                "basePrice",
                formData.basePrice
              );
            }
          } else if (formData.productType === "variant") {
            const unitVariants =
              formData.variant?.unitOnlyVariants || [];

            if (unitVariants.length === 0) {
              stepErrors.variants =
                "At least one unit variant is required";
            }

            // Base price is a product-level field and is NOT taken from
            // the first variant automatically.
            stepErrors.basePrice = validateField(
              "basePrice",
              formData.basePrice
            );
          }

          break;
        }

        case "Inventory":
          break;

        case "Shipping":
          break;

        case "Linked Products":
          break;

        default:
          break;
      }

      setErrors(stepErrors);

      return Object.values(stepErrors).every(
        (error) => error === ""
      );
    },
    [
      formData,
      uploadedImages,
      keyIngredients,
      keyBenefits,
      validateField,
    ]
  );

  const resetForm = useCallback(() => {
    setFormData(createInitialFormState());
    setErrors({});
    setUploadedImages([]);
    setKeyIngredients([]);
    setKeyBenefits([]);
    setIsEditMode(false);
    setProductId(null);
  }, []);

  const loadProductData = useCallback((product) => {
    if (!product) return;

    console.log("Loading product data:", product);

    const isVariant = product.productType === "variant";

    const productBasePrice =
      product.basePrice !== undefined &&
      product.basePrice !== null
        ? product.basePrice
        : "";

    const normalizedVariant = isVariant
      ? normalizeUnitVariants(product.variant)
      : {
          variantType: "unitOnly",
          unitOnlyVariants: [],
        };

    const normalizedNonVariant = !isVariant
      ? {
          productTitle:
            product.nonVariant?.productTitle ||
            product.productTitle ||
            "",
          nonVariantImages:
            product.nonVariant?.nonVariantImages || [],
          price: normalizePrice(product.nonVariant?.price),
          stockCount:
            product.nonVariant?.stockCount !== undefined &&
            product.nonVariant?.stockCount !== null
              ? product.nonVariant.stockCount
              : "",
          skuCode: product.nonVariant?.skuCode || "",
          productCode: product.nonVariant?.productCode || "",
        }
      : {
          ...EMPTY_NON_VARIANT,
          price: { ...EMPTY_PRICE },
          nonVariantImages: [],
        };

    const commonPrice = normalizePrice(
      product.price || product.nonVariant?.price
    );

    const mappedData = {
      _id: product._id,

      productName: product.productName || "",
      productTitle: product.productTitle || "",
      productCategory: product.productCategory || "",
      category_id: product.category_id || "",

      // Legacy values are loaded for compatibility but are not sent
      // by generatePayload().
      productSubCategory: product.productSubCategory || "",
      subcategory_id: product.subcategory_id || "",

      productType: product.productType || "nonVariant",

      // IMPORTANT:
      // This is the independent product-level base price.
      // It is not derived from any variant.
      basePrice: productBasePrice,

      productImages: product.productImages || [],
      productIngrediants: product.productIngrediants || [],
      productDescription: product.productDescription || "",
      productBenifits: product.productBenifits || [],
      productUsage: product.productUsage || "",

      hasVariation: isVariant,
      hasNonVariation: !isVariant,

      variant: normalizedVariant,

      nonVariant: normalizedNonVariant,

      // Keep root price for backward compatibility.
      price: commonPrice,

      stockCount:
        product.stockCount !== undefined &&
        product.stockCount !== null
          ? product.stockCount
          : !isVariant
          ? normalizedNonVariant.stockCount
          : "",

      inventory: product.inventory || {
        ...INITIAL_FORM_STATE.inventory,
      },

      shipping: product.shipping || {
        ...INITIAL_FORM_STATE.shipping,
        dimension: {
          ...INITIAL_FORM_STATE.shipping.dimension,
        },
      },

      linkProducts: product.linkProducts || {
        ...INITIAL_FORM_STATE.linkProducts,
        relatedProducts: [],
      },

      searchTags: product.searchTags || [],
      status: product.status || "active",
    };

    setFormData(mappedData);
    setUploadedImages(product.productImages || []);
    setKeyIngredients(product.productIngrediants || []);
    setKeyBenefits(product.productBenifits || []);
    setIsEditMode(true);
    setProductId(product._id);
    setErrors({});
  }, []);

  const generatePayload = useCallback(() => {
    const payload = {
      productName: formData.productName,
      productTitle: formData.productTitle,
      productCategory: formData.productCategory,
      category_id: formData.category_id,

      // SUBCATEGORY TEMPORARILY DISABLED.
      // Existing legacy values are intentionally not generated here.
      // productSubCategory: formData.productSubCategory,
      // subcategory_id: formData.subcategory_id,

      productType: formData.productType,

      // Product-level base price.
      // This remains independent from variant.price.
      ...(formData.basePrice !== "" &&
      formData.basePrice !== undefined &&
      formData.basePrice !== null
        ? { basePrice: Number(formData.basePrice) }
        : {}),

      productDescription: formData.productDescription,
      productBenifits: keyBenefits,
      productUsage: formData.productUsage || "",
      productIngrediants: keyIngredients,
      searchTags: formData.searchTags || [],
      status: formData.status,
    };

    if (formData.productType === "variant") {
      payload.variant = {
        variantType: "unitOnly",
        unitOnlyVariants: (
          formData.variant?.unitOnlyVariants || []
        ).map((variant) => ({
          ...variant,
          unit:
            typeof variant.unit === "string"
              ? variant.unit.trim()
              : variant.unit,
          price: normalizePrice(variant.price),
          variantImages: Array.isArray(variant.variantImages)
            ? variant.variantImages
            : [],
        })),
      };
    } else if (formData.productType === "nonVariant") {
      payload.nonVariant = {
        ...formData.nonVariant,

        price: normalizePrice(formData.nonVariant?.price),

        stockCount:
          formData.nonVariant?.stockCount !== undefined
            ? formData.nonVariant.stockCount
            : formData.stockCount,

        productTitle:
          formData.nonVariant?.productTitle ||
          formData.productTitle ||
          "",

        nonVariantImages:
          formData.nonVariant?.nonVariantImages || [],
      };
    }

    if (formData.inventory) {
      payload.inventory = formData.inventory;
    }

    if (formData.shipping) {
      payload.shipping = formData.shipping;
    }

    if (formData.linkProducts) {
      payload.linkProducts = formData.linkProducts;
    }

    return payload;
  }, [formData, keyIngredients, keyBenefits]);

  const contextValue = useMemo(
    () => ({
      formData,
      errors,
      updateFormData,
      validateStep,

      uploadedImages,
      setUploadedImages,

      keyIngredients,
      setKeyIngredients,

      keyBenefits,
      setKeyBenefits,

      isEditMode,
      productId,

      resetForm,
      loadProductData,
      generatePayload,
    }),
    [
      formData,
      errors,
      updateFormData,
      validateStep,
      uploadedImages,
      keyIngredients,
      keyBenefits,
      isEditMode,
      productId,
      resetForm,
      loadProductData,
      generatePayload,
    ]
  );

  return (
    <ProductFormContext.Provider value={contextValue}>
      {children}
    </ProductFormContext.Provider>
  );
};

export const useProductForm = () =>
  useContext(ProductFormContext);
