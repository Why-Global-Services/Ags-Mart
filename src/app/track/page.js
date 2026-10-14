"use client";

import React, { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
  Search,
  ArrowLeft,
  Copy,
  Check,
  AlertCircle,
  RefreshCw,
  Phone,
  Mail,
  ShieldCheck,
  Building2,
  Calendar,
} from "lucide-react";
import { getOrderTracking } from "@/app/interceptor/interseptor";

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialOrderId = searchParams ? searchParams.get("orderId") || "" : "";

  const [orderIdInput, setOrderIdInput] = useState(initialOrderId);
  const [activeOrderId, setActiveOrderId] = useState(initialOrderId);
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [trackingDetails, setTrackingDetails] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Fetch tracking data for orderId
  const loadTracking = useCallback(async (id) => {
    if (!id || !id.trim()) {
      setOrderData(null);
      setTrackingDetails(null);
      setError(null);
      return;
    }
    const cleanId = id.trim();
    setLoading(true);
    setError(null);
    try {
      const res = await getOrderTracking(cleanId);
      if (res && res.data) {
        setOrderData(res.data);
        setTrackingDetails(res.trackingDetails || null);
      } else if (res && res.orderId) {
        setOrderData(res);
        setTrackingDetails(null);
      } else {
        throw new Error(res?.message || "No tracking information found for this order ID.");
      }
    } catch (err) {
      console.error("Tracking fetch error:", err);
      setError(
        err.message ||
          "Unable to find an order matching that ID. Please check the order number and try again."
      );
      setOrderData(null);
      setTrackingDetails(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialOrderId) {
      setOrderIdInput(initialOrderId);
      setActiveOrderId(initialOrderId);
      loadTracking(initialOrderId);
    }
  }, [initialOrderId, loadTracking]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!orderIdInput.trim()) return;
    const clean = orderIdInput.trim();
    setActiveOrderId(clean);
    router.push(`/track?orderId=${encodeURIComponent(clean)}`);
    loadTracking(clean);
  };

  const handleCopyAwb = (awb) => {
    if (!awb) return;
    navigator.clipboard?.writeText(awb);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Derive status
  const currentStatus = orderData?.orderStatus || "Ordered";
  const shiprocketStatus = orderData?.shiprocket?.status || "";
  const courierName = orderData?.shiprocket?.courierName || "";
  const awbCode = orderData?.shiprocket?.awbCode || "";

  // Derive genuine courier tracking URL
  let courierTrackUrl = null;
  if (
    orderData?.shiprocket?.trackingUrl &&
    typeof orderData.shiprocket.trackingUrl === "string" &&
    orderData.shiprocket.trackingUrl.startsWith("http")
  ) {
    courierTrackUrl = orderData.shiprocket.trackingUrl;
  } else if (trackingDetails?.track_url && trackingDetails.track_url.startsWith("http")) {
    courierTrackUrl = trackingDetails.track_url;
  } else if (awbCode) {
    courierTrackUrl = `https://shiprocket.co/tracking/${awbCode}`;
  }

  // Visual Milestone Steps
  const isCancelled = currentStatus === "Cancelled";
  const isReturned = ["Return Request", "Returned", "Partial"].includes(currentStatus);

  const steps = [
    { key: "Ordered", label: "Order Placed", desc: "Order confirmed with seller" },
    { key: "Packing", label: "Packed & Ready", desc: "Items verified and packaged" },
    { key: "Shipped", label: "In Transit", desc: "Handed over to courier partner" },
    { key: "Out for Delivery", label: "Out for Delivery", desc: "Out with local delivery agent" },
    { key: "Delivered", label: "Delivered", desc: "Package delivered safely" },
  ];

  const getActiveStepIndex = () => {
    if (isCancelled) return -1;
    switch (currentStatus) {
      case "Pending":
      case "Ordered":
        return 0;
      case "Packing":
        return 1;
      case "Shipped":
        return 2;
      case "Out for Delivery":
        return 3;
      case "Delivered":
        return 4;
      default:
        // Try mapping shiprocketStatus if orderStatus is still Ordered
        if (/out\s*for\s*delivery/i.test(shiprocketStatus)) return 3;
        if (/in\s*transit|shipped|picked\s*up/i.test(shiprocketStatus)) return 2;
        if (/delivered/i.test(shiprocketStatus)) return 4;
        return 0;
    }
  };

  const activeStepIdx = getActiveStepIndex();

  // Scan activities from Shiprocket
  const scanActivities = Array.isArray(trackingDetails?.shipment_track_activities)
    ? trackingDetails.shipment_track_activities
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
          <Link
            href="/accountpage/orders"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Orders
          </Link>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified Agrowmed Tracking
            </span>
          </div>
        </div>

        {/* Title & Search Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Live Shipment Tracking
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Enter your order ID to see real-time courier updates, dispatch milestones, and delivery status.
              </p>
            </div>
            {activeOrderId && (
              <button
                type="button"
                onClick={() => loadTracking(activeOrderId)}
                disabled={loading}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-emerald-700 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors shrink-0"
                title="Refresh tracking data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            )}
          </div>

          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                placeholder="Enter Agrowmed Order ID (e.g. AGROWMED-261014...)"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !orderIdInput.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-800 hover:to-emerald-700 text-white font-semibold text-sm rounded-xl shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {loading ? "Searching..." : "Track Package"}
            </button>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm">
            <div className="inline-block w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
            <h3 className="text-base font-semibold text-gray-800">
              Fetching live tracking details...
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Synchronizing with Shiprocket courier network
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-white rounded-2xl p-8 border border-red-200 shadow-sm text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Order Not Found</h3>
            <p className="text-sm text-gray-600 max-w-md mx-auto mb-6">{error}</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/accountpage/orders"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                View Orders in Account
              </Link>
              <a
                href="mailto:sales@agrowmed.com"
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg transition-colors"
              >
                Contact Support
              </a>
            </div>
          </div>
        )}

        {/* Initial Prompt State (No Order ID entered yet) */}
        {!loading && !error && !orderData && !activeOrderId && (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4">
              <Package className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Track Your Agrowmed Order
            </h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Please enter your Agrowmed Order ID above or click the tracking link directly from your order confirmation email.
            </p>
          </div>
        )}

        {/* Active Order Tracking Result */}
        {!loading && !error && orderData && (
          <div className="space-y-6">
            {/* Overview Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Agrowmed Order ID
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-lg font-bold text-gray-900">
                      #{orderData.orderId}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyAwb(orderData.orderId)}
                      className="text-gray-400 hover:text-gray-700 p-1 rounded"
                      title="Copy Order ID"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  {orderData.createdAt && (
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Placed on{" "}
                      {new Date(orderData.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-gray-500 block">Total Amount</span>
                    <span className="text-lg font-bold text-gray-900">
                      ₹{Number(orderData.totalPrice || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
                    {orderData.paymentMethod || "COD"}
                  </div>
                </div>
              </div>

              {/* Courier & AWB Banner */}
              <div className="mt-4 pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                  <div>
                    <span className="text-xs text-gray-500 block">Courier Partner</span>
                    <span className="font-semibold text-gray-900 flex items-center gap-1.5 mt-0.5">
                      <Truck className="w-4 h-4 text-emerald-700" />
                      {courierName || "Assigned upon dispatch"}
                    </span>
                  </div>

                  {awbCode ? (
                    <div>
                      <span className="text-xs text-gray-500 block">AWB / Tracking Number</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono font-bold text-gray-900">{awbCode}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyAwb(awbCode)}
                          className="text-gray-400 hover:text-gray-700 p-0.5"
                          title="Copy AWB Number"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <div>
                    <span className="text-xs text-gray-500 block">Shipment Status</span>
                    <span className="inline-block mt-0.5 uppercase px-2 py-0.5 rounded text-xs font-bold bg-white text-emerald-700 border border-emerald-200 shadow-2xs">
                      {shiprocketStatus || currentStatus}
                    </span>
                  </div>
                </div>

                {courierTrackUrl && (
                  <a
                    href={courierTrackUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors shrink-0"
                  >
                    View on Courier Website
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Stepper Progress */}
            {!isCancelled && !isReturned && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">
                  Shipment Progress
                </h3>
                <div className="relative">
                  {/* Stepper track desktop */}
                  <div className="hidden md:block absolute top-4 left-6 right-6 h-1 bg-gray-200 -z-0">
                    <div
                      className="h-full bg-emerald-600 transition-all duration-700"
                      style={{
                        width: `${Math.max(0, Math.min(100, (activeStepIdx / (steps.length - 1)) * 100))}%`,
                      }}
                    />
                  </div>

                  {/* Steps */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
                    {steps.map((st, i) => {
                      const isCompleted = i <= activeStepIdx;
                      const isCurrent = i === activeStepIdx;

                      return (
                        <div
                          key={st.key}
                          className="flex md:flex-col items-center md:items-center text-left md:text-center gap-3 md:gap-2"
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                              isCompleted
                                ? "bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-xs"
                                : "bg-gray-100 text-gray-400 border border-gray-300"
                            }`}
                          >
                            {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : i + 1}
                          </div>
                          <div>
                            <p
                              className={`text-xs font-bold ${
                                isCurrent
                                  ? "text-emerald-800"
                                  : isCompleted
                                  ? "text-gray-900"
                                  : "text-gray-400"
                              }`}
                            >
                              {st.label}
                            </p>
                            <p className="text-[11px] text-gray-500 mt-0.5 hidden md:block">
                              {st.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Cancelled / Return State Banner if applicable */}
            {(isCancelled || isReturned) && (
              <div
                className={`p-5 rounded-2xl border ${
                  isCancelled
                    ? "bg-red-50 border-red-200 text-red-900"
                    : "bg-amber-50 border-amber-200 text-amber-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm">
                      {isCancelled ? "Order Cancelled" : "Return / Refund Process"}
                    </h4>
                    <p className="text-xs opacity-90 mt-0.5">
                      {isCancelled
                        ? "This order has been cancelled and will not be dispatched."
                        : `Current status: ${currentStatus}. Our support team will assist with return pickup.`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Scan Activities / Timeline */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center justify-between">
                <span>Courier Scan History</span>
                {scanActivities.length > 0 && (
                  <span className="text-xs font-normal text-gray-500 lowercase">
                    {scanActivities.length} updates logged
                  </span>
                )}
              </h3>

              {scanActivities.length > 0 ? (
                <div className="space-y-4 relative pl-4 sm:pl-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-200">
                  {scanActivities.map((act, idx) => (
                    <div key={idx} className="relative flex items-start gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 ring-4 ring-emerald-100 absolute -left-[21px] top-1.5" />
                      <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                          <span className="font-bold text-gray-900">
                            {act.activity || act["sr-status"] || act.status}
                          </span>
                          <span className="text-gray-500 font-mono">
                            {act.date || act.updated_at || ""}
                          </span>
                        </div>
                        {act.location && (
                          <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-emerald-700" />
                            {act.location}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-5 text-left">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-950">
                        {awbCode
                          ? "Shipment Manifested — Awaiting Courier Pickup"
                          : "Order Confirmed — Preparing for Dispatch"}
                      </h4>
                      <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                        {awbCode
                          ? `Your shipment has been assigned to ${courierName || "courier partner"} under AWB ${awbCode}. The courier has been scheduled for pickup at our fulfillment center. Check back shortly for transit scans.`
                          : "Our fulfillment team is preparing your agricultural items for safe packing and courier pickup. Live tracking scans will update automatically as soon as the courier scans the package."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Delivery Details & Order Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Delivery Address */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  Delivery Address
                </h3>
                {orderData.deliveryAddress ? (
                  <div className="text-sm text-gray-700 space-y-1">
                    <p className="font-bold text-gray-900">
                      {orderData.deliveryAddress.name || orderData.userName}
                    </p>
                    <p>{orderData.deliveryAddress.address || orderData.deliveryAddress.street}</p>
                    <p>
                      {[
                        orderData.deliveryAddress.city,
                        orderData.deliveryAddress.state,
                        orderData.deliveryAddress.pincode,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    {orderData.deliveryAddress.phone && (
                      <p className="text-xs text-gray-500 pt-1 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {orderData.deliveryAddress.phone}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Address on file with order.</p>
                )}
              </div>

              {/* Order Items Summary */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-emerald-700" />
                  Items in Package
                </h3>
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {orderData.orderDetails?.map((itemGroup, idx) => {
                    const productsList = Array.isArray(itemGroup.products)
                      ? itemGroup.products
                      : itemGroup.products
                      ? [itemGroup.products]
                      : [];

                    return productsList.map((p, pIdx) => {
                      const name =
                        p.productDetails?.productName ||
                        p.productName ||
                        p.name ||
                        "Agrowmed Product";
                      const image =
                        p.productDetails?.productImages?.[0] ||
                        p.productDetails?.nonVariant?.nonVariantImages?.[0] ||
                        "/placeholder.png";

                      return (
                        <div
                          key={`${idx}-${pIdx}`}
                          className="flex items-center gap-3 pb-2 border-b border-gray-100 last:border-0"
                        >
                          <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden relative shrink-0">
                            <Image
                              src={image}
                              alt={name}
                              fill
                              className="object-contain p-1"
                              unoptimized
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-900 truncate">
                              {name}
                            </p>
                            <p className="text-[11px] text-gray-500">
                              Qty: {p.quantity || 1} • ₹{Number(p.price || p.subtotal || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      );
                    });
                  })}
                </div>
              </div>
            </div>

            {/* Need Help Card */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-center">
              <h4 className="text-sm font-bold text-gray-900 mb-1">Need Help With Your Shipment?</h4>
              <p className="text-xs text-gray-600 mb-4 max-w-md mx-auto">
                Our customer assistance team is available to help with delivery status, courier inquiries, and address verification.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <a
                  href="mailto:sales@agrowmed.com"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-900"
                >
                  <Mail className="w-3.5 h-3.5" />
                  sales@agrowmed.com
                </a>
                <Link
                  href="/shoppage"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:underline"
                >
                  Explore More Agricultural Supplies &rarr;
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-gray-500">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Loading tracking portal...</p>
          </div>
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
