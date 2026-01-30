// import React, { useEffect, useState, useMemo, useCallback } from "react";
// import DataTable from "react-data-table-component";
// import { useNavigate, useParams } from "react-router-dom";
// import { FaArrowLeft, FaSearch, FaEye } from "react-icons/fa";
// import { Checkbox } from "antd";
// import { toast } from "react-toastify";
// import {
//   getAllCategories,
//   getSubCategoriesByCategory,
// } from "../../services/Offer";
// import ReusableModal from "../../components/ReusableModal";
// import { assignProductsToFeature, getAllProductsFeaturedSection, updateProductsToFeature } from "../../services/FeaturedSection";

// const FeatuuredAssignProducts = () => {
//   const navigate = useNavigate();
//   const { id } = useParams();
//   const [products, setProducts] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [categories, setCategories] = useState([]);
//   const [subCategories, setSubCategories] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState("");
//   const [selectedSubCategory, setSelectedSubCategory] = useState("");
//   const [selectedProductIds, setSelectedProductIds] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [selectedProductDetails, setSelectedProductDetails] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [hasPreSelectedProducts, setHasPreSelectedProducts] = useState(false);
//   const [selectAll, setSelectAll] = useState(false);

//   const processProductData = useCallback((products) => {
//     let hasCheckedProducts = false;

//     const processedProducts = products.flatMap(product => {
//       if (product.checked) {
//         hasCheckedProducts = true;
//       }

//       if (product.productType === "variation" && product.varient.length > 0) {
//         return product.varient.map(variant => ({
//           ...product,
//           _id: `${product._id}-${variant.skuCode || variant.productVolumes.join('-')}`,
//           originalId: product._id, // Store the original product ID
//           name: variant.productName || "Unnamed Product",
//           title: variant.productTitle || "",
//           brand: variant.productBrand || "",
//           price: variant.price || "0",
//           stock: variant.stockCount || "0",
//           category: variant.productCategory || product.category,
//           subCategory: variant.productSubCategory || product.subCategory,
//           productImages: variant.varientImage ? [variant.varientImage] : product.productImage,
//           status: "active",
//           productType: product.productType,
//           regularPrice: product.price?.regularPrice,
//           salePrice: variant.price || product.price?.salePrice,
//           discount: product.price?.discount,
//           variantDetails: variant,
//           checked: product.checked || false
//         }));
//       }

//       if (product.nonVarient.length > 0) {
//         const mainProduct = product.nonVarient[0];
//         return {
//           ...product,
//           _id: product._id,
//           originalId: product._id, // Store the original product ID
//           name: mainProduct.productName || "Unnamed Product",
//           title: mainProduct.productTitle || "",
//           brand: mainProduct.productBrand || "",
//           price: mainProduct.price || product.price?.salePrice || "0",
//           stock: mainProduct.stockCount || "0",
//           category: product.categoryDetails?.categoryTitle || product.category,
//           subCategory: product.subCategoryDetails?.subCategoryTitle || product.subCategory,
//           productImages: product.productImage,
//           status: "active",
//           productType: product.productType,
//           regularPrice: product.price?.regularPrice,
//           salePrice: mainProduct.price || product.price?.salePrice,
//           discount: product.price?.discount,
//           checked: product.checked || false
//         };
//       }

//       return {
//         ...product,
//         _id: product._id,
//         originalId: product._id, // Store the original product ID
//         name: "Unnamed Product",
//         title: "",
//         brand: "",
//         price: product.price?.salePrice || "0",
//         stock: "0",
//         category: product.category,
//         subCategory: product.subCategory,
//         productImages: product.productImage,
//         status: "active",
//         productType: product.productType,
//         regularPrice: product.price?.regularPrice,
//         salePrice: product.price?.salePrice,
//         discount: product.price?.discount,
//         checked: product.checked || false
//       };
//     });

