import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useDispatch, useSelector } from "react-redux";

const HeroSection = () => {
  // const { homeData } = useHomeStore();

  const { homeData, loading } = useSelector(
    (state) => state.home
  );

  const banners = homeData?.topBannerDatas?.data?.filter(item => item.status === "active") || [];

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
    { src: "/hero.webp", alt: "Natural Foods Banner 1" },
    { src: "/hero2.png", alt: "Natural Foods Banner 2" },
    { src: "/hero3.png", alt: "Natural Foods Banner 3" },
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
    </div>
  );
};

export default HeroSection;
