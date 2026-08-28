"use client";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { FiTruck, FiHeadphones, FiGift, FiLock } from "react-icons/fi";

const features = [
  {
    id: 1,
    icon: <FiTruck className="text-5xl text-emerald-800" />,
    title: "On Time Delivery",
    desc: "Get your orders delivered on time, every time.",
    aos: "fade-up",
  },
  {
    id: 2,
    icon: <FiHeadphones className="text-5xl text-emerald-800" />,
    title: "24x7 Support",
    desc: "We’re here for you 24/7 to assist with any queries.",
    aos: "fade-up",
  },
  {
    id: 3,
    icon: <FiGift className="text-5xl text-emerald-800" />,
    title: "Coupons",
    desc: "Apply coupons at checkout and enjoy instant savings on your order.",
    aos: "fade-up",
  },
  {
    id: 4,
    icon: <FiLock className="text-5xl text-emerald-800" />,
    title: "Secure Payment",
    desc: "Enjoy safe and encrypted transactions every time.",
    aos: "fade-up",
  },
];

export default function ServiceHighlights() {
  useEffect(() => {
    AOS.init({
      duration: 900,
      once: true,
      easing: "ease-in-out",
    });
  }, []);

  return (
    <section className="py-8">
      <div className="max-w-5xl mx-auto px-6 sm:px-10">
        {/* Changed here: grid-cols-2 for mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 transform scale-105 transition duration-500">
          {features.map((item, index) => (
            <div
              key={item.id}
              data-aos={item.aos}
              data-aos-delay={index * 100}
              className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-2 lg:p-6 text-center flex flex-col items-center"
            >
              <div className="bg-green-50 hover:bg-green-100 p-4 rounded-full mb-4 transition-all">
                {item.icon}
              </div>

              <h3 className="text-sm md:text-lg font-semibold text-gray-900 mb-2 hover:text-green-700 transition-colors">
                {item.title}
              </h3>

              <p className="text-gray-600 text-xs sm:text-sm">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
