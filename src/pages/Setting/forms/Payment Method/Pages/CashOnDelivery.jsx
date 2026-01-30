// import React, { useState } from "react";

// const CashOnDelivery = () => {
//   const [isEnabled, setIsEnabled] = useState(false); // To enable or disable COD
//   const [deliveryTime, setDeliveryTime] = useState(""); // Delivery time for COD orders
//   const [additionalInfo, setAdditionalInfo] = useState(""); // Any additional information regarding COD

//   const handleSubmit = () => {
//     const data = {
//       isEnabled,
//       deliveryTime,
//       additionalInfo,
//     };
//     console.log("Cash on Delivery Configuration Submitted:", data);
//   };

//   const handleReset = () => {
//     setIsEnabled(false);
//     setDeliveryTime("");
//     setAdditionalInfo("");
//   };

//   return (
//     <div className="p-4 bg-white shadow rounded-md">
//       <form className="space-y-6">
//         <div className="grid grid-cols-1 gap-6">
//           <div>
//             <label className="block text-sm font-semibold text-gray-700">
//               Enable Cash on Delivery
//             </label>
//             <input
//               type="checkbox"
//               checked={isEnabled}
//               onChange={() => setIsEnabled(!isEnabled)}
//               className="w-4 h-4 mt-1"
//             />
//             <span className="ml-2 text-sm text-gray-600">
//               Enable or disable Cash on Delivery option
//             </span>
//           </div>

//           {isEnabled && (
//             <>
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700">
//                   Delivery Time (in days)
//                 </label>
//                 <input
//                   type="number"
//                   value={deliveryTime}
//                   onChange={(e) => setDeliveryTime(e.target.value)}
//                   placeholder="Enter delivery time (in days)"
//                   className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700">
//                   Additional Information (Optional)
//                 </label>
//                 <textarea
//                   value={additionalInfo}
//                   onChange={(e) => setAdditionalInfo(e.target.value)}
//                   placeholder="Any additional info for customers"
//                   className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
//                 />
//               </div>
//             </>
//           )}
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

// export default CashOnDelivery;


import React, { useState, useEffect } from "react";
import { usePayment } from "../../../../../context/PaymentContext";
import { createPaymentMethods } from "../../../../../services/settingServices/PaymentMethod";

const CashOnDelivery = () => {
  const { paymentData, updatePaymentData } = usePayment();
  const [isEnabled, setIsEnabled] = useState(false);
  // const [deliveryTime, setDeliveryTime] = useState("3-5 days");
  // const [additionalInfo, setAdditionalInfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Initialize form with data from context
  useEffect(() => {
    if (paymentData?.cashOnDelivery) {
      // if (typeof paymentData.cashOnDelivery === 'object') {
      //   setIsEnabled(true);
      //   // setDeliveryTime(paymentData.cashOnDelivery.deliveryTime || "3-5 days");
      //   // setAdditionalInfo(paymentData.cashOnDelivery.additionalInfo || "");
      // } else {
        setIsEnabled(paymentData.cashOnDelivery);
      // }
    }
  }, [paymentData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // const config = isEnabled ? { 
      //   deliveryTime,
      //   additionalInfo 
      // } : false;


      const requestData = {
        cashOnDelivery: isEnabled
      };

    await createPaymentMethods(requestData)  
      
      updatePaymentData({
        cashOnDelivery: requestData
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "Failed to save configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (paymentData?.cashOnDelivery && typeof paymentData.cashOnDelivery === 'object') {
      setIsEnabled(true);
      setDeliveryTime(paymentData.cashOnDelivery.deliveryTime || "3-5 days");
      setAdditionalInfo(paymentData.cashOnDelivery.additionalInfo || "");
    } else {
      setIsEnabled(false);
      setDeliveryTime("3-5 days");
      setAdditionalInfo("");
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
       
        <div className="flex items-center">
          <input
            type="checkbox"
            id="enableCod"
            checked={isEnabled}
            onChange={() => setIsEnabled(!isEnabled)}
            className="w-4 h-4 text-[#fa4d6a] focus:ring-[#fa4d6a] border-gray-300 rounded"
          />
          <label htmlFor="enableCod" className="ml-2 text-sm font-semibold text-gray-700">
            Enable Cash on Delivery
          </label>
        </div>
{/* 
        {isEnabled && (
          <>
            <div>
              <label htmlFor="deliveryTime" className="block text-sm font-semibold text-gray-700 mb-1">
                Delivery Time
              </label>
              <input
                type="text"
                id="deliveryTime"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                placeholder="e.g. 3-5 days"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a] focus:border-transparent"
                required
              />
            </div>
            <div>
              <label htmlFor="additionalInfo" className="block text-sm font-semibold text-gray-700 mb-1">
                Additional Information
              </label>
              <textarea
                id="additionalInfo"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="Any special instructions"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a] focus:border-transparent"
                rows={3}
              />
            </div>
          </>
        )} */}

        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            className="bg-gray-500 hover:bg-gray-600 cursor-pointer text-white px-6 py-2 rounded-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-table hover:bg-secondary  cursor-pointer text-white px-6 py-2 rounded-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CashOnDelivery;