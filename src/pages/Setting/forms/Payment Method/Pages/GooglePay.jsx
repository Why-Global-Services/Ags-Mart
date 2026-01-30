// import React, { useState } from "react";

// const GooglePay = () => {
//   const [merchantId, setMerchantId] = useState(""); // Google Pay Merchant ID
//   const [merchantName, setMerchantName] = useState(""); // Google Pay Merchant Name
//   const [merchantInfo, setMerchantInfo] = useState(""); // Merchant Info
//   const [gateway, setGateway] = useState(""); // Gateway information
//   const [gatewayMerchantId, setGatewayMerchantId] = useState(""); // Gateway Merchant ID

//   const handleSubmit = () => {
//     const data = {
//       merchantId,
//       merchantName,
//       merchantInfo,
//       gateway,
//       gatewayMerchantId,
//     };
//     console.log("Google Pay Configuration Submitted:", data);
//   };

//   const handleReset = () => {
//     setMerchantId("");
//     setMerchantName("");
//     setMerchantInfo("");
//     setGateway("");
//     setGatewayMerchantId("");
//   };

//   return (
//     <div className="p-4 bg-white shadow rounded-md">
//       <form className="space-y-6">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label className="block text-sm font-semibold text-gray-700">
//               Google Pay Merchant ID
//             </label>
//             <input
//               type="text"
//               value={merchantId}
//               onChange={(e) => setMerchantId(e.target.value)}
//               placeholder="Enter Google Pay Merchant ID"
//               className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-semibold text-gray-700">
//               Google Pay Merchant Name
//             </label>
//             <input
//               type="text"
//               value={merchantName}
//               onChange={(e) => setMerchantName(e.target.value)}
//               placeholder="Enter Merchant Name"
//               className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
//             />
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label className="block text-sm font-semibold text-gray-700">
//               Merchant Information (optional)
//             </label>
//             <input
//               type="text"
//               value={merchantInfo}
//               onChange={(e) => setMerchantInfo(e.target.value)}
//               placeholder="Enter Merchant Info"
//               className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-semibold text-gray-700">
//               Payment Gateway Name
//             </label>
//             <input
//               type="text"
//               value={gateway}
//               onChange={(e) => setGateway(e.target.value)}
//               placeholder="e.g., 'exampleGateway'"
//               className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
//             />
//           </div>
//         </div>

//         <div>
//           <label className="block text-sm font-semibold text-gray-700">
//             Gateway Merchant ID
//           </label>
//           <input
//             type="text"
//             value={gatewayMerchantId}
//             onChange={(e) => setGatewayMerchantId(e.target.value)}
//             placeholder="Enter Gateway Merchant ID"
//             className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
//           />
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

// export default GooglePay;


import React, { useState, useEffect } from "react";
import { usePayment } from "../../../../../context/PaymentContext";
import { createPaymentMethods } from "../../../../../services/settingServices/PaymentMethod";


const GooglePay = () => {
  const { paymentData, updatePaymentData } = usePayment();
  const [formData, setFormData] = useState({
    googlePayMerchantID: "",
    googlePayMerchantName: "",
    merchantInformation: "",
    paymentGatewayName: "",
    gatewayMerchantID: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Initialize form with data from context
  useEffect(() => {
    if (paymentData?.googlePay) {
      setFormData({
        googlePayMerchantID: paymentData.googlePay.googlePayMerchantID || "",
        googlePayMerchantName: paymentData.googlePay.googlePayMerchantName || "",
        merchantInformation: paymentData.googlePay.merchantInformation || "",
        paymentGatewayName: paymentData.googlePay.paymentGatewayName || "",
        gatewayMerchantID: paymentData.googlePay.gatewayMerchantID || ""
      });
    }
  }, [paymentData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // const handleSubmit = () => {
  //   updatePaymentData({
  //     googlePay: formData
  //   });
  //   // Here you would typically also call an API to save the data
  //   console.log("Google Pay Configuration Submitted:", formData);
  // };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const requestData = {
        googlePay: formData
      };

    await createPaymentMethods(requestData);
      
      updatePaymentData({
        googlePay: formData
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
    if (paymentData?.googlePay) {
      setFormData({
        googlePayMerchantID: paymentData.googlePay.googlePayMerchantID || "",
        googlePayMerchantName: paymentData.googlePay.googlePayMerchantName || "",
        merchantInformation: paymentData.googlePay.merchantInformation || "",
        paymentGatewayName: paymentData.googlePay.paymentGatewayName || "",
        gatewayMerchantID: paymentData.googlePay.gatewayMerchantID || ""
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
              Google Pay Merchant ID
            </label>
            <input
              type="text"
              name="googlePayMerchantID"
              value={formData.googlePayMerchantID}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Google Pay Merchant Name
            </label>
            <input
              type="text"
              name="googlePayMerchantName"
              value={formData.googlePayMerchantName}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Merchant Information (optional)
            </label>
            <input
              type="text"
              name="merchantInformation"
              value={formData.merchantInformation}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Payment Gateway Name
            </label>
            <input
              type="text"
              name="paymentGatewayName"
              value={formData.paymentGatewayName}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">
            Gateway Merchant ID
          </label>
          <input
            type="text"
            name="gatewayMerchantID"
            value={formData.gatewayMerchantID}
            onChange={handleChange}
            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
          />
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

export default GooglePay;