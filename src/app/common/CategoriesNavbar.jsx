"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { FiChevronDown, FiHome, FiMail, FiMenu, FiUser, FiX } from "react-icons/fi";
import { FaLeaf } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { fetchNavbarData } from "@/app/store/navbarSlice";

const categoryPath = (title) => `/shoppage?category=${encodeURIComponent(title)}`;
const subcategoryPath = (category, subcategory) =>
  `${categoryPath(category)}&sub=${encodeURIComponent(subcategory)}`;
const getSubcategoryTitle = (subcategory) =>
  subcategory?.subCategoryTitle || subcategory?.title || subcategory?.name || "";

const CategoryNavbar = () => {
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileCategory, setOpenMobileCategory] = useState(null);
  const [isAllCategoryOpen, setIsAllCategoryOpen] = useState(false);
  const [expandedAllCategory, setExpandedAllCategory] = useState(null);
  const allCategoryRef = useRef(null);

  const dispatch = useDispatch();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams?.get("category") || "";
  const activeSubcategory = searchParams?.get("sub") || "";
  const rawCategories = useSelector((state) => state.navbar.categories);
  const categories = Array.isArray(rawCategories)
    ? rawCategories.filter(
        (category) =>
          typeof category?.categoryTitle === "string" && category.categoryTitle.trim()
      )
    : [];

  const visibleCategories = categories.slice(0, 5);
  const remainingCategories = categories.slice(5);
  const hasMoreCategories = remainingCategories.length > 0;

  const staticItems = [
    { title: "HOME", path: "/", icon: FiHome },
    { title: "ABOUT US", path: "/aboutuspage", icon: FiUser },
    { title: "CONTACT", path: "/contactpage", icon: FiMail },
  ];

  useEffect(() => {
    dispatch(fetchNavbarData());
  }, [dispatch]);

  // Close ALL CATEGORY dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (allCategoryRef.current && !allCategoryRef.current.contains(event.target)) {
        setIsAllCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close dropdown on navigation
  useEffect(() => {
    setIsAllCategoryOpen(false);
    setExpandedAllCategory(null);
  }, [pathname, searchParams]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const isPageActive = (path) =>
    path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(`${path}/`);
  const isCategoryActive = (category) =>
    pathname.startsWith("/shoppage") &&
    activeCategory.toLowerCase() === category.categoryTitle?.toLowerCase();
  const isAnyRemainingActive = remainingCategories.some((cat) => isCategoryActive(cat));

  const renderMobileCategory = (category) => {
    const title = category.categoryTitle;
    const subcategories = Array.isArray(category.subCategories)
      ? category.subCategories.filter((sub) => getSubcategoryTitle(sub))
      : [];
    const hasSubcategories = subcategories.length > 0;
    const categoryKey = category._id || title;
    const open = openMobileCategory === categoryKey;
    const active = isCategoryActive(category);

    return (
      <div key={categoryKey} className="space-y-0.5">
        <button
          onClick={() =>
            hasSubcategories
              ? setOpenMobileCategory(open ? null : categoryKey)
              : (router.push(categoryPath(title)), setIsMobileMenuOpen(false))
          }
          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-semibold text-sm transition ${
            active
              ? "bg-bgvariant-1 text-white shadow-sm"
              : "hover:bg-green-50 text-gray-800"
          }`}
        >
          <span className="truncate">{title}</span>
          {hasSubcategories && (
            <FiChevronDown
              className={`text-sm transition-transform duration-200 shrink-0 ${
                open ? "rotate-180" : ""
              }`}
            />
          )}
        </button>

        {/* Expandable Subcategories */}
        {hasSubcategories && open && (
          <div className="ml-3 border-l-2 border-green-200 pl-2 py-1 space-y-0.5">
            <button
              onClick={() => {
                router.push(categoryPath(title));
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-1.5 text-xs font-semibold text-bgvariant-1 hover:bg-green-50 rounded-lg transition"
            >
              All {title}
            </button>
            {subcategories.map((sub) => {
              const label = getSubcategoryTitle(sub);
              return (
                <button
                  key={sub._id || label}
                  onClick={() => {
                    router.push(subcategoryPath(title, label));
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-gray-600 hover:bg-green-50 hover:text-bgvariant-1 rounded-lg transition truncate"
                >
                  • {label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderCategory = (category) => {
    const title = category.categoryTitle;
    const subcategories = Array.isArray(category.subCategories)
      ? category.subCategories.filter((sub) => getSubcategoryTitle(sub))
      : [];
    const hasSubcategories = subcategories.length > 0;
    const categoryKey = category._id || title;
    const active = isCategoryActive(category);

    return (
      <li
        key={categoryKey}
        className="relative group font-fontcontent"
        onMouseEnter={() => hasSubcategories && setHoveredCategory(categoryKey)}
        onMouseLeave={() => setHoveredCategory(null)}
      >
        <Link
          href={categoryPath(title)}
          className={`flex items-center gap-1.5 text-xs xl:text-sm font-semibold tracking-wide transition-colors py-2 whitespace-nowrap uppercase ${
            active
              ? "text-white font-bold"
              : "text-white/90 hover:text-white"
          }`}
        >
          {active && <FaLeaf className="text-green-300 text-xs shrink-0" />}
          <span>{title}</span>
          {hasSubcategories && (
            <FiChevronDown
              className={`text-xs text-white/80 transition-transform duration-200 shrink-0 ${
                hoveredCategory === categoryKey ? "rotate-180" : ""
              }`}
            />
          )}
        </Link>
        <span
          className={`absolute left-0 -bottom-0.5 h-0.5 bg-green-300 rounded-full transition-all duration-300 ${
            active ? "w-full" : "w-0 group-hover:w-full"
          }`}
        />
        <AnimatePresence>
          {hasSubcategories && hoveredCategory === categoryKey && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.18 }}
              className="absolute left-1/2 -translate-x-1/2 top-full mt-1 w-72 bg-white shadow-2xl rounded-xl border border-green-100 overflow-hidden z-50"
            >
              <div className="py-2 max-h-96 overflow-y-auto">
                {subcategories.map((sub, index) => {
                  const label = getSubcategoryTitle(sub);
                  const subActive =
                    active && activeSubcategory.toLowerCase() === label.toLowerCase();
                  return (
                    <motion.button
                      key={sub._id || label}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.025 }}
                      onClick={() => {
                        router.push(subcategoryPath(title, label));
                        setHoveredCategory(null);
                      }}
                      className={`w-full text-left px-5 py-2.5 text-sm font-medium transition-all border-l-4 ${
                        subActive
                          ? "bg-green-50 text-bgvariant-1 border-bgvariant-1 font-semibold"
                          : "text-gray-700 hover:bg-green-50 hover:text-bgvariant-1 border-transparent"
                      }`}
                    >
                      {label}
                    </motion.button>
                  );
                })}
                <Link
                  href={categoryPath(title)}
                  onClick={() => setHoveredCategory(null)}
                  className="block border-t border-green-100 px-5 py-2.5 text-sm font-semibold text-bgvariant-1 hover:bg-green-50"
                >
                  All Products
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </li>
    );
  };

  return (
    <>
      {/* Category Navigation Bar */}
      <nav
        aria-label="Category Navigation"
        className="bg-[#0c4320] border-b border-green-950/40 sticky top-20 sm:top-22 z-40 shadow-sm w-full max-w-full overflow-x-clip"
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-11 sm:h-12">
            {/* Mobile / Tablet Menu Button (< lg) */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-emerald-700/80 text-white rounded-lg font-semibold text-xs sm:text-sm hover:bg-emerald-600 transition shadow-sm shrink-0"
              aria-label="Open Navigation Menu"
            >
              <FiMenu className="text-base sm:text-lg" />
              <span>Categories & Menu</span>
            </button>

            {/* Desktop Navigation List (lg breakpoint and up) */}
            <div className="hidden lg:flex items-center w-full justify-center">
              <ul className="flex items-center gap-5 xl:gap-8 flex-wrap justify-center font-fontcontent">
                <li className="relative group font-fontcontent">
                  <Link
                    href="/"
                    className={`flex items-center gap-1.5 text-xs xl:text-sm font-semibold tracking-wide py-2 whitespace-nowrap uppercase transition-colors ${
                      isPageActive("/")
                        ? "text-white font-bold"
                        : "text-white/90 hover:text-white"
                    }`}
                  >
                    HOME
                  </Link>
                  <span
                    className={`absolute left-0 -bottom-0.5 h-0.5 bg-green-300 rounded-full transition-all duration-300 ${
                      isPageActive("/") ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </li>
                {visibleCategories.map(renderCategory)}
                {hasMoreCategories && (
                  <li
                    ref={allCategoryRef}
                    className="relative group font-fontcontent"
                    onMouseEnter={() => setIsAllCategoryOpen(true)}
                    onMouseLeave={() => setIsAllCategoryOpen(false)}
                  >
                    <button
                      type="button"
                      onClick={() => setIsAllCategoryOpen((prev) => !prev)}
                      className={`flex items-center gap-1.5 text-xs xl:text-sm font-semibold tracking-wide transition-colors py-2 whitespace-nowrap cursor-pointer uppercase ${
                        isAnyRemainingActive
                          ? "text-white font-bold"
                          : "text-white/90 hover:text-white"
                      }`}
                      aria-expanded={isAllCategoryOpen}
                      aria-haspopup="true"
                    >
                      {isAnyRemainingActive && (
                        <FaLeaf className="text-green-300 text-xs shrink-0" />
                      )}
                      <span>ALL CATEGORY</span>
                      <FiChevronDown
                        className={`text-xs text-white/80 transition-transform duration-200 shrink-0 ${
                          isAllCategoryOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <span
                      className={`absolute left-0 -bottom-0.5 h-0.5 bg-green-300 rounded-full transition-all duration-300 ${
                        isAnyRemainingActive || isAllCategoryOpen
                          ? "w-full"
                          : "w-0 group-hover:w-full"
                      }`}
                    />
                    <AnimatePresence>
                      {isAllCategoryOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.18 }}
                          className="absolute left-1/2 -translate-x-1/2 top-full mt-1 w-72 bg-white shadow-2xl rounded-xl border border-green-100 overflow-hidden z-50"
                        >
                          <div className="py-2 max-h-96 overflow-y-auto">
                            {remainingCategories.map((cat) => {
                              const title = cat.categoryTitle;
                              const catKey = cat._id || title;
                              const subcategories = Array.isArray(cat.subCategories)
                                ? cat.subCategories.filter((sub) => getSubcategoryTitle(sub))
                                : [];
                              const hasSubcategories = subcategories.length > 0;
                              const active = isCategoryActive(cat);
                              const isExpanded = expandedAllCategory === catKey;

                              return (
                                <div key={catKey} className="text-left">
                                  <div
                                    className={`flex items-center justify-between px-5 py-2.5 transition-all border-l-4 ${
                                      active
                                        ? "bg-green-50 text-bgvariant-1 border-bgvariant-1 font-semibold"
                                        : "text-gray-700 hover:bg-green-50 hover:text-bgvariant-1 border-transparent"
                                    }`}
                                  >
                                    <Link
                                      href={categoryPath(title)}
                                      onClick={() => setIsAllCategoryOpen(false)}
                                      className="flex-1 text-sm font-medium truncate"
                                    >
                                      {title}
                                    </Link>
                                    {hasSubcategories && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setExpandedAllCategory(isExpanded ? null : catKey);
                                        }}
                                        className="p-1 text-gray-400 hover:text-bgvariant-1 transition shrink-0 ml-2"
                                        aria-label={`Toggle ${title} subcategories`}
                                      >
                                        <FiChevronDown
                                          className={`text-xs transition-transform duration-200 ${
                                            isExpanded ? "rotate-180" : ""
                                          }`}
                                        />
                                      </button>
                                    )}
                                  </div>

                                  {hasSubcategories && isExpanded && (
                                    <div className="bg-gray-50/80 py-1 pl-7 pr-4 border-l-2 border-green-200 ml-5 my-1 space-y-1">
                                      {subcategories.map((sub) => {
                                        const label = getSubcategoryTitle(sub);
                                        const subActive =
                                          active &&
                                          activeSubcategory.toLowerCase() === label.toLowerCase();
                                        return (
                                          <Link
                                            key={sub._id || label}
                                            href={subcategoryPath(title, label)}
                                            onClick={() => setIsAllCategoryOpen(false)}
                                            className={`block py-1 text-xs transition truncate ${
                                              subActive
                                                ? "text-bgvariant-1 font-semibold"
                                                : "text-gray-600 hover:text-bgvariant-1"
                                            }`}
                                          >
                                            • {label}
                                          </Link>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                )}
                {staticItems.slice(1).map((item) => (
                  <li key={item.title} className="relative group font-fontcontent">
                    <Link
                      href={item.path}
                      className={`flex items-center gap-1.5 text-xs xl:text-sm font-semibold tracking-wide py-2 whitespace-nowrap uppercase transition-colors ${
                        isPageActive(item.path)
                          ? "text-white font-bold"
                          : "text-white/90 hover:text-white"
                      }`}
                    >
                      {item.title}
                    </Link>
                    <span
                      className={`absolute left-0 -bottom-0.5 h-0.5 bg-green-300 rounded-full transition-all duration-300 ${
                        isPageActive(item.path) ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                    />
                  </li>
                ))}
              </ul>
            </div>

            {/* Spacer on mobile to keep layout clean */}
            <div className="lg:hidden flex-1" />
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[998]"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Sliding Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed top-0 left-0 w-80 max-w-[85vw] h-full bg-white shadow-2xl z-[999] flex flex-col overflow-hidden"
              aria-label="Mobile navigation"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-5 h-16 bg-[#1a4a13] text-white shrink-0">
                <div className="flex items-center gap-2">
                  <FaLeaf className="text-green-400 text-lg" />
                  <h2 className="text-base font-bold tracking-wide">Agrowmed Menu</h2>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition"
                  aria-label="Close menu"
                >
                  <FiX className="text-2xl" />
                </button>
              </div>

              {/* Drawer Navigation Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {/* Home Link */}
                {staticItems.slice(0, 1).map((item) => (
                  <button
                    key={item.title}
                    onClick={() => {
                      router.push(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-xl font-semibold text-sm transition ${
                      isPageActive(item.path)
                        ? "bg-bgvariant-1 text-white shadow-sm"
                        : "hover:bg-green-50 text-gray-800"
                    }`}
                  >
                    <item.icon className="text-lg" />
                    <span>{item.title}</span>
                  </button>
                ))}

                {/* Categories Section Heading */}
                <div className="pt-3 pb-1 px-4">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Categories
                  </p>
                </div>

                {/* Dynamic Categories with Accordion Subcategories */}
                {visibleCategories.map(renderMobileCategory)}

                {hasMoreCategories && (
                  <div className="space-y-0.5">
                    <button
                      onClick={() =>
                        setOpenMobileCategory(
                          openMobileCategory === "MOBILE_ALL_CATEGORY"
                            ? null
                            : "MOBILE_ALL_CATEGORY"
                        )
                      }
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-semibold text-sm transition ${
                        isAnyRemainingActive
                          ? "bg-bgvariant-1 text-white shadow-sm"
                          : "hover:bg-green-50 text-gray-800"
                      }`}
                    >
                      <span className="truncate font-bold">ALL CATEGORY</span>
                      <FiChevronDown
                        className={`text-sm transition-transform duration-200 shrink-0 ${
                          openMobileCategory === "MOBILE_ALL_CATEGORY"
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>

                    {openMobileCategory === "MOBILE_ALL_CATEGORY" && (
                      <div className="ml-3 border-l-2 border-green-300 pl-2 py-1 space-y-0.5">
                        {remainingCategories.map(renderMobileCategory)}
                      </div>
                    )}
                  </div>
                )}

                {/* Other Static Links */}
                <div className="pt-3 pb-1 px-4">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Company
                  </p>
                </div>
                {staticItems.slice(1).map((item) => (
                  <button
                    key={item.title}
                    onClick={() => {
                      router.push(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-xl font-semibold text-sm transition ${
                      isPageActive(item.path)
                        ? "bg-bgvariant-1 text-white shadow-sm"
                        : "hover:bg-green-50 text-gray-800"
                    }`}
                  >
                    <item.icon className="text-lg" />
                    <span>{item.title}</span>
                  </button>
                ))}
              </div>

              {/* Drawer Footer */}
              <div className="border-t border-gray-100 p-4 bg-gray-50/80 shrink-0">
                <p className="text-xs text-gray-500 text-center font-medium">
                  © 2026 Agrowmed. Agriculture Products.
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default CategoryNavbar;
