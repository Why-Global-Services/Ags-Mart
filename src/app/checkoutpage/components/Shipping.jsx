"use client";

import { useEffect, useState } from "react";
import {
  getAddress,
  postAddress,
  deleteAddress,
  editAddress,
  addAddressToCart,
} from "../../interceptor/interseptor";
import { showToast } from "@/app/utils/toast";
import { gaEvent } from "@/app/lib/ga";

const Shipping = ({ onAddressUpdate }) => {
  const [selectedDeliveryAddress, setSelectedDeliveryAddress] = useState(null);
  const [selectedBillingAddress, setSelectedBillingAddress] = useState(null);
  const [useSameAddress, setUseSameAddress] = useState(false);

  const [showDeliveryAddForm, setShowDeliveryAddForm] = useState(false);
  const [showBillingAddForm, setShowBillingAddForm] = useState(false);

  const [editingDeliveryId, setEditingDeliveryId] = useState(null);
  const [editingBillingId, setEditingBillingId] = useState(null);

  const [deliveryAddresses, setDeliveryAddresses] = useState([]);
  const [billingAddresses, setBillingAddresses] = useState([]);

  const [deliveryFormData, setDeliveryFormData] = useState({
    fullName: "",
    addressType: "HOME",
    phone: "",
    addressLine1: "",
    landMark: "",
    city: "",
    state: "",
    zipCode: "",
    checkoutAddress: "",
  });

  const [billingFormData, setBillingFormData] = useState({
    fullName: "",
    addressType: "WORK",
    phone: "",
    addressLine1: "",
    landMark: "",
    city: "",
    state: "",
    zipCode: "",
    checkoutAddress: "",
  });

  // ------------------ NOTIFY PARENT ------------------
  useEffect(() => {
    if (onAddressUpdate) {
      onAddressUpdate(
        selectedDeliveryAddress,
        selectedBillingAddress
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDeliveryAddress, selectedBillingAddress]);

  // ------------------ SYNC ADDRESS TO LOCAL STORAGE ------------------
  useEffect(() => {
    if (selectedDeliveryAddress) {
      localStorage.setItem(
        "selectedDeliveryAddress",
        selectedDeliveryAddress
      );
    }

    if (selectedBillingAddress) {
      localStorage.setItem(
        "selectedBillingAddress",
        selectedBillingAddress
      );
    }
  }, [selectedDeliveryAddress, selectedBillingAddress]);

  // ------------------ FETCH ADDRESSES ------------------
  const fetchAddresses = async () => {
    try {
      const res = await getAddress();

      console.log("Fetched Address Response:", res);

      const success = res?.success === true;
      const addressList = res?.address || [];

      if (!success || !Array.isArray(addressList)) {
        console.warn("No address data found");

        setDeliveryAddresses([]);
        setBillingAddresses([]);

        return;
      }

      const formatted = addressList.map((a) => ({
        _id: a?._id,
        fullName: a?.fullName || "",
        addressType: a?.addressType || "",
        phone: a?.phone || "",
        addressLine1: a?.addressLine1 || "",
        landMark: a?.landMark || "",
        city: a?.city || "",
        state: a?.state || "",
        zipCode: a?.zipCode || "",
        checkoutAddress: a?.checkoutAddress || "",
        country: a?.country || "India",
      }));

      const deliveryAddressesList = formatted.filter(
        (a) => a.checkoutAddress === "deliveryAddress"
      );

      const billingAddressesList = formatted.filter(
        (a) => a.checkoutAddress === "billingAddress"
      );

      setDeliveryAddresses(deliveryAddressesList);
      setBillingAddresses(billingAddressesList);

      // Load selected addresses from localStorage
      const savedDelivery = localStorage.getItem(
        "selectedDeliveryAddress"
      );

      const savedBilling = localStorage.getItem(
        "selectedBillingAddress"
      );

      if (savedDelivery) {
        setSelectedDeliveryAddress(savedDelivery);
      }

      if (savedBilling) {
        setSelectedBillingAddress(savedBilling);
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);

      setDeliveryAddresses([]);
      setBillingAddresses([]);
    }
  };

  // ------------------ SAME ADDRESS API ------------------
  const handleSameAddress = async (deliveryAddressId) => {
    try {
      const data = await addAddressToCart(
        deliveryAddressId,
        deliveryAddressId
      );

      console.log(data, "same-address");
    } catch (error) {
      console.error("Failed to sync same address:", error);
    }
  };

  // ------------------ SYNC ADDRESS PAYLOAD ------------------
  const syncAddressPayload = async (deliveryId, billingId) => {
    try {
      await addAddressToCart(deliveryId, billingId);
    } catch (error) {
      console.error("Failed to sync address:", error);
    }
  };

  // ------------------ INITIAL LOAD ------------------
  useEffect(() => {
    fetchAddresses();

    gaEvent("begin_checkout", {
      step: "shipping",
    });
  }, []);

  // ------------------ DELIVERY INPUT ------------------
  const handleDeliveryInputChange = (e) => {
    const { name, value } = e.target;

    setDeliveryFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ------------------ SAVE DELIVERY ADDRESS ------------------
  const handleDeliverySaveAddress = async (e) => {
    e.preventDefault();

    const formattedData = {
      fullName: deliveryFormData?.fullName || "",
      addressLine1: deliveryFormData?.addressLine1 || "",
      city: deliveryFormData?.city || "",
      landMark: deliveryFormData?.landMark || "",
      state: deliveryFormData?.state || "",
      zipCode: deliveryFormData?.zipCode || "",
      country: "India",
      phone: deliveryFormData?.phone || "",
      addressType: deliveryFormData?.addressType || "HOME",
      checkoutAddress: "deliveryAddress",
    };

    const res = editingDeliveryId
      ? await editAddress(editingDeliveryId, formattedData)
      : await postAddress(formattedData);

    console.log("Add/Edit Delivery Response:", res);

    const success = res?.success === true;

    if (success) {
      showToast.success(
        editingDeliveryId
          ? "Delivery address updated successfully"
          : "Delivery address added successfully"
      );

      await fetchAddresses();
      handleDeliveryCancel();
    } else {
      showToast.error(
        res?.message || "Failed to save address"
      );
    }
  };

  // ------------------ EDIT DELIVERY ------------------
  const handleDeliveryEdit = (address) => {
    setDeliveryFormData({
      ...address,
      landMark: address.landMark || "",
    });

    setEditingDeliveryId(address?._id);
    setShowDeliveryAddForm(true);
  };

  // ------------------ DELETE DELIVERY ------------------
  const handleDeliveryDelete = async (id) => {
    const res = await deleteAddress(id);

    if (
      res?.success === true ||
      res?.message?.includes("deleted")
    ) {
      showToast.success(
        "Delivery address deleted successfully"
      );

      await fetchAddresses();

      if (selectedDeliveryAddress === id) {
        setSelectedDeliveryAddress(null);

        localStorage.removeItem(
          "selectedDeliveryAddress"
        );
      }
    } else {
      showToast.error(
        res?.message || "Failed to delete address"
      );
    }
  };

  // ------------------ CANCEL DELIVERY ------------------
  const handleDeliveryCancel = () => {
    setShowDeliveryAddForm(false);
    setEditingDeliveryId(null);

    setDeliveryFormData({
      fullName: "",
      addressType: "HOME",
      phone: "",
      addressLine1: "",
      landMark: "",
      city: "",
      state: "",
      zipCode: "",
      checkoutAddress: "",
    });
  };

  // ------------------ SELECT DELIVERY ------------------
  const handleDeliverySelect = async (id) => {
    setSelectedDeliveryAddress(id);

    localStorage.setItem(
      "selectedDeliveryAddress",
      id
    );

    const billingId = useSameAddress
      ? id
      : selectedBillingAddress;

    await syncAddressPayload(id, billingId);

    if (useSameAddress) {
      setSelectedBillingAddress(id);

      localStorage.setItem(
        "selectedBillingAddress",
        id
      );
    }
  };

  // ------------------ SELECT BILLING ------------------
  const handleBillingSelect = async (id) => {
    setSelectedBillingAddress(id);

    localStorage.setItem(
      "selectedBillingAddress",
      id
    );

    await syncAddressPayload(
      selectedDeliveryAddress,
      id
    );
  };

  // ------------------ BILLING INPUT ------------------
  const handleBillingInputChange = (e) => {
    const { name, value } = e.target;

    setBillingFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ------------------ SAVE BILLING ADDRESS ------------------
  const handleBillingSaveAddress = async (e) => {
    e.preventDefault();

    const formattedData = {
      fullName: billingFormData?.fullName || "",
      addressLine1: billingFormData?.addressLine1 || "",
      city: billingFormData?.city || "",
      landMark: billingFormData?.landMark || "",
      state: billingFormData?.state || "",
      zipCode: billingFormData?.zipCode || "",
      country: "India",
      phone: billingFormData?.phone || "",
      addressType: billingFormData?.addressType || "WORK",
      checkoutAddress: "billingAddress",
    };

    const res = editingBillingId
      ? await editAddress(
          editingBillingId,
          formattedData
        )
      : await postAddress(formattedData);

    console.log("Add/Edit Billing Response:", res);

    const success = res?.success === true;

    if (success) {
      showToast.success(
        editingBillingId
          ? "Billing address updated successfully"
          : "Billing address added successfully"
      );

      await fetchAddresses();
      handleBillingCancel();
    } else {
      showToast.error(
        res?.message || "Failed to save address"
      );
    }
  };

  // ------------------ EDIT BILLING ------------------
  const handleBillingEdit = (address) => {
    setBillingFormData({
      ...address,
      landMark: address.landMark || "",
    });

    setEditingBillingId(address?._id);
    setShowBillingAddForm(true);
  };

  // ------------------ DELETE BILLING ------------------
  const handleBillingDelete = async (id) => {
    const res = await deleteAddress(id);

    if (
      res?.success === true ||
      res?.message?.includes("deleted")
    ) {
      showToast.success(
        "Billing address deleted successfully"
      );

      await fetchAddresses();

      if (selectedBillingAddress === id) {
        setSelectedBillingAddress(null);

        localStorage.removeItem(
          "selectedBillingAddress"
        );
      }
    } else {
      showToast.error(
        res?.message || "Failed to delete address"
      );
    }
  };

  // ------------------ CANCEL BILLING ------------------
  const handleBillingCancel = () => {
    setShowBillingAddForm(false);
    setEditingBillingId(null);

    setBillingFormData({
      fullName: "",
      addressType: "WORK",
      phone: "",
      addressLine1: "",
      landMark: "",
      city: "",
      state: "",
      zipCode: "",
      checkoutAddress: "",
    });
  };

  // ------------------ SAME AS DELIVERY TOGGLE ------------------
  const toggleSameAddress = () => {
    const newUseSame = !useSameAddress;

    setUseSameAddress(newUseSame);

    if (newUseSame) {
      // Delivery address selected -> copy to billing
      if (selectedDeliveryAddress) {
        setSelectedBillingAddress(
          selectedDeliveryAddress
        );

        localStorage.setItem(
          "selectedBillingAddress",
          selectedDeliveryAddress
        );

        handleSameAddress(
          selectedDeliveryAddress
        );
      }
    } else {
      // Toggle OFF -> clear billing selection
      setSelectedBillingAddress(null);

      localStorage.removeItem(
        "selectedBillingAddress"
      );
    }
  };

  // ------------------ UI ------------------
  return (
    <div className="max-w-2xl mx-auto mb-5 p-4 sm:p-6 bg-white rounded-xl shadow-sm">

      {/* DELIVERY ADDRESS */}
      <AddressSection
        title="Delivery Address"
        addresses={deliveryAddresses}
        selectedId={selectedDeliveryAddress}
        onSelect={handleDeliverySelect}
        showForm={showDeliveryAddForm}
        setShowForm={setShowDeliveryAddForm}
        formData={deliveryFormData}
        handleInputChange={handleDeliveryInputChange}
        handleSave={handleDeliverySaveAddress}
        handleCancel={handleDeliveryCancel}
        handleEdit={handleDeliveryEdit}
        handleDelete={handleDeliveryDelete}
      />

      {/* BILLING ADDRESS */}
      <section>
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">
          Billing Address
        </h2>

        {/* SAME AS DELIVERY TOGGLE */}
        <div className="flex items-center mb-4">
          <label
            htmlFor="same-as-delivery"
            className="flex items-center cursor-pointer select-none"
          >
            <input
              type="checkbox"
              id="same-as-delivery"
              name="sameAsDelivery"
              checked={useSameAddress}
              onChange={toggleSameAddress}
              className="sr-only"
            />

            {/* Toggle Track */}
            <div
              className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${
                useSameAddress
                  ? "bg-emerald-800"
                  : "bg-gray-300"
              }`}
            >
              {/* Toggle Circle */}
              <div
                className={`absolute top-0.5 left-0.5 h-4 w-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                  useSameAddress
                    ? "translate-x-5"
                    : "translate-x-0"
                }`}
              />
            </div>

            <span className="ml-2 text-sm text-gray-700">
              Same as delivery address
            </span>
          </label>
        </div>

        {/* SAME ADDRESS CONTENT */}
        {useSameAddress ? (
          <div className="mt-4">
            {(() => {
              const selectedDel =
                deliveryAddresses.find(
                  (addr) =>
                    addr._id === selectedDeliveryAddress
                );

              if (!selectedDel) {
                return (
                  <p className="text-gray-500">
                    No delivery address selected.
                  </p>
                );
              }

              return (
                <>
                  <p className="text-sm text-gray-600 mb-2">
                    Using the same address as delivery:
                  </p>

                  <div className="border-2 border-emerald-800 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-gray-900">
                          {selectedDel.fullName ||
                            "Unnamed"}
                        </p>

                        <p className="text-gray-600 text-sm">
                          {selectedDel.phone ||
                            "No phone"}
                        </p>

                        <p className="text-gray-600 text-sm">
                          {selectedDel.addressLine1 ||
                            "N/A"}
                          ,{" "}
                          {selectedDel.city || ""}
                          ,{" "}
                          {selectedDel.state || ""} -{" "}
                          {selectedDel.zipCode || ""}
                        </p>

                        {selectedDel.landMark && (
                          <p className="text-gray-500 text-sm italic">
                            Landmark:{" "}
                            {selectedDel.landMark}
                          </p>
                        )}
                      </div>

                      <div>
                        <span className="text-sm text-emerald-600">
                          Same as delivery
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        ) : (
          <AddressSection
            title=""
            addresses={billingAddresses}
            selectedId={selectedBillingAddress}
            onSelect={handleBillingSelect}
            showForm={showBillingAddForm}
            setShowForm={setShowBillingAddForm}
            formData={billingFormData}
            handleInputChange={handleBillingInputChange}
            handleSave={handleBillingSaveAddress}
            handleCancel={handleBillingCancel}
            handleEdit={handleBillingEdit}
            handleDelete={handleBillingDelete}
          />
        )}
      </section>
    </div>
  );
};

// ------------------ ADDRESS SECTION ------------------
const AddressSection = ({
  title,
  addresses,
  selectedId,
  onSelect,
  showForm,
  setShowForm,
  formData,
  handleInputChange,
  handleSave,
  handleCancel,
  handleEdit,
  handleDelete,
}) => (
  <section className="mb-8">

    {title && (
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">
        {title}
      </h2>
    )}

    {addresses?.length === 0 ? (
      <p className="text-gray-500">
        No addresses found.
      </p>
    ) : (
      <div className="space-y-3 mb-4">
        {addresses?.map((address) => (
          <div
            key={address?._id}
            onClick={() =>
              onSelect(address?._id)
            }
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              selectedId === address?._id
                ? "border-emerald-800 bg-gray-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex justify-between items-start">

              <div>
                <p className="font-bold text-gray-900">
                  {address?.fullName ||
                    "Unnamed"}
                </p>

                <p className="text-gray-600 text-sm">
                  {address?.phone ||
                    "No phone"}
                </p>

                <p className="text-gray-600 text-sm">
                  {address?.addressLine1 ||
                    "N/A"}
                  ,{" "}
                  {address?.city || ""}
                  ,{" "}
                  {address?.state || ""} -{" "}
                  {address?.zipCode || ""}
                </p>

                {address?.landMark && (
                  <p className="text-gray-500 text-xs italic">
                    Landmark:{" "}
                    {address.landMark}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(address);
                  }}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(
                      address?._id
                    );
                  }}
                  className="text-red-600 hover:underline text-sm"
                >
                  Delete
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>
    )}

    {!showForm && (
      <button
        type="button"
        onClick={() =>
          setShowForm(true)
        }
        className="flex items-center gap-2 text-emerald-800 hover:text-emerald-900"
      >
        <span className="h-7 w-7 flex items-center justify-center rounded-full bg-gray-100">
          +
        </span>

        <span>
          Add a new address
        </span>
      </button>
    )}

    {showForm && (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
        <AddressForm
          formData={formData}
          handleInputChange={handleInputChange}
          handleSave={handleSave}
          handleCancel={handleCancel}
        />
      </div>
    )}
  </section>
);

// ------------------ ADDRESS FORM ------------------
const AddressForm = ({
  formData,
  handleInputChange,
  handleSave,
  handleCancel,
}) => (
  <form
    onSubmit={handleSave}
    className="space-y-3"
  >
    {[
      "fullName",
      "phone",
      "addressLine1",
      "landMark",
      "city",
      "state",
      "zipCode",
    ].map((field) => (
      <div key={field}>

        <label
          htmlFor={`address-${field}`}
          className="block text-sm text-gray-700 mb-1"
        >
          {field === "addressLine1"
            ? "Street Address *"
            : field === "landMark"
            ? "Landmark"
            : field
                .charAt(0)
                .toUpperCase() +
              field
                .slice(1)
                .replace(
                  /([A-Z])/g,
                  " $1"
                ) +
              " *"}
        </label>

        <input
          type={
            field === "phone"
              ? "tel"
              : "text"
          }
          id={`address-${field}`}
          name={field}
          value={
            formData?.[field] || ""
          }
          onChange={
            handleInputChange
          }
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-600"
          required
        />
      </div>
    ))}

    <div className="flex justify-end gap-2 pt-2">

      <button
        type="button"
        onClick={handleCancel}
        className="border border-gray-400 rounded-lg px-4 py-2 hover:bg-gray-100"
      >
        Cancel
      </button>

      <button
        type="submit"
        className="bg-emerald-800 text-white rounded-lg px-4 py-2 hover:bg-emerald-900"
      >
        Save Address
      </button>

    </div>
  </form>
);

export default Shipping;