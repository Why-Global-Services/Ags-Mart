"use client";

import React, { useState, useEffect } from "react";
import { FiTrash2, FiEye, FiShoppingCart } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { FaSpinner } from "react-icons/fa6";
import Loading from "@/app/common/Loading";

import { addCartItem } from "@/app/store/cartSlice";

import {
  fetchWishlist,
  removeWishlistItem,
} from "@/app/store/wishlistSlice";

import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";

const FALLBACK_IMAGE = "https://via.placeholder.com/400";

const Wishlist = () => {
  const router = useRouter();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  const dispatch = useDispatch();

  const { wishlistItems, loading } = useSelector(
    (state) => state.wishlist
  );

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  /**
   * Get the first valid image from wishlist response.
   *
   * Priority:
   * 1. Selected variant image
   * 2. wishlistImages from backend
   * 3. productImages from backend
   * 4. selected variant nonVariantImages
   * 5. product nonVariantImages
   * 6. placeholder
   */
  const getFirstImage = (item, selectedVariant) => {
    const variantImages = Array.isArray(
      selectedVariant?.variantImages
    )
      ? selectedVariant.variantImages
      : [];

    const wishlistImages = Array.isArray(item?.wishlistImages)
      ? item.wishlistImages
      : [];

    const productImages = Array.isArray(item?.productImages)
      ? item.productImages
      : [];

    const variantNonVariantImages = Array.isArray(
      selectedVariant?.nonVariantImages
    )
      ? selectedVariant.nonVariantImages
      : [];

    const productNonVariantImages = Array.isArray(
      item?.nonVariantImages
    )
      ? item.nonVariantImages
      : [];

    const imageSources = [
      ...variantImages,
      ...wishlistImages,
      ...productImages,
      ...variantNonVariantImages,
      ...productNonVariantImages,
    ];

    const validImage = imageSources.find(
      (image) =>
        typeof image === "string" &&
        image.trim().length > 0
    );

    return validImage || FALLBACK_IMAGE;
  };

  const wishlistData = Array.isArray(wishlistItems)
    ? wishlistItems.map((item) => {
        console.log("RAW WISHLIST ITEM:", item);

        const selectedVariant = item?.selectedVariant || null;

        /**
         * Important:
         * Backend can return variantId either inside selectedVariant
         * or directly in wishlist item.
         */
        const variantId =
          selectedVariant?._id ||
          item?.variantId ||
          null;

        const variantType =
          item?.variantType ||
          (selectedVariant ? "unitOnly" : null);

        /**
         * Product type can come from either wishlist item
         * or selected variant.
         */
        const productType =
          item?.productType ||
          selectedVariant?.productType ||
          "variant";

        /**
         * Price should come from selected variant.
         * For non-variant products, fallback to product-level price/basePrice.
         */
        const priceData = selectedVariant?.price || {};

        const salePrice = Number(
          priceData?.salePrice ??
            item?.basePrice ??
            item?.price?.salePrice ??
            item?.price ??
            0
        );

        const costPrice = Number(
          priceData?.costPrice ??
            item?.basePrice ??
            item?.price?.costPrice ??
            0
        );

        const discount = Number(
          priceData?.discount ??
            item?.discount ??
            0
        );

        /**
         * Stock handling:
         * Variant product -> selected variant stock
         * Non variant product -> product stock
         */
        const stockCount = Number(
          selectedVariant?.stockCount ??
            item?.stockCount ??
            item?.stock ??
            0
        );

        const image = getFirstImage(
          item,
          selectedVariant
        );

        return {
          id:
            item?._id ||
            `${item?.productId || "product"}-${variantId || "default"}`,

          productId: item?.productId,

          variantId,

          productType,

          variantType,

          name:
            selectedVariant?.productTitle ||
            selectedVariant?.productName ||
            item?.productName ||
            item?.name ||
            "Product Name",

          costPrice,

          price: salePrice,

          discount,

          img: image,

          /**
           * Keep original image data also available.
           */
          productImages: item?.productImages || [],
          wishlistImages: item?.wishlistImages || [],
          variantImages:
            selectedVariant?.variantImages || [],

          selectedVariant,

          selectedUnit:
            selectedVariant?.unit ||
            item?.selectedUnit ||
            null,

          status:
            stockCount >= 5
              ? "In Stock"
              : stockCount >= 1
              ? "Low Stock"
              : "Out of Stock",

          button:
            stockCount >= 1
              ? "ADD TO CART"
              : "OUT OF STOCK",

          stockCount,

          isInCart: Boolean(item?.isInCart),
        };
      })
    : [];

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;

    try {
      setIsDeleting(true);

      await dispatch(
        removeWishlistItem({
          productId: selectedItem.productId,
          variantId: selectedItem.variantId,
          productType: selectedItem.productType,
          variantType: selectedItem.variantType,
        })
      ).unwrap();
    } catch (error) {
      console.error(
        "Error removing item from wishlist:",
        error
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setSelectedItem(null);
    }
  };

  const handleAddToCart = async (item) => {
    if (item.status === "Out of Stock") {
      return;
    }

    try {
      await dispatch(
        addCartItem({
          productId: item.productId,
          variantId: item.variantId,
          productType: item.productType,
          variantType: item.variantType,
          quantity: 1,
        })
      ).unwrap();

      router.push("/cart");
    } catch (error) {
      console.error("Add to Cart Error:", error);
    }
  };

  const handleQuickView = (item) => {
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
    <div className="min-h-screen bg-[#fcfdfc] pb-16">
      {/* Breadcrumb */}
      <nav className="bg-gray-100/70 border-b border-gray-200/80 py-2.5 px-4 sm:px-6 lg:px-8 text-xs text-gray-500 font-medium mb-6">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <Link href="/" className="hover:text-emerald-700 flex items-center gap-1.5 transition">
            <span className="text-sm">🏠</span>
            <span>Home</span>
          </Link>
          <span className="text-gray-400">›</span>
          <span className="text-gray-800 font-semibold">Wishlist</span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-gray-100">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f4e27] tracking-tight">
              My Wishlist
            </h1>
            <div className="w-16 h-1 bg-emerald-600 rounded-full mt-2" />
          </div>

          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-3.5 py-1 rounded-full text-xs font-bold">
            {wishlistData.length} {wishlistData.length === 1 ? "item" : "items"}
          </span>
        </div>

        {wishlistData.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12 min-h-[40vh]">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-700 text-3xl mb-4 border border-emerald-100 shadow-xs">
              💚
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Your wishlist is empty
            </h2>

            <p className="text-gray-500 text-sm mb-6 max-w-sm">
              Explore our agriculture store and save your favorite crop essentials, seeds, and fertilizers.
            </p>

            <Link href="/shoppage">
              <button className="px-7 py-3 bg-[#135d38] hover:bg-[#0f4e27] text-white font-semibold rounded-xl text-sm shadow-xs transition">
                Continue Shopping
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {wishlistData.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col group relative"
              >
                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteClick(item)}
                  className="absolute top-2.5 left-2.5 z-10 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-xs border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 transition"
                  aria-label="Remove from wishlist"
                >
                  <FiTrash2 size={13} />
                </button>

                {/* Product Image */}
                <div className="relative aspect-square bg-[#fafbfa] p-3 overflow-hidden">
                  <Link href={`/productdetails/?id=${item.productId}`}>
                    <img
                      src={item.img || FALLBACK_IMAGE}
                      alt={item.name}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        if (e.currentTarget.src !== FALLBACK_IMAGE) {
                          e.currentTarget.src = FALLBACK_IMAGE;
                        }
                      }}
                    />
                  </Link>

                  {/* Out of Stock Overlay */}
                  {item.status === "Out of Stock" && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-white px-3 py-1 rounded-full text-red-600 font-bold text-xs shadow-sm">
                        OUT OF STOCK
                      </span>
                    </div>
                  )}

                  {/* Discount Badge */}
                  {item.discount > 0 && (
                    <div className="absolute top-2.5 right-2.5 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                      {item.discount}% OFF
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-3.5 flex flex-col flex-1">
                  {item.selectedUnit && (
                    <div>
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-100/60 px-2 py-0.5 rounded-full inline-block mb-1.5">
                        {item.selectedUnit}
                      </span>
                    </div>
                  )}

                  <Link href={`/productdetails/?id=${item.productId}`}>
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 leading-snug hover:text-emerald-700 transition-colors">
                      {item.name}
                    </h3>
                  </Link>

                  {/* Stock Status */}
                  <div className="flex items-center gap-1.5 mb-2.5 text-xs">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        item.status === "In Stock" ? "bg-emerald-500" : "bg-red-500"
                      }`}
                    />
                    <span
                      className={`font-semibold ${
                        item.status === "In Stock" ? "text-emerald-700" : "text-red-600"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  {/* Price Section */}
                  <div className="mt-auto pt-1">
                    <div className="flex items-baseline gap-2 flex-wrap mb-3">
                      <span className="text-base font-extrabold text-[#0f4e27]">
                        ₹{Number(item.price || 0).toLocaleString()}
                      </span>
                      {item.oldPrice > item.price && (
                        <span className="text-xs text-gray-400 line-through">
                          ₹{Number(item.oldPrice).toLocaleString()}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={item.status === "Out of Stock"}
                      className="w-full py-2 bg-[#135d38] hover:bg-[#0f4e27] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
                    >
                      <FiShoppingCart size={13} />
                      <span>Add to Cart</span>
                    </button>
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
              initial={{
                scale: 0.9,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              exit={{
                scale: 0.9,
                opacity: 0,
              }}
              onClick={(e) =>
                e.stopPropagation()
              }
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
                  <strong className="text-gray-800">
                    "{selectedItem?.name}"
                  </strong>{" "}
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
                    {isDeleting && (
                      <FaSpinner className="animate-spin" />
                    )}

                    {isDeleting
                      ? "Removing..."
                      : "Remove"}
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