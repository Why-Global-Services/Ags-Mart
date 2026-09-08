"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

import { AgroCategorySkeleton } from "../common/Loading";

const AllCategory = () => {
  const router = useRouter();
  const { homeData, loading } = useSelector((state) => state.home);

  const handleNavigation = (categoryTitle) => {
    router.push(`/shoppage?category=${encodeURIComponent(categoryTitle)}`);
  };

  const categories = homeData?.categories || [];

  return (
    <section className="py-8 sm:py-12 md:py-14 bg-gradient-to-b from-green-50/40 to-white w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal font-fonttitle text-bgvariant-3 mb-2 px-4">
            Shop by <span className="text-bgvariant-1">Category</span>
          </h2>
          <div className="w-20 sm:w-24 h-1 sm:h-1.5 bg-gradient-to-r from-bgvariant-1 via-bgvariant-4 to-bgvariant-2 mx-auto rounded-full"></div>
          <p className="mt-2.5 text-gray-600 text-xs sm:text-sm max-w-2xl font-fontcontent mx-auto px-4">
            Find everything your farm needs, from certified seeds to modern equipment
          </p>
        </div>

        {/* Loading State */}
        {loading && !categories.length ? (
          <AgroCategorySkeleton count={6} />
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
          </div>
        ) : (
          /* Circular Category Tiles */
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4 md:gap-5">
            {categories.map((category, index) => (
              <button
                key={category._id}
                onClick={() => handleNavigation(category.categoryTitle)}
                className="group flex flex-col items-center cursor-pointer p-2 rounded-xl hover:bg-white hover:shadow-md transition-all duration-200 focus:outline-none"
                aria-label={`View ${category.categoryTitle} category`}
              >
                {/* Circular image container */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-26 md:h-26 rounded-full overflow-hidden border-2 border-green-100 bg-white shadow-sm group-hover:border-green-500 group-hover:scale-105 transition-all duration-300">
                  <Image
                    src={category.categoryImage}
                    alt={category.categoryTitle}
                    fill
                    sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 16vw, 12vw"
                    className="object-cover"
                    loading={index < 10 ? "eager" : "lazy"}
                    quality={90}
                    priority={index < 8}
                  />
                </div>

                {/* Title Below Image */}
                <h3 className="mt-2 text-xs sm:text-sm font-medium text-gray-700 group-hover:text-bgvariant-1 transition-colors text-center line-clamp-2 leading-tight">
                  {category.categoryTitle}
                </h3>
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