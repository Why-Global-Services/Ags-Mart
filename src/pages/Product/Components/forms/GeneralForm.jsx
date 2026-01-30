import React from 'react';
import { useProductForm } from '../context/FormContext';

const GeneralForm = () => {
  const { formData, errors, updateFormData } = useProductForm();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    updateFormData({
      price: {
        ...formData.price,
        [name]: value,
      },
    });
  };

  return (
    <div className="col-span-2 space-y-2 bg-white shadow-lg rounded-lg p-6 w-full">
      <div className="mt-6">
        <h2 className="text-xl font-title mb-4">Pricing Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="regularPrice" className="block text-sm font-medium text-gray-600 mb-2">
              Regular Price ($) *
            </label>
            <input
              id="regularPrice"
              type="number"
              name="regularPrice"
              placeholder="Regular Price"
              min="0"
              step="0.01"
              className={`border rounded p-2 w-full ${errors.regularPrice ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              value={formData.price.regularPrice || ''}
              onChange={handleInputChange}
              required
            />
            {errors.regularPrice && <p className="text-red-500 text-sm mt-1">{errors.regularPrice}</p>}
          </div>
          <div>
            <label htmlFor="salePrice" className="block text-sm font-medium text-gray-600 mb-2">
              Sale Price ($)
            </label>
            <input
              id="salePrice"
              type="number"
              name="salePrice"
              placeholder="Sale Price"
              min="0"
              step="0.01"
              className={`border rounded p-2 w-full ${errors.salePrice ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              value={formData.price.salePrice || ''}
              onChange={handleInputChange}
            />
            {errors.salePrice && <p className="text-red-500 text-sm mt-1">{errors.salePrice}</p>}
          </div>
          <div>
            <label htmlFor="discount" className="block text-sm font-medium text-gray-600 mb-2">
              Discount (%)
            </label>
            <input
              id="discount"
              type="number"
              name="discount"
              placeholder="Discount"
              min="0"
              max="100"
              className={`border rounded p-2 w-full ${errors.discount ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              value={formData.price.discount || ''}
              onChange={handleInputChange}
            />
            {errors.discount && <p className="text-red-500 text-sm mt-1">{errors.discount}</p>}
          </div>
          <div>
            <label htmlFor="tax" className="block text-sm font-medium text-gray-600 mb-2">
              Tax (%)
            </label>
            <input
              id="tax"
              type="number"
              name="tax"
              placeholder="Tax"
              min="0"
              max="100"
              className={`border rounded p-2 w-full ${errors.tax ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              value={formData.price.tax || ''}
              onChange={handleInputChange}
            />
            {errors.tax && <p className="text-red-500 text-sm mt-1">{errors.tax}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralForm;