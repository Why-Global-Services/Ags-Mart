// import React, { useState } from "react";

// const Razorpay = () => {
//   const [keyId, setKeyId] = useState(""); // Razorpay key ID
//   const [secretKey, setSecretKey] = useState(""); // Razorpay Secret Key
//   const [webhookSecret, setWebhookSecret] = useState(""); // Webhook Secret Key
//   const [paymentEndpoint, setPaymentEndpoint] = useState(""); // Payment Endpoint URL

//   const handleSubmit = () => {
//     const data = {
//       keyId,
//       secretKey,
//       webhookSecret,
//       paymentEndpoint,
//     };
//     console.log("Razorpay Configuration Submitted:", data);
//   };

//   const handleReset = () => {
//     setKeyId("");
//     setSecretKey("");
//     setWebhookSecret("");
//     setPaymentEndpoint("");
//   };

//   return (
//     <div className="p-4 bg-white shadow rounded-md">
//       <form className="space-y-6">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label className="block text-sm font-semibold text-gray-700">
//               Razorpay Key ID
//             </label>
//             <input
//               type="text"
//               value={keyId}
//               onChange={(e) => setKeyId(e.target.value)}
//               placeholder="Enter Razorpay Key ID"
//               className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-semibold text-gray-700">
//               Razorpay Secret Key
//             </label>
//             <input
//               type="password"
//               value={secretKey}
//               onChange={(e) => setSecretKey(e.target.value)}
//               placeholder="Enter Razorpay Secret Key"
//               className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
//             />
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label className="block text-sm font-semibold text-gray-700">
//               Webhook Secret Key
//             </label>
//             <input
//               type="text"
//               value={webhookSecret}
//               onChange={(e) => setWebhookSecret(e.target.value)}
//               placeholder="Enter Webhook Secret Key"
//               className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-semibold text-gray-700">
//               Payment Endpoint URL
//             </label>
//             <input
//               type="text"
//               value={paymentEndpoint}
//               onChange={(e) => setPaymentEndpoint(e.target.value)}
//               placeholder="Set this as Endpoint URL in Razorpay account"
//               className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
//             />
//           </div>
//         </div>

//         {/* Buttons */}
//         <div className="flex justify-end gap-4 pt-4">
//           <button
//             type="button"
//             onClick={handleReset}
//             className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-sm transition"
//           >
//             Reset
//           </button>
//           <button
//             type="button"
//             onClick={handleSubmit}
//             className="bg-[#fa4d6a] hover:bg-[#e03c56] text-white px-6 py-2 rounded-sm transition"
//           >
//             Save Configuration
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default Razorpay;





import React, { useState, useEffect } from "react";
import { usePayment } from "../../../../../context/PaymentContext";
import { createPaymentMethods } from "../../../../../services/settingServices/PaymentMethod";

const Razorpay = () => {
  const { paymentData, updatePaymentData } = usePayment();
  const [formData, setFormData] = useState({
    keyId: "",
    razorPaySecretKey: "",
    webhookSecretkey: "",
    paymentEndpointURL: "https://api.razorpay.com/v1/payments"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (paymentData?.razorPay) {
      setFormData({
        keyId: paymentData.razorPay.keyId || "",
        razorPaySecretKey: paymentData.razorPay.razorPaySecretKey || "",
        webhookSecretkey: paymentData.razorPay.webhookSecretkey || "",
        paymentEndpointURL: paymentData.razorPay.paymentEndpointURL || "https://api.razorpay.com/v1/payments"
      });
    }
  }, [paymentData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const requestData = {
        razorPay: formData
      };

    await createPaymentMethods(requestData);
      
      updatePaymentData({
        razorPay: formData
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000); // Hide success message after 3 seconds
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (paymentData?.razorPay) {
      // setFormData({
      //   keyId: paymentData.razorPay.keyId || "",
      //   razorPaySecretKey: paymentData.razorPay.razorPaySecretKey || "",
      //   webhookSecretkey: paymentData.razorPay.webhookSecretkey || "",
      //   paymentEndpointURL: paymentData.razorPay.paymentEndpointURL || "https://api.razorpay.com/v1/payments"
      // });
      setFormData({
        keyId:  "",
        razorPaySecretKey:  "",
        webhookSecretkey:  "",
        paymentEndpointURL:  ""
      });
    }
    setError(null);
    setSuccess(false);
  };

  return (
    <div className="p-4 bg-white shadow rounded-md">
      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-green-100 text-green-700 rounded-md">
            Configuration saved successfully!
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Razorpay Key ID
            </label>
            <input
              type="text"
              name="keyId"
              value={formData.keyId}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Razorpay Secret Key
            </label>
            <input
              type="password"
              name="razorPaySecretKey"
              value={formData.razorPaySecretKey}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Webhook Secret Key
            </label>
            <input
              type="password"
              name="webhookSecretkey"
              value={formData.webhookSecretkey}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Payment Endpoint URL
            </label>
            <input
              type="url"
              name="paymentEndpointURL"
              value={formData.paymentEndpointURL}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Default Razorpay API endpoint
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            className="bg-gray-500 hover:bg-gray-600 cursor-pointer text-white px-6 py-2 rounded-sm transition disabled:opacity-50"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-table hover:bg-secondary cursor-pointer text-white px-6 py-2 rounded-sm transition disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Razorpay;