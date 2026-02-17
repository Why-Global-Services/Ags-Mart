"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useCallback } from "react";
import { X, Plus, Upload, Trash2 } from "lucide-react";
import { useLocation } from "react-router-dom";
import "./productFormCSS.css";

import { productSchema } from "./prductSchema";
import { getActiveCategories } from "../../Interceptor/interceptor";
import { getSubCategoriesByCategory } from "../../services/Offer";
import { createProduct, getAllActiveProducts, updateProduct } from "../../services/Products";

export default function ProductForm() {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubcategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedRelated, setSelectedRelated] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Image preview states
  const [productImagePreviews, setProductImagePreviews] = useState([]);
  const [nonVariantImagePreviews, setNonVariantImagePreviews] = useState([]);
  const [variantImagePreviews, setVariantImagePreviews] = useState({});

  // Track which images to delete (for update)
  const [imagesToDelete, setImagesToDelete] = useState({
    productImages: [],
    nonVariantImages: [],
    variantImages: {}
  });

  const location = useLocation();
  const initialData = location.state?.product || null;
  const isUpdate = location.state?.isUpdate || false;

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productType: "nonVariant",
      isReturnable: false,
      isTodaySpecial: false,
      variant: {
        variantType: "sizeColor",
        sizeColorVariants: [],
        sizeOnlyVariants: [],
        colorOnlyVariants: [],
      },
      nonVariant: {
        price: { costPrice: 0, salePrice: 0, discount: 0, tax: 0 },
        stockCount: 0,
      },
      productBenifits: [],
      productIngrediants: [],
      searchTags: [],
      linkProducts: { relatedProducts: [] },
    },
  });

  const productType = watch("productType");
  const variantType = watch("variant.variantType");
  const relatedProductIds = watch("linkProducts.relatedProducts") || [];

  // Watch for non-variant price fields
  const nonVariantCostPrice = watch("nonVariant.price.costPrice");
  const nonVariantDiscount = watch("nonVariant.price.discount");

  // Watch for variant price fields
  // const sizeColorVariants = watch("variant.sizeColorVariants");
  // const sizeOnlyVariants = watch("variant.sizeOnlyVariants");
  // const colorOnlyVariants = watch("variant.colorOnlyVariants");

  const { fields: benefitFields, append: appendBenefit, remove: removeBenefit } = useFieldArray({ control, name: "productBenifits" });
  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({ control, name: "productIngrediants" });
  const sizeColorArray = useFieldArray({ control, name: "variant.sizeColorVariants" });
  const sizeOnlyArray = useFieldArray({ control, name: "variant.sizeOnlyVariants" });
  const colorOnlyArray = useFieldArray({ control, name: "variant.colorOnlyVariants" });
  const { fields: tagFields, append: appendTag, remove: removeTag } = useFieldArray({ control, name: "searchTags" });
  const { fields: relatedFields, append: appendRelated, remove: removeRelated } = useFieldArray({ control, name: "linkProducts.relatedProducts" });

  // Function to calculate sale price based on cost and discount
  const calculateSalePrice = useCallback((cost, discount) => {
    const costNum = parseFloat(cost) || 0;
    const discountNum = parseFloat(discount) || 0;

    if (costNum <= 0) return 0;

    if (discountNum <= 0) return costNum;

    // Calculate sale price after discount
    const discountAmount = (costNum * discountNum) / 100;
    const salePrice = costNum - discountAmount;

    // Return rounded to 2 decimal places
    return Math.round(salePrice * 100) / 100;
  }, []);

  // Effect for non-variant product price calculation
  useEffect(() => {
    if (productType === "nonVariant") {
      const salePrice = calculateSalePrice(nonVariantCostPrice, nonVariantDiscount);
      setValue("nonVariant.price.salePrice", salePrice, { shouldValidate: true });
    }
  }, [nonVariantCostPrice, nonVariantDiscount, productType, setValue, calculateSalePrice]);

  // Effect for variant product price calculations
  // useEffect(() => {
  //   if (productType === "variant") {
  //     // Handle sizeColor variants
  //     if (sizeColorVariants && sizeColorVariants.length > 0) {
  //       sizeColorVariants.forEach((variant, index) => {
  //         if (variant?.price) {
  //           const salePrice = calculateSalePrice(variant.price.costPrice, variant.price.discount);
  //           if (parseFloat(variant.price.salePrice) !== salePrice) {
  //             setValue(`variant.sizeColorVariants.${index}.price.salePrice`, salePrice, { shouldValidate: true });
  //           }
  //         }
  //       });
  //     }

  //     // Handle sizeOnly variants
  //     if (sizeOnlyVariants && sizeOnlyVariants.length > 0) {
  //       sizeOnlyVariants.forEach((variant, index) => {
  //         if (variant?.price) {
  //           const salePrice = calculateSalePrice(variant.price.costPrice, variant.price.discount);
  //           if (parseFloat(variant.price.salePrice) !== salePrice) {
  //             setValue(`variant.sizeOnlyVariants.${index}.price.salePrice`, salePrice, { shouldValidate: true });
  //           }
  //         }
  //       });
  //     }

  //     // Handle colorOnly variants
  //     if (colorOnlyVariants && colorOnlyVariants.length > 0) {
  //       colorOnlyVariants.forEach((variant, index) => {
  //         if (variant?.price) {
  //           const salePrice = calculateSalePrice(variant.price.costPrice, variant.price.discount);
  //           if (parseFloat(variant.price.salePrice) !== salePrice) {
  //             setValue(`variant.colorOnlyVariants.${index}.price.salePrice`, salePrice, { shouldValidate: true });
  //           }
  //         }
  //       });
  //     }
  //   }
  // }, [sizeColorVariants, sizeOnlyVariants, colorOnlyVariants, productType, setValue, calculateSalePrice]);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await getActiveCategories();
      setCategories(res.data || res);
    } catch (err) {
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  // Load data for update mode
  useEffect(() => {
    if (!initialData) return;

    const loadInitialData = async () => {
      try {
        setLoading(true);

        // Load subcategories and products for the selected category
        if (initialData.category_id) {
          const [subRes, prodRes] = await Promise.all([
            getSubCategoriesByCategory(initialData.category_id),
            getAllActiveProducts(initialData.category_id),
          ]);
          setSubcategories(subRes.data || subRes);
          setAllProducts(prodRes.data || prodRes);
        }

        // Reset form with initial data
        reset({
          ...initialData,
          isReturnable: initialData.isReturnable ?? false, // ✅ FIX
          isTodaySpecial: initialData.isTodaySpecial ?? false, // ✅ FIX
          linkProducts: {
            relatedProducts: initialData.linkProducts?.relatedProducts || [],
          },
        });

        // Load product images
        if (initialData.productImages?.length) {
          setProductImagePreviews(
            initialData.productImages.map((url) => ({
              id: url,
              preview: url,
              file: null, // existing image from server
              isExisting: true
            }))
          );
        }

        // Load non-variant images
        if (initialData.nonVariant?.nonVariantImages?.length) {
          setNonVariantImagePreviews(
            initialData.nonVariant.nonVariantImages.map((url) => ({
              id: url,
              preview: url,
              file: null,
              isExisting: true
            }))
          );
        }

        // Load variant images
        if (initialData.variant) {
          const variantType = initialData.variant.variantType;
          const variantsKey = `${variantType}Variants`;
          const variants = initialData.variant[variantsKey] || [];

          const newVariantPreviews = {};
          variants.forEach((variant, index) => {
            if (variant.variantImages?.length) {
              const key = `${variantType}-${index}`;
              newVariantPreviews[key] = variant.variantImages.map((url) => ({
                id: url,
                preview: url,
                file: null,
                isExisting: true
              }));
            }
          });
          setVariantImagePreviews(newVariantPreviews);
        }

      } catch (err) {
        setError("Failed to load product data");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [initialData, reset]);

  // Handle product images
  const handleProductImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
      isExisting: false
    }));
    setProductImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeProductImage = (id) => {
    setProductImagePreviews((prev) => {
      const item = prev.find((img) => img.id === id);

      // If it's an existing image, mark for deletion
      if (item?.isExisting) {
        setImagesToDelete(prevDelete => ({
          ...prevDelete,
          productImages: [...prevDelete.productImages, id]
        }));
      } else if (item?.preview) {
        URL.revokeObjectURL(item.preview);
      }

      return prev.filter((img) => img.id !== id);
    });
  };

  // Handle non-variant images
  const handleNonVariantImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
      isExisting: false
    }));
    setNonVariantImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeNonVariantImage = (id) => {
    setNonVariantImagePreviews((prev) => {
      const item = prev.find((img) => img.id === id);

      if (item?.isExisting) {
        setImagesToDelete(prevDelete => ({
          ...prevDelete,
          nonVariantImages: [...prevDelete.nonVariantImages, id]
        }));
      } else if (item?.preview) {
        URL.revokeObjectURL(item.preview);
      }

      return prev.filter((img) => img.id !== id);
    });
  };

  // Handle variant images
  const handleVariantImagesChange = (e, index, type) => {
    const files = Array.from(e.target.files);
    const key = `${type}-${index}`;
    const newPreviews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
      isExisting: false
    }));

    setVariantImagePreviews((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), ...newPreviews],
    }));
  };

  const removeVariantImage = (variantKey, imageId) => {
    setVariantImagePreviews((prev) => {
      const item = (prev[variantKey] || []).find((img) => img.id === imageId);

      if (item?.isExisting) {
        setImagesToDelete(prevDelete => ({
          ...prevDelete,
          variantImages: {
            ...prevDelete.variantImages,
            [variantKey]: [...(prevDelete.variantImages[variantKey] || []), imageId]
          }
        }));
      } else if (item?.preview) {
        URL.revokeObjectURL(item.preview);
      }

      return {
        ...prev,
        [variantKey]: (prev[variantKey] || []).filter((img) => img.id !== imageId),
      };
    });
  };

  useEffect(() => {
    if (variantType === "sizeColor") {
      sizeOnlyArray.replace([]);
      colorOnlyArray.replace([]);
    } else if (variantType === "sizeOnly") {
      sizeColorArray.replace([]);
      colorOnlyArray.replace([]);
    } else if (variantType === "colorOnly") {
      sizeColorArray.replace([]);
      sizeOnlyArray.replace([]);
    }
  }, [variantType]);

  useEffect(() => {
    if (productType === "nonVariant") {
      sizeColorArray.replace([]);
      sizeOnlyArray.replace([]);
      colorOnlyArray.replace([]);
    } else if (productType === "variant") {
      setValue("nonVariant", {
        price: { costPrice: 0, salePrice: 0, discount: 0, tax: 0 },
        stockCount: 0,
      });
    }
  }, [productType]);

  const handleSelectCategory = async (e) => {
    const categoryId = e.target.value;
    const selectedText = e.target.selectedOptions[0]?.text || "";

    setValue("category_id", categoryId, { shouldValidate: true });
    setValue("productCategory", selectedText, { shouldValidate: true });
    setValue("subcategory_id", "");
    setValue("productSubCategory", "");

    setSubcategories([]);
    setAllProducts([]);

    if (!categoryId) return;

    try {
      setLoading(true);
      const [subRes, prodRes] = await Promise.all([
        getSubCategoriesByCategory(categoryId),
        getAllActiveProducts(categoryId),
      ]);
      setSubcategories(subRes.data || subRes);
      setAllProducts(prodRes.data || prodRes);
    } finally {
      setLoading(false);
    }
  };

  // Handler for non-variant cost price change
  const handleNonVariantCostChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setValue("nonVariant.price.costPrice", value, { shouldValidate: true });
  };

  // Handler for non-variant discount change
  const handleNonVariantDiscountChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setValue("nonVariant.price.discount", value, { shouldValidate: true });
  };

  // Handler for variant cost price change
  // const handleVariantCostChange = (e, index, type) => {
  //   const value = parseFloat(e.target.value) || 0;
  //   const fieldName = `variant.${type}Variants.${index}.price.costPrice`;
  //   setValue(fieldName, value, { shouldValidate: true });
  // };

  // // Handler for variant discount change
  // const handleVariantDiscountChange = (e, index, type) => {
  //   const value = parseFloat(e.target.value) || 0;
  //   const fieldName = `variant.${type}Variants.${index}.price.discount`;
  //   setValue(fieldName, value, { shouldValidate: true });
  // };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Cleanup based on product type
      if (data.productType === "nonVariant") {
        delete data.variant;
      }
      if (data.productType === "variant") {
        delete data.nonVariant;
      }

      const formData = new FormData();

      // Add new product images only (not existing ones)
      productImagePreviews.forEach((img) => {
        if (img.file) {
          formData.append("productImages", img.file);
        }
      });

      // Add existing product images that weren't deleted
      const existingProductImages = productImagePreviews
        .filter(img => img.isExisting && !imagesToDelete.productImages.includes(img.id))
        .map(img => img.id);
      if (existingProductImages.length > 0) {
        formData.append("existingProductImages", JSON.stringify(existingProductImages));
      }

      // Handle non-variant images
      if (data.productType === "nonVariant") {
        nonVariantImagePreviews.forEach((img) => {
          if (img.file) {
            formData.append("nonVariantImages", img.file);
          }
        });

        const existingNonVariantImages = nonVariantImagePreviews
          .filter(img => img.isExisting && !imagesToDelete.nonVariantImages.includes(img.id))
          .map(img => img.id);
        if (existingNonVariantImages.length > 0) {
          formData.append("existingNonVariantImages", JSON.stringify(existingNonVariantImages));
        }
      }

      // Handle variant images
      if (data.productType === "variant") {
        Object.entries(variantImagePreviews).forEach(([key, images]) => {
          const index = Number(key.split("-")[1]) + 1;

          // Add new images
          images.forEach((img) => {
            if (img.file) {
              formData.append(`variantImages_${index}`, img.file);
            }
          });

          // Add existing images
          const existingImages = images
            .filter(img => img.isExisting && !(imagesToDelete.variantImages[key] || []).includes(img.id))
            .map(img => img.id);
          if (existingImages.length > 0) {
            formData.append(`existingVariantImages_${index}`, JSON.stringify(existingImages));
          }
        });
      }

      // Append images to delete
      if (isUpdate) {
        formData.append("imagesToDelete", JSON.stringify(imagesToDelete));
      }


      // Append main fields
      // Object.entries(data).forEach(([key, value]) => {
      //   formData.append(
      //     "isReturnable",
      //     data.isReturnable ? "true" : "false"
      //   );

      //   if (key === "variant" || key === "nonVariant") return;

      //   if (typeof value !== "object" || value === null) {
      //     formData.append(key, value);
      //   } else {
      //     formData.append(key, JSON.stringify(value));
      //   }
      // });
      formData.append(
        "isReturnable",
        data.isReturnable ? "true" : "false"
      );
      formData.append(
        "isTodaySpecial",
        data.isTodaySpecial ? "true" : "false"
      );
      console.log(data ,"vishnu");

      Object.entries(data).forEach(([key, value]) => {
        if (
          key === "variant" ||
          key === "nonVariant" ||
          key === "isReturnable" ||
          key === "isTodaySpecial"
        ) return;

        if (typeof value !== "object" || value === null) {
          formData.append(key, value);
        } else {
          formData.append(key, JSON.stringify(value));
        }
      });


      // Append variant/nonVariant
      if (data.nonVariant) {
        formData.append("nonVariant", JSON.stringify(data.nonVariant));
      }
      if (data.variant) {
        formData.append("variant", JSON.stringify(data.variant));
      }

      // API call
      let response;
      if (isUpdate) {
        response = await updateProduct(initialData._id, formData);
      } else {
        response = await createProduct(formData);
      }

      if (!response?.success) {
        throw new Error(response?.message || "Product save failed");
      }

      setSuccess(isUpdate ? "Product updated successfully!" : "Product created successfully!");

      if (!isUpdate) {
        reset();
        setProductImagePreviews([]);
        setNonVariantImagePreviews([]);
        setVariantImagePreviews({});
        setImagesToDelete({ productImages: [], nonVariantImages: [], variantImages: {} });
      }

    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const handleFormErrors = (formErrors) => {
    console.log("Form errors:", formErrors);
    setError("Please fix all errors before submitting");
    const firstError = Object.keys(formErrors)[0];
    if (firstError) {
      document.querySelector(`[name="${firstError}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const renderVariantFields = (array, type) => (
    <>
      {array.fields.map((field, i) => (
        <div key={field.id} className="variant-card">
          <div className="variant-header">
            <span className="variant-badge">Variant {i + 1}</span>
            <button
              type="button"
              className="btn-icon-danger"
              onClick={() => array.remove(i)}
              style={{ backgroundColor: '#000', color: '#fff' }}
            >
              <Trash2 size={16} />
            </button>
          </div>

          <div className="form-row grid-3">
            {(type === "sizeColor" || type === "sizeOnly") && (
              <div className="form-group">
                <label>Size</label>
                <input placeholder="M, L, XL" {...register(`variant.${type}Variants.${i}.size`)} />
              </div>
            )}
            {(type === "sizeColor" || type === "colorOnly") && (
              <div className="form-group">
                <label>Color</label>
                <input placeholder="Red, Blue" {...register(`variant.${type}Variants.${i}.color`)} />
              </div>
            )}
            <div className="form-group">
              <label>Product Code</label>
              <input placeholder="SKU" {...register(`variant.${type}Variants.${i}.productCode`)} />
            </div>
          </div>

          <div className="form-row grid-4">
            <div className="form-group">
              <label>Cost ($)</label>
              <Controller
                control={control}
                name={`variant.${type}Variants.${i}.price.costPrice`}
                render={({ field }) => (
                  <input
                    type="number"
                    step="0.01"
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const cost = parseFloat(e.target.value) || 0;
                      field.onChange(cost);

                      const discount =
                        watch(`variant.${type}Variants.${i}.price.discount`) || 0;

                      const sale = calculateSalePrice(cost, discount);

                      setValue(
                        `variant.${type}Variants.${i}.price.salePrice`,
                        sale,
                        { shouldDirty: true, shouldValidate: true }
                      );
                    }}
                    onWheel={(e) => e.target.blur()}
                  />
                )}
              />
            </div>
            <div className="form-group">
              <label>Sale ($)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register(`variant.${type}Variants.${i}.price.salePrice`)}
                readOnly
                className="readonly-input"
              />
              <small className="calculation-hint">
                Auto-calculated from Cost and Discount
              </small>
            </div>
            <div className="form-group">
              <label>Discount (%)</label>
              <Controller
                control={control}
                name={`variant.${type}Variants.${i}.price.discount`}
                render={({ field }) => (
                  <input
                    type="number"
                    step="0.01"
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const discount = parseFloat(e.target.value) || 0;
                      field.onChange(discount);

                      const cost =
                        watch(`variant.${type}Variants.${i}.price.costPrice`) || 0;

                      const sale = calculateSalePrice(cost, discount);

                      setValue(
                        `variant.${type}Variants.${i}.price.salePrice`,
                        sale,
                        { shouldDirty: true, shouldValidate: true }
                      );
                    }}
                    onWheel={(e) => e.target.blur()}
                  />
                )}
              />

            </div>
            <div className="form-group">
              <label>Tax (%)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0"
                {...register(`variant.${type}Variants.${i}.price.tax`)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Stock Count</label>
              <input type="number" placeholder="0" {...register(`variant.${type}Variants.${i}.stockCount`)} />
            </div>
            <div className="form-group">
              <label className="file-upload-label" style={{ backgroundColor: '#000', color: '#fff' }}>
                <Upload size={18} />
                <span>Images</span>
                <input type="file" multiple accept="image/*" onChange={(e) => handleVariantImagesChange(e, i, type)} style={{ display: "none" }} />
              </label>
            </div>
          </div>

          {variantImagePreviews[`${type}-${i}`]?.length > 0 && (
            <div className="image-preview-grid">
              {variantImagePreviews[`${type}-${i}`].map((img) => (
                <div key={img.id} className="image-preview-item">
                  <img src={img.preview} alt="Preview" />
                  <button
                    type="button"
                    className="image-remove-btn"
                    onClick={() => removeVariantImage(`${type}-${i}`, img.id)}
                    style={{ backgroundColor: '#000', color: '#fff' }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        className="btn-add"
        onClick={() => array.append({
          ...(type !== "colorOnly" && { size: "" }),
          ...(type !== "sizeOnly" && { color: "" }),
          productCode: "",
          stockCount: 0,
          price: { costPrice: 0, salePrice: 0, discount: 0, tax: 0 }
        })}
        style={{ backgroundColor: '#059669', color: '#fff' }}
      >
        <Plus size={20} /> Add {type === "sizeColor" ? "Size + Color" : type === "sizeOnly" ? "Size" : "Color"} Variant
      </button>
    </>
  );

  return (
    <div className="product-form-container">
      <h2>{isUpdate ? "Update Product" : "Add New Product"}</h2>

      {error && (
        <div className="alert alert-error">
          <span>⚠</span>
          <span>{error}</span>
          <button onClick={() => setError(null)} className="alert-close" style={{ backgroundColor: '#000', color: '#fff' }}>✕</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span>✓</span>
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="alert-close" style={{ backgroundColor: '#000', color: '#fff' }}>✕</button>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit, handleFormErrors)}>
        {/* BASIC INFORMATION */}
        <div className="form-section">
          <h3>Basic Information</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category_id" className="required">Category</label>
              <select id="category_id" {...register("category_id")} onChange={handleSelectCategory} disabled={loading}>
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.categoryTitle}</option>
                ))}
              </select>
              {errors.category_id && <span className="error-msg">{errors.category_id.message}</span>}
              <input type="hidden" {...register("productCategory")} />
            </div>

            <div className="form-group">
              <label htmlFor="subcategory_id">Subcategory</label>
              <select id="subcategory" {...register("subcategory_id")} disabled={loading || subCategories.length === 0}
                onChange={(e) => {
                  setValue("subcategory_id", e.target.value, { shouldValidate: true });
                  setValue("productSubCategory", e.target.selectedOptions[0]?.text || "", { shouldValidate: true });
                }}>
                <option value="">Select Subcategory</option>
                {subCategories.map((sub) => (
                  <option key={sub._id} value={sub._id}>{sub.subCategoryTitle}</option>
                ))}
              </select>
              <input type="hidden" {...register("productSubCategory")} />
            </div>

            <div className="form-group">
              <label htmlFor="productTitle" className="required">Product Name</label>
              <input id="productTitle" placeholder="Enter product name" {...register("productTitle")}
                onChange={(e) => {
                  const value = e.target.value;
                  setValue("productTitle", value, { shouldValidate: true });
                  setValue("productName", value, { shouldValidate: true });
                  setValue("nonVariant.productTitle", value, { shouldValidate: false });
                }} />
              {errors.productTitle && <span className="error-msg">{errors.productTitle.message}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="productDescription" className="required">Description</label>
            <textarea id="productDescription" placeholder="Enter product description" rows="4" {...register("productDescription")} />
            {errors.productDescription && <span className="error-msg">{errors.productDescription.message}</span>}
          </div>
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              {...register("isReturnable")}
            />
            <span>Product is Returnable</span>
          </label>
        </div>


        {/* PRODUCT IMAGES */}
        <div className="form-section">
          <h3>Product Images</h3>
          <div className="form-group">
            <label className="file-upload-label" style={{ backgroundColor: '#000', color: '#fff' }}>
              <Upload size={20} />
              <span>Choose Images</span>
              <input type="file" multiple accept="image/*" onChange={handleProductImagesChange} style={{ display: "none" }} />
            </label>

            {productImagePreviews.length > 0 && (
              <div className="image-preview-grid">
                {productImagePreviews.map((img) => (
                  <div key={img.id} className="image-preview-item">
                    <img src={img.preview} alt="Preview" />
                    <button
                      type="button"
                      className="image-remove-btn"
                      onClick={() => removeProductImage(img.id)}
                      style={{ backgroundColor: '#000', color: '#fff' }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* PRODUCT TYPE */}
        <div className="form-section">
          <h3>Product Type</h3>
          <div className="radio-group">
            <label className="radio-label">
              <input type="radio" value="nonVariant" {...register("productType")} />
              <span>Non-Variant Product</span>
            </label>
            <label className="radio-label">
              <input type="radio" value="variant" {...register("productType")} />
              <span>Variant Product</span>
            </label>
          </div>
        </div>

        {/* NON-VARIANT */}
        {productType === "nonVariant" && (
          <div className="form-section">
            <h3>Product Details</h3>

            <div className="form-row grid-4">
              <div className="form-group">
                <label>Cost Price ($)</label>
                <Controller
                  control={control}
                  name="nonVariant.price.costPrice"
                  render={({ field }) => (
                    <input
                      type="number"
                      step="0.01"
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const cost = parseFloat(e.target.value) || 0;
                        field.onChange(cost);

                        const discount = watch("nonVariant.price.discount") || 0;
                        const sale = calculateSalePrice(cost, discount);

                        setValue("nonVariant.price.salePrice", sale, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
                      onWheel={(e) => e.target.blur()}
                    />
                  )}
                />
                {errors.nonVariant?.price?.costPrice && <span className="error-msg">{errors.nonVariant.price.costPrice.message}</span>}
              </div>
              <div className="form-group">
                <label>Sale Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("nonVariant.price.salePrice")}
                  readOnly
                  className="readonly-input"
                />
                <small className="calculation-hint">
                  Auto-calculated from Cost and Discount
                </small>
                {errors.nonVariant?.price?.salePrice && <span className="error-msg">{errors.nonVariant.price.salePrice.message}</span>}
              </div>
              <div className="form-group">
                <label>Discount (%)</label>
                <Controller
                  control={control}
                  name="nonVariant.price.discount"
                  render={({ field }) => (
                    <input
                      type="number"
                      step="0.01"
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const discount = parseFloat(e.target.value) || 0;
                        field.onChange(discount);

                        const cost = watch("nonVariant.price.costPrice") || 0;
                        const sale = calculateSalePrice(cost, discount);

                        setValue("nonVariant.price.salePrice", sale, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
                      onWheel={(e) => e.target.blur()}
                    />
                  )}
                />

              </div>
              <div className="form-group">
                <label>Tax (%)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0"
                  {...register("nonVariant.price.tax")}
                  onWheel={(e) => e.target.blur()}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Product Code</label>
                <input placeholder="SKU or code" {...register("nonVariant.productCode")} />
              </div>
              <div className="form-group">
                <label>Stock Count</label>
                <input type="number" placeholder="0" {...register("nonVariant.stockCount")} />
              </div>
            </div>

            <div className="form-group">
              <label className="file-upload-label" style={{ backgroundColor: '#000', color: '#fff' }}>
                <Upload size={20} />
                <span>Additional Images</span>
                <input type="file" multiple accept="image/*" onChange={handleNonVariantImagesChange} style={{ display: "none" }} />
              </label>

              {nonVariantImagePreviews.length > 0 && (
                <div className="image-preview-grid">
                  {nonVariantImagePreviews.map((img) => (
                    <div key={img.id} className="image-preview-item">
                      <img src={img.preview} alt="Preview" />
                      <button
                        type="button"
                        className="image-remove-btn"
                        onClick={() => removeNonVariantImage(img.id)}
                        style={{ backgroundColor: '#000', color: '#fff' }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VARIANT */}
        {productType === "variant" && (
          <div className="form-section">
            <h3>Variant Configuration</h3>

            <div className="form-group">
              <label>Variant Type</label>
              <select {...register("variant.variantType")}>
                <option value="sizeColor">Size + Color</option>
                <option value="sizeOnly">Size Only</option>
                <option value="colorOnly">Color Only</option>
              </select>
            </div>

            {variantType === "sizeColor" && renderVariantFields(sizeColorArray, "sizeColor")}
            {variantType === "sizeOnly" && renderVariantFields(sizeOnlyArray, "sizeOnly")}
            {variantType === "colorOnly" && renderVariantFields(colorOnlyArray, "colorOnly")}
          </div>
        )}

        {/* BENEFITS */}
        <div className="form-section">
          <h3>Product Benefits</h3>
          <div className="dynamic-fields">
            {benefitFields.map((field, i) => (
              <div key={field.id} className="dynamic-field-item">
                <input placeholder={`Benefit ${i + 1}`} {...register(`productBenifits.${i}`)} />
                <button
                  type="button"
                  className="btn-icon-danger"
                  onClick={() => removeBenefit(i)}
                  style={{ backgroundColor: '#000', color: '#fff' }}
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="btn-add-small"
            onClick={() => appendBenefit("")}
            style={{ backgroundColor: '#059669', color: '#fff' }}
          >
            <Plus size={18} /> Add Benefit
          </button>
        </div>

        {/* INGREDIENTS */}
        <div className="form-section">
          <h3>Product Ingredients</h3>
          <div className="dynamic-fields">
            {ingredientFields.map((field, i) => (
              <div key={field.id} className="dynamic-field-item">
                <input placeholder={`Ingredient ${i + 1}`} {...register(`productIngrediants.${i}`)} />
                <button
                  type="button"
                  className="btn-icon-danger"
                  onClick={() => removeIngredient(i)}
                  style={{ backgroundColor: '#000', color: '#fff' }}
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="btn-add-small"
            onClick={() => appendIngredient("")}
            style={{ backgroundColor: '#059669', color: '#fff' }}
          >
            <Plus size={18} /> Add Ingredient
          </button>
        </div>

        {/* USAGE */}
        <div className="form-section">
          <h3>Product Usage</h3>
          <div className="form-group">
            <textarea placeholder="How to use this product..." rows="4" {...register("productUsage")} />
          </div>
        </div>

        {/* TAGS */}
        <div className="form-section">
          <h3>Search Tags</h3>
          <div className="dynamic-fields">
            {tagFields.map((field, i) => (
              <div key={field.id} className="dynamic-field-item">
                <input placeholder={`Tag ${i + 1}`} {...register(`searchTags.${i}`)} />
                <button
                  type="button"
                  className="btn-icon-danger"
                  onClick={() => removeTag(i)}
                  style={{ backgroundColor: '#000', color: '#fff' }}
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="btn-add-small"
            onClick={() => appendTag("")}
            style={{ backgroundColor: '#059669', color: '#fff' }}
          >
            <Plus size={18} /> Add Tag
          </button>
        </div>

        {/* RELATED PRODUCTS */}
        <div className="form-section">
          <h3>Related Products</h3>
          <div className="related-products-selector">
            <select value={selectedRelated} onChange={(e) => setSelectedRelated(e.target.value)} disabled={allProducts.length === 0}>
              <option value="">Select a product</option>
              {allProducts.map((p) => (
                <option key={p._id} value={p._id}>{p.productTitle || p.productName}</option>
              ))}
            </select>
            <button
              type="button"
              className="btn-add-small"
              disabled={!selectedRelated}
              onClick={() => {
                if (!relatedProductIds.includes(selectedRelated)) {
                  appendRelated(selectedRelated);
                  setSelectedRelated("");
                }
              }}
              style={{ backgroundColor: '#059669', color: '#fff' }}
            >
              Add
            </button>
          </div>

          <div className="selected-related-products">
            {relatedProductIds.length === 0 && (
              <p style={{ opacity: 0.6, textAlign: "center", padding: "1rem" }}>
                No related products selected
              </p>
            )}
            {relatedProductIds.map((id, i) => {
              const p = allProducts.find((prod) => prod._id === id);
              return (
                <div key={id} className="selected-related-item">
                  <span>{p?.productTitle || p?.productName || id}</span>
                  <button
                    type="button"
                    className="btn-icon-danger"
                    onClick={() => removeRelated(i)}
                    style={{ backgroundColor: '#000', color: '#fff' }}
                  >
                    <X size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        {/* Check Box */}
         <div className="form-group checkbox-group">
          <h3>Today Special</h3>
          <p>
            <label className="checkbox-label">
              <input type="checkbox" {...register("isTodaySpecial")} />
              <span className="ps-4">Mark as Today's Special</span>
            </label>
          </p>
          </div>

          
        {/* SUBMIT */}
        <button
          type="submit"
          className="submit-btn"
          disabled={isSubmitting || loading}
          style={{ backgroundColor: '#059669', color: '#fff' }}
        >
          {isSubmitting ? "Saving..." : isUpdate ? "Update Product" : "Create Product"}
        </button>
      </form>
    </div>
  );
}