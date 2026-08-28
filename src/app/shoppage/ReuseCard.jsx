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
//   addCartItem,
// } from "@/app/store/cartSlice";
// import {
//   fetchWishlist,
//   addWishlistItem,
//   removeWishlistItem,
// } from "@/app/store/wishlistSlice";
// import { useDispatch, useSelector } from "react-redux";

// export default function ReuseCard({ product, type }) {
//   console.log("typeeeee", type);
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
//   console.log(wishlistItems, "this is the wishlost imtens");

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
//       displayImage =
//         firstVariant?.variantImages?.[0] || product.productImages?.[0];
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
//       item.productType === productType,
//   );

//   // REAL-TIME: Check if in cart (for non-variant or any variant)
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

//   // REAL-TIME: Selected variant wishlist & cart status
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
//     requireLogin(() => {
//       if (isVariantProduct) {
//         setShowModal(true);
//         if (isColorOnly || isSizeColor) setSelectedColor(colors[0] || "");
//         if (isSizeOnly || isSizeColor) setSelectedSize(sizes[0] || "");
//       } else {
//         if (isWishlisted) {
//           dispatch(
//             removeWishlistItem({
//               productId,
//               variantId,
//               productType: "nonVariant",
//               variantType: varaintType,
//             }),
//           );
//         } else {
//           dispatch(
//             addWishlistItem({
//               productId,
//               variantId,
//               productType: "nonVariant",
//               variantType: varaintType,
//             }),
//           );
//         }
//       }
//     });
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

//   const handleAddToCart = async () => {
//     const action = async () => {
//       if (isVariantProduct && selectedVariant) {
//         if (isSelectedVariantInCart) {
//           router.push("/cart");
//         } else {
//           dispatch(
//             addCartItem({
//               productId,
//               variantId: selectedVariant._id,
//               productType: "variant",
//             }),
//           );
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
//           dispatch(
//             addCartItem({
//               productId,
//               variantId,
//               productType: "nonVariant",
//             }),
//           );
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
//         buyNow: "true",
//         productId: buyNowItemData.productId,
//         variantId: buyNowItemData.variantId || "",
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
//                 className={`w-5 h-5 ${
//                   isWishlisted ? "fill-red-500 text-red-500" : "text-gray-700"
//                 }`}
//               />
//             </button>
//             {isVariantProduct && (
//               <button
//                 onClick={() => {
//                   setShowModal(true);
//                   if (isColorOnly || isSizeColor)
//                     setSelectedColor(colors[0] || "");
//                   if (isSizeOnly || isSizeColor)
//                     setSelectedSize(sizes[0] || "");
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
//                 if (isColorOnly || isSizeColor)
//                   setSelectedColor(colors[0] || "");
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
//                 className={`flex-1 py-3 rounded-lg transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 ${
//                   isInCart
//                     ? "bg-emerald-800 text-white cursor-pointer"
//                     : "bg-bgvariant-2 cursor-pointer text-white hover:bg-emerald-800"
//                 }`}
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
//   addCartItem,
// } from "@/app/store/cartSlice";
// import {
//   fetchWishlist,
//   addWishlistItem,
//   removeWishlistItem,
// } from "@/app/store/wishlistSlice";
// import { useDispatch, useSelector } from "react-redux";
// import { IoOptions } from "react-icons/io5";

// export default function ReuseCard({ product, type = "four", isSingleProductView = false }) {
//   console.log("Grid Type:", type);
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

//   const requireLogin = (actionCallback) => {
//     if (!isLoggedIn) {
//       setShowLoginModal(true);
//       return false;
//     }
//     return actionCallback();
//   };

//   if (!product) {
//     return (
//       <div className={`${getCardContainerClass()} bg-gray-50 p-4`}>
//         <div className="bg-white rounded-lg overflow-hidden w-full relative animate-pulse">
//           <div className={`bg-gray-200 ${getImageHeightClass()}`}></div>
//         </div>
//       </div>
//     );
//   }

//   // Grid type based styling functions
//   const getCardContainerClass = () => {
//     switch(type) {
//       case "single": return "w-full"; // Full width for list view
//       case "three": return "w-full"; // 3-column grid
//       case "four": return "w-full"; // 4-column grid
//       default: return "w-full";
//     }
//   };

//   const getImageHeightClass = () => {
//     switch(type) {
//       case "single": return "h-48"; // List view
//       case "three": return "h-64"; // Medium height for 3-column
//       case "four": return "h-56"; // Smaller for 4-column
//       default: return "h-56";
//     }
//   };

//   const getTitleClass = () => {
//     switch(type) {
//       case "single": return "text-lg font-semibold";
//       case "three": return "text-base font-medium line-clamp-2";
//       case "four": return "text-sm font-medium line-clamp-2";
//       default: return "text-sm font-medium";
//     }
//   };

//   const getPriceClass = () => {
//     switch(type) {
//       case "single": return "text-xl";
//       case "three": return "text-lg";
//       case "four": return "text-base";
//       default: return "text-base";
//     }
//   };

//   const getButtonClass = () => {
//     switch(type) {
//       case "single": return "px-4 py-2.5 text-sm";
//       case "three": return "px-3 py-2 text-xs";
//       case "four": return "px-2 py-1.5 text-xs";
//       default: return "px-3 py-2 text-xs";
//     }
//   };

//   const getCardPaddingClass = () => {
//     switch(type) {
//       case "single": return "p-4";
//       case "three": return "p-3";
//       case "four": return "p-2";
//       default: return "p-3";
//     }
//   };

//   // Rest of your existing product data extraction logic...
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
//       displayImage =
//         firstVariant?.variantImages?.[0] || product.productImages?.[0];
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
//       item.productType === productType,
//   );

//   // REAL-TIME: Check if in cart (for non-variant or any variant)
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

//   // REAL-TIME: Selected variant wishlist & cart status
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
//     requireLogin(() => {
//       if (isVariantProduct) {
//         setShowModal(true);
//         if (isColorOnly || isSizeColor) setSelectedColor(colors[0] || "");
//         if (isSizeOnly || isSizeColor) setSelectedSize(sizes[0] || "");
//       } else {
//         if (isWishlisted) {
//           dispatch(
//             removeWishlistItem({
//               productId,
//               variantId,
//               productType: "nonVariant",
//               variantType: varaintType,
//             }),
//           );
//         } else {
//           dispatch(
//             addWishlistItem({
//               productId,
//               variantId,
//               productType: "nonVariant",
//               variantType: varaintType,
//             }),
//           );
//         }
//       }
//     });
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

//  const handleAddToCart = () => {
//   if (isVariantProduct && selectedVariant) {
//     if (isSelectedVariantInCart) {
//       router.push("/cart");
//     } else {
//       dispatch(
//         addCartItem({
//           productId,
//           variantId: selectedVariant._id,
//           productType: "variant",
//         }),
//       );
//     }
//   }
// };


//  const handleNonVariantAddToCart = () => {
//   if (isNonVariantProduct) {
//     if (isInCart) {
//       router.push("/cart");
//     } else {
//       dispatch(
//         addCartItem({
//           productId,
//           variantId,
//           productType: "nonVariant",
//         }),
//       );
//     }
//   }
// };


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

//     requireLogin(action);
//   };

//   // Generic card renderer with new UI for all types
//   const renderProductCard = () => {
//     const cardWidth = type === "single" ? "w-full" : type === "three" ? "w-full" : "w-full";
    
//     return (
//       <div className={`${cardWidth} group relative cursor-pointer`}>
//         {/* IMAGE CONTAINER */}
//         <div className="relative overflow-hidden rounded-lg">
//           <Link href={`/productdetails/?id=${productId}`}>
//             <img
//               src={displayImage}
//               alt={displayName}
//               className={`
//                 w-full ${getImageHeightClass()} object-cover
//                 transform transition-transform duration-500 ease-out
//                 group-hover:scale-110
//               `}
//             />
//           </Link>

//           {/* ❤️ Wishlist icon - Left slide-in for desktop */}
//           <button
//             onClick={handleMainWishlistToggle}
//             className="
//               absolute top-3 left-3 z-20
//               bg-white h-8 w-8 rounded-full
//               flex items-center justify-center
//               transform
//               -translate-x-6 opacity-0
//               group-hover:translate-x-0 group-hover:opacity-100
//               transition-all duration-300 ease-out
//               hover:scale-110
//               hidden md:flex
//             "
//           >
//             <Heart
//               className={`w-4 h-4 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-500"}`}
//             />
//           </button>

