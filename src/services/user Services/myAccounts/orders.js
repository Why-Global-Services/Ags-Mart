const { orderDetailsModel } = require("../../../models/orders.model");
const ApiError = require("../../../utils/apiError");
const { uploadToCloud } = require("../../../utils/uploadFileToS3");
const httpStatus = require('http-status');

const getOrder = async (req, res) => {
  const userId = req.user._id;

  const fetchedOrders = await orderDetailsModel.aggregate([
    {
      $match: {
        userId,
        orderStatus: { $ne: "Pending" },
      },
    },
    {
      $unwind: "$orderDetails",
    },
    {
      $unwind: "$orderDetails.products",
    },
    {
      $lookup: {
        from: "product",
        localField: "orderDetails.products.productId",
        foreignField: "_id",
        as: "productInfo",
      },
    },
    {
      $unwind: {
        path: "$productInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        "orderDetails.products.productDetails": "$productInfo",
      },
    },
    {
      $group: {
        _id: "$_id",
        orderId: { $first: "$orderId" },
        userId: { $first: "$userId" },
        totalPrice: { $first: "$totalPrice" },
        orderStatus: { $first: "$orderStatus" },
        returnStatus: { $first: "$returnStatus" },
        paymentStatus: { $first: "$paymentStatus" },
        paymentMethod: { $first: "$paymentMethod" },
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
        reason: { $first: "$reason" },
        returnImage: { $first: "$returnImage" },
        orderDetails: { $push: "$orderDetails" },
      },
    },
  ]);

  if (fetchedOrders.length == 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No orders found");
  }

  return { success: true, message: "Fetched orders", data: fetchedOrders };
};

const getSingleOrders = async (req) => {
  const { _id } = req.params;
  const userId = req.user._id;

  console.log("user", userId);

  if (!userId) {
    throw new ApiError(401, "UnAuthorized User");
  }

  console.log("_id", _id);

  const findOrder = await orderDetailsModel.aggregate([
    {
      $match: { userId: userId, orderId: _id },
    },
    {
      $unwind: "$orderDetails",
    },
    {
      $unwind: "$orderDetails.products",
    },
    {
      $lookup: {
        from: "product",
        localField: "orderDetails.products.productId",
        foreignField: "_id",
        as: "productInfo",
      },
    },
    {
      $unwind: {
        path: "$productInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        "orderDetails.products.productDetails": "$productInfo",
      },
    },
    {
      $group: {
        _id: "$_id",
        orderId: { $first: "$orderId" },
        userId: { $first: "$userId" },
        totalPrice: { $first: "$totalPrice" },
        orderStatus: { $first: "$orderStatus" },
        returnStatus: { $first: "$returnStatus" },
        paymentStatus: { $first: "$paymentStatus" },
        paymentMethod: { $first: "$paymentMethod" },
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
        reason: { $first: "$reason" },
        returnImage: { $first: "$returnImage" },
        orderDetails: { $push: "$orderDetails" },
      },
    },
  ]);

  console.log("orders", findOrder);

  if (findOrder.length === 0) {
    throw new ApiError(404, "No order is found");
  }

  return {
    success: true,
    message: "Product find Successfully",
    data: findOrder,
  };
};



// const editOrders = async (req) => {
  
//   const { _id } = req.params;

//   const userId = req.user._id;
//   const { productId, variantId, status, reason } = req.body;

//   const image = req.file;

//   const findOrder = await orderDetailsModel.findOne({
//     userId,
//     orderId: _id,
//   });

//   if (!findOrder) {
//     throw new ApiError(404, "Order not found");
//   }

//   let updateFields = { orderStatus: status, reason };

//  if (status === "Return Request") {
//   if (!productId) {
//     throw new ApiError(400, "ProductId is required for return");
//   }

//   let imageURL = null;

//   if (req.file) {
//     const key = `return/${Date.now()}_${req.file.originalname}`;
//     imageURL = await uploadToCloud(req.file, key);
//   }

