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
//         const commonFieldsValid =
//           !!formData.productBrand?.trim() &&
//           !!formData.productCategory &&
//           !!formData.productSubCategory &&
//           !!formData.productDescription?.trim() &&
//           formData.productDescription.trim().length >= 20 &&
//           uploadedImages.length > 0;
//   
//         if (formData.productType === "nonVariation") {
//           return (
//             commonFieldsValid &&
//             !!formData.productName?.trim() &&
//             !isNaN(formData.stockCount) &&
//             formData.stockCount >= 0
//           );
//         } else if (formData.productType === "variation") {
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
//           parseFloat(formData.shipping.productWeight) > 0
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
//     const stepOrder = ["Product", "Shipping", "Linked Products"];
//     const targetIndex = stepOrder.indexOf(step);
//     const arePreviousStepsComplete = stepOrder
//       .slice(0, targetIndex)
//       .every((prevStep) => isStepComplete(prevStep));
//     if (!arePreviousStepsComplete) {
//       console.warn(`Cannot navigate to ${step}. Please complete all previous steps.`);
//       return;
//     }
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
//                 : "hover:bg-emerald-50/80 text-gray-700"
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

import { Package } from "lucide-react";
import { useProductForm } from "../context/FormContext";

const icons = {
  Product: <Package className="w-4 h-4" />,
};

const ProductSidebar = ({ selected, onSelect, steps }) => {
  const { formData, uploadedImages, keyIngredients } = useProductForm();

  const isStepComplete = (stepName) => {
    switch (stepName) {
      case "Product": {
        const commonFieldsValid =
          !!formData.productCategory?.trim() &&
          !!formData.category_id?.trim() &&
          !!formData.productName?.trim() &&
          !!formData.productDescription?.trim() &&
          formData.productDescription.trim().length >= 20 &&
          uploadedImages.length > 0 &&
          !!formData.status?.trim();

        const benefitsValid =
          !formData.benefits ||
          (formData.productBenefits?.dermatologistTest?.trim() ||
            formData.productBenefits?.cleanFormula?.trim() ||
            formData.productBenefits?.longLasting?.trim() ||
            formData.productBenefits?.highlyRated?.trim());

        const ingredientsValid =
          Array.isArray(keyIngredients) &&
          keyIngredients.length > 0 &&
          keyIngredients.every((ing) => !!ing?.trim());

        const isNonVariant =
          formData.productType === "nonVariation" ||
          formData.productType === "nonVariant";
        const isVariant =
          formData.productType === "variation" ||
          formData.productType === "variant";

        if (isNonVariant) {
          const priceObj = formData.nonVariant?.price || formData.price || {};
          const regularPrice = priceObj.regularPrice ?? priceObj.costPrice;
          const salePrice = priceObj.salePrice;
          return (
            commonFieldsValid &&
            benefitsValid &&
            ingredientsValid &&
            !!(formData.nonVariant?.productTitle || formData.productTitle)?.trim() &&
            !isNaN(formData.nonVariant?.stockCount ?? formData.stockCount) &&
            (formData.nonVariant?.stockCount ?? formData.stockCount) >= 0 &&
            regularPrice !== undefined &&
            regularPrice !== "" &&
            !isNaN(regularPrice) &&
            parseFloat(regularPrice) > 0 &&
            salePrice !== undefined &&
            salePrice !== "" &&
            !isNaN(salePrice) &&
            parseFloat(salePrice) >= 0
          );
        } else if (isVariant) {
          const unitVariants = formData.variant?.unitOnlyVariants || [];
          return (
            commonFieldsValid &&
            benefitsValid &&
            ingredientsValid &&
            unitVariants.length > 0 &&
            unitVariants.every(
              (v) =>
                !!v.unit?.trim() &&
                !isNaN(v.stockCount) &&
                Number(v.stockCount) >= 0 &&
                v.price?.costPrice !== undefined &&
                v.price?.costPrice !== "" &&
                !isNaN(v.price.costPrice) &&
                parseFloat(v.price.costPrice) > 0 &&
                v.price?.salePrice !== undefined &&
                v.price?.salePrice !== "" &&
                !isNaN(v.price.salePrice) &&
                parseFloat(v.price.salePrice) >= 0
            )
          );
        }
        return false;
      }

      case "Inventory":
        return (
          !!formData.inventory?.sku?.trim() &&
          (formData.inventory?.gtin === "" ||
            [12, 13, 14].includes(formData.inventory?.gtin?.trim().length)) &&
          !!formData.inventory?.stockManagement?.trim() &&
          (formData.inventory?.trackStock === undefined ||
            !!formData.inventory?.trackStock?.trim()) &&
          (formData.inventory?.purchaseLimit === "" ||
            (!isNaN(formData.inventory?.purchaseLimit) &&
              parseInt(formData.inventory?.purchaseLimit) > 0))
        );

      default:
        return false;
    }
  };

  const handleStepClick = (step) => {
    onSelect(step);
  };

  return (
    <div className="agri-glass-card rounded-2xl p-4 h-fit w-full lg:w-64 xl:w-72 space-y-2 shrink-0">
      {steps.map((step) => {
        const isComplete = isStepComplete(step);
        const isActive = selected === step;

        return (
          <button
            key={step}
            onClick={() => handleStepClick(step)}
            className={`flex items-center w-full gap-3 px-4 py-2 cursor-pointer rounded-lg transition-colors duration-200 ${
              isActive
                ? "bg-emerald-700 text-white font-medium shadow-sm shadow-emerald-700/20"
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
