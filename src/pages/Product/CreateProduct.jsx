import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  getProductById,
  createProduct,
  updateProduct,
} from "../../services/Products";
import ProductSidebar from "./Components/sidebar/ProductSidebar";
import CreateProductLayout from "./Components/layout/CreateProductLayout";
import {
  ProductFormProvider,
  useProductForm,
} from "./Components/context/FormContext";
import ProductForm from "./Components/forms/ProductForm";
import InventoryForm from "./Components/forms/InventoryForm";
import ShippingForm from "./Components/forms/ShippingForm";
import LinkedProductsForm from "./Components/forms/LinkedForm";
import { toast } from "react-toastify";

const CreateProductContent = () => {
  const { id } = useParams();
  const location = useLocation();
  const formSteps = ["Product", "Linked Products"];
  const [selectedForm, setSelectedForm] = useState(formSteps[0]);
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
    uploadedImages, // ADD THIS LINE
    keyIngredients, // ADD THIS LINE
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
            loadProductData(response.data);
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

  const currentStepIndex = formSteps.indexOf(selectedForm);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === formSteps.length - 1;

  const renderForm = () => {
    switch (selectedForm) {
      case "Product":
        return <ProductForm />;
      case "Inventory":
        // return <InventoryForm />;
      case "Shipping":
        // return <ShippingForm />;
      case "Linked Products":
        return <LinkedProductsForm />;
      default:
        return null;
    }
  };

  const goToNext = async () => {
    const isValid = await validateStep(selectedForm);
    if (isValid && !isLastStep) {
      setSelectedForm(formSteps[currentStepIndex + 1]);
    } else if (!isValid) {
      toast.error("Please fill in all required fields correctly.");
      const firstErrorElement = document.querySelector(".border-red-500");
      if (firstErrorElement)
        firstErrorElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    }
  };

  const goToBack = () => {
    if (!isFirstStep) setSelectedForm(formSteps[currentStepIndex - 1]);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const isValid = await validateStep(selectedForm);
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
      formDataToSend.append("productSubCategory", payload.productSubCategory || "");
      formDataToSend.append("subcategory_id", payload.subcategory_id || "");
      formDataToSend.append("productType", payload.productType || "");
      formDataToSend.append("productDescription", payload.productDescription || "");
      formDataToSend.append("productUsage", payload.productUsage || "");
      formDataToSend.append("status", payload.status || "active");

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
    sizeColorVariants: [],
    colorOnlyVariants: [],
    sizeOnlyVariants: [],
  };

  let variantImageCounter = 1;

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
      <ProductSidebar
        selected={selectedForm}
        onSelect={setSelectedForm}
        steps={formSteps}
      />
      <div className="flex-1">
        {renderForm()}
        <div className="pt-5 flex justify-end">
          {!isFirstStep && (
            <button
              className="bg-gray-400 text-white px-6 py-2 rounded mr-4 cursor-pointer"
              onClick={goToBack}
            >
              Back
            </button>
          )}
          {!isLastStep ? (
            <button
              className="hover:bg-secondary text-white px-6 py-2 rounded cursor-pointer bg-table"
              onClick={goToNext}
            >
              Next
            </button>
          ) : (
            <button
              className="hover:bg-secondary text-white px-6 py-2 rounded cursor-pointer bg-table"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Processing..."
                : isEditMode
                ? "Update Product"
                : "Create Product"}
            </button>
          )}
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