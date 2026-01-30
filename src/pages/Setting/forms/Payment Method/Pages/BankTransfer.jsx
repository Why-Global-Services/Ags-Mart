import React, { useState, useEffect } from "react";
import { usePayment } from "../../../../../context/PaymentContext";
import { createPaymentMethods } from "../../../../../services/settingServices/PaymentMethod";

const BankTransfer = () => {
  const { paymentData, updatePaymentData } = usePayment();
  const [formData, setFormData] = useState({
    recipientsfullName: "",
    bankAccountNumber: "",
    IFSCcode: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Initialize form with data from context
  useEffect(() => {
    if (paymentData?.bankTransfer) {
      setFormData({
        recipientsfullName: paymentData.bankTransfer.recipientsfullName || "",
        bankAccountNumber: paymentData.bankTransfer.bankAccountNumber || "",
        IFSCcode: paymentData.bankTransfer.IFSCcode || ""
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
  //     bankTransfer: formData
  //   });
  //   console.log("Bank Transfer Configuration Submitted:", formData);
  //   // Add API call to save data here
  // };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const requestData = {
        bankTransfer: formData
      };

    await createPaymentMethods(requestData);
      
      updatePaymentData({
        bankTransfer: formData
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
    if (paymentData?.bankTransfer) {
      setFormData({
        recipientsfullName: paymentData.bankTransfer.recipientsfullName || "",
        bankAccountNumber: paymentData.bankTransfer.bankAccountNumber || "",
        IFSCcode: paymentData.bankTransfer.IFSCcode || ""
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
              Recipient's Full Name
            </label>
            <input
              type="text"
              name="recipientsfullName"
              value={formData.recipientsfullName}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Bank Account Number
            </label>
            <input
              type="text"
              name="bankAccountNumber"
              value={formData.bankAccountNumber}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              IFSC Code
            </label>
            <input
              type="text"
              name="IFSCcode"
              value={formData.IFSCcode}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Example: SBIN0000123
            </p>
          </div>
          <div className="flex items-end">
            <div className="w-full">
              <p className="text-sm text-gray-600">
                Customers will be instructed to transfer money to this account for bank transfer payments.
              </p>
            </div>
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

export default BankTransfer;