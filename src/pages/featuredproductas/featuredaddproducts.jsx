// import React, { useState } from "react";
// import DataTable from "react-data-table-component";
// import { FaEdit, FaTrashAlt } from "react-icons/fa";
// import { Modal, Button } from "antd";
// import { div } from "framer-motion/client";
// import { useNavigate, useParams } from "react-router-dom";

// const Featuredaddproducts = () => {
//   const [title, setTitle] = useState("");
//   const [shortDescription, setShortDescription] = useState("");
//   const [selectedStyle, setSelectedStyle] = useState("");
//   const [selectedCategories, setSelectedCategories] = useState([]);
//   const [searchCategory, setSearchCategory] = useState("");
//   const [selectedProductType, setSelectedProductType] = useState("");
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [productToDelete, setProductToDelete] = useState(null);
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { id } = useParams();
//   const isEditMode = !!id;

//   const [products, setProducts] = useState([
//     {
//       id: 1,
//       title: "Best Living Sofa",
//       shortdescription: "Premium quality sofa set",
//       style: "Style 2",
//       categories: ["Furniture", "Living Room"],
//       productype: "New Arrival",
//       date: new Date().toISOString().split('T')[0],
//       action: "Edit/Delete"
//     },
//     {
//       id: 2,
//       title: "Modern Dining Table",
//       shortdescription: "6-seater glass top table",
//       style: "Style 1",
//       categories: ["Dining", "Furniture"],
//       productype: "Featured",
//       date: new Date().toISOString().split('T')[0],
//       action: "Edit/Delete"
//     }
//   ]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async () => {
//     if (!formData.title.trim()) {
//       toast.error("Please enter a title");
//       return;
//     }

//     const newProduct = {
//       id: Math.floor(Math.random() * 1000),
//       title,
//       shortdescription: shortDescription,
//       style: selectedStyle || "Default",
//       categories: [...selectedCategories],
//       productype: selectedProductType || "Regular",
//       date: new Date().toISOString().split('T')[0],
//       action: "Edit/Delete"
//     };

//     setProducts([newProduct, ...products]);

//     // Reset form
//     setTitle("");
//     setShortDescription("");
//     setSelectedStyle("");
//     setSelectedCategories([]);
//     setSelectedProductType("");
//     setSearchCategory("");
//   };

//   const handleDeleteClick = (productId) => {
//     setProductToDelete(productId);
//     setShowDeleteModal(true);
//   };

//   const confirmDelete = () => {
//     setProducts(products.filter(product => product.id !== productToDelete));
//     setShowDeleteModal(false);
//   };

//   const columns = [
//     { name: "ID", selector: (row) => row.id, width: "80px" },
//     {
//       name: "TITLE",
//       selector: (row) => row.title,
//       width: "200px",
//       sortable: true
//     },
//     {
//       name: "SHORT DESCRIPTION",
//       selector: (row) => row.shortdescription,
//       width: "250px"
//     },
//     {
//       name: "STYLE",
//       selector: (row) => row.style,
//       width: "120px"
//     },
//     {
//       name: "CATEGORIES",
//       cell: (row) => row.categories.join(", "),
//       width: "200px"
//     },
//     {
//       name: "PRODUCT TYPE",
//       selector: (row) => row.productype,
//       width: "150px"
//     },
//     {
//       name: "DATE",
//       selector: (row) => row.date,
//       width: "120px",
//       sortable: true
//     },
//     {
//       name: "ACTIONS",
//       cell: (row) => (
//         <div className="flex space-x-2">
//           <button
//             onClick={() => {
//               // Pre-fill form for editing
//               setTitle(row.title);
//               setShortDescription(row.shortdescription);
//               setSelectedStyle(row.style);
//               setSelectedCategories([...row.categories]);
//               setSelectedProductType(row.productype);
//               // Remove the product being edited
//               setProducts(products.filter(p => p.id !== row.id));
//             }}
//             className="bg-blue-100 text-blue-600 p-2 rounded hover:bg-blue-200"
//           >
//             <FaEdit />
//           </button>
//           <button
//             onClick={() => handleDeleteClick(row.id)}
//             className="bg-red-100 text-red-600 p-2 rounded hover:bg-red-200"
//           >
//             <FaTrashAlt />
//           </button>
//         </div>
//       ),
//       width: "120px"
//     }
//   ];

//   const customStyles = {
//     headCells: {
//       style: {
//         backgroundColor: "#FF8096",
//         color: "#fff",
//         fontWeight: "bold",
//         padding: "12px 16px",
//       },
//     },
//     cells: {
//       style: {
//         padding: "12px",
//         fontSize: "14px"
//       },
//     },
//   };

//   return (
//     <div className="bg-gray-50 min-h-screen p-6">
//       <h1 className="text-3xl font-title text-gray-800">
//         {isEditMode ? "Edit" : "Create"} Featured Section
//       </h1>
//       <button
//         className="text-black rounded my-3 mr-4 w-full md:w-auto cursor-pointer"
//         onClick={() => navigate(-1)}
//         disabled={loading}
//       >
//         ← Go back
//       </button>
//       <div className="p-6 bg-white rounded-lg shadow-sm">


//         {/* Form Section */}
//         <div className="mb-8">
//           <div className="mb-6">
//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Title *
//               </label>
//               <input
//                 type="text"
//                 className="w-full p-2 border border-gray-300 rounded "
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//                 placeholder="Enter product title"
//                 required
//                 disabled={loading}
//               />
//             </div>

//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Description *
//               </label>
//               <textarea
//                 className="w-full p-2 border border-gray-300 rounded "
//                 value={shortDescription}
//                 onChange={(e) => setShortDescription(e.target.value)}
//                 placeholder="Enter short description"
//                 rows={3}
//                 required
//               />
//             </div>

//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Categories</label>
//               <div className="flex flex-wrap gap-2 mb-2">
//                 {selectedCategories.map((category, index) => (
//                   <span key={index} className="bg-gray-100 px-3 py-1 rounded-full flex items-center text-sm">
//                     {category}
//                     <button
//                       onClick={() => removeCategory(index)}
//                       className="ml-1 text-gray-500 hover:text-gray-700"
//                     >
//                       ×
//                     </button>
//                   </span>
//                 ))}
//               </div>
//               <input
//                 type="text"
//                 className="w-full p-2 border border-gray-300 rounded "
//                 value={searchCategory}
//                 onChange={(e) => setSearchCategory(e.target.value)}
//                 onKeyDown={handleAddCategory}
//                 placeholder="Type category and press Enter"
//               />
//             </div>

//             <div className="flex items-center gap-2 mb-4">
//               <input
//                 type="checkbox"
//                 checked={luxuryProduct}
//                 onChange={(e) => setLuxuryProduct(e.target.checked)}
//                 className="h-4 w-4"
//               />
//               <span className="text-sm text-gray-700">Luxury Product</span>
//             </div>
//           </div>

//           <div className="flex justify-end space-x-4">
//             <button
//               className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
//               onClick={() => {
//                 setTitle("");
//                 setShortDescription("");
//                 setSelectedStyle("");
//                 setSelectedCategories([]);
//                 setSelectedProductType("");
//                 setSearchCategory("");
//               }}
//             >
//               Reset
//             </button>
//             <button
//               className="bg-white border border-primary px-4 py-2 rounded-md hover:bg-primaryColor hover:bg-primary hover:text-white duration-500 cursor-pointer"
//               onClick={handleAddProduct}
//             >
//               Add Section
//             </button>
//           </div>
//         </div>





//       </div>
//     </div>
//   );
// };

// export default Featuredaddproducts;



import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { createFeaturedSection, updateFeaturedSection } from "../../services/FeaturedSection";

const FeaturedAddProducts = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEditMode = !!id;

  useEffect(() => {
    if (isEditMode && location.state?.offerData) {
      const { title, description } = location.state.offerData;
      setTitle(title);
      setDescription(description);
    }
  }, [isEditMode, location.state]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    if (!description.trim()) {
      toast.error("Please enter a description");
      return;
    }

    setLoading(true);

    try {
      const data = { title, description };

      if (isEditMode) {
        await updateFeaturedSection(id, data);
        toast.success("Featured section updated successfully!");
      } else {
        await createFeaturedSection(data);
        toast.success("Featured section created successfully!");
      }

      navigate("/featuredproducts"); 
    } catch (error) {
      toast.error(
        error.message || 
        `Failed to ${isEditMode ? "update" : "create"} featured section`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <h1 className="text-3xl font-title text-gray-800">
        {isEditMode ? "Edit" : "Create"} Featured Section
      </h1>
      <button
        className="text-black rounded my-3 mr-4 w-full md:w-auto cursor-pointer"
        onClick={() => navigate(-1)}
        disabled={loading}
      >
        ← Go back
      </button>
      <div className="p-6 bg-white rounded-lg shadow-sm">
        {/* Form Section */}
        <div className="mb-8">
          <div className="mb-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter product title"
                required
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter short description"
                rows={3}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              className="px-6 py-2 bg-gray-500 cursor-pointer text-white rounded hover:bg-gray-600 transition-colors"
              onClick={() => {
                setTitle("");
                setDescription("");
              }}
              disabled={loading}
            >
              Reset
            </button>
            <button
              className="bg-table border border-primary text-white px-4 py-2 rounded-md hover:bg-secondary hover:text-white duration-500 cursor-pointer"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading 
                ? "Processing..." 
                : isEditMode 
                  ? "Update Section" 
                  : "Add Section"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedAddProducts;