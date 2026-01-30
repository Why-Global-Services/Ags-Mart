import React, { useState, useEffect } from "react";
import {
  createReturnPolicy,
  getAllReturnPolicy,
} from "../../../Interceptor/interceptor";

const ReturnPolicy = () => {
  // Define initial sections
  const initialSections = [
    {
      id: "Our Policy",
      titleField: "ourReturnPolicy",
      contentField: "ourReturnPolicyContent",
      name: "Our Return Policy",
    },
    {
      id: "Eligibility",
      titleField: "eligibilityForReturns",
      contentField: "eligibilityForReturnsContent",
      name: "Eligibility for Returns",
    },
    {
      id: "Return an Item",
      titleField: "howToReturnAnItem",
      contentField: "howToReturnAnItemContent",
      name: "How to Return an Item",
    },
    {
      id: "Refund",
      titleField: "refundProcess",
      contentField: "refundProcessContent",
      name: "Refund Process",
    },
    {
      id: "Shipping",
      titleField: "returnShipping",
      contentField: "returnShippingContent",
      name: "Return Shipping",
    },
  ];

  // State for sections
  const [sections, setSections] = useState(initialSections);
  // State for form data (single document)
  const [formData, setFormData] = useState({});
  // State for saved data (preview)
  const [savedData, setSavedData] = useState({});
  // State for document ID
  const [documentId, setDocumentId] = useState(null);
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // State for new section input
  const [newSectionName, setNewSectionName] = useState("");
  // State to toggle add section form
  const [showAddSection, setShowAddSection] = useState(false);

  // Fetch terms on component mount
  useEffect(() => {
    fetchReturnPolicy();
  }, []);

  const fetchReturnPolicy = async () => {
    setLoading(true);
    try {
      const response = await getAllReturnPolicy();
      const data = response.data; // Expecting a single document
      if (data) {
        // Initialize form data with all possible fields from initial sections
        const fetchedData = {};
        initialSections.forEach((section) => {
          fetchedData[section.titleField] =
            data[section.titleField] || section.name;
          fetchedData[section.contentField] = data[section.contentField] || "";
        });

        // Also include any additional sections that might exist in the database
        Object.keys(data).forEach((key) => {
          if (!fetchedData.hasOwnProperty(key)) {
            fetchedData[key] = data[key];
          }
        });

        setFormData(fetchedData);
        setSavedData(fetchedData);
        setDocumentId(data._id);
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
      setError("Failed to fetch Return policy. Please try again.");
      console.error("Error fetching return policy:", err);
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

    const title = formData[section.titleField];
    const content = formData[section.contentField];

    if (!title?.trim()) {
      setError(`${section.name} title is required.`);
      return;
    }
    if (!content?.trim()) {
      setError(`${section.name} content is required.`);
      return;
    }

    try {
      const payload = { ...formData, _id: documentId };
      const response = await createReturnPolicy(payload);
      setSavedData(formData);
      setDocumentId(response.data._id || documentId);
      setError(null);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Failed to update Return policy. Please try again.";
      setError(errorMessage);
      console.error("Error updating Return policy:", err);
    }
  };

  const handleReset = (sectionId) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    setFormData((prev) => ({
      ...prev,
      [section.titleField]: section.name,
      [section.contentField]: "",
    }));
    setSavedData((prev) => ({
      ...prev,
      [section.titleField]: section.name,
      [section.contentField]: "",
    }));
    setError(null);
  };

  const handleAddSection = () => {
    if (!newSectionName.trim()) {
      setError("Section name is required.");
      return;
    }

    // Generate a unique ID for the new section
    const newId = newSectionName.replace(/\s+/g, "-");
    const titleField = `${newId.toLowerCase()}Title`;
    const contentField = `${newId.toLowerCase()}Content`;

    // Create new section object
    const newSection = {
      id: newId,
      titleField,
      contentField,
      name: newSectionName,
    };

    // Add to sections array
    setSections([...sections, newSection]);

    // Initialize form data for the new section
    setFormData((prev) => ({
      ...prev,
      [titleField]: newSectionName,
      [contentField]: "",
    }));

    // Reset and hide the add section form
    setNewSectionName("");
    setShowAddSection(false);
    setError(null);
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Manage Return Policy
        </h1>
        <button
          onClick={() => setShowAddSection(!showAddSection)}
          className="px-4 py-2 bg-table text-white rounded-md hover:bg-secondary transition"
        >
          {showAddSection ? "Cancel" : "Add"}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="mb-6 text-center text-gray-600">
          Loading Return policy...
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
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
            />
          </div>
          <button
            onClick={handleAddSection}
            className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition"
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
              rows="4"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => handleReset(section.id)}
              className="px-4 py-2 bg-gray-500 cursor-pointer text-white rounded-md hover:bg-gray-600 transition"
            >
              Reset
            </button>
            <button
              onClick={() => handleUpdate(section.id)}
              className="px-4 py-2 bg-table text-white cursor-pointer rounded-md hover:bg-secondary transition"
            >
              Update {section.name}
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

export default ReturnPolicy;