//           {/* ❤️ Wishlist icon - Top right for mobile */}
//           <button
//             onClick={handleMainWishlistToggle}
//             className="
//               absolute top-3 right-3 z-20
//               bg-white h-8 w-8 rounded-full
//               flex items-center justify-center
//               shadow-lg
//               transition-all duration-200
//               hover:scale-110 active:scale-95
//               md:hidden
//             "
//           >
//             <Heart
//               className={`w-4 h-4 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-700"}`}
//             />
//           </button>

//           {/* Discount Badge */}
//           {displayDiscount > 0 && (
//             <div className="absolute top-4 right-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
//               {displayDiscount}% OFF
//             </div>
//           )}

//           {/* 🔥 HOVER OVERLAY - Desktop Only */}
//           <div className="hidden md:absolute md:inset-0 md:bg-black/40 md:opacity-0 md:group-hover:opacity-100 md:transition md:duration-300 md:flex md:items-center md:justify-center">
//             <div className="flex flex-col gap-2">
//               <div
//                 className="
//                   flex flex-col gap-2
//                   opacity-0
//                   group-hover:opacity-100
//                   transition-opacity duration-300
//                   [perspective:800px]
//                 "
//               >
//                 {/* QUICK VIEW - For all products */}
//                 <button
//                   onClick={handleQuickView}
//                   className="
//                     group/quick
//                     w-36 h-9 rounded-full
//                     bg-white text-black
//                     flex items-center justify-center
//                     font-medium text-sm
//                     transform origin-bottom rotate-x-90
//                     group-hover:rotate-x-0
//                     transition-transform duration-500 ease-out
//                     hover:bg-black hover:text-white
//                   "
//                 >
//                   <span className="group-hover/quick:hidden">
//                     Quick view
//                   </span>
//                   <Eye className="w-4 h-4 hidden group-hover/quick:block" />
//                 </button>

//                 {/* VIEW OPTIONS / ADD TO CART - Based on product type */}
//                 <button
//                   onClick={() => {
//                     if (isVariantProduct) {
//                       setShowModal(true);
//                       if (isColorOnly || isSizeColor) setSelectedColor(colors[0] || "");
//                       if (isSizeOnly || isSizeColor) setSelectedSize(sizes[0] || "");
//                     } else {
//                       handleNonVariantAddToCart();
//                     }
//                   }}
//                   className="
//                     group/quick
//                     w-36 h-9 rounded-full
//                     bg-white text-black
//                     flex items-center justify-center
//                     transition-all duration-300 text-sm
//                     hover:bg-black hover:text-white
//                   "
//                 >
//                   <span className="group-hover/quick:hidden font-medium">
//                     {isVariantProduct ? "View options" : (isInCart ? "Go to Cart" : "Add To Cart")}
//                   </span>
//                   {isVariantProduct ? (
//                     <IoOptions className="w-4 h-4 hidden group-hover/quick:block" />
//                   ) : (
//                     <ShoppingCart className="w-4 h-4 hidden group-hover/quick:block" />
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* 🔥 MOBILE BUTTONS - Bottom Left Corner */}
//           <div className="md:hidden absolute bottom-2 left-2 flex gap-2">
//             {/* QUICK VIEW - For all products */}
//             <button
//               onClick={handleQuickView}
//               className="
//                 bg-white/90 backdrop-blur-sm
//                 h-8 w-8 rounded-full
//                 flex items-center justify-center
//                 shadow-lg
//                 transition-all duration-200
//                 hover:scale-110 active:scale-95
//                 hover:bg-white
//               "
//             >
//               <Eye className="w-4 h-4 text-gray-700" />
//             </button>

//             {/* VIEW OPTIONS / ADD TO CART - Based on product type */}
//             <button
//               onClick={() => {
//                 if (isVariantProduct) {
//                   setShowModal(true);
//                   if (isColorOnly || isSizeColor) setSelectedColor(colors[0] || "");
//                   if (isSizeOnly || isSizeColor) setSelectedSize(sizes[0] || "");
//                 } else {
//                   handleNonVariantAddToCart();
//                 }
//               }}
//               className="
//                 bg-white/90 backdrop-blur-sm
//                 h-8 w-8 rounded-full
//                 flex items-center justify-center
//                 shadow-lg
//                 transition-all duration-200
//                 hover:scale-110 active:scale-95
//                 hover:bg-white
//               "
//             >
//               {isVariantProduct ? (
//                 <IoOptions className="w-4 h-4 text-gray-700" />
//               ) : (
//                 <ShoppingCart className="w-4 h-4 text-gray-700" />
//               )}
//             </button>
//           </div>

