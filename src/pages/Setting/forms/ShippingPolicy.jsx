import React, { useState, useEffect } from "react";
import {
  createShippingPolicy,
  getAllShippingPolicy,
} from "../../../Interceptor/interceptor";

const ShippingPolicy = () => {
  // Define initial sections to match backend schema
  const initialSections = [
    {
      id: "Processing",
      titleField: "processingTimeTitle",
      contentField: "processingTimeContent",
      name: "Processing Time",
    },
    {
      id: "Domestic",
      titleField: "domesticShippingTitle",
      contentField: "domesticShippingContent",
      name: "Domestic Shipping",
    },
    {
      id: "Tracking",
      titleField: "orderTrackingTitle",
      contentField: "orderTrackingContent",
      name: "Order Tracking",
    },
    {
      id: "Restrictions",
      titleField: "shippingRestrictionsTitle",
      contentField: "shippingRestrictionsContent",
      name: "Shipping Restrictions",
    },
    {
      id: "Cash on Delivery",
      titleField: "cashOnDeliveryTitle",
      contentField: "cashOnDeliveryContent",
      name: "Cash on Delivery",
    },
    {
      id: "Damaged or Lost Packages",
      titleField: "damagedOrLostPackagesTitle",
      contentField: "damagedOrLostPackagesContent",
      name: "Damaged or Lost Packages",
    },
    {
      id: "Contact Us",
      titleField: "contactUsTitle",
      contentField: "contactUsContent",
      name: "Contact Us",
    },
  ];

  // State for sections
  const [sections, setSections] = useState(initialSections);
  // State for form data (inputs)
  const [formData, setFormData] = useState({});
  // State for saved data (preview)
  const [savedData, setSavedData] = useState({});
  // Loading and feedback states
  const [loading, setLoading] = useState(false);
  const [updatingSectionId, setUpdatingSectionId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  // State for new section input
  const [newSectionName, setNewSectionName] = useState("");
  // State to toggle add section form
  const [showAddSection, setShowAddSection] = useState(false);

  // Fetch policy on component mount
  useEffect(() => {
    fetchShippingPolicy();
  }, []);

  const fetchShippingPolicy = async () => {
    setLoading(true);
    try {
      const response = await getAllShippingPolicy();
      const data = response?.data;
      if (data) {
        // Initialize form data with all predefined fields
        const fetchedData = {};
        const loadedCustomSections = [];

        initialSections.forEach((section) => {
          fetchedData[section.titleField] =
            data[section.titleField] || section.name;
          fetchedData[section.contentField] = data[section.contentField] || "";
        });

        // Reconstruct custom sections from data.customSections if present
        if (Array.isArray(data.customSections)) {
          data.customSections.forEach((cs) => {
            if (cs && cs.id) {
              loadedCustomSections.push({
                id: cs.id,
                name: cs.name,
                titleField: cs.titleField,
                contentField: cs.contentField,
                isCustom: true,
              });
              fetchedData[cs.titleField] = cs.title || cs.name;
              fetchedData[cs.contentField] = cs.content || "";
            }
          });
        }

        setSections([...initialSections, ...loadedCustomSections]);
        setFormData((prev) => ({
          ...fetchedData,
          ...prev,
        }));
        setSavedData(fetchedData);
        setError(null);
      } else {
        // Initialize empty form if no data exists
        const initialData = initialSections.reduce(
          (acc, section) => ({
            ...acc,
            [section.titleField]: section.name,
            [section.contentField]: "",
          }),
          {}
        );
        setFormData(initialData);
        setSavedData(initialData);
      }
    } catch (err) {
      setError("Failed to fetch shipping policy. Please try again.");
      console.error("Error fetching shipping policy:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdate = async (sectionId) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) {
      setError("Section not found.");
      return;
    }

    const title = (formData[section.titleField] || "").trim();
    const content = (formData[section.contentField] || "").trim();

    if (!title) {
      setError(`${section.name} title is required.`);
      setSuccess(null);
      return;
    }
    if (!content) {
      setError(`${section.name} content is required.`);
      setSuccess(null);
      return;
    }

    setUpdatingSectionId(sectionId);
    setError(null);
    setSuccess(null);

    try {
      const isCustom = !initialSections.some((s) => s.id === section.id);
      let payload;

      if (isCustom) {
        payload = {
          customSection: {
            id: section.id,
            name: section.name,
            titleField: section.titleField,
            contentField: section.contentField,
            title,
            content,
          },
        };
      } else {
        payload = {
          [section.titleField]: title,
          [section.contentField]: content,
        };
      }

      await createShippingPolicy(payload);

      // Synchronize savedData for this section only, preserving other sections
      setSavedData((prev) => ({
        ...prev,
        [section.titleField]: title,
        [section.contentField]: content,
      }));

      // Synchronize trimmed values into formData
      setFormData((prev) => ({
        ...prev,
        [section.titleField]: title,
        [section.contentField]: content,
      }));

      setSuccess(`${section.name} updated successfully!`);
      setError(null);

      setTimeout(() => {
        setSuccess(null);
      }, 4000);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        `Failed to update ${section.name}. Please try again.`;
      setError(errorMessage);
      setSuccess(null);
      console.error(`Error updating shipping policy section ${section.name}:`, err);
    } finally {
      setUpdatingSectionId(null);
    }
  };

  const handleReset = (sectionId) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    // Reset this section back to its savedData or default title & empty content
    const defaultTitle = savedData[section.titleField] || section.name;
    const defaultContent = savedData[section.contentField] || "";

    setFormData((prev) => ({
      ...prev,
      [section.titleField]: defaultTitle,
      [section.contentField]: defaultContent,
    }));
    setError(null);
    setSuccess(null);
  };

  const handleAddSection = () => {
    if (!newSectionName.trim()) {
      setError("Section name is required.");
      return;
    }

    // Generate a unique ID for the new section
    const newId = newSectionName.trim().replace(/\s+/g, "-");
    const titleField = `${newId.toLowerCase()}Title`;
    const contentField = `${newId.toLowerCase()}Content`;

    // Avoid duplicate section IDs
    if (sections.some((s) => s.id.toLowerCase() === newId.toLowerCase())) {
      setError(`A section named "${newSectionName}" already exists.`);
      return;
    }

    // Create new section object
    const newSection = {
      id: newId,
      titleField,
      contentField,
      name: newSectionName.trim(),
      isCustom: true,
    };

    // Add to sections array
    setSections([...sections, newSection]);

    // Initialize form data for the new section
    setFormData((prev) => ({
      ...prev,
      [titleField]: newSectionName.trim(),
      [contentField]: "",
    }));

    // Reset and hide the add section form
    setNewSectionName("");
    setShowAddSection(false);
    setError(null);
    setSuccess(`Section "${newSection.name}" added. Enter details and click Update to save.`);
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-pink-600">
          Manage Shipping Policy
        </h1>
        <button
          onClick={() => setShowAddSection(!showAddSection)}
          className="px-4 py-2 bg-table text-white rounded-md hover:bg-secondary transition cursor-pointer"
        >
          {showAddSection ? "Cancel" : "Add Section"}
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg flex items-center justify-between">
          <span>{success}</span>
          <button
            onClick={() => setSuccess(null)}
            className="text-emerald-600 hover:text-emerald-900 font-bold ml-4"
          >
            ×
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-900 font-bold ml-4"
          >
            ×
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="mb-6 text-center text-gray-600">
          Loading shipping policy...
        </div>
      )}

      {/* Add Section Form */}
      {showAddSection && (
        <div className="mb-10 p-5 border border-gray-200 rounded-lg bg-gray-50">
          <h2 className="text-xl font-medium mb-4 text-gray-700">
            Add New Section
          </h2>
          <div className="mb-5">
            <label
              htmlFor="new-section-name"
              className="block text-sm font-medium text-gray-600 mb-1"
            >
              Section Name
            </label>
            <input
              type="text"
              id="new-section-name"
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              placeholder="e.g. International Shipping"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
            />
          </div>
          <button
            onClick={handleAddSection}
            className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-800 transition cursor-pointer"
          >
            Add Section
          </button>
        </div>
      )}

      {/* Form Sections */}
      {sections.map((section) => (
        <div key={section.id} className="mb-10">
          <h2 className="text-xl font-medium mb-4 text-gray-700">
            {section.name}
          </h2>

          <div className="mb-5">
            <label
              htmlFor={`title-${section.id}`}
              className="block text-sm font-medium text-gray-600 mb-1"
            >
              {section.name} Title
            </label>
            <input
              type="text"
              id={`title-${section.id}`}
              name={`title-${section.id}`}
              value={formData[section.titleField] || ""}
              onChange={(e) =>
                handleInputChange(section.titleField, e.target.value)
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
            />
          </div>

          <div className="mb-5">
            <label
              htmlFor={`content-${section.id}`}
              className="block text-sm font-medium text-gray-600 mb-1"
            >
              {section.name} Content
            </label>
            <textarea
              id={`content-${section.id}`}
              name={`content-${section.id}`}
              value={formData[section.contentField] || ""}
              onChange={(e) =>
                handleInputChange(section.contentField, e.target.value)
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
              rows="8"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleReset(section.id)}
              disabled={updatingSectionId === section.id}
              className="px-4 py-2 bg-gray-500 cursor-pointer text-white rounded-md hover:bg-gray-600 transition disabled:opacity-50"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => handleUpdate(section.id)}
              disabled={updatingSectionId === section.id}
              className="px-4 py-2 bg-table text-white cursor-pointer rounded-md hover:bg-secondary transition disabled:opacity-50"
            >
              {updatingSectionId === section.id
                ? "Updating..."
                : `Update ${section.name}`}
            </button>
          </div>

          {/* Preview for this section */}
          {savedData[section.titleField] && savedData[section.contentField] && (
            <div className="mt-6 p-5 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">
                Preview: {section.name}
              </h3>
              <h4 className="text-xl font-bold mb-3 text-gray-800">
                {savedData[section.titleField]}
              </h4>
              <p className="text-gray-600 whitespace-pre-line">
                {savedData[section.contentField]}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ShippingPolicy;
