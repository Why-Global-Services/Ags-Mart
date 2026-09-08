"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { IoMdHeartEmpty } from "react-icons/io";
import { BsCart2 } from "react-icons/bs";
import { VscAccount, VscSignOut } from "react-icons/vsc";
import { IoSearchSharp, IoClose } from "react-icons/io5";
import { FaSearch } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { Search, createUserId } from "../interceptor/interseptor";
import AuthPage from "./LoginPage";
import { showToast } from "../utils/toast";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart } from "@/app/store/cartSlice";
import { fetchWishlist } from "@/app/store/wishlistSlice";
import { fetchWebSettings } from "@/app/store/webSettingsSlice";
import { AgroSpinner } from "./Loading";

const NAVBAR_PARTICLES = [
  { left: "3.2%", top: "25.4%", x: [0, 5, 0], y: [0, -5, 0], duration: 3.2, delay: 0.2 },
  { left: "7.8%", top: "68.1%", x: [0, -5, 0], y: [0, 5, 0], duration: 4.5, delay: 0.7 },
  { left: "12.5%", top: "35.7%", x: [0, 5, 0], y: [0, 5, 0], duration: 2.8, delay: 1.3 },
  { left: "16.9%", top: "82.2%", x: [0, -5, 0], y: [0, -5, 0], duration: 4.1, delay: 0.5 },
  { left: "21.1%", top: "18.5%", x: [0, 5, 0], y: [0, -5, 0], duration: 3.6, delay: 1.6 },
  { left: "26.7%", top: "74.3%", x: [0, -5, 0], y: [0, 5, 0], duration: 4.8, delay: 0.3 },
  { left: "31.4%", top: "29.8%", x: [0, 5, 0], y: [0, 3, 0], duration: 2.5, delay: 1.1 },
  { left: "36.2%", top: "85.4%", x: [0, -5, 0], y: [0, -5, 0], duration: 3.9, delay: 1.8 },
  { left: "41.6%", top: "42.9%", x: [0, 5, 0], y: [0, -5, 0], duration: 4.3, delay: 0.9 },
  { left: "46.1%", top: "15.3%", x: [0, -5, 0], y: [0, 5, 0], duration: 2.9, delay: 1.4 },
  { left: "51.4%", top: "63.6%", x: [0, 5, 0], y: [0, 5, 0], duration: 3.7, delay: 0.6 },
  { left: "56.7%", top: "88.1%", x: [0, -5, 0], y: [0, -5, 0], duration: 4.6, delay: 0.4 },
  { left: "61.5%", top: "22.7%", x: [0, 5, 0], y: [0, -5, 0], duration: 2.7, delay: 1.5 },
  { left: "66.8%", top: "58.3%", x: [0, -5, 0], y: [0, 5, 0], duration: 4.9, delay: 0.1 },
  { left: "71.2%", top: "38.9%", x: [0, 5, 0], y: [0, 5, 0], duration: 3.4, delay: 1.2 },
  { left: "76.9%", top: "79.4%", x: [0, -5, 0], y: [0, -5, 0], duration: 4.4, delay: 0.8 },
  { left: "81.3%", top: "28.2%", x: [0, 5, 0], y: [0, -5, 0], duration: 2.6, delay: 1.7 },
  { left: "86.6%", top: "71.8%", x: [0, -5, 0], y: [0, 5, 0], duration: 3.8, delay: 1.0 },
  { left: "91.1%", top: "46.5%", x: [0, 5, 0], y: [0, 5, 0], duration: 4.7, delay: 0.3 },
  { left: "96.4%", top: "84.2%", x: [0, -5, 0], y: [0, -5, 0], duration: 3.1, delay: 1.9 },
  { left: "5.5%", top: "48.6%", x: [0, 5, 0], y: [0, -5, 0], duration: 3.5, delay: 0.8 },
  { left: "14.2%", top: "12.3%", x: [0, -5, 0], y: [0, 5, 0], duration: 4.2, delay: 1.5 },
  { left: "23.8%", top: "55.7%", x: [0, 5, 0], y: [0, 5, 0], duration: 2.9, delay: 0.4 },
  { left: "33.1%", top: "92.1%", x: [0, -5, 0], y: [0, -5, 0], duration: 4.0, delay: 1.1 },
  { left: "44.5%", top: "76.4%", x: [0, 5, 0], y: [0, -5, 0], duration: 3.3, delay: 0.7 },
  { left: "54.9%", top: "33.8%", x: [0, -5, 0], y: [0, 5, 0], duration: 4.7, delay: 1.3 },
  { left: "64.1%", top: "89.2%", x: [0, 5, 0], y: [0, 5, 0], duration: 2.4, delay: 0.5 },
  { left: "74.7%", top: "16.5%", x: [0, -5, 0], y: [0, -5, 0], duration: 3.8, delay: 1.8 },
  { left: "84.2%", top: "60.1%", x: [0, 5, 0], y: [0, -5, 0], duration: 4.5, delay: 0.2 },
  { left: "93.8%", top: "19.7%", x: [0, -5, 0], y: [0, 5, 0], duration: 3.0, delay: 1.6 },
];

