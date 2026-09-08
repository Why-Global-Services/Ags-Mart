"use client";

import { motion } from "framer-motion";
import { CheckCircle, Truck, Package, Home, Clock, MapPin } from "lucide-react";
import Image from "next/image";

const statusConfig = {
  Ordered: { step: 0, icon: Package, label: "Order Placed" },
  Shipped: { step: 1, icon: Truck, label: "Shipped" },
  "Out for Delivery": { step: 2, icon: MapPin, label: "Out for Delivery" },
  Delivered: { step: 3, icon: CheckCircle, label: "Delivered" },
};

const OrderTracking = ({ order }) => {
  const statusKey = order.orderStatus;
  const current = statusConfig[statusKey] || statusConfig.Ordered;
  const currentStep = current.step;

  // Build timeline from order status + createdAt
  const timeline = Object.entries(statusConfig).map(([key, config], idx) => {
    const isCompleted = idx <= currentStep;
    const date = new Date(order.createdAt);
    date.setDate(date.getDate() + idx * 2); // fake future dates
    return {
      status: config.label,
      date: date.toISOString().split("T")[0],
      icon: config.icon,
      isCompleted,
    };
  });

  const product = order.orderDetails[0]?.products;
  const pVariant = product?.productDetails?.variant;
  const variant =
    pVariant?.unitOnlyVariants?.find((v) => v._id === product?.variantId) ||
    pVariant?.colorOnlyVariants?.find((v) => v._id === product?.variantId) ||
    pVariant?.sizeOnlyVariants?.find((v) => v._id === product?.variantId) ||
    pVariant?.sizeColorVariants?.find((v) => v._id === product?.variantId);
  const priceInfo = variant?.price || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white shadow-lg rounded-3xl overflow-hidden border border-gray-100"
    >
      {/* Product Card */}
      <div className="p-6 flex flex-col sm:flex-row items-start gap-6">
        <div className="relative">
          <Image
            src={
              product?.productDetails?.productImages?.[0] || "/placeholder.png"
            }
            alt={product?.productDetails?.productName}
            width={128}
            height={128}
            className="rounded-lg object-cover shadow-sm"
            unoptimized
          />
          <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            {product?.quantity || 1}
          </span>
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-800 line-clamp-2">
            {product?.productDetails?.productName}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Order ID: {order.orderId}
          </p>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-gray-700 font-medium">
                ₹{product?.subtotal}
              </span>
              {priceInfo.regularPrice && (
                <span className="text-gray-400 line-through text-sm">
                  ₹{priceInfo.regularPrice}
                </span>
              )}
              {priceInfo.discount && (
                <span className="text-green-600 text-xs font-medium">
                  {priceInfo.discount}% OFF
                </span>
              )}
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                currentStep === 3
                  ? "bg-green-100 text-green-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {current.label}
            </span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="p-6 border-t border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800">Order Status</h3>
          <div className="text-sm text-gray-500">
            Estimated delivery:{" "}
            <span className="font-medium">
              {new Date(timeline[3]?.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        <div className="relative">
          {/* Progress Line */}
          <div
            className="absolute left-5 top-0 bottom-0 w-1 bg-gray-200"
            aria-hidden="true"
          >
            <motion.div
              className="absolute top-0 left-0 w-full bg-indigo-600"
              initial={{ height: 0 }}
              animate={{
                height: `${(currentStep / (timeline.length - 1)) * 100}%`,
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>

          <div className="space-y-8">
            {timeline.map((step, index) => {
              const Icon = step.icon;
              const isCurrent = index === currentStep;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="relative flex items-start gap-4"
                >
                  <div className="relative">
                    <div
                      className={`w-10 h-10 flex items-center justify-center rounded-full z-10 transition-all ${
                        step.isCompleted
                          ? "bg-indigo-600 shadow-indigo-200"
                          : "bg-gray-200"
                      } ${isCurrent ? "ring-4 ring-indigo-300" : ""} shadow-sm`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          step.isCompleted ? "text-white" : "text-gray-500"
                        }`}
                      />
                    </div>
                    {isCurrent && (
                      <motion.div
                        className="absolute -inset-2 rounded-full bg-indigo-200 opacity-0 z-0"
                        animate={{
                          opacity: [0, 0.5, 0],
                          scale: [1, 1.4, 1.8],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeOut",
                        }}
                      />
                    )}
                  </div>

                  <div className="pt-1 flex-1">
                    <p
                      className={`font-medium text-base transition-colors ${
                        step.isCompleted ? "text-indigo-700" : "text-gray-500"
                      } ${isCurrent ? "font-semibold" : ""}`}
                    >
                      {step.status}
                    </p>
                    <p
                      className={`text-sm transition-colors ${
                        step.isCompleted ? "text-indigo-500" : "text-gray-400"
                      }`}
                    >
                      {new Date(step.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    {isCurrent && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-indigo-600 mt-1 font-medium"
                      >
                        {index === timeline.length - 1
                          ? "Your order has been delivered!"
                          : "Your order is on the way"}
                      </motion.p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        {currentStep < timeline.length - 1 && (
          <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 mt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Next update in <span className="font-medium">2–4 hours</span>
              </p>
              <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                Track Package
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Help Section */}
      {currentStep < timeline.length - 1 && (
        <div className="border-t border-gray-100 p-6 bg-blue-100">
          <h4 className="text-md font-semibold text-gray-800 mb-3">
            Need help?
          </h4>
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="flex-1 px-4 py-2 border border-indigo-200 rounded-lg text-indigo-700 hover:bg-indigo-100 transition-colors text-sm font-medium">
              Contact Support
            </button>
            <button className="flex-1 px-4 py-2 border border-indigo-200 rounded-lg text-indigo-700 hover:bg-indigo-100 transition-colors text-sm font-medium">
              View Full Details
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};


export default OrderTracking;