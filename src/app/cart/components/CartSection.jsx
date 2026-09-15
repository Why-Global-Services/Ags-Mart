"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiTrash2,
  FiHeart,
  FiPlus,
  FiMinus,
} from "react-icons/fi";
import {
  IoArrowBack,
  IoShieldCheckmark,
} from "react-icons/io5";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import Loading from "@/app/common/Loading";
import { FaSpinner } from "react-icons/fa6";
import AuthPage from "../../common/LoginPage";

import { useDispatch, useSelector } from "react-redux";
import {
  fetchCart,
  removeCartItem,
  addCartItem,
} from "@/app/store/cartSlice";

const FALLBACK_IMAGE = "https://via.placeholder.com/400";

const CartPage = () => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const dispatch = useDispatch();

  const { cartItems, loading } = useSelector(
    (state) => state.cart
  );

  /**
   * Get the first valid image from cart response.
   *
   * Priority:
   * 1. Selected variant image
   * 2. productImages
   * 3. wishlistImages
   * 4. nonVariantImages
   * 5. selectedVariant images
   * 6. fallback
   */
  const getFirstImage = (product) => {
    const selectedVariant =
      product?.selectedVariant || null;

    const variantImages = Array.isArray(
      selectedVariant?.variantImages
    )
      ? selectedVariant.variantImages
      : [];

    const productImages = Array.isArray(
      product?.productImages
    )
      ? product.productImages
      : [];

    const wishlistImages = Array.isArray(
      product?.wishlistImages
    )
      ? product.wishlistImages
      : [];

    const nonVariantImages = Array.isArray(
      product?.nonVariantImages
    )
      ? product.nonVariantImages
      : [];

    const variantNonVariantImages = Array.isArray(
      selectedVariant?.nonVariantImages
    )
      ? selectedVariant.nonVariantImages
      : [];

    const imageSources = [
      ...variantImages,
      ...productImages,
      ...wishlistImages,
      ...nonVariantImages,
      ...variantNonVariantImages,
    ];

    const validImage = imageSources.find(
      (image) =>
        typeof image === "string" &&
        image.trim().length > 0
    );

    return validImage || FALLBACK_IMAGE;
  };

  /**
   * Transform backend cart response
   * into UI-friendly cart data.
   */
  const cartItemsData = Array.isArray(cartItems)
    ? cartItems.map((product, index) => {
        console.log("RAW CART ITEM:", product);

        const priceBreakdown =
          product?.priceBreakdown || {};

        const productName =
          product?.productName ||
          product?.selectedVariant?.productTitle ||
          "Unnamed Product";

        const productId = product?.productId;

        const variantId =
          product?.variantId ||
          product?.selectedVariant?._id ||
          null;

        const productType =
          product?.productType ||
          "product";

        const variantType =
          product?.variantType ||
          product?.selectedVariant?.variantType ||
          (product?.selectedVariant?.unit
            ? "unitOnly"
            : null);

        const quantity = Math.max(
          1,
          Number(product?.quantity) || 1
        );

        const status =
          product?.status || "active";

        const salePrice = Number(
          priceBreakdown?.salePrice ??
            product?.selectedVariant?.price?.salePrice ??
            product?.basePrice ??
            product?.price?.salePrice ??
            0
        );

        const costPrice = Number(
          priceBreakdown?.costPrice ??
            product?.selectedVariant?.price?.costPrice ??
            salePrice
        );

        const discountPercentage = Number(
          priceBreakdown?.discountPercentage ??
            product?.selectedVariant?.price?.discount ??
            product?.discount ??
            0
        );

        const discountAmount = Number(
          priceBreakdown?.discountAmount ?? 0
        );

        /**
         * Unit-only variant support.
         */
        const selectedUnit =
          product?.selectedUnit ||
          product?.selectedVariant?.unit ||
          null;

        /**
         * Legacy fields kept only for backward compatibility.
         */
        const selectedSize =
          product?.selectedSize || null;

        const selectedColor =
          product?.selectedColor || null;

        const image = getFirstImage(product);

        return {
          id:
            `${productId || "product"}-${
              variantId || "default"
            }-${index}`,

          productId,

          variantId,

          productType,

          variantType,

          name: productName,

          price: salePrice,

          oldPrice: costPrice,

          discountPercentage,

          discountAmount,

          img: image,

          /**
           * Keep image arrays available for debugging
           * and future UI usage.
           */
          productImages:
            product?.productImages || [],

          selectedVariant:
            product?.selectedVariant || null,

          quantity,

          status:
            status === "active"
              ? "In Stock"
              : "Out of Stock",

          selectedUnit,

          selectedSize,

          selectedColor,

          rawData: product,
        };
      })
    : [];

  /**
   * Fetch cart.
   */
  useEffect(() => {
    const loadCart = async () => {
      setIsLoading(true);

      try {
        await dispatch(fetchCart()).unwrap();
      } catch (error) {
        console.error(
          "Error fetching cart:",
          error
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, [dispatch]);

  /**
   * Update quantity.
   */
  const updateQuantity = async (
    id,
    newQuantity
  ) => {
    if (newQuantity < 1) {
      showDeleteConfirmation(id);
      return;
    }

    const item = cartItemsData.find(
      (i) => i.id === id
    );

    if (!item) return;

    try {
      await dispatch(
        addCartItem({
          productId: item.productId,
          variantId: item.variantId,
          productType: item.productType,
          variantType: item.variantType,
          quantity: newQuantity,
        })
      ).unwrap();

      await dispatch(fetchCart()).unwrap();
    } catch (error) {
      console.error(
        "Error updating quantity:",
        error
      );
    }
  };

  /**
   * Show delete confirmation.
   */
  const showDeleteConfirmation = (itemId) => {
    const itemToDelete =
      cartItemsData.find(
        (i) => i.id === itemId
      );

    setDeleteConfirm({
      id: itemId,
      name:
        itemToDelete?.name ||
        "this item",
      item: itemToDelete,
    });
  };

  const hideDeleteConfirmation = () => {
    if (isDeleting) return;

    setDeleteConfirm(null);
    setIsDeleting(false);
  };

  /**
   * Remove cart item.
   */
  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    setIsDeleting(true);

    const item = cartItemsData.find(
      (i) => i.id === deleteConfirm.id
    );

    try {
      if (item) {
        await dispatch(
          removeCartItem({
            productId: item.productId,
            variantId: item.variantId,
            productType: item.productType,
            variantType: item.variantType,
          })
        ).unwrap();

        await dispatch(fetchCart()).unwrap();
      }
    } catch (error) {
      console.error(
        "Error removing item:",
        error
      );

      alert(
        "Error removing item from cart."
      );
    } finally {
      setDeleteConfirm(null);
      setIsDeleting(false);
    }
  };

  /**
   * Cart calculations.
   */
  const subtotal = cartItemsData.reduce(
    (sum, item) =>
      sum +
      Number(item.price || 0) *
        Number(item.quantity || 0),
    0
  );

  const totalDiscount =
    cartItemsData.reduce(
      (sum, item) =>
        sum +
        Number(item.discountAmount || 0) *
          Number(item.quantity || 0),
      0
    );

  const shipping =
    subtotal > 499 ? 0 : 50;

  const total = subtotal + shipping;

  const cartSummary = {
    totalItems: cartItemsData.reduce(
      (sum, item) =>
        sum + Number(item.quantity || 0),
      0
    ),
    subtotal,
    totalDiscount,
    shipping,
    grandTotal: total,
  };

  if (isLoading || loading) {
    return <Loading />;
  }

  return (
    <>
      {/* Authentication Modal */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <AuthPage
            onClose={() =>
              setIsAuthModalOpen(false)
            }
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLoginModal && (
          <AuthPage
            onClose={() =>
              setShowLoginModal(false)
            }
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => {
              if (!isDeleting) {
                hideDeleteConfirmation();
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) =>
                e.stopPropagation()
              }
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
            >
              <div className="text-center">

                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiTrash2 className="w-8 h-8 text-red-600" />
                </div>

                <h3 className="text-xl font-bold mb-2">
                  Remove Item
                </h3>

                <p className="text-gray-600 mb-6">
                  Remove{" "}
                  <strong>
                    "{deleteConfirm.name}"
                  </strong>{" "}
                  from cart?
                </p>

                <div className="flex gap-3 justify-center">

                  <button
                    onClick={
                      hideDeleteConfirmation
                    }
                    disabled={isDeleting}
                    className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 font-medium"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="px-6 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 font-medium flex items-center gap-2"
                  >
                    {isDeleting ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Removing...
                      </>
                    ) : (
                      <>
                        <FiTrash2 />
                        Remove
                      </>
                    )}
                  </button>

                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-[#fcfdfc] pb-16">
        {/* Breadcrumb */}
        <nav className="bg-gray-100/70 border-b border-gray-200/80 py-2.5 px-4 sm:px-6 lg:px-8 text-xs text-gray-500 font-medium mb-6">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <Link href="/" className="hover:text-emerald-700 flex items-center gap-1.5 transition">
              <span className="text-sm">🏠</span>
              <span>Home</span>
            </Link>
            <span className="text-gray-400">›</span>
            <span className="text-gray-800 font-semibold">Shopping Cart</span>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 pb-3 border-b border-gray-100">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f4e27] tracking-tight">
                Shopping Cart
              </h1>
              <div className="w-16 h-1 bg-emerald-600 rounded-full mt-2" />
            </div>

            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-3.5 py-1 rounded-full text-xs font-bold">
              {cartSummary.totalItems} {cartSummary.totalItems === 1 ? "item" : "items"}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              {cartItemsData.length > 0 ? (
                cartItemsData.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-xs p-4 sm:p-5 hover:shadow-sm transition-all"
                  >
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-center sm:items-start">
                      {/* Product Image */}
                      <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl bg-[#fafbfa] p-2 border border-gray-100 shrink-0 flex items-center justify-center">
                        <img
                          src={item.img || FALLBACK_IMAGE}
                          alt={item.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            if (e.currentTarget.src !== FALLBACK_IMAGE) {
                              e.currentTarget.src = FALLBACK_IMAGE;
                            }
                          }}
                        />

                        {item.discountPercentage > 0 && (
                          <div className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-xs">
                            {Math.abs(Math.round(item.discountPercentage))}% OFF
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0 w-full space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <Link href={`/productdetails/?id=${item.productId}`}>
                            <h3 className="text-base font-semibold text-gray-900 hover:text-emerald-700 transition line-clamp-2">
                              {item.name}
                            </h3>
                          </Link>

                          <button
                            onClick={() => showDeleteConfirmation(item.id)}
                            className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition shrink-0"
                            aria-label="Remove item"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>

                        {/* Selected Unit */}
                        {(item.selectedUnit || item.selectedSize || item.selectedColor) && (
                          <div className="flex flex-wrap gap-2">
                            {item.selectedUnit && (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-100/60">
                                Unit: {item.selectedUnit}
                              </span>
                            )}
                            {item.selectedSize && (
                              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                {item.selectedSize}
                              </span>
                            )}
                            {item.selectedColor && (
                              <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                {item.selectedColor}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Stock status */}
                        <div className="flex items-center gap-1.5 text-xs font-medium">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              item.status === "In Stock" ? "bg-emerald-500" : "bg-red-500"
                            }`}
                          />
                          <span
                            className={
                              item.status === "In Stock" ? "text-emerald-700" : "text-red-600"
                            }
                          >
                            {item.status}
                          </span>
                        </div>

                        {/* Quantity and Price */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          {/* Quantity selector */}
                          <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50/50">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-l-lg transition"
                              disabled={item.quantity <= 1}
                            >
                              <FiMinus size={11} />
                            </button>
                            <span className="px-3 text-xs font-bold text-gray-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-r-lg transition"
                            >
                              <FiPlus size={11} />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-base font-extrabold text-[#0f4e27]">
                              ₹{(Number(item.price || 0) * Number(item.quantity || 0)).toLocaleString()}
                            </p>
                            {item.discountAmount > 0 && (
                              <p className="text-[11px] text-emerald-600 font-semibold">
                                Saved ₹{(Number(item.discountAmount) * Number(item.quantity || 0)).toFixed(0)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-xs">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-700 text-3xl mx-auto mb-4 border border-emerald-100">
                    🛒
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                    Add top quality seeds, fertilizers, and farm equipment to your cart and checkout easily.
                  </p>
                  <Link href="/shoppage">
                    <button className="bg-[#135d38] hover:bg-[#0f4e27] text-white px-7 py-3 rounded-xl font-semibold text-sm shadow-xs transition">
                      Continue Shopping
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {/* Order Summary (Right Column) */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 sticky top-28 space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Order Summary
                  </h2>
                  <div className="w-12 h-1 bg-emerald-600 rounded-full mt-1.5" />
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cartSummary.totalItems} items)</span>
                    <span className="font-semibold text-gray-900">₹{subtotal.toLocaleString()}</span>
                  </div>

                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Discount</span>
                      <span>-₹{totalDiscount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span className="font-semibold text-gray-900">
                      {shipping === 0 ? (
                        <span className="text-emerald-700 font-bold">FREE</span>
                      ) : (
                        `₹${shipping}`
                      )}
                    </span>
                  </div>

                  <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
                    <span className="text-base font-bold text-gray-900">Final Total</span>
                    <span className="text-2xl font-extrabold text-[#0f4e27]">
                      ₹{total.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">Inclusive of all applicable taxes</p>
                </div>

                <div className="p-3 bg-emerald-50/70 border border-emerald-100/60 rounded-xl flex items-center gap-2.5">
                  <IoShieldCheckmark className="w-5 h-5 text-emerald-700 shrink-0" />
                  <span className="text-xs font-semibold text-emerald-950">
                    100% Safe & Secure Checkout
                  </span>
                </div>

                <button
                  onClick={() => {
                    const user = localStorage.getItem("user");
                    if (!user) {
                      setShowLoginModal(true);
                      return;
                    }
                    router.push("/checkoutpage");
                  }}
                  disabled={cartItemsData.length === 0}
                  className="w-full bg-[#f97316] hover:bg-[#ea580c] active:bg-[#c2410c] text-white py-3.5 rounded-xl text-base font-bold transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartPage;