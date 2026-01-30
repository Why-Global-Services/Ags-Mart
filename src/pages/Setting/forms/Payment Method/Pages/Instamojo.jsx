// import React, { useState } from "react";

// const Instamojo = () => {
//   const [apiKey, setApiKey] = useState(""); // Instamojo API Key
//   const [authToken, setAuthToken] = useState(""); // Instamojo Auth Token
//   const [url, setUrl] = useState(""); // Instamojo URL for payment request
//   const [currencyCode, setCurrencyCode] = useState(""); // Currency code for transactions

//   const handleSubmit = () => {
//     const data = {
//       apiKey,
//       authToken,
//       url,
//       currencyCode,
//     };
//     console.log("Instamojo Configuration Submitted:", data);
//   };

//   const handleReset = () => {
//     setApiKey("");
//     setAuthToken("");
//     setUrl("");
//     setCurrencyCode("");
//   };

//   return (
//     <div className="p-4 bg-white shadow rounded-md">
//       <form className="space-y-6">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label className="block text-sm font-semibold text-gray-700">
//               Instamojo API Key
//             </label>
//             <input
//               type="text"
//               value={apiKey}
//               onChange={(e) => setApiKey(e.target.value)}
//               placeholder="Enter Instamojo API Key"
//               className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-semibold text-gray-700">
//               Instamojo Auth Token
//             </label>
//             <input
//               type="text"
//               value={authToken}
//               onChange={(e) => setAuthToken(e.target.value)}
//               placeholder="Enter Instamojo Auth Token"
//               className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
//             />
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label className="block text-sm font-semibold text-gray-700">
//               Payment URL (Instamojo Payment Request URL)
//             </label>
//             <input
//               type="text"
//               value={url}
//               onChange={(e) => setUrl(e.target.value)}
//               placeholder="https://api.instamojo.com/v2/payment-requests/"
//               className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-semibold text-gray-700">
//               Currency Code (INR)
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

// export default Instamojo;



import React, { useState, useEffect } from "react";
import { usePayment } from "../../../../../context/PaymentContext";
import { createPaymentMethods } from "../../../../../services/settingServices/PaymentMethod";


const Instamojo = () => {
  const { paymentData, updatePaymentData } = usePayment();
  const [formData, setFormData] = useState({
    InstamojoAPIKey: "",
    InstamojoAuthToken: "",
    paymentURL: "https://test.instamojo.com/api/1.1/payment-requests/",
    currencyCode: "INR"
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Initialize form with data from context
  useEffect(() => {
    if (paymentData?.instamojo) {
      setFormData({
        InstamojoAPIKey: paymentData.instamojo.InstamojoAPIKey || "",
        InstamojoAuthToken: paymentData.instamojo.InstamojoAuthToken || "",
        paymentURL: paymentData.instamojo.paymentURL || "https://test.instamojo.com/api/1.1/payment-requests/",
        currencyCode: paymentData.instamojo.currencyCode || "INR"
      });
    }
  }, [paymentData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   updatePaymentData({
  //     instamojo: formData
  //   });
  //   console.log("Instamojo Configuration Submitted:", formData);
  //   // Add API call to save data here
  // };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const requestData = {
        instamojo: formData
      };

    await createPaymentMethods(requestData);
      
      updatePaymentData({
        instamojo: formData
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
    if (paymentData?.instamojo) {
      setFormData({
        InstamojoAPIKey: paymentData.instamojo.InstamojoAPIKey || "",
        InstamojoAuthToken: paymentData.instamojo.InstamojoAuthToken || "",
        paymentURL: paymentData.instamojo.paymentURL || "https://test.instamojo.com/api/1.1/payment-requests/",
        currencyCode: paymentData.instamojo.currencyCode || "INR"
      });
    }
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
              Instamojo API Key
            </label>
            <input
              type="text"
              name="InstamojoAPIKey"
              value={formData.InstamojoAPIKey}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Instamojo Auth Token
            </label>
            <input
              type="password"
              name="InstamojoAuthToken"
              value={formData.InstamojoAuthToken}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Payment Request URL
            </label>
            <input
            type="url"
              name="paymentURL"
              value={formData.paymentURL}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
              // required
            />
           
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Currency Code
            </label>
            <input
            type="text"
              name="currencyCode"
              value={formData.currencyCode}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
              // required
            />
             
            <p className="text-xs text-gray-500 mt-1">
              Instamojo currently only supports INR
            </p>
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
            type="submit"
            className="bg-table hover:bg-secondary  cursor-pointer text-white px-6 py-2 rounded-sm transition"
          >
            Save 
          </button>
        </div>
      </form>
    </div>
  );
};

export default Instamojo;