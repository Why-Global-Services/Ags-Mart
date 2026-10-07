import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  getProductById,
  createProduct,
  updateProduct,
} from "../../services/Products";
import CreateProductLayout from "./Components/layout/CreateProductLayout";
import {
  ProductFormProvider,
  useProductForm,
} from "./Components/context/FormContext";
import ProductForm from "./Components/forms/ProductForm";
// Standalone ShippingForm, LinkedForm, and ProductSidebar removed from CreateProduct flow
// Unified single-page product creation and editing flow
import { toast } from "react-toastify";

const CreateProductContent = () => {
  const { id } = useParams();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const {
    formData,
    validateStep,
    isEditMode,
    loadProductData,
    resetForm,
    productId,
    generatePayload,
    uploadedImages,
    keyIngredients,
  } = useProductForm();

  const editData = location.state?.product || null;

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          if (editData) {
            loadProductData(editData);
          } else {
            const response = await getProductById(id);
            const product = response?.data?.data || response?.data;
            loadProductData(product);
          }
        } catch (error) {
          console.error("Error fetching product:", error);
          navigate("/products");
        }
      };
      fetchProduct();
    } else {
      resetForm();
    }
  }, [id, loadProductData, resetForm, navigate, editData]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const isValid = await validateStep("Product");
      if (!isValid) {
        toast.error("Please fill in all required fields correctly.");
        const firstErrorElement = document.querySelector(".border-red-500");
        if (firstErrorElement)
          firstErrorElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        setIsSubmitting(false);
        return;
      }

      const payload = generatePayload();
      const formDataToSend = new FormData();

      console.log("📦 Payload generated:", payload);

      // Basic fields
      formDataToSend.append("productName", payload.productName || "");
      formDataToSend.append("productTitle", payload.productTitle || "");
      formDataToSend.append("productCategory", payload.productCategory || "");
      formDataToSend.append("category_id", payload.category_id || "");
      if (payload.productSubCategory) {
        formDataToSend.append("productSubCategory", payload.productSubCategory);
      }
      if (payload.subcategory_id) {
        formDataToSend.append("subcategory_id", payload.subcategory_id);
      }
      formDataToSend.append("productType", payload.productType || "");
      formDataToSend.append("productDescription", payload.productDescription || "");
      formDataToSend.append("productUsage", payload.productUsage || "");
      formDataToSend.append("status", payload.status || "active");
      if (payload.basePrice !== undefined && payload.basePrice !== null && payload.basePrice !== "") {
        formDataToSend.append("basePrice", payload.basePrice);
      }

      // Product Benefits (as array)
      if (payload.productBenifits && payload.productBenifits.length > 0) {
        payload.productBenifits.forEach((benefit, index) => {
          formDataToSend.append(`productBenifits[${index}]`, benefit);
        });
      }

      // Product Ingredients (as array)
      if (payload.productIngrediants && payload.productIngrediants.length > 0) {
        payload.productIngrediants.forEach((ingredient, index) => {
          formDataToSend.append(`productIngrediants[${index}]`, ingredient);
        });
      }


      // Handle Product Images
      if (uploadedImages && uploadedImages.length > 0) {
        uploadedImages.forEach((image, index) => {
          if (image instanceof File) {
            formDataToSend.append("productImages", image);
          } else if (typeof image === "string") {
            formDataToSend.append(`productImages[${index}]`, image);
          }
        });
      }

      // Handle VARIANT product type
// REPLACE the variant handling section in handleSubmit (CreateProduct.jsx) with this:

// ============ FIXED VARIANT HANDLING ============
if (payload.productType === "variant" && payload.variant) {
  const variant = payload.variant;
  
  console.log("🔧 Processing variant data:", variant);
  
  // Prepare variant data without images for JSON
  const variantDataForJson = {
    variantType: variant.variantType,
    unitOnlyVariants: [],
    sizeColorVariants: [],
    colorOnlyVariants: [],
    sizeOnlyVariants: [],
  };

  let variantImageCounter = 1;

  // Process unitOnly variants
  if (variant.variantType === "unitOnly" && variant.unitOnlyVariants) {
    variant.unitOnlyVariants.forEach((v, index) => {
      const variantWithoutImages = {
        unit: v.unit,
        stockCount: v.stockCount,
        skuCode: v.skuCode || "",
        productCode: v.productCode || "",
        price: v.price || { costPrice: "", salePrice: "", discount: "", tax: "" },
        shipping: {
          productWeight:
            v.shipping?.productWeight !== undefined && v.shipping?.productWeight !== ""
              ? Number(v.shipping.productWeight)
              : 0,
          dimension: {
            length:
              v.shipping?.dimension?.length !== undefined && v.shipping?.dimension?.length !== ""
                ? Number(v.shipping.dimension.length)
                : 0,
            width:
              v.shipping?.dimension?.width !== undefined && v.shipping?.dimension?.width !== ""
                ? Number(v.shipping.dimension.width)
                : 0,
            height:
              v.shipping?.dimension?.height !== undefined && v.shipping?.dimension?.height !== ""
                ? Number(v.shipping.dimension.height)
                : 0,
          },
          hsnCode: (v.shipping?.hsnCode || "").trim(),
          shippingClass: v.shipping?.shippingClass || "standard",
        },
        _variantImageIndex: variantImageCounter,
      };
      if (v._id) {
        variantWithoutImages._id = v._id;
      }
      variantDataForJson.unitOnlyVariants.push(variantWithoutImages);

      // Handle images separately
      if (v.variantImages && v.variantImages.length > 0) {
        v.variantImages.forEach((img) => {
          if (img instanceof File) {
            formDataToSend.append(`variantImages_${variantImageCounter}`, img);
          } else if (typeof img === "string") {
            formDataToSend.append(
              `existingVariantImages_${variantImageCounter}[]`,
              img
            );
          }
        });
        variantImageCounter++;
      }
    });
  }

  // Legacy sizeColor, colorOnly, and sizeOnly variant handling commented out (Unit-only variants active)
  /*
  // Process sizeColor variants
  if (variant.variantType === "sizeColor" && variant.sizeColorVariants) {
    variant.sizeColorVariants.forEach((v, index) => {
      // Create variant data without images
      const variantWithoutImages = {
        size: v.size,
        color: v.color,
        stockCount: v.stockCount,
        skuCode: v.skuCode || "",
        productCode: v.productCode || "",
        price: v.price || { costPrice: "", salePrice: "", discount: "", tax: "" },
        _variantImageIndex: variantImageCounter,
      };
      variantDataForJson.sizeColorVariants.push(variantWithoutImages);

      // Handle images separately
      if (v.variantImages && v.variantImages.length > 0) {
        v.variantImages.forEach((img) => {
          if (img instanceof File) {
            formDataToSend.append(`variantImages_${variantImageCounter}`, img);
          } else if (typeof img === "string") {
            formDataToSend.append(
              `existingVariantImages_${variantImageCounter}[]`,
              img
            );
          }
        });
        variantImageCounter++;
      }
    });
  }

  // Process colorOnly variants
  if (variant.variantType === "colorOnly" && variant.colorOnlyVariants) {
    variant.colorOnlyVariants.forEach((v, index) => {
      const variantWithoutImages = {
        color: v.color,
        stockCount: v.stockCount,
        skuCode: v.skuCode || "",
        productCode: v.productCode || "",
        price: v.price || { costPrice: "", salePrice: "", discount: "", tax: "" },
        _variantImageIndex: variantImageCounter,
      };
      variantDataForJson.colorOnlyVariants.push(variantWithoutImages);

      if (v.variantImages && v.variantImages.length > 0) {
        v.variantImages.forEach((img) => {
          if (img instanceof File) {
            formDataToSend.append(`variantImages_${variantImageCounter}`, img);
          } else if (typeof img === "string") {
            formDataToSend.append(
              `existingVariantImages_${variantImageCounter}[]`,
              img
            );
          }
        });
        variantImageCounter++;
      }
    });
  }

  // Process sizeOnly variants
  if (variant.variantType === "sizeOnly" && variant.sizeOnlyVariants) {
    variant.sizeOnlyVariants.forEach((v, index) => {
      const variantWithoutImages = {
        size: v.size,
        stockCount: v.stockCount,
        skuCode: v.skuCode || "",
        productCode: v.productCode || "",
        price: v.price || { costPrice: "", salePrice: "", discount: "", tax: "" },
        _variantImageIndex: variantImageCounter,
      };
      variantDataForJson.sizeOnlyVariants.push(variantWithoutImages);

      if (v.variantImages && v.variantImages.length > 0) {
        v.variantImages.forEach((img) => {
          if (img instanceof File) {
            formDataToSend.append(`variantImages_${variantImageCounter}`, img);
          } else if (typeof img === "string") {
            formDataToSend.append(
              `existingVariantImages_${variantImageCounter}[]`,
              img
            );
          }
        });
        variantImageCounter++;
      }
    });
  }
  */

  // Append variant data as JSON
  formDataToSend.append("variant", JSON.stringify(variantDataForJson));
  
  console.log(`📸 Total variant image groups: ${variantImageCounter - 1}`);
  console.log("📦 Variant data for JSON:", variantDataForJson);
}

      // Handle NON-VARIANT product type
      if (payload.productType === "nonVariant" && payload.nonVariant) {
        const nonVariant = payload.nonVariant;

       const nonVariantTitle = nonVariant.productTitle || payload.productTitle || payload.productName;
        
        // Send as JSON string
        formDataToSend.append("nonVariant", JSON.stringify({
          productTitle: nonVariantTitle || "",
          price: {
            costPrice: nonVariant.price?.costPrice || 0,
            salePrice: nonVariant.price?.salePrice || 0,
            discount: nonVariant.price?.discount || 0,
            tax: nonVariant.price?.tax || 0,
          },
          stockCount: nonVariant.stockCount || 0,
          skuCode: nonVariant.skuCode || "",
          productCode: nonVariant.productCode || "",
        }));
        
        // Handle non-variant images
        if (nonVariant.nonVariantImages && nonVariant.nonVariantImages.length > 0) {
          nonVariant.nonVariantImages.forEach((img, index) => {
            if (img instanceof File) {
              formDataToSend.append("nonVariantImages", img);
            } else if (typeof img === "string") {
              formDataToSend.append(`nonVariantImages[${index}]`, img);
            }
          });
        }
      }

      // Inventory
      if (payload.inventory) {
        formDataToSend.append("inventory", JSON.stringify(payload.inventory));
      }

      // Shipping
      if (payload.shipping) {
        formDataToSend.append("shipping", JSON.stringify(payload.shipping));
      }

      // Search Tags - FIXED
if (payload.searchTags && Array.isArray(payload.searchTags) && payload.searchTags.length > 0) {
  payload.searchTags.forEach((tag, index) => {
    formDataToSend.append(`searchTags[${index}]`, tag);
  });
} else {
  // Send empty array indicator
  formDataToSend.append('searchTags', JSON.stringify([]));
}

// Link Products - FIXED
if (payload.linkProducts && payload.linkProducts.relatedProducts && payload.linkProducts.relatedProducts.length > 0) {
  formDataToSend.append("linkProducts", JSON.stringify(payload.linkProducts));
} else {
  formDataToSend.append("linkProducts", JSON.stringify({ relatedProducts: [] }));
}

      // Log FormData contents for debugging
      console.log("📤 FormData contents:");
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0], pair[1]);
      }

      // Submit
      if (isEditMode) {
        await updateProduct(productId, formDataToSend);
        toast.success("Product updated successfully!");
      } else {
        await createProduct(formDataToSend);
        toast.success("Product created successfully!");
      }
      
      navigate("/products");
    } catch (error) {
      console.error("Error submitting product:", error);
      toast.error(
        `Error ${isEditMode ? "updating" : "creating"} product. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CreateProductLayout isEdit={isEditMode}>
      <div className="w-full">
        <ProductForm />
        <div className="pt-6 pb-12 flex justify-end">
          <button
            className="hover:bg-emerald-700 text-white font-medium px-8 py-3 rounded-xl cursor-pointer bg-emerald-600 transition-colors shadow-md flex items-center gap-2"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Processing..."
              : isEditMode
              ? "Update Product"
              : "Create Product"}
          </button>
        </div>
      </div>
    </CreateProductLayout>
  );
};

const CreateProduct = () => (
  <ProductFormProvider>
    <CreateProductContent />
  </ProductFormProvider>
);

export default CreateProduct;
