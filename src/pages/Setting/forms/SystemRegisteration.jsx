// import React, { useState } from 'react';

// const SystemRegisteration = () => {
//   const [webCode, setWebCode] = useState('');
//   const [appCode, setAppCode] = useState('');
//   const [isWebValid, setIsWebValid] = useState(false);
//   const [isAppValid, setIsAppValid] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');

//   const validateCode = (code) => {
//     // Simple validation - in a real app, this would be an API call
//     return code.length >= 10 && code.startsWith('ESHOP');
//   };

//   const handleWebCodeChange = (e) => {
//     const code = e.target.value;
//     setWebCode(code);
//     setIsWebValid(validateCode(code));
//   };

//   const handleAppCodeChange = (e) => {
//     const code = e.target.value;
//     setAppCode(code);
//     setIsAppValid(validateCode(code));
//   };

//   const handleReset = () => {
//     setWebCode('');
//     setAppCode('');
//     setIsWebValid(false);
//     setIsAppValid(false);
//     setError('');
//   };

//   const handleRegister = () => {
//     if (!webCode && !appCode) {
//       setError('Please enter at least one purchase code');
//       return;
//     }

//     setIsLoading(true);
//     setError('');

//     // Simulate API call
//     setTimeout(() => {
//       setIsLoading(false);
//       if (webCode && !validateCode(webCode)) {
//         setError('Invalid web purchase code');
//         return;
//       }
//       if (appCode && !validateCode(appCode)) {
//         setError('Invalid app purchase code');
//         return;
//       }
//     }, 1500);
//   };

//   return (
//     <div className="sm:p-4 max-w-7xl mx-auto">
//       <h2 className="text-2xl font-semibold text-gray-700 mb-6">
//         eShop Purchase Code Validator
//       </h2>
//       <div className="max-w-7xl mx-auto bg-white rounded shadow-md p-8">
//         {/* Error Message */}
//         {error && (
//           <div className="mb-4 bg-red-100 text-red-700 px-4 py-3 rounded text-sm">
//             {error}
//           </div>
//         )}

//         {/* Web Code Field */}
//         <div className="mb-8">
//           <label className="block text-sm font-semibold text-gray-600 mb-2">
//             ESHOP PURCHASE CODE FOR WEB<span className="text-red-500">*</span>
//           </label>
//           <input
//             type="text"
//             value={webCode}
//             onChange={handleWebCodeChange}
//             placeholder="Enter your purchase code here"
//             className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//           {isWebValid && (
//             <div className="mt-4 bg-green-100 text-green-700 px-4 py-3 rounded text-sm">
//               Your web system is successfully registered with us! Enjoy selling online!
//             </div>
//           )}
//         </div>

//         {/* App Code Field */}
//         <div className="mb-8">
//           <label className="block text-sm font-semibold text-gray-600 mb-2">
//             ESHOP PURCHASE CODE FOR APP<span className="text-red-500">*</span>
//           </label>
//           <input
//             type="text"
//             value={appCode}
//             onChange={handleAppCodeChange}
//             placeholder="Enter your purchase code here"
//             className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//           {isAppValid && (
//             <div className="mt-4 bg-green-100 text-green-700 px-4 py-3 rounded text-sm">
//               Your app system is successfully registered with us! Enjoy selling online!
//             </div>
//           )}
//         </div>

//         {/* Buttons */}
//         <div className="flex gap-4">
//           <button
//             onClick={handleReset}
//             className="bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold px-6 py-2 shadow transition"
//           >
//             Reset
//           </button>
//           <button
//             onClick={handleRegister}
//             disabled={isLoading}
//             className={`bg-pink-500 text-white rounded-lg hover:bg-pink-600 font-semibold px-6 py-2 shadow transition ${
//               isLoading ? 'opacity-50 cursor-not-allowed' : ''
//             }`}
//           >
//             {isLoading ? 'Validating...' : 'Register Now'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SystemRegisteration;

import React, { useState, useEffect } from "react";
import {
  getSystemRegistration,
  registerSystem,
} from "../../../services/settingServices/SystemRegisteration";
import { toast } from "react-toastify";

const SystemRegisteration = () => {
  const [formData, setFormData] = useState({
    purchaseCodePhone: "",
    purchaseCodeWeb: "",
  });
  const [isWebValid, setIsWebValid] = useState(false);
  const [isAppValid, setIsAppValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchRegistrationData = async () => {
      try {
        const response = await getSystemRegistration();
        console.log(response, "responce data");
        if (response) {
          const { purchaseCodeWeb, purchaseCodePhone } = response;
          setFormData({
            purchaseCodeWeb: purchaseCodeWeb || "",
            purchaseCodePhone: purchaseCodePhone || "",
          });
          setIsWebValid(validateCode(purchaseCodeWeb));
          setIsAppValid(validateCode(purchaseCodePhone));
        }
      } catch (error) {
        console.error("Failed to fetch registration data:", error);
        toast.error(error.message || "Failed to load registration data");
      } finally {
        setIsFetching(false);
      }
    };

    fetchRegistrationData();
  }, []);

  const validateCode = (code) => {
    return code && code.length >= 10;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "purchaseCodeWeb") {
      setIsWebValid(validateCode(value));
    } else if (name === "purchaseCodePhone") {
      setIsAppValid(validateCode(value));
    }
  };

  const handleReset = () => {
    setFormData({
      purchaseCodeWeb: "",
      purchaseCodePhone: "",
    });
    setIsWebValid(false);
    setIsAppValid(false);
  };

  const handleRegister = async () => {
    if (!formData.purchaseCodeWeb && !formData.purchaseCodePhone) {
      toast.error("Please enter at least one purchase code");
      return;
    }

    setIsLoading(true);

    try {
      const response = await registerSystem({
        purchaseCodeWeb: formData.purchaseCodeWeb,
        purchaseCodePhone: formData.purchaseCodePhone,
      });

      if (response) {
        toast.success("Purchase codes registered successfully!");
        if (formData.purchaseCodeWeb) {
          setIsWebValid(validateCode(formData.purchaseCodeWeb));
        }
        if (formData.purchaseCodePhone) {
          setIsAppValid(validateCode(formData.purchaseCodePhone));
        }
      } else {
        toast.error(
          response.message || "Registration failed. Please try again."
        );
      }
    } catch (error) {
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="sm:p-4 max-w-7xl mx-auto">
        <div className="max-w-7xl mx-auto bg-white rounded shadow-md p-8">
          <p>Loading registration data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sm:p-4 max-w-7xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">
        eShop Purchase Code Validator
      </h2>
      <div className="max-w-7xl mx-auto bg-white rounded shadow-md p-8">
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            ESHOP PURCHASE CODE FOR WEB<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="purchaseCodeWeb"
            value={formData.purchaseCodeWeb}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {isWebValid && (
            <div className="mt-4 bg-green-100 text-green-700 px-4 py-3 rounded text-sm">
              Your web system is successfully registered with us! Enjoy selling
              online!
            </div>
          )}
        </div>

        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            ESHOP PURCHASE CODE FOR APP<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="purchaseCodePhone"
            value={formData.purchaseCodePhone}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {isAppValid && (
            <div className="mt-4 bg-green-100 text-green-700 px-4 py-3 rounded text-sm">
              Your app system is successfully registered with us! Enjoy selling
              online!
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleReset}
            className="bg-gray-500 text-white cursor-pointer rounded-sm hover:bg-gray-600  px-6 py-2 shadow transition"
          >
            Reset
          </button>
          <button
            onClick={handleRegister}
            disabled={isLoading}
              className={`bg-table text-white cursor-pointer rounded-sm hover:bg-secondary  px-6 py-2 shadow transition ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Validating..." : "Register"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemRegisteration;
