"use client";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { FiTruck, FiHeadphones, FiCheckCircle, FiShield } from "react-icons/fi";

const features = [
  {
    id: 1,
    icon: <FiCheckCircle className="text-4xl text-bgvariant-1" />,
    title: "100% Genuine Products",
    desc: "Certified seeds, authentic crop protection & nutrients.",
    aos: "fade-up",
  },
  {
    id: 2,
    icon: <FiTruck className="text-4xl text-bgvariant-1" />,
    title: "Fast Farm Delivery",
    desc: "Quick, reliable delivery directly to your doorstep.",
    aos: "fade-up",
  },
  {
    id: 3,
    icon: <FiHeadphones className="text-4xl text-bgvariant-1" />,
    title: "Agri Expert Support",
    desc: "Expert advisory for crops, pests & plant health.",
    aos: "fade-up",
  },
  {
    id: 4,
    icon: <FiShield className="text-4xl text-bgvariant-1" />,
    title: "Secure & Trusted",
    desc: "Safe payments and transparent pricing guaranteed.",
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
