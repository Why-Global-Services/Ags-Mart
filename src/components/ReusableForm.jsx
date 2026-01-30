import React from "react";
import { FaUpload, FaSpinner, FaTimes } from "react-icons/fa";

const ReusableForm = ({
  formData,
  handleInputChange,
  handleFileUpload,
  handleSubmit,
  uploadedImage,
  error,
  isLoading,
  isEdit,
  onCancel,
  fields,
  title,
  imageUploadConfig = {
    enabled: true,
    label: "Add Image",
    accept: "image/*",
    maxSize: 5,
    required: true,
  },
 
  handleImageRemove,
}) => {
  return (
    <div className="col-span-2 space-y-6 bg-white shadow-xl rounded-xl p-8 w-full max-w-4xl mx-auto">
      {title && (
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4 flex items-center">
          <svg
            className="w-5 h-5 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </div>
      )}

      {imageUploadConfig.enabled && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            {uploadedImage ? (
              <div className="flex-1 flex justify-center relative">
                <div className="relative w-48 h-48 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                  <img
                    src={uploadedImage}
                    alt="Uploaded preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleImageRemove}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
                    title="Remove image"
                  >
                    <FaTimes className="text-red-500 text-sm" />
                  </button>
                  {isEdit && (
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <span className="text-white text-sm font-medium">
                        New image will replace this
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="relative group w-full md:w-3xl">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col justify-center items-center relative transition-all duration-200 group-hover:border-orange-400 group-hover:bg-orange-50">
                  <FaUpload className="text-orange-500 text-3xl mb-3 group-hover:text-orange-600" />
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    accept={imageUploadConfig.accept}
                    className="absolute opacity-0 cursor-pointer inset-0 w-full h-full"
                    required={imageUploadConfig.required && !uploadedImage}
                  />
                  <p className="text-gray-600 text-center group-hover:text-orange-600">
                    Drag & drop your image here, or{" "}
                    <span className="text-orange-500 font-medium cursor-pointer">
                      click to browse
                    </span>
                  </p>
                  <p className="text-gray-400 text-xs mt-2">
                    Supports: {imageUploadConfig.accept.replace(/\*/g, "")} • Max:{" "}
                    {imageUploadConfig.maxSize}MB
                  </p>
                </div>
                {isLoading && (
                  <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center rounded-xl">
                    <FaSpinner className="animate-spin text-orange-500 text-2xl" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-6 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map((field) => (
            <div
              key={field.name}
              className={`space-y-2 ${field.gridSpan === "full" ? "md:col-span-2" : ""}`}
            >
              <label className="block text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              {field.type === "textarea" ? (
                <textarea
                  name={field.name}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg  focus:ring-primary focus:border-primary outline-none transition-all duration-200"
                  onChange={handleInputChange}
                  value={formData[field.name] || ""}
                  rows={field.rows || 4}
                  required={field.required}
                />
              ) : (
                <input
                  type={field.type || "text"}
                  name={field.name}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-2 border outline-none  border-gray-300 rounded-lg  focus:ring-primary focus:border-primary transition-all duration-200"
                  onChange={handleInputChange}
                  value={formData[field.name] || ""}
                  required={field.required}
                  min={field.min}
                  max={field.max}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-4">
        <button
          type="button"
          className="px-6 py-2.5 border border-gray-300 cursor-pointer rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="button"
          className="px-6 py-2.5 bg-table cursor-pointer rounded-lg text-white font-medium hover:bg-secondary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 flex items-center justify-center min-w-24"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Processing...
            </>
          ) : isEdit ? (
            "Update"
          ) : (
            "Create"
          )}
        </button>
      </div>
    </div>
  );
};

export default ReusableForm;