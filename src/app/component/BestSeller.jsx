"use client";
import React, { useEffect, useState, useRef } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { FaStar, FaTimes } from "react-icons/fa";
import ProductCard from "./CartUI";
import Image from "next/image";
import { useSelector } from "react-redux";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const BestSeller = () => {
  const [wishlist, setWishlist] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);



  // const { homeData, loading, error, fetchHomeData } = useHomeStore();
  const { homeData, loading } = useSelector((state) => state.home);

  // Get products from backend data
  const products = homeData?.bestSellingProductsData?.data || [];

  // 🔹 Initialize AOS & load wishlist
  // useEffect(() => {
  //   AOS.init({ duration: 900, once: true, easing: "ease-in-out" });
  //   const savedWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
  //   setWishlist(savedWishlist);

  //   // // Fetch home data
  //   // fetchHomeData();
  // });

  // Debug log
  // useEffect(() => {
  //   console.log('Home data:', homeData);
  //   console.log('Products:', products);
  // }, [homeData, products]);

  // 🔹 Add to cart
  const handleAddToCart = (item) => {
    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = existingCart.find(
      (cartItem) => cartItem.id === item.id,
    );

    let updatedCart;
    if (existingItem) {
      updatedCart = existingCart.map((cartItem) =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem,
      );
    } else {
      updatedCart = [
        ...existingCart,
        { ...item, quantity: 1, img: item.image, discount: "10% OFF" },
      ];
    }

    localStorage.setItem("cart", JSON.stringify(updatedCart));
    alert(`${item.name} added to cart 🛒`);
  };

  // 🔹 Wishlist add/remove
  const handleWishlist = (item) => {
    const existingWishlist = JSON.parse(
      localStorage.getItem("wishlist") || "[]",
    );
    const isInWishlist = existingWishlist.some(
      (wishItem) => wishItem.id === item.id,
    );

    let updatedWishlist;
    if (isInWishlist) {
      updatedWishlist = existingWishlist.filter(
        (wishItem) => wishItem.id !== item.id,
      );
      alert(`${item.name} removed from wishlist ❤️`);
    } else {
      updatedWishlist = [...existingWishlist, { ...item, img: item.image }];
      alert(`${item.name} added to wishlist ❤️`);
    }

    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
    setWishlist(updatedWishlist);
  };

  // 🔹 Product detail modal
  const handleViewDetails = (item) => {
    setSelectedProduct(item);
    setShowModal(true);
  };

  const isInWishlist = (itemId) => {
    return wishlist.some((item) => item.id === itemId);
  };

  // Helper function to get display image
  const getDisplayImage = (product) => {
    if (product.productType === "variant") {
      const firstVariant =
        product.variant?.sizeColorVariants?.[0] ||
        product.variant?.colorOnlyVariants?.[0] ||
        product.variant?.sizeOnlyVariants?.[0];
      return firstVariant?.variantImages?.[0] || product.productImages?.[0];
    } else if (product.productType === "nonVariant") {
      return (
        product.nonVariant?.nonVariantImages?.[0] || product.productImages?.[0]
      );
    }
    return product.productImages?.[0] || "/placeholder-image.jpg";
  };

  // Helper function to get display price
  const getDisplayPrice = (product) => {
    if (product.productType === "variant") {
      const firstVariant =
        product.variant?.sizeColorVariants?.[0] ||
        product.variant?.colorOnlyVariants?.[0] ||
        product.variant?.sizeOnlyVariants?.[0];
      return (
        firstVariant?.price?.salePrice || firstVariant?.price?.realPrice || 0
      );
    } else if (product.productType === "nonVariant") {
      return (
        product.nonVariant?.price?.salePrice ||
        product.nonVariant?.price?.realPrice ||
        0
      );
    }
    return 0;
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-[#fefefb] py-8 px-6 sm:px-12">
        <div className="flex items-center justify-center mb-6 ">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-normal font-fonttitle  text-bgvariant-3 mb-3 px-4">
            Best <span className="text-bgvariant-1">Seller</span>
          </h2>
          <div className="w-20 sm:w-24 h-1 sm:h-1.5 bg-gradient-to-r from-bgvariant-1  via-bgvariant-4 to-bgvariant-2 mx-auto rounded-full"></div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse"
            >
              <div className="h-80 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded mb-3"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fefefb] py-8 px-2 lg:px-6 sm:px-12">
      <div className="mb-6 flex flex-col items-center text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-normal font-fonttitle text-gray-900 mb-3 px-4">
          Best <span className="text-bgvariant-1">Seller</span>
        </h2>
        <div className="w-20 sm:w-24 h-1 sm:h-1.5 bg-gradient-to-r from-bgvariant-1 via-bgvariant-4 to-bgvariant-2 rounded-full"></div>
      </div>

      {/* Show message if no products */}
      {products.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No products available at the moment.</p>
        </div>
      )}

      {/* Product Grid - Using your ProductCard component with backend data  overflow-x-auto pb-4 scrollbar-hide sroll-smooth */}
      <div className="relative w-full h-auto ">
        <div className="grid grid-cols-2
  sm:grid-cols-2
  md:grid-cols-3
  lg:grid-cols-3
  xl:grid-cols-4
  2xl:grid-cols-6 gap-2 md:gap-6 pb-4">
          {products?.map((item, index) => (
            <div className="flex-shrink-0">
            <ProductCard
            key={item._id}
              product= {item.product} // Pass the actual product data from backend
            />
            </div>
          ))}
        </div>
      </div>

      {/* Product Detail Modal - For backward compatibility with old data structure */}
      {/* {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-xl max-w-[70vh] w-full max-h-[85vh] flex flex-col overflow-hidden relative"
            data-aos="zoom-in"
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 z-10 bg-white/90 p-2 rounded-full hover:bg-gray-100 transition-all duration-200 shadow-lg"
            >
              <FaTimes className="text-gray-600 text-sm" />
            </button>

            <div className="relative h-48 bg-gray-100">
              <Image
                src={selectedProduct.image || getDisplayImage(selectedProduct)}
                alt={selectedProduct.name || selectedProduct.productName}
                className="w-full h-full object-cover"
              />
              {selectedProduct.offer && (
                <span className="absolute top-3 left-3 bg-emerald-800 text-white text-xs font-semibold px-3 py-1 rounded-lg">
                  {selectedProduct.offer}% OFF
                </span>
              )}
            </div>

            <div className="flex-1 p-4">
              <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                {selectedProduct.name || selectedProduct.productName}
              </h2>

              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {selectedProduct.use || selectedProduct.productTitle}
              </p>

              <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                {selectedProduct.description ||
                  selectedProduct.productDescription}
              </p>

              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 text-sm mb-2">
                  Key Benefits:
                </h3>
                <div className="space-y-1">
                  {(selectedProduct.benefits || []).map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                      <span className="text-xs text-gray-700 line-clamp-1">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 mb-4 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-yellow-500">
                    <FaStar className="text-xs" />
                    <span className="text-sm text-gray-800 font-semibold">
                      {selectedProduct.rating ||
                        selectedProduct.averageRating ||
                        0}
                    </span>
                  </div>
                  <span className="text-gray-600 text-xs">
                    (
                    {selectedProduct.reviews ||
                      selectedProduct.totalReviews ||
                      0}{" "}
                    reviews)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900">
                    ₹{selectedProduct.price || getDisplayPrice(selectedProduct)}
                  </span>
                  {selectedProduct.oldPrice > 0 && (
                    <span className="text-sm text-gray-400 line-through">
                      ₹{selectedProduct.oldPrice}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-white">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    handleAddToCart(selectedProduct);
                    setShowModal(false);
                  }}
                  className="flex-1 bg-emerald-600 text-white font-semibold py-2.5 rounded-lg hover:bg-bgvariant-2 transition-all duration-200 text-sm"
                >
                  ADD TO CART
                </button>

                <button
                  onClick={() => handleWishlist(selectedProduct)}
                  className={`flex-1 py-2.5 rounded-lg font-semibold transition-all duration-200 text-sm ${
                    isInWishlist(selectedProduct.id)
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {isInWishlist(selectedProduct.id)
                    ? "IN WISHLIST"
                    : "ADD TO WISHLIST"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default BestSeller;




// "use client";
// import React, { useEffect, useState, useRef } from "react";
// import AOS from "aos";
// import "aos/dist/aos.css";
// import { FaStar, FaTimes } from "react-icons/fa";
// import ProductCard from "./CartUI";
// import Image from "next/image";
// import { useSelector } from "react-redux";
// import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
// import BestSellerCard from "./bestsellercard";

// const BestSeller = () => {
//   const [wishlist, setWishlist] = useState([]);
//   const [selectedProduct, setSelectedProduct] = useState(null);
//   const [showModal, setShowModal] = useState(false);


  
//   // const scrollRef = useRef(null);

//   // const scrollleft = () => {
//   //   scrollRef.current.scrollBy({
//   //     left: -300,
//   //     behaviour: "smooth",
//   //   });
//   // };

//   // const scrollRight = () => {
//   //   scrollRef.current.scrollBy({
//   //     left: 300,
//   //     behaviour: "smooth",
//   //   });
//   // };

//   // const { homeData, loading, error, fetchHomeData } = useHomeStore();
//   const { homeData, loading } = useSelector((state) => state.home);

//   // Get products from backend data
//   const products = homeData?.bestSellingProductsData?.data || [];

//   // 🔹 Initialize AOS & load wishlist
//   // useEffect(() => {
//   //   AOS.init({ duration: 900, once: true, easing: "ease-in-out" });
//   //   const savedWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
//   //   setWishlist(savedWishlist);

//   //   // // Fetch home data
//   //   // fetchHomeData();
//   // });

//   // Debug log
//   // useEffect(() => {
//   //   console.log('Home data:', homeData);
//   //   console.log('Products:', products);
//   // }, [homeData, products]);

//   // 🔹 Add to cart
//   const handleAddToCart = (item) => {
//     const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
//     const existingItem = existingCart.find(
//       (cartItem) => cartItem.id === item.id,
//     );

//     let updatedCart;
//     if (existingItem) {
//       updatedCart = existingCart.map((cartItem) =>
//         cartItem.id === item.id
//           ? { ...cartItem, quantity: cartItem.quantity + 1 }
//           : cartItem,
//       );
//     } else {
//       updatedCart = [
//         ...existingCart,
//         { ...item, quantity: 1, img: item.image, discount: "10% OFF" },
//       ];
//     }

//     localStorage.setItem("cart", JSON.stringify(updatedCart));
//     alert(`${item.name} added to cart 🛒`);
//   };

//   // 🔹 Wishlist add/remove
//   const handleWishlist = (item) => {
//     const existingWishlist = JSON.parse(
//       localStorage.getItem("wishlist") || "[]",
//     );
//     const isInWishlist = existingWishlist.some(
//       (wishItem) => wishItem.id === item.id,
//     );

//     let updatedWishlist;
//     if (isInWishlist) {
//       updatedWishlist = existingWishlist.filter(
//         (wishItem) => wishItem.id !== item.id,
//       );
//       alert(`${item.name} removed from wishlist ❤️`);
//     } else {
//       updatedWishlist = [...existingWishlist, { ...item, img: item.image }];
//       alert(`${item.name} added to wishlist ❤️`);
//     }

//     localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
//     setWishlist(updatedWishlist);
//   };

//   // 🔹 Product detail modal
//   const handleViewDetails = (item) => {
//     setSelectedProduct(item);
//     setShowModal(true);
//   };

//   const isInWishlist = (itemId) => {
//     return wishlist.some((item) => item.id === itemId);
//   };

//   // Helper function to get display image
//   const getDisplayImage = (product) => {
//     if (product.productType === "variant") {
//       const firstVariant =
//         product.variant?.sizeColorVariants?.[0] ||
//         product.variant?.colorOnlyVariants?.[0] ||
//         product.variant?.sizeOnlyVariants?.[0];
//       return firstVariant?.variantImages?.[0] || product.productImages?.[0];
//     } else if (product.productType === "nonVariant") {
//       return (
//         product.nonVariant?.nonVariantImages?.[0] || product.productImages?.[0]
//       );
//     }
//     return product.productImages?.[0] || "/placeholder-image.jpg";
//   };

//   // Helper function to get display price
//   const getDisplayPrice = (product) => {
//     if (product.productType === "variant") {
//       const firstVariant =
//         product.variant?.sizeColorVariants?.[0] ||
//         product.variant?.colorOnlyVariants?.[0] ||
//         product.variant?.sizeOnlyVariants?.[0];
//       return (
//         firstVariant?.price?.salePrice || firstVariant?.price?.realPrice || 0
//       );
//     } else if (product.productType === "nonVariant") {
//       return (
//         product.nonVariant?.price?.salePrice ||
//         product.nonVariant?.price?.realPrice ||
//         0
//       );
//     }
//     return 0;
//   };

//   // Loading state
//   if (loading) {
//     return (
//       <div className="bg-[#fefefb] py-8 px-6 sm:px-12">
//         <div className="flex items-center justify-center mb-6 ">
//           <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-normal font-fonttitle  text-bgvariant-3 mb-3 px-4">
//             Best <span className="text-bgvariant-1">Seller</span>
//           </h2>
//           <div className="w-20 sm:w-24 h-1 sm:h-1.5 bg-gradient-to-r from-bgvariant-1  via-bgvariant-4 to-bgvariant-2 mx-auto rounded-full"></div>
//         </div>

//         <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
//           {[...Array(4)].map((_, index) => (
//             <div
//               key={index}
//               className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse"
//             >
//               <div className="h-80 bg-gray-200"></div>
//               <div className="p-4">
//                 <div className="h-4 bg-gray-200 rounded mb-2"></div>
//                 <div className="h-6 bg-gray-200 rounded mb-3"></div>
//                 <div className="h-8 bg-gray-200 rounded"></div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-[#fefefb] py-8 px-6 sm:px-12">
//       <div className="mb-6 flex flex-col items-center text-center">
//         <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-normal font-fonttitle text-gray-900 mb-3 px-4">
//           Best <span className="text-bgvariant-1">Seller</span>
//         </h2>
//         <div className="w-20 sm:w-24 h-1 sm:h-1.5 bg-gradient-to-r from-bgvariant-1 via-bgvariant-4 to-bgvariant-2 rounded-full"></div>
//       </div>

//       {/* Show message if no products */}
//       {products.length === 0 && !loading && (
//         <div className="text-center py-8">
//           <p className="text-gray-500">No products available at the moment.</p>
//         </div>
//       )}

//       {/* Product Grid - Using your ProductCard component with backend data */}
//       <div className="relative w-full h-auto">
//         <div
//           // ref={scrollRef}
//           className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5 "
//         >
//           {products.map((product, index) => (
            
//               <BestSellerCard
//                 key={product.product._id}
//                 product={product.product} // Pass the actual product data from backend
//                 data-aos="fade-up"
//                 data-aos-delay={index * 100}
//               />
            
//           ))}
//         </div>
//      {/* <button
//   onClick={scrollleft}
//   className={`
//     absolute -left-4 top-1/4 translate-y-1/2
//     z-10
//     flex md:${products.length > 4 ? "flex" : "hidden"}
//     bg-white shadow-md
//     p-4 rounded-full
//     opacity-70 hover:opacity-100
//     transition
//   `}
// >
//   <FaChevronLeft size={18} />
// </button>


//       <button
//   onClick={scrollRight}
//   className={`
//     absolute -right-4 top-1/4 translate-y-1/2
//     z-10
//     flex md:${products.length > 4 ? "flex" : "hidden"}
//     bg-white shadow-md
//     p-4 rounded-full
//     opacity-70 hover:opacity-100
//     transition
//   `}
// >
//   <FaChevronRight size={18} />
// </button> */}

//       </div>

