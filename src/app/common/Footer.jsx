"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaFacebook, FaInstagram, FaYoutube, FaWhatsapp, FaEnvelope } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { fetchWebSettings } from "@/app/store/webSettingsSlice";
import { fetchNavbarData } from "@/app/store/navbarSlice";

const FOOTER_PARTICLES = [
  { left: "5.2%", top: "12.4%", x: [0, 3, 0], y: [0, -3, 0], duration: 3.5, delay: 0.2 },
  { left: "15.8%", top: "78.1%", x: [0, -3, 0], y: [0, 3, 0], duration: 4.2, delay: 0.8 },
  { left: "25.3%", top: "34.7%", x: [0, 3, 0], y: [0, 3, 0], duration: 2.8, delay: 1.4 },
  { left: "35.9%", top: "89.2%", x: [0, -3, 0], y: [0, -3, 0], duration: 4.6, delay: 0.5 },
  { left: "45.1%", top: "22.5%", x: [0, 3, 0], y: [0, -3, 0], duration: 3.1, delay: 1.8 },
  { left: "55.7%", top: "65.3%", x: [0, -3, 0], y: [0, 3, 0], duration: 4.9, delay: 0.3 },
  { left: "65.4%", top: "15.8%", x: [0, 3, 0], y: [0, 3, 0], duration: 2.5, delay: 1.1 },
  { left: "75.2%", top: "82.4%", x: [0, -3, 0], y: [0, -3, 0], duration: 3.8, delay: 1.6 },
  { left: "85.6%", top: "45.9%", x: [0, 3, 0], y: [0, -3, 0], duration: 4.4, delay: 0.7 },
  { left: "95.1%", top: "28.3%", x: [0, -3, 0], y: [0, 3, 0], duration: 2.9, delay: 1.3 },
  { left: "10.4%", top: "52.6%", x: [0, 3, 0], y: [0, 3, 0], duration: 3.7, delay: 0.9 },
  { left: "20.7%", top: "92.1%", x: [0, -3, 0], y: [0, -3, 0], duration: 4.1, delay: 0.4 },
  { left: "30.5%", top: "18.7%", x: [0, 3, 0], y: [0, -3, 0], duration: 2.6, delay: 1.7 },
  { left: "40.8%", top: "61.3%", x: [0, -3, 0], y: [0, 3, 0], duration: 4.8, delay: 0.1 },
  { left: "50.2%", top: "42.9%", x: [0, 3, 0], y: [0, 3, 0], duration: 3.3, delay: 1.5 },
  { left: "60.9%", top: "85.4%", x: [0, -3, 0], y: [0, -3, 0], duration: 4.5, delay: 0.6 },
  { left: "70.3%", top: "31.2%", x: [0, 3, 0], y: [0, -3, 0], duration: 2.7, delay: 1.2 },
  { left: "80.6%", top: "73.8%", x: [0, -3, 0], y: [0, 3, 0], duration: 3.9, delay: 1.9 },
  { left: "90.1%", top: "58.5%", x: [0, 3, 0], y: [0, 3, 0], duration: 4.7, delay: 0.8 },
  { left: "98.4%", top: "91.2%", x: [0, -3, 0], y: [0, -3, 0], duration: 3.2, delay: 1.0 },
];

export default function Footer() {
  const mounted = true;
  const dispatch = useDispatch();
  const [hoveredSocial, setHoveredSocial] = useState(null);
  
  const rawCategories = useSelector((state) => state.navbar.categories);
  const categories = Array.isArray(rawCategories)
    ? rawCategories.filter((category) => typeof category?.categoryTitle === "string" && category.categoryTitle.trim())
    : [];
  const { logo } = useSelector((state) => state.webSettings);

  useEffect(() => {
    dispatch(fetchWebSettings());
    dispatch(fetchNavbarData());
  }, [dispatch]);

  const particles = FOOTER_PARTICLES.map((p, i) => (
    <motion.div
      key={i}
      className="absolute w-[2px] h-[2px] bg-green-400 rounded-full"
      initial={{ opacity: 0 }}
      style={{ left: p.left, top: p.top }}
      animate={{
        scale: [0.3, 0.8, 0.3],
        opacity: [0, 0.6, 0],
        x: p.x,
        y: p.y,
        boxShadow: ["0 0 0 rgba(74,163,50,0)", "0 0 4px rgba(74,163,50,0.8)", "0 0 0 rgba(74,163,50,0)"],
      }}
      transition={{ duration: p.duration, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: p.delay }}
    />
  ));

  const socialIcons = {
    facebook: <FaFacebook className="text-xl" />,
    instagram: <FaInstagram className="text-xl" />,
    youtube: <FaYoutube className="text-xl" />,
  };

  const footerConfig = {
    socialLinks: [
      { name: "facebook", label: "Facebook", url: "https://www.facebook.com/" },
      { name: "instagram", label: "Instagram", url: "https://www.instagram.com/" },
      { name: "youtube", label: "YouTube", url: "https://www.youtube.com/" },
    ],
  };

  return (
    <footer className="bg-[#1a4a13] border-t border-[#2d5a20] text-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
        {mounted && particles}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <div className="bg-white px-2.5 py-1 rounded-xl inline-flex items-center justify-center shadow-sm w-[170px] sm:w-[190px] md:w-[210px] h-[50px] sm:h-[54px]">
                <Image
                  src={logo || "/logo.png"}
                  alt="Agrowmed Logo"
                  width={220}
                  height={58}
                  className="object-contain w-full h-full"
                />
              </div>
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed">
              Your trusted agriculture marketplace for quality products delivered to your farm.
            </p>
            <div className="flex gap-3 pt-1">
              {footerConfig.socialLinks.map(({ name, label, url }) => (
                <motion.a key={name} href={url} target="_blank" rel="noopener noreferrer" className="relative group" onMouseEnter={() => setHoveredSocial(name)} onMouseLeave={() => setHoveredSocial(null)} whileHover={{ y: -3 }}>
                  <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center group-hover:border-green-400 group-hover:bg-green-400/10 transition-all duration-300">
                    <span className="text-white group-hover:text-green-300 transition-colors duration-300">{socialIcons[name]}</span>
                  </div>
                </motion.a>
              ))}
            </div>
            <p className="text-yellow-400 text-xs font-medium">🌱 Trusted by 10,000+ Farmers across India</p>
          </div>

          <div>
            <h3 className="text-white font-semibold text-base mb-4 border-b border-green-700 pb-2">Quick Links</h3>
            <ul className="space-y-0">
              {[{ name: "Home", path: "/" }, ...categories.map((c) => ({ name: c.categoryTitle, path: `/shoppage?category=${encodeURIComponent(c.categoryTitle)}` })), { name: "About Us", path: "/aboutuspage" }, { name: "Contact", path: "/contactpage" }].map((link) => (
                <li key={link.name}><Link href={link.path} className="text-gray-300 text-sm hover:text-green-300 transition-colors block mb-2">{link.name}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-base mb-4 border-b border-green-700 pb-2">Customer Support</h3>
            <ul className="space-y-0">
              {[{ name: "My Account", path: "/accountpage/account" }, { name: "My Orders", path: "/accountpage/orders" }, { name: "Wishlist", path: "/whishlist" }, { name: "Cart", path: "/cart" }].map((link) => (
                <li key={link.name}><Link href={link.path} className="text-gray-300 text-sm hover:text-green-300 transition-colors block mb-2">{link.name}</Link></li>
              ))}
              <li><div className="border-t border-green-800 my-2" /></li>
              {[{ name: "Privacy Policy", path: "/privacypolicy" }, { name: "Return Policy", path: "/returnpolicy" }, { name: "Shipping Policy", path: "/shippingpolicy" }, { name: "Terms & Conditions", path: "/termsandcondition" }].map((link) => (
                <li key={link.name}><Link href={link.path} className="text-gray-300 text-sm hover:text-green-300 transition-colors block mb-2">{link.name}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-base mb-4 border-b border-green-700 pb-2">Get In Touch</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <FaEnvelope className="text-green-400 mt-0.5 shrink-0" />
                <a href="mailto:sales@agrowmed.com" className="text-gray-300 text-xs break-all hover:text-green-300">sales@agrowmed.com</a>
              </li>
              <li className="flex items-start gap-3">
                <FaWhatsapp className="text-green-400 mt-0.5 shrink-0" />
                <a href="tel:+919344430739" className="text-gray-300 text-xs hover:text-green-300">+91 93444 30739</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-green-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">© {new Date().getFullYear()} Agrowmed. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <Link href="/privacypolicy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/returnpolicy" className="hover:text-white">Return Policy</Link>
            <Link href="/shippingpolicy" className="hover:text-white">Shipping Policy</Link>
            <Link href="/termsandcondition" className="hover:text-white">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
