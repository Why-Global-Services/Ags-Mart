"use client";

import React from "react";
import "./loader.css";

/**
 * Agriculture Themed Animated Sprout Illustration
 */
export const AgroSproutGraphic = ({ size = "md" }) => {
  const dimension =
    size === "sm" ? 72 : size === "lg" ? 120 : 96;

  return (
    <div className="relative flex items-center justify-center">
      {/* Sunlight glow backdrop */}
      <div className="absolute w-20 h-20 bg-amber-100/50 rounded-full blur-xl animate-sun-glow pointer-events-none" />

      {/* Earth / soil ripple aura */}
      <div className="absolute bottom-2 w-16 h-5 bg-emerald-200/40 rounded-full blur-sm animate-earth-pulse pointer-events-none" />

      <svg
        width={dimension}
        height={dimension}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
      >
        <defs>
          {/* Stem & leaf gradients */}
          <linearGradient id="agroStemGrad" x1="50" y1="75" x2="50" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1a4a13" />
            <stop offset="60%" stopColor="#2d7a22" />
            <stop offset="100%" stopColor="#4c9d40" />
          </linearGradient>

          <linearGradient id="agroLeafLeftGrad" x1="20" y1="35" x2="50" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#5aab4e" />
            <stop offset="70%" stopColor="#2d7a22" />
            <stop offset="100%" stopColor="#1a4a13" />
          </linearGradient>

          <linearGradient id="agroLeafRightGrad" x1="80" y1="30" x2="50" y2="45" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="50%" stopColor="#4c9d40" />
            <stop offset="100%" stopColor="#1a4a13" />
          </linearGradient>

          <linearGradient id="agroSoilGrad" x1="25" y1="75" x2="75" y2="85" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3f2e18" />
            <stop offset="50%" stopColor="#5c4028" />
            <stop offset="100%" stopColor="#2e1f0f" />
          </linearGradient>

          <linearGradient id="agroSeedGrad" x1="45" y1="70" x2="55" y2="76" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ca8a04" />
            <stop offset="100%" stopColor="#854d0e" />
          </linearGradient>
        </defs>

        {/* Soil Mound / Earth Base */}
        <ellipse cx="50" cy="80" rx="26" ry="7" fill="url(#agroSoilGrad)" opacity="0.9" />
        <ellipse cx="50" cy="78" rx="20" ry="4.5" fill="#4a3520" opacity="0.6" />

        {/* Seed at bottom */}
        <ellipse cx="50" cy="75" rx="5.5" ry="3.5" fill="url(#agroSeedGrad)" />

        {/* Plant Group with gentle animation */}
        <g className="animate-sprout-grow">
          {/* Main Stem */}
          <path
            d="M 50 75 Q 49 55 50 32"
            stroke="url(#agroStemGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Left Leaf */}
          <g className="animate-leaf-left">
            <path
              d="M 50 48 C 36 46 22 36 24 24 C 36 22 48 36 50 48 Z"
              fill="url(#agroLeafLeftGrad)"
            />
            {/* Left Leaf Vein */}
            <path
              d="M 50 48 Q 38 38 28 28"
              stroke="#bbf7d0"
              strokeWidth="0.9"
              strokeLinecap="round"
              opacity="0.8"
            />
          </g>

          {/* Right Leaf */}
          <g className="animate-leaf-right">
            <path
              d="M 50 40 C 64 38 78 26 76 16 C 64 14 52 28 50 40 Z"
              fill="url(#agroLeafRightGrad)"
            />
            {/* Right Leaf Vein */}
            <path
              d="M 50 40 Q 62 30 72 20"
              stroke="#dcfce7"
              strokeWidth="0.9"
              strokeLinecap="round"
              opacity="0.9"
            />
          </g>

          {/* Top Bud / Sprout Tip */}
          <circle cx="50" cy="30" r="2.5" fill="#86efac" />
        </g>

        {/* Floating Mini Leaf Particles */}
        <g className="animate-leaf-float-1">
          <path
            d="M 32 38 C 28 34 26 28 29 26 C 32 26 34 32 32 38 Z"
            fill="#4ade80"
            opacity="0.75"
          />
        </g>
        <g className="animate-leaf-float-2">
          <path
            d="M 68 34 C 72 30 74 24 71 22 C 68 22 66 28 68 34 Z"
            fill="#22c55e"
            opacity="0.75"
          />
        </g>
      </svg>
    </div>
  );
};

/**
 * Compact Agro Spinner for buttons, inputs, and search dropdowns
 */
export const AgroSpinner = ({ size = "md", color = "text-emerald-700" }) => {
  const dim = size === "sm" ? "w-5 h-5" : size === "lg" ? "w-8 h-8" : "w-6 h-6";
  return (
    <div className={`relative ${dim} flex items-center justify-center`}>
      <div className={`animate-spin rounded-full ${dim} border-2 border-green-100 border-t-emerald-700`} />
      <span className="absolute text-[10px] leading-none select-none">🌱</span>
    </div>
  );
};

/**
 * Agriculture Product Card Skeleton
 */
export const AgroCardSkeleton = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 w-full">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl overflow-hidden shadow-sm border border-green-50 flex flex-col agro-shimmer-bg"
        >
          {/* Card Image Placeholder with Sprout Watermark */}
          <div className="h-48 sm:h-56 bg-green-50/60 relative flex items-center justify-center">
            <svg
              className="w-12 h-12 text-emerald-300/40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V6m0 0l-4 4m4-4l4 4" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 19c0-4 3.5-7 7-7s7 3 7 7" />
            </svg>
          </div>
          {/* Card Details */}
          <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="h-3.5 bg-green-200/50 rounded-full w-3/4" />
              <div className="h-3 bg-green-100/60 rounded-full w-1/2" />
            </div>
            <div className="pt-2 flex items-center justify-between">
              <div className="h-5 bg-green-200/60 rounded-md w-20" />
              <div className="h-8 bg-green-600/20 rounded-lg w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Agriculture Category Circular Skeleton
 */
export const AgroCategorySkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 w-full py-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full agro-shimmer-bg border border-green-100 shadow-sm flex items-center justify-center">
            <span className="text-xl opacity-40">🌱</span>
          </div>
          <div className="h-3.5 bg-green-100 rounded-full w-16" />
        </div>
      ))}
    </div>
  );
};

/**
 * Main Agricultural Loading View
 */
const Loading = ({
  text = "Preparing your farm essentials...",
  subtext = "Seeds • Crop Protection • Fertilizers • Equipment",
  fullScreen = true,
  size = "md",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center px-4 transition-all duration-300 ${
        fullScreen ? "min-h-[70vh] w-full" : "py-12 w-full"
      }`}
    >
      {/* Animated Agriculture Sprout Graphic */}
      <div className="mb-4">
        <AgroSproutGraphic size={size} />
      </div>

      {/* Main Loading Heading */}
      <p className="text-base sm:text-lg font-semibold text-[#1a4a13] font-fonttitle text-center tracking-wide">
        {text}
      </p>

      {/* Agriculture subtext */}
      {subtext && (
        <p className="text-xs sm:text-sm text-gray-500 font-fontcontent text-center mt-1 max-w-sm">
          {subtext}
        </p>
      )}

      {/* Pulsing Green Dots */}
      <div className="flex items-center gap-1.5 mt-3">
        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-2 h-2 rounded-full bg-emerald-700 animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
};

export default Loading;
