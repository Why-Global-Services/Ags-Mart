import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useMemo,
} from "react";

const ProductFormContext = createContext();

export const ProductFormProvider = ({ children }) => {
  const initialFormState = {
    productName: "",
    productTitle: "",
    productCategory: "",
    category_id: "",
    productSubCategory: "",
    subcategory_id: "",
    stockCount: "",
    productType: "nonVariant",
    productImages: [],
    productIngrediants: [], // Separate array for ingredients
    productDescription: "",
    productBenifits: [], // Separate array for benefits
    productUsage: "",
    hasVariation: false,
    hasNonVariation: true,
    
    // Variant structure matching backend
    variant: {
      variantType: "",
      sizeColorVariants: [],
      colorOnlyVariants: [],
      sizeOnlyVariants: [],
    },
    
    // NonVariant structure matching backend
    nonVariant: {
      productTitle: "",
      nonVariantImages: [],
      price: {
        costPrice: "",
        salePrice: "",
        discount: "",
        tax: "",
      },
      stockCount: "",
      skuCode: "",
      productCode: "",
    },
    
    // Common price (for backward compatibility)
    price: {
      costPrice: "",
      salePrice: "",
      discount: "",
      tax: "",
    },
    
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
      dimension: { length: "", width: "", height: "" },
      shippingClass: "standard",
    },
    
    linkProducts: {
      relatedProducts: [],
    },
    
    searchTags: [],
    status: "active",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [uploadedImages, setUploadedImages] = useState([]);
  const [keyIngredients, setKeyIngredients] = useState([]); // For ingredients
  const [keyBenefits, setKeyBenefits] = useState([]); // For benefits
  const [isEditMode, setIsEditMode] = useState(false);
  const [productId, setProductId] = useState(null);

  const validateField = useCallback((name, value) => {
    switch (name) {
      case "productName":
        return value.trim() ? "" : "Product name is required";
      case "productCategory":
        return value ? "" : "Category is required";
      case "productSubCategory":
        return value ? "" : "Subcategory is required";
      case "productDescription":
        return value.trim().length >= 20
          ? "" : "Description must be at least 20 characters";
      case "productUsage":
        return value.trim().length >= 10
          ? "" : "Usage instructions must be at least 10 characters";
      case "stockCount":
        return value === "" || (!isNaN(value) && Number(value) >= 0)
          ? "" : "Must be a positive number";
      case "costPrice":
        return value === "" || (!isNaN(value) && Number(value) >= 0)
          ? "" : "Valid price required";
      case "discount":
      case "tax":
        return value === "" ||
          (!isNaN(value) && Number(value) >= 0 && Number(value) <= 100)
          ? "" : "0-100% only";
      default:
        return "";
    }
  }, []);

  const updateFormData = useCallback((data) => {
    setFormData((prev) => {
      const newData = { ...prev, ...data };
      
      // Validate updated fields
      const newErrors = {};
      Object.keys(data).forEach((key) => {
        newErrors[key] = validateField(key, newData[key]);
      });
      
      setErrors((prevErrors) => ({ ...prevErrors, ...newErrors }));
      return newData;
    });
  }, [validateField]);

  const validateStep = useCallback((step) => {
    const stepErrors = {};
    
    switch (step) {
      case "Product":
        stepErrors.productName = validateField("productName", formData.productName);
        stepErrors.productCategory = validateField("productCategory", formData.productCategory);
        stepErrors.productSubCategory = validateField("productSubCategory", formData.productSubCategory);
        stepErrors.productDescription = validateField("productDescription", formData.productDescription);
        stepErrors.productUsage = validateField("productUsage", formData.productUsage);
        
        if (uploadedImages.length === 0) {
          stepErrors.productImages = "At least one product image is required";
        }
        
        // Check if benefits are added
        if (keyBenefits.length === 0) {
          stepErrors.productBenifits = "At least one benefit is required";
        }
        
        // Check if ingredients are added
        if (keyIngredients.length === 0) {
          stepErrors.productIngrediants = "At least one ingredient is required";
        }
        
        // Validate based on product type
        if (formData.productType === "nonVariant") {
          stepErrors.productTitle = validateField("productTitle", formData.productTitle);
          stepErrors.stockCount = validateField("stockCount", formData.nonVariant?.stockCount || formData.stockCount);
          stepErrors.costPrice = validateField("costPrice", formData.nonVariant?.price?.costPrice || formData.price?.costPrice);
        } else if (formData.productType === "variant") {
          // Check if variant data exists
          const hasVariants = 
            (formData.variant?.sizeColorVariants?.length > 0) ||
            (formData.variant?.colorOnlyVariants?.length > 0) ||
            (formData.variant?.sizeOnlyVariants?.length > 0);
          
          if (!hasVariants) {
            stepErrors.variants = "At least one variant is required";
          }
        }
        break;
        
      case "Inventory":
        // Optional validation for inventory
        break;
        
      case "Shipping":
        // Optional validation for shipping
        break;
        
      case "Linked Products":
        // Optional validation
        break;
    }
    
    setErrors(stepErrors);
    return Object.values(stepErrors).every((error) => error === "");
  }, [formData, uploadedImages, keyIngredients, keyBenefits, validateField]);

  const resetForm = useCallback(() => {
    setFormData(initialFormState);
    setErrors({});
    setUploadedImages([]);
    setKeyIngredients([]);
    setKeyBenefits([]);
    setIsEditMode(false);
    setProductId(null);
  }, []);

const loadProductData = useCallback((product) => {
  console.log("Loading product data:", product);
  
  const isVariant = product.productType === "variant";
  
  const mappedData = {
    _id: product._id,
    productName: product.productName || "",
    productTitle: product.productTitle || "",
    productCategory: product.productCategory || "",
    category_id: product.category_id || "",
    productSubCategory: product.productSubCategory || "",
    subcategory_id: product.subcategory_id || "",
    productType: product.productType || "nonVariant",
    productImages: product.productImages || [],
    productIngrediants: product.productIngrediants || [],
    productDescription: product.productDescription || "",
    productBenifits: product.productBenifits || [],
    productUsage: product.productUsage || "",
    hasVariation: isVariant,
    hasNonVariation: !isVariant,
    
    // Load variant data - FIXED
    variant: isVariant ? product.variant : {
      variantType: "",
      sizeColorVariants: [],
      colorOnlyVariants: [],
      sizeOnlyVariants: [],
    },
    
    // Load nonVariant data
    nonVariant: !isVariant ? product.nonVariant : {
      productTitle: "",
      nonVariantImages: [],
      price: {
        costPrice: "",
        salePrice: "",
        discount: "",
        tax: "",
      },
      stockCount: "",
      skuCode: "",
      productCode: "",
    },
    
    price: !isVariant ? (product.nonVariant?.price || {
      costPrice: "",
      salePrice: "",
      discount: "",
      tax: "",
    }) : {
      costPrice: "",
      salePrice: "",
      discount: "",
      tax: "",
    },
    
    stockCount: !isVariant ? product.nonVariant?.stockCount || "" : "",
    
    inventory: product.inventory || initialFormState.inventory,
    shipping: product.shipping || initialFormState.shipping,
    linkProducts: product.linkProducts || initialFormState.linkProducts,
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
      productSubCategory: formData.productSubCategory,
      subcategory_id: formData.subcategory_id,
      productType: formData.productType,
      productDescription: formData.productDescription,
      productBenifits: keyBenefits, // Separate benefits array
      productUsage: formData.productUsage || "",
      productIngrediants: keyIngredients, // Separate ingredients array
      searchTags: formData.searchTags || [],
      status: formData.status,
    };

    // Add variant or nonVariant based on type
    if (formData.productType === "variant") {
      payload.variant = formData.variant;
    } else if (formData.productType === "nonVariant") {
      payload.nonVariant = formData.nonVariant;
    }

    // Add optional fields
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
      keyBenefits, // ADD THIS
      setKeyBenefits, // ADD THIS
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

export const useProductForm = () => useContext(ProductFormContext);