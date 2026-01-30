import React, { useState, useEffect } from 'react';
import { IoMdClose } from 'react-icons/io';
import { useProductForm } from '../context/FormContext';
import { getAllActiveProducts } from '../../../../services/Products'; // Import your actual API

const LinkedProductsForm = () => {
  const { formData, updateFormData } = useProductForm();
  const [tagInput, setTagInput] = useState('');
  const [relatedProductSearch, setRelatedProductSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!formData.category_id) return;
      
      setLoading(true);
      try {
        const response = await getAllActiveProducts(formData.category_id);
        const formattedProducts = response.data.map(product => ({
          id: product._id,
          name: product.productName,
          image: product.productImages?.[0] || '',
          category: product.productCategory,
          subcategory: product.productSubCategory,
          price: product.nonVariant?.price?.costPrice || 
                product.variant?.sizeColorVariants?.[0]?.price?.costPrice ||
                product.variant?.colorOnlyVariants?.[0]?.price?.costPrice ||
                product.variant?.sizeOnlyVariants?.[0]?.price?.costPrice || 0,
          stock: product.nonVariant?.stockCount || 
                product.variant?.sizeColorVariants?.[0]?.stockCount ||
                product.variant?.colorOnlyVariants?.[0]?.stockCount ||
                product.variant?.sizeOnlyVariants?.[0]?.stockCount || 0
        }));
        setProducts(formattedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [formData.category_id]);

  // Search Tags Handlers
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.searchTags.includes(tagInput.trim())) {
      updateFormData({
        searchTags: [...formData.searchTags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    updateFormData({
      searchTags: formData.searchTags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Related Products Handlers
  const handleAddRelatedProduct = () => {
    if (relatedProductSearch && 
        !formData.linkProducts.relatedProducts.includes(relatedProductSearch)) {
      updateFormData({
        linkProducts: {
          ...formData.linkProducts,
          relatedProducts: [
            ...formData.linkProducts.relatedProducts,
            relatedProductSearch
          ]
        }
      });
      setRelatedProductSearch('');
    }
  };

  const handleRemoveRelatedProduct = (productId) => {
    updateFormData({
      linkProducts: {
        ...formData.linkProducts,
        relatedProducts: formData.linkProducts.relatedProducts.filter(
          id => id !== productId
        )
      }
    });
  };

  const getProductDetails = (productId) => {
    return products.find(p => p.id === productId) || {
      id: productId,
      name: `Product #${productId}`,
      image: '',
      category: 'Unknown',
      subcategory: 'Unknown',
      price: 0,
      stock: 0
    };
  };

  return (
    <div className="col-span-2 space-y-6 bg-white shadow-lg rounded-lg p-6 w-full">
      {/* Search Tags Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Search Tags</h2>
        <p className="text-sm text-gray-600 mb-4">
          Add keywords to help customers find this product
        </p>
        
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Enter a search tag..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={handleTagKeyPress}
            className="border rounded p-2 flex-grow"
          />
          <button
            onClick={handleAddTag}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300"
            disabled={!tagInput.trim()}
          >
            Add Tag
          </button>
        </div>
        
        {formData.searchTags.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Added Tags ({formData.searchTags.length}):
            </h3>
            <div className="flex flex-wrap gap-2">
              {formData.searchTags.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm"
                >
                  <span>{tag}</span>
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <IoMdClose size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Related Products Section */}
      <div className="border-t pt-6">
        <h2 className="text-xl font-semibold mb-4">Related Products</h2>
        <p className="text-sm text-gray-600 mb-4">
          Suggest products that complement this item
        </p>
        
        {loading ? (
          <p className="text-gray-500">Loading products...</p>
        ) : (
          <>
            <div className="flex items-center space-x-2">
              <select
                className="border rounded p-2 flex-grow"
                value={relatedProductSearch}
                onChange={(e) => setRelatedProductSearch(e.target.value)}
                disabled={products.length === 0}
              >
                <option value="">
                  {products.length === 0 ? 'No products available' : 'Select a product...'}
                </option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - ${product.price}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddRelatedProduct}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300"
                disabled={!relatedProductSearch}
              >
                Add
              </button>
            </div>
            
            {formData.linkProducts.relatedProducts.length > 0 && (
              <div className="mt-4 space-y-3">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Related Products ({formData.linkProducts.relatedProducts.length}):
                </h3>
                {formData.linkProducts.relatedProducts.map((productId) => {
                  const product = getProductDetails(productId);
                  return (
                    <div
                      key={product.id}
                      className="flex justify-between items-center p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        {product.image && (
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-12 h-12 object-cover rounded border"
                          />
                        )}
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500">
                            ${product.price} | {product.stock} in stock
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveRelatedProduct(product.id)}
                        className="text-red-500 hover:text-red-700 px-3 py-2 rounded"
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LinkedProductsForm;