/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { createAdminPolicy, getAdminPolicy } from "../../../Interceptor/interceptor";

const AdminPolicy = () => {
  // State to hold form data for all sections
  const [formData, setFormData] = useState({
    introductionTitle: "",
    introductionContent: "",
    accountManagementTitle: "",
    accountManagementContent: "",
    userConductTitle: "",
    userConductContent: "",
    orderProcessingTitle: "",
    orderProcessingContent: "",
    disputeResolutionTitle: "",
    disputeResolutionContent: "",
    accountVerificationTitle: "",
    accountVerificationContent: "",
    policyEnforcementTitle: "",
    policyEnforcementContent: "",
    changesToPolicyTitle: "",
    changesToPolicyContent: "",
    contactUsTitle: "",
    contactUsContent: "",
  });

  // State for saved data (preview)
  const [savedData, setSavedData] = useState(null);
  const [allAdmins, setAllAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all admin policies on component mount
  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await getAdminPolicy();
      const admins = Array.isArray(response.data) ? response.data : [response.data];
      setAllAdmins(admins);
      setError(null);
    } catch (err) {
      setError("Failed to fetch admin policies. Please try again.");
      console.error("Error fetching policies:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes for each section
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validate and submit form data
  const handleUpdate = async () => {
    // Validate all required fields
    const requiredFields = Object.keys(formData);
    for (const field of requiredFields) {
      if (!formData[field].trim()) {
        setError(`${field.replace(/([A-Z])/g, " $1").trim()} is required.`);
        return;
      }
    }

    try {
      // Send the entire formData as payload
      const response = await createAdminPolicy(formData);
      setSavedData(formData);
      console.log("Saved Policy:", formData);

      // Refresh the admin policies list
      await fetchAdmins();
      setError(null);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to save admin policy. Please try again.";
      setError(errorMessage);
      console.error("Error saving policy:", err);
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      introductionTitle: "",
      introductionContent: "",
      accountManagementTitle: "",
      accountManagementContent: "",
      userConductTitle: "",
      userConductContent: "",
      orderProcessingTitle: "",
      orderProcessingContent: "",
      disputeResolutionTitle: "",
      disputeResolutionContent: "",
      accountVerificationTitle: "",
      accountVerificationContent: "",
      policyEnforcementTitle: "",
      policyEnforcementContent: "",
      changesToPolicyTitle: "",
      changesToPolicyContent: "",
      contactUsTitle: "",
      contactUsContent: "",
    });
    setSavedData(null);
    setError(null);
  };

  // Define sections for rendering
  const sections = [
    { name: "Introduction", titleKey: "introductionTitle", contentKey: "introductionContent" },
    { name: "Account Management", titleKey: "accountManagementTitle", contentKey: "accountManagementContent" },
    { name: "User Conduct", titleKey: "userConductTitle", contentKey: "userConductContent" },
    { name: "Order Processing", titleKey: "orderProcessingTitle", contentKey: "orderProcessingContent" },
    { name: "Dispute Resolution", titleKey: "disputeResolutionTitle", contentKey: "disputeResolutionContent" },
    { name: "Account Verification", titleKey: "accountVerificationTitle", contentKey: "accountVerificationContent" },
    { name: "Policy Enforcement", titleKey: "policyEnforcementTitle", contentKey: "policyEnforcementContent" },
    { name: "Changes to Policy", titleKey: "changesToPolicyTitle", contentKey: "changesToPolicyContent" },
    { name: "Contact Us", titleKey: "contactUsTitle", contentKey: "contactUsContent" },
  ];

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <div className="text-2xl font-semibold mb-4">Admin Policy</div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {/* Form Sections */}
      {sections.map((section) => (
        <div key={section.titleKey} className="mb-6">
          <div className="text-xl font-medium mb-4 mt-5">{section.name}</div>

          <label
            htmlFor={`${section.titleKey}`}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {section.name} Title
          </label>
          <input
            type="text"
            id={`${section.titleKey}`}
            name={`${section.titleKey}`}
            value={formData[section.titleKey]}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />

          <label
            htmlFor={`${section.contentKey}`}
            className="block text-sm font-medium text-gray-700 mb-1 mt-4"
          >
            {section.name} Content
          </label>
          <textarea
            id={`${section.contentKey}`}
            name={`${section.contentKey}`}
            value={formData[section.contentKey]}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            rows="8"
          />
        </div>
      ))}

      {/* Buttons */}
      <div className="mt-4 flex gap-4">
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-500 cursor-pointer text-white rounded hover:bg-gray-700"
        >
          Reset
        </button>
        <button
          onClick={handleUpdate}
          className="px-4 py-2 bg-table text-white cursor-pointer rounded hover:bg-secondary"
        >
          Update 
        </button>
      </div>

      {/* Preview Section */}
      {savedData && (
        <div className="mt-10 p-4 border rounded bg-gray-50">
          <h3 className="text-xl font-semibold mb-2">Preview:</h3>
          {sections.map((section) => (
            <div key={section.titleKey} className="mb-4">
              <h2 className="text-2xl font-bold mb-2">{savedData[section.titleKey]}</h2>
              <div className="prose max-w-none whitespace-pre-line">
                {savedData[section.contentKey]}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All Admin Policies Section */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4">All Admin Policy Entries</h3>
        {loading ? (
          <div>Loading...</div>
        ) : allAdmins.length === 0 ? (
          <div>No admin policy entries found.</div>
        ) : (
          <div className="grid gap-4">
            {allAdmins.map((admin) => (
              <div key={admin._id} className="p-4 border rounded bg-gray-50">
                {sections.map((section) => (
                  <div key={section.titleKey} className="mb-4">
                    <h4 className="text-lg font-bold">{admin[section.titleKey]}</h4>
                    <p className="mt-2 whitespace-pre-line">{admin[section.contentKey]}</p>
                  </div>
                ))}
                <p className="text-sm text-gray-500 mt-2">
                  Created: {new Date(admin.createdAt).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  Updated: {new Date(admin.updatedAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPolicy;