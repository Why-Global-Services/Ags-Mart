
// import React, { useEffect, useState, useMemo } from "react";
// import { useParams, useNavigate, Link } from "react-router-dom";
// import { message, Spin } from "antd";
// import dayjs from "dayjs";
// import { FaSearch, FaPlus } from "react-icons/fa";
// import ReusableTable from "../../components/ReusableTable"; // Adjust path as needed
// import ReusableModal from "../../components/ReusableModal"; // Adjust path as provided
// import ActionsMenu from "../../components/ActionMenu"; // Adjust path as needed
// import { getOfferProducts } from "../../services/Offer"; // Adjust API import as needed

// const OfferDetails = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [offerData, setOfferData] = useState(null);
//   const [assignProducts, setAssignProducts] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [selectedProduct, setSelectedProduct] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   // Fetch offer and assigned products
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const res = await getOfferProducts(id);

//         if (res.success && res.data && res.data.length > 0) {
//           const offerDetails = res.data[0].offerDetails;
//           // Set offer details
//           setOfferData({
//             offerTitle: offerDetails.offerTitle,
//             offerTerms: offerDetails.offerTerms,
//             keyWords: offerDetails.keyWords,
//             discountPercentage: offerDetails.discountPercentage,
//             validFrom: offerDetails.validFrom,
//             validTo: offerDetails.validTo,
//             offerImage: offerDetails.offerImage,
//             status: offerDetails.status,
//           });

//           // Process products (variant and non-variant)
//           const processedProducts = res.data[0].productDetails.flatMap((product) => {
//             if (product.productType === "variation") {
//               return product.varient.map((variant, vIndex) => ({
//                 id: `${product._id}-${vIndex}`,
//                 _id: product._id,
//                 productName: product.productName ||variant.productTitle  ,
//                 brand: product.productBrand,
//                 category: product.productCategory,
//                 subCategory: product.productSubCategory,
//                 price: parseFloat(variant.price.salePrice || variant.price.regularPrice),
//                 discount: offerDetails.discountPercentage,
//                 finalPrice: (
//                   parseFloat(variant.price.salePrice || variant.price.regularPrice) *
//                   (1 - offerDetails.discountPercentage / 100)
//                 ).toFixed(2),
//                 quantityInStock: parseInt(variant.stockCount, 10),
//                 productImages: variant.varientImage
//                   ? [variant.varientImage, ...product.productImage]
//                   : product.productImage,
//                 expiryDate: null,
//                 isActive: variant.stockCount > 0 ? "active" : "inactive",
//                 variantDetails: {
//                   type: variant.varientType,
//                   value: variant.varientValue,
//                   unit: variant.productUnit,
//                   volumes: variant.productVolumes,
//                   skuCode: variant.skuCode,
//                 },
//               }));
//             } else {
//               const nonVariant = product.nonVarient?.[0] || {};
//               return [
//                 {
//                   id: product._id,
//                   _id: product._id,
//                   productName: product.productName  || nonVariant.productTitle,
//                   brand: product.productBrand,
//                   category: product.productCategory,
//                   subCategory: product.productSubCategory,
//                   price: parseFloat(nonVariant.price?.salePrice || nonVariant.price?.regularPrice || 0),
//                   discount: offerDetails.discountPercentage,
//                   finalPrice: (
//                     parseFloat(nonVariant.price?.salePrice || nonVariant.price?.regularPrice || 0) *
//                     (1 - offerDetails.discountPercentage / 100)
//                   ).toFixed(2),
//                   quantityInStock: parseInt(nonVariant.stockCount, 10) || 0,
//                   productImages: product.productImage,
//                   expiryDate: null,
//                   isActive: nonVariant.stockCount > 0 ? "active" : "inactive",
//                   variantDetails: null,
//                 },
//               ];
//             }
//           });

//           setAssignProducts(processedProducts);
//         } else {
//           message.warning("No products found for this offer");
//         }
//       } catch (error) {
//         console.error("Error fetching offer details:", error);
//         message.error("Failed to fetch offer details");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [id]);

//   // Filter products based on search query
//   const filteredProducts = useMemo(() => {
//     if (!searchQuery) return assignProducts;
//     return assignProducts.filter((product) =>
//       product.productName.toLowerCase().includes(searchQuery.toLowerCase())
//     );
//   }, [assignProducts, searchQuery]);

//   // Handle view product in modal
//   const handleViewProduct = (product) => {
//     setSelectedProduct(product);
//     setIsModalOpen(true);
//   };

