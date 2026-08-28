const { User } = require("../../../models/users.model");
const { v4 } = require("uuid");

const addAddress = async (req, res) => {
  const { address } = req.body;
  const userId = req.user._id;

  console.log(req.body,"address");

  const newAddress = {
    ...address,
  };

  console.log("newAddress", newAddress);

  const user = await User.findByIdAndUpdate(
    userId,
    { $push: { address: newAddress } },
    { new: true }
  );

  console.log("user", user);

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
  // console.log("user", user);

  if (!Array.isArray(user.address)) {
    // console.error("Address field is not an array:", user.address);
    return res.status(500).json({ error: "User address is malformed" });
  }

  // console.log("Before mapping, address array:", user.address);

  const updatedAddresses = user.address.map((addr, index) => {
    if (!addr) {
      console.warn(`Address at index ${index} is invalid:`, addr);
      return addr;
    }

    // console.log(`Address at index ${index}:`, addr);
    // console.log("Comparing:", addr._id?.toString(), "with", addressId);

    return addr._id?.toString() === addressId
      ? { ...(addr.toObject?.() ?? addr), ...updatedData }
      : addr;
  });

  user.address = updatedAddresses;
  await user.save();

  return {
    success:true,
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
