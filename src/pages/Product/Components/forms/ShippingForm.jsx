/**
 * DEPRECATED: Shipping details are now managed inline directly within ProductForm.jsx:
 * - A single Shipping Details card for Non-Variant products.
 * - An inline Shipping Details section inside each Unit Variant card for Unit-Only variant products.
 * This standalone form component is retained only for historical reference.
 */
import React from "react";
import { useProductForm } from "../context/FormContext";

const ShippingForm = () => {
  const { formData, errors, updateFormData } = useProductForm();

  const shipping = formData.shipping || {};
  const dimension = shipping.dimension || {};

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (["length", "width", "height"].includes(name)) {
      updateFormData({
        shipping: {
          ...shipping,
          dimension: {
            ...dimension,
            [name]: value,
          },
        },
      });
    } else {
      updateFormData({
        shipping: {
          ...shipping,
          [name]: value,
        },
      });
    }
  };

  return (
    <div className="col-span-2 space-y-4 bg-white shadow-lg rounded-lg p-6 w-full">
      <div>
        <h2 className="text-xl font-title mb-1">
          Shipping & Shiprocket Details
        </h2>

        <p className="text-sm text-gray-500 mb-6">
          Enter the packed product details used for Shiprocket shipping.
        </p>

        {/* Weight + HSN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div>
            <label
              htmlFor="productWeight"
              className="block text-sm font-medium text-gray-600 mb-2"
            >
              Weight (g) *
            </label>

            <input
              id="productWeight"
              type="number"
              name="productWeight"
              min="1"
              step="any"
              placeholder="Example: 500"
              className={`border rounded p-2 w-full ${
                errors.productWeight ? "border-red-500" : ""
              }`}
              value={shipping.productWeight ?? ""}
              onChange={handleInputChange}
            />

            {errors.productWeight && (
              <p className="text-red-500 text-sm mt-1">
                {errors.productWeight}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="hsnCode"
              className="block text-sm font-medium text-gray-600 mb-2"
            >
              HSN Code
            </label>

            <input
              id="hsnCode"
              type="text"
              name="hsnCode"
              placeholder="Example: 330499"
              className="border rounded p-2 w-full"
              value={shipping.hsnCode ?? ""}
              onChange={handleInputChange}
            />
          </div>

        </div>

        {/* Dimensions */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Dimensions (cm)
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Length (cm)
              </label>

              <input
                type="number"
                name="length"
                min="0"
                step="any"
                placeholder="Example: 20"
                className="border rounded p-2 w-full"
                value={dimension.length ?? ""}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Width (cm)
              </label>

              <input
                type="number"
                name="width"
                min="0"
                step="any"
                placeholder="Example: 15"
                className="border rounded p-2 w-full"
                value={dimension.width ?? ""}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Height (cm)
              </label>

              <input
                type="number"
                name="height"
                min="0"
                step="any"
                placeholder="Example: 10"
                className="border rounded p-2 w-full"
                value={dimension.height ?? ""}
                onChange={handleInputChange}
              />
            </div>

          </div>
        </div>

        {/* Shipping class */}
        <div className="mt-6">
          <label
            htmlFor="shippingClass"
            className="block text-sm font-medium text-gray-600 mb-2"
          >
            Shipping Class
          </label>

          <select
            id="shippingClass"
            name="shippingClass"
            className="border rounded p-2 w-full"
            value={shipping.shippingClass || "standard"}
            onChange={handleInputChange}
          >
            <option value="standard">Standard</option>
            <option value="express">Express</option>
            <option value="freeShipping">Free Shipping</option>
          </select>
        </div>

      </div>
    </div>
  );
};

export default ShippingForm;