//     setHasPreSelectedProducts(hasCheckedProducts);
//     return processedProducts;
//   }, []);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setIsLoading(true);
//         const catResponse = await getAllCategories();
//         const activeCategories = catResponse.data.filter(cat => cat.status === "active");
//         setCategories(activeCategories);

//         const productsResponse = await getAllProductsFeaturedSection(id);
//         const processedProducts = processProductData(productsResponse.data);
//         setProducts(processedProducts);

//         // Set initially checked products
//         const checkedProductIds = processedProducts
//           .filter(product => product.checked)
//           .map(product => product.originalId); // Use originalId here
//         setSelectedProductIds(checkedProductIds);
//       } catch (error) {
//         toast.error("Failed to load data");
//         console.error("Error fetching data:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//   }, [id, processProductData]);

//   const handleCategoryChange = useCallback((e) => {
//     const categoryId = e.target.value;
//     setSelectedCategory(categoryId);
//     setSelectedSubCategory("");
//   }, []);

//   useEffect(() => {
//     const fetchSubCategories = async () => {
//       if (!selectedCategory) {
//         setSubCategories([]);
//         return;
//       }

//       try {
//         const subCatResponse = await getSubCategoriesByCategory(selectedCategory);
//         setSubCategories(subCatResponse);
//       } catch (error) {
//         toast.error("Failed to load subcategories");
//         console.error("Error fetching subcategories:", error);
//         setSubCategories([]);
//       }
//     };

//     fetchSubCategories();
//   }, [selectedCategory]);

//   const filteredProducts = useMemo(() => {
//     return products.filter(product => {
//       const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                           product.title.toLowerCase().includes(searchQuery.toLowerCase());
//       const matchesCategory = selectedCategory
//         ? product.category === selectedCategory
//         : true;
//       const matchesSubCategory = selectedSubCategory
//         ? product.subCategory === selectedSubCategory
//         : true;

//       return matchesSearch && matchesCategory && matchesSubCategory;
//     });
//   }, [products, searchQuery, selectedCategory, selectedSubCategory]);

//   const handleCheckboxChange = useCallback((productId, originalId, isChecked) => {
//     setSelectedProductIds(prevIds => {
//       if (isChecked) {
//         // When selecting a single row, ensure selectAll is false
//         setSelectAll(false);
//         return [...prevIds, originalId];
//       } else {
//         return prevIds.filter(id => id !== originalId);
//       }
//     });
//   }, []);

//   const showProductDetails = useCallback((product) => {
//     setSelectedProductDetails(product);
//     setIsModalOpen(true);
//   }, []);

//   const handleAssignSubmit = async () => {
//     if (selectedProductIds.length === 0) {
//       toast.error("Please select at least one product");
//       return;
//     }

//     try {
//       // Remove duplicates in case variants of the same product were selected
//       const uniqueProductIds = [...new Set(selectedProductIds)];

//       let response;

//       if (hasPreSelectedProducts) {
//         response = await updateProductsToFeature(id, uniqueProductIds);
//       } else {
//         response = await assignProductsToFeature(id, uniqueProductIds);
//       }
//       console.log(response,'responcedsdhsujdshduhuh');

//       if (response) {
//         toast.success("Products assigned successfully!");
//         navigate(`/featuredproducts/featuredDetails/${id}`);
//       } else {
//         toast.error(response?.message || "Failed to assign products");
//       }
//     } catch (error) {
//       toast.error("An error occurred while assigning products");
//       console.error("Assignment error:", error);
//     }
//   };

//   const handleSelectAllChange = useCallback(() => {
//     if (selectAll) {

//       setSelectedProductIds([]);
//     } else {
//       // Select all filtered products (using originalId)
//       const allIds = [...new Set(filteredProducts.map(product => product.originalId))];
//       setSelectedProductIds(allIds);
//     }
//     setSelectAll(!selectAll);
//   }, [selectAll, filteredProducts]);

//   useEffect(() => {
//     // Update selectAll state based on selected products
//     if (filteredProducts.length > 0) {
//       const allOriginalIds = [...new Set(filteredProducts.map(p => p.originalId))];
//       const allSelected = allOriginalIds.every(id =>
//         selectedProductIds.includes(id)
//       );
//       setSelectAll(allSelected);
//     }
//   }, [selectedProductIds, filteredProducts]);

//   const productColumns = useMemo(() => [
//     {
//       name:<>  <Checkbox
//       checked={selectAll}
//       indeterminate={
//         selectedProductIds.length > 0 &&
//         selectedProductIds.length < [...new Set(filteredProducts.map(p => p.originalId))].length
//       }
//       onChange={handleSelectAllChange}
//     />
//     <div className="ml-3">Select</div>
//     </>,
//       width: "100px",
//       cell: (row) => (
//         <Checkbox
//           checked={selectedProductIds.includes(row.originalId)}
//           onChange={(e) => handleCheckboxChange(row._id, row.originalId, e.target.checked)}
//         />
//       ),
//     },
//     {
//       name: "Product Name",
//       width: "200px",
//       cell: (row) => (
//         <div className="flex items-center space-x-3">
//           {row.productImages?.[0] && (
//             <img
//               src={row.productImages[0]}
//               alt={row.name}
//               className="w-12 h-12 object-cover rounded-md shadow-sm"
//             />
//           )}
//           <div>
//             <p className="text-gray-700 font-medium">{row.name}</p>
//           </div>
//         </div>
//       ),
//     },
//     {
//       name: "Title",
//       selector: (row) => row.title || "-",
//       width: "230px",
//     },
//     {
//       name: "Category",
//       selector: (row) => row.category || "-",
//       width: "180px",
//     },
//     {
//       name: "Subcategory",
//       selector: (row) => row.subCategory || "-",
//       width: "180px",
//     },
//     {
//       name: "Stock",
//       selector: (row) => row.stock || "0",
//       width: "100px",
//       sortable: true
//     },
//     {
//       name: "Price",
//       cell: (row) => (
//         <div>
//           <span className="text-gray-900 font-medium">${row.salePrice || "0"}</span>
//           {row.regularPrice && row.regularPrice !== row.salePrice && (
//             <span className="ml-2 text-sm text-gray-500 line-through">
//               ${row.regularPrice}
//             </span>
//           )}
//         </div>
//       ),
//       width: "150px"
//     },
//     {
//       name: "Discount",
//       selector: (row) => row.discount ? `${row.discount}%` : "-",
//       width: "100px",
//     },
//     {
//       name: "Actions",
//       width: "100px",
//       cell: (row) => (
//         <button
//           onClick={(e) => {
//             e.stopPropagation();
//             showProductDetails(row);
//           }}
//           className="text-gray-800 hover:text-pink-800"
//         >
//           <FaEye size={18} />
//         </button>
//       ),
//     },
//   ], [selectedProductIds, handleCheckboxChange, selectAll, handleSelectAllChange, showProductDetails, filteredProducts]);

//   const customStyles = useMemo(() => ({
//     headCells: {
//       style: {
//         backgroundColor: "#FF8096",
//         color: "#fff",
//         fontWeight: "bold",
//         padding: "12px 16px",
//       },
//     },
//     cells: {
//       style: { padding: "8px 12px" },
//     },
//   }), []);

//   const productModalFields = useMemo(() => [
//     { key: "name", label: "Product Name" },
//     { key: "title", label: "Title" },
//     { key: "brand", label: "Brand" },
//     {
//       key: "category",
//       label: "Category",
//       format: (value) => categories.find(c => c._id === value)?.categoryTitle || "-"
//     },
//     {
//       key: "subCategory",
//       label: "Subcategory",
//       format: (value) => subCategories.find(s => s._id === value)?.subCategoryTitle || "-"
//     },
//     {
//       key: "productType",
//       label: "Product Type",
//       format: (value) => value === "variation" ? "Variant Product" : "Standard Product"
//     },
//     {
//       key: "variantDetails",
//       label: "Variant Info",
//       showIf: (data) => data.productType === "variation",
//       format: (variant) => (
//         <div className="space-y-1">
//           <div><span className="font-medium">Size:</span> {variant.varientValue}</div>
//           <div><span className="font-medium">Unit:</span> {variant.productUnit}</div>
//           <div><span className="font-medium">Volumes:</span> {variant.productVolumes?.join(', ') || '-'}</div>
//           <div><span className="font-medium">SKU:</span> {variant.skuCode || '-'}</div>
//         </div>
//       )
//     },
//     { key: "stock", label: "Stock" },
//     {
//       key: "salePrice",
//       label: "Price",
//       format: (value, row) => (
//         <>
//           <span className="text-gray-900 font-medium">${value || "0"}</span>
//           {row.regularPrice && row.regularPrice !== value && (
//             <span className="ml-2 text-sm text-gray-500 line-through">
//               ${row.regularPrice}
//             </span>
//           )}
//         </>
//       )
//     },
//     { key: "discount", label: "Discount", type: "percentage" },
//     {
//       key: "ingredients",
//       label: "Ingredients",
//       format: (value) => value?.join(', ') || '-'
//     },
//   ], [categories, subCategories]);

//   return (
//     <div className="bg-gray-100 min-h-screen p-6">
//       <button
//         onClick={() => navigate(`/featuredproducts/featuredDetails/${id}`)}
//         className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4"
//       >
//         <FaArrowLeft /> <span>Back to Feature</span>
//       </button>

//       <div className="bg-white rounded-lg shadow-md p-6">
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
//           <h1 className="text-2xl font-semibold text-gray-800 mb-4 md:mb-0">
//             {hasPreSelectedProducts ? "Update Products in Feature " : "Assign Products to Feature"}
//           </h1>

//           <div className="relative w-full md:w-1/3">
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <FaSearch className="text-gray-400" />
//             </div>
//             <input
//               type="text"
//               placeholder="Search products..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
//             />
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//           <div>
//             <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
//               Category
//             </label>
//             <select
//               id="category"
//               className="border-gray-300 w-[50%] py-2 px-4 rounded-md shadow-sm focus:border-pink-500 focus:ring-pink-500"
//               value={selectedCategory}
//               onChange={handleCategoryChange}
//             >
//               <option value="">All Categories</option>
//               {categories.map((cat) => (
//                 <option key={cat._id} value={cat._id}>
//                   {cat.categoryTitle}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-1">
//               Subcategory
//             </label>
//             <select
//               id="subcategory"
//               className="w-[50%] border-gray-300 py-2 px-4 rounded-md shadow-sm focus:border-pink-500 focus:ring-pink-500 disabled:opacity-50"
//               value={selectedSubCategory}
//               onChange={(e) => setSelectedSubCategory(e.target.value)}
//               disabled={!selectedCategory}
//             >
//               <option value="">All Subcategories</option>
//               {subCategories.map((sub) => (
//                 <option key={sub._id} value={sub._id}>
//                   {sub.subCategoryTitle}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {isLoading ? (
//           <div className="flex justify-center items-center h-64">
//             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
//           </div>
//         ) : (
//           <>
//             <div className="overflow-x-auto">
//               <DataTable
//                 columns={productColumns}
//                 data={filteredProducts}
//                 customStyles={customStyles}
//                 pagination
//                 paginationPerPage={10}
//                 paginationRowsPerPageOptions={[10, 20, 30]}
//                 highlightOnHover
//                 pointerOnHover
//                 noDataComponent={
//                   <div className="py-8 text-center text-gray-500">
//                     No products found matching your criteria
//                   </div>
//                 }
//               />
//             </div>

//             <div className="flex justify-end mt-6">
//               <button
//                 onClick={handleAssignSubmit}
//                 disabled={isLoading || selectedProductIds.length === 0}
//                 className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
//                   selectedProductIds.length === 0 ? "bg-gray-400" : "bg-pink-600 hover:bg-pink-700"
//                 } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500`}
//               >
//                 {hasPreSelectedProducts ? "Update" : "Assign"} Selected Products ({selectedProductIds.length})
//               </button>
//             </div>
//           </>
//         )}
//       </div>

//       <ReusableModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         title="Product Details"
//         data={selectedProductDetails}
//         fields={productModalFields}
//         imageConfig={{
//           show: true,
//           path: "productImages[0]",
//           alt: "name",
//           fallback: "/placeholder-product.png"
//         }}
//       />
//     </div>
//   );
// };

// export default FeatuuredAssignProducts;

import React, { useEffect, useState, useMemo, useCallback } from "react";
import DataTable from "react-data-table-component";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaSearch, FaEye } from "react-icons/fa";
import { Checkbox } from "antd";
import { toast } from "react-toastify";
import {
  getAllCategories,
  getSubCategoriesByCategory,
} from "../../services/Offer";
import ReusableModal from "../../components/ReusableModal";
import {
  assignProductsToFeature,
  getAllProductsFeaturedSection,
  updateProductsToFeature,
} from "../../services/FeaturedSection";

