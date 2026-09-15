"use client";

import React from "react";
import { useSelector } from "react-redux";
import ProductCard from "./CartUI";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";

const CategoryProducts = () => {
  const { homeData } = useSelector((state) => state.home);

  const categories =
    homeData?.getAllProductsGroupedByCategory?.categories || [];

  if (!Array.isArray(categories) || categories.length === 0) {
    return null;
  }

  return (
    <div className="space-y-12 py-4">
      {categories.map((catGroup, catIdx) => {
        const title =
          catGroup?.category?.categoryTitle ||
          catGroup?.categoryTitle ||
          `Category ${catIdx + 1}`;
        const rawProducts = catGroup?.products;
        const products = Array.isArray(rawProducts)
          ? rawProducts
          : Array.isArray(rawProducts?.data)
          ? rawProducts.data
          : Array.isArray(rawProducts?.products)
          ? rawProducts.products
          : [];

        if (!products.length) return null;

        return (
          <section
            key={catGroup?.category?._id || catIdx}
            className="py-8 px-4 sm:px-6 md:px-8 lg:px-12 max-w-7xl mx-auto w-full"
          >
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-3 border-b border-gray-100 gap-3">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f4e27] tracking-tight">
                  {title}
                </h2>
                <div className="w-16 h-1 bg-emerald-600 rounded-full mt-2" />
              </div>
              <Link
                href={`/shoppage?category=${encodeURIComponent(title)}`}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-800 hover:text-emerald-950 transition"
              >
                <span>View All</span>
                <FaArrowRight size={11} />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {products.slice(0, 8).map((product, pIdx) => (
                <ProductCard
                  key={product._id || product.id || pIdx}
                  product={product}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default CategoryProducts;
