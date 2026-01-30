// import React, { useState } from "react";

// const PayPal = () => {
//   const [paymentMode, setPaymentMode] = useState(""); // sandbox or live
//   const [businessEmail, setBusinessEmail] = useState("");
//   const [webhookUrl, setWebhookUrl] = useState("");
//   const [currencyCode, setCurrencyCode] = useState("");

//   const handleSubmit = () => {
//     const data = {
//       paymentMode,
//       businessEmail,
//       webhookUrl,
//       currencyCode,
//     };
//     console.log("PayPal Configuration Submitted:", data);
//   };

//   const handleReset = () => {
//     setPaymentMode("");
//     setBusinessEmail("");
//     setWebhookUrl("");
//     setCurrencyCode("");
//   };

//   return (
//     <div className="p-4 bg-white shadow rounded-md">
//       <form className="space-y-6">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label className="block text-sm font-semibold text-gray-700">
//               Payment Mode (sandbox / live)
//             </label>
//             <input
//               type="text"
//               value={paymentMode}
//               onChange={(e) => setPaymentMode(e.target.value)}
//               placeholder="Enter payment mode"
//               className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-semibold text-gray-700">
//               PayPal Business Email
//             </label>
//             <input
//               type="email"
//               value={businessEmail}
//               onChange={(e) => setBusinessEmail(e.target.value)}
//               placeholder="example@paypal.com"
//               className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
//             />
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label className="block text-sm font-semibold text-gray-700">
//               Notification URL (Set this as IPN notification URL in you PayPal
//               account)
//             </label>
//             <input
//               type="text"
//               value={webhookUrl}
//               onChange={(e) => setWebhookUrl(e.target.value)}
//               placeholder="https://yourdomain.com/webhook"
//               className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-semibold text-gray-700">
//               Currency Code
//             </label>
//             <input
//               type="text"
//               value={currencyCode}
//               onChange={(e) => setCurrencyCode(e.target.value)}
//               placeholder="USD, INR, etc."
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

// export default PayPal;



import React, { useState, useEffect } from "react";
import { usePayment } from "../../../../../context/PaymentContext";
import { createPaymentMethods } from "../../../../../services/settingServices/PaymentMethod";


const PayPal = () => {
  const { paymentData, updatePaymentData } = usePayment();
  const [formData, setFormData] = useState({
    paymentMode: "sandbox",
    payPalBusinessEmail: "",
    notificationURL: "",
    currencyCode: "USD"
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Initialize form with data from context
  useEffect(() => {
    if (paymentData?.payPal) {
      setFormData({
        paymentMode: paymentData.payPal.paymentMode || "sandbox",
        payPalBusinessEmail: paymentData.payPal.payPalBusinessEmail || "",
        notificationURL: paymentData.payPal.notificationURL || "",
        currencyCode: paymentData.payPal.currencyCode || "USD"
      });
    }
  }, [paymentData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // const handleSubmit = () => {
  //   updatePaymentData({
  //     payPal: formData
  //   });
  //   // Here you would typically also call an API to save the data
  //   console.log("PayPal Configuration Submitted:", formData);
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const requestData = {
        payPal: formData
      };

    await createPaymentMethods(requestData);
      
      updatePaymentData({
        payPal: formData
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
    if (paymentData?.payPal) {
      setFormData({
        paymentMode: paymentData.payPal.paymentMode || "sandbox",
        payPalBusinessEmail: paymentData.payPal.payPalBusinessEmail || "",
        notificationURL: paymentData.payPal.notificationURL || "",
        currencyCode: paymentData.payPal.currencyCode || "USD"
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
              Payment Mode(sandbox / live)
            </label>
            <input
             type="text"
              name="paymentMode"
              value={formData.paymentMode}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
           />
            
          
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              PayPal Business Email
            </label>
            <input
              type="email"
              name="payPalBusinessEmail"
              value={formData.payPalBusinessEmail}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Notification URL (IPN)
            </label>
            <input
              type="url"
              name="notificationURL"
              value={formData.notificationURL}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
            />
            <p className="text-xs text-gray-500 mt-1">
              Set this as IPN notification URL in your PayPal account
            </p>
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

export default PayPal;