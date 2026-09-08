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
        // Unwrap data from standard response format
        const data = res?.data !== undefined ? res.data : res;
        setAboutData(data);
      } catch (err) {
        console.error("Failed to fetch About Us data:", err);
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

  const hasBanner = Boolean(
    aboutData?.bannerTitle || aboutData?.bannerContent || aboutData?.bannerImage
  );
  const hasContentSections = Boolean(
    Array.isArray(aboutData?.content) && aboutData.content.length > 0
  );

  return (
    <section className="relative py-12 px-4 sm:px-6 lg:px-8 overflow-hidden animate-fadeIn font-fontcontent bg-gradient-to-b from-green-50/40 via-white to-green-50/20">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Title */}
        <div className="mb-10 flex flex-col items-center text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-green-700 bg-green-100 px-3 py-1 rounded-full mb-3">
            Our Story & Vision
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-fonttitle text-bgvariant-3 mb-4">
            {aboutData?.bannerTitle || (
              <>
                About <span className="text-bgvariant-1">Agrowmed</span>
              </>
            )}
          </h1>
          <div className="w-24 h-1.5 bg-gradient-to-r from-bgvariant-1 via-bgvariant-4 to-bgvariant-2 rounded-full"></div>
          {aboutData?.bannerContent && (
            <p className="max-w-3xl mt-6 text-base sm:text-lg text-gray-700 leading-relaxed text-center">
              {aboutData.bannerContent}
            </p>
          )}
        </div>

        {/* Banner Image if available */}
        {aboutData?.bannerImage && (
          <div className="mb-16 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
            <img
              src={aboutData.bannerImage}
              alt={aboutData.bannerTitle || "About Agrowmed"}
              className="w-full h-72 sm:h-96 md:h-[450px] object-cover"
            />
          </div>
        )}

        {/* Dynamic Content Sections */}
        {hasContentSections ? (
          <div className="space-y-16 sm:space-y-24 mb-16">
            {aboutData.content.map((item, index) => {
              const hasImage = Boolean(item.contentImage);
              const isEven = index % 2 === 0;

              return (
                <div
                  key={item._id || index}
                  className={`flex flex-col ${
                    hasImage
                      ? isEven
                        ? "lg:flex-row"
                        : "lg:flex-row-reverse"
                      : "lg:flex-row justify-center"
                  } items-center gap-8 lg:gap-14`}
                >
                  {/* Image Block */}
                  {hasImage && (
                    <div className="w-full lg:w-1/2 relative group">
                      <div className="relative rounded-3xl overflow-hidden shadow-xl border-2 border-green-100 bg-white">
                        <img
                          src={item.contentImage}
                          alt={item.contentTitle || "About Us Section"}
                          className="w-full h-72 sm:h-80 md:h-96 object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>

                      {/* Decorative Nature Icons */}
                      <div className="natural-element absolute -top-4 -left-4 w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full shadow-lg flex items-center justify-center border border-green-100">
                        <GiChestnutLeaf className="text-green-700 text-2xl sm:text-3xl" />
                      </div>
                      <div className="natural-element absolute -bottom-4 -right-4 w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full shadow-lg flex items-center justify-center border border-yellow-100">
                        <IoFlower className="text-yellow-400 text-2xl sm:text-3xl" />
                      </div>
                    </div>
                  )}

                  {/* Text Content Block */}
                  <div className={`w-full ${hasImage ? "lg:w-1/2" : "max-w-3xl text-center"}`}>
                    {item.contentTitle && (
                      <h3 className="text-2xl sm:text-3xl font-bold text-bgvariant-3 mb-4 leading-snug">
                        {item.contentTitle}
                      </h3>
                    )}
                    {item.contentDescription && (
                      <p className="text-gray-700 text-base sm:text-lg leading-relaxed whitespace-pre-line">
                        {item.contentDescription}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : !hasBanner ? (
          /* Empty state when no data is saved yet */
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-green-100 shadow-sm mb-16 max-w-2xl mx-auto">
            <GiChestnutLeaf className="mx-auto text-5xl text-green-600 mb-4 opacity-70" />
            <h3 className="text-xl font-bold text-bgvariant-3 mb-2">
              Our Story is Growing
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              We are constantly working to bring you the best agricultural products, expert guidance, and farm-friendly solutions across India.
            </p>
            <Link href="/shoppage">
              <button className="bg-bgvariant-1 hover:bg-bgvariant-4 text-white font-semibold py-2.5 px-6 rounded-xl transition-all duration-300">
                Explore Products
              </button>
            </Link>
          </div>
        ) : null}

        {/* Shop CTA */}
        <div className="text-center mt-12 mb-16">
          <Link href="/shoppage">
            <button className="bg-bgvariant-1 hover:bg-bgvariant-4 text-white font-semibold py-3.5 px-10 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 inline-flex items-center gap-2 text-base">
              <span>Shop Farm Products</span>
              <span>🌾</span>
            </button>
          </Link>
        </div>

        {/* Support Highlights */}
        <div className="py-6 border-t border-green-100">
          <Support />
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
