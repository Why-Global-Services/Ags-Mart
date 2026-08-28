"use client";

import { useState, useEffect } from "react";
import { FiAlertCircle, FiUser, FiMail, FiPhone, FiCheckCircle } from "react-icons/fi";
import { getUserDetails, updateUserDetails } from "@/app/interceptor/interseptor";

export default function AccountDetails() {
  const [account, setAccount] = useState({
    name: "",
    email: "",
    phoneNumber: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    try {
      setIsLoading(true);      
      const response = await getUserDetails();
      console.log("GET API Response:", response);
    
      setAccount({
        name: response.data.name || "",
        email: response.data.email || "",
        phoneNumber: response.data.phoneNumber || ""
      });   
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setIsSaved(false);

      if (name === "phoneNumber") {
    if (!/^\d*$/.test(value) || value.length > 10) return;
  }

    setAccount(prev => ({ 
      ...prev, 
      [name]: value 
    }));

    if (errors[name]) {
      setErrors(prev => ({ 
        ...prev, 
        [name]: "" 
      }));
    }

  if (name === "phoneNumber") {
    if (value && value.length !== 10) {
      setErrors(prev => ({
        ...prev,
        phoneNumber: "Phone number must be exactly 10 digits."
      }));
    } else {
      setErrors(prev => ({ ...prev, phoneNumber: "" }));
    }
  }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!account.name.trim()) {
      setErrors({ name: "Full name is required." });
      return;
    }
    
    if (!account.email.trim()) {
      setErrors({ email: "Email address is required." });
      return;
    }

   if (account.phoneNumber && account.phoneNumber.length !== 10) {
  setErrors({ phoneNumber: "Phone number must be exactly 10 digits." });
  return;
}

    try {
      setIsLoading(true);
      console.log("Starting update...");
      
      const updateData = {
        name: account.name.trim(),
        email: account.email.trim(),
        phoneNumber: account.phoneNumber || ""
      };

      console.log("Update Data:", updateData);

      const updateResponse = await updateUserDetails(updateData);
      console.log("Update Response:", updateResponse);
      
      if (updateResponse?.success || 
          updateResponse?.message?.includes("success") || 
          updateResponse?.data ||
          updateResponse?.status === "success" ||
          updateResponse === "User details updated successfully") {
        
        console.log("Update successful!");
        setIsSaved(true);
        setErrors({});

        await fetchUserDetails();
        
        setTimeout(() => {
          setIsSaved(false);
        }, 3000);
        
      } else {
        console.log("No clear success indicator, but no error thrown");
        setIsSaved(true);
        setErrors({});
        
        setTimeout(() => {
          setIsSaved(false);
        }, 3000);
      }

    } catch (error) {
      console.error("Error updating user details:", error);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="max-w-3xl mx-auto p-6 md:p-8 rounded-3xl shadow-xl bg-white/80 backdrop-blur-lg border border-white/20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-bgvariant-3">Account Details</h2>
          <p className="text-gray-800 mt-2">Update your personal information</p>
        </div>
        
        {isSaved && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium border border-green-200">
            <FiCheckCircle className="w-4 h-4" />
            Changes saved successfully!
          </div>
        )}
      </div>

      {errors.api && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <p className="text-red-700 flex items-center gap-2">
            <FiAlertCircle className="w-5 h-5" />
            {errors.api}
          </p>
        </div>
      )}
        <form className="space-y-6" onSubmit={handleSave}>
          {/* Full Name Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Full Name *
            </label>
            <div className="relative group">
              <input
                type="text"
                name="name"
                value={account.name}
                onChange={handleChange}
                className={`w-full px-4 py-4 bg-white border-2 ${
                  errors.name ? "border-red-300 bg-red-50" : "border-gray-200"
                } rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-200 shadow-sm`}
                placeholder="Enter your full name"
                required
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <FiUser className={`h-5 w-5 ${
                  errors.name ? "text-red-400" : "text-gray-400"
                }`} />
              </div>
            </div>
            {errors.name && (
              <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                <FiAlertCircle className="w-4 h-4" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Email Address Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Email Address *
            </label>
            <div className="relative group">
              <input
                type="email"
                name="email"
                value={account.email}
                onChange={handleChange}
                className={`w-full px-4 py-4 bg-white border-2 ${
                  errors.email ? "border-red-300 bg-red-50" : "border-gray-200"
                } rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-200 shadow-sm`}
                placeholder="your.email@example.com"
                required
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <FiMail className={`h-5 w-5 ${
                  errors.email ? "text-red-400" : "text-gray-400"
                }`} />
              </div>
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                <FiAlertCircle className="w-4 h-4" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone Number Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Phone Number
            </label>
            <div className="relative group">
  {/* +91 prefix */}
  <div className="absolute inset-y-0 left-4 flex items-center text-gray-600 font-medium">
    +91
  </div>

  <input
    type="tel"
    name="phoneNumber"
    value={account.phoneNumber}
    onChange={handleChange}
    maxLength={10}
    inputMode="numeric"
    className={`w-full pl-16 pr-4 py-4 bg-white border-2 ${
      errors.phoneNumber ? "border-red-300 bg-red-50" : "border-gray-200"
    } rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-200 shadow-sm`}
    placeholder="9876543210"
  />

  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
    <FiPhone className={`h-5 w-5 ${
      errors.phoneNumber ? "text-red-400" : "text-gray-400"
    }`} />
  </div>
</div>

            {errors.phone && (
              <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                <FiAlertCircle className="w-4 h-4" />
                {errors.phone}
              </p>
            )}
            <p className="text-gray-500 text-xs">
              Optional - 10 digits without country code
            </p>
          </div>

          {/* Save Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-bgvariant-1 hover:bg-bgvariant-3 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Saving Changes...
                </div>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
    </div>
  );
}