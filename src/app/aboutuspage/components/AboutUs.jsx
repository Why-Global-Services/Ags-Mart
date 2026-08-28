"use client";

import { useState, useEffect } from "react";
import Support from "/src/app/component/Support.jsx";
import { GiChestnutLeaf, GiFlowerPot } from "react-icons/gi";
import { IoFlower } from "react-icons/io5";
import Loading from "@/app/common/Loading";
import Link from "next/link";
import { getAboutUs } from "@/app/interceptor/interseptor";

const AboutUs = () => {
  const [loading, setLoading] = useState(true);
  const [aboutData, setAboutData] = useState(null);

  // Fetch backend data
  useEffect(() => {
    const fetchAboutUs = async () => {
      try {
        const res = await getAboutUs();
        setAboutData(res?.data);
      } catch (err) {
        console.error("Failed to fetch About Us", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAboutUs();
  }, []);

  // Icon animation
  useEffect(() => {
    if (!loading) {
      const elements = document.querySelectorAll(".natural-element");
      elements.forEach((el, index) => {
        setTimeout(() => el.classList.add("animate-float"), index * 200);
      });
    }
  }, [loading]);

  if (loading) {
    return <Loading />;
  }

  return (
    <section className="relative py-10 px-4 overflow-hidden animate-fadeIn font-fontcontent">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div
          className="mb-6 flex flex-col items-center text-center"
          data-aos="fade-up"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-normal font-fonttitle text-gray-900 mb-3 px-4">
            About <span className="text-bgvariant-1">Us</span>
          </h2>
          <div className="w-20 sm:w-24 h-1 sm:h-1.5 bg-gradient-to-r from-bgvariant-1 via-bgvariant-4 to-bgvariant-2 rounded-full"></div>
        </div>

        {/* Dynamic content blocks */}
        {aboutData?.content?.map((item, index) => (
          <div
            key={item._id}
            className={`flex flex-col ${
              index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
            } items-center gap-12 mb-20`}
          >
            {/* Image */}
            <div className="lg:w-1/2 relative group">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={item.contentImage}
                  alt={item.contentTitle}
                  className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              {/* Decorative icons (same for all images) */}
              <div className="natural-element absolute -top-5 -left-5 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center">
                <GiChestnutLeaf className="text-green-700 text-4xl" />
              </div>
              <div className="natural-element absolute -bottom-5 -right-5 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center">
                <IoFlower className="text-yellow-300 text-4xl" />
              </div>
              <div className="natural-element absolute top-1/2 -right-6 w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center">
                <GiFlowerPot className="text-amber-900 text-4xl" />
              </div>
            </div>

            {/* Text */}
            <div className="lg:w-1/2">
              <h3 className="text-2xl font-bold text-emerald-800 mb-4">
                {item.contentTitle}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {item.contentDescription}
              </p>
            </div>
          </div>
        ))}

        {/* Shop Button */}
        <div className="text-center mt-10">
          <Link href="/shoppage">
            <button className="bg-bgvariant-1 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
              Shop Now !!!
            </button>
          </Link>
        </div>

        <div className="py-5">
          <Support />
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
