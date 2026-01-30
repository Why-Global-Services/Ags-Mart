// import React, { useState, useEffect } from "react";
// import { FaUpload, FaTimes } from "react-icons/fa";
// import { useNavigate, useParams } from "react-router-dom";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { createCategory, updateCategory, getCategoryById } from "../../services/Categories";

// const CategoriesForm = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const isEditMode = Boolean(id);

//   const [formData, setFormData] = useState({
//     categoryImage: [], // Stores file objects
//     categoryDescription: "",
//     categoryTitle: "",
//   });
//   const [uploadedImages, setUploadedImages] = useState([]); // Stores preview URLs
//   const [existingImages, setExistingImages] = useState([]); // Stores existing image URLs from server
//   const [error, setError] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     if (id) {
//       const fetchCategory = async () => {
//         try {
//           setIsLoading(true);
//           const response = await getCategoryById(id);
//           const data = response.data; // Changed from response.category to response.data

//           setFormData({
//             categoryTitle: data.categoryTitle,
//             categoryDescription: data.categoryDescription,
//             categoryImage: [],
//           });

//           // Set existing images as an array (even if single image)
//           setExistingImages(data.categoryImage ? [data.categoryImage] : []);
//         } catch (err) {
//           console.error("Error fetching category:", err);
//           toast.error("Failed to fetch category data");
//         } finally {
//           setIsLoading(false);
//         }
//       };

//       fetchCategory();
//     }
//   }, [id]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prevState) => ({
//       ...prevState,
//       [name]: value,
//     }));
//   };

//   const handleFileUpload = (e) => {
//     const files = Array.from(e.target.files);
    
//     // Validate file types and size
//     const validFiles = files.filter(file => {
//       if (!file.type.startsWith('image/')) {
//         toast.error(`File ${file.name} is not an image`);
//         return false;
//       }
//       if (file.size > 5 * 1024 * 1024) { // 5MB limit
//         toast.error(`File ${file.name} is too large (max 200MB)`);
//         return false;
//       }
//       return true;
//     });

//     const imageUrls = validFiles.map((file) => URL.createObjectURL(file));

//     setUploadedImages((prev) => [...prev, ...imageUrls]);
//     setFormData((prev) => ({
//       ...prev,
//       categoryImage: [...prev.categoryImage, ...validFiles],
//     }));
//   };

//   const removeImage = (index, type = "uploaded") => {
//     if (type === "uploaded") {
//       // Remove from uploaded images
//       const newUploadedImages = [...uploadedImages];
//       URL.revokeObjectURL(newUploadedImages[index]); // Clean up memory
//       newUploadedImages.splice(index, 1);
//       setUploadedImages(newUploadedImages);

//       // Remove corresponding file from formData
//       const newFiles = [...formData.categoryImage];
//       newFiles.splice(index, 1);
//       setFormData((prev) => ({
//         ...prev,
//         categoryImage: newFiles,
//       }));
//     } else {
//       // Remove from existing images (for edit mode)
//       const newExistingImages = [...existingImages];
//       newExistingImages.splice(index, 1);
//       setExistingImages(newExistingImages);
//     }
//   };

//   const validateForm = () => {
//     if (!formData.categoryTitle.trim()) return "Category title is required.";
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
//     setIsLoading(true);

//     try {
//       const data = new FormData();
//       data.append("categoryTitle", formData.categoryTitle);
//       data.append("categoryDescription", formData.categoryDescription);

//       // Append new files
//       formData.categoryImage.forEach((file) => {
//         data.append("categoryImage", file);
//       });

//       // Append existing image URLs (for edit mode)
//       if (isEditMode) {
//         existingImages.forEach((imageUrl) => {
//           data.append("existingImages", imageUrl);
//         });
//       }

//       let response;
//       if (isEditMode) {
//         response = await updateCategory(id, data);
//         toast.success("Category updated successfully");
//       } else {
//         response = await createCategory(data);
//         toast.success("Category created successfully");
//       }

//       console.log("Category saved successfully:", response);
//       navigate("/categories");
//     } catch (err) {
//       console.error("Error submitting form:", err);
//       setError("Failed to save category. Please try again.");
//       toast.error(
//         err.response?.data?.message || "An error occurred. Please try again."
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (isLoading && isEditMode) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-gray-50 min-h-screen p-6">
//       <h1 className="text-3xl font-title text-gray-800">
//         {isEditMode ? "Edit Category" : "Add Category"}
//       </h1>
//       <button
//         className="text-black rounded my-3 mr-4 w-full md:w-auto cursor-pointer"
//         onClick={() => navigate(-1)}
//       >
//         ← Go back
//       </button>

//       <div className="col-span-2 space-y-2 bg-white shadow-lg rounded-lg p-6 w-full">
//         <h2 className="text-xl font-semibold mb-6 text-gray-800">
//           {isEditMode ? "Edit Category Image" : "Add Category Image"}
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
//           <h3 className="text-md font-medium mb-2">
//             {isEditMode ? "Current Images" : "Uploaded Images"}
//           </h3>
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
//             {existingImages.map((image, index) => (
//               <div key={`existing-${index}`} className="relative">
//                 <img
//                   src={image}
//                   alt={`Existing ${index + 1}`}
//                   className="w-full h-32 object-cover rounded-lg"
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
//             Category Information
//           </h2>
//           <div className="w-full mb-4">
//             <label
//               htmlFor="categoryTitle"
//               className="block text-sm font-medium text-gray-600 mb-2"
//             >
//               Category Title <span className="text-red-500">*</span>
//             </label>
//             <input
//               id="categoryTitle"
//               type="text"
//               name="categoryTitle"
//               placeholder="Category Title"
//               className="border rounded p-2 w-full text-gray-800"
//               onChange={handleInputChange}
//               value={formData.categoryTitle}
//               required
//             />
//           </div>

//           <div className="w-full">
//             <label
//               htmlFor="categoryDescription"
//               className="block text-sm font-medium text-gray-600 mb-2"
//             >
//               Description
//             </label>
//             <textarea
//               id="categoryDescription"
//               name="categoryDescription"
//               placeholder="Description"
//               className="border rounded p-2 w-full text-gray-800"
//               onChange={handleInputChange}
//               value={formData.categoryDescription}
//               rows={4}
//             />
//           </div>
//         </div>

//         <div className="mt-6 flex justify-end space-x-4">
//           <button
//             type="button"
//             className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded transition cursor-pointer"
//             onClick={() => navigate(-1)}
//             disabled={isLoading}
//           >
//             Cancel
//           </button>
//           <button
//             type="button"
//             className="bg-primary text-white px-6 py-2 rounded transition cursor-pointer disabled:bg-opacity-50"
//             onClick={handleSubmit}
//             disabled={isLoading}
//           >
//             {isLoading ? (
//               <span className="flex items-center">
//                 <svg
//                   className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                 >
//                   <circle
//                     className="opacity-25"
//                     cx="12"
//                     cy="12"
//                     r="10"
//                     stroke="currentColor"
//                     strokeWidth="4"
//                   ></circle>
//                   <path
//                     className="opacity-75"
//                     fill="currentColor"
//                     d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                   ></path>
//                 </svg>
//                 {isEditMode ? "Updating..." : "Creating..."}
//               </span>
//             ) : isEditMode ? (
//               "Update Category"
//             ) : (
//               "Create Category"
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CategoriesForm;


import React, { useState, useEffect } from "react";
import { FaUpload, FaTimes } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createCategory, updateCategory, getCategoryById } from "../../services/Categories";

const CategoriesForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    categoryImage: null, // Stores single file object
    categoryDescription: "",
    categoryTitle: "",
  });
  const [uploadedImage, setUploadedImage] = useState(null); // Stores preview URL
  const [existingImage, setExistingImage] = useState(null); // Stores existing image URL from server
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchCategory = async () => {
        try {
          setIsLoading(true);
          const response = await getCategoryById(id);
          const data = response.data;

          setFormData({
            categoryTitle: data.categoryTitle,
            categoryDescription: data.categoryDescription,
            categoryImage: null,
          });

          // Set existing image (single image)
          setExistingImage(data.categoryImage || null);
        } catch (err) {
          console.error("Error fetching category:", err);
          toast.error("Failed to fetch category data");
        } finally {
          setIsLoading(false);
        }
      };

      fetchCategory();
    }
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0]; // Get only the first file
    
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast.error(`File ${file.name} is not an image`);
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error(`File ${file.name} is too large (max 5MB)`);
      return;
    }

    // Create preview URL
    const imageUrl = URL.createObjectURL(file);

    // Clear any previous uploads and existing image preview
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage);
    }
    
    // When uploading a new image in edit mode, remove the existing image
    if (isEditMode) {
      setExistingImage(null);
    }

    setUploadedImage(imageUrl);
    setFormData((prev) => ({
      ...prev,
      categoryImage: file,
    }));
  };

  const removeImage = () => {
    // Remove uploaded image if it exists
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage);
      setUploadedImage(null);
      setFormData((prev) => ({
        ...prev,
        categoryImage: null,
      }));
    }
    // Remove existing image if it exists (edit mode only)
    else if (existingImage) {
      setExistingImage(null);
    }
  };

  const validateForm = () => {
    if (!formData.categoryTitle.trim()) return "Category title is required.";
    if (!existingImage && !uploadedImage) return "An image is required.";
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
    setIsLoading(true);

    try {
      const data = new FormData();
      data.append("categoryTitle", formData.categoryTitle);
      data.append("categoryDescription", formData.categoryDescription);

      // Append new file if it exists
      if (formData.categoryImage) {
        data.append("categoryImage", formData.categoryImage);
      }

      // Append existing image URL only if no new image was uploaded
      if (isEditMode && existingImage && !formData.categoryImage) {
        data.append("existingImage", existingImage);
      }

      let response;
      if (isEditMode) {
        response = await updateCategory(id, data);
        toast.success("Category updated successfully");
      } else {
        response = await createCategory(data);
        toast.success("Category created successfully");
      }

      console.log("Category saved successfully:", response);
      navigate("/categories");
    } catch (err) {
      console.error("Error submitting form:", err);
      setError("Failed to save category. Please try again.");
      toast.error(
        err.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && isEditMode) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <h1 className="text-3xl font-title text-gray-800">
        {isEditMode ? "Edit Category" : "Add Category"}
      </h1>
      <button
        className="text-black rounded my-3 mr-4 w-full md:w-auto cursor-pointer"
        onClick={() => navigate(-1)}
      >
        ← Go back
      </button>

      <div className="col-span-2 space-y-2 bg-white shadow-lg rounded-lg p-6 w-full">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">
          {isEditMode ? "Edit Category Image" : "Add Category Image"}
        </h2>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col justify-center items-center relative">
          <FaUpload className="text-orange-500 text-4xl mb-2" />
          <input
            type="file"
            onChange={handleFileUpload}
            className="absolute opacity-0 cursor-pointer inset-0"
            accept="image/*"
          />
          <p className="text-gray-500">
            {existingImage || uploadedImage ? "Click to replace image" : "Click to upload image"}
          </p>
        </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <div className="mt-4">
          <h3 className="text-md font-medium mb-2">
            {isEditMode ? "Current Image" : "Uploaded Image"}
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {(existingImage || uploadedImage) && (
              <div className="relative">
                <img
                  src={uploadedImage || existingImage}
                  alt={uploadedImage ? "Uploaded" : "Existing"}
                  className="w-full h-64 object-contain rounded-lg"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <FaTimes size={12} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-title mb-4 text-gray-800">
            Category Information
          </h2>
          <div className="w-full mb-4">
            <label
              htmlFor="categoryTitle"
              className="block text-sm font-medium text-gray-600 mb-2"
            >
              Category Title <span className="text-red-500">*</span>
            </label>
            <input
              id="categoryTitle"
              type="text"
              name="categoryTitle"
              placeholder="Category Title"
              className="border rounded p-2 w-full text-gray-800"
              onChange={handleInputChange}
              value={formData.categoryTitle}
              required
            />
          </div>

          <div className="w-full">
            <label
              htmlFor="categoryDescription"
              className="block text-sm font-medium text-gray-600 mb-2"
            >
              Description
            </label>
            <textarea
              id="categoryDescription"
              name="categoryDescription"
              placeholder="Description"
              className="border rounded p-2 w-full text-gray-800"
              onChange={handleInputChange}
              value={formData.categoryDescription}
              rows={4}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <button
            type="button"
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded transition cursor-pointer"
            onClick={() => navigate(-1)}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="bg-table hover:bg-secondary text-white px-6 py-2 rounded transition cursor-pointer disabled:bg-opacity-50"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {isEditMode ? "Updating..." : "Creating..."}
              </span>
            ) : isEditMode ? (
              "Update Category"
            ) : (
              "Create Category"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoriesForm;