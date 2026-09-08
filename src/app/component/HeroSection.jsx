import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useDispatch, useSelector } from "react-redux";
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const HeroSection = () => {
  // const { homeData } = useHomeStore();

  const { homeData, loading } = useSelector(
    (state) => state.home
  );

  const rawBanners = Array.isArray(homeData?.topBannerDatas)
    ? homeData.topBannerDatas
    : Array.isArray(homeData?.topBannerDatas?.data)
    ? homeData.topBannerDatas.data
    : [];
  const banners = rawBanners.filter(item => item?.status === "active");

  const bannerImages = banners.map(banner => {
    let link = banner?.link || null;

    // Fix: ensure internal routes start with "/"
    if (link && !link.startsWith("http") && !link.startsWith("/")) {
      link = "/" + link;
    }

    return {
      src: banner.bgImage,
      alt: banner.title || "Promotional Banner",
      link
    };
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (bannerImages.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % bannerImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [bannerImages.length]);

  const images = bannerImages.length > 0 ? bannerImages : [
    { src: "/hero.webp", alt: "Agrowmed Agriculture Fields & Crops" },
    { src: "/hero2.png", alt: "Agrowmed Harvest & Farm Equipment" },
    { src: "/hero3.png", alt: "Agrowmed Sustainable Agriculture" },
  ];

  const currentImage = images[currentIndex];

  return (
    <div className="w-full relative">
      {currentImage.link ? (
        <Link href={currentImage.link} className="block">
          <Image
            src={currentImage.src}
            alt={currentImage.alt}
            width={1920}
            height={850}
            className="w-full h-auto object-cover"
          />
        </Link>
      ) : (
        <Image
          src={currentImage.src}
          alt={currentImage.alt}
          width={1920}
          height={850}
          className="w-full h-auto object-cover"
        />
      )}

      {/* Left Arrow */}
      <button
        onClick={() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-bgvariant-1 hover:bg-bgvariant-3 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-all duration-200 opacity-80 hover:opacity-100"
        aria-label="Previous banner"
      >
        <FaChevronLeft size={16} />
      </button>

      {/* Right Arrow */}
      <button
        onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-bgvariant-1 hover:bg-bgvariant-3 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-all duration-200 opacity-80 hover:opacity-100"
        aria-label="Next banner"
      >
        <FaChevronRight size={16} />
      </button>

      {/* Dot Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? 'bg-bgvariant-1 scale-125'
                  : 'bg-white/70 hover:bg-white'
              }`}
              aria-label={`Go to banner ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroSection;
