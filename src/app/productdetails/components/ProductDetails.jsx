"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  FaHeart,
  FaShoppingCart,
  FaArrowLeft,
  FaStar,
  FaChevronLeft,
  FaChevronRight,
  FaChevronUp,
  FaChevronDown,
  FaBolt,
  FaTimes,
  FaCheck,
} from "react-icons/fa";
import {
  FiTruck,
  FiShield,
  FiHeadphones,
  FiCheckCircle,
  FiPackage,
  FiFileText,
  FiUserCheck,
  FiSearch,
} from "react-icons/fi";
import Link from "next/link";
import ServiceHighlights from "@/app/component/Support";
import { FaSpinner } from "react-icons/fa6";
import { getProductDetails } from "@/app/interceptor/interseptor";
import { useSearchParams, useRouter } from "next/navigation";
import Loading from "@/app/common/Loading";
import { useAuth } from "@/context/AuthContext";
import RecommendedProducts from "./RecommendedProducts";
import AuthPage from "@/app/common/LoginPage";
// CUSTOMER REVIEWS TEMPORARILY DISABLED
// Re-enable when customer reviews return.
// import ProductReviews from "./ProductsReview";
import { gaEvent } from "@/app/lib/ga";
import {
  addCartItem,
} from "@/app/store/cartSlice";
import {
  addWishlistItem,
  removeWishlistItem,
} from "@/app/store/wishlistSlice";
import { useDispatch, useSelector } from "react-redux";

const normalizeImages = (rawImages) => {
  if (!rawImages) return [];

  if (typeof rawImages === "string") {
    const trimmed = rawImages.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return normalizeImages(parsed);
      } catch (e) {
        // ignore JSON parse error
      }
    }
    if (trimmed.includes(",")) {
      return trimmed.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return [trimmed];
  }

  if (Array.isArray(rawImages)) {
    const list = [];
    for (const item of rawImages) {
      if (!item) continue;
      if (typeof item === "string") {
        const trimmed = item.trim();
        if (trimmed) list.push(trimmed);
      } else if (typeof item === "object") {
        const url = item.url || item.secure_url || item.path || item.src || item.imageUrl || "";
        if (url && typeof url === "string") {
          list.push(url.trim());
        }
      }
    }
    return list;
  }

  if (typeof rawImages === "object") {
    const url = rawImages.url || rawImages.secure_url || rawImages.path || rawImages.src || "";
    if (url && typeof url === "string") {
      return [url.trim()];
    }
  }

  return [];
};

const extractVariants = (data) => {
  if (!data) return [];
  if (Array.isArray(data.variant?.unitOnlyVariants) && data.variant.unitOnlyVariants.length > 0) {
    return data.variant.unitOnlyVariants;
  }
  if (Array.isArray(data.variant) && data.variant.length > 0) {
    return data.variant;
  }
  if (Array.isArray(data.variants) && data.variants.length > 0) {
    return data.variants;
  }
  if (Array.isArray(data.unitOnlyVariants) && data.unitOnlyVariants.length > 0) {
    return data.unitOnlyVariants;
  }
  if (Array.isArray(data.variant?.colorOnlyVariants) && data.variant.colorOnlyVariants.length > 0) {
    return data.variant.colorOnlyVariants;
  }
  if (Array.isArray(data.variant?.sizeColorVariants) && data.variant.sizeColorVariants.length > 0) {
    return data.variant.sizeColorVariants;
  }
  if (Array.isArray(data.variant?.sizeOnlyVariants) && data.variant.sizeOnlyVariants.length > 0) {
    return data.variant.sizeOnlyVariants;
  }
  return [];
};

const ProductDetailsPage = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const thumbnailScrollRef = useRef(null);

  const scrollThumbnails = (direction) => {
    if (!thumbnailScrollRef.current) return;
    const isDesktop = window.innerWidth >= 768;
    const scrollAmount = isDesktop ? 96 : 84;
    if (isDesktop) {
      thumbnailScrollRef.current.scrollBy({
        top: direction === "next" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
    } else {
      thumbnailScrollRef.current.scrollBy({
        left: direction === "next" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get("id");

  // const { cartItems, addToCart: addToCartStore, fetchCart } = useCartStore();
  // const { wishlistItems, toggleLike: toggleWishlistStore } = useWishlistStore();
  const { isLoggedIn } = useAuth();
  const { cartItems } = useSelector((state) => state.cart);
  const { wishlistItems } = useSelector((state) => state.wishlist);
  const dispatch = useDispatch();

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await getProductDetails(productId, token);
      if (response?.data) {
        const data = response.data.data || response.data;

        const variants = extractVariants(data);
        let defaultVariant = null;

        if (data.productType === "variant" || variants.length > 0) {
          defaultVariant = variants[0] || null;
        } else if (data.productType === "nonVariant") {
          defaultVariant = data.nonVariant;
        }

        const transformed = {
          id: data._id,
          productId: data._id,
          productName: data.productName || "",
          title: data.productTitle || "",
          description: data.productDescription || "",
          productType: data.productType,
          variant: data.variant,
          selectedVariant: defaultVariant,
          rawData: data,
        };

        setProduct(transformed);
        setSelectedVariantId(defaultVariant?._id || defaultVariant?.id || null);
        setSelectedImage(0);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProduct();
      // fetchCart();
    }
  }, [productId]);

  // The selected variant is the single source of truth for a variant
  // product's visible price, stock, images, cart, wishlist, and checkout data.
  const unitVariants = React.useMemo(() => {
    return extractVariants(product?.rawData || product);
  }, [product]);

  const isUnitOnlyProduct = Boolean(
    unitVariants.length > 0 ||
      (product?.productType === "variant" &&
        product?.variant?.variantType === "unitOnly")
  );

  const selectedUnitVariant = React.useMemo(() => {
    if (!unitVariants || unitVariants.length === 0) return null;
    if (selectedVariantId !== null && selectedVariantId !== undefined) {
      const found = unitVariants.find(
        (variant, idx) =>
          String(variant._id || variant.id || idx) === String(selectedVariantId),
      );
      if (found) return found;
    }
    return unitVariants[0] || null;
  }, [unitVariants, selectedVariantId]);

  const selectedVariant =
    selectedUnitVariant ||
    (product?.rawData?.productType === "nonVariant"
      ? product?.rawData?.nonVariant
      : product?.selectedVariant || null);

  // Strict Image Priority:
  // 1. Selected variant's variantImages (ALL valid images displayed as separate vertical thumbnails on the LEFT)
  // 2. Non-variant images (if nonVariant product)
  // 3. Product's productImages fallback ONLY if selected variant has NO valid images
  // 4. Fallback placeholder only if genuinely empty
  const displayImages = React.useMemo(() => {
    const variantImgs = normalizeImages(
      selectedVariant?.variantImages ||
        selectedVariant?.images ||
        selectedVariant?.image ||
        selectedVariant?.variantImage,
    );
    if (variantImgs.length > 0) {
      return variantImgs;
    }

    if (
      product?.rawData?.productType === "nonVariant" ||
      product?.productType === "nonVariant"
    ) {
      const nvImgs = normalizeImages(
        product?.rawData?.nonVariant?.nonVariantImages ||
          product?.nonVariant?.nonVariantImages ||
          product?.rawData?.nonVariant?.images,
      );
      if (nvImgs.length > 0) {
        return nvImgs;
      }
    }

    const prodImgs = normalizeImages(
      product?.rawData?.productImages || product?.productImages,
    );
    if (prodImgs.length > 0) {
      return prodImgs;
    }

    return ["/placeholder-image.jpg"];
  }, [
    selectedVariant,
    product?.rawData,
    product?.productImages,
    product?.productType,
    product?.nonVariant,
  ]);

  // Ensure selected image index is always valid when images array changes
  useEffect(() => {
    if (selectedImage >= displayImages.length) {
      setSelectedImage(0);
    }
  }, [displayImages, selectedImage]);

  useEffect(() => {
    if (!product || !selectedVariant) return;

    const price = selectedVariant.price?.salePrice || 0;

    gaEvent("view_item", {
      currency: "INR",
      value: price,
      items: [
        {
          item_id: product.productId,
          item_name: product.productName,
          item_category: product.rawData?.productCategory,
          item_variant: selectedVariant.unit || "default",
          price: price,
          quantity: 1,
        },
      ],
    });
  }, [product, selectedVariant]);

  // Real-time wishlist & cart status
  const isInWishlist =
    product && selectedVariant
      ? wishlistItems.some(
          (item) =>
            String(item.productId) === String(product.productId) &&
            String(item.variantId) ===
              String(selectedVariant._id || selectedVariant.id),
        )
      : false;

  const isInCart =
    product && selectedVariant
      ? cartItems.some(
          (item) =>
            String(item.productId) === String(product.productId) &&
            String(item.variantId) ===
              String(selectedVariant._id || selectedVariant.id),
        )
      : false;

  const handleUnitSelect = (variantId) => {
    setSelectedVariantId(variantId);
    setSelectedImage(0);
  };

  const getSelectedUnitRequest = () => {
    const variantId = selectedVariant?._id || selectedVariant?.id;
    const isValidUnitVariant =
      isUnitOnlyProduct || unitVariants.length > 0
        ? unitVariants.some(
            (variant, idx) =>
              String(variant._id || variant.id || idx) === String(variantId),
          )
        : Boolean(variantId);

    const payload = {
      productId: product?.productId,
      variantId,
      productType: product?.productType,
      variantType: product?.variant?.variantType || null,
      selectedUnit: selectedVariant?.unit || null,
    };

    console.debug("AGS Mart selected variant", payload);
    if (!isValidUnitVariant) {
      throw new Error("Please select a valid unit before continuing.");
    }

    return payload;
  };

  const handleAddToWishlist = async () => {
    
    if (!product || !selectedVariant) return;
    setAddingToWishlist(true);
    try {
      const { productId, variantId, productType, variantType } = getSelectedUnitRequest();
      if (isInWishlist) {
        await dispatch(
          removeWishlistItem({ productId, variantId, productType, variantType }),
        ).unwrap();
      } else {
        await dispatch(
          addWishlistItem({ productId, variantId, productType, variantType }),
        ).unwrap();
      }
    // await toggleWishlistStore(product.productId, variantId, productType);
    } catch (error) {
      console.error("Wishlist update failed:", error);
    } finally {
      setAddingToWishlist(false);
    }

    gaEvent("add_to_wishlist", {
      item_id: product.productId,
      item_name: product.productName,
      item_variant: selectedVariant.unit || "default",
    });
  };

  const handleAddToCart = async () => {
    // if (!isLoggedIn) return setShowLoginModal(true);
    if (!product || !selectedVariant) return;
    if (isInCart) {
      router.push("/cart");
      return;
    }
    setAddingToCart(true);
    try {
      const { productId, variantId, productType, variantType } = getSelectedUnitRequest();
      await dispatch(
        addCartItem({ productId, variantId, productType, variantType, quantity }),
      ).unwrap();

    gaEvent("add_to_cart", {
      currency: "INR",
      value: selectedVariant.price?.salePrice * quantity,
      items: [
        {
          item_id: product.productId,
          item_name: product.productName,
          item_variant: selectedVariant.unit || "default",
          price: selectedVariant.price?.salePrice || 0,
          quantity,
        },
      ],
    });
    } catch (error) {
      console.error("Add to cart failed:", error);
    } finally {
      setAddingToCart(false);
    }
  };

  const requireLogin = (actionCallback) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return false;
    }
    return actionCallback();
  };

  const handleBuyNow = () => {
    const action = () => {
      if (!product || !selectedVariant) return;

      const { productId: selectedProductId, variantId, productType, variantType, selectedUnit } =
        getSelectedUnitRequest();
      const priceBreakdown = selectedVariant.price || {};
      const displayName = product.productName;
      const displayImage =
        displayImages[0] || "https://via.placeholder.com/500";

      const buyNowItemData = {
        productId: selectedProductId,
        variantId,
        quantity: 1,
        productType,
        variantType,
        priceBreakdown,
        productName: displayName,
        productImage: selectedVariant.variantImages?.[0] || displayImage,
        variantDetails: {
          unit: selectedUnit,
        },
        stockCount: selectedVariant.stockCount || 0,
      };

      if (product.productType === "nonVariant") {
        buyNowItemData.productType = "nonVariant";
        buyNowItemData.variantId = null;
        buyNowItemData.variantType = null;
        buyNowItemData.variantDetails = {};
        buyNowItemData.stockCount = product.rawData.nonVariant?.stockCount || 0;
      }

      localStorage.setItem("buyNowItem", JSON.stringify(buyNowItemData));

      const params = new URLSearchParams({
        buyNow: "true",
        productId: buyNowItemData.productId,
        variantId: buyNowItemData.variantId || "",
        quantity: buyNowItemData.quantity.toString(),
      });

      gaEvent("begin_checkout", {
        currency: "INR",
        value: selectedVariant.price?.salePrice || 0,
        items: [
          {
            item_id: product.productId,
            item_name: product.productName,
            item_variant: selectedVariant.unit || "default",
            price: selectedVariant.price?.salePrice || 0,
            quantity: 1,
          },
        ],
      });

      router.push(`/checkoutpage?${params.toString()}`);
    };

    action()
  };

  const getStockStatus = () => {
    if (!selectedVariant) return "Select Unit";
    if (selectedVariant.stockCount >= 10) return "In Stock";
    if (selectedVariant.stockCount > 0)
      return `Only ${selectedVariant.stockCount} left`;
    return "Out of Stock";
  };

  const salePrice =
    selectedVariant?.price?.salePrice ??
    product?.rawData?.basePrice ??
    0;
  const costPrice = selectedVariant?.price?.costPrice || 0;
  const discountPct =
    costPrice > salePrice && costPrice > 0
      ? Math.round(((costPrice - salePrice) / costPrice) * 100)
      : selectedVariant?.price?.discount || 0;

  // Dynamically compile available tabs strictly from non-empty Admin data
  const dynamicTabs = [];
  if (product?.rawData?.productDescription?.trim()) {
    dynamicTabs.push({ id: "description", label: "Description" });
  }
  const hasSpecs =
    (product?.rawData?.productIngrediants &&
      product.rawData.productIngrediants.length > 0) ||
    product?.rawData?.inventory?.sku ||
    product?.rawData?.inventory?.productCode ||
    product?.rawData?.shipping?.productWeight;
  if (hasSpecs) {
    dynamicTabs.push({ id: "specifications", label: "Specifications" });
  }
  if (
    product?.rawData?.productReviews &&
    product.rawData.productReviews.length > 0
  ) {
    dynamicTabs.push({
      id: "reviews",
      label: `Reviews (${product.rawData.productReviews.length})`,
    });
  }
  if (Array.isArray(product?.rawData?.detailSections)) {
    product.rawData.detailSections.forEach((sec, idx) => {
      if (sec && (sec.title || sec.name) && (sec.content || sec.body || sec.description)) {
        dynamicTabs.push({
          id: `custom_sec_${idx}`,
          label: sec.title || sec.name,
          isCustom: true,
          sectionData: sec,
        });
      }
    });
  }

  useEffect(() => {
    if (dynamicTabs.length > 0 && !dynamicTabs.some((t) => t.id === activeTab)) {
      setActiveTab(dynamicTabs[0].id);
    }
  }, [dynamicTabs.length]);

  if (loading) return <Loading />;

  if (!product)
    return <div className="text-center py-20 text-xl font-semibold text-gray-600">Product not found</div>;

  return (
    <div className="bg-[#fcfdfc] min-h-screen">
      {/* Breadcrumb */}
      <nav className="bg-gray-100/70 border-b border-gray-200/80 py-2.5 px-4 sm:px-6 lg:px-8 text-xs text-gray-500 font-medium">
        <div className="max-w-7xl mx-auto flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-emerald-700 flex items-center gap-1.5 transition">
            <span className="text-sm">🏠</span>
            <span>Home</span>
          </Link>
          <span className="text-gray-400">›</span>
          {product?.rawData?.productCategory ? (
            <>
              <Link
                href={`/shoppage?category=${encodeURIComponent(product.rawData.productCategory)}`}
                className="hover:text-emerald-700 transition"
              >
                {product.rawData.productCategory}
              </Link>
              <span className="text-gray-400">›</span>
            </>
          ) : (
            <>
              <Link href="/shoppage" className="hover:text-emerald-700 transition">
                Products
              </Link>
              <span className="text-gray-400">›</span>
            </>
          )}
          <span className="text-gray-800 font-semibold truncate max-w-xs sm:max-w-md">
            {product?.productName}
          </span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <Link
          href="/shoppage"
          className="inline-flex items-center gap-2 text-emerald-800 hover:text-emerald-950 font-medium text-xs mb-6 transition"
        >
          <FaArrowLeft size={11} /> Back to Products
        </Link>

        {/* Top Section: Gallery + Product Info (Matched to Reference Layout: ~45% Gallery / ~55% Info) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* LEFT: Product Image Gallery (~45% on desktop: lg:col-span-5) */}
          <div className="lg:col-span-5 flex flex-col-reverse md:flex-row gap-3 sm:gap-4 items-start">
            {/* Left Thumbnail Column (Desktop: vertical with up/down arrows if >4 images; Mobile: horizontal) */}
            {displayImages.length > 0 && (
              <div className="flex md:flex-col items-center gap-2 shrink-0 w-full md:w-auto">
                {/* Scroll Up Button (Desktop only, visible when >4 images) */}
                {displayImages.length > 4 && (
                  <button
                    onClick={() => scrollThumbnails("prev")}
                    className="hidden md:flex w-16 sm:w-18 h-6 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50/50 items-center justify-center transition shadow-2xs"
                    aria-label="Scroll thumbnails up"
                  >
                    <FaChevronUp size={10} />
                  </button>
                )}

                {/* Thumbnails list */}
                <div
                  ref={thumbnailScrollRef}
                  className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto max-h-[440px] shrink-0 scrollbar-hide py-1 px-0.5 w-full md:w-auto scroll-smooth"
                >
                  {displayImages.map((img, i) => {
                    const isSelected = selectedImage === i;
                    return (
                      <button
                        key={`${selectedVariant?._id || selectedVariant?.id || "variant"}_thumb_${i}`}
                        onClick={() => setSelectedImage(i)}
                        className={`w-14 h-14 sm:w-16 sm:h-16 md:w-[72px] md:h-[72px] rounded-xl overflow-hidden transition-all shrink-0 bg-white p-1.5 relative cursor-pointer border ${
                          isSelected
                            ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs"
                            : "border-gray-200 hover:border-gray-300 opacity-80 hover:opacity-100"
                        }`}
                        aria-label={`View image ${i + 1}`}
                      >
                        <Image
                          src={img || "/placeholder-image.jpg"}
                          alt={`${product.productName || "Product"} thumbnail ${i + 1}`}
                          width={72}
                          height={72}
                          className="object-contain w-full h-full rounded-lg"
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Scroll Down Button (Desktop only, visible when >4 images) */}
                {displayImages.length > 4 && (
                  <button
                    onClick={() => scrollThumbnails("next")}
                    className="hidden md:flex w-16 sm:w-18 h-6 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50/50 items-center justify-center transition shadow-2xs"
                    aria-label="Scroll thumbnails down"
                  >
                    <FaChevronDown size={10} />
                  </button>
                )}
              </div>
            )}

            {/* Controlled Main Image Showcase Container */}
            <div className="relative flex-1 w-full aspect-square max-h-[440px] rounded-2xl overflow-hidden bg-white border border-gray-200/90 shadow-xs flex items-center justify-center group p-6 sm:p-8">
              {/* Product badge - only when flagged by Admin */}
              {product.rawData?.isTodaySpecial && (
                <div className="absolute top-3.5 left-3.5 z-10 bg-[#0f4e27] text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-xs">
                  Special Offer
                </div>
              )}

              {/* Floating carousel arrows (clean, subtle circles matching reference) */}
              {displayImages.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelectedImage((prev) => (prev - 1 + displayImages.length) % displayImages.length)
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-sm flex items-center justify-center transition border border-gray-200 hover:scale-105 active:scale-95"
                    aria-label="Previous image"
                  >
                    <FaChevronLeft size={11} />
                  </button>
                  <button
                    onClick={() =>
                      setSelectedImage((prev) => (prev + 1) % displayImages.length)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-sm flex items-center justify-center transition border border-gray-200 hover:scale-105 active:scale-95"
                    aria-label="Next image"
                  >
                    <FaChevronRight size={11} />
                  </button>
                </>
              )}

              {/* Main Product Image (occupies balanced ~65-70% of showcase with ample breathing room) */}
              <div className="relative w-full h-full max-w-[80%] max-h-[80%] flex items-center justify-center">
                <Image
                  src={displayImages[selectedImage] || "/placeholder-image.jpg"}
                  alt={product.productName || "Product"}
                  fill
                  priority
                  className="object-contain transition-transform duration-300 group-hover:scale-102"
                />
              </div>

              {/* Zoom action button at bottom right */}
              <button
                onClick={() => setIsZoomOpen(true)}
                className="absolute bottom-3.5 right-3.5 z-10 bg-white/95 hover:bg-white text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-xs border border-gray-200 flex items-center gap-1.5 transition hover:scale-105 active:scale-95 cursor-pointer"
              >
                <FiSearch size={12} />
                <span>Zoom</span>
              </button>
            </div>
          </div>

          {/* RIGHT: Product Information (~55% on desktop: lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5">
            {/* Title & Stock Status Badge */}
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight tracking-tight">
                {product.productName}
              </h1>
              {selectedVariant && (
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${
                    getStockStatus() === "In Stock"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                      : getStockStatus().includes("Only")
                        ? "bg-amber-50 text-amber-700 border border-amber-200/80"
                        : "bg-red-50 text-red-700 border border-red-200/80"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      getStockStatus() === "In Stock"
                        ? "bg-emerald-500"
                        : getStockStatus().includes("Only")
                          ? "bg-amber-500"
                          : "bg-red-500"
                    }`}
                  />
                  {getStockStatus()}
                </span>
              )}
            </div>

            {/* Category Pill & Rating */}
            <div className="flex items-center gap-3 flex-wrap">
              {product.rawData?.productCategory && (
                <span className="bg-emerald-50/90 text-emerald-800 border border-emerald-200/60 text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wide">
                  {product.rawData.productCategory}
                </span>
              )}
              {Boolean(product.rawData?.averageRating > 0 && (product.rawData?.totalReviews > 0 || product.rawData?.productReviews?.length > 0)) && (
                <div className="flex items-center gap-1 text-xs">
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <FaStar
                        key={s}
                        className={
                          s <= Math.round(product.rawData.averageRating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-200 fill-gray-200"
                        }
                        size={13}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-gray-800 ml-1">
                    {product.rawData.averageRating.toFixed(1)}
                  </span>
                  <span className="text-gray-500">
                    ({product.rawData?.totalReviews || product.rawData?.productReviews?.length} reviews)
                  </span>
                </div>
              )}
            </div>

            {/* Price section */}
            <div className="space-y-0.5 pt-0.5">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#0f4e27]">
                  ₹{salePrice.toLocaleString()}
                </span>
                {costPrice > salePrice && (
                  <>
                    <span className="text-xl text-gray-400 line-through">
                      ₹{costPrice.toLocaleString()}
                    </span>
                    <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                      {discountPct}% OFF
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500 font-medium">Inclusive of all taxes</p>
            </div>

            {/* Product short description summary - only if actual data exists from API */}
            {product.description?.trim() && (
              <p className="text-sm text-gray-600 leading-relaxed pt-0.5">
                {product.description.split("\n")[0].slice(0, 240)}
                {product.description.length > 240 && !product.description.split("\n")[0].endsWith(".") ? "..." : ""}
              </p>
            )}

            {/* Variant / Pack Size Selector */}
            {unitVariants.length > 0 && (
              <div className="space-y-2 pt-1">
                <label className="block text-sm font-semibold text-gray-800">
                  Select Pack Size
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {unitVariants.map((v, idx) => {
                    const variantId = v._id || v.id || String(idx);
                    const isSelected =
                      String(selectedVariant?._id || selectedVariant?.id) ===
                      String(variantId);
                    const isOut = v.stockCount === 0;
                    return (
                      <button
                        key={variantId}
                        onClick={() => handleUnitSelect(variantId)}
                        disabled={isOut}
                        className={`min-w-[84px] px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold uppercase transition-all ${
                          isSelected
                            ? "border-2 border-emerald-600 bg-white text-emerald-900 shadow-xs"
                            : isOut
                              ? "border border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "border border-gray-300 text-gray-700 bg-white hover:border-emerald-500 hover:text-emerald-800"
                        }`}
                      >
                        {v.unit || v.size || v.color || `Option ${idx + 1}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity and Actions Strip */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              {/* Quantity Selector with subtle label */}
              <div className="flex items-center justify-between sm:justify-start gap-2">
                <span className="text-xs font-bold text-gray-700 sm:hidden">Quantity</span>
                <div className="flex items-center border border-gray-300 rounded-xl bg-white px-2 py-1.5 h-12 shrink-0">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold transition text-base"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="px-4 font-bold text-gray-900 text-sm">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold transition text-base"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart (Bordered Emerald Button) */}
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || !selectedVariant || selectedVariant.stockCount === 0}
                className="flex-1 border-2 border-emerald-600 text-emerald-800 bg-white hover:bg-emerald-50/60 active:bg-emerald-100 font-bold h-12 rounded-xl transition flex items-center justify-center gap-2 shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {addingToCart ? (
                  <FaSpinner className="animate-spin text-emerald-600" />
                ) : (
                  <FaShoppingCart className="text-emerald-700 text-base" />
                )}
                <span>{isInCart ? "Go to Cart" : "Add to Cart"}</span>
              </button>

              {/* Buy Now (Solid Warm Orange Button) */}
              <button
                onClick={handleBuyNow}
                disabled={!selectedVariant || selectedVariant.stockCount === 0}
                className="flex-1 bg-[#f97316] hover:bg-[#ea580c] active:bg-[#c2410c] text-white font-bold h-12 rounded-xl transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <FaBolt className="text-white text-xs" />
                <span>Buy Now</span>
              </button>

              {/* Wishlist Button */}
              <button
                onClick={handleAddToWishlist}
                disabled={addingToWishlist}
                aria-label="Wishlist toggle"
                className={`h-12 w-12 rounded-xl border flex items-center justify-center transition shrink-0 ${
                  isInWishlist
                    ? "border-red-300 bg-red-50 text-red-500 shadow-2xs"
                    : "border-gray-300 text-gray-600 hover:border-red-400 hover:text-red-500 hover:bg-red-50/20"
                }`}
              >
                {addingToWishlist ? (
                  <FaSpinner className="animate-spin text-red-500" />
                ) : (
                  <FaHeart className={`text-base ${isInWishlist ? "text-red-500" : ""}`} />
                )}
              </button>
            </div>

            {/* Service & Trust Highlights Strip (Matching reference soft green background) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#eef7f0] border border-emerald-100 rounded-2xl p-4 mt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-emerald-700 flex items-center justify-center shadow-2xs shrink-0">
                  <FiTruck className="text-xl" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Free Delivery</h4>
                  <p className="text-[11px] text-gray-500">On orders above ₹999</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-emerald-700 flex items-center justify-center shadow-2xs shrink-0">
                  <FiShield className="text-xl" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">100% Genuine</h4>
                  <p className="text-[11px] text-gray-500">Original Product</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-emerald-700 flex items-center justify-center shadow-2xs shrink-0">
                  <FiHeadphones className="text-xl" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Expert Support</h4>
                  <p className="text-[11px] text-gray-500">Need help? Chat with us</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Product Details Sections & Tabs */}
        {dynamicTabs.length > 0 && (
          <div className="mt-14 border-t border-gray-200/80 pt-8">
            <div className="border-b border-gray-200 flex gap-6 sm:gap-8 overflow-x-auto scrollbar-hide">
              {dynamicTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 text-sm font-semibold transition-all whitespace-nowrap relative ${
                    activeTab === tab.id
                      ? "text-emerald-900 font-bold"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            <div className="py-8">
              {/* Tab: Description */}
              {activeTab === "description" && (() => {
                const hasSideSpecs =
                  (product.rawData?.productIngrediants && product.rawData.productIngrediants.length > 0) ||
                  selectedVariant?.skuCode ||
                  selectedVariant?.productCode ||
                  product.rawData?.inventory?.sku;

                return (
                  <div className={`grid grid-cols-1 ${hasSideSpecs ? "lg:grid-cols-12 gap-8" : "max-w-4xl"}`}>
                    <div className={`${hasSideSpecs ? "lg:col-span-7" : ""} space-y-6`}>
                      {product.rawData?.productDescription?.trim() && (
                        <div>
                          <div
                            className="text-sm text-gray-700 leading-relaxed whitespace-pre-line"
                            dangerouslySetInnerHTML={{
                              __html: product.rawData.productDescription.replace(/\n/g, "<br />"),
                            }}
                          />
                        </div>
                      )}

                      {product.rawData?.productBenifits && product.rawData.productBenifits.length > 0 && (
                        <div>
                          <h3 className="text-base font-bold text-gray-900 mb-3">
                            Benefits
                          </h3>
                          <ul className="space-y-2">
                            {product.rawData.productBenifits.map((b, i) => (
                              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                                <FaCheck className="text-emerald-600 text-xs mt-1 shrink-0" />
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Right side specification summary - only if actual data exists */}
                    {hasSideSpecs && (
                      <div className="lg:col-span-5 space-y-4">
                        <div className="bg-gray-50/70 border border-gray-200/70 rounded-2xl p-5 space-y-4">
                          {product.rawData?.productIngrediants && product.rawData.productIngrediants.length > 0 && (
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-emerald-800 flex items-center justify-center shrink-0">
                                <FiPackage size={15} />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 font-medium">Ingredients</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {product.rawData.productIngrediants.join(", ")}
                                </p>
                              </div>
                            </div>
                          )}

                          {(selectedVariant?.skuCode || selectedVariant?.productCode || product.rawData?.inventory?.sku) && (
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-emerald-800 flex items-center justify-center shrink-0">
                                <FiFileText size={15} />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 font-medium">SKU / Product Code</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {selectedVariant?.skuCode || selectedVariant?.productCode || product.rawData?.inventory?.sku}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Tab: Specifications */}
              {activeTab === "specifications" && (
                <div className="max-w-3xl">
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden divide-y divide-gray-100 text-sm">
                    {product.rawData?.productCategory && (
                      <div className="grid grid-cols-3 p-4">
                        <span className="text-gray-500 font-medium">Category</span>
                        <span className="col-span-2 text-gray-900 font-semibold">{product.rawData.productCategory}</span>
                      </div>
                    )}
                    {product.rawData?.productIngrediants && product.rawData.productIngrediants.length > 0 && (
                      <div className="grid grid-cols-3 p-4">
                        <span className="text-gray-500 font-medium">Ingredients</span>
                        <span className="col-span-2 text-gray-900 font-semibold">{product.rawData.productIngrediants.join(", ")}</span>
                      </div>
                    )}
                    {(selectedVariant?.skuCode || product.rawData?.inventory?.sku) && (
                      <div className="grid grid-cols-3 p-4">
                        <span className="text-gray-500 font-medium">SKU Code</span>
                        <span className="col-span-2 text-gray-900 font-semibold">{selectedVariant?.skuCode || product.rawData?.inventory?.sku}</span>
                      </div>
                    )}
                    {product.rawData?.shipping?.productWeight && (
                      <div className="grid grid-cols-3 p-4">
                        <span className="text-gray-500 font-medium">Weight</span>
                        <span className="col-span-2 text-gray-900 font-semibold">{product.rawData.shipping.productWeight} g</span>
                      </div>
                    )}
                    {selectedVariant?.unit && (
                      <div className="grid grid-cols-3 p-4">
                        <span className="text-gray-500 font-medium">Pack Unit</span>
                        <span className="col-span-2 text-gray-900 font-semibold">{selectedVariant.unit}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab: Reviews */}
              {activeTab === "reviews" && (
                <div className="max-w-3xl space-y-4">
                  {product.rawData?.productReviews && product.rawData.productReviews.length > 0 ? (
                    <div className="space-y-3">
                      {product.rawData.productReviews.map((rev, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-gray-900 text-sm">{rev.userName || "Customer"}</span>
                            <span className="text-xs text-gray-400">
                              {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : ""}
                            </span>
                          </div>
                          <div className="flex text-amber-400 mb-2">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <FaStar key={s} size={11} className={s <= rev.rating ? "fill-amber-400" : "text-gray-200"} />
                            ))}
                          </div>
                          <p className="text-sm text-gray-700">{rev.review}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No reviews yet for this product.</p>
                  )}
                </div>
              )}

              {/* Dynamic custom sections from admin */}
              {dynamicTabs.find((t) => t.id === activeTab && t.isCustom) && (
                <div className="max-w-3xl">
                  <div
                    className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html:
                        dynamicTabs.find((t) => t.id === activeTab)?.sectionData?.content ||
                        dynamicTabs.find((t) => t.id === activeTab)?.sectionData?.body ||
                        dynamicTabs.find((t) => t.id === activeTab)?.sectionData?.description ||
                        "",
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Image Zoom Lightbox Modal */}
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsZoomOpen(false)}
        >
          <div
            className="relative max-w-3xl w-full max-h-[90vh] bg-white rounded-2xl overflow-hidden p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsZoomOpen(false)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition"
              aria-label="Close zoom"
            >
              <FaTimes size={15} />
            </button>
            <div className="relative aspect-square w-full">
              <Image
                src={displayImages[selectedImage] || "/placeholder-image.jpg"}
                alt={product.productName || "Product"}
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}

      <ServiceHighlights />

      {product.rawData?.relatedProducts?.length > 0 && (
        <RecommendedProducts products={product.rawData.relatedProducts} />
      )}
      {showLoginModal && <AuthPage onClose={() => setShowLoginModal(false)} />}
    </div>
  );
};

export default ProductDetailsPage;
