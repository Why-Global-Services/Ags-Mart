"use client";
import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Image from "next/image";
import { FaStar, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useSelector } from "react-redux";

const StarRating = ({ rating }) => (
  <div className="flex justify-center space-x-2 mb-4">
    {[...Array(5)].map((_, i) => (
      <FaStar
        key={i}
        className={`w-6 h-6 ${i < rating ? "text-emerald-600" : "text-gray-200"}`}
      />
    ))}
  </div>
);

// Custom Arrow Components
const NextArrow = ({ onClick }) => (
  <div
    className="absolute -right-4 top-1/2 transform -translate-y-1/2 z-10 cursor-pointer text-[#4A2C2A] bg-white rounded-full p-2 shadow-lg hover:bg-[#FFE8E0]"
    onClick={onClick}
  >
    <FaArrowRight />
  </div>
);

const PrevArrow = ({ onClick }) => (
  <div
    className="absolute -left-4 top-1/2 transform -translate-y-1/2 z-10 cursor-pointer text-[#4A2C2A] bg-white rounded-full p-2 shadow-lg hover:bg-[#FFE8E0]"
    onClick={onClick}
  >
    <FaArrowLeft />
  </div>
);

const Testimonials = () => {
  
  const {homeData} = useSelector((state) => state.home);
  const testimonials = homeData.getTetimonialData || [];

  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen width
  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth < 768);
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const settings = {
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    speed: 800,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    dots: true,
    dotsClass: "slick-dots custom-dots",
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2, slidesToScroll: 1 },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 1, slidesToScroll: 1 },
      },
    ],
  };

  return (
    <section className="py-8 sm:py-10 lg:py-16 relative bg-[#FFF9F7]">
      <div className="container mx-auto px-4">
       <div
  className="mb-6 flex flex-col items-center text-center"
  data-aos="fade-up"
>
  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-normal font-fonttitle text-bgvariant-3 mb-3 px-4">
    Customer <span className="text-bgvariant-1">Testimonials</span>
  </h2>
  <div className="w-20 sm:w-24 h-1 sm:h-1.5 bg-gradient-to-r from-bgvariant-1 via-bgvariant-4 to-bgvariant-2 rounded-full"></div>
</div>


        <div className="max-w-6xl mx-auto relative font-lato">
          {/* ✅ Desktop / Tablet View - Show Slider */}
          {!isMobile ? (
            <>
              <Slider {...settings}>
                {testimonials.map((testimonial) => (
                  <div key={testimonial._id} className="px-3 my-6"> {/* Reduced margin and padding */}
                    <div className="text-[#4A2C2A] rounded-[16px] shadow-lg py-8 px-6 text-center bg-white hover:shadow-xl w-full min-h-[240px] max-h-[280px] flex flex-col justify-between"> {/* Reduced padding, added height constraints and flex column */}
                      <div>
                        <StarRating rating={testimonial.rating} />
                        <p className="text-gray-700 text-base leading-relaxed mb-4 line-clamp-4 px-2"> {/* Added line clamp */}
                          "{testimonial.comments}"
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900 font-fontcontent text-lg mt-auto">— {testimonial.name}</p>
                    </div>
                  </div>
                ))}
              </Slider>

              {/* <div className="flex justify-center mt-6">
                <button className="bg-bgvariant-2 cursor-pointer text-white px-6 py-2 rounded-md shadow-sm">View All</button>
              </div> */}
            </>
          ) : (
            // ✅ Mobile View - Remove slider and show stacked layout
            <div className="grid grid-cols-1 gap-6"> {/* Reduced gap */}
              {testimonials.map((testimonial) => (
                
                <div
                  key={testimonial._id}
                  className="relative text-[#4A2C2A] rounded-[20px] shadow-md py-6 px-5 text-center bg-white transition duration-300 hover:shadow-lg w-full" 
                >
                  <div className="mt-4"> {/* Added margin top for spacing */}
                    <p className="font-semibold text-gray-900 text-lg mb-2">
                      — {testimonial.name}
                    </p>
                    <StarRating rating={testimonial.rating} />
                  </div>
                  <p className="text-gray-700 text-base leading-relaxed font-fontcontent mb-3 line-clamp-4 px-2">
                    "{testimonial.comments}"
                  </p>
                  
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;