"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Eye, X, Heart, ChevronRight, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AuthPage from "../common/LoginPage";
import {
  fetchCart,
  removeCartItem,
  updateCartItem,
  addCartItem,
} from "@/app/store/cartSlice";
import {
  fetchWishlist,
  addWishlistItem,
  removeWishlistItem,
} from "@/app/store/wishlistSlice";
import { useDispatch, useSelector } from "react-redux";
import { IoOptions } from "react-icons/io5";

export default function ProductCard({ product }) {
  const [showModal, setShowModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [mounted, setMounted] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const timeoutRef = useRef(null);

  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const dispatch = useDispatch();

  const { cartItems, loading } = useSelector((state) => state.cart);
  const { wishlistItems } = useSelector((state) => state.wishlist);

  useEffect(() => setMounted(true), []);

  if (!product) {
    return (
      <div className="group relative w-72 cursor-pointer">
        <div className="relative overflow-hidden rounded-lg h-72 bg-gray-200 animate-pulse"></div>
      </div>
    );
  }

  const isVariantProduct = product.productType === "variant";
  const isNonVariantProduct = product.productType === "nonVariant";
  const variantType = product.variant?.variantType;
  const isUnitOnly = variantType === "unitOnly";

  let displayImage,
  secondaryImage,
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
      secondaryImage =
         firstVariant?.variantImages?.[1] || product.productImages?.[0];
      displayPrice = firstVariant?.price?.salePrice || 0;
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
      secondaryImage = product.nonVariant?.nonVariantImages?.[1] || product.productImages?.[0];
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

  useEffect(() => {
    if (displayImage) {
      setCurrentImage(displayImage);
    }
  }, [displayImage]);

  const isWishlisted = wishlistItems.some(
    (item) =>
      item.productId === productId &&
      item.variantId === variantId &&
      item.productType === productType,
  );

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

  const handleMouseEnter = () => {
    if (!secondaryImage || secondaryImage === displayImage) return;
    setCurrentImage(secondaryImage);
    timeoutRef.current = setTimeout(() => {}, 2000);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setCurrentImage(displayImage);
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

    action();
  };

  const modalContent = isVariantProduct && (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-4 right-4 bg-red-400 hover:bg-red-500 text-white p-2 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-8 flex items-center justify-center relative">
            <img
              src={modalImage}
              alt={displayName}
              className="w-full h-auto max-h-96 object-contain"
            />
            {selectedVariant && (
              <button
                onClick={handleVariantWishlistToggle}
                className="absolute top-20 md:top-4 right-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
              >
                <Heart
                  className={`w-5 h-5 ${
                    isSelectedVariantWishlisted
                      ? "fill-red-500 text-red-500"
                      : "text-gray-700"
                  }`}
                />
              </button>
            )}
          </div>

          <div className="p-8">
            <h2 className="text-2xl md:text-3xl font-serif text-gray-800 mb-2 pr-12">
              {product.productName}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {product.inventory?.productCode}
            </p>

            <div className="mb-6">
              <div className="flex items-center gap-3">
                <p className="text-2xl font-bold text-gray-800">
                  Rs. {modalPrice?.toFixed(2)}
                </p>
                {modalDiscount > 0 && (
                  <>
                    <p className="text-lg text-gray-500 line-through">
                      Rs. {modalCostPrice?.toFixed(2)}
                    </p>
                    <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                      {modalDiscount}% OFF
                    </span>
                  </>
                )}
              </div>
              <p className="text-gray-500 text-xs mt-3 font-bold">Inc. Tax</p>
            </div>

            {modalStock > 0 ? (
              <p className="text-sm text-green-600 font-medium mb-4">
                In Stock ({modalStock} left)
              </p>
            ) : (
              <p className="text-sm text-red-600 font-medium mb-4">
                Out of Stock
              </p>
            )}

            {isUnitOnly && variants.length > 0 && (
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-3">
                  Pack Size / Unit:{" "}
                  <span className="font-normal text-gray-600">
                    {selectedVariant?.unit || "Select a unit"}
                  </span>
                </label>
                <div className="flex gap-3 flex-wrap">
                  {variants.map((v) => {
                    const isAvailable = (v.stockCount || 0) > 0;
                    const isSelected =
                      selectedVariant?._id === v._id || selectedUnit === v.unit;

                    return (
                      <button
                        key={v._id || v.unit}
                        onClick={() => setSelectedUnit(v.unit)}
                        disabled={!isAvailable}
                        className={`px-6 py-2.5 rounded font-medium transition-colors ${
                          isSelected
                            ? "bg-green-600 text-white"
                            : isAvailable
                              ? "bg-gray-200 hover:bg-gray-300"
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

            <div className="flex gap-3">
              <button
                disabled={modalStock === 0}
                onClick={handleAddToCart}
                className={`w-full py-3.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-white ${
                  isSelectedVariantInCart
                    ? "bg-bgvariant-3"
                    : "bg-bgvariant-3  disabled:bg-gray-300"
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                {isSelectedVariantInCart ? "Go to Cart" : "Add to Cart"}
              </button>
              <button
                disabled={modalStock === 0}
                onClick={handleBuyNow}
                className="w-full bg-white border-2 text-gray-800 py-3.5 rounded-lg font-medium disabled:bg-gray-100"
              >
                Buy It Now
              </button>
            </div>

            {product.productDescription && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  {product.productDescription}
                </p>
              </div>
            )}
            <Link href={`/productdetails/?id=${product._id}`}>
              <div className="flex items-baseline cursor-pointer mt-4">
                <span className="font-bold text-sm">View Full Details</span>{" "}
                <ChevronRight className="w-3 h-3" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col">
      {/* IMAGE SECTION */}
      <div
        className="relative overflow-hidden bg-[#fafbfa] p-3"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Link href={`/productdetails/?id=${productId}`}>
          <img
            src={currentImage || displayImage}
            alt={displayName}
            className="w-full aspect-square object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Discount Badge */}
        {displayDiscount > 0 && (
          <div className="absolute top-2.5 left-2.5 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
            {displayDiscount}% OFF
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleMainWishlistToggle}
          className="absolute top-2.5 right-2.5 bg-white/90 hover:bg-white rounded-full p-2 shadow-xs hover:shadow-sm transition-all duration-200 z-10 border border-gray-100"
          aria-label="Wishlist toggle"
        >
          <Heart
            className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}`}
          />
        </button>
      </div>

      {/* PRODUCT INFO */}
      <div className="p-3.5 flex flex-col flex-1">
        {/* Category tag if available */}
        {(product.categoryTitle || product.productCategory) && (
          <div>
            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-100/60 px-2 py-0.5 rounded-full inline-block mb-1.5 truncate max-w-full">
              {product.categoryTitle || product.productCategory}
            </span>
          </div>
        )}

        {/* Product Name */}
        <Link href={`/productdetails/?id=${productId}`}>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 leading-snug hover:text-emerald-700 transition-colors">
            {displayName}
          </h3>
        </Link>

        {/* Pack size info for variant products */}
        {isVariantProduct && variants?.length > 0 && (
          <p className="text-xs text-gray-500 mb-2">{variants[0]?.unit}</p>
        )}

        {/* Rating */}
        {product.averageRating > 0 && (
          <div className="flex items-center gap-1 mb-2.5">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <svg
                  key={s}
                  className={`w-3 h-3 ${s <= Math.round(product.averageRating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-[11px] text-gray-500 font-medium">
              ({product.totalReviews || 0})
            </span>
          </div>
        )}

        {/* Price Section */}
        <div className="mt-auto pt-1">
          <div className="flex items-baseline gap-2 flex-wrap mb-2.5">
            <span className="text-base font-extrabold text-[#0f4e27]">₹{displayPrice?.toFixed(0)}</span>
            {displayDiscount > 0 && (
              <span className="text-xs text-gray-400 line-through">₹{displayCostPrice?.toFixed(0)}</span>
            )}
            {displayDiscount > 0 && (
              <span className="text-[10px] text-red-500 font-bold bg-red-50 px-1.5 py-0.5 rounded">Save {displayDiscount}%</span>
            )}
          </div>

          {/* Add to Cart Button */}
          {isVariantProduct ? (
            <button
              onClick={() => {
                setShowModal(true);
                if (variants[0]?.unit) setSelectedUnit(variants[0].unit);
              }}
              className="w-full py-2 text-xs font-semibold rounded-xl border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 transition-all duration-200"
            >
              View Options
            </button>
          ) : isInCart ? (
            <button
              onClick={() => router.push('/cart')}
              className="w-full py-2 text-xs font-semibold rounded-xl bg-[#0f4e27] text-white hover:bg-[#0c3f20] transition-all duration-200"
            >
              Go to Cart
            </button>
          ) : (
            <button
              onClick={handleNonVariantAddToCart}
              className="w-full py-2 text-xs font-semibold rounded-xl bg-[#135d38] text-white hover:bg-[#0f4e27] transition-all duration-200 flex items-center justify-center gap-1.5 shadow-xs"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Add to Cart
            </button>
          )}
        </div>
      </div>

      {/* Modals */}
      {mounted && showLoginModal && createPortal(
        <AuthPage onClose={() => setShowLoginModal(false)} />,
        document.body
      )}
      {mounted && showModal && createPortal(modalContent, document.body)}
    </div>
  );
}
