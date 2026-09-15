// "use client";

// import React, { useState, useEffect } from "react";
// import { createPortal } from "react-dom";
// import { Eye, X, Heart, ChevronRight, ShoppingCart } from "lucide-react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/context/AuthContext";
// import AuthPage from "../common/LoginPage";
// import {
//   fetchCart,
//   removeCartItem,
//   updateCartItem,
//   addCartItem
// } from "@/app/store/cartSlice";
// import {
//   fetchWishlist,
//   addWishlistItem,
//   removeWishlistItem,
// } from "@/app/store/wishlistSlice";
// import { useDispatch, useSelector } from "react-redux";

// export default function ProductCard({ product }) {
//   const [showModal, setShowModal] = useState(false);
//   const [showLoginModal, setShowLoginModal] = useState(false);
//   const [selectedColor, setSelectedColor] = useState("");
//   const [selectedSize, setSelectedSize] = useState("");
//   const [mounted, setMounted] = useState(false);

//   const router = useRouter();
//   const { isLoggedIn } = useAuth();

//   // const { wishlistItems, toggleLike } = useWishlistStore();
//   // const { cartItems, addToCart } = useCartStore();

//   const dispatch = useDispatch();

//   const { cartItems, loading } = useSelector((state) => state.cart);
//   const { wishlistItems } = useSelector((state) => state.wishlist);
//   console.log(wishlistItems,"this is the wishlost imtens");

//   useEffect(() => setMounted(true), []);

//   const requireLogin = (actionCallback) => {
//     if (!isLoggedIn) {
//       setShowLoginModal(true);
//       return false;
//     }
//     return actionCallback();
//   };

//   if (!product) {
//     return (
//       <div className="flex items-center justify-center bg-gray-50 p-4">
//         <div className="bg-white rounded-lg overflow-hidden w-80 relative">
//           <div className="h-80 bg-gray-200 animate-pulse flex items-center justify-center">
//             <span>No Product Data</span>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const isVariantProduct = product.productType === "variant";
//   const isNonVariantProduct = product.productType === "nonVariant";
//   const variantType = product.variant?.variantType;
//   const isColorOnly = variantType === "colorOnly";
//   const isSizeOnly = variantType === "sizeOnly";
//   const isSizeColor = variantType === "sizeColor";

//   let displayImage,
//     displayPrice,
//     displayCostPrice,
//     displayDiscount,
//     productId,
//     variantId,
//     productType,
//     varaintType,
//     displayName,
//     colors = [],
//     sizes = [],
//     variants = [],
//     priceBreakdown;

//   if (isVariantProduct) {
//     displayName = product.productName;

//     if (isColorOnly) {
//       variants = product.variant?.colorOnlyVariants || [];
//       colors = variants.map((v) => v.color);
//       const firstVariant = variants[0];
//       displayImage = firstVariant?.variantImages?.[0] || product.productImages?.[0];
//       displayPrice = firstVariant?.price?.salePrice || 0;
//       displayCostPrice = firstVariant?.price?.costPrice || displayPrice;
//       displayDiscount = firstVariant?.price?.discount || 0;
//       priceBreakdown = firstVariant?.price;
//       productId = product._id;
//       variantId = firstVariant._id;
//       productType = product.productType;
//       varaintType = product.variant?.variantType;
//     } else if (isSizeOnly) {
//       variants = product.variant?.sizeOnlyVariants || [];
//       sizes = variants.map((v) => v.size);
//       const firstVariant = variants[0];
//       displayImage = firstVariant?.variantImages?.[0] || product.productImages?.[0];
//       displayPrice = firstVariant?.price?.salePrice || 0;
//       displayCostPrice = firstVariant?.price?.costPrice || displayPrice;
//       displayDiscount = firstVariant?.price?.discount || 0;
//       priceBreakdown = firstVariant?.price;
//       productId = product._id;
//       variantId = firstVariant._id;
//       productType = product.productType;
//       varaintType = product.variant?.variantType;
//     } else if (isSizeColor) {
//       variants = product.variant?.sizeColorVariants || [];
//       colors = [...new Set(variants.map((v) => v.color))];
//       sizes = [...new Set(variants.map((v) => v.size))];
//       const firstVariant = variants[0];
//       displayImage = firstVariant?.variantImages?.[0] || product.productImages?.[0];
//       displayPrice = firstVariant?.price?.salePrice || 0;
//       displayCostPrice = firstVariant?.price?.costPrice || displayPrice;
//       displayDiscount = firstVariant?.price?.discount || 0;
//       priceBreakdown = firstVariant?.price;
//       productId = product._id;
//       variantId = firstVariant._id;
//       productType = product.productType;
//       varaintType = product.variant?.variantType;
//     }
//   } else if (isNonVariantProduct) {
//     displayImage = product.nonVariant?.nonVariantImages?.[0] || product.productImages?.[0];
//     displayPrice = product.nonVariant?.price?.salePrice || 0;
//     displayCostPrice = product.nonVariant?.price?.costPrice || displayPrice;
//     displayDiscount = product.nonVariant?.price?.discount || 0;
//     displayName = product.productName;
//     productId = product._id;
//     variantId = product.nonVariant._id;
//     priceBreakdown = product.nonVariant?.price;
//     productType = product.productType;
//     varaintType = null;
//   }

//   // REAL-TIME: Check if product/variant is in wishlist (main card)
//   const isWishlisted = wishlistItems.some(
//     (item) =>
//       item.productId === productId &&
//       item.variantId === variantId &&
//       item.productType === productType
//   );

//   // REAL-TIME: Check if in cart (for non-variant or any variant)
//   const isInCart = isNonVariantProduct
//     ? cartItems.some(
//       (item) =>
//         item.productId === productId &&
//         item.variantId === variantId &&
//         item.productType === "nonVariant"
//     )
//     : cartItems.some((item) => item.productId === productId);

//   const getSelectedVariant = () => {
//     if (!isVariantProduct) return null;
//     if (isColorOnly) return variants.find((v) => v.color === selectedColor) || variants[0];
//     if (isSizeOnly) return variants.find((v) => v.size === selectedSize) || variants[0];
//     if (isSizeColor)
//       return (
//         variants.find((v) => v.color === selectedColor && v.size === selectedSize) ||
//         variants.find((v) => v.color === selectedColor) ||
//         variants.find((v) => v.size === selectedSize) ||
//         variants[0]
//       );
//     return variants[0];
//   };

//   const selectedVariant = getSelectedVariant();
//   const modalImage = selectedVariant?.variantImages?.[0] || displayImage;
//   const modalPrice = selectedVariant?.price?.salePrice || displayPrice;
//   const modalCostPrice = selectedVariant?.price?.costPrice || displayCostPrice;
//   const modalDiscount = selectedVariant?.price?.discount || displayDiscount;
//   const modalStock = selectedVariant?.stockCount || 0;

//   // REAL-TIME: Selected variant wishlist & cart status
//   const isSelectedVariantWishlisted = selectedVariant
//     ? wishlistItems.some(
//       (item) =>
//         item.productId === productId &&
//         item.variantId === selectedVariant._id &&
//         item.productType === "variant"
//     )
//     : false;

//   const isSelectedVariantInCart = selectedVariant
//     ? cartItems.some(
//       (item) =>
//         item.productId === productId &&
//         item.variantId === selectedVariant._id &&
//         item.productType === "variant"
//     )
//     : false;

//   const handleMainWishlistToggle = () => {
//     requireLogin(() => {
//       if (isVariantProduct) {
//         setShowModal(true);
//         if (isColorOnly || isSizeColor) setSelectedColor(colors[0] || "");
//         if (isSizeOnly || isSizeColor) setSelectedSize(sizes[0] || "");
//       } else {
//         if (isWishlisted) {
//           dispatch(removeWishlistItem({productId, variantId, productType: "nonVariant", variantType: varaintType}));
//         } else {
//           dispatch(addWishlistItem({productId, variantId, productType: "nonVariant", variantType: varaintType}));
//         }
//       }
//     });
//   };

//   const handleVariantWishlistToggle = () => {

//     if (selectedVariant) {
//       if(isSelectedVariantWishlisted) {
//         dispatch(removeWishlistItem({productId, variantId: selectedVariant._id, productType: "variant", variantType: varaintType}));
//       } else {
//         dispatch(addWishlistItem({productId, variantId: selectedVariant._id, productType: "variant", variantType: varaintType}));
//       }
//     }
//   };

//   const handleAddToCart = async () => {
//     const action = async () => {
//       if (isVariantProduct && selectedVariant) {
//         if (isSelectedVariantInCart) {
//           router.push("/cart");
//         } else {
//           dispatch(addCartItem({
//             productId,
//             variantId: selectedVariant._id,
//             productType: "variant",
//           }));
//         }
//       }
//     };
//     requireLogin(action);
//   };

//   const handleNonVariantAddToCart = async () => {
//     const action = async () => {
//       if (isNonVariantProduct) {
//         if (isInCart) {
//           router.push("/cart");
//         } else {
//           dispatch(addCartItem({
//             productId,
//             variantId,
//             productType: "nonVariant",
//           }));
//         }
//       }
//     };
//     requireLogin(action);
//   };

//   const handleBuyNow = () => {
//     const action = () => {
//       let buyNowItemData;

//       if (isVariantProduct && selectedVariant) {
//         buyNowItemData = {
//           productId: product._id,
//           variantId: selectedVariant._id,
//           quantity: 1,
//           productType: "variant",
//           variantType: varaintType,
//           priceBreakdown: selectedVariant.price || priceBreakdown,
//           productName: displayName,
//           productImage: selectedVariant.variantImages?.[0] || displayImage,
//           variantDetails: {
//             size: selectedVariant.size || selectedSize,
//             color: selectedVariant.color || selectedColor,
//           },
//           stockCount: selectedVariant.stockCount || 0,
//         };
//       } else {
//         buyNowItemData = {
//           productId: product._id,
//           variantId,
//           quantity: 1,
//           productType: "nonVariant",
//           variantType: null,
//           priceBreakdown,
//           productName: displayName,
//           productImage: displayImage,
//           stockCount: product.nonVariant?.stockCount || 0,
//         };
//       }

//       localStorage.setItem("buyNowItem", JSON.stringify(buyNowItemData));
//       const params = new URLSearchParams({
//         buyNow: 'true',
//         productId: buyNowItemData.productId,
//         variantId: buyNowItemData.variantId || '',
//         quantity: buyNowItemData.quantity,
//       });
//       router.push(`/checkoutpage?${params.toString()}`);
//     };

//     requireLogin(action);
//   };

//   const modalContent = isVariantProduct && (
//     <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
//         <button
//           onClick={() => setShowModal(false)}
//           className="absolute top-4 right-4 bg-red-400 hover:bg-red-500 text-white p-2 rounded-full transition-colors z-10"
//         >
//           <X className="w-5 h-5" />
//         </button>

//         <div className="grid md:grid-cols-2 gap-6">
//           <div className="bg-gray-50 p-8 flex items-center justify-center relative">
//             <img
//               src={modalImage}
//               alt={displayName}
//               className="w-full h-auto max-h-96 object-contain"
//             />
//             {selectedVariant && (
//               <button
//                 onClick={handleVariantWishlistToggle}
//                 className="absolute top-20 md:top-4 right-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
//               >
//                 <Heart
//                   className={`w-5 h-5 ${isSelectedVariantWishlisted
//                       ? "fill-red-500 text-red-500"
//                       : "text-gray-700"
//                     }`}
//                 />
//               </button>
//             )}
//           </div>

//           <div className="p-8">
//             <h2 className="text-2xl md:text-3xl font-serif text-gray-800 mb-2 pr-12">
//               {product.productName}
//             </h2>
//             <p className="text-sm text-gray-600 mb-4">
//               {product.inventory?.productCode}
//             </p>

//             <div className="mb-6">
//               <div className="flex items-center gap-3">
//                 <p className="text-2xl font-bold text-gray-800">
//                   Rs. {modalPrice?.toFixed(2)}
//                 </p>
//                 {modalDiscount > 0 && (
//                   <>
//                     <p className="text-lg text-gray-500 line-through">
//                       Rs. {modalCostPrice?.toFixed(2)}
//                     </p>
//                     <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
//                       {modalDiscount}% OFF
//                     </span>
//                   </>
//                 )}
//               </div>
//               <p className="text-gray-500 text-xs mt-3 font-bold">Inc. Tax</p>
//             </div>

//             {modalStock > 0 ? (
//               <p className="text-sm text-green-600 font-medium mb-4">
//                 In Stock ({modalStock} left)
//               </p>
//             ) : (
//               <p className="text-sm text-red-600 font-medium mb-4">
//                 Out of Stock
//               </p>
//             )}

//             {(isColorOnly || isSizeColor) && (
//               <div className="mb-6">
//                 <label className="block text-gray-700 font-medium mb-3">
//                   Color: <span className="font-normal text-gray-600">{selectedColor || "Select a color"}</span>
//                 </label>
//                 <div className="flex gap-3 flex-wrap">
//                   {colors.map((color) => {
//                     const colorVariant = isColorOnly
//                       ? variants.find((v) => v.color === color)
//                       : variants.find((v) => v.color === color && v.size === selectedSize) ||
//                       variants.find((v) => v.color === color);

//                     const isAvailable = colorVariant?.stockCount > 0;

//                     return (
//                       <button
//                         key={color}
//                         onClick={() => {
//                           setSelectedColor(color);
//                           if (isSizeColor && colorVariant?.size) {
//                             setSelectedSize(colorVariant.size);
//                           }
//                         }}
//                         className={`px-6 py-2.5 rounded font-medium transition-colors ${selectedColor === color
//                             ? "bg-bgvariant-2 text-white"
//                             : isAvailable
//                               ? "bg-gray-200 hover:bg-gray-300"
//                               : "bg-gray-200 cursor-not-allowed opacity-60"
//                           }`}
//                       >
//                         {color}
//                       </button>
//                     );
//                   })}
//                 </div>
//               </div>
//             )}

//             {(isSizeOnly || isSizeColor) && (
//               <div className="mb-6">
//                 <label className="block text-gray-700 font-medium mb-3">
//                   Size: <span className="font-normal text-gray-600">{selectedSize || "Select a size"}</span>
//                 </label>
//                 <div className="flex gap-3 flex-wrap">
//                   {sizes.map((size) => {
//                     const sizeVariant = isSizeOnly
//                       ? variants.find((v) => v.size === size)
//                       : variants.find((v) => v.size === size && v.color === selectedColor) ||
//                       variants.find((v) => v.size === size);

//                     const isAvailable = sizeVariant?.stockCount > 0;

//                     return (
//                       <button
//                         key={size}
//                         onClick={() => isAvailable && setSelectedSize(size)}
//                         disabled={!isAvailable}
//                         className={`px-6 py-2.5 rounded font-medium transition-colors ${selectedSize === size
//                             ? "bg-bgvariant-2 text-white"
//                             : isAvailable
//                               ? "bg-gray-200 hover:bg-gray-300"
//                               : "bg-gray-100 text-gray-400 cursor-not-allowed"
//                           }`}
//                       >
//                         {size}
//                       </button>
//                     );
//                   })}
//                 </div>
//               </div>
//             )}

//             <div className="flex gap-3">
//               <button
//                 disabled={
//                   (isColorOnly && !selectedColor) ||
//                   (isSizeOnly && !selectedSize) ||
//                   (isSizeColor && (!selectedColor || !selectedSize)) ||
//                   modalStock === 0
//                 }
//                 onClick={handleAddToCart}
//                 className={`w-full py-3.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-white ${isSelectedVariantInCart
//                     ? "bg-emerald-800"
//                     : "bg-bgvariant-2 hover:bg-emerald-800 disabled:bg-gray-300"
//                   }`}
//               >
//                 <ShoppingCart className="w-5 h-5" />
//                 {isSelectedVariantInCart ? "Go to Cart" : "Add to Cart"}
//               </button>
//               <button
//                 disabled={
//                   (isColorOnly && !selectedColor) ||
//                   (isSizeOnly && !selectedSize) ||
//                   (isSizeColor && (!selectedColor || !selectedSize)) ||
//                   modalStock === 0
//                 }
//                 onClick={handleBuyNow}
//                 className="w-full bg-white border-2 text-gray-800 py-3.5 rounded-lg font-medium disabled:bg-gray-100"
//               >
//                 Buy It Now
//               </button>
//             </div>

//             {product.productDescription && (
//               <div className="mt-6 pt-6 border-t border-gray-200">
//                 <p className="text-sm text-gray-600">{product.productDescription}</p>
//               </div>
//             )}
//             <Link href={`/productdetails/?id=${product._id}`}>
//               <div className="flex items-baseline cursor-pointer mt-4">
//                 <span className="font-bold text-sm">View Full Details</span>{" "}
//                 <ChevronRight className="w-3 h-3" />
//               </div>
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div className="flex items-center justify-center p-4">
//       <div className="bg-white rounded-lg overflow-hidden w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl relative group transition-shadow duration-300 hover:shadow-xl">
//         <div className="relative overflow-hidden rounded-t-lg h-48 sm:h-56 md:h-60">
//           <Link href={`/productdetails/?id=${productId}`}>
//             <img
//               src={displayImage}
//               alt={displayName}
//               className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
//             />
//           </Link>

//           {displayDiscount > 0 && (
//             <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded text-sm font-bold">
//               {displayDiscount}% OFF
//             </div>
//           )}

//           <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-100 lg:opacity-0 md:group-hover:opacity-100 transition-all duration-300">
//             <button
//               onClick={handleMainWishlistToggle}
//               className="bg-white p-2 rounded-full shadow-lg transition-colors duration-200 hover:scale-110 active:scale-95"
//             >
//               <Heart
//                 className={`w-5 h-5 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-700"
//                   }`}
//               />
//             </button>
//             {isVariantProduct && (
//               <button
//                 onClick={() => {
//                   setShowModal(true);
//                   if (isColorOnly || isSizeColor) setSelectedColor(colors[0] || "");
//                   if (isSizeOnly || isSizeColor) setSelectedSize(sizes[0] || "");
//                 }}
//                 className="bg-white p-2 rounded-full shadow-lg transition-colors duration-200 hover:scale-110"
//               >
//                 <Eye className="w-5 h-5 text-gray-700" />
//               </button>
//             )}
//           </div>
//         </div>

//         <div className="p-4 bg-gray-50">
//           <h3 className="text-gray-800 font-medium text-base sm:text-lg mb-2 text-center overflow-hidden text-ellipsis line-clamp-1">
//             {displayName}
//           </h3>

//           <div className="text-center mb-3">
//             <div className="flex items-center justify-center gap-2 flex-wrap">
//               <p className="text-bgvariant-2 font-bold text-lg sm:text-xl">
//                 Rs. {displayPrice?.toFixed(2)}
//               </p>
//               {displayDiscount > 0 && (
//                 <p className="text-gray-500 line-through text-base">
//                   Rs. {displayCostPrice?.toFixed(2)}
//                 </p>
//               )}
//               <p className="text-gray-500 text-xs">Inc. Tax</p>
//             </div>
//           </div>

//           {isVariantProduct ? (
//             <button
//               onClick={() => {
//                 setShowModal(true);
//                 if (isColorOnly || isSizeColor) setSelectedColor(colors[0] || "");
//                 if (isSizeOnly || isSizeColor) setSelectedSize(sizes[0] || "");
//               }}
//               className="w-full bg-bgvariant-2 hover:bg-emerald-800 cursor-pointer text-white py-3 rounded-lg transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg active:scale-95"
//             >
//               View Variants
//             </button>
//           ) : isNonVariantProduct ? (
//             <div className="flex sm:flex-row gap-2">
//               <button
//                 onClick={handleNonVariantAddToCart}
//                 className={`flex-1 py-3 rounded-lg transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 ${isInCart
//                     ? "bg-emerald-800 text-white cursor-pointer"
//                     : "bg-bgvariant-2 cursor-pointer text-white hover:bg-emerald-800"
//                   }`}
//               >
//                 <ShoppingCart className="w-4 h-4 hidden lg:block" />
//                 {isInCart ? "Go to Cart" : "Add to Cart"}
//               </button>

//               <button
//                 onClick={handleBuyNow}
//                 className="flex-1 text-center bg-white text-gray-800 py-3 rounded-lg border border-gray-300 text-sm font-medium transition-all duration-300 shadow-sm hover:bg-gray-100 hover:border-gray-400 hover:shadow-md active:scale-95"
//               >
//                 Buy Now
//               </button>
//             </div>
//           ) : null}
//         </div>
//       </div>

//       {mounted && showLoginModal &&
//         createPortal(
//           <AuthPage  onClose={() => setShowLoginModal(false)} />,
//           document.body
//         )
//       }
//       {mounted && showModal && createPortal(modalContent, document.body)}
//     </div>
//   );
// }

// const handleAddToCart = async () => {
//   const action = async () => {
//     if (isVariantProduct && selectedVariant) {
//       if (isSelectedVariantInCart) {
//         router.push("/cart");
//       } else {
//         dispatch(addCartItem({
//           productId,
//           variantId: selectedVariant._id,
//           productType: "variant",
//         }));
//         setShowModal(false);
//       }
//     } else if (isNonVariantProduct) {
//       if (isInCart) {
//         router.push("/cart");
//       } else {
//         dispatch(addCartItem({
//           productId,
//           variantId,
//           productType: "nonVariant",
//         }));
//       }
//     }
//   };
//   requireLogin(action);
// };

// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import { createPortal } from "react-dom";
// import { Eye, X, Heart, ChevronRight, ShoppingCart } from "lucide-react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/context/AuthContext";
// import AuthPage from "../common/LoginPage";
// import {
//   fetchCart,
//   removeCartItem,
//   updateCartItem,
//   addCartItem,
// } from "@/app/store/cartSlice";
// import {
//   fetchWishlist,
//   addWishlistItem,
//   removeWishlistItem,
// } from "@/app/store/wishlistSlice";
// import { useDispatch, useSelector } from "react-redux";
// import { IoOptions } from "react-icons/io5";

// export default function ProductCard({ product }) {
//   const [showModal, setShowModal] = useState(false);
//   const [showLoginModal, setShowLoginModal] = useState(false);
//   const [selectedColor, setSelectedColor] = useState("");
//   const [selectedSize, setSelectedSize] = useState("");
//   const [mounted, setMounted] = useState(false);

//   const router = useRouter();
//   const { isLoggedIn } = useAuth();
//   const dispatch = useDispatch();

//   const { cartItems, loading } = useSelector((state) => state.cart);
//   const { wishlistItems } = useSelector((state) => state.wishlist);

//   useEffect(() => setMounted(true), []);

//   if (!product) {
//     return (
//       <div className="group relative w-72 cursor-pointer">
//         <div className="relative overflow-hidden rounded-lg h-72 bg-gray-200 animate-pulse"></div>
//       </div>
//     );
//   }

//   const isVariantProduct = product.productType === "variant";
//   const isNonVariantProduct = product.productType === "nonVariant";
//   const variantType = product.variant?.variantType;
//   const isColorOnly = variantType === "colorOnly";
//   const isSizeOnly = variantType === "sizeOnly";
//   const isSizeColor = variantType === "sizeColor";
//   const [currentImage, setCurrentImage] = useState("");
//   const timeoutRef = useRef(null);

//   let displayImage,
//     secondaryImage,
//     displayPrice,
//     displayCostPrice,
//     displayDiscount,
//     productId,
//     variantId,
//     productType,
//     varaintType,
//     displayName,
//     colors = [],
//     sizes = [],
//     variants = [],
//     priceBreakdown;

//   if (isVariantProduct) {
//     displayName = product.productName;

//     if (isColorOnly) {
//       variants = product.variant?.colorOnlyVariants || [];
//       colors = variants.map((v) => v.color);
//       const firstVariant = variants[0];
//       displayImage =
//         firstVariant?.variantImages?.[0] || product.productImages?.[0];
//       secondaryImage =
//         firstVariant?.variantImages?.[1] || product.productImages?.[0];
//       displayPrice = firstVariant?.price?.salePrice || 0;
//       displayCostPrice = firstVariant?.price?.costPrice || displayPrice;
//       displayDiscount = firstVariant?.price?.discount || 0;
//       priceBreakdown = firstVariant?.price;
//       productId = product._id;
//       variantId = firstVariant._id;
//       productType = product.productType;
//       varaintType = product.variant?.variantType;
//     } else if (isSizeOnly) {
//       variants = product.variant?.sizeOnlyVariants || [];
//       sizes = variants.map((v) => v.size);
//       const firstVariant = variants[0];
//       displayImage =
//         firstVariant?.variantImages?.[0] || product.productImages?.[0];
//       secondaryImage =
//         firstVariant?.variantImages?.[1] || product.productImages?.[0];
//       displayPrice = firstVariant?.price?.salePrice || 0;
//       displayCostPrice = firstVariant?.price?.costPrice || displayPrice;
//       displayDiscount = firstVariant?.price?.discount || 0;
//       priceBreakdown = firstVariant?.price;
//       productId = product._id;
//       variantId = firstVariant._id;
//       productType = product.productType;
//       varaintType = product.variant?.variantType;
//     } else if (isSizeColor) {
//       variants = product.variant?.sizeColorVariants || [];
//       colors = [...new Set(variants.map((v) => v.color))];
//       sizes = [...new Set(variants.map((v) => v.size))];
//       const firstVariant = variants[0];
//       displayImage =
//         firstVariant?.variantImages?.[0] || product.productImages?.[0];
//       secondaryImage =
//         firstVariant?.variantImages?.[1] || product.productImages?.[0];
//       displayPrice = firstVariant?.price?.salePrice || 0;
//       displayCostPrice = firstVariant?.price?.costPrice || displayPrice;
//       displayDiscount = firstVariant?.price?.discount || 0;
//       priceBreakdown = firstVariant?.price;
//       productId = product._id;
//       variantId = firstVariant._id;
//       productType = product.productType;
//       varaintType = product.variant?.variantType;
//     }
//   } else if (isNonVariantProduct) {
//     displayImage =
//       product.nonVariant?.nonVariantImages?.[0] || product.productImages?.[0];
//     secondaryImage = product.nonVariant?.nonVariantImages?.[1] || product.productImages?.[0];
//     displayPrice = product.nonVariant?.price?.salePrice || 0;
//     displayCostPrice = product.nonVariant?.price?.costPrice || displayPrice;
//     displayDiscount = product.nonVariant?.price?.discount || 0;
//     displayName = product.productName;
//     productId = product._id;
//     variantId = product.nonVariant._id;
//     priceBreakdown = product.nonVariant?.price;
//     productType = product.productType;
//     varaintType = null;
//   }

//   const isWishlisted = wishlistItems.some(
//     (item) =>
//       item.productId === productId &&
//       item.variantId === variantId &&
//       item.productType === productType,
//   );

//   const isInCart = isNonVariantProduct
//     ? cartItems.some(
//         (item) =>
//           item.productId === productId &&
//           item.variantId === variantId &&
//           item.productType === "nonVariant",
//       )
//     : cartItems.some((item) => item.productId === productId);

//   const getSelectedVariant = () => {
//     if (!isVariantProduct) return null;
//     if (isColorOnly)
//       return variants.find((v) => v.color === selectedColor) || variants[0];
//     if (isSizeOnly)
//       return variants.find((v) => v.size === selectedSize) || variants[0];
//     if (isSizeColor)
//       return (
//         variants.find(
//           (v) => v.color === selectedColor && v.size === selectedSize,
//         ) ||
//         variants.find((v) => v.color === selectedColor) ||
//         variants.find((v) => v.size === selectedSize) ||
//         variants[0]
//       );
//     return variants[0];
//   };

//   const selectedVariant = getSelectedVariant();
//   const modalImage = selectedVariant?.variantImages?.[0] || displayImage;
//   const modalPrice = selectedVariant?.price?.salePrice || displayPrice;
//   const modalCostPrice = selectedVariant?.price?.costPrice || displayCostPrice;
//   const modalDiscount = selectedVariant?.price?.discount || displayDiscount;
//   const modalStock = selectedVariant?.stockCount || 0;

//   const isSelectedVariantWishlisted = selectedVariant
//     ? wishlistItems.some(
//         (item) =>
//           item.productId === productId &&
//           item.variantId === selectedVariant._id &&
//           item.productType === "variant",
//       )
//     : false;

//   const isSelectedVariantInCart = selectedVariant
//     ? cartItems.some(
//         (item) =>
//           item.productId === productId &&
//           item.variantId === selectedVariant._id &&
//           item.productType === "variant",
//       )
//     : false;

//   const handleMainWishlistToggle = () => {
//     if (isVariantProduct) {
//       setShowModal(true);
//       if (isColorOnly || isSizeColor) setSelectedColor(colors[0] || "");
//       if (isSizeOnly || isSizeColor) setSelectedSize(sizes[0] || "");
//     } else {
//       if (isWishlisted) {
//         dispatch(
//           removeWishlistItem({
//             productId,
//             variantId,
//             productType: "nonVariant",
//             variantType: varaintType,
//           }),
//         );
//       } else {
//         dispatch(
//           addWishlistItem({
//             productId,
//             variantId,
//             productType: "nonVariant",
//             variantType: varaintType,
//           }),
//         );
//       }
//     }
//   };

//   const handleVariantWishlistToggle = () => {
//     if (selectedVariant) {
//       if (isSelectedVariantWishlisted) {
//         dispatch(
//           removeWishlistItem({
//             productId,
//             variantId: selectedVariant._id,
//             productType: "variant",
//             variantType: varaintType,
//           }),
//         );
//       } else {
//         dispatch(
//           addWishlistItem({
//             productId,
//             variantId: selectedVariant._id,
//             productType: "variant",
//             variantType: varaintType,
//           }),
//         );
//       }
//     }
//   };

//   const handleQuickView = () => {
//     if (isVariantProduct) {
//       setShowModal(true);
//       if (isColorOnly || isSizeColor) setSelectedColor(colors[0] || "");
//       if (isSizeOnly || isSizeColor) setSelectedSize(sizes[0] || "");
//     } else {
//       router.push(`/productdetails/?id=${productId}`);
//     }
//   };

//   const handleAddToCart = () => {
//     if (isVariantProduct && selectedVariant) {
//       if (isSelectedVariantInCart) {
//         router.push("/cart");
//       } else {
//         dispatch(
//           addCartItem({
//             productId,
//             variantId: selectedVariant._id,
//             productType: "variant",
//           }),
//         );
//       }
//     }
//   };

//   const handleNonVariantAddToCart = () => {
//     if (isNonVariantProduct) {
//       if (isInCart) {
//         router.push("/cart");
//       } else {
//         dispatch(
//           addCartItem({
//             productId,
//             variantId,
//             productType: "nonVariant",
//           }),
//         );
//       }
//     }
//   };

//   const handleBuyNow = () => {
//     const action = () => {
//       let buyNowItemData;

//       if (isVariantProduct && selectedVariant) {
//         buyNowItemData = {
//           productId: product._id,
//           variantId: selectedVariant._id,
//           quantity: 1,
//           productType: "variant",
//           variantType: varaintType,
//           priceBreakdown: selectedVariant.price || priceBreakdown,
//           productName: displayName,
//           productImage: selectedVariant.variantImages?.[0] || displayImage,
//           variantDetails: {
//             size: selectedVariant.size || selectedSize,
//             color: selectedVariant.color || selectedColor,
//           },
//           stockCount: selectedVariant.stockCount || 0,
//         };
//       } else {
//         buyNowItemData = {
//           productId: product._id,
//           variantId,
//           quantity: 1,
//           productType: "nonVariant",
//           variantType: null,
//           priceBreakdown,
//           productName: displayName,
//           productImage: displayImage,
//           stockCount: product.nonVariant?.stockCount || 0,
//         };
//       }

//       localStorage.setItem("buyNowItem", JSON.stringify(buyNowItemData));
//       const params = new URLSearchParams({
//         buyNow: "true",
//         productId: buyNowItemData.productId,
//         variantId: buyNowItemData.variantId || "",
//         quantity: buyNowItemData.quantity,
//       });
//       router.push(`/checkoutpage?${params.toString()}`);
//     };

//     action();
//   };

//   const modalContent = isVariantProduct && (
//     <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
//         <button
//           onClick={() => setShowModal(false)}
//           className="absolute top-4 right-4 bg-red-400 hover:bg-red-500 text-white p-2 rounded-full transition-colors z-10"
//         >
//           <X className="w-5 h-5" />
//         </button>

//         <div className="grid md:grid-cols-2 gap-6">
//           <div className="bg-gray-50 p-8 flex items-center justify-center relative">
//             <img
//               src={modalImage}
//               alt={displayName}
//               className="w-full h-auto max-h-96 object-contain"
//             />
//             {selectedVariant && (
//               <button
//                 onClick={handleVariantWishlistToggle}
//                 className="absolute top-20 md:top-4 right-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
//               >
//                 <Heart
//                   className={`w-5 h-5 ${
//                     isSelectedVariantWishlisted
//                       ? "fill-red-500 text-red-500"
//                       : "text-gray-700"
//                   }`}
//                 />
//               </button>
//             )}
//           </div>

//           <div className="p-8">
//             <h2 className="text-2xl md:text-3xl font-serif text-gray-800 mb-2 pr-12">
//               {product.productName}
//             </h2>
//             <p className="text-sm text-gray-600 mb-4">
//               {product.inventory?.productCode}
//             </p>

//             <div className="mb-6">
//               <div className="flex items-center gap-3">
//                 <p className="text-2xl font-bold text-gray-800">
//                   Rs. {modalPrice?.toFixed(2)}
//                 </p>
//                 {modalDiscount > 0 && (
//                   <>
//                     <p className="text-lg text-gray-500 line-through">
//                       Rs. {modalCostPrice?.toFixed(2)}
//                     </p>
//                     <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
//                       {modalDiscount}% OFF
//                     </span>
//                   </>
//                 )}
//               </div>
//               <p className="text-gray-500 text-xs mt-3 font-bold">Inc. Tax</p>
//             </div>

//             {modalStock > 0 ? (
//               <p className="text-sm text-green-600 font-medium mb-4">
//                 In Stock ({modalStock} left)
//               </p>
//             ) : (
//               <p className="text-sm text-red-600 font-medium mb-4">
//                 Out of Stock
//               </p>
//             )}

//             {(isColorOnly || isSizeColor) && (
//               <div className="mb-6">
//                 <label className="block text-gray-700 font-medium mb-3">
//                   Color:{" "}
//                   <span className="font-normal text-gray-600">
//                     {selectedColor || "Select a color"}
//                   </span>
//                 </label>
//                 <div className="flex gap-3 flex-wrap">
//                   {colors.map((color) => {
//                     const colorVariant = isColorOnly
//                       ? variants.find((v) => v.color === color)
//                       : variants.find(
//                           (v) => v.color === color && v.size === selectedSize,
//                         ) || variants.find((v) => v.color === color);

//                     const isAvailable = colorVariant?.stockCount > 0;

//                     return (
//                       <button
//                         key={color}
//                         onClick={() => {
//                           setSelectedColor(color);
//                           if (isSizeColor && colorVariant?.size) {
//                             setSelectedSize(colorVariant.size);
//                           }
//                         }}
//                         className={`px-6 py-2.5 rounded font-medium transition-colors ${
//                           selectedColor === color
//                             ? "bg-bgvariant-2 text-white"
//                             : isAvailable
//                               ? "bg-gray-200 hover:bg-gray-300"
//                               : "bg-gray-200 cursor-not-allowed opacity-60"
//                         }`}
//                       >
//                         {color}
//                       </button>
//                     );
//                   })}
//                 </div>
//               </div>
//             )}

//             {(isSizeOnly || isSizeColor) && (
//               <div className="mb-6">
//                 <label className="block text-gray-700 font-medium mb-3">
//                   Size:{" "}
//                   <span className="font-normal text-gray-600">
//                     {selectedSize || "Select a size"}
//                   </span>
//                 </label>
//                 <div className="flex gap-3 flex-wrap">
//                   {sizes.map((size) => {
//                     const sizeVariant = isSizeOnly
//                       ? variants.find((v) => v.size === size)
//                       : variants.find(
//                           (v) => v.size === size && v.color === selectedColor,
//                         ) || variants.find((v) => v.size === size);

//                     const isAvailable = sizeVariant?.stockCount > 0;

//                     return (
//                       <button
//                         key={size}
//                         onClick={() => isAvailable && setSelectedSize(size)}
//                         disabled={!isAvailable}
//                         className={`px-6 py-2.5 rounded font-medium transition-colors ${
//                           selectedSize === size
//                             ? "bg-bgvariant-2 text-white"
//                             : isAvailable
//                               ? "bg-gray-200 hover:bg-gray-300"
//                               : "bg-gray-100 text-gray-400 cursor-not-allowed"
//                         }`}
//                       >
//                         {size}
//                       </button>
//                     );
//                   })}
//                 </div>
//               </div>
//             )}

//             <div className="flex gap-3">
//               <button
//                 disabled={
//                   (isColorOnly && !selectedColor) ||
//                   (isSizeOnly && !selectedSize) ||
//                   (isSizeColor && (!selectedColor || !selectedSize)) ||
//                   modalStock === 0
//                 }
//                 onClick={handleAddToCart}
//                 className={`w-full py-3.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-white ${
//                   isSelectedVariantInCart
//                     ? "bg-emerald-800"
//                     : "bg-bgvariant-2 hover:bg-emerald-800 disabled:bg-gray-300"
//                 }`}
//               >
//                 <ShoppingCart className="w-5 h-5" />
//                 {isSelectedVariantInCart ? "Go to Cart" : "Add to Cart"}
//               </button>
//               <button
//                 disabled={
//                   (isColorOnly && !selectedColor) ||
//                   (isSizeOnly && !selectedSize) ||
//                   (isSizeColor && (!selectedColor || !selectedSize)) ||
//                   modalStock === 0
//                 }
//                 onClick={handleBuyNow}
//                 className="w-full bg-white border-2 text-gray-800 py-3.5 rounded-lg font-medium disabled:bg-gray-100"
//               >
//                 Buy It Now
//               </button>
//             </div>