//   // Handle delete product (mock implementation)
//   const handleDeleteProduct = async (productId) => {
//     try {
//       // Replace with actual API call to delete product from offer
//       message.success("Product removed from offer successfully");
//       setAssignProducts((prev) => prev.filter((p) => p._id !== productId));
//     } catch (error) {
//       console.error("Error deleting product from offer:", error);
//       message.error("Failed to remove product from offer");
//     }
//   };

//   // Define fields for ReusableModal
//   const productFields = [
//     { key: "productName", label: "Product Name" },
//     { key: "brand", label: "Brand" },
//     { key: "category", label: "Category" },
//     { key: "subCategory", label: "Subcategory" },
//     { key: "price", label: "Price", type: "currency" },
//     { key: "discount", label: "Discount", type: "percentage" },
//     { key: "finalPrice", label: "Final Price", type: "currency" },
//     { key: "quantityInStock", label: "Stock" },
//     // { key: "expiryDate", label: "Expiry Date", type: "date" },
//     { key: "isActive", label: "Status", type: "status" },
//     {
//       key: "variantDetails",
//       label: "Variant Details",
//       type: "custom",
//       render: (data) =>
//         data ? (
//           <div>
//             <p>Type: {data.type}</p>
//             <p>Value: {data.value}</p>
//             <p>Unit: {data.unit}</p>
//             <p>Volumes: {data.volumes?.join(", ")}</p>
//             <p>SKU: {data.skuCode}</p>
//           </div>
//         ) : (
//           "Non-variant product"
//         ),
//     },
//   ];

//   // Define table columns
//   const productColumns = [
//     {
//       name: "Product Name",
//       selector: (row) => row.productName,
//       cell: (row) => (
//         <div className="flex items-center space-x-3">
//           {row.productImages?.[0] && (
//             <img
//               src={row.productImages[0]}
//               alt={row.productName}
//               className="w-10 h-10 object-cover rounded-md"
//             />
//           )}
//           <p className="text-gray-700 font-medium">{row.productName}</p>
//         </div>
//       ),
//       width: "250px",
//       sortable: true,
//     },
//     {
//       name: "Category / Subcategory",
//       selector: (row) => row.category || "-",
//       cell: (row) => `${row.category || "-"} / ${row.subCategory || "-"}`,
//       width: "200px",
//       sortable: true,
//     },
//     {
//       name: "Stock",
//       selector: (row) => row.quantityInStock || "-",
//       width: "100px",
//       sortable: true,
//     },
//     {
//       name: "Price",
//       selector: (row) => `₹${row.price}` || "-",
//       width: "120px",
//       sortable: true,
//     },
//     {
//       name: "Discount",
//       selector: (row) => `${row.discount}%` || "-",
//       width: "120px",
//       sortable: true,
//     },
//     {
//       name: "Discounted Price",
//       selector: (row) => `₹${row.finalPrice}` || "-",
//       width: "150px",
//       sortable: true,
//     },
//     {
//       name: "Brand",
//       selector: (row) => row.brand || "-",
//       width: "150px",
//       sortable: true,
//     },
//     {
//       name: "Status",
//       cell: (row) => (
//         <span
//           className={`px-2 py-1 rounded-full text-xs ${
//             row.isActive === "active"
//               ? "bg-green-100 text-green-800"
//               : "bg-red-100 text-red-800"
//           }`}
//         >
//           {row.isActive}
//         </span>
//       ),
//       width: "120px",
//     },
//     {
//       name: "Actions",
//       cell: (row) => (
//         <ActionsMenu
//           item={row}
//           onView={handleViewProduct}
//           onDelete={handleDeleteProduct}
//           editPath={`/offers/offerDetails/${id}/${row._id}`}
//           showAssign={false}
//           showEdit={false}
//           showDelete={true}
//         />
//       ),
//       width: "150px",
//       ignoreRowClick: true,
//       allowOverflow: true,
//     },
//   ];

//   return (
//     <div className="bg-gray-100 min-h-screen p-6">
//       {/* Go Back */}
//       <button
//         onClick={() => navigate("/offers")}
//         className="rounded px-4 text-sm text-blue-700 hover:underline"
//       >
//         ← Go Back
//       </button>

//       {/* Offer Details Card */}
//       <div className="bg-white shadow-lg rounded-lg mt-3 p-6">
//         {/* Header & Search */}
//         <div className="flex justify-between items-center mb-4">
//           <h1 className="text-2xl font-semibold text-gray-800">Offer Details</h1>
//           <div className="relative">
//             <input
//               type="text"
//               placeholder="Search products..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="border border-gray-300 rounded-md pl-10 pr-4 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none"
//             />
//             <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//           </div>
//         </div>

//         {/* Offer Info */}
//         {loading ? (
//           <div className="flex justify-center items-center h-32">
//             <Spin size="large" />
//           </div>
//         ) : offerData ? (
//           <div className="border border-gray-200 p-4 rounded-lg bg-gray-50 mb-6">
//             <div className="flex items-center space-x-4">
//               {offerData.offerImage && (
//                 <img
//                   src={offerData.offerImage}
//                   alt={offerData.offerTitle}
//                   className="w-20 h-20 object-cover rounded-md"
//                 />
//               )}
//               <div>
//                 <h2 className="text-xl font-semibold text-gray-800">{offerData.offerTitle}</h2>
//                 <p className="text-gray-600 mt-2 text-sm">{offerData.offerTerms}</p>
//               </div>
//             </div>

//             <div className="flex flex-wrap gap-4 mt-4">
//               <div className="flex items-center space-x-2">
//                 <span className="text-gray-600 font-medium">Keyword:</span>
//                 <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">
//                   {offerData.keyWords || "N/A"}
//                 </span>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <span className="text-gray-600 font-medium">Discount:</span>
//                 <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-sm">
//                   {offerData.discountPercentage}% off
//                 </span>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <span className="text-gray-600 font-medium">Valid From:</span>
//                 <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-sm">
//                   {offerData.validFrom
//                     ? dayjs(offerData.validFrom).format("DD/MM/YYYY")
//                     : "-"}
//                 </span>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <span className="text-gray-600 font-medium">Valid To:</span>
//                 <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-sm">
//                   {offerData.validTo
//                     ? dayjs(offerData.validTo).format("DD/MM/YYYY")
//                     : "-"}
//                 </span>
//               </div>
//             </div>
//           </div>
//         ) : (
//           <p className="text-gray-500 text-center py-4">No offer details found</p>
//         )}

//         {/* Assign Products Button */}
//         <div className="flex justify-end py-5">
//           <Link
//             to={`/offers/offerDetails/${id}/assignProducts`}
//             className="flex gap-2 items-center border border-primaryColor rounded hover:bg-primary duration-300 hover:text-white px-5 py-1.5 text-primary"
//           >
//             <FaPlus />
//             {offerData ? "Update Products" : "Assign Products"}
//           </Link>
//         </div>

//         {/* Products Table */}
//         <div className="bg-white rounded-lg shadow-md overflow-hidden p-2">
//           <ReusableTable
//             columns={productColumns}
//             data={filteredProducts}
//             loading={loading}
//             noDataMessage="No products assigned to this offer"
//             pagination
//             paginationRowsPerPageOptions={[5, 10, 15]}
//             fixedHeader
//             fixedHeaderScrollHeight="500px"
//           />
//         </div>
//       </div>

//       {/* Product Details Modal */}
//       {selectedProduct && (
//         <ReusableModal
//           isOpen={isModalOpen}
//           onClose={() => setIsModalOpen(false)}
//           title="Product Details"
//           data={selectedProduct}
//           fields={productFields}
//           imageConfig={{
//             show: true,
//             path: "productImages",
//             alt: "productName",
//             render: (images) => (
//               <div className="flex space-x-2 overflow-x-auto">
//                 {images.map((img, index) => (
//                   <img
//                     key={index}
//                     src={img}
//                     alt={`${selectedProduct.productName}-${index}`}
//                     className="w-24 h-24 object-cover rounded-md"
//                   />
//                 ))}
//               </div>
//             ),
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default OfferDetails;


import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { message, Spin } from "antd";
import dayjs from "dayjs";
import { FaSearch, FaPlus } from "react-icons/fa";
import ReusableTable from "../../components/ReusableTable";
import ReusableModal from "../../components/ReusableModal";
import ActionsMenu from "../../components/ActionMenu";
import { getOfferProducts } from "../../services/Offer";

const OfferDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [offerData, setOfferData] = useState(null);
  const [assignProducts, setAssignProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch offer and assigned products
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getOfferProducts(id);

        if (res.success && res.data && res.data.length > 0) {
          const offerDetails = res.data[0].offerDetails;
          // Set offer details
          setOfferData({
            offerTitle: offerDetails.offerTitle,
            offerTerms: offerDetails.offerTerms,
            keyWords: offerDetails.keyWords,
            discountPercentage: offerDetails.discountPercentage,
            validFrom: offerDetails.validFrom,
            validTo: offerDetails.validTo,
            offerImage: offerDetails.offerImage,
            status: offerDetails.status,
          });

          // Process unique products
          const uniqueProductMap = new Map();
          res.data[0].productDetails.forEach((product) => {
            if (!uniqueProductMap.has(product._id)) {
              let price = 0;
              let finalPrice = 0;
              let quantityInStock = 0;

              if (product.productType === "variation") {
                const variant = product.varient[0] || {};
                price = parseFloat(variant.price?.salePrice || variant.price?.regularPrice || 0);
                finalPrice = (price * (1 - offerDetails.discountPercentage / 100)).toFixed(2);
                quantityInStock = product.varient.reduce((sum, v) => sum + parseInt(v.stockCount, 10), 0);
              } else {
                const nonVariant = product.nonVarient?.[0] || {};
                price = parseFloat(nonVariant.price?.salePrice || nonVariant.price?.regularPrice || 0);
                finalPrice = (price * (1 - offerDetails.discountPercentage / 100)).toFixed(2);
                quantityInStock = parseInt(nonVariant.stockCount, 10) || 0;
              }

              uniqueProductMap.set(product._id, {
                id: product._id,
                _id: product._id,
                productName: product.productName,
                brand: product.productBrand,
                category: product.productCategory,
                subCategory: product.productSubCategory,
                price,
                discount: offerDetails.discountPercentage,
                finalPrice,
                quantityInStock,
                productImages: product.productImage || [],
                isActive: quantityInStock > 0 ? "active" : "inactive",
                variants: product.productType === "variation" ? product.varient : [],
                productType: product.productType,
                nonVariant: product.productType === "nonVariation" ? product.nonVarient?.[0] : null,
              });
            }
          });

          setAssignProducts(Array.from(uniqueProductMap.values()));
        } else {
          message.warning("No products found for this offer");
        }
      } catch (error) {
        console.error("Error fetching offer details:", error);
        message.error("Failed to fetch offer details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return assignProducts;
    return assignProducts.filter((product) =>
      product.productName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [assignProducts, searchQuery]);

  // Handle view product in modal
  const handleViewProduct = (product) => {
    if (!product || !product._id || !product.productType) {
      message.error("Invalid product selected");
      return;
    }
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // Handle delete product (mock implementation)
  const handleDeleteProduct = async (productId) => {
    try {
      message.success("Product removed from offer successfully");
      setAssignProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch (error) {
      console.error("Error deleting product from offer:", error);
      message.error("Failed to remove product from offer");
    }
  };

  // Define fields for ReusableModal
  const productFields = [
    { key: "productName", label: "Product Name" },
    { key: "brand", label: "Brand" },
    { key: "category", label: "Category" },
    { key: "subCategory", label: "Subcategory" },
    { key: "price", label: "Price", type: "currency" },
    { key: "discount", label: "Discount", type: "percentage" },
    { key: "finalPrice", label: "Final Price", type: "currency" },
    { key: "quantityInStock", label: "Stock" },
    { key: "isActive", label: "Status", type: "status" },
    {
      key: "variants",
      label: "Variant Details",
      type: "custom",
      render: (variants, product) => {
        if (!product || !product.productType) {
          return "No variant details";
        }
        if (product.productType === "variation" && variants?.length > 0) {
          return (
            <div>
              {variants.map((variant, index) => (
                <div key={index} className="mb-2">
                  <p><strong>Variant {index + 1}:</strong></p>
                  <p>Type: {variant.varientType || "-"}</p>
                  <p>Value: {variant.varientValue || "-"}</p>
                  <p>Unit: {variant.productUnit || "-"}</p>
                  <p>Volumes: {variant.productVolumes?.join(", ") || "-"}</p>
                  <p>SKU: {variant.skuCode || "-"}</p>
                  <p>Stock: {variant.stockCount || "-"}</p>
                  <p>Price: ₹{variant.price?.salePrice || variant.price?.regularPrice || "0"}</p>
                </div>
              ))}
            </div>
          );
        } else if (product.productType === "nonVariation" && product.nonVariant) {
          return (
            <div>
              <p>Title: {product.nonVariant.productTitle || "-"}</p>
              <p>Stock: {product.nonVariant.stockCount || "-"}</p>
              <p>Price: ₹{product.nonVariant.price?.salePrice || product.nonVariant.price?.regularPrice || "0"}</p>
            </div>
          );
        }
        return "No variant details";
      },
    },
  ];

  // Define table columns
  const productColumns = [
    {
      name: "Product Name",
      selector: (row) => row.productName,
      cell: (row) => (
        <div className="flex items-center space-x-3">
          {row.productImages?.[0] && (
            <img
              src={row.productImages[0]}
              alt={row.productName || "Product"}
              className="w-10 h-10 object-cover rounded-md"
            />
          )}
          <p className="text-gray-700 font-medium">{row.productName || "-"}</p>
        </div>
      ),
      width: "250px",
      sortable: true,
    },
    {
      name: "Category / Subcategory",
      selector: (row) => row.category || "-",
      cell: (row) => `${row.category || "-"} / ${row.subCategory || "-"}`,
      width: "200px",
      sortable: true,
    },
    {
      name: "Stock",
      selector: (row) => row.quantityInStock || "-",
      width: "100px",
      sortable: true,
    },
    {
      name: "Price",
      selector: (row) => `₹${row.price}` || "-",
      width: "120px",
      sortable: true,
    },
    {
      name: "Discount",
      selector: (row) => `${row.discount}%` || "-",
      width: "120px",
      sortable: true,
    },
    {
      name: "Discounted Price",
      selector: (row) => `₹${row.finalPrice}` || "-",
      width: "150px",
      sortable: true,
    },
    {
      name: "Brand",
      selector: (row) => row.brand || "-",
      width: "150px",
      sortable: true,
    },
    {
      name: "Status",
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.isActive === "active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.isActive}
        </span>
      ),
      width: "120px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <ActionsMenu
          item={row}
          onView={handleViewProduct}
          onDelete={handleDeleteProduct}
          editPath={`/offers/offerDetails/${id}/${row._id}`}
          showAssign={false}
          showEdit={false}
          showDelete={true}
        />
      ),
      width: "150px",
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      {/* Go Back */}
      <button
        onClick={() => navigate("/offers")}
        className="rounded px-4 text-sm text-blue-700 hover:underline"
      >
        ← Go Back
      </button>

      {/* Offer Details Card */}
      <div className="bg-white shadow-lg rounded-lg mt-3 p-6">
        {/* Header & Search */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">Offer Details</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-300 rounded-md pl-10 pr-4 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Offer Info */}
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Spin size="large" />
          </div>
        ) : offerData ? (
          <div className="border border-gray-200 p-4 rounded-lg bg-gray-50 mb-6">
            <div className="flex items-center space-x-4">
              {offerData.offerImage && (
                <img
                  src={offerData.offerImage}
                  alt={offerData.offerTitle}
                  className="w-20 h-20 object-cover rounded-md"
                />
              )}
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{offerData.offerTitle}</h2>
                <p className="text-gray-600 mt-2 text-sm">{offerData.offerTerms}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 font-medium">Keyword:</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">
                  {offerData.keyWords || "N/A"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 font-medium">Discount:</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-sm">
                  {offerData.discountPercentage}% off
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 font-medium">Valid From:</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-sm">
                  {offerData.validFrom
                    ? dayjs(offerData.validFrom).format("DD/MM/YYYY")
                    : "-"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 font-medium">Valid To:</span>
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-sm">
                  {offerData.validTo
                    ? dayjs(offerData.validTo).format("DD/MM/YYYY")
                    : "-"}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No offer details found</p>
        )}

        {/* Assign Products Button */}
        <div className="flex justify-end py-5">
          <Link
            to={`/offers/offerDetails/${id}/assignProducts`}
            className="flex gap-2 items-center border border-primaryColor rounded hover:bg-primary duration-300 hover:text-white px-5 py-1.5 text-primary"
          >
            <FaPlus />
            {offerData ? "Update Products" : "Assign Products"}
          </Link>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden p-2">
          <ReusableTable
            columns={productColumns}
            data={filteredProducts}
            loading={loading}
            noDataMessage="No products assigned to this offer"
            pagination
            paginationRowsPerPageOptions={[5, 10, 15]}
            fixedHeader
            fixedHeaderScrollHeight="500px"
          />
        </div>
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <ReusableModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProduct(null);
          }}
          title="Product Details"
          data={selectedProduct}
          fields={productFields}
          imageConfig={{
            show: true,
            path: "productImages",
            alt: "productName",
            render: (images, product) => {
              const allImages = [
                ...(images || []),
                ...((product?.variants || []).map((v) => v.varientImage).filter(Boolean)),
              ];
              return (
                <div className="flex space-x-2 overflow-x-auto">
                  {allImages.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`${product?.productName || "Product"}-${index}`}
                      className="w-24 h-24 object-cover rounded-md"
                    />
                  ))}
                </div>
              );
            },
          }}
        />
      )}
    </div>
  );
};

export default OfferDetails;