// import React, { useState } from "react";

// const PhonePe = () => {
//   const [merchantId, setMerchantId] = useState(""); // PhonePe Merchant ID
//   const [merchantKey, setMerchantKey] = useState(""); // PhonePe Merchant Key
//   const [callbackUrl, setCallbackUrl] = useState(""); // Callback URL for PhonePe
//   const [currencyCode, setCurrencyCode] = useState(""); // Currency for transactions

//   const handleSubmit = () => {
//     const data = {
//       merchantId,
//       merchantKey,
//       callbackUrl,
//       currencyCode,
//     };
//     console.log("PhonePe Configuration Submitted:", data);
//   };

//   const handleReset = () => {
//     setMerchantId("");
//     setMerchantKey("");
//     setCallbackUrl("");
//     setCurrencyCode("");
//   };

//   return (
//     <div className="p-4 bg-white shadow rounded-md">
//       <form className="space-y-6">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label className="block text-sm font-semibold text-gray-700">
//               PhonePe Merchant ID
//             </label>
//             <input
//               type="text"
//               value={merchantId}
//               onChange={(e) => setMerchantId(e.target.value)}
//               placeholder="Enter PhonePe Merchant ID"
//               className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-semibold text-gray-700">
//               PhonePe Merchant Key
//             </label>
//             <input
//               type="text"
//               value={merchantKey}
//               onChange={(e) => setMerchantKey(e.target.value)}
//               placeholder="Enter PhonePe Merchant Key"
//               className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
//             />
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label className="block text-sm font-semibold text-gray-700">
//               Callback URL
//             </label>
//             <input
//               type="text"
//               value={callbackUrl}
//               onChange={(e) => setCallbackUrl(e.target.value)}
//               placeholder="https://yourdomain.com/phonepe/callback"
//               className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-semibold text-gray-700">
//               Currency (INR)
//             </label>
//             <input
//               type="text"
//               value={currencyCode}
//               onChange={(e) => setCurrencyCode(e.target.value)}
//               placeholder="INR"
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

// export default PhonePe;

import React, { useState, useEffect } from "react";
import { usePayment } from "../../../../../context/PaymentContext";
import { createPaymentMethods } from "../../../../../services/settingServices/PaymentMethod";

const PhonePe = () => {
  const { paymentData, updatePaymentData } = usePayment();
  const [formData, setFormData] = useState({
    phonePeMerchantID: "",
    phonePeMerchantKey: "",
    callbackURL: "",
    currency: ""
  });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
  // Initialize form with data from context
  useEffect(() => {
    if (paymentData?.phonePe) {
      setFormData({
        phonePeMerchantID: paymentData.phonePe.phonePeMerchantID || "",
        phonePeMerchantKey: paymentData.phonePe.phonePeMerchantKey || "",
        callbackURL: paymentData.phonePe.callbackURL || "",
        currency: paymentData.phonePe.currency || "INR" // Default to INR as PhonePe primarily works with INR
      });
    }
  }, [paymentData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // const handleSubmit = () => {
  //   updatePaymentData({
  //     phonePe: formData
  //   });
  //   // Here you would typically also call an API to save the data
  //   console.log("PhonePe Configuration Submitted:", formData);
  // };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      setError(null);
      setSuccess(false);
  
      try {
        const requestData = {
          phonePe: formData
        };
  
      await createPaymentMethods(requestData);
        
        updatePaymentData({
          phonePe: formData
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
    if (paymentData?.phonePe) {
      setFormData({
        phonePeMerchantID: paymentData.phonePe.phonePeMerchantID || "",
        phonePeMerchantKey: paymentData.phonePe.phonePeMerchantKey || "",
        callbackURL: paymentData.phonePe.callbackURL || "",
        currency: paymentData.phonePe.currency || "INR"
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
              PhonePe Merchant ID
            </label>
            <input
              type="text"
              name="phonePeMerchantID"
              value={formData.phonePeMerchantID}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              PhonePe Merchant Key
            </label>
            <input
              type="password"
              name="phonePeMerchantKey"
              value={formData.phonePeMerchantKey}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Callback URL
            </label>
            <input
              type="url"
              name="callbackURL"
              value={formData.callbackURL}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Currency
            </label>
            <input
            type="text"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
              // className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
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
            className="bg-table hover:bg-secondary cursor-pointer text-white px-6 py-2 rounded-sm transition"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default PhonePe;