const TopNavbar = () => {
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const profileDropdownRef = useRef(null);

  const { user, logout } = useAuth();
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartItems = useSelector((state) => state.cart.cartItems);
  const wishlistItems = useSelector((state) => state.wishlist.wishlistItems);
  const logo = useSelector((state) => state.webSettings.logo);

  const searchSuggestions = [
    "Seeds",
    "Crop Protection",
    "Fertilizers",
    "Bio Pesticides",
    "Plant Growth",
    "Organic Inputs",
    "Insecticides",
    "Fungicides",
    "Herbicides",
    "Farming Tools",
  ];

  useEffect(() => {
    const handler = (e) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(e.target) &&
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(e.target)
      ) {
        setIsSearchOpen(false);
      }
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(e.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // GuestId Generator
  useEffect(() => {
    const initializeGuestId = async () => {
      let guestId = localStorage.getItem("guestId");
      if (!guestId) {
        try {
          const response = await createUserId();
          guestId = response;
          if (guestId) {
            localStorage.setItem("guestId", guestId);
          }
        } catch (error) {
          console.error("Failed to create guest ID:", error);
        }
      }
    };
    initializeGuestId();
  }, []);

  useEffect(() => {
    dispatch(fetchCart());
    dispatch(fetchWishlist());
    dispatch(fetchWebSettings());
  }, [dispatch]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      setLoadingSearch(true);
      try {
        const res = await Search(searchQuery);
        const data = res;
        setSearchResults(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        console.log("search failed", err);
        setSearchResults([]);
      } finally {
        setLoadingSearch(false);
      }
    };
    const timer = setTimeout(fetchResults, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (q) => {
    const trimmedQuery = q?.trim();
    if (!trimmedQuery) {
      showToast.error("Please enter a search term");
      return;
    }
    router.push(`/shoppage?search=${encodeURIComponent(trimmedQuery)}`);
    setIsSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Moving particles for navbar background
  const particles = NAVBAR_PARTICLES.map((p, i) => (
    <motion.div
      key={i}
      className="absolute w-[3px] h-[3px] bg-green-400 rounded-full"
      initial={{ opacity: 0 }}
      style={{
        left: p.left,
        top: p.top,
      }}
      animate={{
        scale: [0.5, 1, 0.5],
        opacity: [0, 1, 0],
        x: p.x,
        y: p.y,
        boxShadow: [
          "0 0 0 rgba(74,163,50,0)",
          "0 0 8px rgba(74,163,50,1)",
          "0 0 0 rgba(74,163,50,0)",
        ],
      }}
      transition={{
        duration: p.duration,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
        delay: p.delay,
      }}
    />
  ));

  return (
    <>
      {/* Main Navbar */}
      <header className="bg-[#1a4a13] border-b border-green-900/40 sticky top-0 z-50 w-full max-w-full overflow-x-clip">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {mounted && particles}
        </div>

        <div className="w-full max-w-full px-3 sm:px-4 md:px-6 lg:px-8">
          {/* Main Top Header Bar */}
          <div className="flex items-center justify-between h-20 sm:h-22 lg:h-24 w-full gap-2 sm:gap-4 lg:gap-0">
            {/* 1. Responsive Logo */}
            <Link href="/" className="flex items-center shrink-0 min-w-0">
              <div className="bg-white w-[130px] sm:w-[155px] md:w-[200px] lg:w-[290px] xl:w-[320px] h-[46px] sm:h-[50px] md:h-[62px] lg:h-[76px] max-w-full px-1.5 sm:px-2 md:px-2.5 py-0.5 sm:py-1 rounded-xl shadow-sm hover:shadow-md transition shrink-0 flex items-center justify-center">
                <Image
                  src={logo || "/logo.png"}
                  alt="Agrowmed Logo"
                  width={320}
                  height={85}
                  className="object-contain w-full h-full"
                  priority
                />
              </div>
            </Link>

            {/* 2. Center Search Bar - Desktop (lg breakpoint and up) */}
            <div
              className="hidden lg:flex flex-1 max-w-xl mx-6 xl:mx-12"
              ref={searchRef}
            >
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search entire agriculture store..."
                  className="w-full h-12 pl-12 pr-28 border text-white bg-transparent border-white/60 placeholder-white/70 rounded-lg focus:border-green-400 focus:ring-2 focus:ring-green-400/20 focus:outline-none transition-all text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearch(searchQuery);
                    }
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                />
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 text-sm" />

                {searchQuery.trim() && (
                  <button
                    onClick={() => handleSearch(searchQuery)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-bgvariant-1 text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-bgvariant-4 transition"
                  >
                    Search
                  </button>
                )}

                {/* Desktop Search Dropdown */}
                <AnimatePresence>
                  {isSearchOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-2xl max-h-96 overflow-y-auto z-50"
                    >
                      {loadingSearch ? (
                        <div className="flex flex-col items-center justify-center py-8 gap-2">
                          <AgroSpinner size="md" />
                          <p className="text-xs text-gray-500 font-medium">Searching farm essentials...</p>
                        </div>
                      ) : searchQuery.trim() ? (
                        searchResults.length > 0 ? (
                          <div className="p-2">
                            <p className="text-xs font-bold text-gray-500 mb-2 px-3 uppercase tracking-wider">
                              Search Results
                            </p>
                            {searchResults.map((item, i) => (
                              <button
                                key={i}
                                onClick={() =>
                                  handleSearch(
                                    item.productName ||
                                      item.productTitle ||
                                      item.name ||
                                      ""
                                  )
                                }
                                className="w-full flex items-center gap-3 p-3 hover:bg-green-50 rounded-lg text-left transition"
                              >
                                <FaSearch className="text-green-700 text-xs shrink-0" />
                                <span className="text-sm text-gray-800 font-medium truncate">
                                  {item.productName ||
                                    item.productTitle ||
                                    item.name}
                                </span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center py-6 text-gray-400 text-sm">
                            No agriculture products found
                          </p>
                        )
                      ) : (
                        <div className="p-2">
                          <p className="text-xs font-bold text-gray-500 mb-3 px-3 uppercase tracking-wider">
                            Popular Searches
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {searchSuggestions.map((suggestion, i) => (
                              <button
                                key={i}
                                onClick={() => handleSearch(suggestion)}
                                className="flex items-center gap-2 p-3 hover:bg-green-50 rounded-lg text-left transition"
                              >
                                <FaSearch className="text-gray-400 text-xs shrink-0" />
                                <span className="text-sm text-gray-700 font-medium truncate">
                                  {suggestion}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* 3. Right Action Buttons */}
            <div className="flex items-center gap-1 sm:gap-2.5 md:gap-3 lg:gap-5 shrink-0">
              {/* Mobile Search Toggle Button (visible on mobile and tablet < lg) */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="lg:hidden p-1.5 sm:p-2.5 hover:bg-white/10 rounded-lg transition text-white"
                title="Search Store"
                aria-label="Toggle Search"
              >
                <IoSearchSharp className="text-xl sm:text-2xl text-white hover:text-green-300 transition" />
              </button>

              {/* Wishlist */}
              <button
                onClick={() => router.push("/whishlist")}
                title="My Wishlist"
                className="relative flex flex-col items-center justify-center p-1.5 sm:p-2.5 hover:bg-white/10 rounded-lg transition group"
              >
                <div className="relative">
                  <IoMdHeartEmpty className="text-xl sm:text-2xl text-white transition-colors duration-300 group-hover:text-green-300" />
                  {mounted && !!wishlistItems.length && (
                    <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] sm:text-xs w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full font-bold animate-pulse">
                      {wishlistItems.length}
                    </span>
                  )}
                </div>
                <span className="hidden lg:block text-xs text-white font-medium mt-1 text-center group-hover:text-green-300 transition">
                  Wishlist
                </span>
              </button>

              {/* Cart */}
              <button
                onClick={() => router.push("/cart")}
                className="relative flex flex-col items-center justify-center p-1.5 sm:p-2.5 hover:bg-white/10 rounded-lg transition group"
                title="My Cart"
              >
                <div className="relative">
                  <BsCart2 className="text-xl sm:text-2xl text-white group-hover:text-green-300 transition" />
                  {mounted && !!cartItems.length && (
                    <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] sm:text-xs w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full font-bold animate-pulse">
                      {cartItems.length}
                    </span>
                  )}
                </div>
                <span className="hidden lg:block text-xs text-white font-medium mt-0.5 group-hover:text-green-300 transition">
                  Cart
                </span>
              </button>

              {/* Account / Profile */}
              <div ref={profileDropdownRef} className="relative">
                {mounted && user ? (
                  <>
                    <button
                      onClick={() =>
                        setIsProfileDropdownOpen(!isProfileDropdownOpen)
                      }
                      title="My Account"
                      className="flex flex-col items-center justify-center p-1.5 sm:p-2.5 hover:bg-white/10 rounded-lg transition group"
                    >
                      <VscAccount className="text-xl sm:text-2xl text-white group-hover:text-green-300 transition" />
                      <span className="hidden lg:block text-xs text-white font-medium mt-1 text-center group-hover:text-green-300 transition">
                        Account
                      </span>
                    </button>

                    <AnimatePresence>
                      {isProfileDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                        >
                          <div className="p-5 bg-gradient-to-br from-emerald-800 via-green-700 to-teal-700 text-white">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center ring-2 ring-white/30">
                                <VscAccount className="text-white text-xl" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm truncate">
                                  {user.name}
                                </p>
                                <p className="text-xs text-green-100 truncate">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="py-2">
                            <button
                              onClick={() => {
                                router.push("/accountpage");
                                setIsProfileDropdownOpen(false);
                              }}
                              className="w-full px-5 py-3 text-left hover:bg-green-50 flex items-center gap-3 transition text-sm font-semibold text-gray-800"
                            >
                              <VscAccount className="text-lg text-green-700" />
                              My Account
                            </button>
                            <button
                              onClick={() => {
                                logout();
                                setIsProfileDropdownOpen(false);
                              }}
                              className="w-full px-5 py-3 text-left hover:bg-red-50 text-red-600 flex items-center gap-3 transition text-sm font-semibold"
                            >
                              <VscSignOut className="text-lg" />
                              Logout
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="px-2 sm:px-4 lg:px-6 py-1.5 sm:py-2 lg:py-2.5 text-white rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap bg-bgvariant-1 hover:bg-bgvariant-4 shadow-lg hover:shadow-xl transition"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Mobile / Tablet Full-Width Search Row (when open or toggled) */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                ref={mobileSearchRef}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="lg:hidden pb-4 pt-1 overflow-visible w-full"
              >
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="Search agriculture products..."
                    className="w-full h-11 pl-10 pr-24 text-white bg-black/20 placeholder-white/70 border border-white/40 rounded-lg focus:ring-2 focus:ring-green-300 focus:border-green-400 focus:outline-none text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSearch(searchQuery);
                      }
                    }}
                    autoFocus
                  />
                  <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/70 text-sm" />
                  {searchQuery.trim() && (
                    <button
                      onClick={() => handleSearch(searchQuery)}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-bgvariant-1 text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-bgvariant-4 transition"
                    >
                      Search
                    </button>
                  )}
                </div>

                {/* Mobile Search Results Dropdown */}
                {(searchQuery.trim() || isSearchOpen) && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-2xl max-h-80 overflow-y-auto z-50"
                  >
                    {loadingSearch ? (
                      <div className="flex flex-col items-center justify-center py-6 gap-2">
                        <AgroSpinner size="md" />
                        <p className="text-xs text-gray-500 font-medium">Searching farm essentials...</p>
                      </div>
                    ) : searchQuery.trim() ? (
                      searchResults.length > 0 ? (
                        <div className="p-2">
                          <p className="text-xs font-bold text-gray-500 mb-2 px-3 uppercase tracking-wider">
                            Search Results
                          </p>
                          {searchResults.map((item, i) => (
                            <button
                              key={i}
                              onClick={() =>
                                handleSearch(
                                  item.productName ||
                                    item.productTitle ||
                                    item.name ||
                                    ""
                                )
                              }
                              className="w-full flex items-center gap-3 p-2.5 hover:bg-green-50 rounded-lg text-left transition"
                            >
                              <FaSearch className="text-green-700 text-xs shrink-0" />
                              <span className="text-sm text-gray-800 font-medium truncate">
                                {item.productName ||
                                  item.productTitle ||
                                  item.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center py-5 text-gray-400 text-sm">
                          No agriculture products found
                        </p>
                      )
                    ) : (
                      <div className="p-2">
                        <p className="text-xs font-bold text-gray-500 mb-2 px-3 uppercase tracking-wider">
                          Popular Searches
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {searchSuggestions.map((suggestion, i) => (
                            <button
                              key={i}
                              onClick={() => handleSearch(suggestion)}
                              className="flex items-center gap-2 p-2 hover:bg-green-50 rounded-lg text-left transition"
                            >
                              <FaSearch className="text-gray-400 text-xs shrink-0" />
                              <span className="text-xs sm:text-sm text-gray-700 font-medium truncate">
                                {suggestion}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {isAuthModalOpen && (
        <AuthPage onClose={() => setIsAuthModalOpen(false)} />
      )}
    </>
  );
};

export default TopNavbar;