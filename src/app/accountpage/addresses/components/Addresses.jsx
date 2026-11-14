"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import {
  getAddresses,
  editAddress,
  deleteAddress,
  addAddress,
  syncSameAsDeliveryAddress,
} from "@/app/interceptor/interseptor";
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
    email: "",
    confirmEmail: "",
    addressType: "home",
    checkoutAddress: "",
  });
  const [errors, setErrors] = useState({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [sameAsDelivery, setSameAsDelivery] = useState(false);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState(null);
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
      if (response?.success) {
        const addressList = response.address || response.data?.address || [];
        const billing = addressList.filter(
          (addr) => addr.checkoutAddress === "billingAddress"
        );
        const delivery = addressList.filter(
          (addr) => addr.checkoutAddress === "deliveryAddress"
        );
        const transformedDelivery = delivery.map(transformAddress);
        const transformedBilling = billing.map(transformAddress);

        setAddresses({
          billing: transformedBilling,
          delivery: transformedDelivery,
        });

        const backendSameAsDelivery = Boolean(response.sameAsDelivery);
        setSameAsDelivery(backendSameAsDelivery);

        const primaryIdFromBackend = response.primaryDeliveryAddressId;
        setSelectedDeliveryId((prevSelected) => {
          if (
            primaryIdFromBackend &&
            transformedDelivery.some((d) => d.id === primaryIdFromBackend)
          ) {
            return primaryIdFromBackend;
          }
          if (
            prevSelected &&
            transformedDelivery.some((d) => d.id === prevSelected)
          ) {
            return prevSelected;
          }
          return transformedDelivery[0]?.id || null;
        });
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      const isAuth =
        error?.response?.status === 401 ||
        error?.response?.status === 403 ||
        error?.message?.toLowerCase().includes("expired");

      if (!isAuth) {
        showNotification("Failed to fetch addresses", "error");
      }
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
    email: addr.email || "",
    addressType: addr.addressType,
    isSameAsDelivery: Boolean(addr.isSameAsDelivery),
    sourceDeliveryAddressId: addr.sourceDeliveryAddressId || null,
    id: addr._id,
  });

  const handleToggleSameAsDelivery = async () => {
    if (syncLoading || loading) return;

    const nextEnabled = !sameAsDelivery;
    if (nextEnabled && addresses.delivery.length === 0) {
      showNotification(
        "Please add a delivery address before enabling Same as Delivery Address",
        "error"
      );
      return;
    }

    const targetDeliveryId =
      selectedDeliveryId || addresses.delivery[0]?.id || null;

    setSyncLoading(true);
    try {
      await syncSameAsDeliveryAddress({
        enabled: nextEnabled,
        deliveryAddressId: nextEnabled ? targetDeliveryId : undefined,
      });
      await fetchAddresses();
      showNotification(
        nextEnabled
          ? "Billing address set to same as delivery address"
          : "Same as delivery address disabled. You can manage a separate billing address."
      );
    } catch (error) {
      console.error("Error syncing same as delivery address:", error);
      const isAuth =
        error?.response?.status === 401 ||
        error?.response?.status === 403 ||
        error?.message?.toLowerCase().includes("expired");

      if (!isAuth) {
        showNotification(
          error.message || "Failed to update billing address",
          "error"
        );
      }
    } finally {
      setSyncLoading(false);
    }
  };

  const handleSelectDeliveryAddress = async (deliveryId) => {
    if (syncLoading || loading || deliveryId === selectedDeliveryId) return;
    setSelectedDeliveryId(deliveryId);

    if (!sameAsDelivery) return;

    setSyncLoading(true);
    try {
      await syncSameAsDeliveryAddress({
        enabled: true,
        deliveryAddressId: deliveryId,
      });
      await fetchAddresses();
      showNotification("Billing address synchronized with selected delivery address");
    } catch (error) {
      console.error("Error synchronizing billing address:", error);
      const isAuth =
        error?.response?.status === 401 ||
        error?.response?.status === 403 ||
        error?.message?.toLowerCase().includes("expired");

      if (!isAuth) {
        showNotification(
          error.message || "Failed to synchronize billing address",
          "error"
        );
      }
    } finally {
      setSyncLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = (tempAddress.email || "").trim();
    const cleanConfirm = (tempAddress.confirmEmail || "").trim();

    if (!tempAddress.fullName.trim())
      newErrors.fullName = "Full name is required";
    if (!tempAddress.addressLine1.trim())
      newErrors.addressLine1 = "Address is required";
    if (!tempAddress.city.trim()) newErrors.city = "City is required";
    if (!tempAddress.state.trim()) newErrors.state = "State is required";
    if (!tempAddress.zipCode.trim()) newErrors.zipCode = "ZIP code is required";
    if (!tempAddress.country.trim()) newErrors.country = "Country is required";
    if (!tempAddress.phone.trim()) newErrors.phone = "Phone is required";

    if (!cleanEmail) {
      newErrors.email = "Email address is required";
    } else if (!emailRegex.test(cleanEmail)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!cleanConfirm) {
      newErrors.confirmEmail = "Please confirm your email address";
    } else if (cleanEmail.toLowerCase() !== cleanConfirm.toLowerCase()) {
      newErrors.confirmEmail = "Email addresses do not match";
    }

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
      email: "",
      confirmEmail: "",
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
        email: tempAddress.email.trim().toLowerCase(),
        confirmEmail: tempAddress.confirmEmail.trim().toLowerCase(),
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
      const isAuth =
        error?.response?.status === 401 ||
        error?.response?.status === 403 ||
        error?.message?.toLowerCase().includes("expired");

      if (!isAuth) {
        showNotification(error.message || "Failed to save address", "error");
      }
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
      const isAuth =
        error?.response?.status === 401 ||
        error?.response?.status === 403 ||
        error?.message?.toLowerCase().includes("expired");

      if (!isAuth) {
        showNotification("Failed to delete address", "error");
      }
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
      email: addr.email || "",
      confirmEmail: addr.email || "",
      addressType: addr.addressType,
      checkoutAddress:
        type === "billing" ? "billingAddress" : "deliveryAddress",
    });
    setEditingType(type);
    setEditId(addr.id);
    setIsEditing(true);
  };

  const renderSameAsDeliveryControl = () => (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5">
      <button
        type="button"
        onClick={handleToggleSameAsDelivery}
        disabled={syncLoading || loading}
        aria-pressed={sameAsDelivery}
        className={`inline-flex items-center gap-2.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
          sameAsDelivery
            ? "bg-bgvariant-1 text-white hover:bg-bgvariant-3"
            : "border border-bgvariant-1 bg-white text-bgvariant-3 hover:bg-green-50"
        }`}
      >
        <span
          className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
            sameAsDelivery ? "bg-bgvariant-3" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              sameAsDelivery ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </span>
        <span>
          {syncLoading ? "Synchronizing..." : "Same as Delivery Address"}
        </span>
      </button>
      {sameAsDelivery && (
        <span className="text-xs font-medium text-bgvariant-3">
          Synced with Primary Delivery Address
        </span>
      )}
    </div>
  );

  const renderAddressCards = (type, label) => {
    const addrList = addresses[type];
    const activeDeliveryId =
      selectedDeliveryId || addresses.delivery[0]?.id || null;

    if (!Array.isArray(addrList)) return null;

    if (addrList.length === 0) {
      return (
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-bgvariant-3 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-bgvariant-1"></span>
            {label}
          </h3>
          {type === "billing" && renderSameAsDeliveryControl()}
          <div className="bg-white rounded-xl p-6 border-2 border-dashed border-gray-200 text-center">
            <p className="text-gray-500 mb-3">No {label.toLowerCase()} saved</p>
            <button
              onClick={() => {
                setEditingType(type);
                setIsEditing(true);
              }}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-bgvariant-1 hover:text-bgvariant-3"
              disabled={loading || syncLoading}
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
        <h3 className="text-lg font-semibold text-bgvariant-3 mb-4 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-bgvariant-1"></span>
          {label}
        </h3>
        {type === "billing" && renderSameAsDeliveryControl()}
        <div className="grid gap-4">
          {addrList.map((addr, index) => {
            const isPrimaryDelivery =
              type === "delivery" && addr.id === activeDeliveryId;
            const isPrimaryBilling = type === "billing" && index === 0;
            const isSyncedBilling =
              type === "billing" && sameAsDelivery && addr.isSameAsDelivery;

            return (
              <div
                key={addr.id}
                onClick={
                  type === "delivery" && addresses.delivery.length > 1
                    ? () => handleSelectDeliveryAddress(addr.id)
                    : undefined
                }
                className={`bg-white rounded-xl p-5 border-l-4 ${
                  isPrimaryDelivery || isSyncedBilling
                    ? "border-bgvariant-1 ring-1 ring-bgvariant-1/20"
                    : "border-bgvariant-1"
                } shadow-sm hover:shadow-md transition-all ${
                  type === "delivery" && addresses.delivery.length > 1
                    ? "cursor-pointer"
                    : ""
                }`}
              >
                <div className="flex justify-between items-start mb-3 gap-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {label} {index + 1}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      {(isPrimaryDelivery || isPrimaryBilling) && (
                        <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Primary
                        </span>
                      )}
                      {isSyncedBilling && (
                        <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-bgvariant-1 text-white">
                          Same as Delivery
                        </span>
                      )}
                      {type === "delivery" &&
                        addresses.delivery.length > 1 &&
                        !isPrimaryDelivery && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectDeliveryAddress(addr.id);
                            }}
                            disabled={syncLoading || loading}
                            className="text-xs font-medium text-bgvariant-1 hover:text-bgvariant-3 underline disabled:opacity-50"
                          >
                            Set as Primary
                          </button>
                        )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(type, addr);
                      }}
                      className="p-1.5 rounded-full hover:bg-gray-100 text-gray-800 hover:text-gray-700"
                      aria-label="Edit address"
                      disabled={loading || syncLoading}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(addr.id);
                      }}
                      className="p-1.5 rounded-full hover:bg-gray-100 text-gray-800 hover:text-red-600"
                      aria-label="Delete address"
                      disabled={loading || syncLoading}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-800 space-y-1.5">
                  <p className="font-medium">{addr.fullName}</p>
                  <p>{addr.street}</p>
                  {addr.landMark && (
                    <p className="text-gray-700 italic">
                      Landmark: {addr.landMark}
                    </p>
                  )}
                  <p>
                    {addr.city}, {addr.state} {addr.zip}
                  </p>
                  <p>{addr.country}</p>
                  <p>Phone: {addr.phone}</p>
                  {addr.email && <p>Email: {addr.email}</p>}
                  <p>Type: {addr.addressType}</p>
                </div>
              </div>
            );
          })}
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
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={tempAddress.email}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 rounded-lg border ${errors.email ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all`}
                placeholder="customer@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Email Address *
              </label>
              <input
                type="email"
                name="confirmEmail"
                value={tempAddress.confirmEmail}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 rounded-lg border ${errors.confirmEmail ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all`}
                placeholder="customer@example.com"
              />
              {errors.confirmEmail && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmEmail}</p>
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