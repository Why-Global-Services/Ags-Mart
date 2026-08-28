const { User } = require("../../../models/users.model");
const ApiError = require("../../../utils/apiError");
const httpStatus = require("http-status");



// const addAddress = async (req, res) => {
//   const { formattedData } = req.body;
//   console.log(formattedData, "data");
  
//   const {
//     fullName,
//     addressLine1,
//     city,
//     state,
//     zipCode,
//     country,
//     phone,
//     addressType,
//     checkoutAddress,
//   } = formattedData;
//   const userId = req.user._id;

//   if (!userId) {
//     throw new ApiError(httpStatus.BAD_REQUEST, "No userId provided");
//   }

//   if (
//     !fullName ||
//     !addressLine1 ||
//     !city ||
//     !state ||
//     !zipCode ||
//     !country ||
//     !phone
//   ) {
//     throw new ApiError(httpStatus.BAD_REQUEST, "Provide all Details");
//   }

//   let userDetails = await User.findById(userId);

//   if (userDetails.address.length == 0) {
//     const newAddress = await User.findByIdAndUpdate(userId, {
//       address: { ...req.body, id: 1 },
//     });

//     return { success: true, message: "New Address added", newAddress };
//   }

//   const newAddress = {
//     fullName,
//     addressLine1,
//     city,
//     state,
//     zipCode,
//     country,
//     phone,
//     addressType: addressType || "home",
//     checkoutAddress: checkoutAddress || "billingAddress",
//   };
//   userDetails.address.push(newAddress);
//   await userDetails.save();

//   return { success: true, message: "New Address added", userDetails };
// };

const addAddress = async (req, res) => {
  const { formattedData } = req.body;
  const {
    fullName,
    addressLine1,
    landMark,
    city,
    state,
    zipCode,
    country,
    phone,
    addressType,
    checkoutAddress,
  } = formattedData || {};

  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No userId provided");
  }

  if (
    !fullName ||
    !addressLine1 ||
    !landMark ||
    !city ||
    !state ||
    !zipCode ||
    !country ||
    !phone
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Provide all Details");
  }

  let userDetails = await User.findById(userId);
  if (!userDetails) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const newAddress = {
    fullName,
    addressLine1,
    landMark,
    city,
    state,
    zipCode,
    country,
    phone,
    addressType: addressType || "home",
    checkoutAddress: checkoutAddress || "billingAddress",
  };

  // ✅ Always push the new address — even if it's the first one
  userDetails.address.push(newAddress);
  await userDetails.save();

  return {
    success: true,
    message: "New Address added",
    address: userDetails.address, // Return updated list directly
  };
};

const getAddress = async (req, res) => {
  const userId = req.user._id;

  if (!userId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No userId provided");
  }

  const user = await User.findById(userId).select("address");

  return {
    success: true,
    message: "Fetched Address",
    address: user?.address || [],
  };
};


const updateAddress = async (req, res) => {
  const userId = req.user._id;
  const {
    _id,
    fullName,
    addressLine1,
    city,
    state,
    zipCode,
    country,
    phone,
    addressType,
    checkoutAddress,
  } = req.body;

  if (!userId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No userId provided");
  }

  if (!_id) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No address ID provided");
  }

  let userDetails = await User.findById(userId);

  userDetails.address = userDetails.address.map((item) => {
    if (item._id.toString() == _id.toString()) {
      item = {
        fullName,
        addressLine1,
        city,
        state,
        zipCode,
        country,
        phone,
        addressType,
        checkoutAddress,
      };
      return item;
    }

    return item;
  });

  userDetails.save();
  return {
    success: true,
    message: "Address updated Successfully",
    data: userDetails,
  };
};

const deleteAddress = async (req, res) => {
  const userId = req.user._id;
  const { id } = req.body;

  if (!userId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No userId provided");
  }

  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No address ID provided");
  }

  let updatedAddress = await User.findById(userId);

  const data = updatedAddress.address.filter(
    (item) => item._id.toString() !== id.toString()
  );
  console.log(data, "thsi is filter data");

  updatedAddress.address = data;

  await updatedAddress.save();

  return { success: true, message: "The address deleted", updatedAddress };
};


module.exports = {
  addAddress,
  getAddress,
  updateAddress,
  deleteAddress
}