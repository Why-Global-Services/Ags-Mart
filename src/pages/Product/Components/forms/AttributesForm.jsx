import React, { useState } from 'react';
import { useProductForm } from '../context/FormContext';

const AttributesForm = () => {
  const { formData, errors, updateFormData } = useProductForm();
  const [newAttribute, setNewAttribute] = useState({
    name: '',
    values: '',
    visible: true
  });

  const handleAttributeChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAttribute(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addAttribute = () => {
    if (newAttribute.name && newAttribute.values) {
      const updatedAttributes = [
        ...formData.attributes,
        {
          name: newAttribute.name,
          values: newAttribute.values.split('|').map(v => v.trim()),
          visible: newAttribute.visible
        }
      ];
      
      updateFormData({
        attributes: updatedAttributes
      });
      
      setNewAttribute({
        name: '',
        values: '',
        visible: true
      });
    }
  };

  const removeAttribute = (index) => {
    const updatedAttributes = [...formData.attributes];
    updatedAttributes.splice(index, 1);
    updateFormData({
      attributes: updatedAttributes
    });
  };

  return (
    <div className="col-span-2 space-y-2 bg-white shadow-lg rounded-lg p-6 w-full">
      {errors.attributes && (
        <div className="text-red-500 text-sm mb-4">{errors.attributes}</div>
      )}
      
      <div className="mb-6">
        <h2 className="text-xl font-title mb-4">Attributes</h2>
        <div className="space-y-4">
          {formData.attributes.map((attr, index) => (
            <div key={index} className=" p-4 ">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">{attr.name}: {attr.values.join(', ')}</h3>
                <button 
                  onClick={() => removeAttribute(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={attr.visible}
                  readOnly
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">
                  {attr.visible ? 'Visible on product page' : 'Hidden'}
                </span>
              </div>
            </div>
          ))}

          <div className="p-4 border rounded-lg">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                name="name"
                value={newAttribute.name}
                onChange={handleAttributeChange}
                placeholder="e.g. Color or Size"
                className="border rounded p-2 w-full"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Value(s) *</label>
              <input
                type="text"
                name="values"
                value={newAttribute.values}
                onChange={handleAttributeChange}
                placeholder='Separate multiple values with "|" (e.g. Red|Blue|Green)'
                className="border rounded p-2 w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Use the pipe character (|) to separate values</p>
            </div>

            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                name="visible"
                checked={newAttribute.visible}
                onChange={handleAttributeChange}
                className="mr-2"
                id="attribute-visible"
              />
              <label htmlFor="attribute-visible" className="text-sm text-gray-700">
                Visible on the product page
              </label>
            </div>

            <button
              type="button"
              onClick={addAttribute}
              className="bg-primary text-white px-4 py-2 rounded"
              disabled={!newAttribute.name || !newAttribute.values}
            >
              Add Attribute
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttributesForm;