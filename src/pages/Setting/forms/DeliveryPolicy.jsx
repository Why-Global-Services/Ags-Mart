import React, { useState, useEffect } from "react";
import { createDeliveryPolicy, getDeliveryPolicy, createPrivacyPolicy } from "../../../Interceptor/interceptor";

const DeliveryPolicy = () => {
  // State for form data, aligned with backend schema and matching PrivacyPolicy structure
  const [formData, setFormData] = useState({
    introductionTitle: "",
    introductionContent: "",
    orderProcessingTimesTitle: "",
    orderProcessingTimesContent: "",
    shippingMethodsTitle: "",
    shippingMethodsContent: "",
    shippingCostsTitle: "",
    shippingCostsContent: "",
    internationalShippingTitle: "",
    internationalShippingContent: "",
    deliveryIssuesTitle: "",
    deliveryIssuesContent: "",
    returnsAndExchangesTitle: "",
    returnsAndExchangesContent: "",
    orderTrackingTitle: "",
    orderTrackingContent: "",
    changesToPolicyTitle: "",
    changesToPolicyContent: "",
    contactUsTitle: "",
    contactUsContent: "",
  });

  const [savedData, setSavedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch delivery policy data on component mount
  useEffect(() => {
    fetchDeliveryPolicy();
  }, []);

  const fetchDeliveryPolicy = async () => {
    setLoading(true);
    try {
      const response = await getDeliveryPolicy();
      if (response.data) {
        setSavedData(response.data);
        setFormData({
          introductionTitle: response.data.introductionTitle || "",
          introductionContent: response.data.introductionContent || "",
          orderProcessingTimesTitle: response.data.orderProcessingTimesTitle || "",
          orderProcessingTimesContent: response.data.orderProcessingTimesContent || "",
          shippingMethodsTitle: response.data.shippingMethodsTitle || "",
          shippingMethodsContent: response.data.shippingMethodsContent || "",
          shippingCostsTitle: response.data.shippingCostsTitle || "",
          shippingCostsContent: response.data.shippingCostsContent || "",
          internationalShippingTitle: response.data.internationalShippingTitle || "",
          internationalShippingContent: response.data.internationalShippingContent || "",
          deliveryIssuesTitle: response.data.deliveryIssuesTitle || "",
          deliveryIssuesContent: response.data.deliveryIssuesContent || "",
          returnsAndExchangesTitle: response.data.returnsAndExchangesTitle || "",
          returnsAndExchangesContent: response.data.returnsAndExchangesContent || "",
          orderTrackingTitle: response.data.orderTrackingTitle || "",
          orderTrackingContent: response.data.orderTrackingContent || "",
          changesToPolicyTitle: response.data.changesToPolicyTitle || "",
          changesToPolicyContent: response.data.changesToPolicyContent || "",
          contactUsTitle: response.data.contactUsTitle || "",
          contactUsContent: response.data.contactUsContent || "",
        });
      }
      setError(null);
    } catch (err) {
      setError("Failed to fetch Delivery Policy. Please try again.");
      console.error("Error fetching Delivery Policy:", err);
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
    const requiredFields = Object.keys(formData);
    for (const field of requiredFields) {
      if (!formData[field]?.trim()) {
        setError(`Please fill in all required fields (${field} is missing)`);
        return;
      }
    }

    try {
      setLoading(true);
      // Update Delivery Policy
      const deliveryResponse = await createDeliveryPolicy(formData);
      setSavedData(deliveryResponse.data);

      // Sync Contact Us section with Privacy Policy (optional, assuming backend supports partial updates)
      const privacyUpdateData = {
        contactUsTitle: formData.contactUsTitle,
        contactUsContent: formData.contactUsContent,
      };
      await createPrivacyPolicy(privacyUpdateData); // Partial update for PrivacyPolicy

      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to update Delivery Policy. Please try again.";
      setError(errorMessage);
      console.error("Error updating Delivery Policy:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (savedData) {
      setFormData({
        introductionTitle: savedData.introductionTitle || "",
        introductionContent: savedData.introductionContent || "",
        orderProcessingTimesTitle: savedData.orderProcessingTimesTitle || "",
        orderProcessingTimesContent: savedData.orderProcessingTimesContent || "",
        shippingMethodsTitle: savedData.shippingMethodsTitle || "",
        shippingMethodsContent: savedData.shippingMethodsContent || "",
        shippingCostsTitle: savedData.shippingCostsTitle || "",
        shippingCostsContent: savedData.shippingCostsContent || "",
        internationalShippingTitle: savedData.internationalShippingTitle || "",
        internationalShippingContent: savedData.internationalShippingContent || "",
        deliveryIssuesTitle: savedData.deliveryIssuesTitle || "",
        deliveryIssuesContent: savedData.deliveryIssuesContent || "",
        returnsAndExchangesTitle: savedData.returnsAndExchangesTitle || "",
        returnsAndExchangesContent: savedData.returnsAndExchangesContent || "",
        orderTrackingTitle: savedData.orderTrackingTitle || "",
        orderTrackingContent: savedData.orderTrackingContent || "",
        changesToPolicyTitle: savedData.changesToPolicyTitle || "",
        changesToPolicyContent: savedData.changesToPolicyContent || "",
        contactUsTitle: savedData.contactUsTitle || "",
        contactUsContent: savedData.contactUsContent || "",
      });
    }
    setError(null);
  };

  // Render form section for a given category, matching PrivacyPolicy styling
  const renderFormSection = (section, label) => (
    <div className="mb-6" key={section}>
      <div className="text-xl font-medium mb-4">{label}</div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} Title
      </label>
      <input
        type="text"
        name={`${section}Title`}
        value={formData[`${section}Title`]}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      />
      <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">
        {label} Content
      </label>
      <textarea
        name={`${section}Content`}
        value={formData[`${section}Content`]}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        rows="5"
      />
    </div>
  );

  // Section labels for display
  const sections = {
    introduction: "Introduction",
    orderProcessingTimes: "Order Processing Times",
    shippingMethods: "Shipping Methods",
    shippingCosts: "Shipping Costs",
    internationalShipping: "International Shipping",
    deliveryIssues: "Delivery Issues",
    returnsAndExchanges: "Returns and Exchanges",
    orderTracking: "Order Tracking",
    changesToPolicy: "Changes to Policy",
    contactUs: "Contact Us",
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <div className="text-2xl font-semibold mb-4">Delivery Policy</div>

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {loading && (
        <div className="mb-4 p-2 bg-blue-100 text-blue-700 rounded">Loading...</div>
      )}

      {/* Form Sections */}
      {Object.entries(sections).map(([section, label]) => renderFormSection(section, label))}

      <div className="mt-4 flex gap-4">
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-500 cursor-pointer text-white rounded hover:bg-gray-700"
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
          {Object.keys(sections).map((section) => (
            savedData[`${section}Title`] && (
              <div key={section} className="mb-6">
                <h2 className="text-2xl font-bold mb-2">{savedData[`${section}Title`]}</h2>
                <p className="whitespace-pre-line">{savedData[`${section}Content`]}</p>
              </div>
            )
          ))}
          <p className="text-sm text-gray-500 mt-4">
            Last Updated: {new Date(savedData.updatedAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default DeliveryPolicy;