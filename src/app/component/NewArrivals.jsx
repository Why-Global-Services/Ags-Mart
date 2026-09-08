// components/NewArrivals.jsx
"use client";

import React, { useEffect, useRef } from "react";
import ProductCard from "./CartUI";
import { useSelector } from "react-redux";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import { AgroCardSkeleton } from "../common/Loading";

const NewArrivals = () => {
  const { homeData, loading } = useSelector((state) => state.home);

  const rawProducts = homeData?.newProductsData;
  const newProducts = Array.isArray(rawProducts)
    ? rawProducts
    : Array.isArray(rawProducts?.data)
    ? rawProducts.data
    : Array.isArray(rawProducts?.products)
    ? rawProducts.products
    : [];

  if (loading) {
    return (
      <section className="bg-gray-50 py-8 px-2 md:px-6 sm:px-12">
        <div className="mb-6 flex flex-col items-center text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-normal font-fonttitle text-bgvariant-3 mb-3 px-4">
            New <span className="text-bgvariant-1">Arrivals</span>
          </h2>
          <div className="w-20 sm:w-24 h-1 sm:h-1.5 bg-gradient-to-r from-bgvariant-1 via-bgvariant-4 to-bgvariant-2 rounded-full"></div>
        </div>
        <AgroCardSkeleton count={4} />
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
