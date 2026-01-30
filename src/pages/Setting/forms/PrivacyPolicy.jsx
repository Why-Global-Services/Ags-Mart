import React, { useState, useEffect } from "react";
import {
  createPrivacyPolicy,
  getPrivacyPolicy,
} from "../../../Interceptor/interceptor";

const PrivacyPolicy = () => {
  // Default sections
  const defaultSections = [
    {
      id: "introduction",
      title: "Introduction",
      titleField: "introductionTitle",
      contentField: "introductionContent",
    },
    {
      id: "informationCollection",
      title: "Information Collection",
      titleField: "informationCollectionTitle",
      contentField: "informationCollectionContent",
    },
    {
      id: "useOfInformation",
      title: "Use of Information",
      titleField: "useOfInformationTitle",
      contentField: "useOfInformationContent",
    },
    {
      id: "informationSharing",
      title: "Information Sharing",
      titleField: "informationSharingTitle",
      contentField: "informationSharingContent",
    },
    {
      id: "yourRights",
      title: "Your Rights",
      titleField: "yourRightsTitle",
      contentField: "yourRightsContent",
    },
    {
      id: "dataSecurity",
      title: "Data Security",
      titleField: "dataSecurityTitle",
      contentField: "dataSecurityContent",
    },
    {
      id: "childrensPrivacy",
      title: "Children's Privacy",
      titleField: "childrensPrivacyTitle",
      contentField: "childrensPrivacyContent",
    },
    {
      id: "changesToPolicy",
      title: "Changes to Policy",
      titleField: "changesToPolicyTitle",
      contentField: "changesToPolicyContent",
    },
    {
      id: "contactUs",
      title: "Contact Us",
      titleField: "contactUsTitle",
      contentField: "contactUsContent",
    },
  ];

  const [sections, setSections] = useState(defaultSections);
  const [formData, setFormData] = useState({});
  const [savedData, setSavedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newSectionTitle, setNewSectionTitle] = useState("");

  // Initialize form data with empty values for all sections
  useEffect(() => {
    const initialFormData = {};
    sections.forEach((section) => {
      initialFormData[section.titleField] = "";
      initialFormData[section.contentField] = "";
    });
    setFormData(initialFormData);
  }, [sections]);

  // Fetch privacy policy data on component mount
  useEffect(() => {
    fetchPrivacyPolicy();
  }, []);

  const fetchPrivacyPolicy = async () => {
    setLoading(true);
    try {
      const response = await getPrivacyPolicy();
      if (response.data) {
        setSavedData(response.data);
        // Update form data with fetched values
        const updatedFormData = { ...formData };
        sections.forEach((section) => {
          updatedFormData[section.titleField] =
            response.data[section.titleField] || "";
          updatedFormData[section.contentField] =
            response.data[section.contentField] || "";
        });
        setFormData(updatedFormData);
      }
      setError(null);
    } catch (err) {
      setError("Failed to fetch Privacy Policy. Please try again.");
      console.error("Error fetching Privacy Policy:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async () => {
    // Validate required fields
    const requiredFields = sections.flatMap((section) => [
      section.titleField,
      section.contentField,
    ]);

    for (const field of requiredFields) {
      if (!formData[field]?.trim()) {
        setError(`Please fill in all required fields (${field} is missing)`);
        return;
      }
    }

    try {
      setLoading(true);
      const response = await createPrivacyPolicy(formData);
      setSavedData(response.data);
      setError(null);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Failed to update Privacy Policy. Please try again.";
      setError(errorMessage);
      console.error("Error updating Privacy Policy:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (savedData) {
      const updatedFormData = { ...formData };
      sections.forEach((section) => {
        updatedFormData[section.titleField] =
          savedData[section.titleField] || "";
        updatedFormData[section.contentField] =
          savedData[section.contentField] || "";
      });
      setFormData(updatedFormData);
    }
    setError(null);
  };

  const handleAddSection = () => {
    if (!newSectionTitle.trim()) {
      setError("Please enter a title for the new section");
      return;
    }

    const newId = newSectionTitle.toLowerCase().replace(/\s+/g, "-");
    const titleField = `${newId}Title`;
    const contentField = `${newId}Content`;

    // Check if section already exists
    if (sections.some((section) => section.id === newId)) {
      setError("A section with this title already exists");
      return;
    }

    const newSection = {
      id: newId,
      title: newSectionTitle,
      titleField,
      contentField,
    };

    setSections([...sections, newSection]);
    setFormData((prev) => ({
      ...prev,
      [titleField]: "",
      [contentField]: "",
    }));
    setNewSectionTitle("");
    setError(null);
  };

  const handleRemoveSection = (sectionId) => {
    if (sections.length <= 1) {
      setError("You must have at least one section");
      return;
    }

    const sectionToRemove = sections.find(
      (section) => section.id === sectionId
    );
    if (!sectionToRemove) return;

    setSections(sections.filter((section) => section.id !== sectionId));

    // Remove the section data from formData
    const {
      [sectionToRemove.titleField]: _,
      [sectionToRemove.contentField]: __,
      ...rest
    } = formData;
    setFormData(rest);
    setError(null);
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <div className="text-2xl font-semibold mb-4">Privacy & Policy</div>

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {loading && (
        <div className="mb-4 p-2 bg-blue-100 text-blue-700 rounded">
          Loading...
        </div>
      )}

      {/* Add New Section */}
      <div className="mb-6 p-4 border rounded bg-gray-50">
        <div className="text-xl font-medium mb-4">Add New Section</div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <button
            onClick={handleAddSection}
            className="px-4 py-2 bg-table text-white rounded hover:bg-secondary"
            disabled={loading}
          >
            Add Section
          </button>
        </div>
      </div>

      {/* Dynamic Sections */}
      {sections.map((section) => (
        <div key={section.id} className="mb-6 p-4 border rounded relative">
          <button
            onClick={() => handleRemoveSection(section.id)}
            className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700"
            title="Remove section"
          >
            ×
          </button>

          <div className="text-xl font-medium mb-4">{section.title}</div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {section.title} Title
          </label>
          <input
            type="text"
            name={section.titleField}
            value={formData[section.titleField] || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />

          <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">
            {section.title} Content
          </label>
          <textarea
            name={section.contentField}
            value={formData[section.contentField] || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            rows="5"
          />
        </div>
      ))}

      <div className="mt-4 flex gap-4">
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-500 text-white cursor-pointer rounded hover:bg-gray-700"
          disabled={loading}
        >
          Reset
        </button>
        <button
          onClick={handleUpdate}
          className="px-4 py-2 bg-table text-white cursor-pointer rounded hover:bg-secondary"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update"}
        </button>
      </div>

      {/* Preview Section */}
      {savedData && (
        <div className="mt-10 p-4 border rounded bg-gray-50">
          <h3 className="text-xl font-semibold mb-2">Preview:</h3>

          {sections.map(
            (section) =>
              savedData[section.titleField] && (
                <div key={section.id} className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">
                    {savedData[section.titleField]}
                  </h2>
                  <p className="whitespace-pre-line">
                    {savedData[section.contentField]}
                  </p>
                </div>
              )
          )}

          <p className="text-sm text-gray-500 mt-4">
            Last Updated:{" "}
            {savedData.updatedAt
              ? new Date(savedData.updatedAt).toLocaleString()
              : "Not available"}
          </p>
        </div>
      )}
    </div>
  );
};

export default PrivacyPolicy;
