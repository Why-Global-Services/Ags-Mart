import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSystemUserById, createSystemUser, updateSystemUser } from "./systemServices";

const SystemForm = ({ mode = "add" }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(false);
  const [formData, setFormData] = useState({
    userName: "",
    userRole: "",
    mobileNumber: "",
    email: "",
    password: "",
    conformPassword: "",
    permissions: {
      products: false,
      category: false,
      subCategory: false,
      orders: false,
      customers: false,
      reviews: false,
      offers: false,
      brands: false,
      reports: false,
      profile: false,
      notifications: false,
      systemUser: false,
      settings: false,
    },
  });

  // Custom notification function
  const showNotification = (type, content) => {
    const colors = {
      success: "bg-green-500",
      error: "bg-red-500",
      info: "bg-blue-500"
    };
    
    const notification = document.createElement("div");
    notification.className = `fixed top-4 right-4 text-white px-6 py-3 rounded-md shadow-lg ${colors[type] || colors.info} z-50`;
    notification.textContent = content;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add("opacity-0", "transition-opacity", "duration-300");
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  };

  useEffect(() => {
    if (mode === "edit" && id) {
      const fetchUserData = async () => {
        setLoading(true);
        try {
          const user = await getSystemUserById(id);
          setFormData({
            userName: user.userName || "",
            userRole: user.userRole || "",
            mobileNumber: user.mobileNumber || "",
            email: user.email || "",
            password: "",
            conformPassword: "",
            permissions: user.permissions || {
              products: false,
              category: false,
              subCategory: false,
              orders: false,
              customers: false,
              reviews: false,
              offers: false,
              brands: false,
              reports: false,
              profile: false,
              notifications: false,
              systemUser: false,
              settings: false,
            },
          });
          setInitialLoad(true);
        } catch (error) {
          showNotification("error", "Failed to fetch user details");
          console.error("Error loading user:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchUserData();
    }
  }, [mode, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePermissionToggle = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions[permission],
      },
    }));
  };

  const validateForm = () => {
    if (mode === "add" && formData.password !== formData.conformPassword) {
      showNotification("error", "Passwords do not match");
      return false;
    }
    
    if (mode === "add" && (!formData.password || !formData.conformPassword)) {
      showNotification("error", "Password is required");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      const submitData = { 
        ...formData,
      };
      
      // Only include password if it's being set (edit mode) or required (add mode)
      if (mode === "edit" && !submitData.password) {
        delete submitData.password;
      }
      
      if (mode === "add") {
        await createSystemUser(submitData);
        showNotification("success", "User created successfully");
      } else if (mode === "edit" && id) {
        await updateSystemUser(id, submitData);
        showNotification("success", "User updated successfully");
      }
      
      navigate("/systemUser");
    } catch (error) {
      console.error("Error saving user:", error);
      showNotification("error", error.response?.data?.message || "Failed to save user");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (mode === "add") {
      setFormData({
        userName: "",
        userRole: "",
        mobileNumber: "",
        email: "",
        password: "",
        conformPassword: "",
        permissions: {
          products: false,
          category: false,
          subCategory: false,
          orders: false,
          customers: false,
          reviews: false,
          offers: false,
          brands: false,
          reports: false,
          profile: false,
          notifications: false,
          systemUser: false,
          settings: false,
        },
      });
    } else if (mode === "edit" && id && initialLoad) {
      const fetchOriginalData = async () => {
        try {
          const user = await getSystemUserById(id);
          setFormData({
            userName: user.userName || "",
            userRole: user.userRole || "",
            mobileNumber: user.mobileNumber || "",
            email: user.email || "",
            password: "",
            conformPassword: "",
            permissions: user.permissions || {
              products: false,
              category: false,
              subCategory: false,
              orders: false,
              customers: false,
              reviews: false,
              offers: false,
              brands: false,
              reports: false,
              profile: false,
              notifications: false,
              systemUser: false,
              settings: false,
            },
          });
        } catch (error) {
          showNotification("error", "Failed to reset form");
        }
      };
      fetchOriginalData();
    }
  };

  const permissionItems = [
    { label: "Products", key: "products" },
    { label: "Category", key: "category" },
    { label: "Sub Category", key: "subCategory" },
    { label: "Orders", key: "orders" },
    { label: "Customers", key: "customers" },
    { label: "Reviews", key: "reviews" },
    { label: "Offers", key: "offers" },
    { label: "Brands", key: "brands" },
    { label: "Reports", key: "reports" },
    { label: "Profile", key: "profile" },
    { label: "Notifications", key: "notifications" },
    { label: "System User", key: "systemUser" },
    { label: "Settings", key: "settings" },
  ];

  return (
    <div className="bg-gray-100 p-6 min-h-screen">
      <h1 className="text-3xl font-title text-gray-800 mb-4">
        {mode === "add" ? "Create User" : "Edit User"}
      </h1>
      <button
          className="text-black rounded mr-4 mb-4 w-full md:w-auto cursor-pointer"
          onClick={() => navigate(-1)}
        >
          ← Go back
        </button>
      <div className="max-w-[99%] mx-auto p-8 bg-white shadow-md rounded-sm">
        {loading ? (
          <div className="text-center py-6 text-gray-600">Loading user data...</div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  User Name
                </label>
                <input
                  type="text"
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Role
                </label>
                <select
                  name="userRole"
                  value={formData.userRole}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
                  required
                >
                  <option value="">Select Role</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="employee">Employee</option>
                  <option value="support">Support</option>
                </select>
              </div>

              <div>
  <label className="block text-sm font-semibold text-gray-700 mb-1">
    Mobile Number
  </label>
  <input
    type="tel"
    name="mobileNumber"
    value={formData.mobileNumber}
    onChange={(e) => {
      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
      handleChange({ target: { name: 'mobileNumber', value } });
    }}
    className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
    required
    pattern="\d{10}"
    inputMode="numeric"
    placeholder="Enter 10-digit mobile number"
  />
</div>


              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
                  placeholder={mode === "edit" ? "Leave blank to keep current" : ""}
                />
              </div>
              
              {mode === "add" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="conformPassword"
                    value={formData.conformPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#fa4d6a]"
                  />
                </div>
              )}
            </div>

            {/* Permissions Section */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Permissions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {permissionItems.map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      {item.label}
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions[item.key]}
                          onChange={() => handlePermissionToggle(item.key)}
                          className="sr-only peer"
                        />
                        <div className={`w-12 h-6 rounded-full peer ${
                          formData.permissions[item.key] 
                            ? "bg-[#fa4d6a]" 
                            : "bg-gray-300"
                        }`}>
                          <div className={`absolute top-[2px] left-[2px] bg-white border rounded-full h-5 w-5 transition-all ${
                            formData.permissions[item.key] ? "translate-x-6" : ""
                          }`}></div>
                        </div>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleReset}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded transition cursor-pointer"
              >
                Reset
              </button>
              <button
                type="submit"
                className="bg-[#fa4d6a] text-white px-6 py-2 rounded transition cursor-pointer"
                disabled={loading}
              >
                {loading ? "Processing..." : mode === "add" ? "Create User" : "Update User"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SystemForm;