//             {product.productDescription && (
//               <div className="mt-6 pt-6 border-t border-gray-200">
//                 <p className="text-sm text-gray-600">
//                   {product.productDescription}
//                 </p>
//               </div>
//             )}
//             <Link href={`/productdetails/?id=${product._id}`}>
//               <div className="flex items-baseline cursor-pointer mt-4">
//                 <span className="font-bold text-sm">View Full Details</span>{" "}
//                 <ChevronRight className="w-3 h-3" />
//               </div>
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   const handleMouseEnter = () => {
//     if (!secondaryImage || secondaryImage === displayImage) return;
//     setCurrentImage(secondaryImage);
//     timeoutRef.current = setTimeout(() => {}, 2000);
//   };

//   const handleMouseLeave = () => {
//     if (timeoutRef.current) {
//       clearTimeout(timeoutRef.current);
//     }
//     setCurrentImage(displayImage);
//   };

//   useEffect(() => {
//     setCurrentImage(displayImage);
//   }, [displayImage]);

//   return (
//     <div className="group relative w-72 cursor-pointer">
//       {/* IMAGE */}
//       <div
//         className="relative overflow-hidden rounded-lg"
//         onMouseEnter={handleMouseEnter}
//         onMouseLeave={handleMouseLeave}
//       >
//         <Link href={`/productdetails/?id=${productId}`}>
//           <img
//             src={currentImage}
//             alt={displayName}
//             className="
//               w-full aspect-square  object-cover
//               transform
//               transition-transform duration-500 ease-out
//               hover:scale-110
//               cursor-pointer
//             "
//           />
//         </Link>

//         {/* ❤️ Wishlist icon */}
//         <button
//           onClick={handleMainWishlistToggle}
//           className="
//             absolute top-3 left-3 z-20
//             bg-white h-8 w-8 rounded-full
//             flex items-center justify-center
//             transform
//             -translate-x-6 opacity-0
//             group-hover:translate-x-0 group-hover:opacity-100
//             transition-all duration-300 ease-out
//             hover:scale-110
//           "
//         >
//           <Heart
//             className={`w-4 h-4 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-500"}`}
//           />
//         </button>

//         {/* Discount Badge */}
//         {displayDiscount > 0 && (
//           <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded text-sm font-bold">
//             {displayDiscount}% OFF
//           </div>
//         )}

//         {/* 🔥 HOVER OVERLAY - Desktop Only */}
//         <div className="hidden md:absolute pointer-events-none md:inset-0 md:bg-black/40 md:opacity-0 md:group-hover:opacity-100 md:transition md:duration-300 md:flex md:items-center md:justify-center">
//           <div className="flex flex-col gap-3">
//             <div
//               className="
//                 flex flex-col gap-3
//                 opacity-0
//                 group-hover:opacity-100
//                 transition-opacity duration-300
//                 [perspective:800px]
//               "
//             >
//               {/* QUICK VIEW - For all products */}
//               <button
//                 onClick={handleQuickView}
//                 className=" pointer-events-auto
//                   group/quick
//                   w-44 h-11 rounded-full
//                   bg-white text-black
//                   flex items-center justify-center
//                   font-medium
//                   transform origin-bottom rotate-x-90
//                   group-hover:rotate-x-0
//                   transition-transform duration-500 ease-out
//                   hover:bg-black hover:text-white
//                 "
//               >
//                 <span className="group-hover/quick:hidden">Quick view</span>
//                 <Eye className="w-5 h-5 hidden group-hover/quick:block" />
//               </button>

//               {/* VIEW OPTIONS / ADD TO CART - Based on product type */}
//               <button
//                 onClick={() => {
//                   if (isVariantProduct) {
//                     setShowModal(true);
//                     if (isColorOnly || isSizeColor)
//                       setSelectedColor(colors[0] || "");
//                     if (isSizeOnly || isSizeColor)
//                       setSelectedSize(sizes[0] || "");
//                   } else {
//                     handleNonVariantAddToCart();
//                   }
//                 }}
//                 className="
//                   group/quick
//                   w-44 h-11 rounded-full
//                   bg-white text-black
//                   flex items-center justify-center
//                   transition-all duration-300
//                   hover:bg-black hover:text-white
//                 "
//               >
//                 <span className="group-hover/quick:hidden font-medium">
//                   {isVariantProduct
//                     ? "View options"
//                     : isInCart
//                       ? "Go to Cart"
//                       : "Add To Cart"}
//                 </span>
//                 {isVariantProduct ? (
//                   <IoOptions className="w-5 h-5 hidden group-hover/quick:block" />
//                 ) : (
//                   <ShoppingCart className="w-5 h-5 hidden group-hover/quick:block" />
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* 🔥 MOBILE BUTTONS - Bottom Left Corner (Screenshot Style) */}
//         <div className="md:hidden absolute bottom-3 left-3 flex gap-2">
//           {/* QUICK VIEW - For all products */}
//           <button
//             onClick={handleQuickView}
//             className="
//               bg-white/90 backdrop-blur-sm
//               h-10 w-10 rounded-full
//               flex items-center justify-center
//               shadow-lg
//               transition-all duration-200
//               hover:scale-110 active:scale-95
//               hover:bg-white
//             "
//           >
//             <Eye className="w-5 h-5 text-gray-700" />
//           </button>

//           {/* VIEW OPTIONS / ADD TO CART - Based on product type */}
//           <button
//             onClick={() => {
//               if (isVariantProduct) {
//                 setShowModal(true);
//                 if (isColorOnly || isSizeColor)
//                   setSelectedColor(colors[0] || "");
//                 if (isSizeOnly || isSizeColor) setSelectedSize(sizes[0] || "");
//               } else {
//                 handleNonVariantAddToCart();
//               }
//             }}
//             className="
//               bg-white/90 backdrop-blur-sm
//               h-10 w-10 rounded-full
//               flex items-center justify-center
//               shadow-lg
//               transition-all duration-200
//               hover:scale-110 active:scale-95
//               hover:bg-white
//             "
//           >
//             {isVariantProduct ? (
//               <IoOptions className="w-5 h-5 text-gray-700" />
//             ) : (
//               <ShoppingCart className="w-5 h-5 text-gray-700" />
//             )}
//           </button>
//         </div>
//       </div>

//       {/* Product Info */}
//       <div className="mt-4">
//         <h3 className="text-gray-800 font-medium text-base mb-1 text-center overflow-hidden text-ellipsis line-clamp-1">
//           {displayName}
//         </h3>

//         <div className="text-center">
//           <div className="flex items-center justify-center gap-2 flex-wrap">
//             <p className="text-bgvariant-2 font-bold text-lg">
//               Rs. {displayPrice?.toFixed(2)}
//             </p>
//             {displayDiscount > 0 && (
//               <p className="text-gray-500 line-through text-sm">
//                 Rs. {displayCostPrice?.toFixed(2)}
//               </p>
//             )}
//           </div>
//           <div className="flex justify-center items-center gap-5">
//             <p className="text-gray-500 text-xs mt-1">
//               {" "}
//               FLAT {displayDiscount}% OFF
//             </p>
//             <p className="text-gray-500 text-xs mt-1">Inc. Tax</p>
//           </div>
//         </div>
//       </div>

//       {/* Modals */}
//       {mounted &&
//         showLoginModal &&
//         createPortal(
//           <AuthPage onClose={() => setShowLoginModal(false)} />,
//           document.body,
//         )}
//       {mounted && showModal && createPortal(modalContent, document.body)}
//     </div>
//   );
// }

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
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
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
  const isColorOnly = variantType === "colorOnly";
  const isSizeOnly = variantType === "sizeOnly";
  const isSizeColor = variantType === "sizeColor";

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
    colors = [],
    sizes = [],
    variants = [],
    priceBreakdown;

  if (isVariantProduct) {
    displayName = product.productName;

    if (isUnitOnly) {
      variants = product.variant?.unitOnlyVariants || [];
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
    } else if (isColorOnly) {
      variants = product.variant?.colorOnlyVariants || [];
      colors = variants.map((v) => v.color);
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
      variantId = firstVariant._id;
      productType = product.productType;
      varaintType = product.variant?.variantType;
    } else if (isSizeOnly) {
      variants = product.variant?.sizeOnlyVariants || [];
      sizes = variants.map((v) => v.size);
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
      variantId = firstVariant._id;
      productType = product.productType;
      varaintType = product.variant?.variantType;
    } else if (isSizeColor) {
      variants = product.variant?.sizeColorVariants || [];
      colors = [...new Set(variants.map((v) => v.color))];
      sizes = [...new Set(variants.map((v) => v.size))];
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
      variantId = firstVariant._id;
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
    if (isColorOnly)
      return variants.find((v) => v.color === selectedColor) || variants[0];
    if (isSizeOnly)
      return variants.find((v) => v.size === selectedSize) || variants[0];
    if (isSizeColor)
      return (
        variants.find(
          (v) => v.color === selectedColor && v.size === selectedSize,
        ) ||
        variants.find((v) => v.color === selectedColor) ||
        variants.find((v) => v.size === selectedSize) ||
        variants[0]
      );
    return variants[0];
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
      if (isColorOnly || isSizeColor) setSelectedColor(colors[0] || "");
      if (isSizeOnly || isSizeColor) setSelectedSize(sizes[0] || "");
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
      if (isColorOnly || isSizeColor) setSelectedColor(colors[0] || "");
      if (isSizeOnly || isSizeColor) setSelectedSize(sizes[0] || "");
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
    console.log("this is the log");
    
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

            {(isColorOnly || isSizeColor) && (
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-3">
                  Color:{" "}
                  <span className="font-normal text-gray-600">
                    {selectedColor || "Select a color"}
                  </span>
                </label>
                <div className="flex gap-3 flex-wrap">
                  {colors.map((color) => {
                    const colorVariant = isColorOnly
                      ? variants.find((v) => v.color === color)
                      : variants.find(
                          (v) => v.color === color && v.size === selectedSize,
                        ) || variants.find((v) => v.color === color);

                    const isAvailable = colorVariant?.stockCount > 0;

                    return (
                      <button
                        key={color}
                        onClick={() => {
                          setSelectedColor(color);
                          if (isSizeColor && colorVariant?.size) {
                            setSelectedSize(colorVariant.size);
                          }
                        }}
                        className={`px-6 py-2.5 rounded font-medium transition-colors ${
                          selectedColor === color
                            ? "bg-green-600 text-white"
                            : isAvailable
                              ? "bg-gray-200 hover:bg-gray-300"
                              : "bg-gray-200 cursor-not-allowed opacity-60"
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {(isSizeOnly || isSizeColor) && (
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-3">
                  Size:{" "}
                  <span className="font-normal text-gray-600">
                    {selectedSize || "Select a size"}
                  </span>
                </label>
                <div className="flex gap-3 flex-wrap">
                  {sizes.map((size) => {
                    const sizeVariant = isSizeOnly
                      ? variants.find((v) => v.size === size)
                      : variants.find(
                          (v) => v.size === size && v.color === selectedColor,
                        ) || variants.find((v) => v.size === size);

                    const isAvailable = sizeVariant?.stockCount > 0;

                    return (
                      <button
                        key={size}
                        onClick={() => isAvailable && setSelectedSize(size)}
                        disabled={!isAvailable}
                        className={`px-6 py-2.5 rounded font-medium transition-colors ${
                          selectedSize === size
                            ? "bg-green-600 text-white"
                            : isAvailable
                              ? "bg-gray-200 hover:bg-gray-300"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                disabled={
                  (isColorOnly && !selectedColor) ||
                  (isSizeOnly && !selectedSize) ||
                  (isSizeColor && (!selectedColor || !selectedSize)) ||
                  modalStock === 0
                }
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
                disabled={
                  (isColorOnly && !selectedColor) ||
                  (isSizeOnly && !selectedSize) ||
                  (isSizeColor && (!selectedColor || !selectedSize)) ||
                  modalStock === 0
                }
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
        {isVariantProduct && isUnitOnly && variants.length > 0 && (
          <p className="text-xs text-gray-500 mb-2">{variants[0]?.unit}</p>
        )}
        {isVariantProduct && isSizeOnly && sizes.length > 0 && (
          <p className="text-xs text-gray-500 mb-2">{sizes[0]}</p>
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
                if (isColorOnly || isSizeColor) setSelectedColor(colors[0] || '');
                if (isSizeOnly || isSizeColor) setSelectedSize(sizes[0] || '');
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
