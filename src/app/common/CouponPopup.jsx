"use client";

import { useEffect, useState } from "react";
import { getUserBasedCoupon } from "../interceptor/interseptor";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

export default function WelcomePopup() {
  const [show, setShow] = useState(false);
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(true);
  const logo = useSelector((state) => state.webSettings.logo)

  /* ---------------- FETCH COUPON ---------------- */
  const fetchCoupon = async () => {
    try {
      const res = await getUserBasedCoupon();
      const couponData = res?.data?.[0] || null;
      if (couponData) {
        setCoupon(couponData);
      }
    } catch (error) {
      console.error("Coupon Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    if (typeof window === "undefined") return;

    fetchCoupon();

    const seen = localStorage.getItem("coupon_popup_seen");
    if (!seen) {
      setTimeout(() => {
        setShow(true);
      }, 1200);
    }
  }, []);

  /* ---------------- CLOSE ---------------- */
  const closePopup = () => {
    localStorage.setItem("coupon_popup_seen", "true");
    setShow(false);
  };

  /* ---------------- COPY FROM IMAGE CLICK ---------------- */
  const copyCode = async () => {
    if (!coupon?.code) return;

    try {
      await navigator.clipboard.writeText(coupon.code);
      toast.success(`Coupon "${coupon.code}" copied successfully! 🎉`, {
        duration: 2000,
        position: "bottom-center",
        style: {
          background: '#10b981',
          color: '#fff',
          fontWeight: 'bold',
          padding: '16px',
          borderRadius: '12px'
        }
      });
      
      // Auto close after 1 second
      setTimeout(() => {
        closePopup();
      }, 1000);
      
    } catch (err) {
      toast.error("Failed to copy coupon ❌");
    }
  };

  if (!show || !coupon || loading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md px-4">

      {/* Popup Container */}
      <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-fadeIn">

        {/* Close Button */}
        <button
          onClick={closePopup}
          className="absolute top-4 right-4 z-20 text-white bg-black/60 hover:bg-black/80 rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200 shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Logo Badge */}
        {logo && (
          <div className="absolute top-4 left-4 z-20">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-2 shadow-lg">
              <img
                src={logo}
                alt="Agrowmed"
                className="w-8 h-8"
              />
            </div>
          </div>
        )}

        {/* Main Coupon Image - Clickable */}
        <div 
          className="relative cursor-pointer group"
          onClick={copyCode}
        >
          {/* Click overlay with instructions */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end pb-8">
            <div className="text-white text-center px-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 inline-block mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-lg font-bold mb-1">Click to Copy Coupon</p>
              <p className="text-sm opacity-90">Code: <span className="font-mono font-bold">{coupon.code}</span></p>
            </div>
          </div>

          {/* Coupon Image */}
          {coupon.couponImage ? (
            <img
              src={coupon.couponImage}
              alt="Welcome Coupon"
              className="w-full h-auto max-h-[500px] object-cover"
            />
          ) : (
            // Fallback design if no image
            <div className="bg-gradient-to-r from-[#1a4a13] to-[#2d7a22] p-8 text-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-4">
                <h3 className="text-3xl font-bold text-white mb-2">WELCOME OFFER</h3>
                <p className="text-white/90 text-lg">Special discount for you!</p>
              </div>
              <div className="bg-white rounded-xl p-4 inline-block">
                <p className="text-gray-600 text-sm mb-1">Your Coupon Code</p>
                <p className="text-2xl font-bold text-gray-800 font-mono">{coupon.code}</p>
              </div>
            </div>
          )}

          {/* Tap/Click Indicator (Mobile friendly) */}
          <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Click to Copy
          </div>
        </div>

        {/* Coupon Details Bar */}
        <div className="bg-bgvariant-1 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className="font-bold text-lg mb-1">
                {coupon.offerType === "DISCOUNT" ? (
                  <>
                    {coupon.discountType === "percentage"
                      ? `${coupon.discountValue}% OFF`
                      : `₹${coupon.discountValue} OFF`}
                  </>
                ) : (
                  "Free Product"
                )}
              </p>
              <p className="text-sm opacity-90">
                {coupon.minPurchaseAmount > 0 
                  ? `On orders above ₹${coupon.minPurchaseAmount}`
                  : 'No minimum order'}
              </p>
            </div>
            
            <button
              onClick={() => {
                window.location.href = "/shoppage";
                closePopup();
              }}
              className="bg-white text-bgvariant-1 hover:bg-gray-100 font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Shop Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}