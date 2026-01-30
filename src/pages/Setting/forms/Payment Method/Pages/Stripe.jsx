// import React, { useState } from "react";

// const Stripe = () => {
//   const [publishableKey, setPublishableKey] = useState(""); // Stripe Publishable Key
//   const [secretKey, setSecretKey] = useState(""); // Stripe Secret Key
//   const [webhookSecret, setWebhookSecret] = useState(""); // Stripe Webhook Secret
//   const [currency, setCurrency] = useState(""); // Currency for transactions

//   const handleSubmit = () => {
//     const data = {
//       publishableKey,
//       secretKey,
//       webhookSecret,
//       currency,
//     };
//     console.log("Stripe Configuration Submitted:", data);
//   };

//   const handleReset = () => {
//     setPublishableKey("");
//     setSecretKey("");
//     setWebhookSecret("");
//     setCurrency("");
//   };

//   return (
//     <div className="p-4 bg-white shadow rounded-md">
//       <form className="space-y-6">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label className="block text-sm font-semibold text-gray-700">
//               Stripe Publishable Key
//             </label>
//             <input
//               type="text"
//               value={publishableKey}
//               onChange={(e) => setPublishableKey(e.target.value)}
//               placeholder="Enter Stripe Publishable Key"
//               className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-semibold text-gray-700">
//               Stripe Secret Key
//             </label>
//             <input
//               type="text"
//               value={secretKey}
//               onChange={(e) => setSecretKey(e.target.value)}
//               placeholder="Enter Stripe Secret Key"
//               className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
//             />
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label className="block text-sm font-semibold text-gray-700">
//               Stripe Webhook Secret
//             </label>
//             <input
//               type="text"
//               value={webhookSecret}
//               onChange={(e) => setWebhookSecret(e.target.value)}
//               placeholder="Enter Stripe Webhook Secret"
//               className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-semibold text-gray-700">
//               Currency (USD, INR, etc.)
//             </label>
//             <input
//               type="text"
//               value={currency}
//               onChange={(e) => setCurrency(e.target.value)}
//               placeholder="Enter Currency Code"
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

// export default Stripe;


import React, { useState, useEffect } from "react";
import { usePayment } from "../../../../../context/PaymentContext";
import { createPaymentMethods } from "../../../../../services/settingServices/PaymentMethod";


const Stripe = () => {
  const { paymentData, updatePaymentData } = usePayment();
  const [formData, setFormData] = useState({
    stripePublishableKey: "",
    stripeSecretKey: "",
    stripeWebhookSecret: "",
    currency: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (paymentData?.stripe) {
      setFormData({
        stripePublishableKey: paymentData.stripe.stripePublishableKey || "",
        stripeSecretKey: paymentData.stripe.stripeSecretKey || "",
        stripeWebhookSecret: paymentData.stripe.stripeWebhookSecret || "",
        currency: paymentData.stripe.currency || ""
      });
    }
  }, [paymentData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // const handleSubmit = () => {
  //   updatePaymentData({
  //     stripe: formData
  //   });
  //   console.log("Stripe Configuration Submitted:", formData);
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const requestData = {
        stripe: formData
      };

    await createPaymentMethods(requestData);
      
      updatePaymentData({
        stripe: formData
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
    if (paymentData?.stripe) {
      setFormData({
        stripePublishableKey: paymentData.stripe.stripePublishableKey || "",
        stripeSecretKey: paymentData.stripe.stripeSecretKey || "",
        stripeWebhookSecret: paymentData.stripe.stripeWebhookSecret || "",
        currency: paymentData.stripe.currency || ""
      });
    }
  };

  return (
    <div className="p-4 bg-white shadow rounded-md">
      <form className="space-y-6">
       
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
              Stripe Publishable Key
            </label>
            <input
              type="text"
              name="stripePublishableKey"
              value={formData.stripePublishableKey}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Stripe Secret Key
            </label>
            <input
              type="password"
              name="stripeSecretKey"
              value={formData.stripeSecretKey}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Stripe Webhook Secret
            </label>
            <input
              type="password"
              name="stripeWebhookSecret"
              value={formData.stripeWebhookSecret}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Currency (USD, INR, etc.)
            </label>
            <input
              type="text"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={handleReset}
            className="bg-gray-500 hover:bg-gray-600 cursor-pointer text-white px-6 py-2 rounded-sm transition"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-table hover:bg-secondary  cursor-pointer text-white px-6 py-2 rounded-sm transition"
          >
            Save 
          </button>
        </div>
      </form>
    </div>
  );
};

export default Stripe;