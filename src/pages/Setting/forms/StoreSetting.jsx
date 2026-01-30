import React, { useEffect, useState } from "react";
import {
  getStoreSetting,
  updatestoreSettings,
} from "../../../Interceptor/interceptor";

const SystemSettingsForm = () => {
  const [data, setData] = useState({});
  const [formData, setFormData] = useState({
    appName: "",
    supportNumber: "",
    supportEmail: "",
    copyrightDetails: "",
    systemTimezone: "",
    taxName: "",
    taxNumber: "",
    lowStockLimit: "",
    address: "",
    adminStoreState: "",
    latitude: "",
    longitude: "",
    maxDaysReturn: "",
    minCartAmount: "",
    maxItemsCart: "",
    logo: null,
    favicon: null,
    cartButtonEnabled: true,
    expandProductImages: false,
    localPickup: true,
    deliverySettings: {
      zipcodeDelivery: false,
      deliveryBoyBonus: "",
      orderDeliveryOTP: false,
    },
    appVersions: {
      versionSystem: false,
      androidVersion: "",
      iosVersion: "",
    },
    referEarn: {
      status: false,
      method: "Percentage",
      minOrderAmount: "",
      bonus: "",
      maxAmount: "",
      bonusTimes: "",
    },
    currency: {
      countryCode: "",
      storeCurrency: "",
    },
    wallet: {
      status: false,
      amount: "",
    },
    maintenance: {
      customerApp: { enabled: false, message: "" },
      deliveryApp: { enabled: false, message: "" },
      adminApp: { enabled: false, message: "" },
      web: { enabled: false, message: "" },
    },
    offerPopup: {
      enabled: true,
      method: "Appears once",
    },
    deeplink: {
      androidLink: "",
      iosLink: "",
      scheme: "",
      host: "",
    },
    socialLogin: {
      google: true,
      apple: true,
    },
    whatsappNumber: "",
    deliverability: {
      pincode: false,
      city: true,
      globalFreeDelivery: "",
      globalDeliveryCharge: "",
    },
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState("");
  const [faviconPreview, setFaviconPreview] = useState("");

  const validateField = (name, value) => {
    // Skip validation for file inputs and nested objects
    if (name === "logo" || name === "favicon" || typeof value === "object") {
      return "";
    }

    // Convert value to string if it's not null/undefined
    const stringValue =
      value !== null && value !== undefined ? String(value) : "";

    switch (name) {
      case "supportEmail":
        return /\S+@\S+\.\S+/.test(stringValue) ? "" : "Invalid email address";
      case "appName":
      case "supportNumber":
      case "systemTimezone":
      case "address":
      case "adminStoreState":
      case "latitude":
      case "longitude":
      case "minCartAmount":
      case "maxItemsCart":
        return stringValue.trim() ? "" : "This field is required";
      default:
        return "";
    }
  };

  const storeSettings = async () => {
    try {
      const response = await getStoreSetting();
      const data = response.data;
      setData(data);

      // Set preview URLs if logo/favicon exist
      if (data.logo) {
        setLogoPreview(data.logo);
      }
      if (data.favicon) {
        setFaviconPreview(data.favicon);
      }

      setFormData({
        appName: data.appName || "",
        supportNumber: data.supportNumber || "",
        supportEmail: data.supportEmail || "",
        copyrightDetails: data.copyrightDetails || "",
        systemTimezone: data.systemTimeZone || "",
        taxName: data.taxName || "",
        taxNumber: data.taxNumber || "",
        lowStockLimit: data.lowStockLimit || "",
        address: data.address || "",
        adminStoreState: data.adminStoreState || "",
        latitude: data.latitude || "",
        longitude: data.longitude || "",
        maxDaysReturn: data.maxDaysToReturnItems || "",
        minCartAmount: data.minimumCartAmount || "",
        maxItemsCart: data.maximumItemsAllowedInCart || "",
        logo: null, // Keep as null, we'll handle file upload separately
        favicon: null, // Keep as null, we'll handle file upload separately
        cartButtonEnabled: data.cartButtonOnProductListView ?? true,
        expandProductImages: data.expandProductImage ?? false,
        localPickup: data.storePickup ?? true,

        deliverySettings: {
          zipcodeDelivery: data.zipcodeWiseDeliveryCharge ?? false,
          deliveryBoyBonus: data.deliveryBoyBonus || "",
          orderDeliveryOTP: data.orderDeliveryOTPSystem ?? false,
        },

        appVersions: {
          versionSystem: data.versionSystemStatus === "active",
          androidVersion: data.currentVersionOfAndroidAPP || "",
          iosVersion: data.currentVersionOfIOSAPP || "",
        },

        referEarn: {
          status: data.referEarnStatus ?? false,
          method: data.referEarnMethod || "Percentage",
          minOrderAmount: data.minimumReferEarnOrderAmout || "",
          bonus: data.referEarnBonus || "",
          maxAmount: data.maximumReferEarnAmount || "",
          bonusTimes: data.timesBonusToCustomers || "",
        },

        currency: {
          countryCode: data.countryCurrencyCode || "",
          storeCurrency: data.storeCurrency || "",
        },

        wallet: {
          status: data.walletBalanceStatus ?? false,
          amount: data.walletBalanceAmount || "",
        },

        maintenance: {
          customerApp: {
            enabled: data.customAppStatus ?? false,
            message: data.customAppMessage || "",
          },
          deliveryApp: {
            enabled: data.deliveryBoyAppStatus ?? false,
            message: data.deliveryBoyAppMessage || "",
          },
          adminApp: {
            enabled: data.adminAppStatus ?? false,
            message: data.adminAppMessage || "",
          },
          web: {
            enabled: data.webMaintainanceMode ?? false,
            message: data.webMaintainanceModeMessage || "",
          },
        },

        offerPopup: {
          enabled: data.offerPopup ?? true,
          method: data.offerPopupMethod || "Appears once",
        },

        deeplink: {
          androidLink: data.androidAppStoreLink || "",
          iosLink: data.iOSAppStoreLink || "",
          scheme: data.schemeForAPP || "",
          host: data.hostForAPP || "",
        },

        socialLogin: {
          google: data.googleLogin ?? true,
          apple: data.appleLogin ?? true,
        },

        whatsappNumber: data.whatsAppNumber || "",
        deliverability: {
          pincode: data.pinCodeWiseDeliverability ?? false,
          city: data.cityWiseDeliverability ?? true,
          globalFreeDelivery: data.freeDeliveryAmountOnCity || "",
          globalDeliveryCharge: data.deliveryAmountOnCity || "",
        },
      });
    } catch (error) {
      console.error("Error fetching store settings:", error);
    }
  };

  useEffect(() => {
    storeSettings();

    // Clean up object URLs when component unmounts
    return () => {
      if (logoPreview && logoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }
      if (faviconPreview && faviconPreview.startsWith("blob:")) {
        URL.revokeObjectURL(faviconPreview);
      }
    };
  }, []);

  const handleChange = (e, section = null) => {
    const { name, value, type, checked, files } = e.target;

    // Handle file inputs
    if (type === "file" && files && files[0]) {
      const file = files[0];
      const previewUrl = URL.createObjectURL(file);

      if (name === "logo") {
        setLogoPreview(previewUrl);
      } else if (name === "favicon") {
        setFaviconPreview(previewUrl);
      }

      setFormData((prev) => ({
        ...prev,
        [name]: file,
      }));
      return;
    }

    const newValue = type === "checkbox" ? checked : value;

    if (section) {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [name]: newValue,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: newValue,
      }));
    }

    // Validate field (skip for files and nested objects)
    if (!section && type !== "file") {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, newValue),
      }));
    }
  };

  const handleNestedChange = (e, section, subsection = null) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...(subsection
          ? {
              [subsection]: {
                ...prev[section][subsection],
                [name]: newValue,
              },
            }
          : {
              [name]: newValue,
            }),
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate all required fields (skip files and nested objects)
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (
        key !== "logo" &&
        key !== "favicon" &&
        typeof formData[key] !== "object"
      ) {
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Create FormData object
      const formDataToSend = new FormData();

      // Append all fields
      for (const key in formData) {
        if (key === "logo" || key === "favicon") {
          // Append files if they exist
          if (formData[key]) {
            formDataToSend.append(key, formData[key]);
          }
        } else if (typeof formData[key] === "object") {
          // Stringify nested objects
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          // Append regular fields
          formDataToSend.append(key, formData[key]);
        }
      }
      console.log("form", formDataToSend);
      const response = await updatestoreSettings(formDataToSend);

      if (response.data.success) {
        alert("Settings updated successfully!");
        // Refresh data after successful update
        await storeSettings();
      } else {
        alert("Error updating settings: " + response.data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error updating settings. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    storeSettings(); // Reset to original values
    setErrors({});
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            System Settings
          </h2>

          {/* System Settings */}
          <div className="form-section bg-white rounded-2xl shadow-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  name: "appName",
                  label: "App Name *",
                  type: "text",
                },
                {
                  name: "supportNumber",
                  label: "Support Number *",
                  type: "text",
                },
                {
                  name: "supportEmail",
                  label: "Support Email *",
                  type: "email",
                },
                {
                  name: "systemTimezone",
                  label: "System Timezone *",
                  type: "text",
                },
                {
                  name: "taxName",
                  label: "Tax Name",
                  type: "text",
                },
                {
                  name: "taxNumber",
                  label: "Tax Number",
                  type: "text",
                },
                {
                  name: "lowStockLimit",
                  label: "Low Stock Limit",
                  type: "number",
                },
                {
                  name: "adminStoreState",
                  label: "Admin Store State *",
                  type: "text",
                },
                {
                  name: "latitude",
                  label: "Latitude *",
                  type: "text",
                },
                {
                  name: "longitude",
                  label: "Longitude *",
                  type: "text",
                },
                {
                  name: "maxDaysReturn",
                  label: "Max Days to Return Item",
                  type: "number",
                },
                {
                  name: "minCartAmount",
                  label: "Minimum Cart Amount($) *",
                  type: "number",
                },
                {
                  name: "maxItemsCart",
                  label: "Maximum Items Allowed In Cart *",
                  type: "number",
                },
              ].map((field) => (
                <div key={field.name} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  {errors[field.name] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[field.name]}
                    </p>
                  )}
                </div>
              ))}
              <div className="col-span-full space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Address *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
              </div>
              <div className="col-span-full space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Copyright Details *
                </label>
                <textarea
                  name="copyrightDetails"
                  value={formData.copyrightDetails}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Logo & Other Settings */}
          <div className="form-section bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Logo & Other Settings
            </h2>
            <div className="space-y-6">
              {["logo", "favicon"].map((item) => (
                <div key={item} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                    <input
                      type="file"
                      name={item}
                      onChange={handleChange}
                      accept="image/*"
                      className="hidden"
                      id={`${item}-upload`}
                    />
                    <label
                      htmlFor={`${item}-upload`}
                      className="cursor-pointer"
                    >
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <p className="text-sm text-gray-600">
                          Drop your image here, or browse
                        </p>
                        <p className="text-xs text-gray-400">
                          Larger than 120x120 & smaller than 150x150
                        </p>
                      </div>
                    </label>
                  </div>
                  {item === "logo" && logoPreview && (
                    <div className="mt-2">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="h-20 w-auto object-contain"
                      />
                    </div>
                  )}
                  {item === "favicon" && faviconPreview && (
                    <div className="mt-2">
                      <img
                        src={faviconPreview}
                        alt="Favicon preview"
                        className="h-20 w-auto object-contain"
                      />
                    </div>
                  )}
                </div>
              ))}
              {[
                {
                  name: "cartButtonEnabled",
                  label: "Enable Cart Button on Products List view?",
                },
                {
                  name: "expandProductImages",
                  label: "Expand Product Images?",
                },
                { name: "localPickup", label: "Enable Local / Store Pickup?" },
              ].map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between py-2"
                >
                  <span className="text-sm text-gray-700">{item.label}</span>
                  <input
                    type="checkbox"
                    name={item.name}
                    checked={formData[item.name]}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Settings */}
          <div className="form-section bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Delivery Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Zipcode Wise Delivery Charge
                </label>
                <input
                  type="checkbox"
                  name="zipcodeDelivery"
                  checked={formData.deliverySettings.zipcodeDelivery}
                  onChange={(e) => handleNestedChange(e, "deliverySettings")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Delivery Boy Bonus (%)
                </label>
                <input
                  type="text"
                  name="deliveryBoyBonus"
                  value={formData.deliverySettings.deliveryBoyBonus}
                  onChange={(e) => handleNestedChange(e, "deliverySettings")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Order Delivery OTP System
                </label>
                <input
                  type="checkbox"
                  name="orderDeliveryOTP"
                  checked={formData.deliverySettings.orderDeliveryOTP}
                  onChange={(e) => handleNestedChange(e, "deliverySettings")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Application Versions */}
          <div className="form-section bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Application Versions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Version System Status
                </label>
                <input
                  type="checkbox"
                  name="versionSystem"
                  checked={formData.appVersions.versionSystem}
                  onChange={(e) => handleNestedChange(e, "appVersions")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Current Version Of Android APP *
                </label>
                <input
                  type="text"
                  name="androidVersion"
                  value={formData.appVersions.androidVersion}
                  onChange={(e) => handleNestedChange(e, "appVersions")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Current Version Of IOS APP *
                </label>
                <input
                  type="text"
                  name="iosVersion"
                  value={formData.appVersions.iosVersion}
                  onChange={(e) => handleNestedChange(e, "appVersions")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Refer & Earn Settings */}
          <div className="form-section bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Refer & Earn Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Refer & Earn Status?
                </label>
                <input
                  type="checkbox"
                  name="status"
                  checked={formData.referEarn.status}
                  onChange={(e) => handleNestedChange(e, "referEarn")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Refer & Earn Method
                </label>
                <select
                  name="method"
                  value={formData.referEarn.method}
                  onChange={(e) => handleNestedChange(e, "referEarn")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option>Percentage</option>
                  <option>Flat</option>
                </select>
              </div>
              {[
                {
                  name: "minOrderAmount",
                  label: "Minimum Refer & Earn Order Amount ($)",
                },
                {
                  name: "bonus",
                  label: "Refer & Earn Bonus ($ OR %)",
                },
                {
                  name: "maxAmount",
                  label: "Maximum Refer & Earn Amount ($)",
                },
                {
                  name: "bonusTimes",
                  label: "Times Bonus to be given to the customer",
                },
              ].map((field) => (
                <div key={field.name} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    name={field.name}
                    value={formData.referEarn[field.name]}
                    onChange={(e) => handleNestedChange(e, "referEarn")}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Country Currency and Wallet Balance */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="form-section bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Country Currency
              </h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Country Currency Code
                  </label>
                  <input
                    type="text"
                    name="countryCode"
                    value={formData.currency.countryCode}
                    onChange={(e) => handleNestedChange(e, "currency")}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Store Currency *
                  </label>
                  <input
                    type="text"
                    name="storeCurrency"
                    value={formData.currency.storeCurrency}
                    onChange={(e) => handleNestedChange(e, "currency")}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>
            <div className="form-section bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Welcome Wallet Balance
              </h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Wallet Balance Status?
                  </label>
                  <input
                    type="checkbox"
                    name="status"
                    checked={formData.wallet.status}
                    onChange={(e) => handleNestedChange(e, "wallet")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Wallet Balance Amount ($)
                  </label>
                  <input
                    type="text"
                    name="amount"
                    value={formData.wallet.amount}
                    onChange={(e) => handleNestedChange(e, "wallet")}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance Mode */}
          <div className="form-section bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Maintenance Mode
            </h2>
            <p className="text-sm text-red-600 mb-6">
              [ If you enable Maintenance Mode of App then your App will be
              "Under Maintenance" ]
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: "customerApp", label: "Customer App" },
                { name: "deliveryApp", label: "Delivery Boy App" },
                { name: "adminApp", label: "Admin App" },
                { name: "web", label: "Web Maintenance Mode" },
              ].map((item) => (
                <div key={item.name} className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    {item.label}
                  </label>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{item.label}</span>
                    <input
                      type="checkbox"
                      name="enabled"
                      checked={formData.maintenance[item.name].enabled}
                      onChange={(e) =>
                        handleNestedChange(e, "maintenance", item.name)
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  <textarea
                    name="message"
                    value={formData.maintenance[item.name].message}
                    onChange={(e) =>
                      handleNestedChange(e, "maintenance", item.name)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    rows={3}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Cron Jobs */}
          <div className="form-section bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Cron Jobs</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Cron URL for Discount Codes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      label: "Add Promo Code Discount URL *",
                      value:
                        "https://eshopweb.store/admin/cron_job/settle_cashback_discount",
                    },
                    {
                      label: "Add Flash Sale Active/Deactivate URL *",
                      value:
                        "https://eshopweb.store/admin/cron_job/fetch_active_flash_sale",
                    },
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {item.label}
                      </label>
                      <input
                        type="text"
                        value={item.value}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Cron Job URL for Remaining Item in cart
                </h3>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Add Remaining Item in cart URL *
                  </label>
                  <input
                    type="text"
                    value="https://eshopweb.store/admin/cron_job/remaining_cart"
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Offer Popup */}
          <div className="form-section bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Offer Popup
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Offer popup?
                </label>
                <input
                  type="checkbox"
                  name="enabled"
                  checked={formData.offerPopup.enabled}
                  onChange={(e) => handleNestedChange(e, "offerPopup")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Offer popup Method
                </label>
                <input
                  type="text"
                  name="method"
                  value={formData.offerPopup.method}
                  onChange={(e) => handleNestedChange(e, "offerPopup")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Deeplink Settings */}
          <div className="form-section bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Deeplink Settings For APP
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  name: "androidLink",
                  label: "Android App Store Link *",
                  defaultValue:
                    "https://play.google.com/store/apps/details?id=com.eshopsingle.customer",
                },
                {
                  name: "iosLink",
                  label: "iOS App Store Link *",
                  defaultValue: "https://testflight.apple.com/join/khkhXaNh",
                },
                {
                  name: "scheme",
                  label: "Scheme For APP *",
                  defaultValue: "eshopsingle",
                },
                {
                  name: "host",
                  label: "Host For APP *",
                  defaultValue: "eshopweb.store",
                },
              ].map((field) => (
                <div key={field.name} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    name={field.name}
                    value={formData.deeplink[field.name]}
                    onChange={(e) => handleNestedChange(e, "deeplink")}
                    defaultValue={field.defaultValue}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Social Login and WhatsApp */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="form-section bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Social Login
              </h2>
              <div className="space-y-4">
                {["google", "apple"].map((provider) => (
                  <div
                    key={provider}
                    className="flex items-center justify-between"
                  >
                    <label className="text-sm font-medium text-gray-700">
                      {provider.charAt(0).toUpperCase() + provider.slice(1)}
                    </label>
                    <input
                      type="checkbox"
                      name={provider}
                      checked={formData.socialLogin[provider]}
                      onChange={(e) => handleNestedChange(e, "socialLogin")}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="form-section bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Share WhatsApp Number
              </h2>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  WhatsApp
                </label>
                <input
                  type="text"
                  name="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={handleChange}
                  defaultValue="9876543210"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
            <div className="form-section bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Product Deliverability
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    Pincode Wise Deliverability
                  </span>
                  <input
                    type="checkbox"
                    name="pincode"
                    checked={formData.deliverability.pincode}
                    onChange={(e) => handleNestedChange(e, "deliverability")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    City Wise Deliverability
                  </span>
                  <input
                    type="checkbox"
                    name="city"
                    checked={formData.deliverability.city}
                    onChange={(e) => handleNestedChange(e, "deliverability")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                {[
                  {
                    name: "globalFreeDelivery",
                  },
                  {
                    name: "globalDeliveryCharge",
                  },
                ].map((field) => (
                  <div key={field.name} className="space-y-2">
                    <input
                      type="text"
                      name={field.name}
                      value={formData.deliverability[field.name]}
                      onChange={(e) => handleNestedChange(e, "deliverability")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2 bg-gray-500 text-white cursor-pointer rounded-lg hover:bg-gray-600 transition-colors"
              disabled={isSubmitting}
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-table text-white rounded-lg cursor-pointer hover:bg-secondary transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SystemSettingsForm;
