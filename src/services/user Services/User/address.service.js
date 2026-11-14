const { User } = require("../../../models/users.model");
const ApiError = require("../../../utils/apiError");
const httpStatus = require("http-status");
const {
  syncBillingWithDelivery,
  cleanupAddressReferencesOnDelete,
} = require("../myAccounts/address");



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
    email,
    confirmEmail,
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

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  let validatedEmail = null;

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

    validatedEmail = rawEmail.toLowerCase();
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
    email: validatedEmail || undefined,
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

  const user = await User.findById(userId).select(
    "address sameAsDelivery primaryDeliveryAddressId"
  );

  return {
    success: true,
    message: "Fetched Address",
    address: user?.address || [],
    sameAsDelivery: Boolean(user?.sameAsDelivery),
    primaryDeliveryAddressId: user?.primaryDeliveryAddressId || null,
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
    email,
    confirmEmail,
    addressType,
    checkoutAddress,
  } = req.body;

  if (!userId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No userId provided");
  }

  if (!_id) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No address ID provided");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  let validatedEmail = undefined;

  if (email !== undefined || confirmEmail !== undefined) {
    const rawEmail = String(email || "").trim();
    const rawConfirm = String(confirmEmail || "").trim();

    if (rawEmail || rawConfirm) {
      if (!rawEmail || !rawConfirm) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Both email and confirm email are required");
      }

      if (!emailRegex.test(rawEmail)) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid email address format");
      }

      if (rawEmail.toLowerCase() !== rawConfirm.toLowerCase()) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Email and confirm email do not match");
      }

      validatedEmail = rawEmail.toLowerCase();
    }
  }

  let userDetails = await User.findById(userId);
  if (!userDetails) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  let updatedTarget = null;
  userDetails.address = userDetails.address.map((item) => {
    if (item._id.toString() == _id.toString()) {
      const plain = item.toObject ? item.toObject() : item;
      const merged = {
        ...plain,
        fullName,
        addressLine1,
        landMark: req.body.landMark !== undefined ? req.body.landMark : plain.landMark,
        city,
        state,
        zipCode,
        country,
        phone,
        email: validatedEmail !== undefined ? validatedEmail : plain.email,
        addressType,
        checkoutAddress,
      };
      if (plain.checkoutAddress === "billingAddress" && plain.isSameAsDelivery) {
        merged.isSameAsDelivery = false;
        merged.sourceDeliveryAddressId = null;
        userDetails.sameAsDelivery = false;
      }
      updatedTarget = merged;
      return merged;
    }

    return item;
  });

  if (
    updatedTarget &&
    updatedTarget.checkoutAddress === "deliveryAddress" &&
    userDetails.sameAsDelivery
  ) {
    const isSyncedDelivery =
      userDetails.primaryDeliveryAddressId?.toString() === _id.toString() ||
      userDetails.address.some(
        (addr) =>
          addr &&
          addr.checkoutAddress === "billingAddress" &&
          addr.isSameAsDelivery &&
          addr.sourceDeliveryAddressId?.toString() === _id.toString()
      );
    if (isSyncedDelivery) {
      syncBillingWithDelivery(userDetails, updatedTarget);
    }
  }

  await userDetails.save();
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
  if (!updatedAddress) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const targetAddr = updatedAddress.address.find(
    (item) => item._id.toString() === id.toString()
  );

  const data = updatedAddress.address.filter(
    (item) => item._id.toString() !== id.toString()
  );

  updatedAddress.address = data;
  if (targetAddr) {
    cleanupAddressReferencesOnDelete(updatedAddress, targetAddr);
  }

  await updatedAddress.save();

  return { success: true, message: "The address deleted", updatedAddress };
};


module.exports = {
  addAddress,
  getAddress,
  updateAddress,
  deleteAddress
}