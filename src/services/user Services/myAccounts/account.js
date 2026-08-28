const { User } = require("../../../models/users.model");

const getAccountDetails = async (req) => {
  const userId = req.user._id;
  const findUser = await User.findOne({ _id: userId }).select("-password");
  return {
    success: true,
    message: "Profile details fetched successfully",
    data: findUser,
  };
};

const editDetails = async (req) => {
  const userId = req.user._id;
  const { name, email, phoneNumber } = req.body;

  const user = await User.findById({ _id: userId });
  if (!user) {
    return {
      success: false,
      message: "User not found",
    };
  }

  if (name) user.name = name;
  if (email) user.email = email;
  if (phoneNumber) user.phoneNumber = phoneNumber;

  const updatedUser = await user.save();

  return {
    success: true,
    message: "Profile updated successfully",
    data: updatedUser,
  };
};

module.exports = {
  getAccountDetails,
  editDetails,
};