const FeatuuredAssignProducts = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasPreSelectedProducts, setHasPreSelectedProducts] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  const processProductData = useCallback((products) => {
    let hasCheckedProducts = false;

    const processedProducts = products.map((product) => {
      if (product.checked) {
        hasCheckedProducts = true;
      }

      let stock = 0;
      let salePrice = "0";
      let regularPrice = "0";
      let discount = "0";

      if (product.productType === "variation" && product.varient?.length > 0) {
        // Aggregate stock from all variants
        stock = product.varient.reduce(
          (sum, variant) => sum + (parseInt(variant.stockCount, 10) || 0),
          0
        );
        // Use the first variant's price as representative (or calculate min/max if preferred)
        const firstVariant = product.varient[0];
        salePrice = firstVariant.price?.salePrice || firstVariant.price?.regularPrice || "0";
        regularPrice = firstVariant.price?.regularPrice || "0";
        discount = firstVariant.price?.discount || "0";
      } else if (product.productType === "nonVariation" && product.nonVarient?.length > 0) {
        const nonVariant = product.nonVarient[0];
        stock = parseInt(nonVariant.stockCount, 10) || 0;
        salePrice = nonVariant.price?.salePrice || nonVariant.price?.regularPrice || "0";
        regularPrice = nonVariant.price?.regularPrice || "0";
        discount = nonVariant.price?.discount || "0";
      }

      return {
        _id: product._id,
        name: product.productName || "Unnamed Product",
        brand: product.productBrand || "",
        category: product.productCategory || "",
        subCategory: product.productSubCategory || "",
        productImages: product.productImage || [],
        status: product.status || "active",
        productType: product.productType,
        stock: stock.toString(),
        salePrice,
        regularPrice,
        discount,
        checked: product.checked || false,
        variants: product.productType === "variation" ? product.varient : [],
        nonVariant: product.productType === "nonVariation" ? product.nonVarient?.[0] : null,
        ingredients: product.ingredients || [],
      };
    });

    setHasPreSelectedProducts(hasCheckedProducts);
    return processedProducts;
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const catResponse = await getAllCategories();
        const activeCategories = catResponse.data.filter(
          (cat) => cat.status === "active"
        );
        setCategories(activeCategories);

        const productsResponse = await getAllProductsFeaturedSection(id);
        const processedProducts = processProductData(productsResponse.data);
        setProducts(processedProducts);

        const checkedProductIds = processedProducts
          .filter((product) => product.checked)
          .map((product) => product._id);
        setSelectedProductIds(checkedProductIds);
      } catch (error) {
        toast.error("Failed to load data");
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, processProductData]);

  const handleCategoryChange = useCallback((e) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);
    setSelectedSubCategory("");
    setSubCategories([]);
  }, []);

  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!selectedCategory) {
        setSubCategories([]);
        return;
      }

      try {
        const subCatResponse = await getSubCategoriesByCategory(selectedCategory);
        const activeSubCategories = subCatResponse?.filter(
          (sub) => sub.status === "active"
        ) || [];
        setSubCategories(activeSubCategories);
      } catch (error) {
        toast.error("Failed to load subcategories");
        console.error("Error fetching subcategories:", error);
        setSubCategories([]);
      }
    };

    fetchSubCategories();
  }, [selectedCategory]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const categoryObj = categories.find(
        (cat) => cat.categoryTitle === product.category
      );
      const matchesCategory = selectedCategory
        ? categoryObj && categoryObj._id === selectedCategory
        : true;

      const subCategoryObj = subCategories.find(
        (sub) => sub.subCategoryTitle === product.subCategory
      );
      const matchesSubCategory = selectedSubCategory
        ? subCategoryObj && subCategoryObj._id === selectedSubCategory
        : true;

      return matchesSearch && matchesCategory && matchesSubCategory;
    });
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedSubCategory,
    categories,
    subCategories,
  ]);

  const handleCheckboxChange = useCallback((productId, isChecked) => {
    setSelectedProductIds((prevIds) => {
      if (isChecked) {
        setSelectAll(false);
        return [...prevIds, productId];
      } else {
        return prevIds.filter((id) => id !== productId);
      }
    });
  }, []);

  const showProductDetails = useCallback((product) => {
    setSelectedProductDetails(product);
    setIsModalOpen(true);
  }, []);

  const handleAssignSubmit = async () => {
    if (selectedProductIds.length === 0) {
      toast.error("Please select at least one product");
      return;
    }

    try {
      const uniqueProductIds = [...new Set(selectedProductIds)];
      let response;

      if (hasPreSelectedProducts) {
        response = await updateProductsToFeature(id, uniqueProductIds);
      } else {
        response = await assignProductsToFeature(id, uniqueProductIds);
      }

      if (response) {
        toast.success("Products assigned successfully!");
        navigate(`/featuredproducts/featuredDetails/${id}`);
      } else {
        toast.error(response?.message || "Failed to assign products");
      }
    } catch (error) {
      toast.error("An error occurred while assigning products");
      console.error("Assignment error:", error);
    }
  };

  const handleSelectAllChange = useCallback(() => {
    if (selectAll) {
      setSelectedProductIds([]);
    } else {
      const allIds = filteredProducts.map((product) => product._id);
      setSelectedProductIds(allIds);
    }
    setSelectAll(!selectAll);
  }, [selectAll, filteredProducts]);

  useEffect(() => {
    if (filteredProducts.length > 0) {
      const allSelected = filteredProducts.every((product) =>
        selectedProductIds.includes(product._id)
      );
      setSelectAll(allSelected);
    }
  }, [selectedProductIds, filteredProducts]);

  const productColumns = useMemo(
    () => [
      {
        name: (
          <>
            <Checkbox
              checked={selectAll}
              indeterminate={
                selectedProductIds.length > 0 &&
                selectedProductIds.length < filteredProducts.length
              }
              onChange={handleSelectAllChange}
            />
            <div className="ml-3">Select</div>
          </>
        ),
        width: "100px",
        cell: (row) => (
          <Checkbox
            checked={selectedProductIds.includes(row._id)}
            onChange={(e) => handleCheckboxChange(row._id, e.target.checked)}
          />
        ),
      },
      {
        name: "Product Name",
        width: "200px",
        cell: (row) => (
          <div className="flex items-center space-x-3">
            {row.productImages?.[0] && (
              <img
                src={row.productImages[0]}
                alt={row.name}
                className="w-12 h-12 object-cover rounded-md shadow-sm"
              />
            )}
            <div>
              <p className="text-gray-700 font-medium">{row.name}</p>
            </div>
          </div>
        ),
      },
      {
        name: "Category",
        selector: (row) => row.category || "-",
        width: "180px",
      },
      {
        name: "Subcategory",
        selector: (row) => row.subCategory || "-",
        width: "180px",
      },
      {
        name: "Stock",
        selector: (row) => row.stock || "0",
        width: "100px",
        sortable: true,
      },
      {
        name: "Price",
        cell: (row) => (
          <div>
            <span className="text-gray-900 font-medium">${row.salePrice || "0"}</span>
            {row.regularPrice && row.regularPrice !== row.salePrice && (
              <span className="ml-2 text-sm text-gray-500 line-through">
                ${row.regularPrice}
              </span>
            )}
          </div>
        ),
        width: "150px",
      },
      {
        name: "Discount",
        selector: (row) => (row.discount ? `${row.discount}%` : "-"),
        width: "100px",
      },
      {
        name: "Actions",
        width: "100px",
        cell: (row) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              showProductDetails(row);
            }}
            className="text-gray-800 hover:text-pink-800"
          >
            <FaEye size={18} />
          </button>
        ),
      },
    ],
    [
      selectedProductIds,
      handleCheckboxChange,
      selectAll,
      handleSelectAllChange,
      showProductDetails,
      filteredProducts,
    ]
  );

  const customStyles = useMemo(
    () => ({
      headCells: {
        style: {
          backgroundColor: "#FF8096",
          color: "#fff",
          fontWeight: "bold",
          padding: "12px 16px",
        },
      },
      cells: {
        style: { padding: "8px 12px" },
      },
    }),
    []
  );

  const productModalFields = useMemo(
    () => [
      { key: "name", label: "Product Name" },
      { key: "brand", label: "Brand" },
      {
        key: "category",
        label: "Category",
        format: (value) =>
          categories.find((c) => c.categoryTitle === value)?.categoryTitle || "-",
      },
      {
        key: "subCategory",
        label: "Subcategory",
        format: (value) =>
          subCategories.find((s) => s.subCategoryTitle === value)?.subCategoryTitle ||
          "-",
      },
      {
        key: "productType",
        label: "Product Type",
        format: (value) => (value === "variation" ? "Variant Product" : "Standard Product"),
      },
      {
        key: "variants",
        label: "Variant Info",
        showIf: (data) => data.productType === "variation",
        format: (variants) =>
          variants?.length > 0 ? (
            <div className="space-y-2">
              {variants.map((variant, index) => (
                <div key={index} className="space-y-1">
                  <div>
                    <span className="font-medium">Variant {index + 1}:</span>{" "}
                    {variant.productTitle || "-"}
                  </div>
                  <div>
                    <span className="font-medium">Size:</span> {variant.varientValue || "-"}
                  </div>
                  <div>
                    <span className="font-medium">Unit:</span> {variant.productUnit || "-"}
                  </div>
                  <div>
                    <span className="font-medium">Volumes:</span>{" "}
                    {variant.productVolumes?.join(", ") || "-"}
                  </div>
                  <div>
                    <span className="font-medium">SKU:</span> {variant.skuCode || "-"}
                  </div>
                  <div>
                    <span className="font-medium">Stock:</span> {variant.stockCount || "0"}
                  </div>
                  <div>
                    <span className="font-medium">Price:</span>{" "}
                    <span className="text-gray-900 font-medium">
                      ${variant.price?.salePrice || variant.price?.regularPrice || "0"}
                    </span>
                    {variant.price?.regularPrice &&
                      variant.price?.regularPrice !== variant.price?.salePrice && (
                        <span className="ml-2 text-sm text-gray-500 line-through">
                          ${variant.price?.regularPrice}
                        </span>
                      )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            "-"
          ),
      },
      {
        key: "nonVariant",
        label: "Product Info",
        showIf: (data) => data.productType === "nonVariation",
        format: (nonVariant) =>
          nonVariant ? (
            <div className="space-y-1">
              <div>
                <span className="font-medium">Title:</span>{" "}
                {nonVariant.productTitle || "-"}
              </div>
              <div>
                <span className="font-medium">Stock:</span>{" "}
                {nonVariant.stockCount || "0"}
              </div>
              <div>
                <span className="font-medium">Price:</span>{" "}
                <span className="text-gray-900 font-medium">
                  ${nonVariant.price?.salePrice || nonVariant.price?.regularPrice || "0"}
                </span>
                {nonVariant.price?.regularPrice &&
                  nonVariant.price?.regularPrice !== nonVariant.price?.salePrice && (
                    <span className="ml-2 text-sm text-gray-500 line-through">
                      ${nonVariant.price?.regularPrice}
                    </span>
                  )}
              </div>
            </div>
          ) : (
            "-"
          ),
      },
      { key: "stock", label: "Total Stock" },
      {
        key: "salePrice",
        label: "Price",
        format: (value, row) => (
          <div>
            <span className="text-gray-900 font-medium">${value || "0"}</span>
            {row.regularPrice && row.regularPrice !== value && (
              <span className="ml-2 text-sm text-gray-500 line-through">
                ${row.regularPrice}
              </span>
            )}
          </div>
        ),
      },
      { key: "discount", label: "Discount", type: "percentage" },
      {
        key: "ingredients",
        label: "Ingredients",
        format: (value) => value?.join(", ") || "-",
      },
    ],
    [categories, subCategories]
  );

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <button
        onClick={() => navigate(`/featuredproducts/featuredDetails/${id}`)}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4"
      >
        <FaArrowLeft /> <span>Back to Feature</span>
      </button>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4 md:mb-0  ">
            {hasPreSelectedProducts
              ? "Update Products in Feature"
              : "Assign Products to Feature"}
          </h1>

          <div className="relative w-full md:w-1/3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Category
            </label>
            <select
              id="category"
              className="border-gray-300 w-[50%] py-2 px-4 rounded-md shadow-sm focus:border-pink-500 focus:ring-pink-500"
              value={selectedCategory}
              onChange={handleCategoryChange}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.categoryTitle}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="subcategory"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Subcategory
            </label>
            <select
              id="subcategory"
              className="w-[50%] border-gray-300 py-2 px-4 rounded-md shadow-sm focus:border-pink-500 focus:ring-pink-500 disabled:opacity-50"
              value={selectedSubCategory}
              onChange={(e) => setSelectedSubCategory(e.target.value)}
              disabled={!selectedCategory}
            >
              <option value="">All Subcategories</option>
              {subCategories.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.subCategoryTitle}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <DataTable
                columns={productColumns}
                data={filteredProducts}
                customStyles={customStyles}
                pagination
                paginationPerPage={10}
                paginationRowsPerPageOptions={[10, 20, 30]}
                highlightOnHover
                pointerOnHover
                noDataComponent={
                  <div className="py-8 text-center text-gray-500">
                    No products found matching your criteria
                  </div>
                }
              />
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleAssignSubmit}
                disabled={isLoading || selectedProductIds.length === 0}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                  selectedProductIds.length === 0
                    ? "bg-gray-400"
                    : "bg-table hover:bg-secondary"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500`}
              >
                {hasPreSelectedProducts ? "Update" : "Assign"} Selected Products
                ({selectedProductIds.length})
              </button>
            </div>
          </>
        )}
      </div>

      <ReusableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Product Details"
        data={selectedProductDetails}
        fields={productModalFields}
        imageConfig={{
          show: true,
          path: "productImages[0]",
          alt: "name",
          fallback: "/placeholder-product.png",
        }}
      />
    </div>
  );
};

export default FeatuuredAssignProducts;
