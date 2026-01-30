// components/ShippingMethods.js
import React, { useState, useEffect } from "react";
import { createShipping, getAllShipping } from "../../../Interceptor/interceptor";

const ShippingMethods = () => {
  // State for form fields, initialized with default values
  const [localDelivery, setLocalDelivery] = useState(false);
  const [standard, setStandard] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookToken, setWebhookToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch shipping data on component mount
  useEffect(() => {
    const fetchShippingData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getAllShipping();
        if (response.success && response.data) {
          const { data } = response;
          setLocalDelivery(data.localDelivery || false);
          setStandard(data.standard || false);
          setEmail(data.email || "");
          setPassword(data.password || "");
          setWebhookUrl(data.webhookUrl || "");
          setWebhookToken(data.webhookToken || "");
        } else {
          setError("No shipping settings found.");
        }
      } catch (err) {
        console.log(err,"Failed to load shipping settings. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchShippingData();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      localDelivery,
      standard,
      email,
      password,
      webhookUrl,
      webhookToken,
    };

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const response = await createShipping(data);
      if (response.success) {
        setSuccess("Shipping settings updated successfully!");
      } else {
        setError("Failed to update shipping settings. Please try again.");
      }
    } catch (err) {
      console.log(err,"Failed to update shipping settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle form reset
  const handleReset = () => {
    setLocalDelivery(false);
    setStandard(false);
    setEmail("");
    setPassword("");
    setWebhookUrl("");
    setWebhookToken("");
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="max-w-[98%] mx-auto p-6 bg-white shadow rounded-md space-y-10">
      <h1 className="text-3xl font-title text-gray-800 mb-4">Shipping Method</h1>

      {/* Loading, Error, and Success Messages */}
      {loading && <p className="text-gray-600">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}

      {/* Local Delivery Toggle */}
      <div className="mt-5">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Enable Local Shipping (Use Local Delivery Boy For Shipping)
        </label>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 font-medium">No</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={localDelivery}
              onChange={() => setLocalDelivery(!localDelivery)}
              className="sr-only peer"
              disabled={loading}
            />
            <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:bg-[#fa4d6a] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:bg-white"></div>
          </label>
          <span className="text-gray-600 font-medium">Yes</span>
        </div>
      </div>

      {/* Standard Delivery Toggle */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Standard Delivery Method (Shiprocket)
        </label>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 font-medium">No</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={standard}
              onChange={() => setStandard(!standard)}
              className="sr-only peer"
              disabled={loading}
            />
            <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:bg-[#fa4d6a] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:bg-white"></div>
          </label>
          <span className="text-gray-600 font-medium">Yes</span>
        </div>
      </div>

      {/* Form for Email, Password, Webhook URL, and Token */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
              disabled={loading}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Password
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
              disabled={loading}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Shiprocket Webhook URL
            </label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Shiprocket Webhook Token
            </label>
            <input
              type="text"
              value={webhookToken}
              onChange={(e) => setWebhookToken(e.target.value)}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
              disabled={loading}
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={handleReset}
            className="bg-gray-500 hover:bg-gray-600 cursor-pointer text-white px-6 py-2 rounded-sm transition"
            disabled={loading}
          >
            Reset
          </button>
          <button
            type="submit"
            className="bg-table hover:bg-secondary  cursor-pointer text-white px-6 py-2 rounded-sm transition"
            disabled={loading}
          >
            Save 
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShippingMethods;