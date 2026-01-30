// import React from 'react';
// import { useProductForm } from '../context/FormContext';

// const InventoryForm = () => {
//   const { formData, errors, updateFormData } = useProductForm();

//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     updateFormData({
//       inventory: {
//         ...formData.inventory,
//         [name]: type === 'checkbox' ? checked : value,
//       },
//     });
//   };

//   return (
//     <div className="col-span-2 space-y-2 bg-white shadow-lg rounded-lg p-6 w-full">
//       <div className="mt-6">
//         <h2 className="text-xl font-title mb-4">Inventory</h2>
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <div className="sm:col-span-2">
//             <label htmlFor="sku" className="block text-sm font-medium text-gray-600 mb-2">
//               SKU *
//             </label>
//             <input
//               id="sku"
//               type="text"
//               name="sku"
//               placeholder="SKU"
//               className={`border rounded p-2 w-full ${errors.sku ? 'border-red-500' : ''}`}
//               value={formData.inventory.sku || ''}
//               onChange={handleInputChange}
//               required
//             />
//             {errors.sku && <p className="text-red-500 text-sm mt-1">{errors.sku}</p>}
//           </div>
//           <div className="sm:col-span-2">
//             <label htmlFor="gtin" className="block text-sm font-medium text-gray-600 mb-2">
//               GTIN, UPC, EAN, or ISBN
//             </label>
//             <input
//               id="gtin"
//               type="text"
//               name="gtin"
//               placeholder="GTIN/UPC/EAN/ISBN"
//               className={`border rounded p-2 w-full ${errors.gtin ? 'border-red-500' : ''}`}
//               value={formData.inventory.gtin || ''}
//               onChange={handleInputChange}
//             />
//             {errors.gtin && <p className="text-red-500 text-sm mt-1">{errors.gtin}</p>}
//           </div>
//           <div className="sm:col-span-2">
//             <label htmlFor="stockManagement" className="block text-sm font-medium text-gray-600 mb-2">
//               Stock Management
//             </label>
//             <select
//               id="stockManagement"
//               name="stockManagement"
//               className="border rounded p-2 w-full"
//               value={formData.inventory.stockManagement || 'automatic'}
//               onChange={handleInputChange}
//             >
//               <option value="automatic">Automatic</option>
//               <option value="manual">Manual</option>
//             </select>
//           </div>
//           <div className="sm:col-span-2">
//             <div className="flex items-center">
//               <input
//                 id="trackStock"
//                 type="checkbox"
//                 name="trackStock"
//                 className="mr-2"
//                 checked={formData.inventory.trackStock === 'inStock' || formData.inventory.trackStock === 'outOfStock' || formData.inventory.trackStock === 'onBackorder'}
//                 onChange={(e) =>
//                   updateFormData({
//                     inventory: {
//                       ...formData.inventory,
//                       trackStock: e.target.checked ? 'inStock' : '',
//                     },
//                   })
//                 }
//               />
//               <label htmlFor="trackStock" className="text-sm font-medium text-gray-600">
//                 Track stock quantity for this product
//               </label>
//             </div>
//           </div>
//           {(formData.inventory.trackStock === 'inStock' || formData.inventory.trackStock === 'outOfStock' || formData.inventory.trackStock === 'onBackorder') && (
//             <div className="sm:col-span-2">
//               <label className="block text-sm font-medium text-gray-600 mb-2">Stock Status *</label>
//               <div className="space-y-2">
//                 <div className="flex items-center">
//                   <input
//                     id="inStock"
//                     type="radio"
//                     name="trackStock"
//                     value="inStock"
//                     className="mr-2"
//                     checked={formData.inventory.trackStock === 'inStock'}
//                     onChange={handleInputChange}
//                   />
//                   <label htmlFor="inStock" className="text-sm text-gray-600">In stock</label>
//                 </div>
//                 <div className="flex items-center">
//                   <input
//                     id="outOfStock"
//                     type="radio"
//                     name="trackStock"
//                     value="outOfStock"
//                     className="mr-2"
//                     checked={formData.inventory.trackStock === 'outOfStock'}
//                     onChange={handleInputChange}
//                   />
//                   <label htmlFor="outOfStock" className="text-sm text-gray-600">Out of stock</label>
//                 </div>
//                 <div className="flex items-center">
//                   <input
//                     id="onBackorder"
//                     type="radio"
//                     name="trackStock"
//                     value="onBackorder"
//                     className="mr-2"
//                     checked={formData.inventory.trackStock === 'onBackorder'}
//                     onChange={handleInputChange}
//                   />
//                   <label htmlFor="onBackorder" className="text-sm text-gray-600">On backorder</label>
//                 </div>
//               </div>
//               {errors.trackStock && <p className="text-red-500 text-sm mt-1">{errors.trackStock}</p>}
//             </div>
//           )}
//           <div className="sm:col-span-2">
//             <label htmlFor="purchaseLimit" className="block text-sm font-medium text-gray-600 mb-2">
//               Purchase Limit
//             </label>
//             <input
//               id="purchaseLimit"
//               type="number"
//               name="purchaseLimit"
//               placeholder="Purchase Limit"
//               min="1"
//               className={`border rounded p-2 w-full ${errors.purchaseLimit ? 'border-red-500' : ''}`}
//               value={formData.inventory.purchaseLimit || ''}
//               onChange={handleInputChange}
//             />
//             {errors.purchaseLimit && <p className="text-red-500 text-sm mt-1">{errors.purchaseLimit}</p>}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default InventoryForm;


import React from 'react';
import { useProductForm } from '../context/FormContext';

const InventoryForm = () => {
  const { formData, errors, updateFormData } = useProductForm();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'trackStock' && type === 'checkbox') {
      // Set trackStock to 'inStock' when checked, undefined when unchecked
      updateFormData({
        inventory: {
          ...formData.inventory,
          trackStock: checked ? 'inStock' : undefined,
        },
      });
    } else if (name === 'purchaseLimit') {
      // Parse purchaseLimit as an integer, allow empty string
      updateFormData({
        inventory: {
          ...formData.inventory,
          purchaseLimit: value === '' ? '' : parseInt(value, 10),
        },
      });
    } else if (name === 'trackStock' && type === 'radio') {
      // Update trackStock with the selected radio value
      updateFormData({
        inventory: {
          ...formData.inventory,
          trackStock: value,
        },
      });
    } else {
      updateFormData({
        inventory: {
          ...formData.inventory,
          [name]: type === 'checkbox' ? checked : value,
        },
      });
    }
  };

  return (
    <div className="col-span-2 space-y-2 bg-white shadow-lg rounded-lg p-6 w-full">
      <div className="mt-6">
        <h2 className="text-xl font-title mb-4">Inventory</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label htmlFor="sku" className="block text-sm font-medium text-gray-600 mb-2">
              SKU *
            </label>
            <input

              id="sku"
              type="text"
              name="sku"
              placeholder="SKU"
              className={`border rounded p-2 w-full ${errors.sku ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              value={formData.inventory.sku || ''}
              onChange={handleInputChange}
              required
            />
            {errors.sku && <p className="text-red-500 text-sm mt-1">{errors.sku}</p>}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="gtin" className="block text-sm font-medium text-gray-600 mb-2">
              GTIN, UPC, EAN, or ISBN
            </label>
            <input
              id="gtin"
              type="text"
              name="gtin"
              placeholder="GTIN/UPC/EAN/ISBN"
              className={`border rounded p-2 w-full ${errors.gtin ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              value={formData.inventory.gtin || ''}
              onChange={handleInputChange}
            />
            {errors.gtin && <p className="text-red-500 text-sm mt-1">{errors.gtin}</p>}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="stockManagement" className="block text-sm font-medium text-gray-600 mb-2">
              Stock Management
            </label>
            <select
              id="stockManagement"
              name="stockManagement"
              className="border rounded p-2 w-full border-gray-300"
              value={formData.inventory.stockManagement || 'automatic'}
              onChange={handleInputChange}
            >
              <option value="automatic">Automatic</option>
              <option value="manual">Manual</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <div className="flex items-center">
              <input
                id="trackStock"
                type="checkbox"
                name="trackStock"
                className="mr-2 h-4 w-4"
                checked={!!formData.inventory.trackStock}
                onChange={handleInputChange}
              />
              <label htmlFor="trackStock" className="text-sm font-medium text-gray-600">
                Track stock quantity for this product
              </label>
            </div>
          </div>
          {formData.inventory.trackStock && (
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-2">Stock Status *</label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="inStock"
                    type="radio"
                    name="trackStock"
                    value="inStock"
                    className="mr-2 h-4 w-4"
                    checked={formData.inventory.trackStock === 'inStock'}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="inStock" className="text-sm text-gray-600">In stock</label>
                </div>
                <div className="flex items-center">
                  <input
                    id="outOfStock"
                    type="radio"
                    name="trackStock"
                    value="outOfStock"
                    className="mr-2 h-4 w-4"
                    checked={formData.inventory.trackStock === 'outOfStock'}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="outOfStock" className="text-sm text-gray-600">Out of stock</label>
                </div>
                <div className="flex items-center">
                  <input
                    id="onBackorder"
                    type="radio"
                    name="trackStock"
                    value="onBackorder"
                    className="mr-2 h-4 w-4"
                    checked={formData.inventory.trackStock === 'onBackorder'}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="onBackorder" className="text-sm text-gray-600">On backorder</label>
                </div>
              </div>
              {errors.trackStock && <p className="text-red-500 text-sm mt-1">{errors.trackStock}</p>}
            </div>
          )}
          <div className="sm:col-span-2">
            <label htmlFor="purchaseLimit" className="block text-sm font-medium text-gray-600 mb-2">
              Purchase Limit
            </label>
            <input
              id="purchaseLimit"
              type="number"
              name="purchaseLimit"
              placeholder="Purchase Limit"
              min="1"
              step="1"
              className={`border rounded p-2 w-full ${errors.purchaseLimit ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              value={formData.inventory.purchaseLimit || ''}
              onChange={handleInputChange}
            />
            {errors.purchaseLimit && <p className="text-red-500 text-sm mt-1">{errors.purchaseLimit}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryForm;