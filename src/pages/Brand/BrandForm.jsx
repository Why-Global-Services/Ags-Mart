// import React, { useState, useEffect } from "react";
// import { FaUpload, FaTimes } from "react-icons/fa";
// import { useNavigate, useParams } from "react-router-dom";
// import { toast } from "react-toastify"; 
// import { updateBrand,getBrandById, createBrand } from "../../Interceptor/interceptor";
// const BrandsForm = () => {
//   const [formData, setFormData] = useState({
//     brandImage: [],
//     brandName: "",
//   });
//   const [uploadedImages, setUploadedImages] = useState([]); 
//   const [existingImages, setExistingImages] = useState([]); 
//   const [error, setError] = useState("");
//   const navigate = useNavigate();
//   const { id } = useParams();
//   const isEditMode = !!id;

//   useEffect(() => {
//     if (id) {
//       const fetchBrand = async () => {
//         try {
//           const response = await getBrandById(id);
//           const data = response.data;

//           setFormData({
//             brandName: data.brandName || "",
//             brandImage: [],
//           });

//           // Handle single or multiple images
//           setExistingImages(
//             Array.isArray(data.brandImage) ? data.brandImage : [data.brandImage].filter(Boolean)
//           );
//         } catch (err) {
//           console.error("Error fetching brand:", err);
//           toast.error("Failed to load brand data.");
//         }
//       };

//       fetchBrand();
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
//     const imageUrls = files.map((file) => URL.createObjectURL(file));

//     setUploadedImages((prev) => [...prev, ...imageUrls]);
//     setFormData((prev) => ({
//       ...prev,
//       brandImage: [...prev.brandImage, ...files],
//     }));
//   };

//   const removeImage = (index, type = "uploaded") => {
//     if (type === "uploaded") {
//       const newUploadedImages = [...uploadedImages];
//       newUploadedImages.splice(index, 1);
//       setUploadedImages(newUploadedImages);

//       const newFiles = [...formData.brandImage];
//       newFiles.splice(index, 1);
//       setFormData((prev) => ({
//         ...prev,
//         brandImage: newFiles,
//       }));
//     } else {
//       const newExistingImages = [...existingImages];
//       newExistingImages.splice(index, 1);
//       setExistingImages(newExistingImages);
//     }
//   };

//   const validateForm = () => {
//     if (!formData.brandName.trim()) return "Brand name is required.";
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
//       const data = new FormData();
//       data.append("brandName", formData.brandName);

//       formData.brandImage.forEach((file) => {
//         data.append("brandImage", file);
//       });

//       if (isEditMode) {
//         existingImages.forEach((imageUrl) => {
//           data.append("existingImages", imageUrl);
//         });
//       }

//       let response;
//       if (isEditMode) {
//         response = await updateBrand(id, data);
//         toast.success("Brand updated successfully");
//       } else {
//         response = await createBrand(data);
//         toast.success("Brand created successfully");
//       }

//       console.log("Brand saved successfully:", response);
//       navigate("/brand");
//     } catch (err) {
//       console.error("Error submitting form:", err);
//       const errorMessage =
//         err.response?.data?.message || "An error occurred. Please try again.";
//       setError(errorMessage);
//       toast.error(errorMessage);
//     }
//   };

//   return (
//     <div className="bg-gray-50 min-h-screen p-6">
//       <h1 className="text-3xl font-title text-gray-800">
//         {isEditMode ? "Edit" : "Create"} Brand
//       </h1>
//       <button
//         className="text-black rounded my-3 mr-4 w-full md:w-auto cursor-pointer"
//         onClick={() => navigate(-1)}
//       >
//         ← Go back
//       </button>

//       <div className="col-span-2 space-y-2 bg-white shadow-lg rounded-lg p-6 w-full">
//         <h2 className="text-xl font-semibold mb-6 text-gray-800">
//           Add Brand Image
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

//           <div className="mt-1">
//             <h2 className="text-xl font-title mb-4 text-gray-800">
//               Brand Name
//             </h2>
//             <div className="w-full mb-4">
//               <input
//                 id="brandName"
//                 type="text"
//                 name="brandName"
//                 placeholder="Brand Name"
//                 className="border rounded p-2 w-full text-gray-800"
//                 onChange={handleInputChange}
//                 value={formData.brandName}
//                 required
//               />
//             </div>
//           </div>
//         </div>

//         <div className="mt-6 flex justify-end space-x-4">
//           <button
//             type="button"
//             className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded transition cursor-pointer"
//             onClick={()=> navigate(-1)}
//             >
//             Cancel
//           </button>
//           <button
//             type="button"
//             className="bg-primary hover:bg-pink-600 text-white px-6 py-2 rounded transition cursor-pointer"
//             onClick={handleSubmit}
//           >
//             {isEditMode ? "Update" : "Create"} Brand
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };
// // 
// export default BrandsForm;


