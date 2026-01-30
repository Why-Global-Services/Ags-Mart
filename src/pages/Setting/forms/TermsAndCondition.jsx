import React, { useState, useEffect } from "react";
import {
  createTermsAndConduction,
  getAllTermsAndConduction,
} from "../../../Interceptor/interceptor";

const TermsAndCondition = () => {
  // Initial sections to match backend schema
  const initialSections = [
    {
      id: "acceptance",
      titleField: "acceptanceOfTermsTitle",
      contentField: "acceptanceOfTermsContent",
      name: "Acceptance of Terms",
    },
    {
      id: "registration",
      titleField: "userAccountsRegistrationTitle",
      contentField: "userAccountsRegistrationContent",
      name: "User Accounts & Registration",
    },
    {
      id: "product",
      titleField: "productInformationTitle",
      contentField: "productInformationContent",
      name: "Product Information",
    },
    {
      id: "payment",
      titleField: "purchasePaymentTitle",
      contentField: "purchasePaymentContent",
      name: "Purchase & Payment",
    },
    {
      id: "intellectual",
      titleField: "intellectualPropertyTitle",
      contentField: "intellectualPropertyContent",
      name: "Intellectual Property",
    },
    {
      id: "disclaimers",
      titleField: "disclaimersLimitationsTitle",
      contentField: "disclaimersLimitationsContent",
      name: "Disclaimers & Limitations",
    },
    {
      id: "governing",
      titleField: "governingLawTitle",
      contentField: "governingLawContent",
      name: "Governing Law",
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
  // State to track if we're adding a new section
  const [isAddingSection, setIsAddingSection] = useState(false);

  // Fetch terms on component mount
  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    setLoading(true);
    try {
      const response = await getAllTermsAndConduction();
      const data = response.data; // Expecting a single document
      if (data) {
        const fetchedData = {
          acceptanceOfTermsTitle:
            data.acceptanceOfTermsTitle || "Acceptance of Terms",
          acceptanceOfTermsContent: data.acceptanceOfTermsContent || "",
          userAccountsRegistrationTitle:
            data.userAccountsRegistrationTitle ||
            "User Accounts & Registration",
          userAccountsRegistrationContent:
            data.userAccountsRegistrationContent || "",
          productInformationTitle:
            data.productInformationTitle || "Product Information",
          productInformationContent: data.productInformationContent || "",
          purchasePaymentTitle:
            data.purchasePaymentTitle || "Purchase & Payment",
          purchasePaymentContent: data.purchasePaymentContent || "",
          intellectualPropertyTitle:
            data.intellectualPropertyTitle || "Intellectual Property",
          intellectualPropertyContent: data.intellectualPropertyContent || "",
          disclaimersLimitationsTitle:
            data.disclaimersLimitationsTitle || "Disclaimers & Limitations",
          disclaimersLimitationsContent:
            data.disclaimersLimitationsContent || "",
          governingLawTitle: data.governingLawTitle || "Governing Law",
          governingLawContent: data.governingLawContent || "",
        };

        // Add any custom sections from the database
        const customSections = Object.keys(data)
          .filter(
            (key) =>
              key.endsWith("Title") &&
              !initialSections.some((s) => s.titleField === key)
          )
          .map((key) => {
            const baseKey = key.replace("Title", "");
            return {
              id: baseKey.toLowerCase(),
              titleField: key,
              contentField: `${baseKey}Content`,
              name: data[key] || baseKey.replace(/([A-Z])/g, " $1").trim(),
            };
          });

        if (customSections.length > 0) {
          setSections([...initialSections, ...customSections]);
        }

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
      setError("Failed to fetch terms and conditions. Please try again.");
      console.error("Error fetching terms:", err);
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
    const title = formData[section.titleField];
    const content = formData[section.contentField];

    if (!title.trim()) {
      setError(`${section.name} title is required.`);
      return;
    }
    if (!content.trim()) {
      setError(`${section.name} content is required.`);
      return;
    }

    try {
      const payload = { ...formData, _id: documentId };
      const response = await createTermsAndConduction(payload);
      setSavedData(formData);
      setDocumentId(response.data._id || documentId);
      setError(null);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Failed to update terms and conditions. Please try again.";
      setError(errorMessage);
      console.error("Error updating terms:", err);
    }
  };

  const handleReset = (sectionId) => {
    const section = sections.find((s) => s.id === sectionId);
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
    setIsAddingSection(true);
  };

  const handleCancelAddSection = () => {
    setIsAddingSection(false);
    setNewSectionName("");
  };

  const handleSaveNewSection = () => {
    if (!newSectionName.trim()) {
      setError("Section name is required");
      return;
    }

    // Generate field names
    const baseFieldName = newSectionName
      .replace(/\s+/g, "")
      .replace(/([a-z])([A-Z])/g, "$1$2");
    const titleField = `${baseFieldName}Title`;
    const contentField = `${baseFieldName}Content`;
    const id = baseFieldName.toLowerCase();

    // Check if section already exists
    if (sections.some((s) => s.id === id)) {
      setError("A section with this name already exists");
      return;
    }

    // Create new section
    const newSection = {
      id,
      titleField,
      contentField,
      name: newSectionName,
    };

    // Add to sections
    setSections([...sections, newSection]);

    // Initialize form data for this section
    setFormData((prev) => ({
      ...prev,
      [titleField]: newSectionName,
      [contentField]: "",
    }));

    // Reset and close
    setIsAddingSection(false);
    setNewSectionName("");
    setError(null);
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Manage Terms & Conditions
        </h1>
        <button
          onClick={handleAddSection}
          className="px-4 py-2 bg-table text-white rounded-md hover:bg-secondary transition"
        >
          Add Section
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
        <div className="mb-6 text-center text-gray-600">Loading terms...</div>
      )}

      {/* Add New Section Form */}
      {isAddingSection && (
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
          <div className="flex gap-4">
            <button
              onClick={handleCancelAddSection}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveNewSection}
              className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition"
            >
              Save Section
            </button>
          </div>
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
              onClick={() => handleReset(section.id)}
              className="px-4 py-2 bg-gray-500 text-white cursor-pointer rounded-md hover:bg-gray-600 transition"
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

export default TermsAndCondition;