//       {/* Product Detail Modal - For backward compatibility with old data structure */}
//       {showModal && selectedProduct && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//           <div
//             className="bg-white rounded-xl max-w-[70vh] w-full max-h-[85vh] flex flex-col overflow-hidden relative"
//             data-aos="zoom-in"
//           >
//             <button
//               onClick={() => setShowModal(false)}
//               className="absolute top-3 right-3 z-10 bg-white/90 p-2 rounded-full hover:bg-gray-100 transition-all duration-200 shadow-lg"
//             >
//               <FaTimes className="text-gray-600 text-sm" />
//             </button>

//             <div className="relative h-48 bg-gray-100">
//               <Image
//                 src={selectedProduct.image || getDisplayImage(selectedProduct)}
//                 alt={selectedProduct.name || selectedProduct.productName}
//                 className="w-full h-full object-cover"
//               />
//               {selectedProduct.offer && (
//                 <span className="absolute top-3 left-3 bg-emerald-800 text-white text-xs font-semibold px-3 py-1 rounded-lg">
//                   {selectedProduct.offer}% OFF
//                 </span>
//               )}
//             </div>

//             <div className="flex-1 p-4">
//               <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
//                 {selectedProduct.name || selectedProduct.productName}
//               </h2>

//               <p className="text-gray-600 text-sm mb-3 line-clamp-2">
//                 {selectedProduct.use || selectedProduct.productTitle}
//               </p>

//               <p className="text-gray-700 text-sm mb-4 line-clamp-3">
//                 {selectedProduct.description ||
//                   selectedProduct.productDescription}
//               </p>

//               <div className="mb-4">
//                 <h3 className="font-semibold text-gray-900 text-sm mb-2">
//                   Key Benefits:
//                 </h3>
//                 <div className="space-y-1">
//                   {(selectedProduct.benefits || []).map((benefit, index) => (
//                     <div key={index} className="flex items-center gap-2">
//                       <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
//                       <span className="text-xs text-gray-700 line-clamp-1">
//                         {benefit}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div className="flex items-center justify-between gap-4 mb-4 pt-2 border-t border-gray-100">
//                 <div className="flex items-center gap-2">
//                   <div className="flex items-center gap-1 text-yellow-500">
//                     <FaStar className="text-xs" />
//                     <span className="text-sm text-gray-800 font-semibold">
//                       {selectedProduct.rating ||
//                         selectedProduct.averageRating ||
//                         0}
//                     </span>
//                   </div>
//                   <span className="text-gray-600 text-xs">
//                     (
//                     {selectedProduct.reviews ||
//                       selectedProduct.totalReviews ||
//                       0}{" "}
//                     reviews)
//                   </span>
//                 </div>

//                 <div className="flex items-center gap-2">
//                   <span className="text-lg font-bold text-gray-900">
//                     ₹{selectedProduct.price || getDisplayPrice(selectedProduct)}
//                   </span>
//                   {selectedProduct.oldPrice > 0 && (
//                     <span className="text-sm text-gray-400 line-through">
//                       ₹{selectedProduct.oldPrice}
//                     </span>
//                   )}
//                 </div>
//               </div>
//             </div>

//             <div className="p-4 border-t border-gray-100 bg-white">
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => {
//                     handleAddToCart(selectedProduct);
//                     setShowModal(false);
//                   }}
//                   className="flex-1 bg-emerald-600 text-white font-semibold py-2.5 rounded-lg hover:bg-bgvariant-2 transition-all duration-200 text-sm"
//                 >
//                   ADD TO CART
//                 </button>

//                 <button
//                   onClick={() => handleWishlist(selectedProduct)}
//                   className={`flex-1 py-2.5 rounded-lg font-semibold transition-all duration-200 text-sm ${
//                     isInWishlist(selectedProduct.id)
//                       ? "bg-red-500 text-white hover:bg-red-600"
//                       : "border border-gray-300 text-gray-700 hover:bg-gray-50"
//                   }`}
//                 >
//                   {isInWishlist(selectedProduct.id)
//                     ? "IN WISHLIST"
//                     : "ADD TO WISHLIST"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default BestSeller;
