"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Eye, X, Heart, ChevronRight, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AuthPage from "../common/LoginPage";
import {
  addCartItem,
} from "@/app/store/cartSlice";
import {
  addWishlistItem,
  removeWishlistItem,
} from "@/app/store/wishlistSlice";
import { useDispatch, useSelector } from "react-redux";
import { IoOptions } from "react-icons/io5";

export default function ReuseCard({ product, type = "four", isSingleProductView = false }) {
  console.log("Grid Type:", type);
  const [showModal, setShowModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const router = useRouter();
  const { isLoggedIn } = useAuth();

  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.cart);
  const { wishlistItems } = useSelector((state) => state.wishlist);

  useEffect(() => {
    setMounted(true);
    // Check if mobile
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const requireLogin = (actionCallback) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return false;
    }
    return actionCallback();
  };

  // Loading skeleton
  if (!product) {
    return (
      <div className={`${getCardContainerClass()} bg-gray-50 p-2 sm:p-3 md:p-4`}>
        <div className="bg-white rounded-lg overflow-hidden w-full relative animate-pulse">
          <div className={`bg-gray-200 ${getImageHeightClass()}`}></div>
          <div className="p-3 sm:p-4 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded w-full mt-3"></div>
          </div>
        </div>
      </div>
    );
  }

  // Responsive styling functions
  const getCardContainerClass = () => {
    if (type === "single") return "w-full";
    
    // For mobile: single column on small screens
    if (isMobile) return "w-full";
    
    // For desktop grid
    if (type === "three") return "w-full";
    if (type === "four") return "w-full";
    return "w-full";
  };

  const getImageHeightClass = () => {
    // Mobile first approach
    if (isMobile) {
      switch(type) {
        case "single": return "h-48 sm:h-56"; // List view on mobile
        case "three": return "h-48 sm:h-56"; // Medium height
        case "four": return "h-40 sm:h-48"; // Compact
        default: return "h-48";
      }
    }
    
    // Desktop
    switch(type) {
      case "single": return "h-64 md:h-72 lg:h-80"; // List view
      case "three": return "h-56 md:h-64 lg:h-72"; // Medium
      case "four": return "h-48 md:h-56 lg:h-60"; // Compact
      default: return "h-56";
    }
  };

  const getTitleClass = () => {
    if (isMobile) {
      switch(type) {
        case "single": return "text-base font-semibold";
        case "three": return "text-sm font-medium line-clamp-2";
        case "four": return "text-xs sm:text-sm font-medium line-clamp-2";
        default: return "text-sm font-medium";
      }
    }
    
    switch(type) {
      case "single": return "text-lg md:text-xl font-semibold";
      case "three": return "text-base md:text-lg font-medium line-clamp-2";
      case "four": return "text-sm md:text-base font-medium line-clamp-2";
      default: return "text-sm font-medium";
    }
  };

  const getPriceClass = () => {
    if (isMobile) {
      switch(type) {
        case "single": return "text-lg";
        case "three": return "text-base";
        case "four": return "text-sm";
        default: return "text-base";
      }
    }
    
    switch(type) {
      case "single": return "text-xl md:text-2xl";
      case "three": return "text-lg md:text-xl";
      case "four": return "text-base md:text-lg";
      default: return "text-base";
    }
  };

  const getButtonSizeClass = () => {
    if (isMobile) {
      switch(type) {
        case "single": return "px-3 py-2 text-xs";
        case "three": return "px-2 py-1.5 text-xs";
        case "four": return "px-2 py-1 text-xs";
        default: return "px-2 py-1.5 text-xs";
      }
    }
    
    switch(type) {
      case "single": return "px-4 py-2.5 text-sm";
      case "three": return "px-3 py-2 text-xs sm:text-sm";
      case "four": return "px-2 py-1.5 text-xs sm:text-sm";
      default: return "px-3 py-2 text-xs";
    }
  };

  const getCardPaddingClass = () => {
    if (isMobile) {
      switch(type) {
        case "single": return "p-3 sm:p-4";
        case "three": return "p-2 sm:p-3";
        case "four": return "p-1.5 sm:p-2";
        default: return "p-2 sm:p-3";
      }
    }
    
    switch(type) {
      case "single": return "p-4 md:p-6";
      case "three": return "p-3 md:p-4";
      case "four": return "p-2 md:p-3";
      default: return "p-3";
    }
  };

  // Product data extraction (unchanged)
  const isVariantProduct = product.productType === "variant";
  const isNonVariantProduct = product.productType === "nonVariant";
  const variantType = product.variant?.variantType;
  const isUnitOnly = variantType === "unitOnly";

  let displayImage,
    displayPrice,
    displayCostPrice,
    displayDiscount,
    productId,
    variantId,
    productType,
    varaintType,
    displayName,
    units = [],
    variants = [],
    priceBreakdown;

  if (isVariantProduct) {
    displayName = product.productName;

    if (isUnitOnly) {
      variants = product.variant?.unitOnlyVariants || [];
      units = variants.map((v) => v.unit).filter(Boolean);
      const firstVariant = variants[0];
      displayImage =
        firstVariant?.variantImages?.[0] || product.productImages?.[0];
      displayPrice = product.basePrice || firstVariant?.price?.salePrice || 0;
      displayCostPrice = firstVariant?.price?.costPrice || displayPrice;
      displayDiscount = firstVariant?.price?.discount || 0;
      priceBreakdown = firstVariant?.price;
      productId = product._id;
      variantId = firstVariant?._id;
      productType = product.productType;
      varaintType = product.variant?.variantType;
    }
  } else if (isNonVariantProduct) {
    displayImage =
      product.nonVariant?.nonVariantImages?.[0] || product.productImages?.[0];
    displayPrice = product.nonVariant?.price?.salePrice || 0;
    displayCostPrice = product.nonVariant?.price?.costPrice || displayPrice;
    displayDiscount = product.nonVariant?.price?.discount || 0;
    displayName = product.productName;
    productId = product._id;
    variantId = product.nonVariant._id;
    priceBreakdown = product.nonVariant?.price;
    productType = product.productType;
    varaintType = null;
  }

  // REAL-TIME: Check if product/variant is in wishlist
  const isWishlisted = wishlistItems.some(
    (item) =>
      item.productId === productId &&
      item.variantId === variantId &&
      item.productType === productType,
  );

  // REAL-TIME: Check if in cart
  const isInCart = isNonVariantProduct
    ? cartItems.some(
        (item) =>
          item.productId === productId &&
          item.variantId === variantId &&
          item.productType === "nonVariant",
      )
    : cartItems.some((item) => item.productId === productId);

  const getSelectedVariant = () => {
    if (!isVariantProduct) return null;
    if (selectedUnit) {
      return variants.find((v) => v.unit === selectedUnit) || variants[0];
    }
    return variants[0] || null;
  };

  const selectedVariant = getSelectedVariant();
  const modalImage = selectedVariant?.variantImages?.[0] || displayImage;
  const modalPrice = selectedVariant?.price?.salePrice || displayPrice;
  const modalCostPrice = selectedVariant?.price?.costPrice || displayCostPrice;
  const modalDiscount = selectedVariant?.price?.discount || displayDiscount;
  const modalStock = selectedVariant?.stockCount || 0;

  // REAL-TIME: Selected variant wishlist & cart status
  const isSelectedVariantWishlisted = selectedVariant
    ? wishlistItems.some(
        (item) =>
          item.productId === productId &&
          item.variantId === selectedVariant._id &&
          item.productType === "variant",
      )
    : false;

  const isSelectedVariantInCart = selectedVariant
    ? cartItems.some(
        (item) =>
          item.productId === productId &&
          item.variantId === selectedVariant._id &&
          item.productType === "variant",
      )
    : false;

  const handleMainWishlistToggle = () => {
      if (isVariantProduct) {
        setShowModal(true);
        if (variants[0]?.unit) setSelectedUnit(variants[0].unit);
      } else {
        if (isWishlisted) {
          dispatch(
            removeWishlistItem({
              productId,
              variantId,
              productType: "nonVariant",
              variantType: varaintType,
            }),
          );
        } else {
          dispatch(
            addWishlistItem({
              productId,
              variantId,
              productType: "nonVariant",
              variantType: varaintType,
            }),
          );
        }
      }
  };

  const handleVariantWishlistToggle = () => {
    if (selectedVariant) {
      if (isSelectedVariantWishlisted) {
        dispatch(
          removeWishlistItem({
            productId,
            variantId: selectedVariant._id,
            productType: "variant",
            variantType: varaintType,
          }),
        );
      } else {
        dispatch(
          addWishlistItem({
            productId,
            variantId: selectedVariant._id,
            productType: "variant",
            variantType: varaintType,
          }),
        );
      }
    }
  };

  const handleQuickView = () => {
    if (isVariantProduct) {
      setShowModal(true);
      if (variants[0]?.unit) setSelectedUnit(variants[0].unit);
    } else {
      router.push(`/productdetails/?id=${productId}`);
    }
  };

  const handleAddToCart = () => {
    if (isVariantProduct && selectedVariant) {
      if (isSelectedVariantInCart) {
        router.push("/cart");
      } else {
        dispatch(
          addCartItem({
            productId,
            variantId: selectedVariant._id,
            productType: "variant",
            variantType: "unitOnly",
          }),
        );
      }
    }
  };

  const handleNonVariantAddToCart = () => {
    if (isNonVariantProduct) {
      if (isInCart) {
        router.push("/cart");
      } else {
        dispatch(
          addCartItem({
            productId,
            variantId,
            productType: "nonVariant",
          }),
        );
      }
    }
  };

  const handleBuyNow = () => {
    const action = () => {
      let buyNowItemData;

      if (isVariantProduct && selectedVariant) {
        buyNowItemData = {
          productId: product._id,
          variantId: selectedVariant._id,
          quantity: 1,
          productType: "variant",
          variantType: varaintType,
          priceBreakdown: selectedVariant.price || priceBreakdown,
          productName: displayName,
          productImage: selectedVariant.variantImages?.[0] || displayImage,
          variantDetails: {
            unit: selectedVariant.unit || null,
          },
          stockCount: selectedVariant.stockCount || 0,
        };
      } else {
        buyNowItemData = {
          productId: product._id,
          variantId,
          quantity: 1,
          productType: "nonVariant",
          variantType: null,
          priceBreakdown,
          productName: displayName,
          productImage: displayImage,
          stockCount: product.nonVariant?.stockCount || 0,
        };
      }

      localStorage.setItem("buyNowItem", JSON.stringify(buyNowItemData));
      const params = new URLSearchParams({
        buyNow: "true",
        productId: buyNowItemData.productId,
        variantId: buyNowItemData.variantId || "",
        quantity: buyNowItemData.quantity,
      });
      router.push(`/checkoutpage?${params.toString()}`);
    };

    action()
  };

  // Responsive card renderer
  const renderProductCard = () => {
    const cardWidth = "w-full";
    
    return (
      <div className={`${cardWidth} group relative cursor-pointer ${getCardPaddingClass()} bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100`}>
        {/* IMAGE CONTAINER */}
        <div className="relative overflow-hidden rounded-lg">
          <Link href={`/productdetails/?id=${productId}`}>
            <img
              src={displayImage}
              alt={displayName}
              className={`
                w-full ${getImageHeightClass()} object-cover
                transform transition-transform duration-500 ease-out
                group-hover:scale-110
              `}
              loading="lazy"
            />
          </Link>

          {/* DISCOUNT BADGE - Responsive positioning */}
          {displayDiscount > 0 && (
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold z-10">
              {displayDiscount}% OFF
            </div>
          )}

          {/* WISHLIST ICON - Top right for all screens */}
          <button
            onClick={handleMainWishlistToggle}
            className="
              absolute top-2 right-2 sm:top-3 sm:right-3 z-20
              bg-white h-8 w-8 rounded-full
              flex items-center justify-center
              shadow-lg
              transition-all duration-200
              hover:scale-110 active:scale-95
              hover:shadow-xl
            "
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`w-4 h-4 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-700"}`}
            />
          </button>

          {/* QUICK VIEW & ACTION BUTTONS - Hover on desktop, Always visible on mobile */}
          <div className={`
            ${isMobile 
              ? 'absolute bottom-2 right-2 flex flex-col gap-2 z-20' 
              : 'absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center'
            }
          `}>
            <div className={`
              ${isMobile 
                ? 'flex flex-col gap-2' 
                : 'flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 [perspective:800px]'
              }
            `}>
              {/* QUICK VIEW BUTTON */}
              <button
                onClick={handleQuickView}
                className={`
                  ${isMobile 
                    ? 'bg-white/90 backdrop-blur-sm h-9 w-9 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 hover:bg-white'
                    : 'group/quick w-36 h-10 rounded-full bg-white text-black flex items-center justify-center font-medium text-sm transform origin-bottom transition-all duration-500 ease-out hover:bg-black hover:text-white'
                  }
                `}
                aria-label="Quick view"
              >
                {isMobile ? (
                  <Eye className="w-4 h-4 text-gray-700" />
                ) : (
                  <>
                    <span className="group-hover/quick:hidden">Quick view</span>
                    <Eye className="w-4 h-4 hidden group-hover/quick:block" />
                  </>
                )}
              </button>

              {/* VIEW OPTIONS / ADD TO CART BUTTON */}
              <button
                onClick={() => {
                  if (isVariantProduct) {
                    setShowModal(true);
                    if (variants[0]?.unit) setSelectedUnit(variants[0].unit);
                  } else {
                    handleNonVariantAddToCart();
                  }
                }}
                className={`
                  ${isMobile 
                    ? 'bg-white/90 backdrop-blur-sm h-9 w-9 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 hover:bg-white'
                    : 'group/quick w-36 h-10 rounded-full bg-white text-black flex items-center justify-center transition-all duration-300 text-sm hover:bg-black hover:text-white'
                  }
                `}
                aria-label={isVariantProduct ? "View options" : (isInCart ? "Go to cart" : "Add to cart")}
              >
                {isMobile ? (
                  isVariantProduct ? (
                    <IoOptions className="w-4 h-4 text-gray-700" />
                  ) : (
                    <ShoppingCart className="w-4 h-4 text-gray-700" />
                  )
                ) : (
                  <>
                    <span className="group-hover/quick:hidden font-medium">
                      {isVariantProduct ? "View options" : (isInCart ? "Go to Cart" : "Add To Cart")}
                    </span>
                    {isVariantProduct ? (
                      <IoOptions className="w-4 h-4 hidden group-hover/quick:block" />
                    ) : (
                      <ShoppingCart className="w-4 h-4 hidden group-hover/quick:block" />
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* PRODUCT INFO */}
        <div className="mt-3 sm:mt-4">
          <Link href={`/productdetails/?id=${productId}`}>
            <h3 className={`${getTitleClass()} text-gray-800 mb-1 sm:mb-2 hover:text-bgvariant-2 transition-colors overflow-hidden text-ellipsis truncate`}>
              {displayName}
            </h3>
          </Link>

          <div className="space-y-1 sm:space-y-2">
            {/* PRICE SECTION */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <p className={`${getPriceClass()} font-bold text-bgvariant-2`}>
                {isVariantProduct ? "From " : ""}Rs. {displayPrice?.toFixed(2)}
              </p>
              {displayDiscount > 0 && (
                <p className="text-gray-500 line-through text-sm sm:text-base">
                  Rs. {displayCostPrice?.toFixed(2)}
                </p>
              )}
            </div>

            {/* DISCOUNT & TAX INFO */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {displayDiscount > 0 && (
                <span className="text-xs sm:text-sm text-red-600 bg-red-50 px-2 py-0.5 rounded font-medium">
                  Save {displayDiscount}%
                </span>
              )}
              <p className="text-xs sm:text-sm text-gray-500">Including all taxes</p>
            </div>

            {/* STOCK STATUS */}
            {isNonVariantProduct && (
              <div className="mt-1 sm:mt-2">
                <span className={`text-xs sm:text-sm font-medium ${product.nonVariant?.stockCount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.nonVariant?.stockCount > 0 
                    ? `In Stock (${product.nonVariant.stockCount} left)` 
                    : 'Out of Stock'}
                </span>
              </div>
            )}
          </div>


        </div>
      </div>
    );
  };

  // Responsive Modal
  const modalContent = isVariantProduct && (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto relative mx-2 sm:mx-4">
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-red-400 hover:bg-red-500 text-white p-1 sm:p-2 rounded-full transition-colors z-10"
          aria-label="Close modal"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6 md:p-8">
          {/* IMAGE SECTION */}
          <div className="bg-gray-50 p-4 sm:p-6 md:p-8 flex items-center justify-center rounded-lg">
            <img
              src={modalImage}
              alt={displayName}
              className="w-full h-auto max-h-64 sm:max-h-80 md:max-h-96 object-contain"
              loading="lazy"
            />
            {selectedVariant && (
              <button
                onClick={handleVariantWishlistToggle}
                className="absolute top-12 sm:top-16 md:top-20 right-3 sm:right-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
                aria-label={isSelectedVariantWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${
                    isSelectedVariantWishlisted
                      ? "fill-red-500 text-red-500"
                      : "text-gray-700"
                  }`}
                />
              </button>
            )}
          </div>

          {/* DETAILS SECTION */}
          <div className="p-2 sm:p-4 md:p-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-serif text-gray-800 mb-2">
              {product.productName}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
              {product.inventory?.productCode}
            </p>

            {/* PRICE */}
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <p className="text-xl sm:text-2xl font-bold text-gray-800">
                  Rs. {modalPrice?.toFixed(2)}
                </p>
                {modalDiscount > 0 && (
                  <>
                    <p className="text-lg sm:text-xl text-gray-500 line-through">
                      Rs. {modalCostPrice?.toFixed(2)}
                    </p>
                    <span className="bg-red-500 text-white px-2 py-1 rounded text-xs sm:text-sm font-bold">
                      {modalDiscount}% OFF
                    </span>
                  </>
                )}
              </div>
              <p className="text-gray-500 text-xs sm:text-sm mt-2 font-bold">Including all taxes</p>
            </div>

            {/* STOCK STATUS */}
            {modalStock > 0 ? (
              <p className="text-sm sm:text-base text-green-600 font-medium mb-4">
                In Stock ({modalStock} left)
              </p>
            ) : (
              <p className="text-sm sm:text-base text-red-600 font-medium mb-4">
                Out of Stock
              </p>
            )}

            {/* UNIT / PACK SIZE SELECTOR */}
            {isUnitOnly && variants.length > 0 && (
              <div className="mb-4 sm:mb-6">
                <label className="block text-gray-700 font-medium mb-2 sm:mb-3">
                  Pack Size / Unit:{" "}
                  <span className="font-normal text-gray-600">
                    {selectedVariant?.unit || "Select a unit"}
                  </span>
                </label>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {variants.map((v) => {
                    const isAvailable = (v.stockCount || 0) > 0;
                    const isSelected =
                      selectedVariant?._id === v._id || selectedUnit === v.unit;

                    return (
                      <button
                        key={v._id || v.unit}
                        onClick={() => setSelectedUnit(v.unit)}
                        disabled={!isAvailable}
                        className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded font-medium transition-colors text-sm ${
                          isSelected
                            ? "bg-bgvariant-2 text-white"
                            : isAvailable
                              ? "bg-gray-100 hover:bg-gray-200 text-gray-800"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        {v.unit}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                disabled={modalStock === 0}
                onClick={handleAddToCart}
                className={`flex-1 py-3 sm:py-3.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-white text-sm sm:text-base ${
                  isSelectedVariantInCart
                    ? "bg-emerald-800"
                    : "bg-bgvariant-2 hover:bg-emerald-800 disabled:bg-gray-300"
                }`}
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                {isSelectedVariantInCart ? "Go to Cart" : "Add to Cart"}
              </button>
              <button
                disabled={modalStock === 0}
                onClick={handleBuyNow}
                className="flex-1 bg-white border-2 border-gray-300 text-gray-800 py-3 sm:py-3.5 rounded-lg font-medium disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 text-sm sm:text-base hover:bg-gray-50 transition-colors"
              >
                Buy Now
              </button>
            </div>

            {/* DESCRIPTION & FULL DETAILS LINK */}
            {product.productDescription && (
              <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs sm:text-sm text-gray-600 line-clamp-3">
                  {product.productDescription}
                </p>
              </div>
            )}
            
            <Link href={`/productdetails/?id=${product._id}`}>
              <div className="flex items-center gap-1 cursor-pointer mt-3 sm:mt-4 text-bgvariant-2 hover:text-emerald-800">
                <span className="font-medium text-sm sm:text-base">View Full Details</span>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {renderProductCard()}
      
      {mounted &&
        showLoginModal &&
        createPortal(
          <AuthPage onClose={() => setShowLoginModal(false)} />,
          document.body,
        )}
      {mounted && showModal && createPortal(modalContent, document.body)}
    </>
  );
}