import React, { useState, useEffect } from "react";
import { FaUpload, FaTimes } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { updateBrand, getBrandById, createBrand } from "../../Interceptor/interceptor";

const BrandsForm = () => {
  const [formData, setFormData] = useState({
    brandImage: null,
    brandName: "",
  });
  const [uploadedImage, setUploadedImage] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  // Function to compress the image
  const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target.result;
      };

      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Calculate new dimensions while preserving aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw the image on the canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to a compressed file
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to compress image"));
              return;
            }
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          file.type,
          quality // Compression quality (0 to 1)
        );
      };

      img.onerror = (err) => reject(err);
    });
  };

  useEffect(() => {
    if (id) {
      const fetchBrand = async () => {
        try {
          const response = await getBrandById(id);
          const data = response.data;

          setFormData({
            brandName: data.brandName || "",
            brandImage: null,
          });

          setExistingImage(
            Array.isArray(data.brandImage) ? data.brandImage[0] : data.brandImage
          );
        } catch (err) {
          console.error("Error fetching brand:", err);
          toast.error("Failed to load brand data.");
        }
      };

      fetchBrand();
    }
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Compress the image
        const compressedFile = await compressImage(file, 800, 800, 0.7);
        const imageUrl = URL.createObjectURL(compressedFile);

        // Replace any existing or uploaded image
        setUploadedImage(imageUrl);
        setExistingImage(null);
        setFormData((prev) => ({
          ...prev,
          brandImage: compressedFile,
        }));
      } catch (err) {
        console.error("Error compressing image:", err);
        toast.error("Failed to process image.");
      }
    }
  };

  const removeImage = (type = "uploaded") => {
    if (type === "uploaded") {
      setUploadedImage(null);
      setFormData((prev) => ({
        ...prev,
        brandImage: null,
      }));
    } else {
      setExistingImage(null);
    }
  };

  const validateForm = () => {
    if (!formData.brandName.trim()) return "Brand name is required.";
    if (!existingImage && !uploadedImage) return "One image is required.";
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
      const data = new FormData();
      data.append("brandName", formData.brandName);

      if (formData.brandImage) {
        data.append("brandImage", formData.brandImage);
      }

      if (isEditMode && existingImage) {
        data.append("existingImages", existingImage);
      }

      let response;
      if (isEditMode) {
        response = await updateBrand(id, data);
        toast.success("Brand updated successfully");
      } else {
        response = await createBrand(data);
        toast.success("Brand created successfully");
      }

      console.log("Brand saved successfully:", response);
      navigate("/brand");
    } catch (err) {
      console.error("Error submitting form:", err);
      const errorMessage =
        err.response?.data?.message || "An error occurred. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <h1 className="text-3xl font-title text-gray-800">
        {isEditMode ? "Edit" : "Create"} Brand
      </h1>
      <button
        className="text-black rounded my-3 mr-4 w-full md:w-auto cursor-pointer"
        onClick={() => navigate(-1)}
      >
        ← Go back
      </button>

      <div className="col-span-2 space-y-2 bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">
          Add Brand Image
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
            Drag your image here, or{" "}
            <span className="text-orange-500 cursor-pointer">
              click to browse
            </span>
          </p>
        </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <div className="mt-4">
          <h3 className="text-md font-medium mb-2">Image</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {existingImage && !uploadedImage && (
            <div  className="relative">
                <img
                  src={existingImage}
                  alt="Existing"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeImage("existing")}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <FaTimes size={12} />
                </button>
              </div>
            )}

            {uploadedImage && (
              <div  className="relative">
                <img
                  src={uploadedImage}
                  alt="Uploaded"
                 className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeImage("uploaded")}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <FaTimes size={12} />
                </button>
              </div>
            )}
          </div>

          <div className="mt-1">
            <h2 className="text-xl font-title mb-4 text-gray-800">
              Brand Name
            </h2>
            <div className="w-full mb-4">
              <input
                id="brandName"
                type="text"
                name="brandName"
                placeholder="Brand Name"
                className="border rounded p-2 w-full text-gray-800"
                onChange={handleInputChange}
                value={formData.brandName}
                required
              />
            </div>
          </div>
        </div>

        

        <div className="mt-6 flex justify-end space-x-4">
          <button
            type="button"
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded transition cursor-pointer"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="bg-table hover:bg-secondary text-white px-6 py-2 rounded transition cursor-pointer"
            onClick={handleSubmit}
          >
            {isEditMode ? "Update" : "Create"} Brand
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrandsForm;