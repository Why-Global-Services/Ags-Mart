"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  FaStar,
  FaHeart,
  FaShare,
  FaShoppingCart,
  FaArrowLeft,
} from "react-icons/fa";
import Link from "next/link";
import ServiceHighlights from "@/app/component/Support";
import { FaSpinner } from "react-icons/fa6";
import { getProductDetails } from "@/app/interceptor/interseptor";
import { useSearchParams, useRouter } from "next/navigation";
import Loading from "@/app/common/Loading";
import { useAuth } from "@/context/AuthContext";
import RecommendedProducts from "./RecommendedProducts";
import AuthPage from "@/app/common/LoginPage";
import ProductReviews from "./ProductsReview";
import { gaEvent } from "@/app/lib/ga";
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

const ProductDetailsPage = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false); // added for completeness

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
        const data = response.data;

        // === PRIORITY IMAGE LOGIC ===
        let finalImages = [];
        if (
          data.productType === "nonVariant" &&
          data.nonVariant?.nonVariantImages?.length > 0
        ) {
          finalImages = data.nonVariant.nonVariantImages;
        } else if (data.productImages?.length > 0) {
          finalImages = data.productImages;
        } else {
          finalImages = ["https://via.placeholder.com/500"];
        }

        let variants = [];
        let defaultVariant = null;

        if (data.productType === "variant") {
          const v = data.variant;
          if (v?.sizeOnlyVariants?.length > 0) variants = v.sizeOnlyVariants;
          else if (v?.sizeColorVariants?.length > 0)
            variants = v.sizeColorVariants;
          else if (v?.colorOnlyVariants?.length > 0)
            variants = v.colorOnlyVariants;

          defaultVariant = variants[0] || null;
        } else if (data.productType === "nonVariant") {
          defaultVariant = data.nonVariant;
          variants = [data.nonVariant];
        }

        const transformed = {
          id: data._id,
          productId: data._id,
          productName: data.productName || "Product Name",
          title: data.productTitle || "Product Title",
          description: data.productDescription || "No description available",
          productType: data.productType,
          variants,
          selectedVariant: defaultVariant,
          images: finalImages,
          rating: data.averageRating || 0,
          reviews: data.totalReviews || 0,
          rawData: data,
        };

        setProduct(transformed);
        if (defaultVariant) setSelectedSize(defaultVariant);
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

  useEffect(() => {
    if (!product || !selectedSize) return;

    const price = selectedSize?.price?.salePrice || 0;

    gaEvent("view_item", {
      currency: "INR",
      value: price,
      items: [
        {
          item_id: product.productId,
          item_name: product.productName,
          item_category: product.rawData?.productCategory,
          item_variant: selectedSize.size || selectedSize.color || "default",
          price: price,
          quantity: 1,
        },
      ],
    });
  }, [product, selectedSize]);

  // Real-time wishlist & cart status
  const isInWishlist =
    product && selectedSize
      ? wishlistItems.some(
          (item) =>
            item.productId === product.productId &&
            item.variantId === (selectedSize._id || selectedSize.variantId),
        )
      : false;

  const isInCart =
    product && selectedSize
      ? cartItems.some(
          (item) =>
            item.productId === product.productId &&
            item.variantId === (selectedSize._id || selectedSize.variantId),
        )
      : false;

  const handleSizeSelect = (variant) => {
    setSelectedSize(variant);
    setSelectedImage(0);
    // Update images if variant has its own
    if (variant?.variantImages?.length > 0) {
      setProduct((prev) => ({ ...prev, images: variant.variantImages }));
    } else if (product.rawData.productImages?.length > 0) {
      setProduct((prev) => ({
        ...prev,
        images: product.rawData.productImages,
      }));
    }
  };

  const handleAddToWishlist = async () => {
    
    if (!product || !selectedSize) return;
    setAddingToWishlist(true);
    const variantId = selectedSize._id || selectedSize.variantId;
    const productType = product.productType;
    if (isInWishlist) {
      dispatch(
        removeWishlistItem({
          productId: product.productId,
          variantId,
          productType,
          variantType: product.rawData.variant?.variantType || null,
        }),
      );
    } else {
      dispatch(
        addWishlistItem({
          productId: product.productId,
          variantId,
          productType,
          variantType: product.rawData.variant?.variantType || null,
        }),
      );
    }
    // await toggleWishlistStore(product.productId, variantId, productType);
    setAddingToWishlist(false);

    gaEvent("add_to_wishlist", {
      item_id: product.productId,
      item_name: product.productName,
      item_variant: selectedSize.size || selectedSize.color || "default",
    });
  };

  const handleAddToCart = async () => {
    // if (!isLoggedIn) return setShowLoginModal(true);
    if (!product || !selectedSize) return;
    if (isInCart) {
      router.push("/cart");
      return;
    }
    setAddingToCart(true);
    const variantId = selectedSize._id || selectedSize.variantId;
    dispatch(
      addCartItem({
        productId: product.productId,
        variantId,
        productType: product.productType,
        quantity,
      }),
    );

    gaEvent("add_to_cart", {
      currency: "INR",
      value: selectedSize.price.salePrice * quantity,
      items: [
        {
          item_id: product.productId,
          item_name: product.productName,
          item_variant: selectedSize.size || selectedSize.color || "default",
          price: selectedSize.price.salePrice,
          quantity,
        },
      ],
    });
    setAddingToCart(false);
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
      if (!product || !selectedSize) return;

      const selectedVariant = selectedSize;
      const priceBreakdown = selectedVariant.price || {};
      const displayName = product.productName;
      const displayImage =
        product.images[0] || "https://via.placeholder.com/500";

      const buyNowItemData = {
        productId: product.productId,
        variantId: selectedVariant._id,
        quantity: 1,
        productType: "variant",
        variantType: product.rawData.variant?.variantType || null,
        priceBreakdown,
        productName: displayName,
        productImage: selectedVariant.variantImages?.[0] || displayImage,
        variantDetails: {
          size: selectedVariant.size || null,
          color: selectedVariant.color || null,
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
            item_variant:
              selectedVariant.size || selectedVariant.color || "default",
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
    if (!selectedSize) return "Select Option";
    if (selectedSize.stockCount >= 10) return "In Stock";
    if (selectedSize.stockCount > 0)
      return `Only ${selectedSize.stockCount} left`;
    return "Out of Stock";
  };

  if (loading) return <Loading />;

  if (!product)
    return <div className="text-center py-20 text-xl">Product not found</div>;

  const isVariantProduct =
    product.productType === "variant" && product.variants?.length > 1;

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link
          href="/shoppage"
          className="inline-flex items-center gap-2 text-emerald-600 hover:underline mb-6"
        >
          <FaArrowLeft /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* LEFT: Images */}
          <div className="space-y-4 md:sticky  md:top-28 md:self-start">
            <div className="relative  aspect-square rounded-2xl overflow-hidden bg-gray-50">
              <Image
                src={
                  product.images[selectedImage] ||
                  "https://via.placeholder.com/800"
                }
                alt={product.productName}
                fill
                className="object-cover"
              />
            </div>

            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`border-2 rounded-xl overflow-hidden ${selectedImage === i ? "border-emerald-500" : "border-gray-200"}`}
                >
                  <Image
                    src={img}
                    alt={`${product.productName} view ${i + 1}`}
                    width={150}
                    height={150}
                    className="object-cover aspect-square"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Details */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">{product.productName}</h1>

            <div className="flex items-center gap-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={
                      i < Math.floor(product.rating)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>
              {/* <span className="text-gray-600">({product.reviews} reviews)</span> */}
              <span
                className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${
                  getStockStatus() === "In Stock"
                    ? "bg-green-100 text-green-700"
                    : getStockStatus().includes("Only")
                      ? "bg-orange-100 text-orange-700"
                      : getStockStatus() === "Out of Stock"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                }`}
              >
                {getStockStatus()}
              </span>
            </div>

            <div className="text-4xl font-bold">
              ₹{selectedSize?.price?.salePrice?.toLocaleString() || "0"}
              {selectedSize?.price?.costPrice >
                selectedSize?.price?.salePrice && (
                <>
                  <span className="text-2xl text-gray-500 line-through ml-4">
                    ₹{selectedSize.price.costPrice.toLocaleString()}
                  </span>
                  <span className="text-emerald-600 ml-4">
                    {Math.round(
                      ((selectedSize.price.costPrice -
                        selectedSize.price.salePrice) /
                        selectedSize.price.costPrice) *
                        100,
                    )}
                    % OFF
                  </span>
                </>
              )}
              <p className="text-xs text-gray-500">Inc. Tax</p>
            </div>

            {/* Variant Selector */}
            {isVariantProduct && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Select Size:</h3>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((v) => (
                    <button
                      key={v._id}
                      onClick={() => handleSizeSelect(v)}
                      disabled={v.stockCount === 0}
                      className={`px-6 py-3 rounded-lg border-2 font-medium transition ${
                        selectedSize?._id === v._id
                          ? "border-emerald-600 bg-emerald-50 text-bgvariant-2"
                          : v.stockCount === 0
                            ? "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "border-gray-300 hover:border-emerald-400"
                      }`}
                    >
                      {v.size && v.color
                        ? `${v.size} - ${v.color}`
                        : v.size || v.color || "Standard"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={
                  addingToCart || !selectedSize || selectedSize.stockCount === 0
                }
                className="flex-1 bg-emerald-600 text-white py-4 rounded-xl font-semibold hover:bg-bgvariant-2 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {addingToCart ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaShoppingCart className="hidden md:block" />
                )}
                {isInCart ? "Go to Cart" : "Add to Cart"}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={!selectedSize || selectedSize.stockCount === 0}
                className="flex-1 bg-orange-500 text-white py-4 rounded-xl font-semibold hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>

              <button
                onClick={handleAddToWishlist}
                disabled={addingToWishlist}
                className={`p-4 border-2 rounded-xl transition ${
                  isInWishlist
                    ? "border-red-500 text-red-500"
                    : "border-gray-300 hover:border-red-500"
                }`}
              >
                {addingToWishlist ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaHeart />
                )}
              </button>
            </div>

            {/* Product Details Section */}
            <div className="border-t pt-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Product Benefits */}
              {/* {product.rawData.productBenifits &&
                product.rawData.productBenifits.length > 0 && (
                  <div className="border-t pt-6">
                    <details className="group">
                      <summary className="flex justify-between items-center cursor-pointer list-none">
                        <h3 className="font-semibold text-lg mb-0">
                          Key Benefits
                        </h3>
                        <svg
                          className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </summary>
                      <div className="mt-4 space-y-2">
                        <ul className="space-y-2">
                          {product.rawData.productBenifits.map(
                            (benefit, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <svg
                                  className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <span className="text-gray-700">{benefit}</span>
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    </details>
                  </div>
                )} */}

              {/* Product Usage */}
              {/* {product.rawData.productUsage && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-lg mb-3">How to Use</h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-gray-700">
                      {product.rawData.productUsage}
                    </p>
                  </div>
                </div>
              )} */}

              {/* Product Ingredients */}
              {/* {product.rawData.productIngrediants &&
                product.rawData.productIngrediants.length > 0 && (
                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-lg mb-3">Ingredients</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.rawData.productIngrediants.map(
                        (ingredient, index) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm"
                          >
                            {ingredient}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                )} */}
            </div>

            <ProductReviews
              averageRating={product.rawData.averageRating}
              reviews={product.rawData.productReviews}
            />
          </div>
        </div>
      </div>

      <ServiceHighlights />

      <RecommendedProducts products={product.rawData.relatedProducts} />
      {showLoginModal && <AuthPage onClose={() => setShowLoginModal(false)} />}
    </>
  );
};

export default ProductDetailsPage;
