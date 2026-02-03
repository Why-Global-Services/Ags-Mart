import React, { useState, useEffect } from "react";
import { FaUpload, FaTimes } from "react-icons/fa";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { createTestimonial, updateTestimonial } from "../../Interceptor/interceptor";

const TestimonialForm = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Get data passed from Reviews table
  const passedReview = location.state?.review;

  const [formData, setFormData] = useState({
    name: "",
    productName: "",
    rating: "",
    comments: "",
    imageURL: null,
  });

  const [uploadedImage, setUploadedImage] = useState(null); // preview URL
  const [existingImageUrl, setExistingImageUrl] = useState(""); // from server
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Load data from passed state OR API
  useEffect(() => {
    if (isEditMode && passedReview) {
      // Use data passed from table (priority)
      setFormData({
        name: passedReview.name || "",
        productName: passedReview.productName || "",
        rating: passedReview.rating?.toString() || "",
        comments: passedReview.comments || "",
        imageURL: null,
      });
      if (passedReview.imageURL) {
        setExistingImageUrl(passedReview.imageURL);
        setUploadedImage(passedReview.imageURL);
      }
    } else if (!isEditMode) {
      // Add mode
      setFormData({ name: "", productName: "", rating: "", comments: "", imageURL: null });
      setUploadedImage(null);
      setExistingImageUrl("");
    }
  }, [isEditMode, passedReview]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(`File ${file.name} is not an image`);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(`File ${file.name} is too large (max 5MB)`);
      return;
    }

    if (uploadedImage && uploadedImage.startsWith("blob:")) {
      URL.revokeObjectURL(uploadedImage);
    }

    const previewUrl = URL.createObjectURL(file);
    setUploadedImage(previewUrl);
    setExistingImageUrl("");
    setFormData((prev) => ({ ...prev, imageURL: file }));
  };

  const removeImage = () => {
    if (uploadedImage && uploadedImage.startsWith("blob:")) {
      URL.revokeObjectURL(uploadedImage);
    }
    setUploadedImage(null);
    setExistingImageUrl("");
    setFormData((prev) => ({ ...prev, imageURL: null }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Name is required.";
    if (!formData.productName.trim()) return "Product name is required.";
    if (!formData.rating || formData.rating < 1 || formData.rating > 5) return "Rating must be 1–5.";
    if (!formData.comments.trim()) return "Comments are required.";
    // if (!uploadedImage && !existingImageUrl) return "An image is required.";
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

    const data = new FormData();
    data.append("name", formData.name);
    data.append("productName", formData.productName);
    data.append("rating", formData.rating);
    data.append("comments", formData.comments);
    if (formData.imageURL) data.append("imageURL", formData.imageURL);

    try {
      if (isEditMode) {
        await updateTestimonial(id, data);
        toast.success("Testimonial updated successfully");
      } else {
        await createTestimonial(data);
        toast.success("Testimonial created successfully");
      }
      navigate(-1);
    } catch (err) {
      const msg = err.response?.data?.message || "An error occurred. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (uploadedImage && uploadedImage.startsWith("blob:")) {
        URL.revokeObjectURL(uploadedImage);
      }
    };
  }, [uploadedImage]);

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <h1 className="text-3xl font-title text-gray-800 mb-4">
        {isEditMode ? "Edit Testimonial" : "Add Testimonial"}
      </h1>

      <button
        className="text-black rounded my-3 mr-4 w-full md:w-auto cursor-pointer"
        onClick={() => navigate(-1)}
      >
        ← Go back
      </button>

      <div className="bg-white shadow-lg rounded-lg p-6 w-full">
        {/* <h2 className="text-xl font-semibold mb-6 text-gray-800">
          {isEditMode && existingImageUrl && !uploadedImage
            ? "Current Image (click to replace)"
            : "Add Review Image"}
        </h2>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col justify-center items-center relative">
          <FaUpload className="text-orange-500 text-4xl mb-2" />
          <input
            type="file"
            onChange={handleFileUpload}
            className="absolute opacity-0 cursor-pointer inset-0"
            accept="image/*"
            disabled={isLoading}
          />
          <p className="text-gray-500">
            {uploadedImage || existingImageUrl ? "Click to replace image" : "Click to upload image"}
          </p>
        </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        {(uploadedImage || existingImageUrl) && (
          <div className="mt-4">
            <h3 className="text-md font-medium mb-2">Image Preview</h3>
            <div className="relative">
              <img
                src={uploadedImage || existingImageUrl}
                alt="Preview"
                className="w-full h-64 object-contain rounded-lg"
              />
              <button
                onClick={removeImage}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                disabled={isLoading}
              >
                <FaTimes size={12} />
              </button>
            </div>
          </div>
        )} */}

        <div className="mt-6">
          <h2 className="text-xl font-title mb-4 text-gray-800">Review Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-600 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="Your Name"
                className="border rounded p-2 w-full text-gray-800"
                onChange={handleInputChange}
                value={formData.name}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="productName" className="block text-sm font-medium text-gray-600 mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                id="productName"
                type="text"
                name="productName"
                placeholder="Product Name"
                className="border rounded p-2 w-full text-gray-800"
                onChange={handleInputChange}
                value={formData.productName}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="rating" className="block text-sm font-medium text-gray-600 mb-2">
                Rating <span className="text-red-500">*</span> (1-5)
              </label>
              <input
                id="rating"
                type="number"
                name="rating"
                min="1"
                max="5"
                placeholder="Rating"
                className="border rounded p-2 w-full text-gray-800"
                onChange={handleInputChange}
                value={formData.rating}
                required
                disabled={isLoading}
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="comments" className="block text-sm font-medium text-gray-600 mb-2">
                Comments <span className="text-red-500">*</span>
              </label>
              <textarea
                id="comments"
                name="comments"
                placeholder="Your comments"
                className="border rounded p-2 w-full text-gray-800"
                onChange={handleInputChange}
                value={formData.comments}
                rows={4}
                required
                disabled={isLoading}
              />
            </div>
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
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {isEditMode ? "Updating..." : "Creating..."}
              </span>
            ) : (
              <>{isEditMode ? "Update Testimonial" : "Create Testimonial"}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestimonialForm;