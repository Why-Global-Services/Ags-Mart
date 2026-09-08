"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FiTrash2, FiHeart, FiPlus, FiMinus, FiShare2 } from "react-icons/fi";
import { IoArrowBack, IoShieldCheckmark } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// import useCartStore from "../../store/cartStore";
// import { editCartData } from "@/app/interceptor/interseptor";
import Loading from "@/app/common/Loading";
import { FaSpinner } from "react-icons/fa6";
import AuthPage from "../../common/LoginPage";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart, removeCartItem, addCartItem } from "@/app/store/cartSlice";

const CartPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // const { cartItems, fetchCart, removeFromCart } = useCartStore();

  const dispatch = useDispatch();

  const { cartItems, loading } = useSelector((state) => state.cart);

  // Check login status
  // useEffect(() => {
  //   const user = localStorage.getItem("user");
  //   if (!user) {
  //     setIsAuthModalOpen(true);
  //   }
  // }, []);

  // Transform cart items with selected size/color
  const cartItemsData = cartItems.map((product, index) => {
    const priceBreakdown = product?.priceBreakdown || {};
    const productName = product?.productName || "Unnamed Product";
    const productImages = product?.productImages || [];
    const productId = product?.productId;
    const variantId = product?.variantId;
    const productType = product?.productType || "product";
    const quantity = product?.quantity || 1;
    const status = product?.status || "active";

    const salePrice = priceBreakdown?.salePrice || 0;
    const costPrice = priceBreakdown?.costPrice || salePrice;
    const discountPercentage = priceBreakdown?.discountPercentage || 0;
    const discountAmount = priceBreakdown?.discountAmount || 0;

    // Extract selected variant details
    const selectedUnit = product?.selectedUnit || product?.selectedVariant?.unit || null;
    const selectedSize = product?.selectedSize || null;
    const selectedColor = product?.selectedColor || null;

    return {
      id: `${productId}-${variantId}-${index}`,
      productId,
      variantId,
      productType,
      name: productName,
      price: salePrice,
      oldPrice: costPrice,
      discountPercentage,
      discountAmount,
      img: productImages[0] || "https://via.placeholder.com/150",
      quantity,
      status: status === "active" ? "In Stock" : "Out of Stock",
      selectedUnit,
      selectedSize,
      selectedColor,
      rawData: product,
    };
  });

  useEffect(() => {
    const loadCart = async () => {
      setIsLoading(true);
      try {
        dispatch(fetchCart());
      } catch (e) {
        console.error("Error fetching cart:", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadCart();
  }, [dispatch]);

  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) {
      showDeleteConfirmation(id);
      return;
    }

    const item = cartItemsData.find((i) => i.id === id);
    if (!item) return;

    try {
      dispatch(
        addCartItem({
          productId: item.productId,
          variantId: item.variantId,
          quantity: newQuantity,
        }),
      );
      dispatch(fetchCart());
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const showDeleteConfirmation = (itemId) => {
    const itemToDelete = cartItemsData.find((i) => i.id === itemId);
    setDeleteConfirm({
      id: itemId,
      name: itemToDelete?.name || "this item",
      item: itemToDelete,
    });
  };

  const hideDeleteConfirmation = () => {
    setDeleteConfirm(null);
    setIsDeleting(false);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    setIsDeleting(true);
    const item = cartItemsData.find((i) => i.id === deleteConfirm.id);

    try {
      if (item) {
        dispatch(
          removeCartItem({
            productId: item.productId,
            variantId: item.variantId,
            productType: item.productType,
          }),
        );
      }
    } catch (error) {
      console.error("Error removing item:", error);
      alert("Error removing item from cart.");
    } finally {
      hideDeleteConfirmation();
    }
  };

  const subtotal = cartItemsData.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0,
  );
  const totalDiscount = cartItemsData.reduce(
    (sum, i) => sum + i.discountAmount * i.quantity,
    0,
  );
  const shipping = subtotal > 499 ? 0 : 50;
  const total = subtotal + shipping;

  const cartSummary = {
    totalItems: cartItemsData.reduce((s, i) => s + i.quantity, 0),
    subtotal,
    totalDiscount,
    shipping,
    grandTotal: total,
  };

  if (isLoading) return <Loading />;

  return (
    <>
      <AnimatePresence>
        {isAuthModalOpen && (
          <AuthPage onClose={() => setIsAuthModalOpen(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLoginModal && (
          <AuthPage onClose={() => setShowLoginModal(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiTrash2 className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Remove Item</h3>
                <p className="text-gray-600 mb-6">
                  Remove <strong>"{deleteConfirm.name}"</strong> from cart?
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={hideDeleteConfirmation}
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
                        <FaSpinner className="animate-spin" /> Removing...
                      </>
                    ) : (
                      <>
                        <FiTrash2 /> Remove
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-black hover:text-bgvariant-3"
            >
              <IoArrowBack className="w-5 h-5" /> Continue Shopping
            </button>
            <h1 className="text-4xl font-bold text-gray-900">Shopping Cart</h1>
            <span className="bg-bgvariant-2 text-bgvariant-3 px-4 py-2 rounded-full text-sm font-bold">
              {cartSummary.totalItems} items
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {cartItemsData.length > 0 ? (
                cartItemsData.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col sm:flex-row gap-6">
                      {/* Image */}
                      <div className="relative">
                        <div className="w-40 h-40 rounded-xl overflow-hidden">
                          <img
                            src={item.img}
                            alt={item.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) =>
                              (e.target.src = "https://via.placeholder.com/150")
                            }
                          />
                          {item.discountPercentage > 0 && (
                            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              {Math.abs(Math.round(item.discountPercentage))}%
                              OFF
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {item.name}
                        </h3>

                        {/* Selected Unit, Size & Color */}
                        {(item.selectedUnit || item.selectedSize || item.selectedColor) && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {item.selectedUnit && (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-1.5 rounded-full">
                                Unit: {item.selectedUnit}
                              </span>
                            )}
                            {item.selectedSize && (
                              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full">
                                {item.selectedSize}
                              </span>
                            )}
                            {item.selectedColor && (
                              <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-xs font-medium px-3 py-1.5 rounded-full">
                                {item.selectedColor}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-2 mb-3">
                          <div
                            className={`w-3 h-3 rounded-full ${item.status === "In Stock" ? "bg-bgvariant-1" : "bg-red-500"}`}
                          />
                          <span
                            className={`text-sm font-medium ${item.status === "In Stock" ? "text-bgvariant-1" : "text-red-600"}`}
                          >
                            {item.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-2xl font-bold">
                          <span>₹{item.price.toLocaleString()}</span>
                          {item.oldPrice > item.price && (
                            <span className="text-lg text-gray-500 line-through">
                              ₹{item.oldPrice.toLocaleString()}
                            </span>
                          )}
                          <p className="text-gray-500 text-xs">Inc. Tax</p>
                        </div>

                        {/* Quantity & Actions */}
                        <div className="flex items-center justify-between mt-6">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center bg-gray-100 rounded-lg">
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                className="p-3 hover:bg-gray-200 rounded-l-lg transition"
                                disabled={item.quantity <= 1}
                              >
                                <FiMinus />
                              </button>
                              <span className="px-6 font-bold text-lg">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                className="p-3 hover:bg-gray-200 rounded-r-lg transition"
                              >
                                <FiPlus />
                              </button>
                            </div>

                            <div className="text-right">
                              <p className="font-bold text-lg">
                                ₹{(item.price * item.quantity).toLocaleString()}
                              </p>
                              {item.discountAmount > 0 && (
                                <p className="text-sm text-green-600">
                                  Saved ₹
                                  {(
                                    item.discountAmount * item.quantity
                                  ).toFixed(1)}
                                </p>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => showDeleteConfirmation(item.id)}
                            className="text-red-500 hover:text-red-700 font-medium flex items-center gap-2"
                          >
                            <FiTrash2 /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="bg-white rounded-2xl p-16 text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiHeart className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">
                    Your cart is empty
                  </h3>
                  <Link href="/shoppage">
                    <button className="bg-bgvariant-1 text-white px-8 py-4 rounded-xl hover:bg-bgvariant-2 font-medium">
                      Continue Shopping
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border p-6 sticky top-6">
                <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

                <div className="space-y-4 text-lg">
                  <div className="flex justify-between">
                    <span>Subtotal ({cartSummary.totalItems} items)</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{totalDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                  </div>
                  <div className="border-t pt-4 font-bold text-xl flex justify-between">
                    <span>Total</span>
                    <span className="text-bgvariant-1">
                      ₹{total.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="my-6 p-4 bg-bgvariant-2/30 rounded-lg flex items-center gap-3">
                  <IoShieldCheckmark className="w-6 h-6 text-bgvariant-1" />
                  <span className="text-bgvariant-3 font-medium">
                    Secure Checkout
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
                  className="w-full bg-bgvariant-3 text-white py-5 rounded-xl text-xl font-bold hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Proceed to Checkout
                </button>

                {/* <button className="w-full mt-4 border border-gray-300 py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition">
                  <FiShare2 /> Share Cart
                </button> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartPage;
