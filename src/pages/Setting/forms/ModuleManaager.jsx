// import React, { useState } from "react";

// const modulesList = [
//   { key: "dashboard", label: "Dashboard" },
//   { key: "products", label: "Products" },
//   { key: "Categories", label: "Categories" },
//   { key: "Sub-categories", label: "Sub-Categories" },
//   { key: "Orders", label: "Orders" },
//   { key: "Cusstomers", label: "Customers" },
//   { key: "Reviews", label: "Reviews" },
//   { key: "Offers", label: "Offers" },
//   { key: "Brand", label: "Brand" },
//   { key: "Coupons", label: "Coupons" },
//   { key: "Feature Section", label: "Feature Section" },
//   { key: "Reports", label: "Report" },
//   { key: "Profile", label: "Profile" },
//   { key: "System User", label: "System User" },
//   { key: "Notification", label: "Notification" },
// ];

// const ModuleManager = () => {
//   const [enabledModules, setEnabledModules] = useState(
//     modulesList.reduce((acc, module) => {
//       acc[module.key] = true;
//       return acc;
//     }, {})
//   );

//   const toggleModule = (key) => {
//     setEnabledModules((prev) => ({
//       ...prev,
//       [key]: !prev[key],
//     }));
//   };

//   const handleSave = () => {
//     console.log("Saved Modules:", enabledModules);
//     // API call to update modules
//   };

//   return (
//     <div className="min-h-screen p-6 bg-gray-50">
//       <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md p-8">
//         <h1 className="text-2xl font-bold text-gray-800 mb-6">
//           Module Manager
//         </h1>
//         <p className="text-gray-600 mb-6">
//           Enable or disable modules that should be available across your
//           website.
//         </p>

//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//           {modulesList.map((module) => (
//             <div
//               key={module.key}
//               className="flex items-center justify-between bg-gray-100 rounded-lg p-4 shadow-sm"
//             >
//               <span className="text-gray-700 font-medium">{module.label}</span>
//               <label className="relative inline-flex items-center cursor-pointer">
//                 <input
//                   type="checkbox"
//                   className="sr-only peer"
//                   checked={enabledModules[module.key]}
//                   onChange={() => toggleModule(module.key)}
//                 />
//                 <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-[#fa4d6a] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
//               </label>
//             </div>
//           ))}
//         </div>

//         <div className="mt-8 flex justify-end">
//           <button
//             onClick={handleSave}
//             className="bg-[#fa4d6a] text-white font-medium px-6 py-2 rounded-lg hover:bg-[#e33b56] transition"
//           >
//             Save Changes
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ModuleManager;


import React, { useState, useEffect } from "react";
import { createModuleManaging, getModuleManaging } from "../../../services/settingServices/ModuleManager";
import { toast } from "react-toastify";

const modulesList = [
  { key: "dashboard", label: "Dashboard" },
  { key: "products", label: "Products" },
  { key: "categories", label: "Categories" },
  { key: "subCategories", label: "Sub-Categories" },
  { key: "orders", label: "Orders" },
  { key: "customers", label: "Customers" },
  { key: "reviews", label: "Reviews" },
  { key: "offers", label: "Offers" },
  { key: "brand", label: "Brand" },
  { key: "coupons", label: "Coupons" },
  { key: "featureSection", label: "Feature Section" },
  { key: "reports", label: "Reports" },
  { key: "profile", label: "Profile" },
  { key: "systemUser", label: "System User" },
  { key: "notification", label: "Notification" },
];

const ModuleManager = () => {
  const [enabledModules, setEnabledModules] = useState(
    modulesList.reduce((acc, module) => {
      acc[module.key] = false;
      return acc;
    }, {})
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchModuleSettings();
  }, []);

  const fetchModuleSettings = async () => {
    try {
      setIsLoading(true);
      const response = await getModuleManaging();
      if (response.data) {
       
        const updatedModules = { ...enabledModules };
        for (const key in response.data) {
          if (key in updatedModules) {
            updatedModules[key] = response.data[key];
          }
        }
        setEnabledModules(updatedModules);
      }
    } catch (error) {
      console.error("Failed to fetch module settings:", error);
      toast.error(error.message)
    } finally {
      setIsLoading(false);
    }
  };

  const toggleModule = (key) => {
    setEnabledModules((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await createModuleManaging(enabledModules);
      toast.success("Module settings saved successfully!");
    } catch (error) {
      console.error("Failed to save module settings:", error);
      toast.error("Failed to save module settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#fa4d6a] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading module settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Module Manager
        </h1>
        <p className="text-gray-600 mb-6">
          Enable or disable modules that should be available across your
          website.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {modulesList.map((module) => (
            <div
              key={module.key}
              className="flex items-center justify-between bg-gray-100 rounded-lg p-4 shadow-sm"
            >
              <span className="text-gray-700 font-medium">{module.label}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={enabledModules[module.key] || false}
                  onChange={() => toggleModule(module.key)}
                  disabled={isSaving}
                />
                <div className={`w-11 h-6 rounded-full peer ${enabledModules[module.key] ? 'bg-secondary' : 'bg-gray-300'} peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
              </label>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`bg-table text-white cursor-pointer font-medium px-6 py-2 rounded-sm hover:bg-secondary transition ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModuleManager;