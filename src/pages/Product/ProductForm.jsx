// import React, { useState, useEffect } from "react";
// import { FaUpload } from "react-icons/fa";
// import { IoMdClose } from "react-icons/io";
// import { Link, useParams, useNavigate, useLocation } from "react-router-dom";

// const ProductForm = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const isEditMode = Boolean(id);

//   const [formData, setFormData] = useState({
//     productImages: [],
//     category: "",
//     stock: "",
//     productType: "",
//     skinType: "",
//     productDescription: "",
//     color: "",
//     size: "",
//     fragrance: false,
//     spf: "",
//     name: "",
//     title: "",
//     brand: "",
//     price: "",
//     discount: "",
//     tax: "",
//     rating: "",
//     reviews: "",
//     productFeatured: "",
//     sellingcategories: "",
//     stockcount: "",
//     volume: "",
//     flavour: "",
//     benefits: false,
//     luxuryProduct: false, // Added this line
//     dermatologistTested: "",
//     cleanFormula: "",
//     longLasting: "",
//     highlyRated: "",
//   });

//   const [uploadedImages, setUploadedImages] = useState([]);
//   const [error, setError] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [freeShippingPincodes, setFreeShippingPincodes] = useState([]);
//   const [pincodeInput, setPincodeInput] = useState("");
//   const [keyIngredientInput, setKeyIngredientInput] = useState("");
//   const [keyIngredients, setKeyIngredients] = useState([]);

//   // Initialize form data if in edit mode
//   useEffect(() => {
//     if (isEditMode) {
//       const productData = location.state?.product || {};

//       setFormData({
//         name: productData.name || "",
//         title: productData.title || "",
//         brand: productData.brand || "",
//         category: productData.category || "",
//         stock: productData.stock || "",
//         productDescription: productData.productDescription || "",
//         price: productData.price || "",
//         discount: productData.discount || "",
//         tax: productData.tax || "",
//         rating: productData.rating || "",
//         reviews: productData.reviews || "",
//         productFeatured: productData.productFeatured || "",
//         sellingcategories: productData.sellingcategories || "",
//         stockcount: productData.stockcount || "",
//         volume: productData.volume || "",
//         flavour: productData.flavour || "",
//         benefits: productData.benefits || false,
//         luxuryProduct: productData.luxuryProduct || false, // Added this line
//         dermatologistTested: productData.dermatologistTested || "",
//         cleanFormula: productData.cleanFormula || "",
//         longLasting: productData.longLasting || "",
//         highlyRated: productData.highlyRated || "",
//       });

//       if (productData.productImages && productData.productImages.length > 0) {
//         setUploadedImages(productData.productImages);
//       }

//       if (productData.freeShippingPincodes && productData.freeShippingPincodes.length > 0) {
//         setFreeShippingPincodes(productData.freeShippingPincodes);
//       }

//       if (productData.keyIngredients && productData.keyIngredients.length > 0) {
//         setKeyIngredients(productData.keyIngredients);
//       }
//     }
//   }, [id, isEditMode, location.state]);

//   // Calculate discounted price
//   const calculateDiscountedPrice = () => {
//     const price = parseFloat(formData.price) || 0;
//     const discount = parseFloat(formData.discount) || 0;
//     return price - (price * discount) / 100;
//   };

//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData((prevState) => ({
//       ...prevState,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   const handleFileUpload = (e) => {
//     const files = Array.from(e.target.files);
//     const imageUrls = files.map((file) => URL.createObjectURL(file));

//     setUploadedImages((prev) => [...prev, ...imageUrls]);
//     setFormData((prev) => ({
//       ...prev,
//       productImages: [...prev.productImages, ...files],
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);

//     const finalFormData = {
//       ...formData,
//       freeShippingPincodes: freeShippingPincodes,
//       keyIngredients: keyIngredients
//     };

//     try {
//       if (isEditMode) {
//         console.log("Updating product:", finalFormData);
//         await new Promise(resolve => setTimeout(resolve, 1000));
//       } else {
//         console.log("Creating product:", finalFormData);
//         await new Promise(resolve => setTimeout(resolve, 1000));
//       }

//       navigate("/products");
//     } catch (error) {
//       setError(isEditMode ? "Failed to update product" : "Failed to create product");
//       console.error(error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleRemoveImage = (imageUrl) => {
//     setUploadedImages((prev) => prev.filter((img) => img !== imageUrl));
//     setFormData((prev) => ({
//       ...prev,
//       productImages: prev.productImages.filter(
//         (file) => URL.createObjectURL(file) !== imageUrl
//       ),
//     }));
//   };

//   // Pincode handlers
//   const handleAddPincode = () => {
//     const trimmed = pincodeInput.trim();
//     if (trimmed.length === 6 && !freeShippingPincodes.includes(trimmed)) {
//       setFreeShippingPincodes([...freeShippingPincodes, trimmed]);
//       setPincodeInput("");
//     }
//   };

//   const handleRemovePincode = (code) => {
//     setFreeShippingPincodes((prev) => prev.filter((item) => item !== code));
//   };

//   // Key Ingredients handlers
//   const handleAddKeyIngredient = () => {
//     const trimmed = keyIngredientInput.trim();
//     if (trimmed && !keyIngredients.includes(trimmed)) {
//       setKeyIngredients([...keyIngredients, trimmed]);
//       setKeyIngredientInput("");
//     }
//   };

//   const handleRemoveKeyIngredient = (ingredient) => {
//     setKeyIngredients((prev) => prev.filter((item) => item !== ingredient));
//   };

//   return (
//     <div className="bg-gray-50 min-h-screen p-6">
//       <h1 className="text-3xl font-title text-gray-800 ">
//         {isEditMode ? "Update Product" : "Create Product"}
//       </h1>
//       <Link to="/products">
//         <button className="text-black rounded my-3 mr-4 w-full md:w-auto cursor-pointer">
//           ← Go back
//         </button>
//       </Link>

//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           {error}
//         </div>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {/* Right Section: Product Preview */}
//         <div className="col-span-1 bg-white shadow-lg rounded-lg p-6 h-fit">
//           <div className="flex justify-center items-center h-64 bg-gray-100 rounded-lg overflow-hidden">
//             {uploadedImages.length > 0 ? (
//               <img
//                 src={uploadedImages[0]}
//                 alt="Product Preview"
//                 width={500}
//                 height={300}
//                 className="h-full object-contain"
//               />
//             ) : (
//               <p className="text-gray-500">No image uploaded</p>
//             )}
//           </div>

//           <h2 className="text-xl font-title text-gray-800 mt-4">
//             {formData.name || "Product Name"}
//           </h2>
//           <div className="mt-2">
//             <p>
//               <strong>Rating:</strong> {formData.rating || "N/A"}
//             </p>
//             <div>
//               <strong>Reviews:</strong> {formData.reviews || "N/A"}
//             </div>
//           </div>
//           <div className="flex items-center mt-4">
//             <span className="text-lg font-bold text-green-600">
//               ${calculateDiscountedPrice().toFixed(2)}
//             </span>
//             {formData.discount && (
//               <span className="text-sm line-through text-gray-400 ml-2">
//                 ${formData.price || "0.00"}
//               </span>
//             )}
//             {formData.discount && (
//               <span className="text-sm text-orange-500 ml-2">
//                 ({formData.discount}% off)
//               </span>
//             )}
//           </div>
//           <div className="mt-6 flex justify-center">
//             <button
//               className="bg-buttoncolor text-white px-3 py-2 rounded mr-4"
//               onClick={() => navigate("/products")}
//             >
//               Cancel
//             </button>
//             <button
//               className="bg-primaryColor text-white px-4 py-2 rounded"
//               onClick={handleSubmit}
//               disabled={isLoading}
//             >
//               {isLoading ? "Processing..." : isEditMode ? "Update Product" : "Create Product"}
//             </button>
//           </div>
//         </div>

//         {/* Left Section: Product Form */}
//         <div className="col-span-2 space-y-2 bg-white shadow-lg rounded-lg p-6 w-full">
//           <h2 className="text-xl font-semibold mb-6">Product Photo</h2>
//           <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col justify-center items-center relative">
//             <FaUpload className="text-orange-500 text-4xl mb-2" />
//             <input
//               type="file"
//               onChange={handleFileUpload}
//               className="absolute opacity-0 cursor-pointer inset-0"
//               multiple
//             />
//             <p className="text-gray-500">
//               Drag your images here, or{" "}
//               <span className="text-orange-500 cursor-pointer">
//                 click to browse
//               </span>
//             </p>
//           </div>
//           <div className="grid grid-cols-3 gap-2">
//             {uploadedImages.map((image, index) => (
//               <div key={index} className="relative border rounded-md">
//                 <img
//                   src={image}
//                   alt={`Uploaded ${index + 1}`}
//                   className="w-full h-32 object-cover rounded-lg p-6"
//                 />
//                 <button
//                   onClick={() => handleRemoveImage(image)}
//                   className="absolute top-0.5 text-xs right-1 p-1 rounded-full"
//                 >
//                   X
//                 </button>
//               </div>
//             ))}
//           </div>

