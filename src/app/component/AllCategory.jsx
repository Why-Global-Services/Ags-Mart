"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

const AllCategory = () => {
  const router = useRouter();
  const { homeData, loading } = useSelector((state) => state.home);

  const handleNavigation = (categoryTitle) => {
    router.push(`/shoppage?category=${encodeURIComponent(categoryTitle)}`);
  };

  const categories = homeData?.categories || [];

  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-10 md:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-normal font-fonttitle text-bgvariant-3 mb-3 px-4">
            Featured <span className="text-bgvariant-1">Categories</span>
          </h2>
          <div className="w-20 sm:w-24 h-1 sm:h-1.5 bg-gradient-to-r from-bgvariant-1  via-bgvariant-4 to-bgvariant-2 mx-auto rounded-full"></div>
          <p className="mt-3 sm:mt-4 text-gray-600 text-xs sm:text-sm md:text-base max-w-2xl font-fontcontent  mx-auto px-4">
            Explore our curated collection of premium categories
          </p>
        </div>

        {/* Loading State */}
        {loading && !categories.length ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-gray-200"></div>
              <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-emerald-600 border-t-transparent absolute top-0 left-0"></div>
            </div>
            <p className="text-gray-600 text-base sm:text-lg mt-4 sm:mt-6 font-medium">
              Loading categories...
            </p>
          </div>
        ) : categories.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 sm:py-20 px-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-base sm:text-lg font-medium">
              No categories available
            </p>
            <p className="text-gray-400 text-xs sm:text-sm mt-2">
              Check back soon for updates
            </p>
          </div>
        ) : (
          /* 5 Column Grid Layout */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {categories.map((category, index) => (
              <button
                key={category._id}
                onClick={() => handleNavigation(category.categoryTitle)}
                className="group relative flex flex-col items-center justify-end bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg sm:rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 overflow-hidden border border-gray-100 hover:border-emerald-200 w-full h-[160px] sm:h-[180px] md:h-[200px] lg:h-[220px] active:scale-95 p-3 sm:p-4"
                aria-label={`View ${category.categoryTitle} category`}
              >
                {/* Background Gradient Overlay - Darker for better text visibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-300"></div>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/10 transition-all duration-500"></div>

                {/* Image - Full Container Background */}
                <div className="absolute inset-0">
                  <Image
                    src={category.categoryImage}
                    alt={category.categoryTitle}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    className="object-cover transition-all duration-500 group-hover:scale-110"
                    loading={index < 10 ? "eager" : "lazy"}
                    quality={90}
                    priority={index < 10}
                  />
                </div>

                {/* Title - Overlaid at Bottom with Enhanced Visibility */}
                <div className="relative z-10 w-full">
                  <h3 className="text-white font-bold text-xs sm:text-sm md:text-base group-hover:text-emerald-200 transition-colors duration-300 text-center leading-tight [text-shadow:_2px_2px_8px_rgb(0_0_0_/_80%)] group-hover:[text-shadow:_2px_2px_12px_rgb(0_0_0_/_90%)]">
                    {category.categoryTitle}
                  </h3>
                </div>

                {/* Bottom Accent Line */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center"></div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default AllCategory;