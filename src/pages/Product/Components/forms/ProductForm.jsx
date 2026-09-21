import React, { useState, useEffect } from "react";
import { FaUpload } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { useProductForm } from "../context/FormContext";
import DataTable from "react-data-table-component";
import axios from "axios";
import {
  getAllCategories,
} from "../../../../services/Offer";

const ProductForm = () => {
  const {
    formData,
    errors,
    updateFormData,
    uploadedImages,
    setUploadedImages,
    keyIngredients,
    setKeyIngredients,
    keyBenefits, // ADD THIS
  setKeyBenefits,
    isEditMode,
  } = useProductForm();
  
  const [keyIngredientInput, setKeyIngredientInput] = useState("");
  const [benefitInput, setBenefitInput] = useState(""); // ADD THIS
  const [variants, setVariants] = useState(formData.variants || []);
  const [isEditingVariant, setIsEditingVariant] = useState(false);
  const [editingVariantId, setEditingVariantId] = useState(null);
  const [apiError, setApiError] = useState(null);
  
// State for variant management
const [currentVariant, setCurrentVariant] = useState({
  variantType: "unitOnly",
  unitOnlyVariants: [],
  sizeColorVariants: [],
  colorOnlyVariants: [],
  sizeOnlyVariants: [],
});
  const [currentUnitVariant, setCurrentUnitVariant] = useState({
    unit: "",
    stockCount: "",
    skuCode: "",
    productCode: "",
    variantImages: [],
    price: { costPrice: "", salePrice: "", discount: "", tax: "" },
  });
  const [sizes, setSizes] = useState([]);
  const [currentSize, setCurrentSize] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [currentColor, setCurrentColor] = useState("");
  const [sizeColorMap, setSizeColorMap] = useState({});
  const [currentSizeColorVariant, setCurrentSizeColorVariant] = useState({
    size: "",
    color: "",
    stockCount: "",
    skuCode: "",
    productCode: "",
    variantImages: [],
    price: { costPrice: "", salePrice: "", discount: "", tax: "" },
  });
  const [currentColorVariant, setCurrentColorVariant] = useState({
    color: "",
    stockCount: "",
    skuCode: "",
    productCode: "",
    variantImages: [],
    price: { costPrice: "", salePrice: "", discount: "", tax: "" },
  });
  const [currentSizeVariant, setCurrentSizeVariant] = useState({
    size: "",
    stockCount: "",
    skuCode: "",
    productCode: "",
    variantImages: [],
    price: { costPrice: "", salePrice: "", discount: "", tax: "" },
  });
  const [categories, setCategories] = useState([]);
  // SUBCATEGORY TEMPORARILY DISABLED for Product Create/Edit.
  // Re-enable this state with the selector and fetch effect below.
  // const [subCategories, setSubCategories] = useState([]);

  // Category attributes state
  const [categoryAttributes, setCategoryAttributes] = useState({
    sareeAttributes: {
      fabricMaterial: "",
      workEmbroidery: "",
      blouseType: "",
      borderDesign: "",
      length: "",
    },
    mensKidsAttributes: {
      setType: "",
      fabric: "",
      printPattern: "",
      ageGroup: "",
      fitType: "",
      sizeChartImage: "",
    },
    jewelleryAttributes: {
      metalTypePurity: "",
      stoneTypeQuality: "",
      platingType: "",
      weight: "",
      closureType: "",
    },
  });

  // Helper function to transform API data to form data structure
  const transformProductData = (apiData) => {
    const isVariant = apiData.productType === "variant";
    const isNonVariant = apiData.productType === "nonVariant";

    // Extract non-variant price and stock count
    const nonVariantPrice = apiData.nonVariant?.price || {};
    const nonVariantStockCount = apiData.nonVariant?.stockCount || "";

    return {
      // Basic product info
      _id: apiData._id,
      productName: apiData.productName || "",
      productTitle: apiData.productTitle || "",
      productCategory: apiData.productCategory || "",
      category_id: apiData.category_id || "",
      productSubCategory: apiData.productSubCategory || "",
      subcategory_id: apiData.subcategory_id || "",
      productType: apiData.productType || "",
      productDescription: apiData.productDescription || "",
      status: apiData.status || "active",

      // Variation flags
      hasVariation: isVariant,
      hasNonVariation: isNonVariant,

      // Product images
      productImages: apiData.productImages || [],

      // Variant data transformation
      variants: transformVariantsData(apiData),

      // Non-variant data
      nonVariant: isNonVariant ? transformNonVariantData(apiData) : {},

      // Product-level pricing (available for BOTH variant and non-variant products)
      // Variant prices remain inside each variant; this price is the main product/base price.
      basePrice: apiData.basePrice ?? "",
      price: apiData.price
        ? {
            costPrice: apiData.price.costPrice ?? "",
            salePrice: apiData.price.salePrice ?? "",
            discount: apiData.price.discount ?? "",
            tax: apiData.price.tax ?? "",
            realPrice: apiData.price.realPrice ?? 0,
          }
        : isNonVariant
        ? {
            costPrice: nonVariantPrice.costPrice || "",
            salePrice: nonVariantPrice.salePrice || "",
            discount: nonVariantPrice.discount || "",
            tax: nonVariantPrice.tax || "",
          }
        : { costPrice: "", salePrice: "", discount: "", tax: "" },

      // Product-level stock/code are used by the main Product Details section.
      stockCount: apiData.stockCount ?? (isNonVariant ? nonVariantStockCount : ""),
      productCode: apiData.productCode ?? (isNonVariant ? (apiData.nonVariant?.productCode || "") : ""),

      // Category-specific attributes
      sareeAttributes: apiData.sareeAttributes || {},
      mensKidsAttributes: apiData.mensKidsAttributes || {},
      jewelleryAttributes: apiData.jewelleryAttributes || {},

      // Inventory and shipping
      inventory: apiData.inventory || {},
      shipping: apiData.shipping || {},
      searchTags: apiData.searchTags || [],
    };
  };

  const transformVariantsData = (apiData) => {
    if (apiData.productType !== "variant") return [];

    const variants = [];
    const variantData = apiData.variant;

    if (!variantData) return [];

    // Handle colorOnly variants
    if (
      variantData.variantType === "colorOnly" &&
      variantData.colorOnlyVariants?.length > 0
    ) {
      variants.push({
        variantType: "colorOnly",
        colorOnlyVariants: variantData.colorOnlyVariants.map((variant) => ({
          ...variant,
          price: variant.price || {
            costPrice: "",
            salePrice: "",
            discount: "",
            tax: "",
          },
        })),
      });
    }

    // Handle sizeColor variants
    if (
      variantData.variantType === "sizeColor" &&
      variantData.sizeColorVariants?.length > 0
    ) {
      variants.push({
        variantType: "sizeColor",
        sizeColorVariants: variantData.sizeColorVariants.map((variant) => ({
          ...variant,
          price: variant.price || {
            costPrice: "",
            salePrice: "",
            discount: "",
            tax: "",
          },
        })),
      });
    }

    // Handle sizeOnly variants
    if (
      variantData.variantType === "sizeOnly" &&
      variantData.sizeOnlyVariants?.length > 0
    ) {
      variants.push({
        variantType: "sizeOnly",
        sizeOnlyVariants: variantData.sizeOnlyVariants.map((variant) => ({
          ...variant,
          price: variant.price || {
            costPrice: "",
            salePrice: "",
            discount: "",
            tax: "",
          },
        })),
      });
    }

    return variants;
  };

  const transformNonVariantData = (apiData) => {
    if (apiData.productType !== "nonVariant") return {};

    return {
      productTitle: apiData.nonVariant?.productTitle || "",
      nonVariantImages: apiData.nonVariant?.nonVariantImages || [],
      price: apiData.nonVariant?.price || {
        costPrice: "",
        salePrice: "",
        discount: "",
        tax: "",
      },
      stockCount: apiData.nonVariant?.stockCount || "",
      skuCode: apiData.nonVariant?.skuCode || "",
      productCode: apiData.nonVariant?.productCode || "",
    };
  };

  /* SUBCATEGORY TEMPORARILY DISABLED for Product Create/Edit.
  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoryResponse = await getAllCategories();
        const categoryData = categoryResponse.data || [];
        setCategories(
          categoryData.filter((category) => category.status === "active")
        );
      } catch (error) {
        console.error("Error fetching data:", error);
        setApiError("Failed to load data. Please try again later.");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchSubCategories = async () => {
      if (formData.productCategory) {
        try {
          const selectedCategory = categories.find(
            (cat) => cat.categoryTitle === formData.productCategory
          );
          if (selectedCategory) {
            const response = await getSubCategoriesByCategory(
              selectedCategory._id
            );
            const subCategoryData = response || [];
            setSubCategories(
              subCategoryData.filter(
                (subCategory) => subCategory.status === "active"
              )
            );
            if (isEditMode && formData.productSubCategory) {
              const subCatExists = subCategoryData.some(
                (subCat) =>
                  subCat.subCategoryTitle === formData.productSubCategory
              );
              if (!subCatExists) {
                updateFormData({ productSubCategory: "" });
              }
            }
          }
        } catch (error) {
          console.error("Error fetching subcategories:", error);
          setApiError("Failed to load subcategories. Please try again.");
        }
      } else {
        setSubCategories([]);
      }
    };
    fetchSubCategories();
  }, [
    formData.productCategory,
    categories,
    isEditMode,
    formData.productSubCategory,
    updateFormData,
  ]); */

  // Initialize form data when in edit mode
  useEffect(() => {
    if (isEditMode && formData) {
      console.log("Edit Mode - Form Data:", formData);

      // Initialize variants for the table
      if (formData.variants && formData.variants.length > 0) {
        setVariants(formData.variants);
      }

      // Initialize category attributes
      if (formData.productCategory) {
        setCategoryAttributes({
          sareeAttributes: formData.sareeAttributes || {
            fabricMaterial: "",
            workEmbroidery: "",
            blouseType: "",
            borderDesign: "",
            length: "",
          },
          mensKidsAttributes: formData.mensKidsAttributes || {
            setType: "",
            fabric: "",
            printPattern: "",
            ageGroup: "",
            fitType: "",
            sizeChartImage: "",
          },
          jewelleryAttributes: formData.jewelleryAttributes || {
            metalTypePurity: "",
            stoneTypeQuality: "",
            platingType: "",
            weight: "",
            closureType: "",
          },
        });
      }

      // Initialize uploaded images
      if (formData.productImages && formData.productImages.length > 0) {
        setUploadedImages(formData.productImages);
      }
    }
  }, [isEditMode, formData]);

  useEffect(() => {
  if (isEditMode && formData.productCategory) {
    // Find and set the category
    const selectedCat = categories.find(
      cat => cat.categoryTitle === formData.productCategory || 
            cat._id === formData.category_id
    );
    
    if (selectedCat && !formData.category_id) {
      updateFormData({ category_id: selectedCat._id });
    }
  }
}, [isEditMode, formData.productCategory, categories]);

useEffect(() => {
  if (isEditMode && formData.productSubCategory && subCategories.length > 0) {
    // Find and set the subcategory
    const selectedSub = subCategories.find(
      sub => sub.subCategoryTitle === formData.productSubCategory ||
             sub._id === formData.subcategory_id
    );
    
    if (selectedSub && !formData.subcategory_id) {
      updateFormData({ subcategory_id: selectedSub._id });
    }
  }
}, [isEditMode, formData.productSubCategory, subCategories]);

  // ========== IMAGE HANDLERS ==========
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newImages = files.filter(
        (file) => file instanceof File && file.type.startsWith("image/")
      );
      if (newImages.length > 0) {
        const newUploadedImages = [...uploadedImages, ...newImages];
        setUploadedImages(newUploadedImages);
        updateFormData({ productImages: newUploadedImages });
      } else {
        alert("Please select valid image files.");
      }
    }
  };

  const handleRemoveImage = (imageToRemove) => {
    const updatedImages = uploadedImages.filter((img) => img !== imageToRemove);
    setUploadedImages(updatedImages);
    updateFormData({ productImages: updatedImages });
  };

  // Non-Variant Images Handlers
  const handleNonVariantFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newImages = files.filter(
        (file) => file instanceof File && file.type.startsWith("image/")
      );
      if (newImages.length > 0) {
        const existing = formData.nonVariant?.nonVariantImages || [];
        const updatedNonVariantImages = [...existing, ...newImages];
        updateFormData({
          nonVariant: {
            ...formData.nonVariant,
            nonVariantImages: updatedNonVariantImages,
          },
        });
      } else {
        alert("Please select valid image files.");
      }
    }
  };

  const handleRemoveNonVariantImage = (imageToRemove) => {
    const existing = formData.nonVariant?.nonVariantImages || [];
    const updatedImages = existing.filter((img) => img !== imageToRemove);
    updateFormData({
      nonVariant: {
        ...formData.nonVariant,
        nonVariantImages: updatedImages,
      },
    });
  };

  // ========== INPUT CHANGE HANDLER - UPDATED ==========
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    console.log(`Input Change - ${name}:`, value);

    // Category attributes
    if (name.startsWith("sareeAttributes.")) {
      const key = name.split(".")[1];
      const updated = {
        ...categoryAttributes,
        sareeAttributes: { ...categoryAttributes.sareeAttributes, [key]: value },
      };
      setCategoryAttributes(updated);
      updateFormData({ sareeAttributes: updated.sareeAttributes });
    } else if (name.startsWith("mensKidsAttributes.")) {
      const key = name.split(".")[1];
      const updated = {
        ...categoryAttributes,
        mensKidsAttributes: { ...categoryAttributes.mensKidsAttributes, [key]: value },
      };
      setCategoryAttributes(updated);
      updateFormData({ mensKidsAttributes: updated.mensKidsAttributes });
    } else if (name.startsWith("jewelleryAttributes.")) {
      const key = name.split(".")[1];
      const updated = {
        ...categoryAttributes,
        jewelleryAttributes: { ...categoryAttributes.jewelleryAttributes, [key]: value },
      };
      setCategoryAttributes(updated);
      updateFormData({ jewelleryAttributes: updated.jewelleryAttributes });
    }
    // Product variation toggles
    else if (name === "hasVariation") {
      updateFormData({
        hasVariation: checked,
        hasNonVariation: !checked,
        productType: checked ? "variant" : "nonVariant",
        variants: checked ? formData.variants : [],
        nonVariant: checked ? {} : formData.nonVariant,
        // Always set variantType to unitOnly when enabling variation
        ...(checked && {
          variant: {
            ...(formData.variant || {}),
            variantType: "unitOnly",
          },
        }),
      });
      if (!checked) setVariants([]);
    } else if (name === "hasNonVariation") {
      updateFormData({
        hasVariation: !checked,
        hasNonVariation: checked,
        productType: checked ? "nonVariant" : "variant",
        variants: checked ? [] : formData.variants,
        nonVariant: checked ? formData.nonVariant : {},
      });
      if (checked) setVariants([]);
    }
    // Category selection
    else if (name === "productCategory") {
      const selectedCat = categories.find((cat) => cat.categoryTitle === value);
      updateFormData({
        productCategory: value,
        category_id: selectedCat?._id || "",
        // SUBCATEGORY TEMPORARILY DISABLED: do not reset legacy values;
        // the submit payload omits them and the backend preserves them.
        // productSubCategory: "",
        // subcategory_id: "",
        sareeAttributes: categoryAttributes.sareeAttributes,
        mensKidsAttributes: categoryAttributes.mensKidsAttributes,
        jewelleryAttributes: categoryAttributes.jewelleryAttributes,
      });
    }
    // SUBCATEGORY TEMPORARILY DISABLED
    // else if (name === "productSubCategory") {
    //   const selectedSub = subCategories.find((sub) => sub.subCategoryTitle === value);
    //   updateFormData({ productSubCategory: value, subcategory_id: selectedSub?._id || "" });
    // }
    else if (name === "productTitle") {
  // Update both main productTitle and nonVariant.productTitle
  if (formData.hasNonVariation) {
    updateFormData({
      productTitle: value,
      nonVariant: {
        ...formData.nonVariant,
        productTitle: value,
      },
    });
  } else {
    updateFormData({ productTitle: value });
  }
}
    // Price fields with auto-calculation
// Price fields with auto-calculation
else if (["costPrice", "salePrice", "discount", "tax"].includes(name)) {
  const currentPrice = formData.nonVariant?.price || formData.price || {};
  let updatedPrice = {
    ...currentPrice,
    [name]: value === "" ? "" : parseFloat(value),
  };

  // Auto-calculate sale price
  if (name === "costPrice" || name === "discount") {
    const cost = parseFloat(name === "costPrice" ? value : currentPrice.costPrice);
    const disc = parseFloat(name === "discount" ? value : currentPrice.discount);

    if (!isNaN(cost)) {
      if (!disc || disc === 0) {
        updatedPrice.salePrice = cost;
      } else if (disc >= 0 && disc <= 100) {
        updatedPrice.salePrice = cost - (cost * disc / 100);
      }
    }
  }

  // Product-level price is available for BOTH product types.
  // For non-variant products keep it synced with nonVariant.price.
  // For variant products this is the independent main/base product price.
  if (formData.hasNonVariation) {
    updateFormData({
      price: updatedPrice,
      basePrice:
        updatedPrice.salePrice !== "" && !isNaN(Number(updatedPrice.salePrice))
          ? Number(updatedPrice.salePrice)
          : Number(updatedPrice.costPrice || 0),
      nonVariant: {
        ...formData.nonVariant,
        price: updatedPrice,
      },
    });
  } else if (formData.hasVariation) {
    updateFormData({
      price: updatedPrice,
      basePrice:
        updatedPrice.salePrice !== "" && !isNaN(Number(updatedPrice.salePrice))
          ? Number(updatedPrice.salePrice)
          : Number(updatedPrice.costPrice || 0),
    });
  }
}
    // Stock count
    else if (name === "stockCount") {
      const stockValue = value === "" ? "" : parseInt(value, 10);
      if (formData.hasNonVariation) {
        updateFormData({
          stockCount: stockValue,
          nonVariant: {
            ...formData.nonVariant,
            stockCount: stockValue,
          },
        });
      } else {
        // Product-level stock for variant products. Variant stock remains per-unit.
        updateFormData({ stockCount: stockValue });
      }
    }
    // Product code
    else if (name === "productCode") {
      if (formData.hasNonVariation) {
        updateFormData({
          productCode: value,
          nonVariant: {
            ...formData.nonVariant,
            productCode: value,
          },
        });
      } else if (formData.hasVariation) {
        updateFormData({ productCode: value });
      }
    }
    // Product benefits
    else if (name.startsWith("productBenefits.")) {
      const benefitKey = name.split(".")[1];
      const updatedBenefits = {
        ...formData.productBenefits,
        [benefitKey]: value,
      };
      updateFormData({ productBenefits: updatedBenefits });
    }
    // Default handler
    else {
      updateFormData({
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  // ========== VARIANT HANDLERS (Keep all existing variant functionality) ==========
  
  // Variant Type Change Handler
  const handleVariantTypeChange = (e) => {
    const { value } = e.target;
    setCurrentVariant({
      variantType: value,
      unitOnlyVariants: [],
      sizeColorVariants: [],
      colorOnlyVariants: [],
      sizeOnlyVariants: [],
    });
    resetVariantForm();
  };

  const handleUnitVariantChange = (e) => {
    const { name, value } = e.target;
    setCurrentUnitVariant((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUnitPriceChange = (e) => {
    const { name, value } = e.target;
    setCurrentUnitVariant((prev) => {
      const updatedPrice = {
        ...prev.price,
        [name]: value === "" ? "" : parseFloat(value),
      };

      if (name === "costPrice" || name === "discount") {
        const costPrice = name === "costPrice" ? value : prev.price.costPrice;
        const discount = name === "discount" ? value : prev.price.discount;

        if (costPrice && costPrice !== "") {
          const cost = parseFloat(costPrice);
          if (!isNaN(cost)) {
            if (!discount || discount === "" || parseFloat(discount) === 0) {
              updatedPrice.salePrice = cost;
            } else {
              const disc = parseFloat(discount);
              if (!isNaN(disc) && disc >= 0 && disc <= 100) {
                updatedPrice.salePrice = cost - (cost * disc) / 100;
              }
            }
          }
        }
      }

      return {
        ...prev,
        price: updatedPrice,
      };
    });
  };

  const handleUnitImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setCurrentUnitVariant((prev) => ({
      ...prev,
      variantImages: [...prev.variantImages, ...files],
    }));
  };

  const handleRemoveUnitImage = (index) => {
    setCurrentUnitVariant((prev) => ({
      ...prev,
      variantImages: prev.variantImages.filter((_, i) => i !== index),
    }));
  };

  const handleAddSize = () => {
    if (currentSize && !sizes.includes(currentSize)) {
      setSizes((prev) => [...prev, currentSize]);
      setSizeColorMap((prev) => ({
        ...prev,
        [currentSize]: [],
      }));
      setCurrentSize("");
    }
  };

  const handleRemoveSize = (index) => {
    const sizeToRemove = sizes[index];
    setSizes((prev) => prev.filter((_, i) => i !== index));
    setSizeColorMap((prev) => {
      const newMap = { ...prev };
      delete newMap[sizeToRemove];
      return newMap;
    });
    if (selectedSize === sizeToRemove) {
      setSelectedSize("");
    }
  };

  const handleAddColorToSize = () => {
    if (selectedSize && currentColor) {
      setSizeColorMap((prev) => ({
        ...prev,
        [selectedSize]: [
          ...(prev[selectedSize] || []),
          { color: currentColor },
        ],
      }));
      setCurrentColor("");
    }
  };

  const handleRemoveColorFromSize = (size, colorIndex) => {
    setSizeColorMap((prev) => ({
      ...prev,
      [size]: prev[size].filter((_, index) => index !== colorIndex),
    }));
  };

  const handleSizeColorVariantChange = (field, value) => {
    setCurrentSizeColorVariant((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSizeColorPriceChange = (field, value) => {
    setCurrentSizeColorVariant((prev) => {
      const updatedPrice = {
        ...prev.price,
        [field]: value === "" ? "" : parseFloat(value),
      };

      // Auto-calculate sale price
      if (field === "costPrice" || field === "discount") {
        const costPrice = field === "costPrice" ? value : prev.price.costPrice;
        const discount = field === "discount" ? value : prev.price.discount;
        
        if (costPrice && costPrice !== "") {
          const cost = parseFloat(costPrice);
          if (!isNaN(cost)) {
            if (!discount || discount === "" || parseFloat(discount) === 0) {
              updatedPrice.salePrice = cost;
            } else {
              const disc = parseFloat(discount);
              if (!isNaN(disc) && disc >= 0 && disc <= 100) {
                updatedPrice.salePrice = cost - (cost * disc / 100);
              }
            }
          }
        }
      }

      return {
        ...prev,
        price: updatedPrice,
      };
    });
  };

  const handleSizeColorImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setCurrentSizeColorVariant((prev) => ({
      ...prev,
      variantImages: [...prev.variantImages, ...files],
    }));
  };

  const handleRemoveSizeColorImage = (index) => {
    setCurrentSizeColorVariant((prev) => ({
      ...prev,
      variantImages: prev.variantImages.filter((_, i) => i !== index),
    }));
  };

  // Color Only Handlers
  const handleColorVariantChange = (e) => {
    const { name, value } = e.target;
    setCurrentColorVariant((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleColorPriceChange = (e) => {
    const { name, value } = e.target;
    setCurrentColorVariant((prev) => {
      const updatedPrice = {
        ...prev.price,
        [name]: value === "" ? "" : parseFloat(value),
      };

      // Auto-calculate sale price
      if (name === "costPrice" || name === "discount") {
        const costPrice = name === "costPrice" ? value : prev.price.costPrice;
        const discount = name === "discount" ? value : prev.price.discount;
        
        if (costPrice && costPrice !== "") {
          const cost = parseFloat(costPrice);
          if (!isNaN(cost)) {
            if (!discount || discount === "" || parseFloat(discount) === 0) {
              updatedPrice.salePrice = cost;
            } else {
              const disc = parseFloat(discount);
              if (!isNaN(disc) && disc >= 0 && disc <= 100) {
                updatedPrice.salePrice = cost - (cost * disc / 100);
              }
            }
          }
        }
      }

      return {
        ...prev,
        price: updatedPrice,
      };
    });
  };

  const handleColorImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setCurrentColorVariant((prev) => ({
      ...prev,
      variantImages: [...prev.variantImages, ...files],
    }));
  };

  const handleRemoveColorImage = (index) => {
    setCurrentColorVariant((prev) => ({
      ...prev,
      variantImages: prev.variantImages.filter((_, i) => i !== index),
    }));
  };

  // Size Only Handlers
  const handleSizeVariantChange = (e) => {
    const { name, value } = e.target;
    setCurrentSizeVariant((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSizePriceChange = (e) => {
    const { name, value } = e.target;
    setCurrentSizeVariant((prev) => {
      const updatedPrice = {
        ...prev.price,
        [name]: value === "" ? "" : parseFloat(value),
      };

      // Auto-calculate sale price
      if (name === "costPrice" || name === "discount") {
        const costPrice = name === "costPrice" ? value : prev.price.costPrice;
        const discount = name === "discount" ? value : prev.price.discount;
        
        if (costPrice && costPrice !== "") {
          const cost = parseFloat(costPrice);
          if (!isNaN(cost)) {
            if (!discount || discount === "" || parseFloat(discount) === 0) {
              updatedPrice.salePrice = cost;
            } else {
              const disc = parseFloat(discount);
              if (!isNaN(disc) && disc >= 0 && disc <= 100) {
                updatedPrice.salePrice = cost - (cost * disc / 100);
              }
            }
          }
        }
      }

      return {
        ...prev,
        price: updatedPrice,
      };
    });
  };

  const handleSizeImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setCurrentSizeVariant((prev) => ({
      ...prev,
      variantImages: [...prev.variantImages, ...files],
    }));
  };

  const handleRemoveSizeImage = (index) => {
    setCurrentSizeVariant((prev) => ({
      ...prev,
      variantImages: prev.variantImages.filter((_, i) => i !== index),
    }));
  };

  // Benefits Handlers - ADD THESE
const handleAddBenefit = () => {
  if (benefitInput.trim()) {
    setKeyBenefits((prev) => [...prev, benefitInput.trim()]);
    updateFormData({
      productBenifits: [...keyBenefits, benefitInput.trim()],
    });
    setBenefitInput("");
  }
};

const handleRemoveBenefit = (benefitToRemove) => {
  const updatedBenefits = keyBenefits.filter(
    (benefit) => benefit !== benefitToRemove
  );
  setKeyBenefits(updatedBenefits);
  updateFormData({ productBenifits: updatedBenefits });
};


  // Helper Functions for variants
  const getCurrentVariant = () => {
    switch (currentVariant.variantType) {
      case "unitOnly":
        return currentUnitVariant;
      case "sizeColor":
        return currentSizeColorVariant;
      case "colorOnly":
        return currentColorVariant;
      case "sizeOnly":
        return currentSizeVariant;
      default:
        return {};
    }
  };

  const getVariantArrayKey = () => {
    switch (currentVariant.variantType) {
      case "unitOnly":
        return "unitOnlyVariants";
      case "sizeColor":
        return "sizeColorVariants";
      case "colorOnly":
        return "colorOnlyVariants";
      case "sizeOnly":
        return "sizeOnlyVariants";
      default:
        return "";
    }
  };

  const canAddVariant = () => {
    return !!(currentUnitVariant.unit && currentUnitVariant.stockCount && currentUnitVariant.price?.costPrice);
  };

  const resetVariantForm = () => {
    setCurrentUnitVariant({
      unit: "",
      stockCount: "",
      skuCode: "",
      productCode: "",
      variantImages: [],
      price: { costPrice: "", salePrice: "", discount: "", tax: "" },
    });
    setCurrentSizeColorVariant({
      size: "",
      color: "",
      stockCount: "",
      skuCode: "",
      productCode: "",
      variantImages: [],
      price: { costPrice: "", salePrice: "", discount: "", tax: "" },
    });
    setCurrentColorVariant({
      color: "",
      stockCount: "",
      skuCode: "",
      productCode: "",
      variantImages: [],
      price: { costPrice: "", salePrice: "", discount: "", tax: "" },
    });
    setCurrentSizeVariant({
      size: "",
      stockCount: "",
      skuCode: "",
      productCode: "",
      variantImages: [],
      price: { costPrice: "", salePrice: "", discount: "", tax: "" },
    });
    setCurrentSize("");
    setSelectedSize("");
    setCurrentColor("");
    setSizes([]);
    setSizeColorMap({});
    setIsEditingVariant(false);
    setEditingVariantId(null);
  };

const handleAddVariant = () => {
  if (!canAddVariant()) return;

  const current = getCurrentVariant();
  const arrayKey = "unitOnlyVariants";

  const newVariant = {
    ...current,
    _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  };

  // Update the variant structure in formData
  const updatedVariant = {
    ...formData.variant,
    variantType: "unitOnly",
    unitOnlyVariants: [...(formData.variant?.unitOnlyVariants || []), newVariant],
  };

  updateFormData({ variant: updatedVariant });
  resetVariantForm();
};
  const handleAddSizeColorVariant = () => {
    if (!canAddVariant()) return;
    const newVariant = {
      ...currentSizeColorVariant,
      _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    const existingVariantIndex = variants.findIndex(
      (v) => v.variantType === "sizeColor"
    );
    if (existingVariantIndex !== -1) {
      const updatedVariants = [...variants];
      updatedVariants[existingVariantIndex].sizeColorVariants.push(newVariant);
      setVariants(updatedVariants);
      updateFormData({ variants: updatedVariants });
    } else {
      const newVariantObj = {
        variantType: "sizeColor",
        sizeColorVariants: [newVariant],
      };
      const updatedVariants = [...variants, newVariantObj];
      setVariants(updatedVariants);
      updateFormData({ variants: updatedVariants });
    }
    setCurrentSizeColorVariant({
      size: "",
      color: "",
      stockCount: "",
      skuCode: "",
      productCode: "",
      variantImages: [],
      price: { costPrice: "", salePrice: "", discount: "", tax: "" },
    });
  };

  const handleEditVariant = (row) => {
    setIsEditingVariant(true);
    setEditingVariantId(row.id);
    setCurrentUnitVariant({
      unit: row.value,
      stockCount: row.stockCount,
      skuCode: row.skuCode,
      productCode: row.productCode,
      variantImages: row.variantImages || [],
      price: {
        costPrice: row.costPrice,
        salePrice: row.salePrice,
        discount: row.discount,
        tax: row.tax,
      },
    });
  };

  const handleSaveEditedVariant = () => {
    if (!currentUnitVariant.unit || !currentUnitVariant.stockCount || !currentUnitVariant.price?.costPrice || !editingVariantId) return;
    const updatedUnitVariants = (formData.variant?.unitOnlyVariants || []).map((v) =>
      v._id === editingVariantId ? { ...currentUnitVariant, _id: editingVariantId } : v
    );
    updateFormData({
      variant: {
        ...formData.variant,
        variantType: "unitOnly",
        unitOnlyVariants: updatedUnitVariants,
      },
    });
    resetVariantForm();
  };

  const handleRemoveVariant = async (variantId) => {
    if (isEditMode && formData._id) {
      try {
        await axios.delete(
          `/api/products/${formData._id}/variants/${variantId}`
        );
      } catch (error) {
        console.error("Error removing variant:", error);
        setApiError("Failed to remove variant. Please try again.");
        return;
      }
    }
    // Remove from formData.variant.unitOnlyVariants
    if (formData.variant?.unitOnlyVariants) {
      const updatedList = formData.variant.unitOnlyVariants.filter(
        (v) => (v._id || v.id) !== variantId
      );
      updateFormData({
        variant: {
          ...formData.variant,
          variantType: "unitOnly",
          unitOnlyVariants: updatedList,
        },
      });
    }
  };

  // Key Ingredients Handlers
  const handleAddKeyIngredient = () => {
    if (keyIngredientInput.trim()) {
      setKeyIngredients((prev) => [...prev, keyIngredientInput.trim()]);
      updateFormData({
        ingredients: [...keyIngredients, keyIngredientInput.trim()],
      });
      setKeyIngredientInput("");
    }
  };

  const handleRemoveKeyIngredient = (ingredientToRemove) => {
    const updatedIngredients = keyIngredients.filter(
      (ing) => ing !== ingredientToRemove
    );
    setKeyIngredients(updatedIngredients);
    updateFormData({ ingredients: updatedIngredients });
  };

  // DataTable Configuration
const formatVariantsForTable = () => {
  const tableData = [];
  
  // Check if variant data exists in formData
  if (!formData.variant) {
    console.log("No variant data found");
    return tableData;
  }

  const { variantType, unitOnlyVariants, sizeColorVariants, colorOnlyVariants, sizeOnlyVariants } = formData.variant;
  
  console.log("Formatting variants:", { variantType, unitOnlyVariants, sizeColorVariants, colorOnlyVariants, sizeOnlyVariants });

  let variantList = unitOnlyVariants || [];
  let displayType = "Unit";

  // Format each variant for the table
  variantList.forEach((variant, index) => {
    let displayValue = variant.unit;

    tableData.push({
      id: variant._id || `variant-${index}`,
      type: displayType,
      value: displayValue,
      stockCount: variant.stockCount || 0,
      skuCode: variant.skuCode || "-",
      productCode: variant.productCode || "-",
      costPrice: variant.price?.costPrice || 0,
      salePrice: variant.price?.salePrice || 0,
      discount: variant.price?.discount || 0,
      tax: variant.price?.tax || 0,
      variantImages: variant.variantImages || [],
    });
  });
  
  console.log("Formatted table data:", tableData);
  return tableData;
};

  const columns = [
    {
      name: "Type",
      selector: (row) => row.type,
      sortable: true,
      width: "100px",
    },
    {
      name: "Variant",
      selector: (row) => row.value,
      sortable: true,
      width: "150px",
    },
    {
      name: "Regular Price",
      selector: (row) => `$${row.costPrice}`,
      sortable: true,
      width: "120px",
    },
    {
      name: "Sale Price",
      selector: (row) => (row.salePrice ? `$${row.salePrice}` : "-"),
      sortable: true,
      width: "120px",
    },
    {
      name: "Stock",
      selector: (row) => row.stockCount,
      sortable: true,
      width: "100px",
    },
    {
      name: "SKU",
      selector: (row) => row.skuCode || "-",
      sortable: true,
      width: "120px",
    },
    {
      name: "Images",
      cell: (row) => (
        <div className="flex gap-1">
          {row.variantImages?.slice(0, 2).map((image, idx) => (
            <img
              key={idx}
              src={
                typeof image === "string" ? image : URL.createObjectURL(image)
              }
              alt={`Variant ${idx + 1}`}
              className="h-8 w-8 rounded object-cover"
              onError={(e) => {
                e.target.src = "/placeholder-image.jpg";
              }}
            />
          ))}
          {row.variantImages?.length > 2 && (
            <span className="text-xs text-gray-500">
              +{row.variantImages.length - 2}
            </span>
          )}
        </div>
      ),
      sortable: false,
      width: "100px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEditVariant(row)}
            className="text-blue-600 hover:text-blue-900 text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => handleRemoveVariant(row.id)}
            className="text-red-600 hover:text-red-900 text-sm"
          >
            Remove
          </button>
        </div>
      ),
      sortable: false,
      width: "120px",
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: "var(--color-table)",
        color: "#fff",
        fontWeight: "bold",
        padding: "12px 16px",
      },
    },
    cells: {
      style: {
        padding: "8px 12px",
      },
    },
    table: {
      style: {
        width: "100%",
        maxHeight: "400px",
      },
    },
  };

  // ========== RENDER SECTIONS ==========

  // Get price and stock values - prioritize nonVariant for non-variant products
  const priceData = formData.hasNonVariation
    ? formData.nonVariant?.price || formData.price
    : formData.price;
  
  const stockCountValue = formData.hasNonVariation
    ? formData.nonVariant?.stockCount ?? formData.stockCount
    : formData.stockCount;

  const productCodeValue = formData.hasNonVariation
    ? formData.nonVariant?.productCode || formData.productCode || ""
    : formData.productCode || "";



  // =========================================================
  // MAIN PRODUCT DETAILS FOR VARIANT PRODUCTS
  // =========================================================
  // Variant products also have their own product-level price/code/stock.
  // Variant prices and stocks remain independent inside the Unit Variant section.
  const renderVariantMainProductDetails = () => {
    if (!formData.hasVariation) return null;

    return (
      <div className="w-full mt-4 border rounded-lg p-4 bg-white">
        <h3 className="text-lg font-semibold mb-4">Product Details</h3>
        <div className="h-px bg-blue-500 mb-5" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="variantMainCostPrice" className="block text-sm font-medium text-gray-600 mb-2">
              Cost Price (₹) *
            </label>
            <input
              id="variantMainCostPrice"
              type="number"
              name="costPrice"
              min="0"
              step="0.01"
              placeholder="0"
              value={priceData?.costPrice ?? ""}
              onChange={handleInputChange}
              className={`border rounded p-2 w-full ${errors.costPrice ? "border-red-500 bg-red-50" : "border-gray-300"}`}
            />
            {errors.costPrice && <p className="text-red-500 text-sm mt-1">{errors.costPrice}</p>}
          </div>

          <div>
            <label htmlFor="variantMainSalePrice" className="block text-sm font-medium text-gray-600 mb-2">
              Sale Price (₹)
            </label>
            <input
              id="variantMainSalePrice"
              type="number"
              name="salePrice"
              min="0"
              step="0.01"
              placeholder="0"
              value={priceData?.salePrice ?? ""}
              onChange={handleInputChange}
              className="border rounded p-2 w-full border-gray-300 bg-gray-50"
              readOnly
            />
            <p className="text-xs text-gray-500 mt-1">Auto-calculated from cost and discount</p>
          </div>

          <div>
            <label htmlFor="variantMainDiscount" className="block text-sm font-medium text-gray-600 mb-2">
              Discount (%)
            </label>
            <input
              id="variantMainDiscount"
              type="number"
              name="discount"
              min="0"
              max="100"
              step="1"
              placeholder="0"
              value={priceData?.discount ?? ""}
              onChange={handleInputChange}
              className="border rounded p-2 w-full border-gray-300"
            />
          </div>

          <div>
            <label htmlFor="variantMainTax" className="block text-sm font-medium text-gray-600 mb-2">
              Tax (%)
            </label>
            <input
              id="variantMainTax"
              type="number"
              name="tax"
              min="0"
              max="100"
              step="1"
              placeholder="0"
              value={priceData?.tax ?? ""}
              onChange={handleInputChange}
              className="border rounded p-2 w-full border-gray-300"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label htmlFor="variantMainProductCode" className="block text-sm font-medium text-gray-600 mb-2">
              Product Code
            </label>
            <input
              id="variantMainProductCode"
              type="text"
              name="productCode"
              placeholder="SKU or code"
              value={productCodeValue}
              onChange={handleInputChange}
              className="border rounded p-2 w-full border-gray-300"
            />
          </div>

          <div>
            <label htmlFor="variantMainStockCount" className="block text-sm font-medium text-gray-600 mb-2">
              Stock Count
            </label>
            <input
              id="variantMainStockCount"
              type="number"
              name="stockCount"
              min="0"
              step="1"
              placeholder="0"
              value={formData.stockCount ?? ""}
              onChange={handleInputChange}
              className="border rounded p-2 w-full border-gray-300"
            />
          </div>
        </div>

        <div className="mt-4 rounded border-2 border-dashed border-gray-300 p-4 bg-gray-50">
          <p className="text-sm font-medium text-gray-700">Additional Product Images</p>
          <p className="text-xs text-gray-500 mt-1">
            Main product images are managed in the Product Images section above. Variant-specific images are managed inside each variant.
          </p>
        </div>

        <div className="mt-3 rounded bg-blue-50 p-3 text-sm text-blue-700">
          <strong>Note:</strong> This price is the product-level base/starting price. Unit variant prices below are independent and will be used when a customer selects a unit.
        </div>
      </div>
    );
  };

  // Render Unit Only Section
  const renderUnitOnlySection = () => {
    const unitSuggestions = ["LITRE", "MILILITRE", "MILIGRAM", "GRAM", "KILOGRAM", "500 ML", "1 KG", "1 BOTTLE", "25 PCS"];
    
    return (
      <div className="space-y-4 border p-4 rounded-lg">
        <h5 className="text-md font-medium mb-3">Configure Unit Variant</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Unit (e.g. 500 ML, 1 KG, 1 LITRE) *
            </label>
            <input
              type="text"
              list="unit-suggestions"
              name="unit"
              placeholder="e.g., 500 ML, 1 KG, 100 GM"
              value={currentUnitVariant.unit}
              onChange={handleUnitVariantChange}
              className={`border rounded p-2 w-full ${
                errors.unit ? "border-red-500 bg-red-50" : ""
              }`}
              required
            />
            <datalist id="unit-suggestions">
              {unitSuggestions.map((u) => (
                <option key={u} value={u} />
              ))}
            </datalist>
            {errors.unit && (
              <p className="text-red-500 text-sm mt-1">{errors.unit}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Stock Count *
            </label>
            <input
              type="number"
              name="stockCount"
              placeholder="Stock count"
              min="0"
              step="1"
              value={currentUnitVariant.stockCount}
              onChange={handleUnitVariantChange}
              className={`border rounded p-2 w-full ${
                errors.stockCount ? "border-red-500 bg-red-50" : ""
              }`}
              required
            />
            {errors.stockCount && (
              <p className="text-red-500 text-sm mt-1">{errors.stockCount}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              SKU Code
            </label>
            <input
              type="text"
              name="skuCode"
              placeholder="SKU code"
              value={currentUnitVariant.skuCode}
              onChange={handleUnitVariantChange}
              className="border rounded p-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Product Code
            </label>
            <input
              type="text"
              name="productCode"
              placeholder="Product code"
              value={currentUnitVariant.productCode}
              onChange={handleUnitVariantChange}
              className="border rounded p-2 w-full"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Regular Price ($) *
            </label>
            <input
              type="number"
              name="costPrice"
              placeholder="Regular Price"
              min="0"
              step="0.01"
              value={currentUnitVariant.price?.costPrice || ""}
              onChange={handleUnitPriceChange}
              className={`border rounded p-2 w-full ${
                errors.costPrice ? "border-red-500 bg-red-50" : ""
              }`}
              required
            />
            {errors.costPrice && (
              <p className="text-red-500 text-sm mt-1">{errors.costPrice}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Sale Price ($)
            </label>
            <input
              type="number"
              name="salePrice"
              placeholder="Sale Price"
              min="0"
              step="0.01"
              value={currentUnitVariant.price?.salePrice || ""}
              onChange={handleUnitPriceChange}
              className="border rounded p-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Discount (%)
            </label>
            <input
              type="number"
              name="discount"
              placeholder="Discount"
              min="0"
              max="100"
              step="1"
              value={currentUnitVariant.price?.discount || ""}
              onChange={handleUnitPriceChange}
              className="border rounded p-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Tax (%)
            </label>
            <input
              type="number"
              name="tax"
              placeholder="Tax"
              min="0"
              max="100"
              step="1"
              value={currentUnitVariant.price?.tax || ""}
              onChange={handleUnitPriceChange}
              className="border rounded p-2 w-full"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Variant Images
          </label>
          <input
            type="file"
            multiple
            onChange={handleUnitImagesChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            accept="image/*"
          />
          {currentUnitVariant.variantImages.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {currentUnitVariant.variantImages.map((image, index) => (
                <div key={index} className="relative w-20 h-20">
                  <img
                    src={
                      typeof image === "string"
                        ? image
                        : URL.createObjectURL(image)
                    }
                    alt={`Unit variant ${index + 1}`}
                    className="w-full h-full object-cover rounded border"
                  />
                  <button
                    onClick={() => handleRemoveUnitImage(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={isEditingVariant ? handleSaveEditedVariant : handleAddVariant}
          disabled={!canAddVariant()}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          {isEditingVariant
            ? `Update ${currentUnitVariant.unit || "Unit"} Variant`
            : `Add ${currentUnitVariant.unit || "Unit"} Variant`}
        </button>
      </div>
    );
  };

  // Render Non-Variant Images Section
  const renderNonVariantImagesSection = () => (
    <div className="w-full mt-4">
      <h3 className="text-lg font-medium mb-3">Non-Variant Images</h3>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col justify-center items-center relative">
        <FaUpload className="text-orange-500 text-2xl mb-2" />
        <input
          type="file"
          onChange={handleNonVariantFileUpload}
          className="absolute opacity-0 cursor-pointer inset-0"
          multiple
          accept="image/*"
        />
        <p className="text-gray-500 text-sm">
          Drag non-variant images here, or{" "}
          <span className="text-orange-500 cursor-pointer">
            click to browse
          </span>
        </p>
      </div>
      {formData.nonVariant?.nonVariantImages?.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-4">
          {formData.nonVariant.nonVariantImages.map((image, index) => (
            <div key={index} className="relative border rounded-md">
              <img
                src={
                  typeof image === "string" ? image : URL.createObjectURL(image)
                }
                alt={`Non-variant ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg p-4"
              />
              <button
                onClick={() => handleRemoveNonVariantImage(image)}
                className="absolute top-0.5 text-xs right-1 p-1 rounded-full bg-red-500 text-white"
              >
                X
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );



  return (
    <div className="col-span-2 space-y-2 bg-white shadow-lg rounded-lg p-6 w-full">
      <h2 className="text-xl font-semibold mb-6">Product Information</h2>
      {apiError && <p className="text-red-500 text-sm mb-4">{apiError}</p>}
      
      {/* Product Images */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col justify-center items-center relative">
        <FaUpload className="text-orange-500 text-4xl mb-2" />
        <input
          type="file"
          onChange={handleFileUpload}
          className="absolute opacity-0 cursor-pointer inset-0"
          multiple
          accept="image/*"
        />
        <p className="text-gray-500">
          Drag your images here, or{" "}
          <span className="text-orange-500 cursor-pointer">
            click to browse
          </span>
        </p>
      </div>
      {errors.productImages && (
        <p className="text-red-500 text-sm mt-1">{errors.productImages}</p>
      )}
      <div className="grid grid-cols-3 gap-2 mt-4">
        {uploadedImages.map((image, index) => (
          <div key={index} className="relative border rounded-md">
            <img
              src={
                typeof image === "string" ? image : URL.createObjectURL(image)
              }
              alt={`Uploaded ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg p-6"
            />
            <button
              onClick={() => handleRemoveImage(image)}
              className="absolute top-0.5 text-xs right-1 p-1 rounded-full bg-red-500 text-white"
            >
              X
            </button>
          </div>
        ))}
      </div>
      
      {/* Common Fields */}
      <div className="flex gap-4 flex-wrap mt-6">
        <div className="w-full md:w-[calc(50%-8px)]">
          <label
            htmlFor="productCategory"
            className="block text-sm font-medium text-gray-600 mb-2"
          >
            Category *
          </label>
          <select
  id="productCategory"
  name="productCategory"
  className={`border rounded p-2 w-full ${
    errors.productCategory
      ? "border-red-500 bg-red-50"
      : "border-black"
  }`}
  onChange={handleInputChange}
  value={formData.productCategory || ""}
  required
>
  <option value="">Choose a category</option>
  {categories.map((category) => (
    <option 
      key={category._id} 
      value={category.categoryTitle}
    >
      {category.categoryTitle}
    </option>
  ))}
</select>
          {errors.productCategory && (
            <p className="text-red-500 text-sm mt-1">
              {errors.productCategory}
            </p>
          )}
        </div>
        {/* SUBCATEGORY TEMPORARILY DISABLED for Product Create/Edit.
        <div className="w-full md:w-[calc(25%-12px)]">
          <label
            htmlFor="productSubCategory"
            className="block text-sm font-medium text-gray-600 mb-2"
          >
            SubCategory *
          </label>
          <select
  id="productSubCategory"
  name="productSubCategory"
  className={`border rounded p-2 w-full ${
    errors.productSubCategory
      ? "border-red-500 bg-red-50"
      : "border-black"
  }`}
  onChange={handleInputChange}
  value={formData.productSubCategory || ""}
  required
  disabled={!formData.productCategory}
>
  <option value="">Choose a subcategory</option>
  {subCategories.map((subCategory) => (
    <option
      key={subCategory._id}
      value={subCategory.subCategoryTitle}
    >
      {subCategory.subCategoryTitle}
    </option>
  ))}
</select>
          {errors.productSubCategory && (
            <p className="text-red-500 text-sm mt-1">
              {errors.productSubCategory}
            </p>
          )}
        </div> */}
        <div className="w-full md:w-[calc(50%-8px)]">
          <label
            htmlFor="productName"
            className="block text-sm font-medium text-gray-600 mb-2"
          >
            Product Name *
          </label>
          <input
            id="productName"
            type="text"
            name="productName"
            placeholder="Product Name"
            className={`border rounded p-2 w-full ${
              errors.productName ? "border-red-500 bg-red-50" : "border-black"
            }`}
            onChange={handleInputChange}
            value={formData.productName || ""}
            required
          />
          {errors.productName && (
            <p className="text-red-500 text-sm mt-1">{errors.productName}</p>
          )}
        </div>
        <div className="w-full md:w-[calc(25%-12px)]">
          <label
            htmlFor="productTitle"
            className="block text-sm font-medium text-gray-600 mb-2"
          >
            Product Title *
          </label>
          <input
            id="productTitle"
            type="text"
            name="productTitle"
            placeholder="Product Title"
            className={`border rounded p-2 w-full ${
              errors.productTitle ? "border-red-500 bg-red-50" : "border-black"
            }`}
            onChange={handleInputChange}
            value={formData.productTitle || ""}
            required
          />
          {errors.productTitle && (
            <p className="text-red-500 text-sm mt-1">{errors.productTitle}</p>
          )}
        </div>
      </div>
      
      {/* Variation/Non-Variation Toggle */}
      <div className="w-full mb-4 mt-6">
        <h2 className="text-xl font-title mb-4">
          Product Type{" "}
          <span className="text-lg text-gray-600">(variation)</span>
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <input
              id="hasVariation"
              type="checkbox"
              name="hasVariation"
              checked={formData.hasVariation || false}
              onChange={handleInputChange}
              className="h-4 w-4"
            />
            <label
              htmlFor="hasVariation"
              className="ml-2 text-sm text-gray-700"
            >
              Variation
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="hasNonVariation"
              type="checkbox"
              name="hasNonVariation"
              checked={formData.hasNonVariation || false}
              onChange={handleInputChange}
              className="h-4 w-4"
            />
            <label
              htmlFor="hasNonVariation"
              className="ml-2 text-sm text-gray-700"
            >
              Non Variation
            </label>
          </div>
        </div>
      </div>
      
      {/* Variant Management Section */}
      {formData.hasVariation && (
        <div className="w-full space-y-4 mt-4">
          {renderVariantMainProductDetails()}

          <h3 className="text-lg font-medium">Product Variants</h3>
          <div className="border p-4 rounded-lg mb-4">
            <h4 className="text-md font-medium mb-3">Variant Configuration</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Variant Type
                </label>
                <div className="border rounded p-2 w-full bg-gray-50 text-gray-700 font-medium">
                  Unit
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Product-level Base Price
                </label>
                <div className="border rounded p-2 w-full bg-gray-50 text-gray-700">
                  ₹{Number(formData.basePrice || priceData?.salePrice || 0).toFixed(2)}
                </div>
                <p className="text-xs text-gray-500 mt-1">Synced from the main Product Details sale price.</p>
              </div>
            </div>
            {renderUnitOnlySection()}
          </div>
          {true &&  (
  <div className="mt-6 rounded w-full overflow-x-auto">
    <h4 className="text-md font-medium mb-3">Added Variants</h4>
    <div style={{ maxHeight: "400px", overflowY: "auto" }}>
  <DataTable
    columns={columns}
    data={formatVariantsForTable()}
    fixedHeader
    fixedHeaderScrollHeight="400px"
    customStyles={customStyles}
    highlightOnHover
    responsive
    noDataComponent={
      <div className="text-center py-4 text-gray-500">
        No variants added yet
      </div>
    }
  />
</div>
  </div>
)}
        </div>
      )}
      
      {/* Non-Variation Fields - UPDATED */}
      {formData.hasNonVariation && (
        <div className="w-full space-y-4 mt-4">
          <h3 className="text-lg font-medium">Non-Variation Product Details</h3>
          
          {/* Non-Variant Images Section */}
          {renderNonVariantImagesSection()}

          <div className="flex gap-4 flex-wrap">
            <div className="w-full md:w-[calc(25%-12px)]">
              <label
                htmlFor="productTitle"
                className="block text-sm font-medium text-gray-600 mb-2"
              >
                Product Title *
              </label>
              <input
                id="productTitle"
                type="text"
                name="productTitle"
                placeholder="Product Title"
                className={`border rounded p-2 w-full ${
                  errors.productTitle
                    ? "border-red-500 bg-red-50"
                    : "border-black"
                }`}
                onChange={handleInputChange}
                value={formData.productTitle || ""}
                required
              />
              {errors.productTitle && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.productTitle}
                </p>
              )}
            </div>
            <div className="w-full md:w-[calc(25%-12px)]">
              <label
                htmlFor="stockCount"
                className="block text-sm font-medium text-gray-600 mb-2"
              >
                Stock Count *
              </label>
              <input
                id="stockCount"
                type="number"
                name="stockCount"
                placeholder="Stock Count"
                min="0"
                step="1"
                className={`border rounded p-2 w-full ${
                  errors.stockCount
                    ? "border-red-500 bg-red-50"
                    : "border-black"
                }`}
                onChange={handleInputChange}
                value={stockCountValue}
                required
              />
              {errors.stockCount && (
                <p className="text-red-500 text-sm mt-1">{errors.stockCount}</p>
              )}
            </div>
            <div className="w-full md:w-[calc(33.33%-12px)]">
              <label
                htmlFor="productCode"
                className="block text-sm font-medium text-gray-600 mb-2"
              >
                Product Code
              </label>
              <input
                id="productCode"
                type="text"
                name="productCode"
                placeholder="Product Code"
                className="border rounded p-2 w-full border-black"
                onChange={handleInputChange}
                value={productCodeValue}
              />
            </div>
          </div>
          
          {/* Pricing Section - UPDATED */}
          <div className="mt-6">
            <h2 className="text-xl font-title mb-4">Pricing Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="costPrice"
                  className="block text-sm font-medium text-gray-600 mb-2"
                >
                  Regular Price ($) *
                </label>
                <input
                  id="costPrice"
                  type="number"
                  name="costPrice"
                  placeholder="Regular Price"
                  min="0"
                  step="0.01"
                  className={`border rounded p-2 w-full ${
                    errors.costPrice
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  value={priceData?.costPrice || ""}
                  onChange={handleInputChange}
                  required
                />
                {errors.costPrice && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.costPrice}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="salePrice"
                  className="block text-sm font-medium text-gray-600 mb-2"
                >
                  Sale Price ($)
                </label>
                <input
                  id="salePrice"
                  type="number"
                  name="salePrice"
                  placeholder="Sale Price (auto-calculated)"
                  min="0"
                  step="0.01"
                  className="border rounded p-2 w-full bg-gray-50"
                  value={priceData?.salePrice || ""}
                  readOnly
                />
              </div>
              <div>
                <label
                  htmlFor="discount"
                  className="block text-sm font-medium text-gray-600 mb-2"
                >
                  Discount (%)
                </label>
                <input
                  id="discount"
                  type="number"
                  name="discount"
                  placeholder="Discount"
                  min="0"
                  max="100"
                  step="1"
                  className="border rounded p-2 w-full border-gray-300"
                  value={priceData?.discount || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label
                  htmlFor="tax"
                  className="block text-sm font-medium text-gray-600 mb-2"
                >
                  Tax (%)
                </label>
                <input
                  id="tax"
                  type="number"
                  name="tax"
                  placeholder="Tax"
                  min="0"
                  max="100"
                  step="1"
                  className="border rounded p-2 w-full border-gray-300"
                  value={priceData?.tax || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Description */}
      <div className="w-full mt-4">
        <label
          htmlFor="productDescription"
          className="block text-sm font-medium text-gray-600 mb-2"
        >
          Description *
        </label>
        <textarea
          id="productDescription"
          name="productDescription"
          placeholder="Product description (minimum 20 characters)"
          value={formData.productDescription || ""}
          className={`border rounded p-2 w-full h-32 ${
            errors.productDescription
              ? "border-red-500 bg-red-50"
              : "border-black"
          }`}
          onChange={handleInputChange}
          required
        />
        {errors.productDescription && (
          <p className="text-red-500 text-sm mt-1">
            {errors.productDescription}
          </p>
        )}
      </div>

      
      
      {/* Product Usage Field */}
<div className="w-full mt-4">
  <label
    htmlFor="productUsage"
    className="block text-sm font-medium text-gray-600 mb-2"
  >
    Product Usage Instructions *
  </label>
  <textarea
    id="productUsage"
    name="productUsage"
    placeholder="How to use this product..."
    value={formData.productUsage || ""}
    className={`border rounded p-2 w-full h-24 ${
      errors.productUsage
        ? "border-red-500 bg-red-50"
        : "border-black"
    }`}
    onChange={handleInputChange}
    required
  />
  {errors.productUsage && (
    <p className="text-red-500 text-sm mt-1">
      {errors.productUsage}
    </p>
  )}
</div>

{/* Product Benefits Section */}
<div className="w-full mt-4">
  <label className="block text-sm font-medium text-gray-600 mb-2">
    Product Benefits *
  </label>
  <div className="flex gap-2 mb-2">
    <input
      type="text"
      placeholder="Add product benefit (e.g., Long-lasting, Waterproof)"
      value={benefitInput}
      onChange={(e) => setBenefitInput(e.target.value)}
      onKeyPress={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleAddBenefit();
        }
      }}
      className="border rounded p-2 flex-1"
    />
    <button
      onClick={handleAddBenefit}
      disabled={!benefitInput.trim()}
      className="bg-primary text-white px-4 py-2 rounded hover:bg-pink-600 disabled:bg-gray-400"
    >
      Add
    </button>
  </div>
  {errors.productBenifits && (
    <p className="text-red-500 text-sm mt-1">{errors.productBenifits}</p>
  )}
  {keyBenefits.length > 0 && (
    <div className="flex flex-wrap gap-2 mt-2">
      {keyBenefits.map((benefit, index) => (
        <div
          key={index}
          className="flex items-center bg-blue-100 text-black px-3 py-1 rounded-full text-sm"
        >
          {benefit}
          <button
            onClick={() => handleRemoveBenefit(benefit)}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            <IoMdClose />
          </button>
        </div>
      ))}
    </div>
  )}
</div>

{/* Key Ingredients Section */}
<div className="w-full mt-4">
  <label className="block text-sm font-medium text-gray-600 mb-2">
    Key Ingredients *
  </label>
  <div className="flex gap-2 mb-2">
    <input
      type="text"
      placeholder="Add key ingredient"
      value={keyIngredientInput}
      onChange={(e) => setKeyIngredientInput(e.target.value)}
      onKeyPress={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleAddKeyIngredient();
        }
      }}
      className="border rounded p-2 flex-1"
    />
    <button
      onClick={handleAddKeyIngredient}
      disabled={!keyIngredientInput.trim()}
      className="bg-primary text-white px-4 py-2 rounded hover:bg-pink-600 disabled:bg-gray-400"
    >
      Add
    </button>
  </div>
  {errors.productIngrediants && (
    <p className="text-red-500 text-sm mt-1">{errors.productIngrediants}</p>
  )}
  {keyIngredients.length > 0 && (
    <div className="flex flex-wrap gap-2 mt-2">
      {keyIngredients.map((ingredient, index) => (
        <div
          key={index}
          className="flex items-center bg-green-100 text-black px-3 py-1 rounded-full text-sm"
        >
          {ingredient}
          <button
            onClick={() => handleRemoveKeyIngredient(ingredient)}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            <IoMdClose />
          </button>
        </div>
      ))}
    </div>
  )}
</div>
      
      {/* Status */}
      <div className="w-full mt-4">
        <label
          htmlFor="status"
          className="block text-sm font-medium text-gray-600 mb-2"
        >
          Product Status *
        </label>
        <select
          id="status"
          name="status"
          className="border rounded p-2 w-full"
          value={formData.status || "active"}
          onChange={handleInputChange}
          required
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>
  );
};

export default ProductForm;