//           <div className="mt-6">
//             <h2 className="text-xl font-title mb-4">Product Information</h2>
//             <div className="flex gap-4">
//               <div className="w-full">
//                 <label
//                   htmlFor="name"
//                   className="block text-sm font-medium text-gray-600 mb-2"
//                 >
//                   Product Name
//                 </label>
//                 <input
//                   id="name"
//                   type="text"
//                   name="name"
//                   placeholder="Product Name"
//                   className="border rounded p-2 w-full"
//                   onChange={handleInputChange}
//                   value={formData.name}
//                 />
//               </div>
//               <div className="w-full">
//                 <label
//                   htmlFor="title"
//                   className="block text-sm font-medium text-gray-600 mb-2"
//                 >
//                   Product Title
//                 </label>
//                 <input
//                   id="title"
//                   type="text"
//                   name="title"
//                   placeholder="Product Title"
//                   className="border rounded p-2 w-full"
//                   onChange={handleInputChange}
//                   value={formData.title}
//                 />
//               </div>
//               <div className="w-full">
//                 <label
//                   htmlFor="brand"
//                   className="block text-sm font-medium text-gray-600 mb-2"
//                 >
//                   Brand
//                 </label>
//                 <input
//                   id="brand"
//                   type="text"
//                   name="brand"
//                   placeholder="Brand"
//                   className="border rounded p-2 w-full"
//                   onChange={handleInputChange}
//                   value={formData.brand}
//                 />
//               </div>
//               <div className="w-full">
//                 <label
//                   htmlFor="category"
//                   className="block text-sm font-medium text-gray-600 mb-2"
//                 >
//                   Category
//                 </label>
//                 <select
//                   id="category"
//                   name="category"
//                   className="border rounded p-2 w-full"
//                   onChange={handleInputChange}
//                   value={formData.category}
//                 >
//                   <option value="">Choose a category</option>
//                   <option value="Fashion">Fashion</option>
//                   <option value="MamaEarth">MamaEarth</option>
//                   <option value="Beauty">Beauty</option>
//                   <option value="Wow">Wow</option>
//                 </select>
//               </div>
//             </div>

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
//               <div>
//                 <label
//                   htmlFor="sellingcategories"
//                   className="block text-sm font-medium text-gray-600 mb-2"
//                 >
//                   Selling Categories
//                 </label>
//                 <select
//                   id="sellingcategories"
//                   name="sellingcategories"
//                   className="border rounded p-2 w-full"
//                   value={formData.sellingcategories}
//                   onChange={handleInputChange}
//                 >
//                   <option value="">Select Selling Categories</option>
//                   <option value="bestselling">Best Selling</option>
//                   <option value="flashdeals">Flash Deals</option>
//                   <option value="treandingproducts">Trending Products</option>
//                 </select>
//               </div>
//               <div>
//                 <label
//                   htmlFor="stockcount"
//                   className="block text-sm font-medium text-gray-600 mb-2"
//                 >
//                   Stock Count
//                 </label>
//                 <input
//                   type="number"
//                   id="stockcount"
//                   name="stockcount"
//                   placeholder="Stock Count"
//                   className="border rounded p-2 w-full"
//                   value={formData.stockcount}
//                   onChange={handleInputChange}
//                 />
//               </div>
//               <div>
//                 <label
//                   htmlFor="volume"
//                   className="block text-sm font-medium text-gray-600 mb-2"
//                 >
//                   Volume
//                 </label>
//                 <input
//                   type="number"
//                   id="volume"
//                   name="volume"
//                   placeholder="Volume (ml)"
//                   className="border rounded p-2 w-full"
//                   value={formData.volume}
//                   onChange={handleInputChange}
//                 />
//               </div>
//               <div className="w-full">
//                 <label
//                   htmlFor="flavour"
//                   className="block text-sm font-medium text-gray-600 mb-2"
//                 >
//                   Flavour Type
//                 </label>
//                 <input
//                   id="flavour"
//                   type="text"
//                   name="flavour"
//                   placeholder="Flavour"
//                   className="border rounded p-2 w-full"
//                   onChange={handleInputChange}
//                   value={formData.flavour}
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-4 mt-4">

//           <div className="mt-4">
//     <label className="flex items-center gap-2">
//       <input
//         type="checkbox"
//         name="luxuryProduct"
//         checked={formData.luxuryProduct || false}
//         onChange={handleInputChange}
//       />
//       <span className="text-sm text-gray-700">Luxury Product</span>
//     </label>
//   </div>

//             <div className="mt-4">
//               <label className="flex items-center gap-2">
//                 <input
//                   type="checkbox"
//                   name="benefits"
//                   checked={formData.benefits}
//                   onChange={handleInputChange}
//                 />
//                 <span className="text-sm text-gray-700">Add Benefits?</span>
//               </label>
//             </div>
//           </div>

//           {formData.benefits && (
//             <div className="mt-4">
//               <h3 className="text-lg font-medium mb-3">Product Benefits</h3>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-600 mb-2">
//                     Dermatologist Tested
//                   </label>
//                   <textarea
//                     id="productDescription"
//                     type="text"
//                     placeholder="Dermatologist Tested"
//                     name="dermatologistTested"
//                     value={formData.dermatologistTested}
//                     className="border rounded p-2 w-full h-18"
//                     onChange={handleInputChange}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-600 mb-2">
//                     Clean Formula
//                   </label>
//                   <textarea
//                     id="cleanFormula"
//                     type="text"
//                     placeholder="Clean Formula"
//                     name="cleanFormula"
//                     value={formData.cleanFormula}
//                     className="border rounded p-2 w-full h-18"
//                     onChange={handleInputChange}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-600 mb-2">
//                     Long Lasting
//                   </label>
//                   <textarea
//                     id="longLasting"
//                     type="text"
//                     placeholder="Long Lasting"
//                     name="longLasting"
//                     value={formData.longLasting}
//                     className="border rounded p-2 w-full h-18"
//                     onChange={handleInputChange}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-600 mb-2">
//                     Highly Rated
//                   </label>
//                   <textarea
//                     id="highlyRated"
//                     type="text"
//                     placeholder="Highly Rated"
//                     name="highlyRated"
//                     value={formData.highlyRated}
//                     className="border rounded p-2 w-full h-18"
//                     onChange={handleInputChange}
//                   />
//                 </div>
//               </div>
//             </div>
//           )}

//           <div className="mt-4">
//             <label
//               htmlFor="productDescription"
//               className="block text-sm font-medium text-gray-600 mb-2"
//             >
//               Description
//             </label>
//             <textarea
//               id="productDescription"
//               name="productDescription"
//               placeholder="Product description"
//               value={formData.productDescription}
//               className="border rounded p-2 w-full h-32"
//               onChange={handleInputChange}
//             />
//           </div>

//           <div className="mt-6">
//             <h2 className="text-xl font-title mb-4">Pricing Details</h2>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ">
//               <div>
//                 <label
//                   htmlFor="price"
//                   className="block text-sm font-medium text-gray-600 mb-2"
//                 >
//                   Price ($)
//                 </label>
//                 <input
//                   id="price"
//                   type="number"
//                   name="price"
//                   placeholder="Price"
//                   min="0"
//                   step="0.01"
//                   className="border rounded p-2 w-full"
//                   value={formData.price}
//                   onChange={handleInputChange}
//                 />
//               </div>
//               <div>
//                 <label
//                   htmlFor="discount"
//                   className="block text-sm font-medium text-gray-600 mb-2"
//                 >
//                   Discount (%)
//                 </label>
//                 <input
//                   id="discount"
//                   type="number"
//                   name="discount"
//                   placeholder="Discount"
//                   min="0"
//                   max="100"
//                   className="border rounded p-2 w-full"
//                   value={formData.discount}
//                   onChange={handleInputChange}
//                 />
//               </div>
//               <div className="w-full">
//                 <label
//                   htmlFor="tax"
//                   className="block text-sm font-medium text-gray-600 mb-2"
//                 >
//                   Tax (%)
//                 </label>
//                 <input
//                   id="tax"
//                   type="number"
//                   name="tax"
//                   placeholder="Tax"
//                   min="0"
//                   max="100"
//                   className="border rounded p-2 w-full"
//                   value={formData.tax}
//                   onChange={handleInputChange}
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Key Ingredients Section */}
//           <div className="mt-8">
//             <h2 className="text-xl font-title mb-4">Key Ingredients</h2>
//             <div className="flex items-center gap-2 mb-3">
//               <input
//                 type="text"
//                 value={keyIngredientInput}
//                 onChange={(e) => setKeyIngredientInput(e.target.value)}
//                 placeholder="Key Ingredients"
//                 className="border rounded p-2 w-full max-w-xs"
//                 onKeyDown={(e) => {
//                   if (e.key === 'Enter' && keyIngredientInput.trim()) {
//                     handleAddKeyIngredient();
//                   }
//                 }}
//               />
//               <button
//                 onClick={handleAddKeyIngredient}
//                 className="bg-primary text-white px-4 py-2 rounded"
//                 disabled={!keyIngredientInput.trim()}
//               >
//                 Add
//               </button>
//             </div>
//             <div className="flex flex-wrap gap-2">
//               {keyIngredients.map((ingredient, index) => (
//                 <div
//                   key={index}
//                   className="flex items-center bg-pink-100 text-black px-3 py-1 rounded-full text-sm"
//                 >
//                   {ingredient}
//                   <button
//                     onClick={() => handleRemoveKeyIngredient(ingredient)}
//                     className="ml-2 text-red-500 hover:text-red-700"
//                   >
//                     <IoMdClose />
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Free Shipping Pincodes Section */}
//           <div className="mt-8">
//             <h2 className="text-xl font-title mb-4">Free Shipping Pincodes</h2>
//             <div className="flex items-center gap-2 mb-3">
//               <input
//                 type="text"
//                 value={pincodeInput}
//                 onChange={(e) => {
//                   const value = e.target.value.replace(/\D/g, '').slice(0, 6);
//                   setPincodeInput(value);
//                 }}
//                 placeholder="Enter 6-digit Pincode"
//                 className="border rounded p-2 w-full max-w-xs"
//                 onKeyDown={(e) => {
//                   if (e.key === 'Enter' && pincodeInput.length === 6) {
//                     handleAddPincode();
//                   }
//                 }}
//               />
//               <button
//                 onClick={handleAddPincode}
//                 className="bg-primary text-white px-4 py-2 rounded"
//                 disabled={pincodeInput.length !== 6}
//               >
//                 Add
//               </button>
//             </div>
//             <div className="flex flex-wrap gap-2">
//               {freeShippingPincodes.map((code, index) => (
//                 <div
//                   key={index}
//                   className="flex items-center bg-pink-100 text-black px-3 py-1 rounded-full text-sm"
//                 >
//                   {code}
//                   <button
//                     onClick={() => handleRemovePincode(code)}
//                     className="ml-2 text-red-500 hover:text-red-700"
//                   >
//                     <IoMdClose />
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="pt-5 flex justify-end">
//             <button
//               className="bg-gray-400 text-white px-6 py-2 rounded mr-4 cursor-pointer"
//               onClick={() => navigate("/products")}
//             >
//               Cancel
//             </button>
//             <button
//               className="bg-primary text-white px-6 py-2 rounded cursor-pointer"
//               onClick={handleSubmit}
//               disabled={isLoading}
//             >
//               {isLoading ? "Processing..." : isEditMode ? "Update Product" : "Create Product"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProductForm;

import React, { useState, useEffect } from "react";
import { FaUpload } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { useProductForm } from "../context/FormContext";
import DataTable from "react-data-table-component";
import axios from "axios";
import {
  getAllCategories,
  getSubCategoriesByCategory,
} from "../../../../services/Offer";

const ProductForm = () => {
  const {
    formData,
    errors,
    updateFormData,
    uploadedImages,
    setUploadedImages,
    keyIngredients,
    setKeyIngredients,
    isEditMode,
  } = useProductForm();
  const [keyIngredientInput, setKeyIngredientInput] = useState("");
  const [productBenefitsInput, setProductBenefitsInput] = useState("");
  const [variants, setVariants] = useState(formData.variants || []);
  const [isEditingVariant, setIsEditingVariant] = useState(false);
  const [editingVariantId, setEditingVariantId] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // State for size-color management
  const [currentVariant, setCurrentVariant] = useState({
    variantType: "",
    sizeColorVariants: [],
    colorOnlyVariants: [],
    sizeOnlyVariants: [],
  });
  const [sizes, setSizes] = useState([]);
  const [currentSize, setCurrentSize] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [currentColor, setCurrentColor] = useState("");
  const [sizeColorMap, setSizeColorMap] = useState({});
  const [currentSizeColorVariant, setCurrentSizeColorVariant] = useState({
    size: "",
    color: "",
    stockCount: "",
    skuCode: "",
    productCode: "",
    variantImages: [],
    price: { costPrice: "", salePrice: "", discount: "", tax: "" },
  });
  const [currentColorVariant, setCurrentColorVariant] = useState({
    color: "",
    stockCount: "",
    skuCode: "",
    productCode: "",
    variantImages: [],
    price: { costPrice: "", salePrice: "", discount: "", tax: "" },
  });
  const [currentSizeVariant, setCurrentSizeVariant] = useState({
    size: "",
    stockCount: "",
    skuCode: "",
    productCode: "",
    variantImages: [],
    price: { costPrice: "", salePrice: "", discount: "", tax: "" },
  });
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [nonVariantImages, setNonVariantImages] = useState([]);

  const [categoryAttributes, setCategoryAttributes] = useState({
    sareeAttributes: {
      fabricMaterial: "",
      workEmbroidery: "",
      blouseType: "",
      borderDesign: "",
      length: "",
    },
    mensKidsAttributes: {
      setType: "",
      fabric: "",
      printPattern: "",
      ageGroup: "",
      fitType: "",
      sizeChartImage: "",
    },
    jewelleryAttributes: {
      metalTypePurity: "",
      stoneTypeQuality: "",
      platingType: "",
      weight: "",
      closureType: "",
    },
  });

  useEffect(() => {
    if (isEditMode && formData) {
      if (formData.keyIngredients) {
        setKeyIngredients(formData.keyIngredients);
      }
      if (formData.productBenefits && formData.productBenefits.length > 0) {
        setProductBenefitsInput(formData.productBenefits.join(", "));
      }
    }
  }, [isEditMode, formData]);

  // Helper function to transform API data to form data structure
  const transformProductData = (apiData) => {
    const isVariant = apiData.productType === "variant";
    const isNonVariant = apiData.productType === "nonVariant";
    const nonVariantPrice = apiData.nonVariant?.price || {};
    const nonVariantStockCount = apiData.nonVariant?.stockCount || "";

    return {
      _id: apiData._id,
      productName: apiData.productName || "",
      productTitle: apiData.productTitle || "",
      productCategory: apiData.productCategory || "",
      category_id: apiData.category_id || "",
      productSubCategory: apiData.productSubCategory || "",
      subcategory_id: apiData.subcategory_id || "",
      productType: apiData.productType || "",
      productDescription: apiData.productDescription || "",
      status: apiData.status || "active",
      usageInstructions: apiData.usageInstructions || "",
      keyIngredients: apiData.keyIngredients || [],
      productBenefits: apiData.productBenefits || [],
      hasVariation: isVariant,
      hasNonVariation: isNonVariant,
      productImages: apiData.productImages || [],
      variants: transformVariantsData(apiData),
      nonVariant: isNonVariant ? transformNonVariantData(apiData) : {},
      price: isNonVariant
        ? {
            costPrice: nonVariantPrice.costPrice || "",
            salePrice: nonVariantPrice.salePrice || "",
            discount: nonVariantPrice.discount || "",
            tax: nonVariantPrice.tax || "",
          }
        : { costPrice: "", salePrice: "", discount: "", tax: "" },
      stockCount: isNonVariant ? nonVariantStockCount : "",
      sareeAttributes: apiData.sareeAttributes || {},
      mensKidsAttributes: apiData.mensKidsAttributes || {},
      jewelleryAttributes: apiData.jewelleryAttributes || {},
      inventory: apiData.inventory || {},
      shipping: apiData.shipping || {},
      searchTags: apiData.searchTags || [],
    };
  };

  const transformVariantsData = (apiData) => {
    if (apiData.productType !== "variant") return [];
    const variants = [];
    const variantData = apiData.variant;
    if (!variantData) return [];

    if (
      variantData.variantType === "colorOnly" &&
      variantData.colorOnlyVariants?.length > 0
    ) {
      variants.push({
        variantType: "colorOnly",
        colorOnlyVariants: variantData.colorOnlyVariants.map((variant) => ({
          ...variant,
          price: variant.price || {
            costPrice: "",
            salePrice: "",
            discount: "",
            tax: "",
          },
        })),
      });
    }

    if (
      variantData.variantType === "sizeColor" &&
      variantData.sizeColorVariants?.length > 0
    ) {
      variants.push({
        variantType: "sizeColor",
        sizeColorVariants: variantData.sizeColorVariants.map((variant) => ({
          ...variant,
          price: variant.price || {
            costPrice: "",
            salePrice: "",
            discount: "",
            tax: "",
          },
        })),
      });
    }

    if (
      variantData.variantType === "sizeOnly" &&
      variantData.sizeOnlyVariants?.length > 0
    ) {
      variants.push({
        variantType: "sizeOnly",
        sizeOnlyVariants: variantData.sizeOnlyVariants.map((variant) => ({
          ...variant,
          price: variant.price || {
            costPrice: "",
            salePrice: "",
            discount: "",
            tax: "",
          },
        })),
      });
    }

    return variants;
  };

  const transformNonVariantData = (apiData) => {
    if (apiData.productType !== "nonVariant") return {};

    return {
      productTitle: apiData.nonVariant?.productTitle || "",
      nonVariantImages: apiData.nonVariant?.nonVariantImages || [],
      price: apiData.nonVariant?.price || {
        costPrice: "",
        salePrice: "",
        discount: "",
        tax: "",
      },
      stockCount: apiData.nonVariant?.stockCount || "",
      skuCode: apiData.nonVariant?.skuCode || "",
      productCode: apiData.nonVariant?.productCode || "",
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoryResponse = await getAllCategories();
        const categoryData = categoryResponse.data || [];
        setCategories(
          categoryData.filter((category) => category.status === "active")
        );
      } catch (error) {
        console.error("Error fetching data:", error);
        setApiError("Failed to load data. Please try again later.");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchSubCategories = async () => {
      if (formData.productCategory) {
        try {
          const selectedCategory = categories.find(
            (cat) => cat.categoryTitle === formData.productCategory
          );
          if (selectedCategory) {
            const response = await getSubCategoriesByCategory(
              selectedCategory._id
            );
            const subCategoryData = response || [];
            setSubCategories(
              subCategoryData.filter(
                (subCategory) => subCategory.status === "active"
              )
            );
            if (isEditMode && formData.productSubCategory) {
              const subCatExists = subCategoryData.some(
                (subCat) =>
                  subCat.subCategoryTitle === formData.productSubCategory
              );
              if (!subCatExists) {
                updateFormData({ productSubCategory: "" });
              }
            }
          }
        } catch (error) {
          console.error("Error fetching subcategories:", error);
          setApiError("Failed to load subcategories. Please try again.");
        }
      } else {
        setSubCategories([]);
      }
    };
    fetchSubCategories();
  }, [
    formData.productCategory,
    categories,
    isEditMode,
    formData.productSubCategory,
    updateFormData,
  ]);

  useEffect(() => {
    if (isEditMode && formData) {
      if (formData.variants && formData.variants.length > 0) {
        setVariants(formData.variants);
      }

      if (formData.productCategory) {
        setCategoryAttributes({
          sareeAttributes: formData.sareeAttributes || {
            fabricMaterial: "",
            workEmbroidery: "",
            blouseType: "",
            borderDesign: "",
            length: "",
          },
          mensKidsAttributes: formData.mensKidsAttributes || {
            setType: "",
            fabric: "",
            printPattern: "",
            ageGroup: "",
            fitType: "",
            sizeChartImage: "",
          },
          jewelleryAttributes: formData.jewelleryAttributes || {
            metalTypePurity: "",
            stoneTypeQuality: "",
            platingType: "",
            weight: "",
            closureType: "",
          },
        });
      }

      if (formData.nonVariant?.nonVariantImages) {
        setNonVariantImages(formData.nonVariant.nonVariantImages);
      }

      if (formData.productImages && formData.productImages.length > 0) {
        setUploadedImages(formData.productImages);
      }
    }
  }, [isEditMode, formData]);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newImages = files.filter(
        (file) => file instanceof File && file.type.startsWith("image/")
      );
      if (newImages.length > 0) {
        const newUploadedImages = [...uploadedImages, ...newImages];
        setUploadedImages(newUploadedImages);
        updateFormData({ productImages: newUploadedImages });
      } else {
        alert("Please select valid image files.");
      }
    }
  };

  const handleRemoveImage = (imageToRemove) => {
    const updatedImages = uploadedImages.filter((img) => img !== imageToRemove);
    setUploadedImages(updatedImages);
    updateFormData({ productImages: updatedImages });
  };

  const handleNonVariantFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newImages = files.filter(
        (file) => file instanceof File && file.type.startsWith("image/")
      );
      if (newImages.length > 0) {
        const updatedNonVariantImages = [...nonVariantImages, ...newImages];
        setNonVariantImages(updatedNonVariantImages);
        updateFormData({
          nonVariant: {
            ...formData.nonVariant,
            nonVariantImages: updatedNonVariantImages,
          },
        });
      } else {
        alert("Please select valid image files.");
      }
    }
  };

  const handleRemoveNonVariantImage = (imageToRemove) => {
    const updatedImages = nonVariantImages.filter(
      (img) => img !== imageToRemove
    );
    setNonVariantImages(updatedImages);
    updateFormData({
      nonVariant: {
        ...formData.nonVariant,
        nonVariantImages: updatedImages,
      },
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("sareeAttributes.")) {
      const attributeKey = name.split(".")[1];
      const updatedAttributes = {
        ...categoryAttributes,
        sareeAttributes: {
          ...categoryAttributes.sareeAttributes,
          [attributeKey]: value,
        },
      };
      setCategoryAttributes(updatedAttributes);
      updateFormData({ sareeAttributes: updatedAttributes.sareeAttributes });
    } else if (name.startsWith("mensKidsAttributes.")) {
      const attributeKey = name.split(".")[1];
      const updatedAttributes = {
        ...categoryAttributes,
        mensKidsAttributes: {
          ...categoryAttributes.mensKidsAttributes,
          [attributeKey]: value,
        },
      };
      setCategoryAttributes(updatedAttributes);
      updateFormData({
        mensKidsAttributes: updatedAttributes.mensKidsAttributes,
      });
    } else if (name.startsWith("jewelleryAttributes.")) {
      const attributeKey = name.split(".")[1];
      const updatedAttributes = {
        ...categoryAttributes,
        jewelleryAttributes: {
          ...categoryAttributes.jewelleryAttributes,
          [attributeKey]: value,
        },
      };
      setCategoryAttributes(updatedAttributes);
      updateFormData({
        jewelleryAttributes: updatedAttributes.jewelleryAttributes,
      });
    } else if (name === "hasVariation") {
      updateFormData({
        hasVariation: checked,
        hasNonVariation: !checked,
        productType: checked ? "variant" : "nonVariant",
        variants: checked ? formData.variants : [],
        productTitle: checked ? "" : formData.productTitle,
        price: checked
          ? { costPrice: "", salePrice: "", discount: "", tax: "" }
          : formData.price,
        stockCount: checked ? "" : formData.stockCount,
        nonVariant: checked ? {} : formData.nonVariant,
      });
      if (!checked) setVariants([]);
    } else if (name === "hasNonVariation") {
      updateFormData({
        hasVariation: !checked,
        hasNonVariation: checked,
        productType: checked ? "nonVariant" : "variant",
        variants: checked ? [] : formData.variants,
        nonVariant: checked ? formData.nonVariant : {},
      });
      if (checked) setVariants([]);
    } else if (name === "productCategory") {
      const selectedCategory = categories.find(
        (cat) => cat.categoryTitle === value
      );
      updateFormData({
        productCategory: value,
        category_id: selectedCategory ? selectedCategory._id : "",
        productSubCategory: "",
        subcategory_id: "",
        sareeAttributes: {
          fabricMaterial: "",
          workEmbroidery: "",
          blouseType: "",
          borderDesign: "",
          length: "",
        },
        mensKidsAttributes: {
          setType: "",
          fabric: "",
          printPattern: "",
          ageGroup: "",
          fitType: "",
          sizeChartImage: "",
        },
        jewelleryAttributes: {
          metalTypePurity: "",
          stoneTypeQuality: "",
          platingType: "",
          weight: "",
          closureType: "",
        },
      });
      setCategoryAttributes({
        sareeAttributes: {
          fabricMaterial: "",
          workEmbroidery: "",
          blouseType: "",
          borderDesign: "",
          length: "",
        },
        mensKidsAttributes: {
          setType: "",
          fabric: "",
          printPattern: "",
          ageGroup: "",
          fitType: "",
          sizeChartImage: "",
        },
        jewelleryAttributes: {
          metalTypePurity: "",
          stoneTypeQuality: "",
          platingType: "",
          weight: "",
          closureType: "",
        },
      });
    } else if (name === "productSubCategory") {
      const selectedSubCategory = subCategories.find(
        (subCat) => subCat.subCategoryTitle === value
      );
      updateFormData({
        productSubCategory: value,
        subcategory_id: selectedSubCategory ? selectedSubCategory._id : "",
      });
    } else if (["costPrice", "salePrice", "discount", "tax"].includes(name)) {
      const updatedPrice = {
        ...formData.price,
        [name]: value === "" ? "" : parseFloat(value),
      };
      updateFormData({
        price: updatedPrice,
      });

      if (formData.hasNonVariation) {
        updateFormData({
          nonVariant: {
            ...formData.nonVariant,
            price: updatedPrice,
          },
        });
      }
    } else if (name === "stockCount") {
      const stockValue = value === "" ? "" : parseInt(value, 10);
      updateFormData({
        [name]: stockValue,
      });

      if (formData.hasNonVariation) {
        updateFormData({
          nonVariant: {
            ...formData.nonVariant,
            stockCount: stockValue,
          },
        });
      }
    } else if (name === "usageInstructions") {
      updateFormData({
        [name]: value,
      });
    } else {
      updateFormData({
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const handleVariantTypeChange = (e) => {
    const { value } = e.target;
    setCurrentVariant({
      variantType: value,
      sizeColorVariants: [],
      colorOnlyVariants: [],
      sizeOnlyVariants: [],
    });
    resetVariantForm();
  };

  const handleAddSize = () => {
    if (currentSize && !sizes.includes(currentSize)) {
      setSizes((prev) => [...prev, currentSize]);
      setSizeColorMap((prev) => ({
        ...prev,
        [currentSize]: [],
      }));
      setCurrentSize("");
    }
  };

  const handleRemoveSize = (index) => {
    const sizeToRemove = sizes[index];
    setSizes((prev) => prev.filter((_, i) => i !== index));
    setSizeColorMap((prev) => {
      const newMap = { ...prev };
      delete newMap[sizeToRemove];
      return newMap;
    });
    if (selectedSize === sizeToRemove) {
      setSelectedSize("");
    }
  };

  const handleAddColorToSize = () => {
    if (selectedSize && currentColor) {
      setSizeColorMap((prev) => ({
        ...prev,
        [selectedSize]: [
          ...(prev[selectedSize] || []),
          { color: currentColor },
        ],
      }));
      setCurrentColor("");
    }
  };

  const handleRemoveColorFromSize = (size, colorIndex) => {
    setSizeColorMap((prev) => ({
      ...prev,
      [size]: prev[size].filter((_, index) => index !== colorIndex),
    }));
  };

  const handleSizeColorVariantChange = (field, value) => {
    setCurrentSizeColorVariant((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSizeColorPriceChange = (field, value) => {
    setCurrentSizeColorVariant((prev) => ({
      ...prev,
      price: {
        ...prev.price,
        [field]: value === "" ? "" : parseFloat(value),
      },
    }));
  };

  const handleSizeColorImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setCurrentSizeColorVariant((prev) => ({
      ...prev,
      variantImages: [...prev.variantImages, ...files],
    }));
  };

  const handleRemoveSizeColorImage = (index) => {
    setCurrentSizeColorVariant((prev) => ({
      ...prev,
      variantImages: prev.variantImages.filter((_, i) => i !== index),
    }));
  };

  const handleColorVariantChange = (e) => {
    const { name, value } = e.target;
    setCurrentColorVariant((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleColorPriceChange = (e) => {
    const { name, value } = e.target;
    setCurrentColorVariant((prev) => ({
      ...prev,
      price: {
        ...prev.price,
        [name]: value === "" ? "" : parseFloat(value),
      },
    }));
  };

  const handleColorImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setCurrentColorVariant((prev) => ({
      ...prev,
      variantImages: [...prev.variantImages, ...files],
    }));
  };

  const handleRemoveColorImage = (index) => {
    setCurrentColorVariant((prev) => ({
      ...prev,
      variantImages: prev.variantImages.filter((_, i) => i !== index),
    }));
  };

  const handleSizeVariantChange = (e) => {
    const { name, value } = e.target;
    setCurrentSizeVariant((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSizePriceChange = (e) => {
    const { name, value } = e.target;
    setCurrentSizeVariant((prev) => ({
      ...prev,
      price: {
        ...prev.price,
        [name]: value === "" ? "" : parseFloat(value),
      },
    }));
  };

  const handleSizeImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setCurrentSizeVariant((prev) => ({
      ...prev,
      variantImages: [...prev.variantImages, ...files],
    }));
  };

  const handleRemoveSizeImage = (index) => {
    setCurrentSizeVariant((prev) => ({
      ...prev,
      variantImages: prev.variantImages.filter((_, i) => i !== index),
    }));
  };

  const getCurrentVariant = () => {
    switch (currentVariant.variantType) {
      case "sizeColor":
        return currentSizeColorVariant;
      case "colorOnly":
        return currentColorVariant;
      case "sizeOnly":
        return currentSizeVariant;
      default:
        return {};
    }
  };

  const getVariantArrayKey = () => {
    switch (currentVariant.variantType) {
      case "sizeColor":
        return "sizeColorVariants";
      case "colorOnly":
        return "colorOnlyVariants";
      case "sizeOnly":
        return "sizeOnlyVariants";
      default:
        return "";
    }
  };

  const canAddVariant = () => {
    const current = getCurrentVariant();
    switch (currentVariant.variantType) {
      case "sizeColor":
        return (
          current.size &&
          current.color &&
          current.stockCount &&
          current.price?.costPrice
        );
      case "colorOnly":
        return current.color && current.stockCount && current.price?.costPrice;
      case "sizeOnly":
        return current.size && current.stockCount && current.price?.costPrice;
      default:
        return false;
    }
  };

  const resetVariantForm = () => {
    setCurrentSizeColorVariant({
      size: "",
      color: "",
      stockCount: "",
      skuCode: "",
      productCode: "",
      variantImages: [],
      price: { costPrice: "", salePrice: "", discount: "", tax: "" },
    });
    setCurrentColorVariant({
      color: "",
      stockCount: "",
      skuCode: "",
      productCode: "",
      variantImages: [],
      price: { costPrice: "", salePrice: "", discount: "", tax: "" },
    });
    setCurrentSizeVariant({
      size: "",
      stockCount: "",
      skuCode: "",
      productCode: "",
      variantImages: [],
      price: { costPrice: "", salePrice: "", discount: "", tax: "" },
    });
    setCurrentSize("");
    setSelectedSize("");
    setCurrentColor("");
    setSizes([]);
    setSizeColorMap({});
    setIsEditingVariant(false);
    setEditingVariantId(null);
  };

  // Unified variant handler
  const handleAddVariant = () => {
    if (!canAddVariant()) {
      alert(
        "Please fill all required fields: size, color, stock count, and price"
      );
      return;
    }

    const current = getCurrentVariant();
    const arrayKey = getVariantArrayKey();

    if (!arrayKey) {
      console.error("No variant type selected");
      return;
    }

    // Create a deep copy of the current variant
    const newVariant = JSON.parse(
      JSON.stringify({
        ...current,
        _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      })
    );

    const updatedVariants = [...variants];
    let variantGroupIndex = updatedVariants.findIndex(
      (v) => v.variantType === currentVariant.variantType
    );

    if (variantGroupIndex === -1) {
      // Create new variant group
      variantGroupIndex = updatedVariants.length;
      updatedVariants.push({
        variantType: currentVariant.variantType,
        [arrayKey]: [newVariant],
      });
    } else {
      // Add to existing variant group
      if (!updatedVariants[variantGroupIndex][arrayKey]) {
        updatedVariants[variantGroupIndex][arrayKey] = [];
      }
      updatedVariants[variantGroupIndex][arrayKey].push(newVariant);
    }

    setVariants(updatedVariants);
    updateFormData({ variants: updatedVariants });

    // Show success message
    setSuccessMessage(`Variant added successfully!`);
    setTimeout(() => setSuccessMessage(""), 3000);

    // Reset form for next variant of same type
    if (currentVariant.variantType === "sizeColor") {
      setCurrentSizeColorVariant({
        ...currentSizeColorVariant,
        stockCount: "",
        skuCode: "",
        productCode: "",
        variantImages: [],
        price: { costPrice: "", salePrice: "", discount: "", tax: "" },
      });
    } else if (currentVariant.variantType === "colorOnly") {
      setCurrentColorVariant({
        ...currentColorVariant,
        stockCount: "",
        skuCode: "",
        productCode: "",
        variantImages: [],
        price: { costPrice: "", salePrice: "", discount: "", tax: "" },
      });
    } else if (currentVariant.variantType === "sizeOnly") {
      setCurrentSizeVariant({
        ...currentSizeVariant,
        stockCount: "",
        skuCode: "",
        productCode: "",
        variantImages: [],
        price: { costPrice: "", salePrice: "", discount: "", tax: "" },
      });
    }
  };

  const handleEditVariant = (variant) => {
    console.log("Editing variant:", variant);
    const variantType = variant.type;
    setIsEditingVariant(true);
    setEditingVariantId(variant.id);

    if (variantType === "Size-Color") {
      const [size, color] = variant.value.split(" - ");
      setCurrentVariant({
        variantType: "sizeColor",
        sizeColorVariants: [],
        colorOnlyVariants: [],
        sizeOnlyVariants: [],
      });
      setCurrentSizeColorVariant({
        size: size || "",
        color: color || "",
        stockCount: variant.stockCount,
        skuCode: variant.skuCode,
        productCode: variant.productCode,
        variantImages: variant.variantImages || [],
        price: {
          costPrice: variant.costPrice || "",
          salePrice: variant.salePrice || "",
          discount: variant.discount || "",
          tax: variant.tax || "",
        },
      });
    } else if (variantType === "Color Only") {
      setCurrentVariant({
        variantType: "colorOnly",
        sizeColorVariants: [],
        colorOnlyVariants: [],
        sizeOnlyVariants: [],
      });
      setCurrentColorVariant({
        color: variant.value,
        stockCount: variant.stockCount,
        skuCode: variant.skuCode,
        productCode: variant.productCode,
        variantImages: variant.variantImages || [],
        price: {
          costPrice: variant.costPrice || "",
          salePrice: variant.salePrice || "",
          discount: variant.discount || "",
          tax: variant.tax || "",
        },
      });
    } else if (variantType === "Size Only") {
      setCurrentVariant({
        variantType: "sizeOnly",
        sizeColorVariants: [],
        colorOnlyVariants: [],
        sizeOnlyVariants: [],
      });
      setCurrentSizeVariant({
        size: variant.value,
        stockCount: variant.stockCount,
        skuCode: variant.skuCode,
        productCode: variant.productCode,
        variantImages: variant.variantImages || [],
        price: {
          costPrice: variant.costPrice || "",
          salePrice: variant.salePrice || "",
          discount: variant.discount || "",
          tax: variant.tax || "",
        },
      });
    }
  };

  const handleSaveEditedVariant = () => {
    if (!canAddVariant() || !editingVariantId) {
      alert("Please fill all required fields");
      return;
    }

    const current = getCurrentVariant();
    const arrayKey = getVariantArrayKey();

    const updatedVariants = variants.map((variantGroup) => {
      if (
        variantGroup.variantType === currentVariant.variantType &&
        variantGroup[arrayKey]
      ) {
        const updatedArray = variantGroup[arrayKey].map((v) =>
          v._id === editingVariantId ? { ...current, _id: editingVariantId } : v
        );
        return { ...variantGroup, [arrayKey]: updatedArray };
      }
      return variantGroup;
    });

    setVariants(updatedVariants);
    updateFormData({ variants: updatedVariants });

    setSuccessMessage(`Variant updated successfully!`);
    setTimeout(() => setSuccessMessage(""), 3000);

    resetVariantForm();
  };

  const handleRemoveVariant = async (variantId) => {
    if (!window.confirm("Are you sure you want to remove this variant?"))
      return;

    if (isEditMode && formData._id) {
      try {
        await axios.delete(
          `/api/products/${formData._id}/variants/${variantId}`
        );
      } catch (error) {
        console.error("Error removing variant:", error);
        setApiError("Failed to remove variant. Please try again.");
        return;
      }
    }

    const updatedVariants = variants
      .map((variantGroup) => {
        const keys = [
          "sizeColorVariants",
          "colorOnlyVariants",
          "sizeOnlyVariants",
        ];
        keys.forEach((key) => {
          if (variantGroup[key]) {
            variantGroup[key] = variantGroup[key].filter(
              (v) => v._id !== variantId
            );
          }
        });
        return variantGroup;
      })
      .filter(
        (variantGroup) =>
          (variantGroup.sizeColorVariants &&
            variantGroup.sizeColorVariants.length > 0) ||
          (variantGroup.colorOnlyVariants &&
            variantGroup.colorOnlyVariants.length > 0) ||
          (variantGroup.sizeOnlyVariants &&
            variantGroup.sizeOnlyVariants.length > 0)
      );

    setVariants(updatedVariants);
    updateFormData({ variants: updatedVariants });

    setSuccessMessage(`Variant removed successfully!`);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleAddKeyIngredient = () => {
    if (keyIngredientInput.trim()) {
      const updatedIngredients = [...keyIngredients, keyIngredientInput.trim()];
      setKeyIngredients(updatedIngredients);
      updateFormData({
        keyIngredients: updatedIngredients,
      });
      setKeyIngredientInput("");
    }
  };

  const handleRemoveKeyIngredient = (ingredientToRemove) => {
    const updatedIngredients = keyIngredients.filter(
      (ing) => ing !== ingredientToRemove
    );
    setKeyIngredients(updatedIngredients);
    updateFormData({ keyIngredients: updatedIngredients });
  };

  const handleProductBenefitsChange = (e) => {
    const value = e.target.value;
    setProductBenefitsInput(value);

    const benefitsArray = value
      .split(",")
      .map((benefit) => benefit.trim())
      .filter((benefit) => benefit.length > 0);

    updateFormData({ productBenefits: benefitsArray });
  };

  const formatVariantsForTable = () => {
    const tableData = [];

    if (!variants || variants.length === 0) return tableData;

    variants.forEach((variantGroup) => {
      const { variantType } = variantGroup;

      let variantList = [];
      if (variantType === "sizeColor" && variantGroup.sizeColorVariants) {
        variantList = variantGroup.sizeColorVariants;
      } else if (
        variantType === "colorOnly" &&
        variantGroup.colorOnlyVariants
      ) {
        variantList = variantGroup.colorOnlyVariants;
      } else if (variantType === "sizeOnly" && variantGroup.sizeOnlyVariants) {
        variantList = variantGroup.sizeOnlyVariants;
      }

      variantList.forEach((variant, index) => {
        tableData.push({
          id: variant._id || `variant-${index}`,
          type:
            variantType === "sizeColor"
              ? "Size-Color"
              : variantType === "colorOnly"
              ? "Color Only"
              : "Size Only",
          value:
            variantType === "sizeColor"
              ? `${variant.size} - ${variant.color}`
              : variant.color || variant.size,
          stockCount: variant.stockCount,
          skuCode: variant.skuCode,
          productCode: variant.productCode,
          costPrice: variant.price?.costPrice,
          salePrice: variant.price?.salePrice,
          discount: variant.price?.discount,
          tax: variant.price?.tax,
          variantImages: variant.variantImages || [],
          variantIndex: variant.variantIndex || index + 1,
        });
      });
    });
    return tableData;
  };

  const columns = [
    {
      name: "Type",
      selector: (row) => row.type,
      sortable: true,
      width: "100px",
    },
    {
      name: "Variant",
      selector: (row) => row.value,
      sortable: true,
      width: "150px",
    },
    {
      name: "Regular Price",
      selector: (row) => `$${row.costPrice || "0.00"}`,
      sortable: true,
      width: "120px",
    },
    {
      name: "Sale Price",
      selector: (row) => (row.salePrice ? `$${row.salePrice}` : "-"),
      sortable: true,
      width: "120px",
    },
    {
      name: "Stock",
      selector: (row) => row.stockCount || "0",
      sortable: true,
      width: "100px",
    },
    {
      name: "SKU",
      selector: (row) => row.skuCode || "-",
      sortable: true,
      width: "120px",
    },
    {
      name: "Images",
      cell: (row) => (
        <div className="flex gap-1">
          {row.variantImages?.slice(0, 2).map((image, idx) => (
            <img
              key={idx}
              src={
                typeof image === "string" ? image : URL.createObjectURL(image)
              }
              alt={`Variant ${idx + 1}`}
              className="h-8 w-8 rounded object-cover"
              onError={(e) => {
                e.target.src = "/placeholder-image.jpg";
              }}
            />
          ))}
          {row.variantImages?.length > 2 && (
            <span className="text-xs text-gray-500">
              +{row.variantImages.length - 2}
            </span>
          )}
        </div>
      ),
      sortable: false,
      width: "100px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEditVariant(row)}
            className="text-blue-600 hover:text-blue-900 text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => handleRemoveVariant(row.id)}
            className="text-red-600 hover:text-red-900 text-sm"
          >
            Remove
          </button>
        </div>
      ),
      sortable: false,
      width: "120px",
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: "var(--color-table)",
        color: "#fff",
        fontWeight: "bold",
        padding: "12px 16px",
      },
    },
    cells: {
      style: {
        padding: "8px 12px",
      },
    },
    table: {
      style: {
        width: "100%",
        maxHeight: "400px",
      },
    },
  };

  const renderSizeColorSection = () => (
    <div className="space-y-6">
      <div className="border p-4 rounded-lg">
        <h5 className="text-md font-medium mb-3">Step 1: Define Sizes</h5>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Size Name *
            </label>
            <input
              type="text"
              placeholder="e.g., Small, Medium, Large, XL"
              value={currentSize}
              onChange={(e) => setCurrentSize(e.target.value)}
              className="border rounded p-2 w-full"
            />
          </div>
          <button
            onClick={handleAddSize}
            disabled={!currentSize}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-pink-600 disabled:bg-gray-400 h-fit"
          >
            Add Size
          </button>
        </div>
        {sizes.length > 0 && (
          <div className="mt-4">
            <h6 className="text-sm font-medium mb-2">Added Sizes:</h6>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size, index) => (
                <div
                  key={index}
                  className="flex items-center bg-gray-100 text-black px-3 py-1 rounded-full text-sm"
                >
                  {size}
                  <button
                    onClick={() => handleRemoveSize(index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <IoMdClose />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {sizes.length > 0 && (
        <div className="border p-4 rounded-lg">
          <h5 className="text-md font-medium mb-3">
            Step 2: Add Colors for Size
          </h5>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Select Size *
            </label>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="border rounded p-2 w-full md:w-64"
            >
              <option value="">Select a size</option>
              {sizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
          {selectedSize && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Color Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Red, Blue, Green"
                    value={currentColor}
                    onChange={(e) => setCurrentColor(e.target.value)}
                    className="border rounded p-2 w-full"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleAddColorToSize}
                    disabled={!currentColor}
                    className="bg-primary text-white px-4 py-2 rounded hover:bg-pink-600 disabled:bg-gray-400"
                  >
                    Add Color
                  </button>
                </div>
              </div>
              {sizeColorMap[selectedSize]?.length > 0 && (
                <div className="mt-4">
                  <h6 className="text-sm font-medium mb-2">
                    Colors for {selectedSize}:
                  </h6>
                  <div className="flex flex-wrap gap-2">
                    {sizeColorMap[selectedSize].map((colorObj, index) => (
                      <div
                        key={index}
                        className="flex items-center bg-blue-100 text-black px-3 py-1 rounded-full text-sm"
                      >
                        {colorObj.color}
                        <button
                          onClick={() =>
                            handleRemoveColorFromSize(selectedSize, index)
                          }
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <IoMdClose />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {Object.keys(sizeColorMap).length > 0 && (
        <div className="border p-4 rounded-lg">
          <h5 className="text-md font-medium mb-3">
            Step 3: Configure Individual Variants
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Select Size
              </label>
              <select
                value={currentSizeColorVariant.size}
                onChange={(e) =>
                  handleSizeColorVariantChange("size", e.target.value)
                }
                className="border rounded p-2 w-full"
              >
                <option value="">Select size</option>
                {sizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Select Color
              </label>
              <select
                value={currentSizeColorVariant.color}
                onChange={(e) =>
                  handleSizeColorVariantChange("color", e.target.value)
                }
                className="border rounded p-2 w-full"
                disabled={!currentSizeColorVariant.size}
              >
                <option value="">Select color</option>
                {sizeColorMap[currentSizeColorVariant.size]?.map(
                  (colorObj, index) => (
                    <option key={index} value={colorObj.color}>
                      {colorObj.color}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
          {currentSizeColorVariant.size && currentSizeColorVariant.color && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Stock Count *
                  </label>
                  <input
                    type="number"
                    placeholder="Stock count"
                    min="0"
                    step="1"
                    value={currentSizeColorVariant.stockCount}
                    onChange={(e) =>
                      handleSizeColorVariantChange("stockCount", e.target.value)
                    }
                    className="border rounded p-2 w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    placeholder="SKU code"
                    value={currentSizeColorVariant.skuCode}
                    onChange={(e) =>
                      handleSizeColorVariantChange("skuCode", e.target.value)
                    }
                    className="border rounded p-2 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Product Code
                  </label>
                  <input
                    type="text"
                    placeholder="Product code"
                    value={currentSizeColorVariant.productCode}
                    onChange={(e) =>
                      handleSizeColorVariantChange(
                        "productCode",
                        e.target.value
                      )
                    }
                    className="border rounded p-2 w-full"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Regular Price ($) *
                  </label>
                  <input
                    type="number"
                    placeholder="Regular Price"
                    min="0"
                    step="0.01"
                    value={currentSizeColorVariant.price?.costPrice || ""}
                    onChange={(e) =>
                      handleSizeColorPriceChange("costPrice", e.target.value)
                    }
                    className="border rounded p-2 w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Sale Price ($)
                  </label>
                  <input
                    type="number"
                    placeholder="Sale Price"
                    min="0"
                    step="0.01"
                    value={currentSizeColorVariant.price?.salePrice || ""}
                    onChange={(e) =>
                      handleSizeColorPriceChange("salePrice", e.target.value)
                    }
                    className="border rounded p-2 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    placeholder="Discount"
                    min="0"
                    max="100"
                    step="1"
                    value={currentSizeColorVariant.price?.discount || ""}
                    onChange={(e) =>
                      handleSizeColorPriceChange("discount", e.target.value)
                    }
                    className="border rounded p-2 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Tax (%)
                  </label>
                  <input
                    type="number"
                    placeholder="Tax"
                    min="0"
                    max="100"
                    step="1"
                    value={currentSizeColorVariant.price?.tax || ""}
                    onChange={(e) =>
                      handleSizeColorPriceChange("tax", e.target.value)
                    }
                    className="border rounded p-2 w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Variant Images
                </label>
                <input
                  type="file"
                  multiple
                  onChange={handleSizeColorImagesChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  accept="image/*"
                />
                {currentSizeColorVariant.variantImages.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {currentSizeColorVariant.variantImages.map(
                      (image, index) => (
                        <div key={index} className="relative w-20 h-20">
                          <img
                            src={
                              typeof image === "string"
                                ? image
                                : URL.createObjectURL(image)
                            }
                            alt={`Variant ${currentSizeColorVariant.size}-${
                              currentSizeColorVariant.color
                            } ${index + 1}`}
                            className="w-full h-full object-cover rounded border"
                          />
                          <button
                            onClick={() => handleRemoveSizeColorImage(index)}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={
                    isEditingVariant
                      ? handleSaveEditedVariant
                      : handleAddVariant
                  }
                  disabled={!canAddVariant()}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
                >
                  {isEditingVariant
                    ? `Update ${currentSizeColorVariant.size} - ${currentSizeColorVariant.color} Variant`
                    : `Add ${currentSizeColorVariant.size} - ${currentSizeColorVariant.color} Variant`}
                </button>
                {!isEditingVariant && (
                  <button
                    onClick={resetVariantForm}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Clear Form
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderColorOnlySection = () => (
    <div className="space-y-4 border p-4 rounded-lg">
      <h5 className="text-md font-medium mb-3">Configure Color-Only Variant</h5>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Color *
          </label>
          <input
            type="text"
            name="color"
            placeholder="e.g., Red, Blue, Green"
            value={currentColorVariant.color}
            onChange={handleColorVariantChange}
            className={`border rounded p-2 w-full ${
              errors.color ? "border-red-500 bg-red-50" : ""
            }`}
            required
          />
          {errors.color && (
            <p className="text-red-500 text-sm mt-1">{errors.color}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Stock Count *
          </label>
          <input
            type="number"
            name="stockCount"
            placeholder="Stock count"
            min="0"
            step="1"
            value={currentColorVariant.stockCount}
            onChange={handleColorVariantChange}
            className={`border rounded p-2 w-full ${
              errors.stockCount ? "border-red-500 bg-red-50" : ""
            }`}
            required
          />
          {errors.stockCount && (
            <p className="text-red-500 text-sm mt-1">{errors.stockCount}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            SKU Code
          </label>
          <input
            type="text"
            name="skuCode"
            placeholder="SKU code"
            value={currentColorVariant.skuCode}
            onChange={handleColorVariantChange}
            className="border rounded p-2 w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Product Code
          </label>
          <input
            type="text"
            name="productCode"
            placeholder="Product code"
            value={currentColorVariant.productCode}
            onChange={handleColorVariantChange}
            className="border rounded p-2 w-full"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Regular Price ($) *
          </label>
          <input
            type="number"
            name="costPrice"
            placeholder="Regular Price"
            min="0"
            step="0.01"
            value={currentColorVariant.price?.costPrice || ""}
            onChange={handleColorPriceChange}
            className={`border rounded p-2 w-full ${
              errors.costPrice ? "border-red-500 bg-red-50" : ""
            }`}
            required
          />
          {errors.costPrice && (
            <p className="text-red-500 text-sm mt-1">{errors.costPrice}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Sale Price ($)
          </label>
          <input
            type="number"
            name="salePrice"
            placeholder="Sale Price"
            min="0"
            step="0.01"
            value={currentColorVariant.price?.salePrice || ""}
            onChange={handleColorPriceChange}
            className="border rounded p-2 w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Discount (%)
          </label>
          <input
            type="number"
            name="discount"
            placeholder="Discount"
            min="0"
            max="100"
            step="1"
            value={currentColorVariant.price?.discount || ""}
            onChange={handleColorPriceChange}
            className="border rounded p-2 w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Tax (%)
          </label>
          <input
            type="number"
            name="tax"
            placeholder="Tax"
            min="0"
            max="100"
            step="1"
            value={currentColorVariant.price?.tax || ""}
            onChange={handleColorPriceChange}
            className="border rounded p-2 w-full"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Variant Images
        </label>
        <input
          type="file"
          multiple
          onChange={handleColorImagesChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          accept="image/*"
        />
        {currentColorVariant.variantImages.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {currentColorVariant.variantImages.map((image, index) => (
              <div key={index} className="relative w-20 h-20">
                <img
                  src={
                    typeof image === "string"
                      ? image
                      : URL.createObjectURL(image)
                  }
                  alt={`Color variant ${index + 1}`}
                  className="w-full h-full object-cover rounded border"
                />
                <button
                  onClick={() => handleRemoveColorImage(index)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={
            isEditingVariant ? handleSaveEditedVariant : handleAddVariant
          }
          disabled={!canAddVariant()}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          {isEditingVariant
            ? `Update ${currentColorVariant.color} Variant`
            : `Add ${currentColorVariant.color} Variant`}
        </button>
        {!isEditingVariant && (
          <button
            onClick={resetVariantForm}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Clear Form
          </button>
        )}
      </div>
    </div>
  );

  const renderSizeOnlySection = () => (
    <div className="space-y-4 border p-4 rounded-lg">
      <h5 className="text-md font-medium mb-3">Configure Size-Only Variant</h5>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Size *
          </label>
          <input
            type="text"
            name="size"
            placeholder="e.g., Small, Medium, Large"
            value={currentSizeVariant.size}
            onChange={handleSizeVariantChange}
            className={`border rounded p-2 w-full ${
              errors.size ? "border-red-500 bg-red-50" : ""
            }`}
            required
          />
          {errors.size && (
            <p className="text-red-500 text-sm mt-1">{errors.size}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Stock Count *
          </label>
          <input
            type="number"
            name="stockCount"
            placeholder="Stock count"
            min="0"
            step="1"
            value={currentSizeVariant.stockCount}
            onChange={handleSizeVariantChange}
            className={`border rounded p-2 w-full ${
              errors.stockCount ? "border-red-500 bg-red-50" : ""
            }`}
            required
          />
          {errors.stockCount && (
            <p className="text-red-500 text-sm mt-1">{errors.stockCount}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            SKU Code
          </label>
          <input
            type="text"
            name="skuCode"
            placeholder="SKU code"
            value={currentSizeVariant.skuCode}
            onChange={handleSizeVariantChange}
            className="border rounded p-2 w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Product Code
          </label>
          <input
            type="text"
            name="productCode"
            placeholder="Product code"
            value={currentSizeVariant.productCode}
            onChange={handleSizeVariantChange}
            className="border rounded p-2 w-full"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Regular Price ($) *
          </label>
          <input
            type="number"
            name="costPrice"
            placeholder="Regular Price"
            min="0"
            step="0.01"
            value={currentSizeVariant.price?.costPrice || ""}
            onChange={handleSizePriceChange}
            className={`border rounded p-2 w-full ${
              errors.costPrice ? "border-red-500 bg-red-50" : ""
            }`}
            required
          />
          {errors.costPrice && (
            <p className="text-red-500 text-sm mt-1">{errors.costPrice}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Sale Price ($)
          </label>
          <input
            type="number"
            name="salePrice"
            placeholder="Sale Price"
            min="0"
            step="0.01"
            value={currentSizeVariant.price?.salePrice || ""}
            onChange={handleSizePriceChange}
            className="border rounded p-2 w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Discount (%)
          </label>
          <input
            type="number"
            name="discount"
            placeholder="Discount"
            min="0"
            max="100"
            step="1"
            value={currentSizeVariant.price?.discount || ""}
            onChange={handleSizePriceChange}
            className="border rounded p-2 w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Tax (%)
          </label>
          <input
            type="number"
            name="tax"
            placeholder="Tax"
            min="0"
            max="100"
            step="1"
            value={currentSizeVariant.price?.tax || ""}
            onChange={handleSizePriceChange}
            className="border rounded p-2 w-full"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Variant Images
        </label>
        <input
          type="file"
          multiple
          onChange={handleSizeImagesChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          accept="image/*"
        />
        {currentSizeVariant.variantImages.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {currentSizeVariant.variantImages.map((image, index) => (
              <div key={index} className="relative w-20 h-20">
                <img
                  src={
                    typeof image === "string"
                      ? image
                      : URL.createObjectURL(image)
                  }
                  alt={`Size variant ${index + 1}`}
                  className="w-full h-full object-cover rounded border"
                />
                <button
                  onClick={() => handleRemoveSizeImage(index)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={
            isEditingVariant ? handleSaveEditedVariant : handleAddVariant
          }
          disabled={!canAddVariant()}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          {isEditingVariant
            ? `Update ${currentSizeVariant.size} Variant`
            : `Add ${currentSizeVariant.size} Variant`}
        </button>
        {!isEditingVariant && (
          <button
            onClick={resetVariantForm}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Clear Form
          </button>
        )}
      </div>
    </div>
  );

  const renderNonVariantImagesSection = () => (
    <div className="w-full mt-4">
      <h3 className="text-lg font-medium mb-3">Non-Variant Images</h3>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col justify-center items-center relative">
        <FaUpload className="text-orange-500 text-2xl mb-2" />
        <input
          type="file"
          onChange={handleNonVariantFileUpload}
          className="absolute opacity-0 cursor-pointer inset-0"
          multiple
          accept="image/*"
        />
        <p className="text-gray-500 text-sm">
          Drag non-variant images here, or{" "}
          <span className="text-orange-500 cursor-pointer">
            click to browse
          </span>
        </p>
      </div>
      {nonVariantImages.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-4">
          {nonVariantImages.map((image, index) => (
            <div key={index} className="relative border rounded-md">
              <img
                src={
                  typeof image === "string" ? image : URL.createObjectURL(image)
                }
                alt={`Non-variant ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg p-4"
              />
              <button
                onClick={() => handleRemoveNonVariantImage(image)}
                className="absolute top-0.5 text-xs right-1 p-1 rounded-full bg-red-500 text-white"
              >
                X
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderUsageInstructionsSection = () => (
    <div className="w-full mt-4">
      <label
        htmlFor="usageInstructions"
        className="block text-sm font-medium text-gray-600 mb-2"
      >
        Product Usage Instructions *
      </label>
      <textarea
        id="usageInstructions"
        name="usageInstructions"
        placeholder="Provide detailed instructions on how to use the product, care instructions, washing instructions, etc."
        value={formData.usageInstructions || ""}
        className={`border rounded p-3 w-full h-40 ${
          errors.usageInstructions
            ? "border-red-500 bg-red-50"
            : "border-gray-300"
        }`}
        onChange={handleInputChange}
        required
      />
      {errors.usageInstructions && (
        <p className="text-red-500 text-sm mt-1">{errors.usageInstructions}</p>
      )}
      <p className="text-xs text-gray-500 mt-1">
        Minimum 50 characters. Include care instructions, washing guidelines,
        and any special usage notes.
      </p>
    </div>
  );

  const renderKeyIngredientsSection = () => (
    <div className="w-full mt-4">
      <h3 className="text-lg font-medium mb-3">Key Ingredients</h3>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Add an ingredient (e.g., Organic Cotton, Silk, Gold)"
          value={keyIngredientInput}
          onChange={(e) => setKeyIngredientInput(e.target.value)}
          className="border rounded p-2 flex-grow border-gray-300"
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddKeyIngredient();
            }
          }}
        />
        <button
          onClick={handleAddKeyIngredient}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-pink-600"
        >
          Add
        </button>
      </div>
      {keyIngredients.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {keyIngredients.map((ingredient, index) => (
            <div
              key={index}
              className="flex items-center bg-gray-100 text-black px-3 py-1 rounded-full text-sm"
            >
              {ingredient}
              <button
                onClick={() => handleRemoveKeyIngredient(ingredient)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <IoMdClose />
              </button>
            </div>
          ))}
        </div>
      )}
      {errors.keyIngredients && (
        <p className="text-red-500 text-sm mt-1">{errors.keyIngredients}</p>
      )}
      <p className="text-xs text-gray-500 mt-2">
        Add key ingredients, materials, or components used in the product. Press
        Enter or click Add to include.
      </p>
    </div>
  );

  const renderProductBenefitsSection = () => (
    <div className="w-full mt-4">
      <h3 className="text-lg font-medium mb-3">Product Benefits</h3>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Enter Product Benefits (comma-separated) *
        </label>
        <input
          type="text"
          placeholder="e.g., Hypoallergenic, Eco-friendly, Durable, Comfortable"
          value={productBenefitsInput}
          onChange={handleProductBenefitsChange}
          className={`border rounded p-2 w-full ${
            errors.productBenefits
              ? "border-red-500 bg-red-50"
              : "border-gray-300"
          }`}
          required
        />
        {errors.productBenefits && (
          <p className="text-red-500 text-sm mt-1">{errors.productBenefits}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Enter benefits separated by commas (e.g., Hypoallergenic,
          Eco-friendly, Durable)
        </p>
      </div>
      {formData.productBenefits && formData.productBenefits.length > 0 && (
        <div className="mt-2">
          <p className="text-sm font-medium text-gray-600 mb-2">
            Added Benefits:
          </p>
          <div className="flex flex-wrap gap-2">
            {formData.productBenefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
              >
                {benefit}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderCategoryAttributes = () => {
    const category = formData.productCategory?.toLowerCase();
    if (category === "sarees") {
      return (
        <div className="w-full mt-4">
          <h3 className="text-lg font-medium mb-3">Saree Attributes</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Fabric Material *
              </label>
              <input
                type="text"
                name="sareeAttributes.fabricMaterial"
                placeholder="e.g., Silk, Cotton, Georgette"
                value={categoryAttributes.sareeAttributes.fabricMaterial}
                onChange={handleInputChange}
                className={`border rounded p-2 w-full ${
                  errors.sareeAttributes?.fabricMaterial
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
                required
              />
              {errors.sareeAttributes?.fabricMaterial && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.sareeAttributes.fabricMaterial}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Work/Embroidery
              </label>
              <input
                type="text"
                name="sareeAttributes.workEmbroidery"
                placeholder="e.g., Zari, Embroidery, Plain"
                value={categoryAttributes.sareeAttributes.workEmbroidery}
                onChange={handleInputChange}
                className="border rounded p-2 w-full border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Blouse Type
              </label>
              <input
                type="text"
                name="sareeAttributes.blouseType"
                placeholder="e.g., Stitched, Unstitched, Included"
                value={categoryAttributes.sareeAttributes.blouseType}
                onChange={handleInputChange}
                className="border rounded p-2 w-full border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Border Design
              </label>
              <input
                type="text"
                name="sareeAttributes.borderDesign"
                placeholder="e.g., Traditional, Designer, Plain"
                value={categoryAttributes.sareeAttributes.borderDesign}
                onChange={handleInputChange}
                className="border rounded p-2 w-full border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Length
              </label>
              <input
                type="text"
                name="sareeAttributes.length"
                placeholder="e.g., 5.5 meters, 6.3 meters"
                value={categoryAttributes.sareeAttributes.length}
                onChange={handleInputChange}
                className="border rounded p-2 w-full border-gray-300"
              />
            </div>
          </div>
        </div>
      );
    } else if (
      ["mens", "kids", "menswear", "kidswear", "mens&kids"].includes(category)
    ) {
      return (
        <div className="w-full mt-4">
          <h3 className="text-lg font-medium mb-3">Mens/Kids Attributes</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Set Type *
              </label>
              <input
                type="text"
                name="mensKidsAttributes.setType"
                placeholder="e.g., Single Shirt, Shirt+Pant Set"
                value={categoryAttributes.mensKidsAttributes.setType}
                onChange={handleInputChange}
                className={`border rounded p-2 w-full ${
                  errors.mensKidsAttributes?.setType
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
                required
              />
              {errors.mensKidsAttributes?.setType && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.mensKidsAttributes.setType}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Fabric
              </label>
              <input
                type="text"
                name="mensKidsAttributes.fabric"
                placeholder="e.g., Cotton, Polyester, Blend"
                value={categoryAttributes.mensKidsAttributes.fabric}
                onChange={handleInputChange}
                className="border rounded p-2 w-full border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Print/Pattern
              </label>
              <input
                type="text"
                name="mensKidsAttributes.printPattern"
                placeholder="e.g., Solid, Striped, Checkered"
                value={categoryAttributes.mensKidsAttributes.printPattern}
                onChange={handleInputChange}
                className="border rounded p-2 w-full border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Age Group
              </label>
              <input
                type="text"
                name="mensKidsAttributes.ageGroup"
                placeholder="e.g., Adult, Kids 2-5 years"
                value={categoryAttributes.mensKidsAttributes.ageGroup}
                onChange={handleInputChange}
                className="border rounded p-2 w-full border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Fit Type
              </label>
              <select
                name="mensKidsAttributes.fitType"
                value={categoryAttributes.mensKidsAttributes.fitType}
                onChange={handleInputChange}
                className="border rounded p-2 w-full border-gray-300"
              >
                <option value="">Select Fit Type</option>
                <option value="Regular">Regular</option>
                <option value="Slim">Slim</option>
                <option value="Loose">Loose</option>
                <option value="Oversized">Oversized</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Size Chart Image
              </label>
              <input
                type="text"
                name="mensKidsAttributes.sizeChartImage"
                placeholder="URL to size chart image"
                value={categoryAttributes.mensKidsAttributes.sizeChartImage}
                onChange={handleInputChange}
                className="border rounded p-2 w-full border-gray-300"
              />
            </div>
          </div>
        </div>
      );
    } else if (category === "jewellery") {
      return (
        <div className="w-full mt-4">
          <h3 className="text-lg font-medium mb-3">Jewellery Attributes</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Metal Type/Purity *
              </label>
              <input
                type="text"
                name="jewelleryAttributes.metalTypePurity"
                placeholder="e.g., 22K Gold, 925 Silver, Brass"
                value={categoryAttributes.jewelleryAttributes.metalTypePurity}
                onChange={handleInputChange}
                className={`border rounded p-2 w-full ${
                  errors.jewelleryAttributes?.metalTypePurity
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
                required
              />
              {errors.jewelleryAttributes?.metalTypePurity && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.jewelleryAttributes.metalTypePurity}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Stone Type/Quality
              </label>
              <input
                type="text"
                name="jewelleryAttributes.stoneTypeQuality"
                placeholder="e.g., Diamond, Kundan, Cubic Zirconia"
                value={categoryAttributes.jewelleryAttributes.stoneTypeQuality}
                onChange={handleInputChange}
                className="border rounded p-2 w-full border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Plating Type
              </label>
              <input
                type="text"
                name="jewelleryAttributes.platingType"
                placeholder="e.g., Gold Plated, Rose Gold, Rhodium"
                value={categoryAttributes.jewelleryAttributes.platingType}
                onChange={handleInputChange}
                className="border rounded p-2 w-full border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Weight (grams)
              </label>
              <input
                type="number"
                name="jewelleryAttributes.weight"
                placeholder="Weight in grams"
                min="0"
                step="0.01"
                value={categoryAttributes.jewelleryAttributes.weight}
                onChange={handleInputChange}
                className="border rounded p-2 w-full border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Closure Type
              </label>
              <input
                type="text"
                name="jewelleryAttributes.closureType"
                placeholder="e.g., Hook, Screw Back, Push Back"
                value={categoryAttributes.jewelleryAttributes.closureType}
                onChange={handleInputChange}
                className="border rounded p-2 w-full border-gray-300"
              />
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="col-span-2 space-y-2 bg-white shadow-lg rounded-lg p-6 w-full">
      <h2 className="text-xl font-semibold mb-6">Product Information</h2>
      {apiError && <p className="text-red-500 text-sm mb-4">{apiError}</p>}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col justify-center items-center relative">
        <FaUpload className="text-orange-500 text-4xl mb-2" />
        <input
          type="file"
          onChange={handleFileUpload}
          className="absolute opacity-0 cursor-pointer inset-0"
          multiple
          accept="image/*"
        />
        <p className="text-gray-500">
          Drag your images here, or{" "}
          <span className="text-orange-500 cursor-pointer">
            click to browse
          </span>
        </p>
      </div>
      {errors.productImages && (
        <p className="text-red-500 text-sm mt-1">{errors.productImages}</p>
      )}
      <div className="grid grid-cols-3 gap-2 mt-4">
        {uploadedImages.map((image, index) => (
          <div key={index} className="relative border rounded-md">
            <img
              src={
                typeof image === "string" ? image : URL.createObjectURL(image)
              }
              alt={`Uploaded ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg p-6"
            />
            <button
              onClick={() => handleRemoveImage(image)}
              className="absolute top-0.5 text-xs right-1 p-1 rounded-full bg-red-500 text-white"
            >
              X
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-4 flex-wrap mt-6">
        <div className="w-full md:w-[calc(25%-12px)]">
          <label
            htmlFor="productCategory"
            className="block text-sm font-medium text-gray-600 mb-2"
          >
            Category *
          </label>
          <select
            id="productCategory"
            name="productCategory"
            className={`border rounded p-2 w-full ${
              errors.productCategory
                ? "border-red-500 bg-red-50"
                : "border-black"
            }`}
            onChange={handleInputChange}
            value={formData.productCategory || ""}
            required
          >
            <option value="">Choose a category</option>
            {categories.map((category) => (
              <option key={category._id} value={category.categoryTitle}>
                {category.categoryTitle}
              </option>
            ))}
          </select>
          {errors.productCategory && (
            <p className="text-red-500 text-sm mt-1">
              {errors.productCategory}
            </p>
          )}
        </div>
        <div className="w-full md:w-[calc(25%-12px)]">
          <label
            htmlFor="productSubCategory"
            className="block text-sm font-medium text-gray-600 mb-2"
          >
            SubCategory *
          </label>
          <select
            id="productSubCategory"
            name="productSubCategory"
            className={`border rounded p-2 w-full ${
              errors.productSubCategory
                ? "border-red-500 bg-red-50"
                : "border-black"
            }`}
            onChange={handleInputChange}
            value={formData.productSubCategory || ""}
            required
            disabled={!formData.productCategory}
          >
            <option value="">Choose a subcategory</option>
            {subCategories.map((subCategory) => (
              <option
                key={subCategory._id}
                value={subCategory.subCategoryTitle}
              >
                {subCategory.subCategoryTitle}
              </option>
            ))}
          </select>
          {errors.productSubCategory && (
            <p className="text-red-500 text-sm mt-1">
              {errors.productSubCategory}
            </p>
          )}
        </div>
        <div className="w-full md:w-[calc(25%-12px)]">
          <label
            htmlFor="productName"
            className="block text-sm font-medium text-gray-600 mb-2"
          >
            Product Name *
          </label>
          <input
            id="productName"
            type="text"
            name="productName"
            placeholder="Product Name"
            className={`border rounded p-2 w-full ${
              errors.productName ? "border-red-500 bg-red-50" : "border-black"
            }`}
            onChange={handleInputChange}
            value={formData.productName || ""}
            required
          />
          {errors.productName && (
            <p className="text-red-500 text-sm mt-1">{errors.productName}</p>
          )}
        </div>
        <div className="w-full md:w-[calc(25%-12px)]">
          <label
            htmlFor="productTitle"
            className="block text-sm font-medium text-gray-600 mb-2"
          >
            Product Title *
          </label>
          <input
            id="productTitle"
            type="text"
            name="productTitle"
            placeholder="Product Title"
            className={`border rounded p-2 w-full ${
              errors.productTitle ? "border-red-500 bg-red-50" : "border-black"
            }`}
            onChange={handleInputChange}
            value={formData.productTitle || ""}
            required
          />
          {errors.productTitle && (
            <p className="text-red-500 text-sm mt-1">{errors.productTitle}</p>
          )}
        </div>
      </div>

      {renderUsageInstructionsSection()}
      {renderKeyIngredientsSection()}
      {renderProductBenefitsSection()}

      <div className="w-full mb-4 mt-6">
        <h2 className="text-xl font-title mb-4">
          Product Type{" "}
          <span className="text-lg text-gray-600">(variation)</span>
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <input
              id="hasVariation"
              type="checkbox"
              name="hasVariation"
              checked={formData.hasVariation || false}
              onChange={handleInputChange}
              className="h-4 w-4"
            />
            <label
              htmlFor="hasVariation"
              className="ml-2 text-sm text-gray-700"
            >
              Variation
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="hasNonVariation"
              type="checkbox"
              name="hasNonVariation"
              checked={formData.hasNonVariation || false}
              onChange={handleInputChange}
              className="h-4 w-4"
            />
            <label
              htmlFor="hasNonVariation"
              className="ml-2 text-sm text-gray-700"
            >
              Non Variation
            </label>
          </div>
        </div>
      </div>

      {formData.hasVariation && (
        <div className="w-full space-y-4 mt-4">
          <h3 className="text-lg font-medium">Product Variants</h3>
          <div className="border p-4 rounded-lg mb-4">
            <h4 className="text-md font-medium mb-3">Variant Configuration</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Variant Type *
                </label>
                <select
                  name="variantType"
                  value={currentVariant.variantType}
                  onChange={handleVariantTypeChange}
                  className="border rounded p-2 w-full"
                  required
                >
                  <option value="">Select Variant Type</option>
                  <option value="sizeColor">Size + Color</option>
                  <option value="colorOnly">Color Only</option>
                  <option value="sizeOnly">Size Only</option>
                </select>
              </div>
            </div>
            {currentVariant.variantType === "sizeColor" &&
              renderSizeColorSection()}
            {currentVariant.variantType === "colorOnly" &&
              renderColorOnlySection()}
            {currentVariant.variantType === "sizeOnly" &&
              renderSizeOnlySection()}
          </div>
          {variants.length > 0 && (
            <div className="mt-6 rounded w-full overflow-x-auto">
              <h4 className="text-md font-medium mb-3">Added Variants</h4>
              <DataTable
                columns={columns}
                data={formatVariantsForTable()}
                fixedHeader
                fixedHeaderScrollHeight="400px"
                customStyles={customStyles}
                highlightOnHover
                responsive
              />
            </div>
          )}
        </div>
      )}

      {formData.hasNonVariation && (
        <div className="w-full space-y-4 mt-4">
          <h3 className="text-lg font-medium">Non-Variation Product Details</h3>
          {renderNonVariantImagesSection()}

          <div className="flex gap-4 flex-wrap">
            <div className="w-full md:w-[calc(25%-12px)]">
              <label
                htmlFor="productTitle"
                className="block text-sm font-medium text-gray-600 mb-2"
              >
                Product Title *
              </label>
              <input
                id="productTitle"
                type="text"
                name="productTitle"
                placeholder="Product Title"
                className={`border rounded p-2 w-full ${
                  errors.productTitle
                    ? "border-red-500 bg-red-50"
                    : "border-black"
                }`}
                onChange={handleInputChange}
                value={formData.productTitle || ""}
                required
              />
              {errors.productTitle && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.productTitle}
                </p>
              )}
            </div>
            <div className="w-full md:w-[calc(25%-12px)]">
              <label
                htmlFor="stockCount"
                className="block text-sm font-medium text-gray-600 mb-2"
              >
                Stock Count *
              </label>
              <input
                id="stockCount"
                type="number"
                name="stockCount"
                placeholder="Stock Count"
                min="0"
                step="1"
                className={`border rounded p-2 w-full ${
                  errors.stockCount
                    ? "border-red-500 bg-red-50"
                    : "border-black"
                }`}
                onChange={handleInputChange}
                value={formData.nonVariant.stockCount || ""}
                required
              />
              {errors.stockCount && (
                <p className="text-red-500 text-sm mt-1">{errors.stockCount}</p>
              )}
            </div>
          </div>
          <div className="mt-6">
            <h2 className="text-xl font-title mb-4">Pricing Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="costPrice"
                  className="block text-sm font-medium text-gray-600 mb-2"
                >
                  Regular Price ($) *
                </label>
                <input
                  id="costPrice"
                  type="number"
                  name="costPrice"
                  placeholder="Regular Price"
                  min="0"
                  step="0.01"
                  className={`border rounded p-2 w-full ${
                    errors.costPrice
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  value={formData.nonVariant.price?.costPrice || ""}
                  onChange={handleInputChange}
                  required
                />
                {errors.costPrice && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.costPrice}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="salePrice"
                  className="block text-sm font-medium text-gray-600 mb-2"
                >
                  Sale Price ($)
                </label>
                <input
                  id="salePrice"
                  type="number"
                  name="salePrice"
                  placeholder="Sale Price"
                  min="0"
                  step="0.01"
                  className="border rounded p-2 w-full border-gray-300"
                  value={formData.nonVariant.price?.salePrice || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label
                  htmlFor="discount"
                  className="block text-sm font-medium text-gray-600 mb-2"
                >
                  Discount (%)
                </label>
                <input
                  id="discount"
                  type="number"
                  name="discount"
                  placeholder="Discount"
                  min="0"
                  max="100"
                  step="1"
                  className="border rounded p-2 w-full border-gray-300"
                  value={formData.nonVariant.price?.discount || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label
                  htmlFor="tax"
                  className="block text-sm font-medium text-gray-600 mb-2"
                >
                  Tax (%)
                </label>
                <input
                  id="tax"
                  type="number"
                  name="tax"
                  placeholder="Tax"
                  min="0"
                  max="100"
                  step="1"
                  className="border rounded p-2 w-full border-gray-300"
                  value={formData.nonVariant.price?.tax || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full mt-4">
        <label
          htmlFor="productDescription"
          className="block text-sm font-medium text-gray-600 mb-2"
        >
          Description *
        </label>
        <textarea
          id="productDescription"
          name="productDescription"
          placeholder="Product description (minimum 20 characters)"
          value={formData.productDescription || ""}
          className={`border rounded p-2 w-full h-32 ${
            errors.productDescription
              ? "border-red-500 bg-red-50"
              : "border-black"
          }`}
          onChange={handleInputChange}
          required
        />
        {errors.productDescription && (
          <p className="text-red-500 text-sm mt-1">
            {errors.productDescription}
          </p>
        )}
      </div>

      {renderCategoryAttributes()}

      <div className="w-full mt-4">
        <label
          htmlFor="status"
          className="block text-sm font-medium text-gray-600 mb-2"
        >
          Product Status *
        </label>
        <select
          id="status"
          name="status"
          className="border rounded p-2 w-full"
          value={formData.status || "active"}
          onChange={handleInputChange}
          required
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>
  );
};

export default ProductForm;
