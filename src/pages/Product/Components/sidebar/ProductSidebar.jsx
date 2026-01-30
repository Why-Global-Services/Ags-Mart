// import {
//   Package,
//   Settings,
//   Layers,
//   Truck,
//   Link,
// } from "lucide-react";
// import { useProductForm } from "../context/FormContext";

// const icons = {
//   Product: <Package className="w-4 h-4" />,
//   // General: <Settings className="w-4 h-4" />,
//   Inventory: <Layers className="w-4 h-4" />,
//   Shipping: <Truck className="w-4 h-4" />,
//   "Linked Products": <Link className="w-4 h-4" />,
// };

// const ProductSidebar = ({ selected, onSelect, steps }) => {
//   const { formData, validateStep, uploadedImages } = useProductForm();

//   const isStepComplete = (stepName) => {
//     switch (stepName) {
//       case "Product":
//         // Common fields required for both variation and non-variation
//         const commonFieldsValid =
//           !!formData.productBrand?.trim() &&
//           !!formData.productCategory &&
//           !!formData.productSubCategory &&
//           !!formData.productDescription?.trim() &&
//           formData.productDescription.trim().length >= 20 &&
//           uploadedImages.length > 0;
  
//         if (formData.productType === "nonVariation") {
//           return (
//             commonFieldsValid &&
//             !!formData.productName?.trim() &&
//             !isNaN(formData.stockCount) &&
//             formData.stockCount >= 0
//           );
//         } else if (formData.productType === "variation") {
//           // Validate variants
//           return (
//             commonFieldsValid &&
//             formData.variants.length > 0 &&
//             formData.variants.every(
//               (variant) =>
//                 !!variant.variantType?.trim() &&
//                 !!variant.variantValue?.trim() &&
//                 !isNaN(variant.price) &&
//                 parseFloat(variant.price) > 0 &&
//                 !isNaN(variant.stockCount) &&
//                 variant.stockCount >= 0 &&
//                 !!variant.productName?.trim() &&
//                 !!variant.productTitle?.trim() &&
//                 !!variant.productUnit?.trim() &&
//                 variant.productVolumes?.length > 0
//             )
//           );
//         }
//         return false;
  
//       // Other cases (General, Inventory, Shipping, Linked Products) remain unchanged
//       // case "General":
//       //   return (
//       //     !!formData.price.regularPrice &&
//       //     !isNaN(formData.price.regularPrice) &&
//       //     parseFloat(formData.price.regularPrice) > 0 &&
//       //     !!formData.price.salePrice &&
//       //     !isNaN(formData.price.salePrice) &&
//       //     parseFloat(formData.price.salePrice) > 0 &&
//       //     (!formData.price.discount ||
//       //       (!isNaN(formData.price.discount) &&
//       //         formData.price.discount >= 0 &&
//       //         formData.price.discount <= 100)) &&
//       //     (!formData.price.tax ||
//       //       (!isNaN(formData.price.tax) &&
//       //         formData.price.tax >= 0 &&
//       //         formData.price.tax <= 100))
//       //   );
  
//       case "Inventory":
//         return (
//           !!formData.inventory.sku?.trim() &&
//           (!formData.inventory.gtin ||
//             [12, 13, 14].includes(formData.inventory.gtin.trim().length)) &&
//           (!formData.inventory.purchaseLimit ||
//             (!isNaN(formData.inventory.purchaseLimit) &&
//               formData.inventory.purchaseLimit > 0))
//         );
  
//       case "Shipping":
//         return (
//           !!formData.shipping.productWeight &&
//           !isNaN(formData.shipping.productWeight) &&
//           parseFloat(formData.shipping.productWeight) > 0 &&
//           (!formData.shipping.dimension.length ||
//             (!isNaN(formData.shipping.dimension.length) &&
//               formData.shipping.dimension.length >= 0)) &&
//           (!formData.shipping.dimension.width ||
//             (!isNaN(formData.shipping.dimension.width) &&
//               formData.shipping.dimension.width >= 0)) &&
//           (!formData.shipping.dimension.height ||
//             (!isNaN(formData.shipping.dimension.height) &&
//               formData.shipping.dimension.height >= 0))
//         );
  
//       case "Linked Products":
//         return (
//           formData.linkProducts.upSellProducts.length > 0 ||
//           formData.linkProducts.crossSellProducts.length > 0
//         );
  
//       default:
//         return false;
//     }
//   };

//   const handleStepClick = async (step) => {
//     // Define the order of steps
//     const stepOrder = ["Product",
//       //  "General", 
//        "Inventory", "Shipping", "Linked Products"];
//     const targetIndex = stepOrder.indexOf(step);

//     // Check if all previous steps are complete
//     const arePreviousStepsComplete = stepOrder
//       .slice(0, targetIndex)
//       .every((prevStep) => isStepComplete(prevStep));

//     if (!arePreviousStepsComplete) {
//       console.warn(`Cannot navigate to ${step}. Please complete all previous steps.`);
//       // Optionally, you can add a UI notification here (e.g., toast or alert)
//       return;
//     }

//     // Validate the target step and navigate if valid
//     const isValid = await validateStep(step);
//     if (isValid) {
//       onSelect(step);
//     }
//   };

//   return (
//     <div className="bg-white shadow-md rounded-xl p-4 h-fit w-78 space-y-2">
//       {steps.map((step) => {
//         const isComplete = isStepComplete(step);
//         const isActive = selected === step;

//         return (
//           <button
//             key={step}
//             onClick={() => handleStepClick(step)}
//             className={`flex items-center w-full gap-3 px-4 py-2 rounded-lg transition-colors duration-200 ${
//               isActive
//                 ? "bg-pink-100 text-pink-600 font-medium"
//                 : "hover:bg-gray-100 text-gray-700"
//             } ${isComplete ? "border-l-4 border-green-500" : ""}`}
//             aria-current={isActive ? "step" : undefined}
//           >
//             {icons[step]}
//             <span>{step}</span>
//             {isComplete && (
//               <span className="ml-auto text-green-500" aria-hidden="true">
//                 ✓
//               </span>
//             )}
//           </button>
//         );
//       })}
//     </div>
//   );
// };

// export default ProductSidebar;


import { Package, Layers, Truck, Link } from "lucide-react";
import { useProductForm } from "../context/FormContext";

const icons = {
  Product: <Package className="w-4 h-4" />,
  Inventory: <Layers className="w-4 h-4" />,
  Shipping: <Truck className="w-4 h-4" />,
  "Linked Products": <Link className="w-4 h-4" />,
};

const ProductSidebar = ({ selected, onSelect, steps }) => {
  const { formData, validateStep, uploadedImages, keyIngredients } = useProductForm();

  const isStepComplete = (stepName) => {
    switch (stepName) {
      case "Product":
        // Common fields validation
        const commonFieldsValid =
          !!formData.productBrand?.trim() &&
          !!formData.brand_id?.trim() &&
          !!formData.productCategory?.trim() &&
          !!formData.category_id?.trim() &&
          !!formData.productSubCategory?.trim() &&
          !!formData.subcategory_id?.trim() &&
          !!formData.productName?.trim() &&
          !!formData.productDescription?.trim() &&
          formData.productDescription.trim().length >= 20 &&
          uploadedImages.length > 0 &&
          !!formData.status?.trim();

        // Benefits validation (if benefits are enabled)
        const benefitsValid =
          !formData.benefits ||
          (formData.productBenefits.dermatologistTest?.trim() ||
            formData.productBenefits.cleanFormula?.trim() ||
            formData.productBenefits.longLasting?.trim() ||
            formData.productBenefits.highlyRated?.trim());

        // Key ingredients validation (required)
        const ingredientsValid =
          Array.isArray(keyIngredients) &&
          keyIngredients.length > 0 &&
          keyIngredients.every((ing) => !!ing?.trim());

        if (formData.productType === "nonVariation") {
          return (
            commonFieldsValid &&
            benefitsValid &&
            ingredientsValid &&
            !!formData.productTitle?.trim() &&
            !isNaN(formData.stockCount) &&
            formData.stockCount >= 0 &&
            !!formData.price.regularPrice &&
            !isNaN(formData.price.regularPrice) &&
            parseFloat(formData.price.regularPrice) > 0 &&
            !!formData.price.salePrice &&
            !isNaN(formData.price.salePrice) &&
            parseFloat(formData.price.salePrice) >= 0 &&
            !!formData.price.tax &&
            !isNaN(formData.price.tax) &&
            parseFloat(formData.price.tax) >= 0 &&
            parseFloat(formData.price.tax) <= 100 &&
            (formData.price.discount === "" ||
              (!isNaN(formData.price.discount) &&
                parseFloat(formData.price.discount) >= 0 &&
                parseFloat(formData.price.discount) <= 100))
          );
        } else if (formData.productType === "variation") {
          return (
            commonFieldsValid &&
            benefitsValid &&
            ingredientsValid &&
            formData.variants.length > 0 &&
            formData.variants.every(
              (variant) =>
                !!variant.variantType?.trim() &&
                !!variant.variantValue?.trim() &&
                !!variant.productTitle?.trim() &&
                !!variant.productUnit?.trim() &&
                variant.productVolumes?.length > 0 &&
                variant.productVolumes.every(
                  (vol) => !isNaN(vol) && parseFloat(vol) > 0
                ) &&
                !isNaN(variant.stockCount) &&
                variant.stockCount >= 0 &&
                !!variant.price.regularPrice &&
                !isNaN(variant.price.regularPrice) &&
                parseFloat(variant.price.regularPrice) > 0 &&
                !!variant.price.salePrice &&
                !isNaN(variant.price.salePrice) &&
                parseFloat(variant.price.salePrice) >= 0 &&
                !!variant.price.tax &&
                !isNaN(variant.price.tax) &&
                parseFloat(variant.price.tax) >= 0 &&
                parseFloat(variant.price.tax) <= 100 &&
                (variant.price.discount === "" ||
                  (!isNaN(variant.price.discount) &&
                    parseFloat(variant.price.discount) >= 0 &&
                    parseFloat(variant.price.discount) <= 100)) &&
                (variant.skuCode === "" || !!variant.skuCode?.trim()) &&
                (variant.variantImage === null ||
                  variant.variantImage instanceof File ||
                  typeof variant.variantImage === "string")
            )
          );
        }
        return false;

      case "Inventory":
        return (
          !!formData.inventory.sku?.trim() &&
          (formData.inventory.gtin === "" ||
            [12, 13, 14].includes(formData.inventory?.gtin?.trim().length)) &&
          !!formData.inventory.stockManagement?.trim() &&
          (formData.inventory.trackStock === undefined ||
            !!formData.inventory.trackStock?.trim()) &&
          (formData.inventory.purchaseLimit === "" ||
            (!isNaN(formData.inventory.purchaseLimit) &&
              parseInt(formData.inventory.purchaseLimit) > 0))
        );

      case "Shipping":
        return (
          !!formData.shipping.productWeight &&
          !isNaN(formData.shipping.productWeight) &&
          parseFloat(formData.shipping.productWeight) > 0 &&
          (formData.shipping.dimension.length === "" ||
            (!isNaN(formData.shipping.dimension.length) &&
              parseFloat(formData.shipping.dimension.length) >= 0)) &&
          (formData.shipping.dimension.width === "" ||
            (!isNaN(formData.shipping.dimension.width) &&
              parseFloat(formData.shipping.dimension.width) >= 0)) &&
          (formData.shipping.dimension.height === "" ||
            (!isNaN(formData.shipping.dimension.height) &&
              parseFloat(formData.shipping.dimension.height) >= 0)) &&
          (formData.shipping.shippingClass === "" ||
            !!formData.shipping.shippingClass?.trim())
        );

      case "Linked Products":
        return (
          Array.isArray(formData.linkProducts.upSellProducts) &&
          Array.isArray(formData.linkProducts.crossSellProducts) &&
          (formData.linkProducts.upSellProducts.length > 0 ||
            formData.linkProducts.crossSellProducts.length > 0) &&
          formData.linkProducts.upSellProducts.every((id) => !!id?.trim()) &&
          formData.linkProducts.crossSellProducts.every((id) => !!id?.trim())
        );

      default:
        return false;
    }
  };

  const handleStepClick = async (step) => {
    const stepOrder = ["Product", "Inventory", "Shipping", "Linked Products"];
    const targetIndex = stepOrder.indexOf(step);
    const arePreviousStepsComplete = stepOrder
      .slice(0, targetIndex)
      .every((prevStep) => isStepComplete(prevStep));

    if (!arePreviousStepsComplete) {
      console.warn(`Cannot navigate to ${step}. Please complete all previous steps.`);
      return;
    }

    const isValid = await validateStep(selected);
    if (isValid) {
      onSelect(step);
    } else {
      const firstErrorElement = document.querySelector(".border-red-500");
      if (firstErrorElement) firstErrorElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-4 h-fit w-78 space-y-2">
      {steps.map((step) => {
        const isComplete = isStepComplete(step);
        const isActive = selected === step;

        return (
          <button
            key={step}
            onClick={() => handleStepClick(step)}
            className={`flex items-center w-full gap-3 px-4 py-2 cursor-pointer rounded-lg transition-colors duration-200 ${
              isActive
                ? "bg-primary text-secondary font-medium"
                : "hover:bg-gray-100 text-gray-700"
            } ${isComplete ? "border-l-4 border-green-500" : ""}`}
            aria-current={isActive ? "step" : undefined}
          >
            {icons[step]}
            <span>{step}</span>
            {isComplete && (
              <span className="ml-auto text-green-500" aria-hidden="true">
                ✓
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ProductSidebar;