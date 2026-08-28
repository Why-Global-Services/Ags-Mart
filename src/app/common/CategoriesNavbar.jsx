"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiMenu, FiX, FiHome, FiUser, FiMail } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { fetchNavbarData } from "@/app/store/navbarSlice";

const CategoryNavbar = () => {
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileCategory, setOpenMobileCategory] = useState(null);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams?.get("category") || "";

  const dispatch = useDispatch();
  const categories = useSelector((state) => state.navbar.categories);

  useEffect(() => {
    dispatch(fetchNavbarData());
  }, [dispatch]);

  const isPathActive = (target) =>
    pathname === target || pathname.startsWith(`${target}/`);

  const categoryOrder = ["Body Care", "Hair Care", "Face Care"];
  const orderedCategories = categoryOrder
    .map((title) => categories.find((c) => c.categoryTitle === title))
    .filter(Boolean);
  const remainingCategories = categories.filter(
    (c) => !categoryOrder.includes(c.categoryTitle)
  );
  const allCategories = [...orderedCategories, ...remainingCategories];

  return (
    <>
      <div className="bg-white border-b-2 border-purple-100 sticky top-24 z-40 shadow-sm">
        <div className=" px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-bgvariant-3 text-white rounded-lg transition font-semibold text-sm"
            >
              <FiMenu className="text-lg" />
              <span>All Categories</span>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center w-full justify-center">
              <ul className="flex items-center gap-10">
                <li className="relative group">
                  <Link
                    href="/"
                    className={`flex font-fontcontent items-center gap-2 text-sm font-medium cursor-pointer uppercase tracking-wider transition-colors ${
                      isPathActive("/")
                        ? "text-gray-700 "
                        : "text-gray-700 hover:text-purple-700"
                    }`}
                  >
                    {isPathActive("/") && <HiSparkles className="text-bgvariant-2" />}
                    Home
                  </Link>
                  <span
                    className={`absolute left-0 -bottom-2 h-1 bg-gradient-to-r from-[#F4D68D] to-[#DCAF5E] rounded-full transition-all ${
                      isPathActive("/") ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </li>

                {allCategories.map((category) => {
                  const hasSub =
                    Array.isArray(category.subCategories) &&
                    category.subCategories.length > 0;
                  const isCategoryActive =
                    pathname.startsWith("/shoppage") &&
                    activeCategory === category.categoryTitle;

                  return (
                    <li
                      key={category._id}
                      className="relative group font-fontcontent"
                      onMouseEnter={() => hasSub && setHoveredCategory(category._id)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    >
                      <button
                        onClick={() => {
                          if (!hasSub) {
                            router.push(
                              `/shoppage?category=${encodeURIComponent(
                                category.categoryTitle
                              )}`
                            );
                          }
                        }}
                        className={`flex items-center gap-2 text-sm cursor-pointer font-medium uppercase tracking-wider transition-colors ${
                          isCategoryActive
                            ? "text-gray-700"
                            : "text-gray-700 "
                        }`}
                      >
                        {isCategoryActive && <HiSparkles className="text-bgvariant-2" />}
                        {category.categoryTitle}
                        {hasSub && (
                          <FiChevronDown
                            className={`text-sm transition-transform ${
                              hoveredCategory === category._id ? "rotate-180" : ""
                            }`}
                          />
                        )}
                      </button>

                      <span
                        className={`absolute left-0 -bottom-2 h-1  bg-gradient-to-r from-[#F4D68D] to-[#DCAF5E] rounded-full transition-all ${
                          isCategoryActive ? "w-full" : "w-0 group-hover:w-full"
                        }`}
                      />

                      {/* Mega Menu Dropdown */}
                      <AnimatePresence>
                        {hasSub && hoveredCategory === category._id && (
                          <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 15 }}
                            transition={{ duration: 0.25 }}
                            className="absolute left-1/2 -translate-x-1/2 top-full mt-6 w-72  bg-white shadow-2xl border-2 border-bgvariant-3/15 overflow-hidden"
                          >
                            {/* <div className="bg-gradient-to-r from-purple-700 to-pink-600 text-white px-5 py-3">
                              <h3 className="font-bold text-sm uppercase tracking-wider">
                                {category.categoryTitle}
                              </h3>
                            </div> */}
                            <div className="py-2 max-h-96 overflow-y-auto ">
                              {category.subCategories.map((sub, index) => {
                                const label =
                                  sub.subCategoryTitle ||
                                  sub.title ||
                                  sub.name ||
                                  "Subcategory";
                                const isSubActive =
                                  pathname.startsWith("/shoppage") &&
                                  activeCategory === category.categoryTitle &&
                                  searchParams?.get("sub") === label;

                                return (
                                  <motion.button
                                    key={sub._id || label}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => {
                                      router.push(
                                        `/shoppage?category=${encodeURIComponent(
                                          category.categoryTitle
                                        )}&sub=${encodeURIComponent(label)}`
                                      );
                                      setHoveredCategory(null);
                                    }}
                                    className={`w-full text-left px-5 py-3.5 text-sm font-semibold transition-all border-l-4 ${
                                      isSubActive
                                        ? "bg-gradient-to-r from-purple-50 to-pink-50 text-gray-700 border-bgvariant-1"
                                        : "text-gray-700 hover:bg-gradient-to-r hover:from-bgvariant-1/10 hover:to-bgvariant-2/20 hover:text-gray-700 cursor-pointer border-transparent"
                                    }`}
                                  >
                                    {label}
                                  </motion.button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}

                <li className="relative group">
                  <Link
                    href="/aboutuspage"
                    className={`flex items-center font-fontcontent gap-2 text-sm font-medium uppercase tracking-wider transition-colors ${
                      isPathActive("/aboutuspage")
                        ? "text-gray-700"
                        : "text-gray-700 "
                    }`}
                  >
                    {isPathActive("/aboutuspage") && <HiSparkles className="text-bgvariant-2" />}
                    About
                  </Link>
                  <span
                    className={`absolute left-0 -bottom-2 h-1  bg-gradient-to-r from-[#F4D68D] to-[#DCAF5E]  rounded-full transition-all ${
                      isPathActive("/aboutuspage")
                        ? "w-full"
                        : "w-0 group-hover:w-full"
                    }`}
                  />
                </li>

                <li className="relative group">
                  <Link
                    href="/contactpage"
                    className={`flex items-center font-fontcontent gap-2 text-sm font-medium uppercase tracking-wider transition-colors ${
                      isPathActive("/contactpage")
                        ? "text-gray-700"
                        : "text-gray-700 "
                    }`}
                  >
                    {isPathActive("/contactpage") && <HiSparkles className="text-bgvariant-2" />}
                    Contact
                  </Link>
                  <span
                    className={`absolute left-0 -bottom-2 h-1  bg-gradient-to-r from-[#F4D68D] to-[#DCAF5E] rounded-full transition-all ${
                      isPathActive("/contactpage")
                        ? "w-full"
                        : "w-0 group-hover:w-full"
                    }`}
                  />
                </li>
              </ul>
            </nav>

            {/* Mobile - Placeholder */}
            <div className="lg:hidden flex-1" />
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-[998]"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 w-80 max-w-[85vw] h-full bg-white shadow-2xl z-[999] flex flex-col"
            >
              <div className="flex items-center justify-between px-6 h-20 bg-bgvariant-3 text-white">
                <div>
                  <h2 className="text-lg font-bold">Categories</h2>
                  <p className="text-xs text-purple-100">Browse our collection</p>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition"
                >
                  <FiX className="text-2xl" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-purple-50/30 to-white">
                <button
                  onClick={() => {
                    router.push("/");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 text-left px-4 py-3.5 rounded-xl font-bold transition mb-2  ${
                    isPathActive("/")
                      ? "bg-bgvariant-3 text-white shadow-lg"
                      : "hover:bg-purple-50 text-gray-900"
                  }`}
                >
                  <FiHome className="text-lg" />
                   <span>Home</span>
                </button>

                <div className="mt-4">
                  <p className="text-xs font-bold text-gray-500 mb-3 px-2 uppercase tracking-wider">Shop by Category</p>
                  {allCategories.map((category) => {
                    const hasSub =
                      Array.isArray(category.subCategories) &&
                      category.subCategories.length > 0;
                    const isOpen = openMobileCategory === category._id;
                    const isCategoryActive =
                      pathname.startsWith("/shoppage") &&
                      activeCategory === category.categoryTitle;

                    return (
                      <div key={category._id} className="mb-2">
                        <button
                          onClick={() => {
                            if (hasSub) {
                              setOpenMobileCategory(isOpen ? null : category._id);
                            } else {
                              router.push(
                                `/shoppage?category=${encodeURIComponent(
                                  category.categoryTitle
                                )}`
                              );
                              setIsMobileMenuOpen(false);
                            }
                          }}
                          className={`w-full flex items-center justify-between px-4 py-3.5 text-left rounded-xl font-bold transition ${
                            isCategoryActive
                              ? "bg-bgvariant-3 text-white shadow-lg"
                              : "hover:bg-purple-50 text-gray-900"
                          }`}
                        >
                          <span>{category.categoryTitle}</span>
                          {hasSub && (
                            <FiChevronDown
                              className={`text-lg transition-transform ${
                                isOpen ? "rotate-180" : ""
                              }`}
                            />
                          )}
                        </button>

                        <AnimatePresence>
                          {hasSub && isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="pl-4 pt-2 space-y-1">
                                {category.subCategories.map((sub) => {
                                  const label =
                                    sub.subCategoryTitle ||
                                    sub.title ||
                                    sub.name ||
                                    "Subcategory";
                                  const isSubActive =
                                    pathname.startsWith("/shoppage") &&
                                    activeCategory === category.categoryTitle &&
                                    searchParams?.get("sub") === label;

                                  return (
                                    <button
                                      key={sub._id || label}
                                      onClick={() => {
                                        router.push(
                                          `/shoppage?category=${encodeURIComponent(
                                            category.categoryTitle
                                          )}&sub=${encodeURIComponent(label)}`
                                        );
                                        setIsMobileMenuOpen(false);
                                      }}
                                      className={`w-full text-left text-sm py-3 px-4 rounded-lg transition border-l-4 ${
                                        isSubActive
                                          ? "bg-bgvariant-1 text-white font-bold"
                                          : "text-gray-700 hover:bg-purple-50 border-transparent"
                                      }`}
                                    >
                                      • {label}
                                    </button>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      router.push("/aboutuspage");
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 text-left px-4 py-3.5 rounded-xl font-bold transition mb-2 ${
                      isPathActive("/aboutuspage")
                        ? "bg-bgvariant-3 text-white shadow-lg"
                        : "hover:bg-purple-50 text-gray-900"
                    }`}
                  >
                    <FiUser className="text-lg" />
                    <span>Aboutus</span>
                  </button>

                  <button
                    onClick={() => {
                      router.push("/contactpage");
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 text-left px-4 py-3.5 rounded-xl font-bold transition mb-2 ${
                      isPathActive("/contactpage")
                        ? "bg-bgvariant-3 text-white shadow-lg"
                        : "hover:bg-purple-50 text-gray-900"
                    }`}
                  >
                     <FiMail className="text-lg" />
                    <span>Contact</span>
                  </button>
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default CategoryNavbar;