"use client";
import React, { useState, useEffect } from "react";
import { FiTrash2, FiEye, FiShoppingCart } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
// import Link from "next/link";
import { FaSpinner } from "react-icons/fa6";
import Loading from "@/app/common/Loading";
import {
  fetchCart,
  removeCartItem,
  updateCartItem,
  addCartItem
} from "@/app/store/cartSlice";
import {
  fetchWishlist,
  addWishlistItem,
  removeWishlistItem,
} from "@/app/store/wishlistSlice";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";

const Wishlist = () => {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  const dispatch = useDispatch();
  const { wishlistItems, loading } = useSelector((state) => state.wishlist);

  // useEffect(() => {
  //   const user = localStorage.getItem('user');
  //   if (!user) {
  //     router.push('/authpage');
  //   }
  // }, [router]);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const wishlistData = wishlistItems.map((item) => {
    console.log("RAW WISHLIST ITEM:", item);

    const selectedVariant = item?.selectedVariant;

    const getFirstImage = () => {
      if (selectedVariant?.variantImages?.length > 0) {
        return selectedVariant.variantImages[0];
      }
      if (selectedVariant?.nonVariantImages?.length > 0) {
        return selectedVariant.nonVariantImages[0];
      }
      if (item?.nonVariantImages?.length > 0) {
        return item.nonVariantImages[0];
      }
      return "https://via.placeholder.com/150";
    };

    const priceData = selectedVariant?.price || {};
    const stockCount = selectedVariant?.stockCount || 0;
    const variantId = selectedVariant?._id;

    return {
      id: item._id || `${item.productId}-${variantId}`,
      productId: item.productId,
      variantId: variantId,
      productType: item.productType,
      name: selectedVariant?.productTitle || item?.productName || "Product Name",
      costPrice: priceData.costPrice || 0,
      price: priceData.salePrice || 0,
      discount: priceData.discount || 0,
      img: getFirstImage(),
      status: stockCount >= 5 ? "In Stock" : stockCount >= 1 ? "Low Stock" : "Out of Stock",
      button: stockCount >= 1 ? "ADD TO CART" : "OUT OF STOCK",
      stockCount: stockCount,
      isInCart: item.isInCart || false,
    };
  });

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;

    try {
      setIsDeleting(true);
      dispatch(removeWishlistItem({
        productId: selectedItem.productId,
        variantId: selectedItem.variantId,
        productType: selectedItem.productType,
        variantType: selectedItem?.variantType
      }));
    } catch (error) {
      console.log("Error removing item from wishlist", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setSelectedItem(null);
    }
  };

  const handleAddToCart = async (item) => {
    try {
      dispatch(addCartItem({
        productId: item.productId,
        variantId: item.variantId,
        productType: item.productType,
        variantType: item?.variantType
      }));
      router.push("/cart");
    } catch (error) {
      console.error("Add to Cart Error:", error);
    }
  };

  const handleQuickView = (item) => {
    // Implement quick view functionality
    router.push(`/product/${item.productId}`);
  };

  if (loading) {
    return (
      <div>
        <Loading />
      </div>
    );
  }

  return (
    <div className="py-10 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            My Wishlist
          </h1>
          <p className="text-gray-600 mt-2">
            {wishlistData.length} {wishlistData.length === 1 ? 'item' : 'items'}
          </p>
        </div>

        {wishlistData.length === 0 ? (
          <div className=" flex flex-col items-center justify-center text-center py-5 min-h-[40vh]">
            {/* Heart with X Icon */}
            <div className="relative mb-8">
              <svg
                width="120"
                height="120"
                viewBox="0 0 120 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-gray-300"
              >
                {/* Heart Shape */}
                <path
                  d="M60 100C60 100 15 75 15 45C15 32 23 25 32 25C41 25 50 32 60 42C70 32 79 25 88 25C97 25 105 32 105 45C105 75 60 100 60 100Z"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                
                {/* Circle with X */}
                <circle
                  cx="85"
                  cy="85"
                  r="20"
                  fill="white"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  d="M78 78L92 92M92 78L78 92"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              Wishlist is empty.
            </h2>
            <p className="text-gray-600 mb-2 max-w-md">
              You don't have any products in the wishlist yet.
            </p>
            <p className="text-gray-600 mb-8 max-w-md">
              You will find a lot of interesting products on our "Shop" page.
            </p>
            <Link href="/shoppage">
              <button className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300">
                Continue Shopping
              </button>
            </Link>
          </div>
        ) : (
          <div 
            className={`grid gap-6 ${
              wishlistData.length === 1 
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center" 
                : wishlistData.length === 2
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            }`}
          >
            {wishlistData.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group relative w-full max-w-[320px] mx-auto"
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {/* Delete Button - Top Left */}
                <button
                  onClick={() => handleDeleteClick(item)}
                  className="absolute top-3 left-3 z-10 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-red-50 transition-all duration-200"
                  aria-label="Remove from wishlist"
                >
                  <FiTrash2 className="text-gray-600 hover:text-red-500 text-lg" />
                </button>

                {/* Product Image */}
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/400";
                    }}
                  />
                  
                  {/* Out of Stock Overlay */}
                  {item.status === "Out of Stock" && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-white px-4 py-2 rounded-lg text-red-600 font-semibold text-sm">
                        OUT OF STOCK
                      </span>
                    </div>
                  )}

                  {/* Discount Badge */}
                  {item.discount > 0 && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                      {item.discount}% OFF
                    </div>
                  )}

                  {/* Hover Actions */}
                  <div 
                    className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 transform transition-all duration-300 ${
                      hoveredItem === item.id ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                    }`}
                  >
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleQuickView(item)}
                        className="flex-1 bg-white text-gray-800 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <FiEye className="text-base" />
                        Quick view
                      </button>
                      <button
                        onClick={() => handleAddToCart(item)}
                        disabled={item.status === "Out of Stock"}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                          item.status === "Out of Stock"
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-purple-600 text-white hover:bg-purple-700"
                        }`}
                      >
                        <FiShoppingCart className="text-base" />
                        Add to cart
                      </button>
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="text-gray-800 font-medium text-base mb-2 line-clamp-2 min-h-[3rem]">
                    {item.name}
                  </h3>

                  {/* Stock Status */}
                  <div className="mb-3">
                    <span
                      className={`text-xs font-semibold ${
                        item.status === "In Stock"
                          ? "text-green-600"
                          : item.status === "Low Stock"
                          ? "text-yellow-600"
                          : "text-red-500"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  {/* Price Section */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg font-bold text-gray-900">
                      ₹{item.price.toLocaleString()}
                    </span>
                    {item.costPrice && item.costPrice > 0 && item.costPrice !== item.price && (
                      <span className="text-sm text-gray-400 line-through">
                        ₹{item.costPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
            onClick={() => {
              if (!isDeleting) {
                setShowDeleteConfirm(false);
                setSelectedItem(null);
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
            >
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <FiTrash2 className="text-red-600 text-2xl" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">
                  Remove from Wishlist?
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to remove{" "}
                  <strong className="text-gray-800">"{selectedItem?.name}"</strong>{" "}
                  from your wishlist?
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setSelectedItem(null);
                    }}
                    disabled={isDeleting}
                    className="px-6 py-2.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="px-6 py-2.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition font-medium disabled:opacity-50 flex items-center gap-2"
                  >
                    {isDeleting && <FaSpinner className="animate-spin" />}
                    {isDeleting ? "Removing..." : "Remove"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Wishlist;