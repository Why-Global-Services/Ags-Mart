/**
 * Process product data for display and selection
 * 
 * @param {Array} products - Raw products data from API
 * @returns {Array} - Processed products ready for display
 */
export const processProductData = (products) => {
    const checkedIds = [];
    
    const processed = products.flatMap(product => {
      if (product.checked) checkedIds.push(product._id);
   
      // Handle variation products with variants
      if (product.productType === "variation" && product.varient.length > 0) {
        return product.varient.map(variant => ({
          ...product,
          _id: `${product._id}-${variant.skuCode || variant.productVolumes.join('-')}`,
          originalId: product._id, // Store original ID for API calls
          name: variant.productName || "Unnamed Product",
          title: variant.productTitle || "",
          brand: variant.productBrand || "",
          price: variant.price || "0",
          stock: variant.stockCount || "0",
          category: variant.productCategory || product.category,
          subCategory: variant.productSubCategory || product.subCategory,
          productImages: variant.varientImage ? [variant.varientImage] : product.productImage,
          status: "active",
          productType: product.productType,
          regularPrice: product.price?.regularPrice,
          salePrice: variant.price || product.price?.salePrice,
          discount: product.price?.discount,
          variantDetails: variant,
          checked: product.checked // Carry over the checked status
        }));
      }
      
      // Handle non-variation products
      if (product.nonVarient.length > 0) {
        const mainProduct = product.nonVarient[0];
        return {
          ...product,
          _id: product._id,
          originalId: product._id,
          name: mainProduct.productName || "Unnamed Product",
          title: mainProduct.productTitle || "",
          brand: mainProduct.productBrand || "",
          price: mainProduct.price || product.price?.salePrice || "0",
          stock: mainProduct.stockCount || "0",
          category: product.categoryDetails?.categoryTitle || product.category,
          subCategory: product.subCategoryDetails?.subCategoryTitle || product.subCategory,
          productImages: product.productImage,
          status: "active",
          productType: product.productType,
          regularPrice: product.price?.regularPrice,
          salePrice: mainProduct.price || product.price?.salePrice,
          discount: product.price?.discount,
          checked: product.checked
        };
      }
  
      // Fallback for other product types
      return {
        ...product,
        _id: product._id,
        originalId: product._id,
        name: "Unnamed Product",
        title: "",
        brand: "",
        price: product.price?.salePrice || "0",
        stock: "0",
        category: product.category,
        subCategory: product.subCategory,
        productImages: product.productImage,
        status: "active",
        productType: product.productType,
        regularPrice: product.price?.regularPrice,
        salePrice: product.price?.salePrice,
        discount: product.price?.discount,
        checked: product.checked
      };
    });
  
    return { processed, checkedIds };
  };
  
  /**
   * Filter products based on search query and category filters
   * 
   * @param {Array} products - Processed products array
   * @param {String} searchQuery - Text to search for
   * @param {String} selectedCategory - Selected category ID
   * @param {String} selectedSubCategory - Selected subcategory ID
   * @returns {Array} - Filtered products
   */
  export const filterProducts = (products, searchQuery, selectedCategory, selectedSubCategory) => {
    return products.filter(product => {
      const matchesSearch = 
        (product.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
        (product.title?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory 
        ? product.category === selectedCategory 
        : true;
      
      const matchesSubCategory = selectedSubCategory
        ? product.subCategory === selectedSubCategory
        : true;
      
      return matchesSearch && matchesCategory && matchesSubCategory;
    });
  };
  
  /**
   * Extract original product IDs from composite IDs (for variants)
   * 
   * @param {Array} compositeIds - IDs that might contain variant suffixes
   * @returns {Array} - Original product IDs
   */
  export const getOriginalProductIds = (compositeIds) => {
    return compositeIds.map(compositeId => {
      const [originalId] = compositeId.split('-');
      return originalId;
    });
  };