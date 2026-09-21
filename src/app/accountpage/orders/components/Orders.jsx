// Orders.jsx
"use client";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import { Modal, Button, Input, Upload, Rate, Select } from "antd";
import { Check, Package, Truck, MapPin, X, ChevronRight, Clock, PackageCheck, CheckCircle2, AlertCircle, RotateCcw } from "lucide-react";
import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import {
  fetchOrders,
  fetchProductReview,
  handleRequest,
  handleReviewSubmit,
  setSelectedOrder,
  setActiveTab,
  setCancelReason,
  setSelectedProduct,
  setReturnType,
  setImageError,
  setReviewData,
  openModal,
  handleModalCancel,
  openReviewModal,
  handleReviewModalCancel,
  handleImageUpload,
  handleRemoveImage,
  handleReviewImageUpload,
  handleReviewImageRemove,
} from "@/app/store/ordersSlice";

const { Option } = Select;

// Fixed: getProductImage for your actual structure
const getProductImage = (product) => {
  if (!product?.productDetails) return "/placeholder.png";

  const details = product.productDetails;
  const variantId = product.variantId;

  // 1. Variant images (unitOnly)
  if (details.variant && variantId) {
    const variants = details.variant.unitOnlyVariants || [];
    const matched = variants.find(v => v._id === variantId);
    if (matched?.variantImages?.[0]) return matched.variantImages[0];
  }

  // 2. nonVariant images
  if (details.nonVariant?.nonVariantImages?.[0]) {
    return details.nonVariant.nonVariantImages[0];
  }

  // 3. Main product images
  if (details.productImages?.[0]) {
    return details.productImages[0];
  }

  return "/placeholder.png";
};

// Fixed: getProductPrice
const getProductPrice = (product) => {
  if (!product?.productDetails) return {};
  const details = product.productDetails;
  const variantId = product.variantId;

  if (details.variant && variantId) {
    const variants = details.variant.unitOnlyVariants || [];
    const matched = variants.find(v => v._id === variantId);
    if (matched?.price) return matched.price;
  }

  if (details.nonVariant?.price) {
    return details.nonVariant.price;
  }

  return {};
};

// Order Tracking Component
const OrderTracking = ({ order }) => {
  // Status configuration matching your schema
  const statusConfig = {
    Pending: { step: 0, icon: Clock, label: "Order Pending" },
    Ordered: { step: 1, icon: PackageCheck, label: "Order Placed" },
    Packing: { step: 2, icon: Package, label: "Packing" },
    Shipped: { step: 3, icon: Truck, label: "Shipped" },
    Delivered: { step: 4, icon: CheckCircle2, label: "Delivered" },
    Cancelled: { step: 5, icon: X, label: "Cancelled" },
    "Return Request": { step: 6, icon: AlertCircle, label: "Return Requested" },
    Returned: { step: 7, icon: RotateCcw, label: "Returned" },
    Partial: { step: 8, icon: Package, label: "Partial Return" },
  };

  const currentStatus = order.orderStatus;
  const isCancelled = currentStatus === "Cancelled";
  const isReturned = ["Return Request", "Returned", "Partial"].includes(currentStatus);
  
  const current = statusConfig[currentStatus] || statusConfig.Ordered;

  // Build timeline based on order status
  let timeline = [];
  
  if (isCancelled) {
    // Cancelled flow
    timeline = [
      statusConfig.Ordered,
      statusConfig.Cancelled
    ];
  } else if (isReturned) {
    // Return flow
    timeline = [
      statusConfig.Ordered,
      statusConfig.Packing,
      statusConfig.Shipped,
      statusConfig.Delivered,
      statusConfig[currentStatus] // Current return status
    ];
  } else {
    // Normal delivery flow
    timeline = [
      statusConfig.Ordered,
      statusConfig.Packing,
      statusConfig.Shipped,
      statusConfig.Delivered
    ].slice(0, current.step + 2); // Show current + 1 future step
  }

  // Calculate dates for each step
  timeline = timeline.map((config, idx) => {
    const date = new Date(order.createdAt);
    date.setDate(date.getDate() + idx);
    
    return {
      ...config,
      date: date.toISOString().split("T")[0],
      isCompleted: config.step <= current.step,
      isCurrent: config.step === current.step,
    };
  });

  const currentStep = current.step;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-200"
    >
      {/* Header Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-white">Order Tracking</h3>
              <p className="text-emerald-100 text-xs md:text-sm">Track your order status</p>
            </div>
          </div>
          
          {!isCancelled && !isReturned && currentStep < 4 && (
            <div className="bg-white/20 px-3 py-2 rounded-lg backdrop-blur-sm">
              <p className="text-xs text-emerald-100 mb-1">Estimated Delivery</p>
              <p className="text-sm font-bold text-white">
                {new Date(
                  new Date(order.createdAt).getTime() + 4 * 24 * 60 * 60 * 1000
                ).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 md:px-6 pt-4 md:pt-6 pb-2">
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className={`absolute top-0 left-0 h-full ${
              isCancelled
                ? "bg-red-600"
                : isReturned
                ? "bg-emerald-600"
                : "bg-gradient-to-r from-emerald-500 to-emerald-600"
            }`}
            initial={{ width: 0 }}
            animate={{
              width: `${((timeline.findIndex(s => s.isCurrent) / (timeline.length - 1)) * 100)}%`,
            }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Timeline Section */}
      <div className="p-4 md:p-6">
        <div className="relative">
          {/* Vertical Line - Hidden on mobile, shown on desktop */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 hidden md:block" aria-hidden="true">
            <motion.div
              className={`absolute top-0 left-0 w-full ${
                isCancelled
                  ? "bg-red-600"
                  : isReturned
                  ? "bg-emerald-600"
                  : "bg-gradient-to-b from-emerald-500 to-emerald-600"
              }`}
              initial={{ height: 0 }}
              animate={{
                height: `${((timeline.findIndex(s => s.isCurrent) / (timeline.length - 1)) * 100)}%`,
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>

          {/* Timeline Steps */}
          <div className="space-y-4 md:space-y-6">
            {timeline.map((step, index) => {
              const Icon = step.icon;
              const isCancelStep = step.label.includes("Cancelled");
              const isReturnStep = step.label.includes("Return");

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 * index }}
                  className="relative flex items-start gap-3 md:gap-4"
                >
                  {/* Icon Container */}
                  <div className="relative z-10 flex-shrink-0">
                    <motion.div
                      className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl shadow-md transition-all ${
                        step.isCompleted && !isCancelStep && !isReturnStep
                          ? "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-200"
                          : isCancelStep
                          ? "bg-gradient-to-br from-red-500 to-red-600 shadow-red-200"
                          : isReturnStep
                          ? "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-200"
                          : "bg-gray-100 shadow-gray-200"
                      } ${step.isCurrent ? "ring-2 ring-emerald-400 scale-105" : ""}`}
                      whileHover={{ scale: 1.03 }}
                    >
                      <Icon
                        className={`w-5 h-5 md:w-6 md:h-6 ${
                          step.isCompleted || step.isCurrent ? "text-white" : "text-gray-500"
                        }`}
                        strokeWidth={2.5}
                      />
                    </motion.div>

                    {/* Pulse animation for current step - Desktop only */}
                    {step.isCurrent && (
                      <motion.div
                        className={`hidden md:block absolute inset-0 rounded-xl ${
                          isCancelStep
                            ? "bg-red-400"
                            : isReturnStep
                            ? "bg-emerald-400"
                            : "bg-emerald-400"
                        }`}
                        animate={{ 
                          opacity: [0.4, 0, 0.4],
                          scale: [1, 1.2, 1]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className={`p-3 md:p-4 rounded-lg transition-all ${
                      step.isCurrent 
                        ? "bg-emerald-50 border border-emerald-100" 
                        : "bg-gray-50"
                    }`}>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                        <p
                          className={`font-semibold text-sm md:text-base transition-colors ${
                            step.isCompleted && !isCancelStep && !isReturnStep
                              ? "text-bgvariant-2"
                              : isCancelStep
                              ? "text-red-700"
                              : isReturnStep
                              ? "text-bgvariant-2"
                              : "text-gray-600"
                          } ${step.isCurrent ? "text-emerald-800" : ""}`}
                        >
                          {step.label}
                        </p>
                        
                        {step.isCompleted && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center ${
                              isCancelStep
                                ? "bg-red-600"
                                : isReturnStep
                                ? "bg-emerald-600"
                                : "bg-emerald-600"
                            }`}
                          >
                            <Check className="w-3 h-3 md:w-4 md:h-4 text-white" strokeWidth={3} />
                          </motion.div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className={`w-3 h-3 md:w-4 md:h-4 ${
                          step.isCompleted ? "text-emerald-600" : "text-gray-500"
                        }`} />
                        <p
                          className={`text-xs md:text-sm transition-colors ${
                            step.isCompleted ? "text-gray-700" : "text-gray-600"
                          }`}
                        >
                          {new Date(step.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      
                      {step.isCurrent && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`mt-2 px-2 py-1.5 md:px-3 md:py-2 rounded-md inline-block ${
                            isCancelStep
                              ? "bg-red-50 border border-red-100"
                              : isReturnStep
                              ? "bg-emerald-50 border border-emerald-100"
                              : "bg-emerald-50 border border-emerald-100"
                          }`}
                        >
                          <p className={`text-xs font-medium ${
                            isCancelStep
                              ? "text-red-700"
                              : isReturnStep
                              ? "text-bgvariant-2"
                              : "text-bgvariant-2"
                          }`}>
                            {isCancelStep
                              ? "Order has been cancelled"
                              : isReturnStep
                              ? "Return process ongoing"
                              : step.step === 4
                              ? "Order delivered successfully!"
                              : "Currently in progress..."}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-4 md:px-6 py-3 border-t border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              isCancelled ? 'bg-red-500' : 'bg-emerald-500'
            }`} />
            <p className="text-xs md:text-sm text-gray-600">
              {isCancelled 
                ? "Order was cancelled" 
                : isReturned 
                ? "Return in progress" 
                : currentStep === 4 
                ? "Order completed" 
                : "Order is being processed"}
            </p>
          </div>
          <p className="text-xs text-gray-500">
            Updated: {new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// Utility functions
const canCancel = (order) => {
  return ["Ordered", "Packing"].includes(order.orderStatus);
};

// Can return specific product
const canReturnProduct = (product, order) => {
  if (!product) return false;

  if (product.orderStatus !== "Delivered") return false;
  if (product.returnStatus) return false;

  return isWithinReturnPeriod(order.updatedAt);
};

// Add this function to check return time window
const RETURN_WINDOW_DAYS = 2;

const isWithinReturnPeriod = (deliveredDate) => {
  if (!deliveredDate) return false;

  const today = new Date();
  const delivered = new Date(deliveredDate);

  today.setHours(0, 0, 0, 0);
  delivered.setHours(0, 0, 0, 0);

  const diffDays = Math.floor(
    (today - delivered) / (1000 * 60 * 60 * 24)
  );

  return diffDays >= 0 && diffDays <= RETURN_WINDOW_DAYS;
};

const canReview = (item, order) => {
  return order.orderStatus === "Delivered" && !item.review;
};

const getStatusColor = (status) => {
  const map = {
    Delivered: "bg-green-100 text-green-800",
    Ordered: "bg-blue-100 text-blue-800",
    Pending: "bg-yellow-100 text-yellow-800",
    Packing: "bg-blue-100 text-blue-800",
    Shipped: "bg-purple-100 text-purple-800",
    "Return Request": "bg-orange-100 text-orange-800",
    Returned: "bg-red-100 text-red-800",
    Cancelled: "bg-red-100 text-red-800",
    Partial: "bg-yellow-100 text-yellow-800",
  };
  return map[status] || "bg-gray-100 text-gray-800";
};

export default function Orders() {
  const dispatch = useDispatch();
  
  // Select state from Redux
  const {
    orders,
    selectedOrder,
    selectedProduct,
    activeTab,
    showModal,
    modalType,
    cancelReason,
    cancelImage,
    isSubmitting,
    showReviewModal,
    userReview,
    reviewData,
    isReviewSubmitting,
    imageError,
    returnType,
  } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const filteredOrders = orders.filter((o) => {
    if (activeTab === "all") return true;
    return o.orderStatus.toLowerCase() === activeTab.toLowerCase();
  });

  const handleReturnClick = (item) => {
    dispatch(setSelectedProduct(item));
    dispatch(setReturnType("return"));
    dispatch(openModal("return"));
  };

  const handleCancelClick = (item) => {
    dispatch(setSelectedProduct(item));
    dispatch(openModal("cancel"));
  };

  const handleReviewClick = (item) => {
    dispatch(setSelectedProduct(item));
    dispatch(setImageError(""));
    dispatch(openReviewModal(item));
    dispatch(fetchProductReview(item));
  };

  const handleFileUpload = (info) => {
    dispatch(setImageError(""));

    const file = info.file;

    if (!file.type || !file.type.startsWith("image/")) {
      dispatch(setImageError("Only image files are allowed"));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      dispatch(setImageError("Image size exceeds 2 MB"));
      return;
    }

    const fileObj = file.originFileObj || file;

    if (fileObj instanceof File) {
      dispatch(handleImageUpload(fileObj));
    } else {
      console.error("Uploaded file is not a File object:", fileObj);
      dispatch(setImageError("Invalid file format"));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Return/Cancel Modal */}
      <Modal
        title={modalType === "return" ? "Return/Replace Request" : "Cancel Order"}
        open={showModal}
        onCancel={() => dispatch(handleModalCancel())}
        footer={[
          <Button key="cancel" onClick={() => dispatch(handleModalCancel())}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isSubmitting}
            onClick={() => dispatch(handleRequest(modalType))}
            disabled={!cancelReason.trim()}
          >
            {isSubmitting
              ? "Submitting..."
              : `Submit ${modalType === "return" ? returnType : "Cancellation"}`}
          </Button>,
        ]}
      >
        <div className="space-y-4 py-4">
          {modalType === "return" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Request Type
              </label>
              <Select
                value={returnType}
                onChange={(value) => dispatch(setReturnType(value))}
                className="w-full"
                placeholder="Select request type"
              >
                <Option value="return">Return</Option>
              </Select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for {modalType === "return" ? returnType : "Cancellation"}
            </label>
            <Input.TextArea
              rows={4}
              value={cancelReason}
              onChange={(e) => dispatch(setCancelReason(e.target.value))}
              placeholder={`Please explain why you want to ${modalType === "return" ? returnType.toLowerCase() : "cancel"
                } this product...`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Image
            </label>
            <Upload
              beforeUpload={() => false}
              showUploadList={false}
              onChange={handleFileUpload}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>Upload Image</Button>
            </Upload>
            {cancelImage && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {cancelImage.name || "Image uploaded"}
                </span>
                <button
                  onClick={() => dispatch(handleRemoveImage())}
                  className="text-red-500 hover:text-red-700"
                >
                  <DeleteOutlined />
                </button>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Review Modal */}
      <Modal
        title={userReview ? "Edit Your Review" : "Write a Review"}
        open={showReviewModal}
        onCancel={() => dispatch(handleReviewModalCancel())}
        footer={[
          <Button key="cancel" onClick={() => dispatch(handleReviewModalCancel())}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isReviewSubmitting}
            onClick={() => dispatch(handleReviewSubmit())}
          >
            {isReviewSubmitting ? "Submitting…" : userReview ? "Update" : "Submit"}
          </Button>,
        ]}
        width={800}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Product Info */}
          <div className="space-y-4">
            {selectedProduct && (
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Image
                    src={getProductImage(selectedProduct.products)}
                    alt={selectedProduct.products?.productDetails?.productName || "Product"}
                    width={120}
                    height={120}
                    className="object-contain rounded-lg border border-gray-200"
                    unoptimized
                  />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">
                    {selectedProduct.products?.productDetails?.productName || "Product"}
                  </h4>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    ₹{selectedProduct.products?.subtotal || 0}
                  </p>
                </div>
              </div>
            )}
          </div>
          {/* Review Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Rating *
              </label>
              <Rate
                value={reviewData.rating}
                onChange={(rating) => dispatch(setReviewData({ ...reviewData, rating }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Review *
              </label>
              <Input.TextArea
                rows={4}
                value={reviewData.reviewText}
                onChange={(e) => dispatch(setReviewData({ ...reviewData, reviewText: e.target.value }))}
                placeholder="Share your experience with this product..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Review Images (Optional)
              </label>
              <Upload
                beforeUpload={() => false}
                multiple
                showUploadList={false}
                onChange={(info) => {
                  const file = info.file;
                  if (!file.type || !file.type.startsWith("image/")) {
                    dispatch(setImageError("Only image files are allowed"));
                    return;
                  }
                  if (file.size > 2 * 1024 * 1024) {
                    dispatch(setImageError("Image size exceeds 2 MB"));
                    return;
                  }
                  const fileObj = file.originFileObj || file;
                  if (fileObj instanceof File) {
                    dispatch(handleReviewImageUpload(fileObj));
                  } else {
                    dispatch(setImageError("Invalid file format"));
                  }
                }}
                accept="image/*"
                maxCount={5}
              >
                <Button icon={<UploadOutlined />}>Upload Images</Button>
              </Upload>
              {imageError && (
                <p className="text-red-500 text-sm mt-1">{imageError}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-4">
                {(!reviewData.reviewImages || reviewData.reviewImages.length === 0) ? (
                  <p className="text-gray-500 text-sm">
                    No images uploaded (optional)
                  </p>
                ) : (
                  reviewData.reviewImages.map((img, idx) => {
                    const src = img instanceof File ? URL.createObjectURL(img) : img;
                    return (
                      <div key={idx} className="relative w-20 h-20">
                        <img
                          src={src}
                          alt={`review-${idx}`}
                          className="object-cover rounded w-full h-full border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => dispatch(handleReviewImageRemove(img))}
                          className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full p-1 shadow border hover:bg-red-50"
                        >
                          <DeleteOutlined className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Main Content */}
      {selectedOrder ? (
        <div className="space-y-8">
          {/* Back button */}
          <button
            onClick={() => dispatch(setSelectedOrder(null))}
            className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Orders
          </button>
          {/* Order Tracking */}
          <OrderTracking order={selectedOrder} />
          {/* Items List */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900">Your Items</h3> 
            <span className="text-red-500 text-sm">Return of products should be within 2 days</span>
            {selectedOrder.orderDetails.map((item, idx) => {
              const prod = item.products;
              const priceInfo = getProductPrice(prod);
              return (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-xs transition-all"
                >
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="relative">
                        <Image
                          src={getProductImage(prod)}
                          alt={prod.productDetails?.productName}
                          width={120}
                          height={120}
                          className="object-contain rounded-xl border border-gray-200"
                          unoptimized
                        />
                        <div className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                          {prod.quantity}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                          <div>
                            <h4 className="font-bold text-gray-900 mb-1">
                              {prod.productDetails?.productName}
                            </h4>
                            <div className="flex items-center gap-2">
                              <p className="text-lg font-bold text-gray-900">
                                ₹{prod.subtotal}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-medium mb-2 ${getStatusColor(
                                prod.orderStatus
                              )}`}
                            >
                              {prod.orderStatus}
                            </span>
                            
                            {/* Show return status badge if exists */}
                            {prod.returnStatus && (
                              <span className={`px-2 py-0.5 rounded text-xs mt-1 ${
                                prod.returnStatus === "In Process"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : prod.returnStatus === "Approved"
                                  ? "bg-green-100 text-green-700"
                                  : prod.returnStatus === "Rejected"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}>
                                {prod.returnStatus}
                              </span>
                            )}
                            
                            <p className="text-sm text-gray-500 mt-2">
                              Ordered on{" "}
                              {new Date(selectedOrder.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row justify-end gap-4">
                      <div className="flex gap-3 w-full sm:w-auto">
                        {canReview(item, selectedOrder) && (
                          <button
                            onClick={() => handleReviewClick(item)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 min-w-[120px]"
                          >
                            Write Review
                          </button>
                        )}
                        {item?.review && (
                          <button
                            onClick={() => handleReviewClick(item)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 min-w-[120px]"
                          >
                            Edit Review
                          </button>
                        )}
                        {canReturnProduct(prod, selectedOrder) &&
                          prod.productDetails?.isReturnable === true && (
                            <button
                              onClick={() => handleReturnClick(item)}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              Return Product
                            </button>
                        )}

                        {prod.orderStatus === "Delivered" &&
                          prod.productDetails?.isReturnable === true &&
                          !isWithinReturnPeriod(selectedOrder.updatedAt) && (
                            <p className="text-xs text-gray-500 mt-2">
                              Return window closed. Returns are allowed within 2 days of delivery.
                            </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Common Cancel Order Button for Entire Order */}
            {canCancel(selectedOrder) && !selectedOrder.returnStatus && (
              <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-yellow-800 text-lg">
                      Cancel this Order
                    </h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      You can cancel this order before it is shipped.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      dispatch(setSelectedProduct(null));
                      dispatch(openModal("cancel"));
                    }}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-yellow-300"
                  >
                    Cancel Order
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ORDERS LIST VIEW */
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex gap-4 border-b pb-2 overflow-x-auto">
            {["all", "ordered", "packing", "shipped", "delivered", "cancelled", "returned"].map((tab) => (
              <button
                key={tab}
                onClick={() => dispatch(setActiveTab(tab))}
                className={`pb-2 px-4 capitalize whitespace-nowrap ${activeTab === tab ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-600 hover:text-gray-900"}`}
              >
                {tab}
              </button>
            ))}
          </div>
          {/* Orders List */}
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div
                key={order._id}
                onClick={() => dispatch(setSelectedOrder(order))}
                className="bg-white rounded-2xl p-6 transition-all cursor-pointer border border-gray-100 hover:border-indigo-100 hover:shadow-xs group"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                      <p className="font-bold text-gray-900">
                        Order #{order.orderId}
                      </p>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium w-max ${getStatusColor(
                          order.orderStatus
                        )}`}
                      >
                        {order.orderStatus}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    ₹{order.totalPrice.toFixed(2)}
                  </p>
                </div>
                <div className="mt-6">
                  {order.orderDetails.slice(0, 2).map((item, i) => {
                    const prod = item.products;
                    const priceInfo = getProductPrice(prod);
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0 group-hover:border-indigo-50"
                      >
                        <div className="relative">
                          <Image
                            src={getProductImage(prod)}
                            alt={prod.productDetails?.productName}
                            width={64}
                            height={64}
                            className="object-contain rounded-lg border border-gray-200"
                            unoptimized
                          />
                          <div className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {prod.quantity}
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-800 line-clamp-1">
                            {prod.productDetails?.productName}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs font-bold text-gray-900">
                              ₹{prod.subtotal}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {order.orderDetails.length > 2 && (
                    <p className="text-sm text-gray-500 mt-3">
                      +{order.orderDetails.length - 2} more items
                    </p>
                  )}
                </div>
                <div className="flex justify-between mt-6">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(setSelectedOrder(order));
                    }}
                    className="text-indigo-600 hover:text-indigo-800 font-bold text-sm flex items-center transition-colors group"
                  >
                    View Details
                    <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="text-lg font-bold text-gray-900 mt-4">
                No orders found
              </h3>
              <p className="text-gray-500 mt-2">
                You don&apos;t have any {activeTab !== "all" ? activeTab : ""}{" "}
                orders yet
              </p>
              <button className="mt-6 bg-bgvariant-1 hover:bg-bgvariant-3 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Start Shopping
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}