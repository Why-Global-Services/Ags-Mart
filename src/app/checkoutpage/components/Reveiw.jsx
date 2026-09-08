"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  XCircleIcon,
  CheckCircleIcon,
  RefreshCwIcon,
  Gift,
  Percent,
  Tag,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  getCheckout,
  Paymentverification,
  placeOrder,
} from "@/app/interceptor/interseptor";
import { verifyCoupon } from "@/app/interceptor/interseptor";
import { gaEvent } from "@/app/lib/ga";
import { showToast } from "@/app/utils/toast";
import { useAuth } from "@/context/AuthContext";
import AuthPage from "@/app/common/LoginPage";

const Review = ({
  buyNowItem,
  isBuyNow,
  deliveryAddressId,
  billingAddressId,
}) => {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [addressError, setAddressError] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupons, setAppliedCoupons] = useState([]);
  const [isApplying, setIsApplying] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showAllCoupons, setShowAllCoupons] = useState(false);
  const [items, setItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [initialSubtotal, setInitialSubtotal] = useState(0);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [freeProductInfo, setFreeProductInfo] = useState(null);
  const [shipping, setShipping] = useState(50);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const[showAuth, setShowAuth]=useState(false)
  // const user=useAuth(); // added for completeness

  // Define Razorpay key directly or use environment variable with fallback
  const razorpayKey = "rzp_test_S3g71UVxt2B922";

  const paymentMethods = [
    { value: "COD", label: "Cash on Delivery" },
    { value: "RazorPay", label: "RazorPay (UPI/Cards/NetBanking)" },
  ];

  // Address validation function
  const validateAddressSelection = useCallback(() => {
    const deliveryAddress =
      deliveryAddressId || localStorage.getItem("selectedDeliveryAddress");
    const billingAddress =
      billingAddressId || localStorage.getItem("selectedBillingAddress");

    if (!deliveryAddress) {
      return "Please select a delivery address before proceeding with payment.";
    }

    if (!billingAddress) {
      return "Please select a billing address before proceeding with payment.";
    }

    return null;
  }, [deliveryAddressId, billingAddressId]);

  const firePurchaseEvent = (order) => {
    if (!order) return;

    const totalValue =
      order.pricingSummary?.finalTotal ?? order.totalPrice ?? 0;

    gaEvent("purchase", {
      transaction_id: order.orderId,
      value: totalValue,
      currency: "INR",
      payment_type: order.paymentMethod,
      shipping: order.pricingSummary?.shipping ?? 0,
      coupon:
        order.pricingSummary?.couponDiscount > 0
          ? appliedCoupons[0]?.code
          : undefined,
      items: order.orderDetails.map((item) => ({
        item_id: item.productId,
        item_name: item.productName,
        item_variant: item.variantDetails?.size || item.variantDetails?.color,
        price: item.price?.salePrice || 0,
        quantity: item.quantity || 1,
      })),
    });
  };

  // Check if Razorpay is already loaded
  const isRazorpayLoaded = () => {
    return typeof window !== "undefined" && window.Razorpay;
  };

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      if (isRazorpayLoaded()) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;

      script.onload = () => {
        console.log("Razorpay SDK loaded successfully");
        resolve();
      };

      script.onerror = () => {
        reject(new Error("Failed to load Razorpay SDK"));
      };

      document.body.appendChild(script);
    });
  };

  // Memoize the data processing to prevent unnecessary re-renders
  const processBuyNowData = useCallback((buyNowItem) => {
    console.log("Processing buyNowItem:", buyNowItem);

    const mappedItems = [
      {
        _id: buyNowItem.productId,
        variantId: buyNowItem.variantId || null,
        productName: buyNowItem.productName,
        productImage: buyNowItem.productImage
          ? [buyNowItem.productImage]
          : ["/combo.jpg"],
        selectedVariant: {
          varientValue: buyNowItem.variantDetails?.displaySize || "",
          price: {
            salePrice:
              buyNowItem.priceBreakdown?.totalPrice ||
              buyNowItem.priceBreakdown?.salePrice ||
              0,
            costPrice:
              buyNowItem.priceBreakdown?.basePrice ||
              buyNowItem.priceBreakdown?.costPrice ||
              0,
            savings:
              (buyNowItem.priceBreakdown?.realPrice ||
                buyNowItem.priceBreakdown?.costPrice ||
                0) - (buyNowItem.priceBreakdown?.salePrice || 0),
          },
        },
        variantDetails: buyNowItem.variantDetails,
        quantity: buyNowItem.quantity ?? 1,
        productType:
          buyNowItem.productType ||
          (buyNowItem.variantId ? "variation" : "nonVariation"),
      },
    ];

    const subtotal =
      Number(
        buyNowItem.priceBreakdown?.totalPrice ||
          buyNowItem.priceBreakdown?.salePrice ||
          0,
      ) * (buyNowItem.quantity ?? 1);

    return {
      items: mappedItems,
      totalPrice: subtotal,
      initialSubtotal: subtotal,
      shipping: subtotal > 499 ? 0 : 50,
      coupons: [],
    };
  }, []);

  const processCartData = useCallback(async () => {
    try {
      const res = await getCheckout();
      console.log("Checkout API Response:", res);

      const data = res?.data ?? res;
      const mappedItems = (data?.cartItems || []).map((p) => ({
        _id: p.productId ?? p._id,
        variantId: p.variantId || null,
        productName: p.productName,
        productImage:
          p.productImages && p.productImages.length
            ? [p.productImages[0]]
            : ["/combo.jpg"],
        selectedVariant: {
          varientValue:
            p.selectedVariant?.varientValue ??
            (p.productType === "variant" ? "" : ""),
          price: {
            salePrice: p.priceBreakdown?.salePrice ?? p.subtotal ?? 0,
            costPrice: p.priceBreakdown?.costPrice ?? 0,
            savings: p.priceBreakdown?.savings ?? 0,
            taxAmount: p.priceBreakdown?.taxAmount ?? 0,
            taxPercentage: p.priceBreakdown?.taxPercentage ?? 0,
          },
        },
        variantDetails: p.variantDetails,
        quantity: p.quantity ?? 1,
        productType:
          p.productType || (p.variantId ? "variation" : "nonVariation"),
      }));

      // Map coupons with proper details
      const mappedCoupons = (data?.CouponData || []).map((c) => ({
        _id: c._id,
        code: c.code,
        message: c.message,
        offerType: c.offerType,
        discountType: c.discountType,
        discountValue: c.discountValue,
        maxDiscountAmount: c.maxDiscountAmount,
        minPurchaseAmount: c.minPurchaseAmount,
        freeProduct: c.freeProduct,
        freeProductDetails: c.freeProductDetails, // Include free product details
        validFrom: c.validFrom,
        validUntil: c.validUntil,
        couponImage: c.couponImage,
      }));

      const backendSubtotal = data?.pricing?.subtotal ?? data?.totalPrice;
      let subtotal = Number(backendSubtotal ?? 0);

      if (!backendSubtotal) {
        subtotal = mappedItems.reduce((sum, it) => {
          const price = Number(it.selectedVariant?.price?.salePrice ?? 0);
          const qty = Number(it.quantity ?? 0);
          return sum + price * qty;
        }, 0);
      }

      return {
        items: mappedItems,
        totalPrice: subtotal,
        initialSubtotal: subtotal,
        shipping: data?.pricing?.shipping ?? 50,
        coupons: mappedCoupons,
      };
    } catch (err) {
      console.error("getCheckout failed:", err);
      return {
        items: [],
        totalPrice: 0,
        initialSubtotal: 0,
        shipping: 50,
        coupons: [],
      };
    }
  }, []);

  // Fixed useEffect with proper dependencies
  useEffect(() => {
    let isMounted = true;

    const initializeData = async () => {
      if (isBuyNow && buyNowItem) {
        const processedData = processBuyNowData(buyNowItem);
        if (isMounted) {
          setItems(processedData.items);
          setTotalPrice(processedData.totalPrice);
          setInitialSubtotal(processedData.initialSubtotal);
          setShipping(processedData.shipping);
          setAvailableCoupons(processedData.coupons);
        }
      } else {
        const processedData = await processCartData();
        if (isMounted) {
          setItems(processedData.items);
          setTotalPrice(processedData.totalPrice);
          setInitialSubtotal(processedData.initialSubtotal);
          setShipping(processedData.shipping);
          setAvailableCoupons(processedData.coupons);
        }
      }
    };

    initializeData();

    return () => {
      isMounted = false;
    };
  }, [isBuyNow, buyNowItem, processBuyNowData, processCartData]);


  const total = useMemo(() => {
    return (totalPrice || 0) + (shipping || 0) - (couponDiscount || 0);
  }, [totalPrice, shipping, couponDiscount]);

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 5);
  const deliveryDate = futureDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const deliveryDay = futureDate.toLocaleDateString("en-IN", {
    weekday: "long",
  });

  const handleApplyCoupon = async (code = couponCode) => {
    if (!code.trim()) {
      showToast.error("Please enter a coupon code");
      return;
    }
    try {
      setIsApplying(true);
      const res = await verifyCoupon(code);
      console.log("Coupon verification response:", res);

      const apiRes = res?.data ?? res;
      if (res.success) {
        const backendSubtotal = apiRes?.totals?.subtotal ?? totalPrice;
        const backendDiscount = apiRes?.totals?.discount ?? 0;
        const backendShipping = apiRes?.totals?.shipping ?? shipping;
        const freeProductData = apiRes?.freeProduct || null;

        setTotalPrice(backendSubtotal);
        setShipping(backendShipping);
        setCouponDiscount(backendDiscount);
        setFreeProductInfo(freeProductData);

        const couponInfo = apiRes?.couponInfo || {};

        setAppliedCoupons([
          {
            code: couponInfo?.code || code,
            discount:
              couponInfo.type === "FREE_PRODUCT"
                ? "Free Product"
                : `₹${backendDiscount} off`,
            isValid: true,
            type: couponInfo.type,
            freeProduct: freeProductData,
          },
        ]);

        showToast.success("Coupon applied successfully!");
        setCouponCode("");
      } else {
        const errorMsg = apiRes?.message || "Invalid coupon code";
        throw new Error(errorMsg);
      }
    } catch (error) {
      const errorMsg =
        error?.response?.data?.message ||
        error.message ||
        "Invalid coupon code";
      setAppliedCoupons([
        {
          code: code,
          discount: "Invalid",
          isValid: false,
        },
      ]);
      showToast.error(errorMsg);
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveCoupon = async () => {
    setAppliedCoupons([]);
    setCouponDiscount(0);
    setFreeProductInfo(null);

    if (isBuyNow) {
      setTotalPrice(initialSubtotal);
      setShipping(50);
    } else {
      try {
        const res = await getCheckout();
        const data = res?.data ?? res;

        const backendSubtotal = data?.pricing?.subtotal ?? 0;
        const backendShipping = data?.pricing?.shipping ?? 0;

        setTotalPrice(backendSubtotal);
        setShipping(backendShipping);
      } catch (err) {
        console.log("Reset failed:", err);
      }
    }

    showToast.success("Coupon removed!");
  };

  const handleOrder = async (paymentMethodUsed = paymentMethod) => {
    const finalDeliveryId =
      deliveryAddressId || localStorage.getItem("selectedDeliveryAddress");
    const finalBillingId =
      billingAddressId || localStorage.getItem("selectedBillingAddress");

    let payload;

    if (isBuyNow && items.length > 0) {
      const item = items[0];

      payload = {
        isBuyNow: true,
        productId: item._id,
        variantId: item.variantId || null,
        quantity: item.quantity || 1,
        productType:
          item.productType || (item.variantId ? "variation" : "nonVariation"),
        billingAddressId: finalBillingId,
        deliveryAddressId: finalDeliveryId,
        paymentMethod: paymentMethodUsed,
        couponCode: appliedCoupons[0]?.isValid ? appliedCoupons[0].code : null,
      };
    } else {
      payload = {
        isBuyNow: false,
        paymentMethod: paymentMethodUsed,
        couponCode: appliedCoupons[0]?.isValid ? appliedCoupons[0].code : null,
        billingAddressId: finalBillingId,
        deliveryAddressId: finalDeliveryId,
        cartItems: items.map((item) => ({
          productId: item._id,
          variantId: item.variantId || null,
          quantity: item.quantity || 1,
          productType:
            item.productType || (item.variantId ? "variation" : "nonVariation"),
        })),
      };
    }

    console.log("Placing order with payload:", payload);
    const res = await placeOrder(payload);
    console.log("Order placed response:", res);
    return res;
  };

  useEffect(() => {
    if (paymentMethod === "RazorPay") {
      loadRazorpayScript();
    }
  }, [paymentMethod]);

  const openRazorpayCheckout = async () => {
    try {
      console.log("Starting Razorpay checkout process...");

      const finalDeliveryId =
        deliveryAddressId || localStorage.getItem("selectedDeliveryAddress");
      const finalBillingId =
        billingAddressId || localStorage.getItem("selectedBillingAddress");

      let orderPayload;

      if (isBuyNow && items.length > 0) {
        const item = items[0];

        orderPayload = {
          isBuyNow: true,
          productId: item._id,
          variantId: item.variantId || null,
          quantity: item.quantity || 1,
          productType:
            item.productType || (item.variantId ? "variation" : "nonVariation"),
          billingAddressId: finalBillingId,
          deliveryAddressId: finalDeliveryId,
          paymentMethod: "RazorPay",
          couponCode: appliedCoupons[0]?.isValid
            ? appliedCoupons[0].code
            : null,
        };
      } else {
        orderPayload = {
          paymentMethod: "RazorPay",
          isBuyNow: false,
          couponCode: appliedCoupons[0]?.isValid
            ? appliedCoupons[0].code
            : null,
          billingAddressId: finalBillingId,
          deliveryAddressId: finalDeliveryId,
          cartItems: items.map((item) => ({
            productId: item._id,
            variantId: item.variantId || null,
            quantity: item.quantity || 1,
            productType:
              item.productType ||
              (item.variantId ? "variation" : "nonVariation"),
          })),
        };
      }

      console.log("Creating Razorpay order with payload:", orderPayload);
      const orderResponse = await placeOrder(orderPayload);

      const orderData = orderResponse?.data ?? orderResponse;

      const razorpayOrderId = orderData?.razorpayOrder?.id;
      const razorpayOrderAmount =
        orderData?.razorpayOrder?.amount ||
        orderData?.amount ||
        Math.round(total * 100);
      const razorpayOrderCurrency =
        orderData?.razorpayOrder?.currency || orderData?.currency || "INR";
      const orderId = orderData?.orderId || orderData?._id;

      if (!razorpayOrderId) {
        throw new Error(
          "Unable to create Razorpay order - no order ID received",
        );
      }

      if (!isRazorpayLoaded()) {
        throw new Error("Razorpay SDK not loaded");
      }

      if (!user) {
         
        return <AuthPage />;
        
      }


      const options = {
        key: razorpayKey,
        amount: razorpayOrderAmount,
        currency: razorpayOrderCurrency,
        name: "Agrowmed",
        description: "Order Payment",
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            const verifyRes = await Paymentverification(orderId, { response });

            if (!verifyRes?.success || !verifyRes?.data?.order) {
              throw new Error("Payment verified but order not confirmed");
            }

            const confirmedOrder = verifyRes.data.order;
            firePurchaseEvent(confirmedOrder);
            handlePaymentSuccess();
          } catch (error) {
            console.error("Error after payment success:", error);
            setPaymentError(
              "Order placement failed after payment. Please contact support.",
            );
          }
        },
        prefill: {
          name: orderData?.user?.name || "Customer",
          email: orderData?.user?.email || "customer@example.com",
          contact: orderData?.user?.phone || "",
        },
        theme: {
          color: "#047857",
        },
        modal: {
          ondismiss: function () {
            console.log("Razorpay modal closed by user");
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Razorpay checkout error:", error);
      throw error;
    }
  };

  const requireLogin = (actionCallback) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return false;
    }
    return actionCallback();
  };

  const handlePayNow = async () => {
    console.log("first");
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return false;
    }
    const addressValidationError = validateAddressSelection();
    if (addressValidationError) {
      setAddressError(addressValidationError);
      return;
    }

    setAddressError(null);
    setLoading(true);
    setPaymentError(null);

    try {
      if (paymentMethod === "RazorPay") {
        await openRazorpayCheckout();
      } else if (paymentMethod === "COD") {
        const res = await handleOrder();

        if (!res?.userOrder) {
          throw new Error("Order created but order data missing");
        }

        firePurchaseEvent({
          ...res.userOrder,
          pricingSummary: res.pricingSummary,
        });

        handlePaymentSuccess();
      } else {
        setPaymentError("Payment gateway integration required");
        setLoading(false);
      }
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentError(error.message || "Payment failed. Please try again.");
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setIsModalOpen(true);
    setLoading(false);
    localStorage.removeItem("selectedDeliveryAddress");
    localStorage.removeItem("selectedBillingAddress");
    if (isBuyNow) {
      localStorage.removeItem("buyNowItem");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    router.push("/accountpage?tab=orders");
  };

  // Helper function to format discount display
  const getDiscountDisplay = (coupon) => {
    if (coupon.offerType === "FREE_PRODUCT") {
      return "Get Free Product";
    }

    if (coupon.discountType === "percentage") {
      return `${coupon.discountValue}% OFF`;
    } else {
      return `₹${coupon.discountValue} OFF`;
    }
  };

  // Helper function to check if coupon is applicable
  const isCouponApplicable = (coupon) => {
    return totalPrice >= (coupon.minPurchaseAmount || 0);
  };


//   if (!user) {
//   return <AuthPage />;
// }

  return (
    <div className="w-full max-w-4xl mx-auto px-6 md:px-6 mb-5">
      <div className="bg-gray-50 rounded-xl shadow-xl border border-gray-100 p-8">
        <h2 className="text-lg font-bold mb-4">Review Your Order</h2>

        {/* Items */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 font-fonttitle">
            Order Summary
          </h2>
          <span className="text-xs md:text-sm text-gray-500 bg-gray-100 px-2 md:px-3 py-0.5 md:py-1 rounded-full font-[Poppins]">
            {items?.length} {items?.length === 1 ? "item" : "items"}
          </span>
        </div>

        <div className="space-y-4 md:space-y-5 mb-4 md:mb-6">
          {items?.map((item) => (
            <div key={item?._id} className="flex gap-3 md:gap-4">
              <div className="relative">
                <img
                  src={item?.productImage?.[0]}
                  alt={item?.productName}
                  className="w-20 h-20 md:w-18 md:h-18 object-cover rounded-lg md:rounded-xl shadow-sm border border-gray-100"
                />
              </div>
              <div className="mt-2 flex-1">
                <h3 className="text-sm md:text-base font-medium text-gray-900 line-clamp-1 font-fonttitle">
                  {item?.productName}
                </h3>

                <div className="mt-2 space-y-1">
                  {item?.selectedVariant?.varientValue && (
                    <div className="flex items-center text-xs text-gray-600">
                      <span>{item.selectedVariant.varientValue}</span>
                    </div>
                  )}

                  {item?.variantDetails?.unit && (
                    <div className="flex items-center text-xs text-gray-600">
                      <span>Unit: {item.variantDetails.unit}</span>
                    </div>
                  )}

                  {item?.selectedUnit && (
                    <div className="flex items-center text-xs text-gray-600">
                      <span>Unit: {item.selectedUnit}</span>
                    </div>
                  )}

                  {item?.variantDetails?.color && (
                    <div className="flex items-center text-xs text-gray-600">
                      <span>{item.variantDetails.color}</span>
                    </div>
                  )}

                  {item?.variantDetails?.size && (
                    <div className="flex items-center text-xs text-gray-600">
                      <span>{item.variantDetails.size}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 md:gap-2 mt-2 text-xs text-gray-500 font-[Poppins]">
                  {item?.quantity && (
                    <span className="bg-gray-100 px-1.5 md:px-2 py-0.5 rounded-full">
                      Qty: {item.quantity}
                    </span>
                  )}
                  {isBuyNow && (
                    <span className="bg-blue-100 text-blue-700 px-1.5 md:px-2 py-0.5 rounded-full">
                      Buy Now
                    </span>
                  )}
                </div>

                <div className="mt-3 md:mt-4 flex items-center justify-between">
                  <div className="text-sm md:text-base font-normal text-gray-900 font-[Poppins]">
                    ₹
                    {(
                      (item?.selectedVariant?.price?.salePrice || 0) *
                      (item?.quantity || 0)
                    ).toFixed(2)}
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded ml-2">
                      incl. ₹{item?.selectedVariant?.price?.taxAmount} GST (
                      {item?.selectedVariant?.price?.taxPercentage}%)
                    </span>
                  </div>

                  {item?.selectedVariant?.price?.costPrice >
                    item?.selectedVariant?.price?.salePrice && (
                    <div className="text-xs text-gray-500 line-through">
                      ₹
                      {(
                        (item.selectedVariant.price.costPrice || 0) *
                        (item.quantity || 0)
                      ).toFixed(2)}
                    </div>
                  )}
                </div>

                {item?.selectedVariant?.price?.savings > 0 && (
                  <div className="mt-1 text-xs text-green-600 font-medium">
                    You save: ₹
                    {(
                      item.selectedVariant.price.savings * (item.quantity || 0)
                    ).toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Applied Coupons Display */}
        {appliedCoupons.length > 0 && (
          <div className="space-y-4 mb-4">
            {appliedCoupons.map((coupon, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border-2 shadow-lg ${
                  coupon.isValid
                    ? "bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 border-green-300"
                    : "bg-gradient-to-r from-red-50 to-pink-50 border-red-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {coupon.type === "FREE_PRODUCT" ? (
                        <Gift className="h-5 w-5 text-green-600" />
                      ) : (
                        <Percent className="h-5 w-5 text-green-600" />
                      )}
                      <span
                        className={`font-bold text-base ${coupon.isValid ? "text-green-700" : "text-red-700"}`}
                      >
                        {coupon.code}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-semibold ${
                          coupon.isValid
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        Applied
                      </span>
                    </div>

                    <p
                      className={`text-sm font-medium mb-3 ${coupon.isValid ? "text-green-600" : "text-red-600"}`}
                    >
                      {coupon.discount}
                    </p>

                    {/* Show Free Product Details with Image */}
                    {coupon.isValid &&
                      coupon.type === "FREE_PRODUCT" &&
                      freeProductInfo && (
                        <div className="bg-white rounded-lg border-2 border-green-300 p-3 shadow-sm">
                          <div className="flex items-start gap-3">
                            {/* Product Image */}
                            {freeProductInfo.productImage && (
                              <div className="flex-shrink-0">
                                <img
                                  src={freeProductInfo.productImage}
                                  alt={freeProductInfo.productName}
                                  className="w-20 h-20 object-cover rounded-lg border-2 border-green-200 shadow-sm"
                                />
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <Gift className="h-4 w-4 text-green-600 flex-shrink-0" />
                                <p className="text-sm font-bold text-green-800">
                                  Your Free Product
                                </p>
                              </div>

                              <p className="text-sm font-semibold text-gray-900 mb-1">
                                {freeProductInfo.productName}
                              </p>

                              {freeProductInfo.variantDetails && (
                                <div className="flex flex-wrap gap-1 mb-1">
                                  {freeProductInfo.variantDetails.size && (
                                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                                      Size:{" "}
                                      {freeProductInfo.variantDetails.size}
                                    </span>
                                  )}
                                  {freeProductInfo.variantDetails.color && (
                                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                                      Color:{" "}
                                      {freeProductInfo.variantDetails.color}
                                    </span>
                                  )}
                                </div>
                              )}

                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                                  Qty: {freeProductInfo.quantity || 1}
                                </span>
                                {freeProductInfo.price > 0 && (
                                  <span className="text-xs text-green-600 font-semibold">
                                    Worth ₹{freeProductInfo.price}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 pt-3 border-t border-green-200">
                            <p className="text-xs text-green-700 font-medium">
                              ✨ This product will be added to your order
                              automatically at checkout!
                            </p>
                          </div>
                        </div>
                      )}
                  </div>

                  <button
                    onClick={handleRemoveCoupon}
                    className="flex-shrink-0 p-2 hover:bg-white rounded-full transition-colors"
                    title="Remove coupon"
                  >
                    <XCircleIcon
                      className={`h-6 w-6 ${coupon.isValid ? "text-green-600" : "text-red-600"}`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Coupon Section */}
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg border border-orange-200 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-orange-600" />
              <h3 className="font-semibold text-gray-800">Apply Coupon</h3>
            </div>
            {availableCoupons.length > 0 && (
              <button
                onClick={() => setShowAllCoupons(!showAllCoupons)}
                className="text-xs text-orange-600 hover:text-orange-700 flex items-center gap-1 font-medium"
              >
                {showAllCoupons ? (
                  <>
                    Hide Coupons <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    View {availableCoupons.length} Coupons{" "}
                    <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>

          {/* Available Coupons List */}
          {showAllCoupons && availableCoupons.length > 0 && (
            <div className="space-y-3 mb-4 max-h-80 overflow-y-auto pr-2">
              {availableCoupons.map((coupon, index) => {
                const isApplicable = isCouponApplicable(coupon);
                const isFreeProduct = coupon.offerType === "FREE_PRODUCT";
                const freeProductDetails = coupon.freeProductDetails;

                return (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      isApplicable
                        ? "bg-white border-orange-200 hover:border-orange-400 hover:shadow-md"
                        : "bg-gray-50 border-gray-200 opacity-60"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Free Product Image */}
                      {isFreeProduct && freeProductDetails?.productImage && (
                        <div className="flex-shrink-0">
                          <img
                            src={freeProductDetails.productImage}
                            alt={freeProductDetails.productName}
                            className="w-16 h-16 object-cover rounded-lg border-2 border-purple-200"
                          />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {isFreeProduct ? (
                            <Gift className="h-4 w-4 text-orange-600 flex-shrink-0" />
                          ) : (
                            <Percent className="h-4 w-4 text-orange-600 flex-shrink-0" />
                          )}
                          <span className="font-bold text-sm text-gray-800">
                            {coupon.code}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                              isFreeProduct
                                ? "bg-purple-100 text-purple-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {getDiscountDisplay(coupon)}
                          </span>
                        </div>

                        <p className="text-xs text-gray-600 mb-2">
                          {coupon.message}
                        </p>

                        {/* Free Product Details */}
                        {isFreeProduct && freeProductDetails && (
                          <div className="bg-purple-50 border border-purple-200 rounded-md p-2 mb-2">
                            <p className="text-xs font-semibold text-purple-900 mb-1">
                              🎁 Free Product Included:
                            </p>
                            <p className="text-xs text-purple-800 font-medium">
                              {freeProductDetails.productName}
                            </p>
                            {freeProductDetails.variantDetails && (
                              <p className="text-xs text-purple-700">
                                {freeProductDetails.variantDetails.displayName}
                              </p>
                            )}
                            {freeProductDetails.price > 0 && (
                              <p className="text-xs text-purple-600 mt-1">
                                Worth: ₹{freeProductDetails.price}
                              </p>
                            )}
                          </div>
                        )}

                        {!isApplicable && (
                          <p className="text-xs text-red-500 font-medium">
                            Min. purchase: ₹{coupon.minPurchaseAmount || 0}
                          </p>
                        )}

                        {coupon.maxDiscountAmount > 0 && !isFreeProduct && (
                          <p className="text-xs text-gray-500">
                            Max discount: ₹{coupon.maxDiscountAmount}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleApplyCoupon(coupon.code)}
                        disabled={!isApplicable || isApplying}
                        className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex-shrink-0 ${
                          isApplicable
                            ? "bg-orange-600 text-white hover:bg-orange-700"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {isApplying ? "Applying..." : "Apply"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Manual Coupon Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 pr-20 text-sm border-2 border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
            <button
              onClick={() => handleApplyCoupon()}
              disabled={isApplying}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {isApplying ? (
                <>
                  <RefreshCwIcon className="h-3 w-3 animate-spin" />
                  Applying
                </>
              ) : (
                "Apply"
              )}
            </button>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
          <div className="flex justify-between text-xs md:text-sm text-gray-700 font-[Poppins]">
            <span>Total Cost Price</span>
            <span>
              ₹
              {items
                .reduce(
                  (sum, i) =>
                    sum +
                    (i?.selectedVariant?.price?.costPrice || 0) *
                      (i?.quantity || 0),
                  0,
                )
                .toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-xs md:text-sm text-green-700 font-[Poppins]">
            <span>Your Savings</span>
            <span>
              ₹
              {items
                .reduce(
                  (sum, i) =>
                    sum +
                    (i?.selectedVariant?.price?.savings || 0) *
                      (i?.quantity || 1),
                  0,
                )
                .toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-xs md:text-sm text-gray-700 font-[Poppins]">
            <span>Subtotal</span>
            <span>₹{(totalPrice || 0).toFixed(2)}</span>
          </div>

          {couponDiscount > 0 && (
            <div className="flex justify-between text-xs md:text-sm text-green-700 font-[Poppins]">
              <span>Coupon Discount</span>
              <span>- ₹{(couponDiscount || 0).toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-xs md:text-sm text-gray-700 font-[Poppins]">
            <span>Shipping</span>
            <span>₹{shipping.toFixed(2)}</span>
          </div>

          <div className="flex justify-between pt-2 md:pt-3 border-t border-gray-200 font-bold text-base md:text-lg text-gray-700 font-[Poppins]">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-4">
          Estimated delivery:{" "}
          <strong>
            {deliveryDay}, {deliveryDate}
          </strong>
        </p>

        {/* Payment Method */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">
            Payment Method
          </h3>
          <div className="flex flex-col gap-2">
            {paymentMethods.map((method) => (
              <label
                key={method.value}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <input
                  type="radio"
                  name="payment"
                  value={method.value}
                  checked={paymentMethod === method.value}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="accent-emerald-800"
                />
                {method.label}
              </label>
            ))}
          </div>
        </div>

        {/* Place Order Button */}
        <button
          onClick={handlePayNow}
          disabled={loading}
          className="w-full bg-bgvariant-1 hover:bg-bgvariant-3 text-white font-medium py-3 rounded-lg transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <RefreshCwIcon className="h-4 w-4 animate-spin" /> Processing...
            </>
          ) : paymentMethod === "RazorPay" ? (
            "Pay Now"
          ) : (
            "Place Order"
          )}
        </button>

        {/* Error Messages */}
        {addressError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 font-semibold">{addressError}</p>
            <p className="text-xs text-red-500 mt-1">
              Please go back to the Shipping section and select both delivery
              and billing addresses.
            </p>
          </div>
        )}

        {paymentError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 font-semibold">Payment Error</p>
            <p className="text-sm text-red-600 mt-1">{paymentError}</p>
            <p className="text-xs text-red-500 mt-2">
              Please try again or contact support if the issue persists.
            </p>
          </div>
        )}
      </div>

      {/* Success Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative bg-gradient-to-br from-emerald-50 via-white to-emerald-100 p-6 sm:p-8 rounded-2xl shadow-xl max-w-md w-full text-center animate-fadeIn">
            <div className="flex items-center justify-center mb-4">
              <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircleIcon className="h-10 w-10 text-emerald-600" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-bgvariant-2 mb-2">
              Order Placed Successfully!
            </h3>

            <p className="text-sm text-gray-700 mb-6 leading-relaxed">
              Your order has been created successfully. You can track order
              status and updates anytime from your orders page.
            </p>

            <button
              onClick={closeModal}
              className="w-full bg-emerald-800 hover:bg-emerald-900 text-white py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md"
            >
              View My Orders
            </button>
          </div>
        </div>
      )}

      {showLoginModal && <AuthPage onClose={() => setShowLoginModal(false)} />}
    </div>
  );
};

export default Review;
