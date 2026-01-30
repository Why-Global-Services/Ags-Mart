import React, { useState, useEffect } from "react";
import { createAboutUs, getAllAboutUs } from "../../../Interceptor/interceptor";
import { FaUpload, FaPlus, FaMinus, FaEdit, FaTimes } from "react-icons/fa";

const AboutUs = () => {
  const [formData, setFormData] = useState({
    bannerTitle: "",
    bannerContent: "", 
    bannerImage: null,
    existingBannerImage: "",
    contentSections: [
      {
        title: "",
        description: "",
        image: null,
        existingImage: "",
      },
    ],
  });

  const [allAbouts, setAllAbouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchAllAbouts();
  }, []);

  const fetchAllAbouts = async () => {
    setLoading(true);
    try {
      const response = await getAllAboutUs();
      const abouts = Array.isArray(response.data) ? response.data : [response.data];
      console.log(abouts, "this is the about data");
      setAllAbouts(abouts.filter(Boolean)); // Filter out null/undefined
      setError(null);
    } catch (err) {  
      setError(err.response.data.message || "Failed to fetch about data.");
      console.error("Error fetching abouts:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadDataForEditing = (aboutData) => {
    console.log("Loading data for editing:", aboutData);
    
    setFormData({
      bannerTitle: aboutData.bannerTitle || "",
      bannerContent: aboutData.bannerContent || "",
      bannerImage: null, // Don't load file object, just URL
      existingBannerImage: aboutData.bannerImage || "",
      contentSections: aboutData.content?.map(section => ({
        title: section.contentTitle || "",
        description: section.contentDescription || "",
        image: null, // Don't load file object, just URL
        existingImage: section.contentImage || "",
      })) || [
        {
          title: "",
          description: "",
          image: null,
          existingImage: "",
        },
      ],
    });
    
    setIsEditing(true);
    setEditingId(aboutData._id);
    setError(null);
    setSuccess(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleContentSectionChange = (index, e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedSections = [...prev.contentSections];
      updatedSections[index] = {
        ...updatedSections[index],
        [name]: value,
      };
      return {
        ...prev,
        contentSections: updatedSections,
      };
    });
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size should be less than 5MB");
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError("Please select a valid image file");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        [field]: file,
        // Clear existing image URL when new file is selected
        ...(field === 'bannerImage' && { existingBannerImage: "" })
      }));
      
      setError(null);
    }
  };

  const handleContentImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size should be less than 5MB");
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError("Please select a valid image file");
        return;
      }

      setFormData((prev) => {
        const updatedSections = [...prev.contentSections];
        updatedSections[index] = {
          ...updatedSections[index],
          image: file,
          existingImage: "", // Clear existing image URL when new file is selected
        };
        return {
          ...prev,
          contentSections: updatedSections,
        };
      });
      
      setError(null);
    }
  };

  const addContentSection = () => {
    setFormData((prev) => ({
      ...prev,
      contentSections: [
        ...prev.contentSections,
        {
          title: "",
          description: "",
          image: null,
          existingImage: "",
        },
      ],
    }));
  };

  const removeContentSection = (index) => {
    if (formData.contentSections.length === 1) {
      setError("At least one content section is required");
      return;
    }
    
    setFormData((prev) => {
      const updatedSections = [...prev.contentSections];
      updatedSections.splice(index, 1);
      return {
        ...prev,
        contentSections: updatedSections,
      };
    });
  };

  const validateForm = () => {
    // if (!formData.bannerTitle.trim()) {
    //   setError("Banner Title is required.");
    //   return false;
    // }
    // if (!formData.bannerContent.trim()) {
    //   setError("Banner Content is required.");
    //   return false;
    // }

    // Validate content sections
    for (let i = 0; i < formData.contentSections.length; i++) {
      const section = formData.contentSections[i];
      if (!section.title.trim()) {
        setError(`Content Title is required for section ${i + 1}.`);
        return false;
      }
      if (!section.description.trim()) {
        setError(`Content Description is required for section ${i + 1}.`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("bannerTitle", formData.bannerTitle.trim());
      formDataToSend.append("bannerContent", formData.bannerContent.trim());

      // Handle banner image
      if (formData.bannerImage) {
        formDataToSend.append("bannerImage", formData.bannerImage);
      }

      // Append content sections with existing image data
      formData.contentSections.forEach((section, index) => {
        formDataToSend.append(
          `contentSections[${index}][title]`,
          section.title.trim()
        );
        formDataToSend.append(
          `contentSections[${index}][description]`,
          section.description.trim()
        );
        
        if (section.image) {
          formDataToSend.append(
            `contentSections[${index}][image]`,
            section.image
          );
        }
        
        // Send existing image URL for backend to preserve
        if (section.existingImage && !section.image) {
          formDataToSend.append(
            `contentSections[${index}][existingImage]`,
            section.existingImage
          );
        }
      });

      const response = await createAboutUs(formDataToSend);
      
      setSuccess(isEditing ? "About Us updated successfully!" : "About Us created successfully!");
      await fetchAllAbouts();
      
      // Reset form if creating new, keep form if editing
      if (!isEditing) {
        handleReset();
      }
      
      setError(null);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Failed to save about data. Please try again.";
      setError(errorMessage);
      console.error("Error saving about:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      bannerTitle: "",
      bannerContent: "",
      bannerImage: null,
      existingBannerImage: "",
      contentSections: [
        {
          title: "",
          description: "",
          image: null,
          existingImage: "",
        },
      ],
    });
    setIsEditing(false);
    setEditingId(null);
    setError(null);
    setSuccess(null);
  };

  const cancelEdit = () => {
    handleReset();
  };

  const getImagePreview = (imageFile, existingImageUrl, altText) => {
    if (imageFile) {
      return URL.createObjectURL(imageFile);
    } else if (existingImageUrl) {
      return existingImageUrl;
    }
    return null;
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <div className="text-2xl font-semibold">
          {isEditing ? "Edit About Us" : "Create About Us"}
        </div>
        {isEditing && (
          <button
            onClick={cancelEdit}
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            <FaTimes /> Cancel Edit
          </button>
        )}
      </div>

      <div className="text-xl font-medium mb-4">Banner Section</div>

      {/* Banner Image */}
      {/* <label className="block text-sm font-medium text-gray-700 mb-1">
        Banner Image
      </label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col justify-center items-center relative mb-6">
        <FaUpload className="text-orange-500 text-4xl mb-2" />
        <input
          type="file"
          onChange={(e) => handleFileChange(e, "bannerImage")}
          className="absolute opacity-0 cursor-pointer inset-0"
          accept="image/*"
        />
        <p className="text-gray-500">
          Drag your images here, or{" "}
          <span className="text-orange-500 cursor-pointer">
            click to browse
          </span>
        </p>
        {formData.bannerImage && (
          <p className="mt-2 text-sm text-gray-600">
            Selected: {formData.bannerImage.name}
          </p>
        )}
        {!formData.bannerImage && formData.existingBannerImage && (
          <p className="mt-2 text-sm text-blue-600">
            Current: Banner Image (click to change)
          </p>
        )}
      </div> */}

      {/* Banner Image Preview */}
      {(formData.bannerImage || formData.existingBannerImage) && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Banner Image Preview
          </label>
          <img
            src={getImagePreview(formData.bannerImage, formData.existingBannerImage, "Banner")}
            alt="Banner Preview"
            className="w-full h-64 object-cover rounded border"
          />
        </div>
      )}

      {/* Banner Title */}
      {/* <div className="mb-6">
        <label
          htmlFor="bannerTitle"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Banner Title *
        </label>
        <input
          type="text"
          id="bannerTitle"
          name="bannerTitle"
          value={formData.bannerTitle}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="Enter banner title"
        />
      </div>

      {/* Banner Content */}
      {/* <div className="mb-6">
        <label
          htmlFor="bannerContent"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Banner Content *
        </label>
        <textarea
          id="bannerContent"
          name="bannerContent"
          value={formData.bannerContent}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          rows="6"
          placeholder="Enter banner content"
        />
      </div> */} 

      <div className="text-xl font-medium mb-4">Content Sections</div>

      {formData.contentSections.map((section, index) => (
        <div key={index} className="mb-8 p-4 border rounded-lg relative">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Section {index + 1}</h3>
            {formData.contentSections.length > 1 && (
              <button
                onClick={() => removeContentSection(index)}
                className="text-red-500 hover:text-red-700 p-2"
                title="Remove section"
              >
                <FaMinus />
              </button>
            )}
          </div>

          {/* Content Image */}
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content Image
          </label>
          <span className="block text-xs font-medium text-gray-700 mb-1">1200 × 800 px</span>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col justify-center items-center relative mb-6">
            <FaUpload className="text-orange-500 text-3xl mb-2" />
            <input
              type="file"
              onChange={(e) => handleContentImageChange(index, e)}
              className="absolute opacity-0 cursor-pointer inset-0"
              accept="image/*"
            />
            <p className="text-gray-500 text-sm">
              Drag your images here, or{" "}
              <span className="text-orange-500 cursor-pointer">
                click to browse
              </span>
            </p>
            {section.image && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {section.image.name}
              </p>
            )}
            {!section.image && section.existingImage && (
              <p className="mt-2 text-sm text-blue-600">
                Current: Content Image (click to change)
              </p>
            )}
          </div>

          {/* Image Preview */}
          {(section.image || section.existingImage) && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image Preview
              </label>
              <img
                src={getImagePreview(section.image, section.existingImage, `Content ${index + 1}`)}
                alt={`Content ${index + 1} Preview`}
                className="w-full h-64 object-cover rounded border"
              />
            </div>
          )}

          {/* Content Title */}
          <div className="mb-6">
            <label
              htmlFor={`contentTitle-${index}`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Content Title *
            </label>
            <input
              type="text"
              id={`contentTitle-${index}`}
              name="title"
              value={section.title}
              onChange={(e) => handleContentSectionChange(index, e)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter content title"
            />
          </div>

          {/* Content Description */}
          <div className="mb-6">
            <label
              htmlFor={`contentDescription-${index}`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Content Description *
            </label>
            <textarea
              id={`contentDescription-${index}`}
              name="description"
              value={section.description}
              onChange={(e) => handleContentSectionChange(index, e)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows="6"
              placeholder="Enter content description"
            />
          </div>
        </div>
      ))}

      <button
        onClick={addContentSection}
        className="mb-6 flex items-center gap-2 px-4 py-2 bg-table text-white rounded hover:bg-secondary"
      >
        <FaPlus /> Add Another Content Section
      </button>

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded border border-green-300">
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-300">
          {error}
        </div>
      )}

      {/* Buttons */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={handleReset}
          className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          disabled={loading}
        >
          Reset
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-table text-white rounded hover:bg-secondary disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Saving..." : (isEditing ? "Update" : "Create")}
        </button>
      </div>

      {/* All About Entries */}
      <div className="mt-12 border-t pt-8">
        <h3 className="text-xl font-semibold mb-6">All About Entries</h3>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <p className="mt-2">Loading...</p>
          </div>
        ) : allAbouts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No about entries found. Create your first entry above.
          </div>
        ) : (
          <div className="space-y-6">
            {allAbouts.map((about) => (
              <div key={about._id} className="p-6 border rounded-lg bg-gray-50 relative">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-xl font-bold text-gray-800">{about.bannerTitle}</h4>
                  <button
                    onClick={() => loadDataForEditing(about)}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    <FaEdit size={12} /> Edit
                  </button>
                </div>
                
                {about.bannerImage && (
                  <img
                    src={about.bannerImage}
                    alt="Banner"
                    className="w-full h-48 object-cover rounded mb-4"
                  />
                )}
                
                <p className="text-gray-700 mb-4">{about.bannerContent}</p>

                {about.content?.map((section, index) => (
                  <div key={index} className="mb-6 pl-4 border-l-4 border-orange-200">
                    <h5 className="text-lg font-semibold text-gray-800 mb-2">
                      {section.contentTitle}
                    </h5>
                    {section.contentImage && (
                      <img
                        src={section.contentImage}
                        alt={`Content ${index + 1}`}
                        className="w-full h-48 object-cover rounded mb-3"
                      />
                    )}
                    <p className="text-gray-600">{section.contentDescription}</p>
                  </div>
                ))}
                
                <div className="flex justify-between text-sm text-gray-500 mt-4">
                  <span>Created: {new Date(about.createdAt).toLocaleString()}</span>
                  <span>Updated: {new Date(about.updatedAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AboutUs;