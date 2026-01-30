// import React, { useState, useEffect } from "react";
// import { FaUpload, FaTimes } from "react-icons/fa";
// import { useNavigate, useParams } from "react-router-dom";
// import { toast } from "react-toastify";
// import { 
//   getSubCategoryById, 
//   createSubCategory, 
//   updateSubCategory,
// } from "../../services/Subcategory";
// import { getCategory } from "../../services/Categories";



// const SubCategoriesForm = () => {
//   const [formData, setFormData] = useState({
//     subCategoryImage: [],
//     category: "",
//     subcategoryDescription: "",
//     subcategoryTitle: "",
//   });
//   const [uploadedImages, setUploadedImages] = useState([]);
//   const [existingImages, setExistingImages] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();
//   const { id } = useParams();
//   const isEditMode = !!id;

//   // Fetch categories from API
//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         setLoading(true);
//         const response = await getCategory();
//         setCategories(response.data);
//       } catch (err) {
//         console.error("Error fetching categories:", err);
//         toast.error("Failed to fetch categories.");
//       } finally {
//         setLoading(false);
//       }
//     };
  
//     fetchCategories();
//   }, []);

//   // Fetch subcategory data for edit mode
//   useEffect(() => {
//     if (isEditMode) {
//       const fetchSubcategory = async () => {
//         try {
//           setLoading(true);
//           const response = await getSubCategoryById(id);
//           const data = response.data[0] || response.data || response;
          
//           if (!data) {
//             throw new Error("No subcategory data found.");
//           }

//           setFormData({
//             subcategoryTitle: data.subCategoryTitle || "",
//             subcategoryDescription: data.subCategoryDescription || "",
//             category: data.category?._id || data.category || "",
//             subCategoryImage: [],
//           });

//           // Handle both array and single image cases
//           if (data.subCategoryImage) {
//             const images = Array.isArray(data.subCategoryImage) 
//               ? data.subCategoryImage 
//               : [data.subCategoryImage];
//             setExistingImages(images.filter(img => img));
//           }
//         } catch (err) {
//           console.error("Error fetching subcategory:", err);
//           toast.error("Failed to fetch subcategory data.");
//         } finally {
//           setLoading(false);
//         }
//       };

//       fetchSubcategory();
//     }
//   }, [id, isEditMode]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleFileUpload = (e) => {
//     const files = Array.from(e.target.files);
//     const imageUrls = files.map((file) => URL.createObjectURL(file));

//     setUploadedImages((prev) => [...prev, ...imageUrls]);
//     setFormData((prev) => ({
//       ...prev,
//       subCategoryImage: [...prev.subCategoryImage, ...files],
//     }));
//   };

//   const removeImage = (index, type = "uploaded") => {
//     if (type === "uploaded") {
//       const newUploadedImages = [...uploadedImages];
//       newUploadedImages.splice(index, 1);
//       setUploadedImages(newUploadedImages);

//       const newFiles = [...formData.subCategoryImage];
//       newFiles.splice(index, 1);
//       setFormData((prev) => ({
//         ...prev,
//         subCategoryImage: newFiles,
//       }));
//     } else {
//       const newExistingImages = [...existingImages];
//       newExistingImages.splice(index, 1);
//       setExistingImages(newExistingImages);
//     }
//   };

//   const validateForm = () => {
//     if (!formData.subcategoryTitle) return "Subcategory title is required.";
//     if (!formData.category) return "Category is required.";
//     if (existingImages.length + uploadedImages.length === 0)
//       return "At least one image is required.";
//     return "";
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const validationError = validateForm();
//     if (validationError) {
//       setError(validationError);
//       toast.error(validationError);
//       return;
//     }
//     setError("");

//     try {
//       setLoading(true);
//       const data = new FormData();
//       data.append("subCategoryTitle", formData.subcategoryTitle);
//       data.append("subCategoryDescription", formData.subcategoryDescription);
//       data.append("category", formData.category);

//       // Append new files
//       formData.subCategoryImage.forEach((file) => {
//         data.append("subCategoryImage", file);
//       });

//       // Append existing image URLs (for edit mode)
//       if (isEditMode) {
//         existingImages.forEach((imageUrl) => {
//           data.append("existingImages", imageUrl);
//         });
//       }

//       let response;
//       if (isEditMode) {
//         response = await updateSubCategory(id, data);
//         toast.success("Subcategory updated successfully");
//       } else {
//         response = await createSubCategory(data);
//         toast.success("Subcategory created successfully");
//       }

//       navigate("/subcategories");
//     } catch (err) {
//       console.error("Error submitting form:", err);
//       const errorMessage =
//         err.response?.data?.message || "An error occurred. Please try again.";
//       setError(errorMessage);
//       toast.error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="bg-gray-50 min-h-screen p-6">
//       <h1 className="text-3xl font-title text-gray-800">
//         {isEditMode ? "Edit" : "Add"} Subcategory
//       </h1>
//       <button
//         className="text-black rounded my-3 mr-4 w-full md:w-auto cursor-pointer"
//         onClick={() => navigate(-1)}
//       >
//         ← Go back
//       </button>

//       <div className="col-span-2 space-y-2 bg-white shadow-lg rounded-lg p-6 w-full">
//         <h2 className="text-xl font-semibold mb-6 text-gray-800">
//           Add Subcategory Image
//         </h2>
//         <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col justify-center items-center relative">
//           <FaUpload className="text-orange-500 text-4xl mb-2" />
//           <input
//             type="file"
//             onChange={handleFileUpload}
//             className="absolute opacity-0 cursor-pointer inset-0"
//             multiple
//             accept="image/*"
//           />
//           <p className="text-gray-500">
//             Drag your images here, or{" "}
//             <span className="text-orange-500 cursor-pointer">
//               click to browse
//             </span>
//           </p>
//         </div>

//         {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

//         <div className="mt-4">
//           <h3 className="text-md font-medium mb-2">Uploaded Images</h3>
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
//             {existingImages.map((image, index) => (
//               <div key={`existing-${index}`} className="relative">
//                 <img
//                   src={image}
//                   alt={`Existing ${index + 1}`}
//                   className="w-full h-32 object-cover rounded-lg"
//                   onError={(e) => {
//                     e.target.onerror = null;
//                     e.target.src = "https://via.placeholder.com/150";
//                   }}
//                 />
//                 <button
//                   onClick={() => removeImage(index, "existing")}
//                   className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
//                 >
//                   <FaTimes size={12} />
//                 </button>
//               </div>
//             ))}

//             {uploadedImages.map((image, index) => (
//               <div key={`uploaded-${index}`} className="relative">
//                 <img
//                   src={image}
//                   alt={`Uploaded ${index + 1}`}
//                   className="w-full h-32 object-cover rounded-lg"
//                 />
//                 <button
//                   onClick={() => removeImage(index, "uploaded")}
//                   className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
//                 >
//                   <FaTimes size={12} />
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="mt-6">
//           <h2 className="text-xl font-title mb-4 text-gray-800">
//             Subcategory Information
//           </h2>

//           <div className="w-full mb-4">
//             <label
//               htmlFor="category"
//               className="block text-sm font-medium text-gray-600 mb-2"
//             >
//               Category <span className="text-red-500">*</span>
//             </label>
//             <select
//               id="category"
//               name="category"
//               className="border rounded p-2 w-full text-gray-800"
//               onChange={handleInputChange}
//               value={formData.category}
//               required
//               disabled={loading}
//             >
//               <option value="">Select a Category</option>
//               {categories.map((category) => (
//                 <option key={category._id} value={category._id}>
//                   {category.categoryTitle}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="w-full mb-4">
//             <label
//               htmlFor="subcategoryTitle"
//               className="block text-sm font-medium text-gray-600 mb-2"
//             >
//               Subcategory Title <span className="text-red-500">*</span>
//             </label>
//             <input
//               id="subcategoryTitle"
//               type="text"
//               name="subcategoryTitle"
//               placeholder="Subcategory Title"
//               className="border rounded p-2 w-full text-gray-800"
//               onChange={handleInputChange}
//               value={formData.subcategoryTitle}
//               required
//               disabled={loading}
//             />
//           </div>

//           <div className="w-full">
//             <label
//               htmlFor="subcategoryDescription"
//               className="block text-sm font-medium text-gray-600 mb-2"
//             >
//               Description
//             </label>
//             <textarea
//               id="subcategoryDescription"
//               name="subcategoryDescription"
//               placeholder="Description"
//               className="border rounded p-2 w-full text-gray-800"
//               onChange={handleInputChange}
//               value={formData.subcategoryDescription}
//               rows={4}
//               disabled={loading}
//             />
//           </div>
//         </div>

//         <div className="mt-6 flex justify-end space-x-4">
//           <button
//             type="button"
//             className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded transition cursor-pointer"
//             onClick={() => navigate(-1)}
//             disabled={loading}
//           >
//             Cancel
//           </button>
//           <button
//             type="button"
//             className="bg-primary text-white px-6 py-2 rounded transition cursor-pointer"
//             onClick={handleSubmit}
//             disabled={loading}
//           >
//             {loading ? "Processing..." : isEditMode ? "Update" : "Create"} Subcategory
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SubCategoriesForm;


import React, { useState, useEffect } from "react";
import { FaUpload, FaTimes } from "react-icons/fa";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  createSubCategory, 
  updateSubCategory,
} from "../../services/Subcategory";
import { getCategory } from "../../services/Categories";

const SubCategoriesForm = () => {
  const location = useLocation();
  const [formData, setFormData] = useState({
    subCategoryImage: [],
    category: "",
    subcategoryDescription: "",
    subcategoryTitle: "",
  });
  const [uploadedImages, setUploadedImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;


  console.log(location.state?.subCategory,'location state');
  

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await getCategory();
        setCategories(response.data);
        
        // If in edit mode and we have location state, set the form data
        if (isEditMode && location.state?.subCategory) {
          const data = location.state.subCategory;
          setFormData({
            subcategoryTitle: data.subCategoryTitle || "",
            subcategoryDescription: data.subCategoryDescription || "",
            category: data.categoryId || data.categoryTitle || "",
            subCategoryImage: [],
          });

          // Handle both array and single image cases
          if (data.subCategoryImage) {
            const images = Array.isArray(data.subCategoryImage) 
              ? data.subCategoryImage 
              : [data.subCategoryImage];
            setExistingImages(images.filter(img => img));
          }
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        toast.error("Failed to fetch categories.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchCategories();
  }, [id, isEditMode, location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // In edit mode, replace existing images with new uploads
    if (isEditMode) {
      setUploadedImages(files.map((file) => URL.createObjectURL(file)));
      setFormData((prev) => ({
        ...prev,
        subCategoryImage: files,
      }));
      setExistingImages([]); // Clear existing images when replacing
    } else {
      // In create mode, add to existing uploads
      const imageUrls = files.map((file) => URL.createObjectURL(file));
      setUploadedImages((prev) => [...prev, ...imageUrls]);
      setFormData((prev) => ({
        ...prev,
        subCategoryImage: [...prev.subCategoryImage, ...files],
      }));
    }
  };

  const removeImage = (index, type = "uploaded") => {
    if (type === "uploaded") {
      const newUploadedImages = [...uploadedImages];
      newUploadedImages.splice(index, 1);
      setUploadedImages(newUploadedImages);

      const newFiles = [...formData.subCategoryImage];
      newFiles.splice(index, 1);
      setFormData((prev) => ({
        ...prev,
        subCategoryImage: newFiles,
      }));
    } else {
      const newExistingImages = [...existingImages];
      newExistingImages.splice(index, 1);
      setExistingImages(newExistingImages);
    }
  };

  const validateForm = () => {
    if (!formData.subcategoryTitle) return "Subcategory title is required.";
    if (!formData.category) return "Category is required.";
    if (existingImages.length + uploadedImages.length === 0)
      return "At least one image is required.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }
    setError("");

    try {
      setLoading(true);
      const data = new FormData();
      data.append("subCategoryTitle", formData.subcategoryTitle);
      data.append("subCategoryDescription", formData.subcategoryDescription);
      data.append("category", formData.category);

      // Append new files
      formData.subCategoryImage.forEach((file) => {
        data.append("subCategoryImage", file);
      });

      // In edit mode, append remaining existing images (if any)
      if (isEditMode && existingImages.length > 0) {
        existingImages.forEach((imageUrl) => {
          data.append("existingImages", imageUrl);
        });
      }

      let response;
      if (isEditMode) {
        response = await updateSubCategory(id, data);
        toast.success("Subcategory updated successfully");
      } else {
        response = await createSubCategory(data);
        toast.success("Subcategory created successfully");
      }

      navigate("/subcategories");
    } catch (err) {
      console.error("Error submitting form:", err);
      const errorMessage =
        err.response?.data?.message || "An error occurred. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <h1 className="text-3xl font-title text-gray-800">
        {isEditMode ? "Edit" : "Add"} Subcategory
      </h1>
      <button
        className="text-black rounded my-3 mr-4 w-full md:w-auto cursor-pointer"
        onClick={() => navigate(-1)}
      >
        ← Go back
      </button>

      <div className="col-span-2 space-y-2 bg-white shadow-lg rounded-lg p-6 w-full">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">
          {isEditMode ? "Replace Subcategory Image" : "Add Subcategory Image"}
        </h2>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col justify-center items-center relative">
          <FaUpload className="text-orange-500 text-4xl mb-2" />
          <input
            type="file"
            onChange={handleFileUpload}
            className="absolute opacity-0 cursor-pointer inset-0"
            multiple={!isEditMode} // Single file in edit mode, multiple in create mode
            accept="image/*"
          />
          <p className="text-gray-500">
            {isEditMode 
              ? "Click to replace the existing image" 
              : "Drag your images here, or click to browse"}
          </p>
          {isEditMode && (
            <p className="text-sm text-gray-400 mt-2">
              Only one image will be kept (the last one uploaded)
            </p>
          )}
        </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <div className="mt-4">
          <h3 className="text-md font-medium mb-2">
            {isEditMode ? "Current Image" : "Uploaded Images"}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {existingImages.map((image, index) => (
              <div key={`existing-${index}`} className="relative">
                <img
                  src={image}
                  alt={`Existing ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/150";
                  }}
                />
                <button
                  onClick={() => removeImage(index, "existing")}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <FaTimes size={12} />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
                  Current Image
                </div>
              </div>
            ))}

            {uploadedImages.map((image, index) => (
              <div key={`uploaded-${index}`} className="relative">
                <img
                  src={image}
                  alt={`Uploaded ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeImage(index, "uploaded")}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <FaTimes size={12} />
                </button>
                {isEditMode && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
                    New Replacement
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-title mb-4 text-gray-800">
            Subcategory Information
          </h2>

          <div className="w-full mb-4">
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-600 mb-2"
            >
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              className="border rounded p-2 w-full text-gray-800"
              onChange={handleInputChange}
              value={formData.category}
              required
              disabled={loading}
            >
              <option value="">Select a Category</option>
              {categories.map((category) => (
                <option 
                  key={category._id} 
                  value={category._id}
                >
                  {category.categoryTitle}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full mb-4">
            <label
              htmlFor="subcategoryTitle"
              className="block text-sm font-medium text-gray-600 mb-2"
            >
              Subcategory Title <span className="text-red-500">*</span>
            </label>
            <input
              id="subcategoryTitle"
              type="text"
              name="subcategoryTitle"
              placeholder="Subcategory Title"
              className="border rounded p-2 w-full text-gray-800"
              onChange={handleInputChange}
              value={formData.subcategoryTitle}
              required
              disabled={loading}
            />
          </div>

          <div className="w-full">
            <label
              htmlFor="subcategoryDescription"
              className="block text-sm font-medium text-gray-600 mb-2"
            >
              Description
            </label>
            <textarea
              id="subcategoryDescription"
              name="subcategoryDescription"
              placeholder="Description"
              className="border rounded p-2 w-full text-gray-800"
              onChange={handleInputChange}
              value={formData.subcategoryDescription}
              rows={4}
              disabled={loading}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <button
            type="button"
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded transition cursor-pointer"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="bg-table hover:bg-secondary text-white px-6 py-2 rounded transition cursor-pointer"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Processing..." : isEditMode ? "Update" : "Create"} Subcategory
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubCategoriesForm;