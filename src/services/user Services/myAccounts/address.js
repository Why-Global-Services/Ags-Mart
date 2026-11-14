const { User } = require("../../../models/users.model");
const { v4 } = require("uuid");
const ApiError = require("../../../utils/apiError");
const httpStatus = require("http-status");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateAddressEmail = (addressData) => {
  const { email, confirmEmail } = addressData || {};
  if (email !== undefined || confirmEmail !== undefined) {
    const rawEmail = String(email || "").trim();
    const rawConfirm = String(confirmEmail || "").trim();

    if (!rawEmail || !rawConfirm) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Both email and confirm email are required");
    }

    if (!emailRegex.test(rawEmail)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid email address format");
    }

    if (rawEmail.toLowerCase() !== rawConfirm.toLowerCase()) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Email and confirm email do not match");
    }

    return rawEmail.toLowerCase();
  }
  return undefined;
};

const copyDeliveryToBillingFields = (deliveryAddr) => ({
  fullName: deliveryAddr.fullName || "",
  addressLine1: deliveryAddr.addressLine1 || "",
  landMark: deliveryAddr.landMark || "",
  city: deliveryAddr.city || "",
  state: deliveryAddr.state || "",
  zipCode: deliveryAddr.zipCode || "",
  country: deliveryAddr.country || "India",
  phone: deliveryAddr.phone || "",
  email: deliveryAddr.email || "",
  addressType: deliveryAddr.addressType || "home",
  checkoutAddress: "billingAddress",
  isSameAsDelivery: true,
  sourceDeliveryAddressId: deliveryAddr._id?.toString() || null,
});

const syncBillingWithDelivery = (user, deliveryAddr) => {
  if (!user || !Array.isArray(user.address) || !deliveryAddr) return;

  const copiedFields = copyDeliveryToBillingFields(deliveryAddr);
  const existingIndex = user.address.findIndex(
    (addr) =>
      addr &&
      addr.checkoutAddress === "billingAddress" &&
      (addr.isSameAsDelivery === true || Boolean(addr.sourceDeliveryAddressId))
  );

  if (existingIndex !== -1) {
    const existing = user.address[existingIndex];
    const plainExisting = existing.toObject ? existing.toObject() : existing;
    user.address[existingIndex] = {
      ...plainExisting,
      ...copiedFields,
      _id: plainExisting._id,
    };
  } else {
    user.address.unshift(copiedFields);
  }
};

const cleanupAddressReferencesOnDelete = (user, deletedAddr) => {
  if (!user || !deletedAddr) return;
  const deletedId = deletedAddr._id?.toString();
  if (!deletedId) return;

  if (deletedAddr.checkoutAddress === "deliveryAddress") {
    if (user.primaryDeliveryAddressId?.toString() === deletedId) {
      user.primaryDeliveryAddressId = null;
    }

    let hadLinkedBilling = false;
    user.address = user.address.map((addr) => {
      if (
        addr &&
        addr.checkoutAddress === "billingAddress" &&
        addr.sourceDeliveryAddressId?.toString() === deletedId
      ) {
        hadLinkedBilling = true;
        const plain = addr.toObject ? addr.toObject() : addr;
        return {
          ...plain,
          isSameAsDelivery: false,
          sourceDeliveryAddressId: null,
        };
      }
      return addr;
    });

    if (hadLinkedBilling || user.sameAsDelivery) {
      user.sameAsDelivery = false;
    }
  } else if (
    deletedAddr.checkoutAddress === "billingAddress" &&
    deletedAddr.isSameAsDelivery
  ) {
    user.sameAsDelivery = false;
  }
};

const addAddress = async (req, res) => {
  const { address } = req.body;
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User authentication required");
  }

  const validatedEmail = validateAddressEmail(address);

  const newAddress = {
    ...address,
    ...(validatedEmail ? { email: validatedEmail } : {}),
  };
  delete newAddress.confirmEmail;

  const user = await User.findByIdAndUpdate(
    userId,
    { $push: { address: newAddress } },
    { new: true }
  );

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  return {
    success: true,
    message: "Address added successfully",
    user,
    address: user.address,
    sameAsDelivery: Boolean(user.sameAsDelivery),
    primaryDeliveryAddressId: user.primaryDeliveryAddressId || null,
  };
};

const getAddress = async (req) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User authentication required");
  }

  const findAddress = await User.findOne({ _id: userId });
  return {
    message: "Address get successfully",
    success: true,
    data: findAddress,
    address: findAddress?.address || [],
    sameAsDelivery: Boolean(findAddress?.sameAsDelivery),
    primaryDeliveryAddressId: findAddress?.primaryDeliveryAddressId || null,
  };
};

const editAddress = async (req, res) => {
  const { addressId } = req.params;
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User authentication required");
  }
  const updatedData = req.body;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (!Array.isArray(user.address)) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "User address is malformed");
  }

  const targetExists = user.address.some(
    (addr) => addr && addr._id?.toString() === addressId
  );
  if (!targetExists) {
    throw new ApiError(httpStatus.NOT_FOUND, "Address not found");
  }

  const validatedEmail = validateAddressEmail(updatedData);
  const dataToApply = { ...updatedData };
  if (validatedEmail !== undefined) {
    dataToApply.email = validatedEmail;
  }
  delete dataToApply.confirmEmail;

  let updatedTarget = null;
  const updatedAddresses = user.address.map((addr, index) => {
    if (!addr) {
      console.warn(`Address at index ${index} is invalid:`, addr);
      return addr;
    }

    if (addr._id?.toString() === addressId) {
      const plain = addr.toObject ? addr.toObject() : addr;
      const merged = { ...plain, ...dataToApply };
      if (plain.checkoutAddress === "billingAddress" && plain.isSameAsDelivery) {
        merged.isSameAsDelivery = false;
        merged.sourceDeliveryAddressId = null;
        user.sameAsDelivery = false;
      }
      updatedTarget = merged;
      return merged;
    }

    return addr;
  });

  user.address = updatedAddresses;

  if (
    updatedTarget &&
    updatedTarget.checkoutAddress === "deliveryAddress" &&
    user.sameAsDelivery
  ) {
    const isSyncedDelivery =
      user.primaryDeliveryAddressId?.toString() === addressId ||
      user.address.some(
        (addr) =>
          addr &&
          addr.checkoutAddress === "billingAddress" &&
          addr.isSameAsDelivery &&
          addr.sourceDeliveryAddressId?.toString() === addressId
      );

    if (isSyncedDelivery) {
      syncBillingWithDelivery(user, updatedTarget);
    }
  }

  await user.save();

  return {
    success: true,
    message: "Address updated successfully",
    address: user.address,
    sameAsDelivery: Boolean(user.sameAsDelivery),
    primaryDeliveryAddressId: user.primaryDeliveryAddressId || null,
  };
};

const deleteAddress = async (req, res) => {
  const { addressId } = req.params;
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User authentication required");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const targetAddr = (user.address || []).find(
    (addr) => addr && addr._id?.toString() === addressId
  );
  if (!targetAddr) {
    throw new ApiError(httpStatus.NOT_FOUND, "Address not found");
  }

  user.address = user.address.filter(
    (addr) => addr && addr._id?.toString() !== addressId
  );

  cleanupAddressReferencesOnDelete(user, targetAddr);
  await user.save();

  return {
    success: true,
    message: "Address deleted successfully",
    user,
    address: user.address,
    sameAsDelivery: Boolean(user.sameAsDelivery),
    primaryDeliveryAddressId: user.primaryDeliveryAddressId || null,
  };
};

const syncSameAsDelivery = async (req) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User authentication required");
  }

  const { enabled = true, deliveryAddressId } = req.body || {};

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (!Array.isArray(user.address)) {
    user.address = [];
  }

  if (!enabled) {
    user.sameAsDelivery = false;
    user.address = user.address.map((addr) => {
      if (addr && addr.checkoutAddress === "billingAddress" && addr.isSameAsDelivery) {
        const plain = addr.toObject ? addr.toObject() : addr;
        return { ...plain, isSameAsDelivery: false };
      }
      return addr;
    });
    await user.save();

    return {
      success: true,
      message: "Same as delivery address disabled",
      address: user.address,
      sameAsDelivery: false,
      primaryDeliveryAddressId: user.primaryDeliveryAddressId || null,
    };
  }

  const deliveryAddresses = user.address.filter(
    (addr) => addr && addr.checkoutAddress === "deliveryAddress"
  );

  if (deliveryAddresses.length === 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "No delivery address available. Please add a delivery address first."
    );
  }

  let targetDelivery = null;
  if (deliveryAddressId) {
    targetDelivery = deliveryAddresses.find(
      (addr) => addr._id?.toString() === deliveryAddressId.toString()
    );
    if (!targetDelivery) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Selected delivery address not found"
      );
    }
  } else if (user.primaryDeliveryAddressId) {
    targetDelivery =
      deliveryAddresses.find(
        (addr) =>
          addr._id?.toString() === user.primaryDeliveryAddressId.toString()
      ) || deliveryAddresses[0];
  } else {
    targetDelivery = deliveryAddresses[0];
  }

  user.primaryDeliveryAddressId = targetDelivery._id.toString();
  user.sameAsDelivery = true;
  syncBillingWithDelivery(user, targetDelivery);

  await user.save();

  return {
    success: true,
    message: "Billing address synchronized with delivery address",
    address: user.address,
    sameAsDelivery: true,
    primaryDeliveryAddressId: user.primaryDeliveryAddressId,
  };
};

module.exports = {
  addAddress,
  getAddress,
  editAddress,
  deleteAddress,
  syncSameAsDelivery,
  syncBillingWithDelivery,
  cleanupAddressReferencesOnDelete,
};