//           {/* Right corner icons for MD screens */}
          
//         </div>

//         {/* PRODUCT INFO */}
//         <div className="mt-3">
//           <h3 className={`${getTitleClass()} text-gray-800 mb-1 text-center overflow-hidden text-ellipsis truncate line-clamp-2`}>
//             {displayName}
//           </h3>

//           <div className="text-center">
//             <div className="flex items-center justify-center gap-2 flex-wrap">
//               <p className={`${getPriceClass()} font-bold text-bgvariant-2`}>
//                 Rs. {displayPrice?.toFixed(2)}
//               </p>
//               {displayDiscount > 0 && (
//                 <p className="text-gray-500 line-through text-sm">
//                   Rs. {displayCostPrice?.toFixed(2)}
//                 </p>
//               )}
//             </div>
//             <div className="flex justify-center items-center gap-3 mt-1">
//               {displayDiscount > 0 && (
//                 <p className="text-gray-500 text-xs">FLAT {displayDiscount}% OFF</p>
//               )}
//               <p className="text-gray-500 text-xs">Inc. Tax</p>
//             </div>
//           </div>

//           {/* Action buttons based on product type */}
//           {/* <div className="mt-3">
//             {isVariantProduct ? (
//               <button
//                 onClick={() => {
//                   setShowModal(true);
//                   if (isColorOnly || isSizeColor) setSelectedColor(colors[0] || "");
//                   if (isSizeOnly || isSizeColor) setSelectedSize(sizes[0] || "");
//                 }}
//                 className="w-full bg-bgvariant-2 hover:bg-emerald-800 cursor-pointer text-white py-2.5 rounded-lg transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg active:scale-95"
//               >
//                 View Variants
//               </button>
//             ) : isNonVariantProduct ? (
//               <div className="flex gap-2">
//                 <button
//                   onClick={handleNonVariantAddToCart}
//                   className={`flex-1 py-2.5 rounded-lg transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-1 ${
//                     isInCart
//                       ? "bg-emerald-800 text-white cursor-pointer"
//                       : "bg-bgvariant-2 cursor-pointer text-white hover:bg-emerald-800"
//                   }`}
//                 >
//                   <ShoppingCart className="w-4 h-4" />
//                   {isInCart ? "Go to Cart" : "Add to Cart"}
//                 </button>

//                 <button
//                   onClick={handleBuyNow}
//                   className="flex-1 text-center bg-white text-gray-800 py-2.5 rounded-lg border border-gray-300 text-sm font-medium transition-all duration-300 shadow-sm hover:bg-gray-100 hover:border-gray-400 hover:shadow-md active:scale-95"
//                 >
//                   Buy Now
//                 </button>
//               </div>
//             ) : null}
//           </div> */}
//         </div>
//       </div>
//     );
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
//                     ? "fill-red-500 text-red-500"
//                     : "text-gray-700"
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
//                           ? "bg-bgvariant-2 text-white"
//                           : isAvailable
//                             ? "bg-gray-200 hover:bg-gray-300"
//                             : "bg-gray-200 cursor-not-allowed opacity-60"
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
//                           ? "bg-bgvariant-2 text-white"
//                           : isAvailable
//                             ? "bg-gray-200 hover:bg-gray-300"
//                             : "bg-gray-100 text-gray-400 cursor-not-allowed"
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
//                   ? "bg-emerald-800"
//                   : "bg-bgvariant-2 hover:bg-emerald-800 disabled:bg-gray-300"
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
//     <>
//       {renderProductCard()}
      
