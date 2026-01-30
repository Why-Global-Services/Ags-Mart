import React from 'react';
import { useProductForm } from '../context/FormContext';

const ShippingForm = () => {
  const { formData, errors, updateFormData } = useProductForm();

  console.log(formData);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (['length', 'width', 'height'].includes(name)) {
      updateFormData({
        shipping: {
          ...formData.shipping,
          dimension: {
            ...formData.shipping.dimension,
            [name]: value,
          },
        },
      });
    } else {
      updateFormData({
        shipping: {
          ...formData.shipping,
          [name]: value,
        },
      });
    }
  };

  return (
    <div className="col-span-2 space-y-2 bg-white shadow-lg rounded-lg p-6 w-full">
      <div className="mt-6">
        <h2 className="text-xl font-title mb-4">Shipping</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="productWeight" className="block text-sm font-medium text-gray-600 mb-2">
              Weight (kg) *
            </label>
            <input
              id="productWeight"
              type="number"
              name="productWeight"
              placeholder="0.0"
              className={`border rounded p-2 w-full ${errors.productWeight ? 'border-red-500' : ''}`}
              value={formData.shipping.productWeight || ''}
              onChange={handleInputChange}
              step="0.1"
              required
            />
            {errors.productWeight && <p className="text-red-500 text-sm mt-1">{errors.productWeight}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-2">Dimensions (mm)</label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Length</label>
                <input
                  id="length"
                  type="number"
                  name="length"
                  placeholder="Length"
                  className={`border rounded p-2 w-full ${errors.length ? 'border-red-500' : ''}`}
                  value={formData.shipping.dimension.length || ''}
                  onChange={handleInputChange}
                />
                {errors.length && <p className="text-red-500 text-xs mt-1">{errors.length}</p>}
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Width</label>
                <input
                  id="width"
                  type="number"
                  name="width"
                  placeholder="Width"
                  className={`border rounded p-2 w-full ${errors.width ? 'border-red-500' : ''}`}
                  value={formData.shipping.dimension.width || ''}
                  onChange={handleInputChange}
                />
                {errors.width && <p className="text-red-500 text-xs mt-1">{errors.width}</p>}
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Height</label>
                <input
                  id="height"
                  type="number"
                  name="height"
                  placeholder="Height"
                  className={`border rounded p-2 w-full ${errors.height ? 'border-red-500' : ''}`}
                  value={formData.shipping.dimension.height || ''}
                  onChange={handleInputChange}
                />
                {errors.height && <p className="text-red-500 text-xs mt-1">{errors.height}</p>}
              </div>
            </div>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="shippingClass" className="block text-sm font-medium text-gray-600 mb-2">
              Shipping Class
            </label>
            <select
              id="shippingClass"
              name="shippingClass"
              className="border rounded p-2 w-full"
              value={formData.shipping.shippingClass || ''}
              onChange={handleInputChange}
            >
              <option value="">No shipping class</option>
              <option value="standard">Standard</option>
              <option value="express">Express</option>
              <option value="Free Shipping">Free Shipping</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingForm;