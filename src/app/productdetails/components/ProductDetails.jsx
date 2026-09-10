"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  FaHeart,
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

const ProductDetailsPage = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
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

        // The customer product page currently supports the admin's unit-only
        // variant system. Other legacy variant arrays are intentionally not
        // used to choose a customer-facing variant.
        const unitVariants =
          data.variant?.variantType === "unitOnly"
            ? data.variant.unitOnlyVariants || []
            : [];
        let defaultVariant = null;

        if (data.productType === "variant") {
          defaultVariant = unitVariants[0] || null;
        } else if (data.productType === "nonVariant") {
          defaultVariant = data.nonVariant;
        }

        const finalImages =
          defaultVariant?.variantImages?.length > 0
            ? defaultVariant.variantImages
            : data.productType === "nonVariant" &&
                data.nonVariant?.nonVariantImages?.length > 0
              ? data.nonVariant.nonVariantImages
              : data.productImages?.length > 0
                ? data.productImages
                : ["https://via.placeholder.com/500"];

        const transformed = {
          id: data._id,
          productId: data._id,
          productName: data.productName || "Product Name",
          title: data.productTitle || "Product Title",
          description: data.productDescription || "No description available",
          productType: data.productType,
          variant: data.variant,
          selectedVariant: defaultVariant,
          images: finalImages,
          rawData: data,
        };

        setProduct(transformed);
        setSelectedVariantId(defaultVariant?._id || null);
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

  // The selected unit variant is the single source of truth for a variant
  // product's visible price, stock, images, cart, wishlist, and checkout data.
  const unitVariants = product?.variant?.unitOnlyVariants || [];
  const isUnitOnlyProduct =
    product?.productType === "variant" &&
    product?.variant?.variantType === "unitOnly";
  const selectedUnitVariant = unitVariants.find(
    (variant) => String(variant._id) === String(selectedVariantId),
  );
  const selectedVariant = isUnitOnlyProduct
    ? selectedUnitVariant || unitVariants[0] || null
    : product?.selectedVariant || null;
  const displayImages =
    selectedVariant?.variantImages?.length > 0
      ? selectedVariant.variantImages
      : product?.rawData?.productImages?.length > 0
        ? product.rawData.productImages
        : product?.images || [];

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
            String(item.variantId) === String(selectedVariant._id),
        )
      : false;

  const isInCart =
    product && selectedVariant
      ? cartItems.some(
          (item) =>
            String(item.productId) === String(product.productId) &&
            String(item.variantId) === String(selectedVariant._id),
        )
      : false;

  const handleUnitSelect = (variantId) => {
    setSelectedVariantId(variantId);
    setSelectedImage(0);
  };

  const getSelectedUnitRequest = () => {
    const variantId = selectedVariant?._id;
    const isValidUnitVariant = isUnitOnlyProduct
      ? unitVariants.some((variant) => String(variant._id) === String(variantId))
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

  if (loading) return <Loading />;

  if (!product)
    return <div className="text-center py-20 text-xl">Product not found</div>;

  return (
    <>
      {/* Breadcrumb */}
      <nav className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-500 flex items-center gap-1">
        <Link href="/" className="hover:text-green-700">Home</Link>
        <span>/</span>
        <Link href="/shoppage" className="hover:text-green-700">Products</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium line-clamp-1">{product?.productName}</span>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link
          href="/shoppage"
          className="inline-flex items-center gap-2 text-green-700 hover:underline mb-6"
        >
          <FaArrowLeft /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* LEFT: Images */}
          <div className="space-y-4 md:sticky  md:top-28 md:self-start">
            <div className="relative  aspect-square rounded-2xl overflow-hidden bg-gray-50">
              <Image
                src={
                  displayImages[selectedImage] ||
                  "https://via.placeholder.com/800"
                }
                alt={product.productName}
                fill
                className="object-cover"
              />
            </div>

            <div className="grid grid-cols-4 gap-3">
              {displayImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`border-2 rounded-xl overflow-hidden ${selectedImage === i ? "border-green-600" : "border-gray-200"}`}
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
              {/* CUSTOMER RATINGS TEMPORARILY DISABLED
                  Re-enable when customer ratings return. */}
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
              ₹{selectedVariant?.price?.salePrice?.toLocaleString() || (product?.rawData?.basePrice ? product.rawData.basePrice.toLocaleString() : "0")}
              {selectedVariant?.price?.costPrice >
                selectedVariant?.price?.salePrice && (
                <>
                  <span className="text-2xl text-gray-500 line-through ml-4">
                    ₹{selectedVariant.price.costPrice.toLocaleString()}
                  </span>
                  <span className="text-emerald-600 ml-4">
                    {Math.round(
                      ((selectedVariant.price.costPrice -
                        selectedVariant.price.salePrice) /
                        selectedVariant.price.costPrice) *
                        100,
                    )}
                    % OFF
                  </span>
                </>
              )}
              <p className="text-xs text-gray-500">Inc. Tax</p>
            </div>

            {/* Variant Selector */}
            {isUnitOnlyProduct && unitVariants.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Select Unit:</h3>
                <div className="flex flex-wrap gap-3">
                  {unitVariants.map((v) => (
                    <button
                      key={v._id}
                      onClick={() => handleUnitSelect(v._id)}
                      disabled={v.stockCount === 0}
                      className={`px-6 py-3 rounded-lg border-2 font-medium transition ${
                        selectedVariant?._id === v._id
                          ? "border-emerald-600 bg-emerald-50 text-bgvariant-2"
                          : v.stockCount === 0
                            ? "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "border-gray-300 hover:border-emerald-400"
                      }`}
                    >
                      {v.unit || "Unit"}
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
                  addingToCart || !selectedVariant || selectedVariant.stockCount === 0
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
                disabled={!selectedVariant || selectedVariant.stockCount === 0}
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

            {/* CUSTOMER REVIEWS TEMPORARILY DISABLED
                Re-enable when customer reviews return.
            <ProductReviews
              averageRating={product.rawData.averageRating}
              reviews={product.rawData.productReviews}
            /> */}
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