//       {mounted &&
//         showLoginModal &&
//         createPortal(
//           <AuthPage onClose={() => setShowLoginModal(false)} />,
//           document.body,
//         )}
//       {mounted && showModal && createPortal(modalContent, document.body)}
//     </>
//   );
// }


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
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
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
  const isColorOnly = variantType === "colorOnly";
  const isSizeOnly = variantType === "sizeOnly";
  const isSizeColor = variantType === "sizeColor";

  let displayImage,
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

    if (isColorOnly) {
      variants = product.variant?.colorOnlyVariants || [];
      colors = variants.map((v) => v.color);
      const firstVariant = variants[0];
      displayImage =
        firstVariant?.variantImages?.[0] || product.productImages?.[0];
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
            size: selectedVariant.size || selectedSize,
            color: selectedVariant.color || selectedColor,
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
                    if (isColorOnly || isSizeColor) setSelectedColor(colors[0] || "");
                    if (isSizeOnly || isSizeColor) setSelectedSize(sizes[0] || "");
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
                Rs. {displayPrice?.toFixed(2)}
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

          {/* ACTION BUTTONS - Visible on mobile, hidden on desktop (replaced by hover buttons) */}
          {/* {isMobile && (
            <div className="mt-3 sm:mt-4">
              {isVariantProduct ? (
                <button
                  onClick={() => {
                    setShowModal(true);
                    if (isColorOnly || isSizeColor) setSelectedColor(colors[0] || "");
                    if (isSizeOnly || isSizeColor) setSelectedSize(sizes[0] || "");
                  }}
                  className={`w-full ${getButtonSizeClass()} bg-bgvariant-2 hover:bg-emerald-800 text-white rounded-lg transition-all duration-300 font-medium shadow-sm hover:shadow-md active:scale-95`}
                >
                  View Options
                </button>
              ) : isNonVariantProduct ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleNonVariantAddToCart}
                    className={`flex-1 ${getButtonSizeClass()} rounded-lg transition-all duration-300 font-medium shadow-sm hover:shadow-md active:scale-95 flex items-center justify-center gap-1 ${
                      isInCart
                        ? "bg-emerald-800 text-white"
                        : "bg-bgvariant-2 text-white hover:bg-emerald-800"
                    }`}
                  >
                    <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                    {isInCart ? "In Cart" : "Add to Cart"}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className={`flex-1 ${getButtonSizeClass()} bg-white text-gray-800 rounded-lg border border-gray-300 font-medium transition-all duration-300 shadow-sm hover:bg-gray-50 hover:border-gray-400 hover:shadow-md active:scale-95`}
                  >
                    Buy Now
                  </button>
                </div>
              ) : null}
            </div>
          )} */}
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

            {/* COLOR SELECTOR */}
            {(isColorOnly || isSizeColor) && (
              <div className="mb-4 sm:mb-6">
                <label className="block text-gray-700 font-medium mb-2 sm:mb-3">
                  Color: <span className="font-normal text-gray-600">{selectedColor || "Select a color"}</span>
                </label>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {colors.map((color) => {
                    const colorVariant = isColorOnly
                      ? variants.find((v) => v.color === color)
                      : variants.find((v) => v.color === color && v.size === selectedSize) ||
                      variants.find((v) => v.color === color);

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
                        className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded font-medium transition-colors text-sm ${
                          selectedColor === color
                            ? "bg-bgvariant-2 text-white"
                            : isAvailable
                              ? "bg-gray-100 hover:bg-gray-200 text-gray-800"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                        disabled={!isAvailable}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SIZE SELECTOR */}
            {(isSizeOnly || isSizeColor) && (
              <div className="mb-4 sm:mb-6">
                <label className="block text-gray-700 font-medium mb-2 sm:mb-3">
                  Size: <span className="font-normal text-gray-600">{selectedSize || "Select a size"}</span>
                </label>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {sizes.map((size) => {
                    const sizeVariant = isSizeOnly
                      ? variants.find((v) => v.size === size)
                      : variants.find((v) => v.size === size && v.color === selectedColor) ||
                      variants.find((v) => v.size === size);

                    const isAvailable = sizeVariant?.stockCount > 0;

                    return (
                      <button
                        key={size}
                        onClick={() => isAvailable && setSelectedSize(size)}
                        disabled={!isAvailable}
                        className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded font-medium transition-colors text-sm ${
                          selectedSize === size
                            ? "bg-bgvariant-2 text-white"
                            : isAvailable
                              ? "bg-gray-100 hover:bg-gray-200 text-gray-800"
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

            {/* ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                disabled={
                  (isColorOnly && !selectedColor) ||
                  (isSizeOnly && !selectedSize) ||
                  (isSizeColor && (!selectedColor || !selectedSize)) ||
                  modalStock === 0
                }
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
                disabled={
                  (isColorOnly && !selectedColor) ||
                  (isSizeOnly && !selectedSize) ||
                  (isSizeColor && (!selectedColor || !selectedSize)) ||
                  modalStock === 0
                }
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