// components/NewArrivals.jsx
"use client";

import React, { useEffect, useRef } from "react";
import ProductCard from "./CartUI";
import { useSelector } from "react-redux";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const NewArrivals = () => {
  // const { homeData, loading, fetchHomeData } = useHomeStore();

  // useEffect(() => {
  //   fetchHomeData();
  // }, [fetchHomeData]);

  // scroll button

  const { homeData, loading } = useSelector((state) => state.home);

  const newProducts = homeData?.newProductsData?.data || [];

  if (loading) {
    return (
      <section className="pl-10 pr-4 py-12 bg-gray-50">
        <div className="animate-pulse max-w-7xl">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden shadow"
              >
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!newProducts.length) return null;

  return (
    <section className="bg-gray-50 py-8 px-2 md:px-6 sm:px-12">
      <div className="">
        {/* HEADING */}
        <div className="mb-6 flex flex-col items-center text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-normal font-fonttitle text-bgvariant-3 mb-3 px-4">
            New <span className="text-bgvariant-1">Arrivals</span>
          </h2>
          <div className="w-20 sm:w-24 h-1 sm:h-1.5 bg-gradient-to-r from-bgvariant-1 via-bgvariant-4 to-bgvariant-2 rounded-full"></div>
        </div>

        {/* 📱 MOBILE — HORIZONTAL SCROLL */}
        <div className="block md:hidden">
          <div className="flex gap-5  pb-3 "></div>
        </div>
      </div>

      <div className="relative w-full h-auto ">
        {/* 🖥️ DESKTOP GRID – FULL RESPONSIVE */}

       <div className="pb-4 gap-2 md:gap-6 grid grid-cols-2
  sm:grid-cols-2
  md:grid-cols-3
  lg:grid-cols-3
  xl:grid-cols-4
  2xl:grid-cols-6"
>
  {newProducts.map((product) => (
    <ProductCard key={product._id} product={product} />
  ))}
</div>

      </div>
    </section>
  );
};

export default NewArrivals;
