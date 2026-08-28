"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { getAddresses, editAddress, deleteAddress, addAddress } from "@/app/interceptor/interseptor";
import { FiCreditCard, FiPackage } from "react-icons/fi";

const Addresses = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [editId, setEditId] = useState(null);
  const [addresses, setAddresses] = useState({
    billing: [],
    delivery: [],
  });
  const [tempAddress, setTempAddress] = useState({
    fullName: "",
    addressLine1: "",
    landMark: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    phone: "",
    addressType: "home",
    checkoutAddress: "",
  });
  const [errors, setErrors] = useState({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "" }),
      3000
    );
  };

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const response = await getAddresses();
      if (response.success) {
        const billing = response.address.filter(
          (addr) => addr.checkoutAddress === "billingAddress"
        );
        const delivery = response.address.filter(
          (addr) => addr.checkoutAddress === "deliveryAddress"
        );
        setAddresses({
          billing: billing.map(transformAddress),
          delivery: delivery.map(transformAddress),
        });
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      showNotification("Failed to fetch addresses", "error");
    } finally {
      setLoading(false);
    }
  };

  const transformAddress = (addr) => ({
    street: addr.addressLine1,
    city: addr.city,
    landMark: addr.landMark || "", 
    state: addr.state,
    zip: addr.zipCode,
    country: addr.country,
    fullName: addr.fullName,
    phone: addr.phone,
    addressType: addr.addressType,
    id: addr._id,
  });

  const validateForm = () => {
    const newErrors = {};
    if (!tempAddress.fullName.trim())
      newErrors.fullName = "Full name is required";
    if (!tempAddress.addressLine1.trim())
      newErrors.addressLine1 = "Address is required";
    if (!tempAddress.city.trim()) newErrors.city = "City is required";
    if (!tempAddress.state.trim()) newErrors.state = "State is required";
    if (!tempAddress.zipCode.trim()) newErrors.zipCode = "ZIP code is required";
    if (!tempAddress.country.trim()) newErrors.country = "Country is required";
    if (!tempAddress.phone.trim()) newErrors.phone = "Phone is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempAddress((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingType(null);
    setEditId(null);
    setTempAddress({
      fullName: "",
      addressLine1: "",
      landMark: "", 
      city: "",
      state: "",
      zipCode: "",
      country: "",
      phone: "",
      addressType: "home",
      checkoutAddress: "",
    });
    setErrors({});
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const addressData = {
        fullName: tempAddress.fullName,
        addressLine1: tempAddress.addressLine1,
        landMark: tempAddress.landMark, 
        city: tempAddress.city,
        state: tempAddress.state,
        zipCode: tempAddress.zipCode,
        country: tempAddress.country,
        phone: tempAddress.phone,
        addressType: tempAddress.addressType,
        checkoutAddress:
          editingType === "billing" ? "billingAddress" : "deliveryAddress",
      };

      if (editId) {
        await editAddress(editId, addressData);
        showNotification("Address updated successfully");
      } else {
        await addAddress({ address: addressData });
        showNotification("Address added successfully");
      }
      await fetchAddresses();
      resetForm();
    } catch (error) {
      console.error("Error saving address:", error);
      showNotification(error.message || "Failed to save address", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    setAddressToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!addressToDelete) return;

    setLoading(true);
    try {
      await deleteAddress(addressToDelete);
      await fetchAddresses();
      showNotification("Address deleted successfully");
    } catch (error) {
      console.error("Error deleting address:", error);
      showNotification("Failed to delete address", "error");
    } finally {
      setLoading(false);
      setIsDeleteModalOpen(false);
      setAddressToDelete(null);
    }
  };

  const handleEdit = (type, addr) => {
    setTempAddress({
      fullName: addr.fullName,
      addressLine1: addr.street,
      landMark: addr.landMark || "",
      city: addr.city,
      state: addr.state,
      zipCode: addr.zip,
      country: addr.country,
      phone: addr.phone,
      addressType: addr.addressType,
      checkoutAddress:
        type === "billing" ? "billingAddress" : "deliveryAddress",
    });
    setEditingType(type);
    setEditId(addr.id);
    setIsEditing(true);
  };

  const renderAddressCards = (type, label) => {
    const addrList = addresses[type];
    const typeColor = type === "billing" ? "bgvariant1" : "bgvariant1";

    if (!Array.isArray(addrList)) return null;

    if (addrList.length === 0) {
      return (
        <div className="flex-1">
          <h3 className={`text-lg font-semibold text-${typeColor}-800 mb-4 flex items-center gap-2`}>
            <span className={`w-3 h-3 rounded-full bg-${typeColor}-500`}></span>
            {label}
          </h3>
          <div className="bg-white rounded-xl p-6 border-2 border-dashed border-gray-200 text-center">
            <p className="text-gray-500 mb-3">No {label.toLowerCase()} saved</p>
            <button
              onClick={() => {
                setEditingType(type);
                setIsEditing(true);
              }}
              className={`inline-flex items-center gap-1.5 text-sm font-medium text-${typeColor}-600 hover:text-${typeColor}-800`}
              disabled={loading}
            >
              <Plus size={16} />
              Add {label.split(" ")[0]} Address
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1">
        <h3 className={`text-lg font-semibold text-${typeColor}-800 mb-4 flex items-center gap-2`}>
          <span className={`w-3 h-3 rounded-full bg-${typeColor}-500`}></span>
          {label}
        </h3>
        <div className="grid gap-4">
          {addrList.map((addr, index) => (
            <div
              key={addr.id}
              className={`bg-white rounded-xl p-5 border-l-4 border-${typeColor}-500 shadow-sm hover:shadow-md transition-all`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {label} {index + 1}
                  </p>
                  {index === 0 && (
                    <span className="inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Primary
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(type, addr)}
                    className="p-1.5 rounded-full hover:bg-gray-100 text-gray-800 hover:text-gray-700"
                    aria-label="Edit address"
                    disabled={loading}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="p-1.5 rounded-full hover:bg-gray-100 text-gray-800 hover:text-red-600"
                    aria-label="Delete address"
                    disabled={loading}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-800 space-y-1.5">
                <p className="font-medium">{addr.fullName}</p>
                <p>{addr.street}</p>
                {addr.landMark && (
  <p className="text-gray-700 italic">Landmark: {addr.landMark}</p>
)}
                <p>
                  {addr.city}, {addr.state} {addr.zip}
                </p>
                <p>{addr.country}</p>
                <p>Phone: {addr.phone}</p>
                <p>Type: {addr.addressType}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-2xl max-w-6xl mx-auto">
      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${notification.type === "error"
            ? "bg-red-100 text-red-800"
            : "bg-green-100 text-emerald-800"
            }`}
        >
          {notification.message}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Address Book</h2>
          <p className="text-gray-800 mt-2">
            Manage your billing and delivery addresses
          </p>
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="mt-4 md:mt-0 inline-flex items-center gap-2 bg-bgvariant-1 hover:bg-bgvariant-3 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50"
            disabled={loading}
          >
            <Plus size={18} />
            Add New Address
          </button>
        )}
      </div>

      {isEditing && !editingType && (
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Select Address Type
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setEditingType("billing")}
              className="flex flex-col items-center justify-center p-6 border-2 border-bgvariant-1 rounded-xl hover:border-bgvariant-3 bg-white transition-all disabled:opacity-50"
              disabled={loading}
            >
              <div className="w-12 h-12 rounded-full bg-bgvariant-2 flex items-center justify-center mb-3">
                <FiCreditCard className="w-6 h-6 text-bgvariant-3" />
              </div>
              <span className="font-medium text-gray-900">Billing Address</span>
              <span className="text-sm text-gray-800 mt-1">
                For invoices and payments
              </span>
            </button>
            <button
              onClick={() => setEditingType("delivery")}
              className="flex flex-col items-center justify-center p-6 border-2  border-bgvariant-1 rounded-xl hover:border-bgvariant-3 bg-white transition-all disabled:opacity-50"
              disabled={loading}
            >
              <div className="w-12 h-12 rounded-full bg-bgvariant-2 flex items-center justify-center mb-3">
                <FiPackage className="w-6 h-6 text-bgvariant-3" />
              </div>
              <span className="font-medium text-gray-900">
                Delivery Address
              </span>
              <span className="text-sm text-gray-800 mt-1">
                For shipping orders
              </span>
            </button>
          </div>
          <button
            onClick={resetForm}
            className="mt-4 flex items-center gap-1 text-gray-800 hover:text-gray-700 text-sm font-medium disabled:opacity-50"
            disabled={loading}
          >
            <X size={16} />
            Cancel
          </button>
        </div>
      )}

      {isEditing && editingType && (
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {editId ? "Edit" : "Add New"}{" "}
              {editingType === "billing" ? "Billing" : "Delivery"} Address
            </h3>
            <button
              onClick={resetForm}
              className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              aria-label="Close form"
              disabled={loading}
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={tempAddress.fullName}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 rounded-lg border ${errors.fullName ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all`}
                placeholder="John Doe"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address *
              </label>
              <input
                type="text"
                name="addressLine1"
                value={tempAddress.addressLine1}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 rounded-lg border ${errors.addressLine1 ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all`}
                placeholder="123 Main St"
              />
              {errors.addressLine1 && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.addressLine1}
                </p>
              )}
            </div>
            <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Landmark
  </label>
  <input
    type="text"
    name="landMark"
    value={tempAddress.landMark}
    onChange={handleChange}
    required
    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300
      focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
    placeholder="Near Apollo Hospital, Opp Bus Stop"
  />
</div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={tempAddress.city}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 rounded-lg border ${errors.city ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all`}
                placeholder="New York"
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State/Province *
              </label>
              <input
                type="text"
                name="state"
                value={tempAddress.state}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 rounded-lg border ${errors.state ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all`}
                placeholder="NY"
              />
              {errors.state && (
                <p className="mt-1 text-sm text-red-600">{errors.state}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ZIP/Postal Code *
              </label>
              <input
                type="text"
                name="zipCode"
                value={tempAddress.zipCode}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 rounded-lg border ${errors.zipCode ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all`}
                placeholder="10001"
              />
              {errors.zipCode && (
                <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country *
              </label>
              <input
                type="text"
                name="country"
                value={tempAddress.country}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 rounded-lg border ${errors.country ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all`}
                placeholder="United States"
              />
              {errors.country && (
                <p className="mt-1 text-sm text-red-600">{errors.country}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <input
                type="text"
                name="phone"
                value={tempAddress.phone}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 rounded-lg border ${errors.phone ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all`}
                placeholder="+1 (123) 456-7890"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Type
              </label>
              <select
                name="addressType"
                value={tempAddress.addressType}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              >
                <option value="home">Home</option>
                <option value="work">Work</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={resetForm}
              className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2.5 rounded-lg bg-bgvariant-1 hover:bg-bgvariant-3 text-white font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <span className="animate-spin">↻</span>
              ) : (
                <Check size={18} />
              )}
              {editId ? "Update" : "Save"} Address
            </button>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm Delete
              </h3>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
                aria-label="Close modal"
                disabled={loading}
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this address? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                  <span className="animate-spin">↻</span>
                ) : (
                  <Trash2 size={18} />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {renderAddressCards("billing", "Billing Address")}
        {renderAddressCards("delivery", "Delivery Address")}
      </div>
    </div>
  );
}

export default Addresses