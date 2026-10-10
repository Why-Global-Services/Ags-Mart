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

const addAddress = async (req, res) => {
  const { address } = req.body;
  const userId = req.user._id;

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

  return { success: true, message: "Address added successfully", user };
};

const getAddress = async (req) => {
  const userId = req.user._id;
  const findAddress = await User.findOne({ _id: userId });
  return {
    message: "Address get successfully",
    success: true,
    data: findAddress,
  };
};

const editAddress = async (req, res) => {
  const { addressId } = req.params;
  const userId = req.user._id;
  const updatedData = req.body;

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  if (!Array.isArray(user.address)) {
    return res.status(500).json({ error: "User address is malformed" });
  }

  const validatedEmail = validateAddressEmail(updatedData);
  const dataToApply = { ...updatedData };
  if (validatedEmail !== undefined) {
    dataToApply.email = validatedEmail;
  }
  delete dataToApply.confirmEmail;

  const updatedAddresses = user.address.map((addr, index) => {
    if (!addr) {
      console.warn(`Address at index ${index} is invalid:`, addr);
      return addr;
    }

    return addr._id?.toString() === addressId
      ? { ...(addr.toObject?.() ?? addr), ...dataToApply }
      : addr;
  });

  user.address = updatedAddresses;
  await user.save();

  return {
    success: true,
    message: "Address updated successfully",
    address: user.address,
  };
};

const deleteAddress = async (req, res) => {
  const { addressId } = req.params;
  const userId = req.user._id;

  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { address: { _id: addressId } } },
    { new: true }
  );

  return { success: true, message: "Address deleted successfully", user };
};

module.exports = {
  addAddress,
  getAddress,
  editAddress,
  deleteAddress,
};
