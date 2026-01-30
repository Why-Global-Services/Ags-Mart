// import React, { useState } from "react";

// const Paytm = () => {
//   const [merchantId, setMerchantId] = useState(""); // Paytm Merchant ID
//   const [merchantKey, setMerchantKey] = useState(""); // Paytm Merchant Key
//   const [website, setWebsite] = useState(""); // Paytm Website Name
//   const [callbackUrl, setCallbackUrl] = useState(""); // Callback URL for Paytm
//   const [currencyCode, setCurrencyCode] = useState(""); // Currency for transactions

//   const handleSubmit = () => {
//     const data = {
//       merchantId,
//       merchantKey,
//       website,
//       callbackUrl,
//       currencyCode,
//     };
//     console.log("Paytm Configuration Submitted:", data);
//   };

//   const handleReset = () => {
//     setMerchantId("");
//     setMerchantKey("");
//     setWebsite("");
//     setCallbackUrl("");
//     setCurrencyCode("");
//   };

//   return (
//     <div className="p-4 bg-white shadow rounded-md">
//       <form className="space-y-6">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label className="block text-sm font-semibold text-gray-700">
//               Paytm Merchant ID
//             </label>
//             <input
//               type="text"
//               value={merchantId}
//               onChange={(e) => setMerchantId(e.target.value)}
//               placeholder="Enter Paytm Merchant ID"
//               className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-semibold text-gray-700">
//               Paytm Merchant Key
//             </label>
//             <input
//               type="text"
//               value={merchantKey}
//               onChange={(e) => setMerchantKey(e.target.value)}
//               placeholder="Enter Paytm Merchant Key"
//               className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
//             />
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label className="block text-sm font-semibold text-gray-700">
//               Paytm Website Name
//             </label>
//             <input
//               type="text"
//               value={website}
//               onChange={(e) => setWebsite(e.target.value)}
//               placeholder="Enter Paytm Website Name"
//               className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-semibold text-gray-700">
//               Callback URL
//             </label>
//             <input
//               type="text"
//               value={callbackUrl}
//               onChange={(e) => setCallbackUrl(e.target.value)}
//               placeholder="https://yourdomain.com/paytm/callback"
//               className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
//             />
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

// export default Paytm;




import React, { useState, useEffect } from "react";
import { usePayment } from "../../../../../context/PaymentContext";
import { createPaymentMethods } from "../../../../../services/settingServices/PaymentMethod";


const Paytm = () => {
  const { paymentData, updatePaymentData } = usePayment();
  const [formData, setFormData] = useState({
    paytmMerchantID: "",
    paytmMerchantKey: "",
    paytmWebsiteName: "WEBSTAGING",
    callbackURL: "",
    currency: "INR"
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Initialize form with data from context
  useEffect(() => {
    if (paymentData?.payTM) {
      setFormData({
        paytmMerchantID: paymentData.payTM.paytmMerchantID || "",
        paytmMerchantKey: paymentData.payTM.paytmMerchantKey || "",
        paytmWebsiteName: paymentData.payTM.paytmWebsiteName || "WEBSTAGING",
        callbackURL: paymentData.payTM.callbackURL || "",
        currency: paymentData.payTM.currency || "INR"
      });
    }
  }, [paymentData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // const handleSubmit = () => {
  //   updatePaymentData({
  //     payTM: formData
  //   });
  //   // Here you would typically also call an API to save the data
  //   console.log("PayTM Configuration Submitted:", formData);
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const requestData = {
        payTM: formData
      };

    await createPaymentMethods(requestData);
      
      updatePaymentData({
        payTM: formData
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
    if (paymentData?.payTM) {
      setFormData({
        paytmMerchantID: paymentData.payTM.paytmMerchantID || "",
        paytmMerchantKey: paymentData.payTM.paytmMerchantKey || "",
        paytmWebsiteName: paymentData.payTM.paytmWebsiteName || "WEBSTAGING",
        callbackURL: paymentData.payTM.callbackURL || "",
        currency: paymentData.payTM.currency || "INR"
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
              PayTM Merchant ID
            </label>
            <input
              type="text"
              name="paytmMerchantID"
              value={formData.paytmMerchantID}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              PayTM Merchant Key
            </label>
            <input
              type="password"
              name="paytmMerchantKey"
              value={formData.paytmMerchantKey}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              PayTM Website Name
            </label>
            <input
              type="text"
              name="paytmWebsiteName"
              value={formData.paytmWebsiteName}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
           />
            
           
          </div>
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              // disabled
            />
            
            <p className="text-xs text-gray-500 mt-1">PayTM currently only supports INR</p>
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

export default Paytm;