"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FaSpinner, FaRupeeSign, FaStar, FaFilter } from "react-icons/fa";
import { FiShoppingBag, FiX } from "react-icons/fi";
import ReuseCard from "../ReuseCard";
import { getNavbarData, SearchAPI } from "@/app/interceptor/interseptor";
import Loading from "@/app/common/Loading";
import { BsGrid3X3Gap } from "react-icons/bs";
import { HiOutlineViewGrid, HiOutlineViewList } from "react-icons/hi";
import { Eye, Heart, ShoppingCart } from "lucide-react";
import Link from "next/link";

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sideBar, setSideBar] = useState([]);
  const [priceRange, setPriceRange] = useState(1000);
  const [selectedRating, setSelectedRating] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedType, setSelectedType] = useState("three"); // default
  const [error, setError] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const categoryQuery = searchParams.get("category") || "";
  const subQuery =
    searchParams.get("sub") ||
    searchParams.get("subCategory") ||
    searchParams.get("subcategory") ||
    "";

  // Open mobile filters with animation
  const openMobileFilters = () => {
    setMobileFiltersOpen(true);
    // Small delay to ensure DOM is updated before starting animation
    setTimeout(() => setIsAnimating(true), 10);
  };

  // Close mobile filters with animation
  const closeMobileFilters = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setMobileFiltersOpen(false);
    }, 300);
  };

  // ✅ Fetch Navbar Categories
  const fetchNavbar = async () => {
    try {
      const data = await getNavbarData();
      const apiCategories = data.data.findCategory.map((cat) => ({
        name: cat.categoryTitle,
        path: `/shoppage?category=${encodeURIComponent(cat.categoryTitle)}`,
        subCategories: (cat.subCategory || []).map((sub) => ({
          _id: sub._id,
          name: sub.subCategoryTitle || sub.title || sub.name || "",
        })),
      }));
      setSideBar(apiCategories);
    } catch (err) {
      console.error("❌ Error fetching sidebar categories:", err);
      setError("Failed to load categories");
    }
  };

  useEffect(() => {
    fetchNavbar();
  }, []);

  // ✅ Fetch Products with Filters
  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const filters = {};

      // ✅ Only add search query if it exists and is not "all"
      if (
        searchQuery &&
        searchQuery.trim() &&
        searchQuery.toLowerCase() !== "all"
      ) {
        filters.query = searchQuery.trim();
      }

      // ✅ Only add category if it exists and is not "all"
      if (
        categoryQuery &&
        categoryQuery.trim() &&
        categoryQuery.toLowerCase() !== "all"
      ) {
        filters.category = categoryQuery.trim();
      }

      // ✅ Add subcategory filter if provided
      if (
        subQuery &&
        subQuery.trim() &&
        subQuery.toLowerCase() !== "all" &&
        subQuery.toLowerCase() !== "all products"
      ) {
        filters.subCategory = subQuery.trim();
        filters.sub = subQuery.trim();
      }

      // Add other filters
      if (priceRange < 1000) {
        filters.maxPrice = priceRange;
      }
      if (selectedRating) {
        filters.minRating = selectedRating;
      }

      let data;

      if (Object.keys(filters).length > 0) {
        console.log("🔍 Searching with filters:", filters);
        data = await SearchAPI.searchWithFilters(filters);
      } else {
        console.log("📦 Fetching all products");
        data = await SearchAPI.search("");
      }

      const productsArray = Array.isArray(data) ? data : data?.data || [];
      console.log("✅ Products fetched:", productsArray.length);

      setProducts(productsArray);
      setFilteredProducts(productsArray);
    } catch (error) {
      console.error("❌ Error fetching products:", error);
      setError(error.message || "Failed to load products");
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, categoryQuery, subQuery]);

  // ✅ Update selectedCategory based on URL
  useEffect(() => {
    if (searchQuery) setSelectedCategory("");
    else if (categoryQuery) setSelectedCategory(categoryQuery);
    else setSelectedCategory("all");
  }, [searchQuery, categoryQuery, subQuery]);

  // ✅ Handle Price Range Change
  const handlePriceChange = async (value) => {
    const newPrice = Number(value);
    setPriceRange(newPrice);

    // Debounce to prevent multiple rapid calls
    clearTimeout(window.priceTimeout);
    window.priceTimeout = setTimeout(() => {
      fetchProducts();
    }, 400);
  };

  // ✅ Handle Rating Filter Change
  const handleRatingChange = async (rating) => {
    const newRating = selectedRating === rating ? null : rating;
    setSelectedRating(newRating);
  };

  // ✅ Clear all filters (preserves category context if on category page)
  const clearFilters = async () => {
    setPriceRange(1000);
    setSelectedRating(null);

    const newParams = new URLSearchParams();
    if (categoryQuery && categoryQuery.toLowerCase() !== "all") {
      newParams.set("category", categoryQuery);
    }
    if (searchQuery && searchQuery.toLowerCase() !== "all") {
      newParams.set("search", searchQuery);
    }

    const queryString = newParams.toString();
    const newUrl = queryString ? `/shoppage?${queryString}` : "/shoppage";
    router.push(newUrl);

    setTimeout(() => {
      fetchProducts();
    }, 100);
  };

  // ✅ Apply filters when rating changes
  useEffect(() => {
    if (selectedRating !== null) {
      fetchProducts();
    }
  }, [selectedRating]);

  // In your ShopPage component, update the gridClass:
  const gridClass =
    selectedType === "single"
      ? "grid-cols-1 gap-4"
      : selectedType === "three"
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4";

  // ✅ Loading UI
  if (loading) {
    return (
      <div>
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      {/* Breadcrumb */}
      <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
        <nav className="text-xs text-gray-500 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-green-700">Home</Link>
          <span>/</span>
          <Link href="/shoppage" className="hover:text-green-700">Products</Link>
          {categoryQuery && categoryQuery.toLowerCase() !== "all" && (
            <>
              <span>/</span>
              {subQuery && subQuery.toLowerCase() !== "all" && subQuery.toLowerCase() !== "all products" ? (
                <Link
                  href={`/shoppage?category=${encodeURIComponent(categoryQuery)}`}
                  className="hover:text-green-700 font-medium"
                >
                  {categoryQuery}
                </Link>
              ) : (
                <span className="text-gray-800 font-semibold">{categoryQuery}</span>
              )}
            </>
          )}
          {subQuery && subQuery.toLowerCase() !== "all" && subQuery.toLowerCase() !== "all products" && (
            <>
              <span>/</span>
              <span className="text-gray-800 font-semibold">{subQuery}</span>
            </>
          )}
        </nav>
      </div>

      {/* Mobile Filter Button */}
      <div className="lg:hidden bg-white p-4 border-b border-gray-200 sticky top-0 z-40">
        <button
          onClick={openMobileFilters}
          className="flex items-center justify-center w-full py-3 bg-bgvariant-1 text-white rounded-lg font-medium hover:bg-bgvariant-4 transition-all duration-300 transform hover:scale-105"
        >
          <FaFilter className="mr-2 transition-transform duration-300" />
          Filters & Categories
        </button>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* ===== Mobile Filter Sidebar ===== */}
        {(mobileFiltersOpen || isAnimating) && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop with fade animation */}
            <div
              className={`fixed inset-0 bg-black transition-all duration-300 ease-in-out ${
                isAnimating ? "opacity-50" : "opacity-0"
              }`}
              onClick={closeMobileFilters}
            />

            {/* Sidebar with slide animation */}
            <div
              className={`fixed top-0 left-0 bottom-0 w-80 bg-white p-6 overflow-y-auto shadow-2xl transition-transform duration-300 ease-in-out ${
                isAnimating ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                <h2 className="text-2xl font-bold text-bgvariant-3">Filters</h2>
                <button
                  onClick={closeMobileFilters}
                  className="p-3 hover:bg-gray-100 rounded-full transition-all duration-300 transform hover:scale-110"
                >
                  <FiX className="text-xl" />
                </button>
              </div>

              {/* Categories Section */}
              <div
                className={`mb-8 transition-all duration-500 ${
                  isAnimating
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                <h3 className="font-semibold mb-4 text-lg text-bgvariant-3 border-l-4 border-green-600 pl-3">
                  Categories
                </h3>
                <div className="space-y-3">
                  {/* Top All Products button */}
                  <button
                    onClick={() => {
                      if (categoryQuery && categoryQuery.toLowerCase() !== "all") {
                        router.push(`/shoppage?category=${encodeURIComponent(categoryQuery)}`);
                      } else {
                        router.push("/shoppage");
                      }
                      closeMobileFilters();
                    }}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-300 transform hover:scale-102 ${
                      ((!categoryQuery || categoryQuery === "all") && !searchQuery) ||
                      (categoryQuery && categoryQuery.toLowerCase() !== "all" && !subQuery)
                        ? "bg-bgvariant-3 text-white shadow-lg"
                        : "bg-gray-100 hover:bg-gray-200 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <FiShoppingBag
                        className={`text-lg ${
                          ((!categoryQuery || categoryQuery === "all") && !searchQuery) ||
                          (categoryQuery && categoryQuery.toLowerCase() !== "all" && !subQuery)
                            ? "text-white"
                            : "text-gray-600"
                        }`}
                      />
                      <span className="font-medium">
                        {categoryQuery && categoryQuery.toLowerCase() !== "all"
                          ? `All ${categoryQuery}`
                          : "All Products"}
                      </span>
                    </div>
                  </button>
                  {sideBar.map((cat, index) => {
                    const isCatActive =
                      categoryQuery?.toLowerCase() === cat.name?.toLowerCase();
                    const hasSubCategories =
                      Array.isArray(cat.subCategories) && cat.subCategories.length > 0;

                    return (
                      <div key={cat.name} className="space-y-1">
                        <button
                          onClick={() => {
                            router.push(cat.path);
                            closeMobileFilters();
                          }}
                          className={`w-full text-left p-4 rounded-xl transition-all duration-300 transform hover:scale-102 ${
                            isCatActive && !subQuery
                              ? "bg-bgvariant-3 text-white shadow-lg"
                              : isCatActive
                              ? "bg-green-50 text-bgvariant-1 font-semibold border-l-4 border-green-600"
                              : "bg-gray-100 hover:bg-gray-200 hover:shadow-md"
                          }`}
                          style={{
                            transitionDelay: isAnimating
                              ? `${index * 100}ms`
                              : "0ms",
                          }}
                        >
                          <span className="font-medium">{cat.name}</span>
                        </button>

                        {/* Subcategories in mobile */}
                        {isCatActive && hasSubCategories && (
                          <div className="pl-4 pt-1 space-y-1">
                            <button
                              onClick={() => {
                                router.push(`/shoppage?category=${encodeURIComponent(cat.name)}`);
                                closeMobileFilters();
                              }}
                              className={`w-full text-left text-xs py-2 px-3 rounded-lg transition font-medium ${
                                !subQuery
                                  ? "bg-bgvariant-1 text-white font-bold"
                                  : "text-gray-700 hover:bg-green-50 hover:text-bgvariant-1"
                              }`}
                            >
                              • All {cat.name}
                            </button>
                            {cat.subCategories.map((sub) => {
                              const isSubActive =
                                subQuery?.toLowerCase() === sub.name?.toLowerCase();

                              return (
                                <button
                                  key={sub._id || sub.name}
                                  onClick={() => {
                                    router.push(
                                      `/shoppage?category=${encodeURIComponent(
                                        cat.name
                                      )}&sub=${encodeURIComponent(sub.name)}`
                                    );
                                    closeMobileFilters();
                                  }}
                                  className={`w-full text-left text-xs py-2 px-3 rounded-lg transition ${
                                    isSubActive
                                      ? "bg-bgvariant-1 text-white font-bold"
                                      : "text-gray-600 hover:bg-green-50 hover:text-bgvariant-1"
                                  }`}
                                >
                                  • {sub.name}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Price Range Section */}
              <div
                className={`mb-8 transition-all duration-500 delay-150 ${
                  isAnimating
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                <h3 className="font-semibold flex items-center text-lg text-bgvariant-3 mb-4 border-l-4 border-green-600 pl-3">
                  <FaRupeeSign className="mr-2" /> Price Range
                </h3>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={priceRange}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    className="w-full accent-bgvariant-1 transition-all duration-300"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-3">
                    <span className="font-medium">₹0</span>
                    <span className="font-bold text-bgvariant-1">
                      ₹{priceRange}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rating Filter Section */}
              <div
                className={`mb-8 transition-all duration-500 delay-200 ${
                  isAnimating
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                <h3 className="font-semibold flex items-center text-lg text-bgvariant-3 mb-4 border-l-4 border-green-600 pl-3">
                  <FaStar className="mr-2 text-yellow-500" /> Customer Ratings
                </h3>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((stars, index) => (
                    <button
                      key={stars}
                      onClick={() => handleRatingChange(stars)}
                      className={`flex items-center space-x-3 w-full text-left p-3 rounded-lg transition-all duration-300 transform hover:scale-102 ${
                        selectedRating === stars
                          ? "bg-yellow-50 border-2 border-yellow-300 shadow-md"
                          : "hover:bg-gray-50 hover:shadow-sm"
                      }`}
                      style={{
                        transitionDelay: isAnimating
                          ? `${index * 80 + 300}ms`
                          : "0ms",
                      }}
                    >
                      <div className="flex">
                        {[...Array(stars)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={`text-lg ${
                              selectedRating === stars
                                ? "text-yellow-500 scale-110"
                                : "text-yellow-400"
                            } transition-transform duration-300`}
                          />
                        ))}
                      </div>
                      <span
                        className={`font-medium ${
                          selectedRating === stars
                            ? "text-yellow-700"
                            : "text-gray-700"
                        }`}
                      >
                        & Up
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters Button */}
              <div
                className={`transition-all duration-500 delay-300 ${
                  isAnimating
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                <button
                  onClick={() => {
                    clearFilters();
                    closeMobileFilters();
                  }}
                  className="w-full py-4 bg-bgvariant-1 text-white rounded-xl font-semibold hover:bg-bgvariant-4 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== Desktop Sidebar ===== */}
        <aside className="hidden lg:block w-72 min-h-screen border-r border-gray-100 bg-white p-7 sticky top-0 overflow-y-auto">
          <h2 className="text-xl font-bold mb-6 text-bgvariant-3">
            Filter By
          </h2>

          {/* Categories */}
          <div className="space-y-3 mb-10">
            {/* Top All Products / All [Category] button */}
            <button
              onClick={() => {
                if (categoryQuery && categoryQuery.toLowerCase() !== "all") {
                  router.push(`/shoppage?category=${encodeURIComponent(categoryQuery)}`);
                } else {
                  router.push("/shoppage");
                }
              }}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 transform hover:scale-102 ${
                ((!categoryQuery || categoryQuery === "all") && !searchQuery) ||
                (categoryQuery && categoryQuery.toLowerCase() !== "all" && !subQuery)
                  ? "bg-bgvariant-1 text-white shadow-lg border-l-4 border-green-600"
                  : "hover:bg-bgvariant-2/20 text-gray-800 hover:shadow-md"
              }`}
            >
              <div className="flex items-center space-x-3">
                <FiShoppingBag
                  className={`text-xl transition-transform duration-300 ${
                    ((!categoryQuery || categoryQuery === "all") && !searchQuery) ||
                    (categoryQuery && categoryQuery.toLowerCase() !== "all" && !subQuery)
                      ? "text-white"
                      : "text-gray-700"
                  }`}
                />
                <span className="font-medium">
                  {categoryQuery && categoryQuery.toLowerCase() !== "all"
                    ? `All ${categoryQuery}`
                    : "All Products"}
                </span>
              </div>
            </button>

            {sideBar.map((cat) => {
              const isCatActive =
                categoryQuery?.toLowerCase() === cat.name?.toLowerCase();
              const hasSubCategories =
                Array.isArray(cat.subCategories) && cat.subCategories.length > 0;

              return (
                <div key={cat.name} className="space-y-1">
                  <button
                    onClick={() => router.push(cat.path)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 transform hover:scale-102 ${
                      isCatActive && !subQuery
                        ? "bg-bgvariant-1 text-white shadow-lg border-l-4 border-green-600"
                        : isCatActive
                        ? "bg-green-50 text-bgvariant-1 font-semibold border-l-4 border-green-600"
                        : "hover:bg-bgvariant-2/20 text-black hover:shadow-md"
                    }`}
                  >
                    <span
                      className={`font-medium transition-colors duration-300 ${
                        isCatActive && !subQuery ? "text-white" : isCatActive ? "text-bgvariant-1" : "text-gray-800"
                      }`}
                    >
                      {cat.name}
                    </span>
                  </button>

                  {/* If this category is currently active, show its subcategories + All Products */}
                  {isCatActive && hasSubCategories && (
                    <div className="pl-4 pt-1 space-y-1">
                      <button
                        onClick={() => router.push(`/shoppage?category=${encodeURIComponent(cat.name)}`)}
                        className={`w-full text-left text-xs py-2 px-3 rounded-lg transition font-medium ${
                          !subQuery
                            ? "bg-bgvariant-1 text-white font-bold shadow-sm"
                            : "text-gray-700 hover:bg-green-50 hover:text-bgvariant-1"
                        }`}
                      >
                        • All {cat.name}
                      </button>

                      {cat.subCategories.map((sub) => {
                        const isSubActive =
                          subQuery?.toLowerCase() === sub.name?.toLowerCase();

                        return (
                          <button
                            key={sub._id || sub.name}
                            onClick={() =>
                              router.push(
                                `/shoppage?category=${encodeURIComponent(
                                  cat.name
                                )}&sub=${encodeURIComponent(sub.name)}`
                              )
                            }
                            className={`w-full text-left text-xs py-2 px-3 rounded-lg transition ${
                              isSubActive
                                ? "bg-bgvariant-1 text-white font-bold shadow-sm"
                                : "text-gray-600 hover:bg-green-50 hover:text-bgvariant-1"
                            }`}
                          >
                            • {sub.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Price Range Filter */}
          <div className="mb-8">
            <h3 className="font-semibold flex items-center text-bgvariant-3 mb-4">
              <FaRupeeSign className="mr-2" /> Price Range
            </h3>
            <div className="bg-gray-50 p-4 rounded-xl">
              <input
                type="range"
                min="0"
                max="1000"
                value={priceRange}
                onChange={(e) => handlePriceChange(e.target.value)}
                className="w-full accent-bgvariant-1 transition-all duration-300"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-3">
                <span>₹0</span>
                <span className="font-bold text-bgvariant-1">
                  ₹{priceRange}
                </span>
              </div>
            </div>
          </div>

          {/* Rating Filter */}
          <div className="mb-8">
            <h3 className="font-semibold flex items-center text-bgvariant-3 mb-4">
              <FaStar className="mr-2 text-yellow-500" /> Ratings
            </h3>
            {[5, 4, 3, 2, 1].map((stars) => (
              <button
                key={stars}
                onClick={() => handleRatingChange(stars)}
                className={`flex items-center space-x-3 w-full text-left p-3 rounded-lg transition-all duration-300 transform hover:scale-102 ${
                  selectedRating === stars
                    ? "bg-yellow-50 border-2 border-yellow-300 shadow-md"
                    : "hover:bg-gray-50 hover:shadow-sm"
                }`}
              >
                <div className="flex">
                  {[...Array(stars)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={`text-lg transition-transform duration-300 ${
                        selectedRating === stars
                          ? "text-yellow-500 scale-110"
                          : "text-yellow-400"
                      }`}
                    />
                  ))}
                </div>
                <span
                  className={`font-medium ${
                    selectedRating === stars
                      ? "text-yellow-700"
                      : "text-gray-700"
                  }`}
                >
                  & Up
                </span>
              </button>
            ))}
          </div>

          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className="w-full py-3 border-2 border-bgvariant-1 text-bgvariant-1 rounded-xl font-semibold hover:bg-bgvariant-1 hover:text-white transition-all duration-300 transform hover:scale-105"
          >
            Clear All Filters
          </button>
        </aside>

        {/* ===== Main Content ===== */}
        <main className="flex-1 p-4 lg:p-8">
          <div className="flex justify-between items-center mb-6 lg:mb-8">
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-bgvariant-3">
                {searchQuery &&
                searchQuery.trim() &&
                searchQuery.toLowerCase() !== "all"
                  ? `Search: "${searchQuery}"`
                  : subQuery &&
                    subQuery.toLowerCase() !== "all" &&
                    subQuery.toLowerCase() !== "all products"
                  ? subQuery
                  : categoryQuery && categoryQuery.toLowerCase() !== "all"
                  ? categoryQuery
                  : "All Products"}
              </h2>
              <p className="text-gray-500 text-sm lg:text-base">
                {filteredProducts.length} Products Found
              </p>
            </div>
            {/* Sort bar — UI only, no new logic */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 hidden sm:inline">Sort by:</label>
              <select className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="relevance">Relevance</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 transition-all duration-300">
              {error}
            </div>
          )}
          {/* And update the view buttons styling: */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setSelectedType("single")}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                selectedType === "single"
                  ? "bg-bgvariant-1 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              title="List View"
            >
              <HiOutlineViewList size={20} />
              <span className="hidden sm:inline">List</span>
            </button>

            <button
              onClick={() => setSelectedType("three")}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                selectedType === "three"
                  ? "bg-bgvariant-1 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              title="Grid View (3 columns)"
            >
              <HiOutlineViewGrid size={20} />
              <span className="hidden sm:inline">Grid 3</span>
            </button>

            <button
              onClick={() => setSelectedType("four")}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                selectedType === "four"
                  ? "bg-bgvariant-1 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              title="Grid View (4 columns)"
            >
              <BsGrid3X3Gap size={20} />
              <span className="hidden sm:inline">Grid 4</span>
            </button>
          </div>

          {/* ✅ Product Grid - Responsive */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 text-gray-700">
              <FiShoppingBag className="mx-auto text-6xl lg:text-8xl mb-4 opacity-50 text-green-600" />
              <p className="text-lg mb-2 font-semibold">
                {categoryQuery && categoryQuery.toLowerCase() !== "all"
                  ? subQuery && subQuery.toLowerCase() !== "all" && subQuery.toLowerCase() !== "all products"
                    ? `No products available in "${subQuery}" yet.`
                    : `No products available in "${categoryQuery}" yet.`
                  : "No agriculture products found."}
              </p>
              <p className="text-gray-500 mb-6">
                {categoryQuery && categoryQuery.toLowerCase() !== "all"
                  ? "Be the first — check back soon or browse other categories."
                  : "Try adjusting your search or category filters"}
              </p>
              {categoryQuery && categoryQuery.toLowerCase() !== "all" ? (
                <Link
                  href="/shoppage"
                  className="px-6 py-3 bg-bgvariant-1 text-white rounded-lg hover:bg-bgvariant-4 transition-all duration-300 transform hover:scale-105 inline-block font-semibold"
                >
                  Browse Global Products
                </Link>
              ) : (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-bgvariant-1 text-white rounded-lg hover:bg-bgvariant-4 transition-all duration-300 transform hover:scale-105"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className={`grid ${gridClass}`}>
              {filteredProducts.map((product) => (
                <ReuseCard key={product._id} product={product} type={selectedType} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ShopPage;