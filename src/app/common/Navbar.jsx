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
import { FaSearch, FaPhone, FaEnvelope } from "react-icons/fa";
import { FiTrash2, FiX } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { Search, createUserId } from "../interceptor/interseptor";
import AuthPage from "./LoginPage";
import { showToast } from "../utils/toast";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart, removeCartItem } from "@/app/store/cartSlice";
import { fetchWishlist } from "@/app/store/wishlistSlice";
import { fetchWebSettings } from "@/app/store/webSettingsSlice";

const TopNavbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isCartDropdownOpen, setIsCartDropdownOpen] = useState(false);

  const searchRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const cartDropdownRef = useRef(null);

  const { user, logout } = useAuth();
  const router = useRouter();
  const dispatch = useDispatch();

  const cartItems = useSelector((state) => state.cart.cartItems);
  const wishlistItems = useSelector((state) => state.wishlist.wishlistItems);
  const logo = useSelector((state) => state.webSettings.logo);

  const searchSuggestions = [
    "Face Wash",
    "Body Lotion",
    "Hair Oil",
    "Shampoo",
    "Soap",
    "Face Cream",
    "Sunscreen",
    "Moisturizer",
    "Conditioner",
    "Body Wash",
  ];

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(e.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
      if (
        cartDropdownRef.current &&
        !cartDropdownRef.current.contains(e.target)
      ) {
        setIsCartDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  //  GuestId Generator ...

  useEffect(() => {
    const initializeGuestId = async () => {
      let guestId = localStorage.getItem("guestId");
      if (!guestId) {
        try {
          const response = await createUserId();
          guestId = response;
          if (guestId) {
            localStorage.setItem("guestId", guestId);
          } else {
            console.log("error in guest Id Generate");
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
        const data =  res;
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

  // Gold glowing moving dots animation
  const particles = Array.from({ length: 30 }).map((_, i) => (
    <motion.div
      key={i}
      className="absolute w-[3px] h-[3px] bg-[#FFD700] rounded-full"
      initial={{ opacity: 0 }}
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
      animate={{
        scale: [0.5, 1, 0.5],
        opacity: [0, 1, 0],
        x: Math.random() > 0.5 ? [0, 5, 0] : [0, -5, 0],
        y: Math.random() > 0.5 ? [0, 5, 0] : [0, -5, 0],
        boxShadow: [
          "0 0 0 rgba(255,215,0,0)",
          "0 0 8px rgba(255,215,0,1)",
          "0 0 0 rgba(255,215,0,0)",
        ],
      }}
      transition={{
        duration: Math.random() * 3 + 2,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
        delay: Math.random() * 2,
      }}
    />
  ));

  return (
    <>
      {/* Main Navbar */}
      <div className="bg-[#111B30] border-b border-gray-200 sticky top-0 z-50 ">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particles}
        </div>
        <div className=" px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src={logo || "/logo.jpeg"}
                alt="Logo"
                width={200}
                height={80}
                className="object-contain h-22 w-auto"
                priority
              />
            </Link>

            {/* Center Search - Desktop */}
            <div
              className="hidden lg:flex flex-1 max-w-xl mx-12"
              ref={searchRef}
            >
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search entire store..."
                  className="w-full h-12 pl-12 pr-28 border text-white bg-transparent border-white rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all text-sm"
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
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white  text-sm" />

                {searchQuery.trim() && (
                  <button
                    onClick={() => handleSearch(searchQuery)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-700 text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-purple-800 transition"
                  >
                    Search
                  </button>
                )}

                {/* Search Dropdown */}
                <AnimatePresence>
                  {isSearchOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-2xl max-h-96 overflow-y-auto z-50"
                    >
                      {loadingSearch ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
                        </div>
                      ) : searchQuery.trim() ? (
                        // 🔹 WHEN USER TYPES → API RESULTS
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
                                className="w-full flex items-center gap-3 p-3 hover:bg-purple-50 rounded-lg text-left transition"
                              >
                                <FaSearch className="text-purple-700 text-xs" />
                                <span className="text-sm text-gray-800 font-medium">
                                  {item.productName ||
                                    item.productTitle ||
                                    item.name}
                                </span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center py-6 text-gray-400 text-sm">
                            No results found
                          </p>
                        )
                      ) : (
                        // 🔹 WHEN INPUT IS EMPTY → SUGGESTIONS
                        <div className="p-2">
                          <p className="text-xs font-bold text-gray-500 mb-3 px-3 uppercase tracking-wider">
                            Popular Searches
                          </p>

                          <div className="grid grid-cols-2 gap-2">
                            {searchSuggestions.map((suggestion, i) => (
                              <button
                                key={i}
                                onClick={() => handleSearch(suggestion)}
                                className="flex items-center gap-2 p-3 hover:bg-purple-50 rounded-lg text-left transition"
                              >
                                <FaSearch className="text-gray-400 text-xs" />
                                <span className="text-sm text-gray-700 font-medium">
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

            {/* Right Actions */}
            <div className="flex items-center gap-3 lg:gap-5">
              {/* Mobile Search */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="lg:hidden p-2.5 hover:bg-purple-50 rounded-lg transition"
              >
                <IoSearchSharp className="text-xl text-white hover:text-[#D4AF37] transition" />
              </button>

              {/* Wishlist */}
              <button
                onClick={() => {
                  // if (!user) {
                  //   setIsAuthModalOpen(true);
                  //   return;
                  // }
                  router.push("/whishlist");
                }}
                title="My Wishlist"
                className="relative flex flex-col items-center justify-center p-2.5 hover:bg-purple-50 rounded-lg transition group"
              >
                {/* Icon wrapper (for badge positioning) */}
                <div className="relative">
                  <IoMdHeartEmpty
                    className="
      text-2xl text-white
      transition-colors duration-300
      group-hover:text-[#D4AF37]
    "
                  />

                  {!!wishlistItems.length && (
                    <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold animate-pulse">
                      {wishlistItems.length}
                    </span>
                  )}
                </div>

                {/* Text below icon */}
                <span className="hidden lg:block text-xs text-white font-medium mt-1 text-center group-hover:text-purple-700 transition">
                  Wishlist
                </span>
              </button>

              {/* Cart */}
              <button
                onClick={() => {
                  // if (!user) { setIsAuthModalOpen(true); return; }
                  router.push("/cart");
                }}
                className="relative p-2.5 hover:bg-purple-50 rounded-lg transition group"
                title="My Cart"
              >
                <BsCart2 className="text-2xl text-white group-hover:text-[#D4AF37] transition" />
                {!!cartItems.length && (
                  <span className="absolute -top-1 -right-1 bg-purple-700 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold animate-pulse">
                    {cartItems.length}
                  </span>
                )}
                <span className="hidden lg:block text-xs text-white font-medium mt-0.5 group-hover:text-purple-700 transition">
                  Cart
                </span>
              </button>

              {/* Account */}
              <div ref={profileDropdownRef} className="relative">
                {user ? (
                  <>
                    <button
                      onClick={() =>
                        setIsProfileDropdownOpen(!isProfileDropdownOpen)
                      }
                      title="My Account"
                      className="flex flex-col items-center justify-center p-2.5 hover:bg-purple-50 rounded-lg transition group"
                    >
                      {/* Icon */}
                      <VscAccount className="text-2xl text-white group-hover:text-[#D4AF37] transition" />

                      {/* Text below icon */}
                      <span className="hidden lg:block text-xs text-white font-medium mt-1 text-center group-hover:text-purple-700 transition">
                        Account
                      </span>
                    </button>

                    <AnimatePresence>
                      {isProfileDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border overflow-hidden"
                        >
                          <div className="p-5 bg-gradient-to-br from-purple-700 via-purple-600 to-pink-600 text-white">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center ring-2 ring-white/30">
                                <VscAccount className="text-white text-xl" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm truncate">
                                  {user.name}
                                </p>
                                <p className="text-xs text-purple-100 truncate">
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
                              className="w-full px-5 py-3 text-left hover:bg-purple-50 flex items-center gap-3 transition text-sm font-semibold text-gray-800"
                            >
                              <VscAccount className="text-lg text-purple-700" />
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
                    className="px-2 md:px-6 py-2.5  text-white rounded-lg text-sm font-bold whitespace-nowrap  bg-bgvariant-1 hover:bg-bgvariant-1  shadow-lg hover:shadow-xl"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="lg:hidden pb-4 overflow-hidden"
              >
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search entire store..."
                    className="w-full h-12 pl-12 pr-24 text-white bg-transparent border border-gray-300 rounded-lg  focus:ring-2 focus:ring-purple-100 focus:outline-none"
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
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  {searchQuery.trim() && (
                    <button
                      onClick={() => handleSearch(searchQuery)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-semibold"
                    >
                      Search
                    </button>
                  )}
                </div>

                {/* Mobile Search Dropdown */}
                <AnimatePresence>
                  {(searchQuery.trim() || isSearchOpen) && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-2xl max-h-96 overflow-y-auto"
                    >
                      {loadingSearch ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
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
                                className="w-full flex items-center gap-3 p-3 hover:bg-purple-50 rounded-lg text-left transition"
                              >
                                <FaSearch className="text-purple-700 text-xs" />
                                <span className="text-sm text-gray-800 font-medium">
                                  {item.productName ||
                                    item.productTitle ||
                                    item.name}
                                </span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center py-6 text-gray-400 text-sm">
                            No results found
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
                                className="flex items-center gap-2 p-3 hover:bg-purple-50 rounded-lg text-left transition"
                              >
                                <FaSearch className="text-gray-400 text-xs" />
                                <span className="text-sm text-gray-700 font-medium">
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {isAuthModalOpen && (
        <AuthPage onClose={() => setIsAuthModalOpen(false)} />
      )}
    </>
  );
};

export default TopNavbar;