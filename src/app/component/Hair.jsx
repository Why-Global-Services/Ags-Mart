
"use client";
import React, { useEffect, useState , useRef } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { FaStar, FaTimes,FaChevronLeft, FaChevronRight } from "react-icons/fa";
import ProductCard from "./CartUI";
import { useSelector } from "react-redux";


const HairCare = () => {
  const [wishlist, setWishlist] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

    const { homeData, loading } = useSelector(
    (state) => state.home
  );

  useEffect(() => {
    AOS.init({
      duration: 900,
      once: true,
      easing: "ease-in-out",
    });

    // Load wishlist from localStorage
    const savedWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setWishlist(savedWishlist);
  }, []);

  // const { homeData } = useHomeStore();
console.log(homeData.getAllProductsGroupedByCategory?.categories?.[1]?.products, "data");

const category  = homeData.getAllProductsGroupedByCategory?.categories?.[1]?.category;

const products = homeData.getAllProductsGroupedByCategory?.categories?.[1]?.products;


  const handleAddToCart = (item) => {
    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = existingCart.find((cartItem) => cartItem.id === item.id);

    let updatedCart;
    if (existingItem) {
      updatedCart = existingCart.map((cartItem) =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
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

  const handleWishlist = (item) => {
    const existingWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const isInWishlist = existingWishlist.some(wishItem => wishItem.id === item.id);

    let updatedWishlist;
    if (isInWishlist) {
      updatedWishlist = existingWishlist.filter(wishItem => wishItem.id !== item.id);
      alert(`${item.name} removed from wishlist ❤️`);
    } else {
      updatedWishlist = [...existingWishlist, { ...item, img: item.image }];
      alert(`${item.name} added to wishlist ❤️`);
    }

    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
    setWishlist(updatedWishlist);
  };

  const handleViewDetails = (item) => {
    setSelectedProduct(item);
    setShowModal(true);
  };

  const isInWishlist = (itemId) => {
    return wishlist.some(item => item.id === itemId);
  };

  return (
    <div className="bg-[#fefefb] py-8 px-2 md:px-6 sm:px-12">
   <div
  className="mb-6 flex flex-col items-center text-center"
  data-aos="fade-up"
>
  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-normal font-fonttitle text-bgvariant-3 mb-3 px-4">
    Bridal <span className="text-bgvariant-1">Jewellery</span>
  </h2>
  <div className="w-20 sm:w-24 h-1 sm:h-1.5 bg-gradient-to-r from-bgvariant-1 via-bgvariant-4 to-bgvariant-2 rounded-full"></div>
</div>


      {/* 🔹 Using Reusable ProductCard Component */}
       <div className="relative w-full h-auto ">
      <div 
      className="grid grid-cols-2
  sm:grid-cols-2
  md:grid-cols-3
  lg:grid-cols-3
  xl:grid-cols-4
  2xl:grid-cols-6 gap-2 md:gap-6 pb-4">
        {products?.map((item, index) => (
          <div className="flex-shrink-0">
          <ProductCard
          key={item._id}
            product= {item}
          />
          </div>
        ))}
      </div>
    
      </div>

      {/* 🔹 Product Detail Modal */}
      {showModal && selectedProduct && (
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
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
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
                {selectedProduct.name}
              </h2>

              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {selectedProduct.use}
              </p>

              <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                {selectedProduct.description}
              </p>

              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 text-sm mb-2">
                  Key Benefits:
                </h3>
                <div className="space-y-1">
                  {selectedProduct.benefits.map((benefit, index) => (
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
                      {selectedProduct.rating}
                    </span>
                  </div>
                  <span className="text-gray-600 text-xs">
                    ({selectedProduct.reviews})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900">
                    ₹{selectedProduct.price}
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
                  className={`flex-1 py-2.5 rounded-lg font-semibold transition-all duration-200 text-sm ${isInWishlist(selectedProduct.id)
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
      )}
    </div>
  );
};

export default HairCare;