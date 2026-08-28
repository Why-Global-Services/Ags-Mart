"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaFacebook, FaInstagram, FaYoutube, FaWhatsapp, FaEnvelope } from "react-icons/fa";
import { FaTwitter, FaLocationDot } from "react-icons/fa6";
import Link from "next/link";
import { motion } from "framer-motion";
import { fetchAdminProfile } from "@/app/store/adminProfileSlice";
import { fetchWebSettings } from "@/app/store/webSettingsSlice";



export default function Footer() {
  const dispatch = useDispatch();
  const [hoveredSocial, setHoveredSocial] = useState(null);
  
  // Select from Redux store
  const categories = useSelector((state) => state.navbar.categories);
  const { address, primaryEmail, secondaryEmail, contactNumber } = useSelector(
    (state) => state.adminProfile
  );
  const { logo } = useSelector((state) => state.webSettings);

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchAdminProfile());
    dispatch(fetchWebSettings());
  }, [dispatch]);

  // Gold glowing moving dots animation (same as navbar)
  const particles = Array.from({ length: 20 }).map((_, i) => (
    <motion.div
      key={i}
      className="absolute w-[2px] h-[2px] bg-[#FFD700] rounded-full"
      initial={{ opacity: 0 }}
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
      animate={{
        scale: [0.3, 0.8, 0.3],
        opacity: [0, 0.6, 0],
        x: Math.random() > 0.5 ? [0, 3, 0] : [0, -3, 0],
        y: Math.random() > 0.5 ? [0, 3, 0] : [0, -3, 0],
        boxShadow: [
          "0 0 0 rgba(255,215,0,0)",
          "0 0 4px rgba(255,215,0,0.8)",
          "0 0 0 rgba(255,215,0,0)",
        ],
      }}
      transition={{
        duration: Math.random() * 3 + 2,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
        delay: Math.random() * 2,
      }}
    />
  ));

  // Social icons with hover effects
  const socialIcons = {
    facebook: <FaFacebook className="text-xl transition-all duration-300" />,
    instagram: <FaInstagram className="text-xl transition-all duration-300" />,
    youtube: <FaYoutube className="text-xl transition-all duration-300" />,
    whatsapp: <FaWhatsapp className="text-xl transition-all duration-300" />,
    email: <FaEnvelope className="text-xl transition-all duration-300" />,
    location: <FaLocationDot className="text-xl transition-all duration-300" />,
  };

  const footerConfig = {
    socialLinks: [
      { name: "facebook", label: "Facebook", url: "https://www.facebook.com/" },
      { name: "instagram", label: "Instagram", url: "https://www.instagram.com/" },
      { name: "youtube", label: "YouTube", url: "https://www.youtube.com/" },
    ],
  };

  return (
    <footer className="bg-[#111B30] border-t border-[#2A3A5A] text-white relative overflow-hidden">
      {/* Animated Particles Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
        {particles}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 lg:gap-12">
          {/* Logo & Description Column */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <img
                src={logo || "/logo.jpg"}
                alt="Povi Collections Logo"
                className="w-56 h-auto object-contain bg-white/10 p-3 rounded-xl backdrop-blur-sm"
              />
            </Link>
            
            <p className="text-gray-300 text-sm leading-relaxed">
              Ethically crafted jewellery inspired by beauty, grace, and authenticity.
            </p>

            {/* Social Media Icons */}
            <div className="flex gap-3 pt-2">
              {footerConfig.socialLinks.map(({ name, label, url }) => (
                <motion.a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow us on ${label}`}
                  className="relative group"
                  onMouseEnter={() => setHoveredSocial(name)}
                  onMouseLeave={() => setHoveredSocial(null)}
                  whileHover={{ y: -3 }}
                >
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-[#D4AF37] group-hover:bg-[#D4AF37]/10 transition-all duration-300">
                    <span className="text-white group-hover:text-[#D4AF37] transition-colors duration-300">
                      {socialIcons[name]}
                    </span>
                  </div>
                  {hoveredSocial === name && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[#1E293B] text-xs text-white px-2 py-1 rounded whitespace-nowrap"
                    >
                      {label}
                    </motion.div>
                  )}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-white border-l-4 border-[#D4AF37] pl-3">QUICK LINKS</h3>
            <ul className="space-y-3 text-sm">
              {[
                { name: "Home", path: "/" },
                { name: "About Us", path: "/aboutuspage" },
                { name: "Contact Us", path: "/contactpage" },
                { name: "Shipping Policy", path: "/shippingpolicy" },
                { name: "Return Policy", path: "/returnpolicy" },
                { name: "Terms & Conditions", path: "/termsandcondition" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.path}
                    className="flex items-center gap-2 text-gray-300 hover:text-[#D4AF37] transition-colors duration-200 group"
                  >
                    <div className="w-1 h-1 bg-[#D4AF37] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop By Column */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-white border-l-4 border-[#D4AF37] pl-3">SHOP BY</h3>
            <ul className="space-y-3 text-sm">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat._id}>
                  <Link
                    href={`/shoppage?category=${cat.categoryTitle}`}
                    className="flex items-center gap-2 text-gray-300 hover:text-[#D4AF37] transition-colors duration-200 group"
                  >
                    <div className="w-1 h-1 bg-[#D4AF37] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {cat.categoryTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info Column */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-white border-l-4 border-[#D4AF37] pl-3">CONTACT US</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3 group">
                <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center group-hover:bg-[#D4AF37]/20 transition-all duration-300">
                  <FaWhatsapp className="text-[#25D366] text-lg" />
                </div>
                <div>
                  <p className="font-medium text-white">WhatsApp</p>
                  <p className="text-gray-300">{contactNumber || "Not available"}</p>
                </div>
              </li>
              
              <li className="flex items-start gap-3 group">
                <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center group-hover:bg-[#D4AF37]/20 transition-all duration-300">
                  <FaEnvelope className="text-white text-lg" />
                </div>
                <div>
                  <p className="font-medium text-white">Email</p>
                  <p className="text-gray-300 break-all text-xs">{primaryEmail || "info@povi.com"}</p>
                </div>
              </li>
              
              <li className="flex items-start gap-3 group">
                <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center group-hover:bg-[#D4AF37]/20 transition-all duration-300">
                  <FaLocationDot className="text-white text-lg" />
                </div>
                <div>
                  <p className="font-medium text-white">Address</p>
                  <p className="text-gray-300 text-xs leading-relaxed">{address || "Bangalore, India"}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-[#2A3A5A]"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-gray-400 text-sm">
              Copyright © 2025{" "}
              <span className="font-bold text-[#D4AF37]">Povi's Collection</span>. All Rights Reserved.
            </p>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <Link 
              href="/privacypolicy" 
              className="text-gray-300 hover:text-[#D4AF37] transition-colors duration-200"
            >
              Privacy Policy
            </Link>
            <span className="text-gray-500">|</span>
            <p className="text-gray-400">
              Developed by{" "}
              <a
                href="https://whyglobalservices.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#D4AF37] hover:underline"
              >
                Why Global Services
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Floating decorative element */}
      <div className="absolute bottom-4 right-4 opacity-10">
        <div className="w-32 h-32 border-2 border-[#D4AF37] rounded-full"></div>
      </div>
    </footer>
  );
}


// "use client";
// import { useEffect, useState, useRef } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { FaFacebook, FaInstagram, FaYoutube, FaWhatsapp, FaEnvelope } from "react-icons/fa";
// import { FaTwitter, FaLocationDot } from "react-icons/fa6";
// import Link from "next/link";
// import { motion } from "framer-motion";
// import { fetchAdminProfile } from "@/app/store/adminProfileSlice";
// import { fetchWebSettings } from "@/app/store/webSettingsSlice";

// export default function Footer() {
//   const dispatch = useDispatch();
//   const [hoveredSocial, setHoveredSocial] = useState(null);
//   const footerRef = useRef(null);
  
//   // Select from Redux store
//   const categories = useSelector((state) => state.navbar.categories);
//   const { address, primaryEmail, secondaryEmail, contactNumber } = useSelector(
//     (state) => state.adminProfile
//   );
//   const { logo } = useSelector((state) => state.webSettings);

//   // Fetch data on mount
//   useEffect(() => {
//     dispatch(fetchAdminProfile());
//     dispatch(fetchWebSettings());
//   }, [dispatch]);

//   // Enhanced glitter particle effects (more visible)
//   const GlitterParticle = ({ index }) => {
//     const [position, setPosition] = useState({ x: 0, y: 0 });
    
//     useEffect(() => {
//       if (footerRef.current) {
//         const { width, height } = footerRef.current.getBoundingClientRect();
//         setPosition({
//           x: Math.random() * width,
//           y: Math.random() * height
//         });
//       }
//     }, []);

//     const size = Math.random() * 3 + 1; // 1-4px
//     const duration = Math.random() * 3 + 2; // 2-5 seconds
//     const delay = Math.random() * 2;
    
//     return (
//       <motion.div
//         className="absolute rounded-full"
//         style={{
//           left: position.x,
//           top: position.y,
//           width: size,
//           height: size,
//           background: `radial-gradient(circle, #FFD700 ${size/2}px, rgba(255, 215, 0, 0.8))`,
//           boxShadow: `0 0 ${size * 2}px #FFD700`,
//         }}
//         animate={{
//           opacity: [0, 1, 0],
//           scale: [0.3, 1, 0.3],
//           x: position.x + (Math.random() > 0.5 ? [0, 5, 0] : [0, -5, 0]),
//           y: position.y + (Math.random() > 0.5 ? [0, 5, 0] : [0, -5, 0]),
//           boxShadow: [
//             "0 0 0px rgba(255, 215, 0, 0)",
//             `0 0 ${size * 3}px rgba(255, 215, 0, 0.8)`,
//             "0 0 0px rgba(255, 215, 0, 0)"
//           ],
//         }}
//         transition={{
//           duration: duration,
//           repeat: Infinity,
//           repeatType: "reverse",
//           ease: "easeInOut",
//           delay: delay,
//         }}
//       />
//     );
//   };

//   // Social icons with hover effects
//   const socialIcons = {
//     facebook: <FaFacebook className="text-xl transition-all duration-300" />,
//     instagram: <FaInstagram className="text-xl transition-all duration-300" />,
//     youtube: <FaYoutube className="text-xl transition-all duration-300" />,
//     whatsapp: <FaWhatsapp className="text-xl transition-all duration-300" />,
//     email: <FaEnvelope className="text-xl transition-all duration-300" />,
//     location: <FaLocationDot className="text-xl transition-all duration-300" />,
//   };

//   const footerConfig = {
//     socialLinks: [
//       { name: "facebook", label: "Facebook", url: "https://www.facebook.com/" },
//       { name: "instagram", label: "Instagram", url: "https://www.instagram.com/" },
//       { name: "youtube", label: "YouTube", url: "https://www.youtube.com/ },
//     ],
//   };

//   return (
//     <footer 
//       ref={footerRef}
//       className="bg-[#111B30] border-t border-[#2A3A5A] text-white relative overflow-hidden min-h-[400px]"
//     >
//       {/* Enhanced Glitter Particles (More Visible) */}
//       <div className="absolute inset-0 pointer-events-none overflow-hidden">
//         {Array.from({ length: 40 }).map((_, index) => (
//           <GlitterParticle key={index} index={index} />
//         ))}
//       </div>

//       {/* Additional floating glitter effect */}
//       <div className="absolute inset-0 pointer-events-none">
//         <motion.div
//           className="absolute w-[4px] h-[4px] bg-[#FFD700] rounded-full"
//           style={{
//             left: "10%",
//             top: "30%",
//           }}
//           animate={{
//             opacity: [0, 1, 0],
//             scale: [0.5, 1.2, 0.5],
//             x: [0, 50, 0],
//             y: [0, -20, 0],
//             boxShadow: [
//               "0 0 0px rgba(255, 215, 0, 0)",
//               "0 0 15px rgba(255, 215, 0, 1)",
//               "0 0 0px rgba(255, 215, 0, 0)"
//             ],
//           }}
//           transition={{
//             duration: 4,
//             repeat: Infinity,
//             repeatType: "reverse",
//             delay: 0.5,
//           }}
//         />
//         <motion.div
//           className="absolute w-[3px] h-[3px] bg-[#FFD700] rounded-full"
//           style={{
//             right: "15%",
//             top: "40%",
//           }}
//           animate={{
//             opacity: [0, 1, 0],
//             scale: [0.3, 1, 0.3],
//             x: [0, -40, 0],
//             y: [0, 30, 0],
//             boxShadow: [
//               "0 0 0px rgba(255, 215, 0, 0)",
//               "0 0 12px rgba(255, 215, 0, 0.8)",
//               "0 0 0px rgba(255, 215, 0, 0)"
//             ],
//           }}
//           transition={{
//             duration: 3.5,
//             repeat: Infinity,
//             repeatType: "reverse",
//             delay: 1.2,
//           }}
//         />
//         <motion.div
//           className="absolute w-[2px] h-[2px] bg-[#FFD700] rounded-full"
//           style={{
//             left: "40%",
//             bottom: "25%",
//           }}
//           animate={{
//             opacity: [0, 1, 0],
//             scale: [0.2, 0.8, 0.2],
//             x: [0, 30, 0],
//             y: [0, -25, 0],
//             boxShadow: [
//               "0 0 0px rgba(255, 215, 0, 0)",
//               "0 0 8px rgba(255, 215, 0, 0.6)",
//               "0 0 0px rgba(255, 215, 0, 0)"
//             ],
//           }}
//           transition={{
//             duration: 3,
//             repeat: Infinity,
//             repeatType: "reverse",
//             delay: 2,
//           }}
//         />
//       </div>

//       <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//         <div className="grid md:grid-cols-4 gap-8 lg:gap-12">
//           {/* Logo & Description Column */}
//           <div className="space-y-6">
//             <Link href="/" className="inline-block">
//               <motion.div
//                 whileHover={{ scale: 1.05 }}
//                 transition={{ type: "spring", stiffness: 300 }}
//               >
//                 <img
//                   src={logo || "/logo.jpg"}
//                   alt="Povi's Collections Logo"
//                   className="w-56 h-auto object-contain bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-[#D4AF37]/30"
//                 />
//               </motion.div>
//             </Link>
            
//             <p className="text-gray-300 text-sm leading-relaxed">
//               Ethically crafted jewellery inspired by beauty, grace, and authenticity.
//             </p>

//             {/* Social Media Icons */}
//             <div className="flex gap-3 pt-2">
//               {footerConfig.socialLinks.map(({ name, label, url }) => (
//                 <motion.a
//                   key={name}
//                   href={url}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   aria-label={`Follow us on ${label}`}
//                   className="relative group"
//                   onMouseEnter={() => setHoveredSocial(name)}
//                   onMouseLeave={() => setHoveredSocial(null)}
//                   whileHover={{ scale: 1.1, rotate: 5 }}
//                   whileTap={{ scale: 0.95 }}
//                 >
//                   <motion.div 
//                     className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-[#D4AF37] group-hover:bg-[#D4AF37]/10 transition-all duration-300"
//                     whileHover={{
//                       boxShadow: "0 0 20px rgba(212, 175, 55, 0.3)"
//                     }}
//                   >
//                     <span className="text-white group-hover:text-[#D4AF37] transition-colors duration-300">
//                       {socialIcons[name]}
//                     </span>
//                   </motion.div>
                  
//                   {/* Glitter effect on hover */}
//                   <motion.div
//                     className="absolute inset-0 rounded-lg pointer-events-none"
//                     initial={{ opacity: 0 }}
//                     animate={{
//                       opacity: hoveredSocial === name ? [0, 0.5, 0] : 0,
//                       scale: [1, 1.5, 1],
//                     }}
//                     transition={{
//                       duration: 1,
//                       repeat: Infinity,
//                     }}
//                     style={{
//                       background: "radial-gradient(circle, rgba(255,215,0,0.2) 0%, transparent 70%)",
//                     }}
//                   />
                  
//                   {hoveredSocial === name && (
//                     <motion.div
//                       initial={{ opacity: 0, y: 5 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       exit={{ opacity: 0, y: 5 }}
//                       className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[#1E293B] text-xs text-white px-2 py-1 rounded whitespace-nowrap border border-[#D4AF37]/30"
//                     >
//                       {label}
//                     </motion.div>
//                   )}
//                 </motion.a>
//               ))}
//             </div>
//           </div>

//           {/* Quick Links Column */}
//           <div>
//             <h3 className="font-bold text-lg mb-6 text-white border-l-4 border-[#D4AF37] pl-3 flex items-center gap-2">
//               <motion.span
//                 animate={{ rotate: [0, 10, 0] }}
//                 transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
//                 className="text-[#D4AF37]"
//               >
//                 •
//               </motion.span>
//               QUICK LINKS
//             </h3>
//             <ul className="space-y-3 text-sm">
//               {[
//                 { name: "Home", path: "/" },
//                 { name: "About Us", path: "/aboutuspage" },
//                 { name: "Contact Us", path: "/contactpage" },
//                 { name: "Shipping Policy", path: "/shippingpolicy" },
//                 { name: "Return Policy", path: "/returnpolicy" },
//                 { name: "Terms & Conditions", path: "/termsandcondition" },
//               ].map((link, index) => (
//                 <motion.li 
//                   key={link.name}
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   transition={{ delay: index * 0.1 }}
//                 >
//                   <Link
//                     href={link.path}
//                     className="flex items-center gap-2 text-gray-300 hover:text-[#D4AF37] transition-colors duration-200 group"
//                   >
//                     <motion.div 
//                       className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
//                       whileHover={{ scale: 1.5 }}
//                     />
//                     {link.name}
//                   </Link>
//                 </motion.li>
//               ))}
//             </ul>
//           </div>

//           {/* Shop By Column */}
//           <div>
//             <h3 className="font-bold text-lg mb-6 text-white border-l-4 border-[#D4AF37] pl-3 flex items-center gap-2">
//               <motion.span
//                 animate={{ rotate: [0, -10, 0] }}
//                 transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
//                 className="text-[#D4AF37]"
//               >
//                 •
//               </motion.span>
//               SHOP BY
//             </h3>
//             <ul className="space-y-3 text-sm">
//               {categories.slice(0, 6).map((cat, index) => (
//                 <motion.li 
//                   key={cat._id}
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   transition={{ delay: index * 0.1 + 0.3 }}
//                 >
//                   <Link
//                     href={`/shoppage?category=${cat.categoryTitle}`}
//                     className="flex items-center gap-2 text-gray-300 hover:text-[#D4AF37] transition-colors duration-200 group"
//                   >
//                     <motion.div 
//                       className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
//                       whileHover={{ scale: 1.5 }}
//                     />
//                     {cat.categoryTitle}
//                   </Link>
//                 </motion.li>
//               ))}
//             </ul>
//           </div>

//           {/* Contact Info Column */}
//           <div>
//             <h3 className="font-bold text-lg mb-6 text-white border-l-4 border-[#D4AF37] pl-3 flex items-center gap-2">
//               <motion.span
//                 animate={{ scale: [1, 1.2, 1] }}
//                 transition={{ duration: 1.5, repeat: Infinity }}
//                 className="text-[#D4AF37]"
//               >
//                 ✆
//               </motion.span>
//               CONTACT US
//             </h3>
//             <ul className="space-y-4 text-sm">
//               <motion.li 
//                 className="flex items-start gap-3 group"
//                 whileHover={{ x: 5 }}
//               >
//                 <motion.div 
//                   className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center group-hover:bg-[#D4AF37]/20 transition-all duration-300"
//                   whileHover={{ rotate: [0, -10, 10, 0] }}
//                   transition={{ duration: 0.5 }}
//                 >
//                   <FaWhatsapp className="text-[#25D366] text-lg" />
//                 </motion.div>
//                 <div>
//                   <p className="font-medium text-white">WhatsApp</p>
//                   <p className="text-gray-300">{contactNumber || "Not available"}</p>
//                 </div>
//               </motion.li>
              
//               <motion.li 
//                 className="flex items-start gap-3 group"
//                 whileHover={{ x: 5 }}
//               >
//                 <motion.div 
//                   className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center group-hover:bg-[#D4AF37]/20 transition-all duration-300"
//                   whileHover={{ rotate: [0, -10, 10, 0] }}
//                   transition={{ duration: 0.5, delay: 0.1 }}
//                 >
//                   <FaEnvelope className="text-white text-lg" />
//                 </motion.div>
//                 <div>
//                   <p className="font-medium text-white">Email</p>
//                   <p className="text-gray-300 break-all text-xs">{primaryEmail || "info@povi.com"}</p>
//                 </div>
//               </motion.li>
              
//               <motion.li 
//                 className="flex items-start gap-3 group"
//                 whileHover={{ x: 5 }}
//               >
//                 <motion.div 
//                   className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center group-hover:bg-[#D4AF37]/20 transition-all duration-300"
//                   whileHover={{ rotate: [0, -10, 10, 0] }}
//                   transition={{ duration: 0.5, delay: 0.2 }}
//                 >
//                   <FaLocationDot className="text-white text-lg" />
//                 </motion.div>
//                 <div>
//                   <p className="font-medium text-white">Address</p>
//                   <p className="text-gray-300 text-xs leading-relaxed">{address || "Bangalore, India"}</p>
//                 </div>
//               </motion.li>
//             </ul>
//           </div>
//         </div>

//         {/* Animated Divider */}
//         <motion.div 
//           className="my-8 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent"
//           initial={{ scaleX: 0 }}
//           animate={{ scaleX: 1 }}
//           transition={{ duration: 1, delay: 0.5 }}
//         />

//         {/* Bottom Section with more glitter */}
//         <div className="relative">
//           {/* Additional floating glitter near copyright */}
//           <motion.div
//             className="absolute w-[2px] h-[2px] bg-[#FFD700] rounded-full"
//             style={{
//               left: "5%",
//               bottom: "50%",
//             }}
//             animate={{
//               opacity: [0, 1, 0],
//               scale: [0.2, 0.8, 0.2],
//               x: [0, 30, 0],
//               y: [0, -15, 0],
//               boxShadow: [
//                 "0 0 0px rgba(255, 215, 0, 0)",
//                 "0 0 10px rgba(255, 215, 0, 0.7)",
//                 "0 0 0px rgba(255, 215, 0, 0)"
//               ],
//             }}
//             transition={{
//               duration: 3,
//               repeat: Infinity,
//               repeatType: "reverse",
//               delay: 1,
//             }}
//           />
          
//           <div className="flex flex-col md:flex-row justify-between items-center gap-4">
//             <div className="text-center md:text-left">
//               <p className="text-gray-400 text-sm">
//                 Copyright © 2025{" "}
//                 <span className="font-bold text-[#D4AF37] relative">
//                   Povi's Collection
//                   <motion.span
//                     className="absolute -top-1 -right-1 w-1 h-1 bg-[#FFD700] rounded-full"
//                     animate={{ opacity: [0, 1, 0] }}
//                     transition={{ duration: 1, repeat: Infinity }}
//                   />
//                 </span>
//                 . All Rights Reserved.
//               </p>
//             </div>
            
//             <div className="flex items-center gap-4 text-sm">
//               <Link 
//                 href="/privacypolicy" 
//                 className="text-gray-300 hover:text-[#D4AF37] transition-colors duration-200 relative group"
//               >
//                 Privacy Policy
//                 <motion.span 
//                   className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#D4AF37] group-hover:w-full transition-all duration-300"
//                   initial={false}
//                 />
//               </Link>
//               <span className="text-gray-500">|</span>
//               <p className="text-gray-400">
//                 Developed by{" "}
//                 <a
//                   href="https://whyglobalservices.com/"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="font-bold text-[#D4AF37] hover:underline relative"
//                 >
//                   Why Global Services
//                   <motion.span
//                     className="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-[#D4AF37] hover:w-full transition-all duration-300"
//                     initial={false}
//                   />
//                 </a>
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Decorative corner elements with glitter */}
//       <motion.div 
//         className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-[#D4AF37]/20"
//         animate={{ 
//           borderColor: ["rgba(212, 175, 55, 0.2)", "rgba(212, 175, 55, 0.5)", "rgba(212, 175, 55, 0.2)"]
//         }}
//         transition={{ duration: 3, repeat: Infinity }}
//       />
//       <motion.div 
//         className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-[#D4AF37]/20"
//         animate={{ 
//           borderColor: ["rgba(212, 175, 55, 0.2)", "rgba(212, 175, 55, 0.5)", "rgba(212, 175, 55, 0.2)"]
//         }}
//         transition={{ duration: 3, repeat: Infinity, delay: 1 }}
//       />
//     </footer>
//   );
// }