//   await orderDetailsModel.updateOne(
//     {
//       orderId: _id,
//       "orderDetails.products.productId": productId,
//     },
//     {
//       $set: {
//         "orderDetails.$[].products.$[p].orderStatus": "Return Request",
//         "orderDetails.$[].products.$[p].returnReason": reason,
//         "orderDetails.$[].products.$[p].returnImage": imageURL,
//       },
//     },
//     {
//       arrayFilters: [{ "p.productId": productId }],
//     }
//   );

//   return {
//     success: true,
//     message: "Product return request submitted",
//   };
// }


//   const updateOrder = await orderDetailsModel.findOneAndUpdate(
//     { userId, orderId: _id },
//     updateFields,
//     { new: true }
//   );

//   return {
//     success: true,
//     message: "Order status updated successfully",
//     data: updateOrder,
//   };
// };
// orders.controller.js - Update editOrders function
const editOrders = async (req) => {
  const { _id } = req.params;
  const userId = req.user._id;
  const { productId, variantId, status, reason } = req.body;
  const image = req.file;

  // Find order
  const findOrder = await orderDetailsModel.findOne({
    userId,
    orderId: _id,
  });

  if (!findOrder) {
    throw new ApiError(404, "Order not found");
  }

  // ✅ Handle product-specific return request
  if (status === "Return Request" && productId) {
    let imageURL = null;
    
    if (req.file) {
      const key = `return/${Date.now()}_${req.file.originalname}`;
      imageURL = await uploadToCloud(req.file, key);
    }

    if (!reason) {
      throw new ApiError(400, "Return reason is required");
    }

    // Validate order structure
    if (!findOrder.orderDetails?.[0]?.products?.length) {
      throw new ApiError(400, "Order has no products");
    }

    const products = findOrder.orderDetails[0].products;

    // Find product by productId and variantId (if applicable)
    const productIndex = products.findIndex((p) => {
      const productMatch = p.productId.toString() === productId.toString();
      
      if (variantId) {
        return productMatch && p.variantId?.toString() === variantId.toString();
      }
      
      return productMatch;
    });

    if (productIndex === -1) {
      throw new ApiError(404, "Product not found in order");
    }

    const product = products[productIndex];

    // Validate product status
    if (product.orderStatus !== "Delivered") {
      throw new ApiError(400, "Only delivered products can be returned");
    }

    if (product.returnStatus && product.returnStatus !== "Rejected") {
      throw new ApiError(400, "Return request already submitted for this product");
    }

    // Update product return information
    products[productIndex].orderStatus = "Return Request";
    products[productIndex].returnStatus = "In Process";
    products[productIndex].returnReason = reason;
    products[productIndex].returnImage = imageURL;

    // ✅ Recalculate order-level status
    const hasReturnRequest = products.some(p => p.orderStatus === "Return Request");
    const allReturned = products.every(p => p.orderStatus === "Returned");
    const someReturned = products.some(p => p.orderStatus === "Returned");

    if (allReturned) {
      findOrder.orderStatus = "Returned";
      findOrder.returnStatus = "Approved";
    } else if (someReturned || hasReturnRequest) {
      findOrder.orderStatus = hasReturnRequest ? "Return Request" : "Partial";
      findOrder.returnStatus = "In Process";
    }

    await findOrder.save();

    return {
      success: true,
      message: "Return request submitted successfully",
      data: {
        orderId: findOrder.orderId,
        productId: product.productId,
        returnStatus: product.returnStatus
      }
    };
  }

  // ✅ Handle order-level cancellation (if needed)
  if (status === "Cancelled") {
    if (findOrder.orderStatus !== "Pending" && findOrder.orderStatus !== "Ordered") {
      throw new ApiError(400, "Cannot cancel order at current status");
    }

    findOrder.orderStatus = "Cancelled";
    findOrder.reason = reason;

    // Cancel all products
    findOrder.orderDetails[0].products.forEach(product => {
      product.orderStatus = "Cancelled";
    });

    await findOrder.save();

    return {
      success: true,
      message: "Order cancelled successfully",
      data: findOrder
    };
  }

  throw new ApiError(400, "Invalid operation");
};

module.exports = {
  getOrder,
  getSingleOrders,
  editOrders,
};
