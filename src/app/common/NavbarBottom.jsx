// "use client";
// import React, { useEffect, useState } from "react";
// import { FiMenu, FiX, FiChevronRight } from "react-icons/fi";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { getNavbarData } from "../interceptor/interseptor";

// const NavbarBottom = () => {
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const router = useRouter();
//   const [navData, setNavdata] = useState([]);

//   const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
//   const closeAll = () => {
//     setIsDropdownOpen(false);
//     setIsMobileMenuOpen(false);
//   };

//   const categories = [
//     { name: "Home", path: "/" },
//     { name: "Shop", path: "/shoppage" },
//     { name: "About Us", path: "/aboutuspage" },
//     { name: "Blog", path: "/blog" },
//     { name: "Contact Us", path: "/contactpage" },
//   ];

//   // Static Product Items
//   const staticProducts = [
//     { name: "All Products", path: "/shoppage" },
//     { name: "Combo Products", path: "/shoppage?category=combo" },
//   ];

//   // ✅ Merge API + static products
//   const products = [...staticProducts, ...navData];

//   const handleNavigation = (path) => {
//     router.push(path);
//     closeAll();
//   };

//   // ✅ Fetch navbar categories from API
//   const fetchNavbar = async () => {
//     const data = await getNavbarData();

//     const apiCategories = data.data.findCategory.map((cat) => ({
//       name: cat.categoryTitle,
//       path: `/shoppage?category=${encodeURIComponent(cat.categoryTitle)}`,
//     }));

//     setNavdata(apiCategories);
//   };

//   useEffect(() => {
//     fetchNavbar();

//     const handleResize = () => {
//       if (window.innerWidth >= 1024) {
//         setIsMobileMenuOpen(false);
//       }
//     };
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   return (
//     <>
//       <div className="relative bg-gray-100 py-3 flex items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12">

//         {/* Mobile Left Menu Button */}
//         <div className="flex lg:hidden">
//           <button
//             onClick={() => setIsMobileMenuOpen(true)}
//             className="px-4 py-2.5 bg-bgvariant-2 hover:bg-emerald-800 text-white flex items-center gap-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-md text-sm"
//           >
//             <FiMenu className="text-lg" />
//             <span>Menu</span>
//           </button>
//         </div>

//         {/* Mobile Category Menu */}
//         <div className="flex lg:hidden ml-auto">
//           <div className="relative">
//             <button
//               onClick={toggleDropdown}
//               className="px-4 py-2.5 bg-white border border-gray-300 text-black flex items-center gap-2 rounded-lg font-semibold hover:bg-green-50 hover:border-emerald-600 transition-all duration-300 text-sm shadow-sm"
//             >
//               <FiMenu
//                 className={`text-lg transition-transform duration-300 ${
//                   isDropdownOpen ? "rotate-90 text-bgvariant-2" : ""
//                 }`}
//               />
//               <span>CATEGORIES</span>
//             </button>

//             {isDropdownOpen && (
//               <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
//                 <ul className="py-2">
//                   {products.map((product, i) => (
//                     <li
//                       key={product.name + i}
//                       className="px-5 py-3 text-gray-700 hover:bg-emerald-50 hover:text-bgvariant-2 cursor-pointer transition-all duration-200 flex items-center justify-between group"
//                       onClick={() => handleNavigation(product.path)}
//                     >
//                       <span>{product.name}</span>
//                       <FiChevronRight className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Desktop Center Menu */}
//         <ul className="hidden lg:flex gap-6 xl:gap-8 text-black font-semibold items-center">
//           {categories.map((item) => (
//             <li key={item.name} className="relative group cursor-pointer">
//               <Link
//                 href={item.path}
//                 className="hover:text-bgvariant-2 transition-colors duration-300 text-sm xl:text-base"
//               >
//                 {item.name}
//               </Link>
//               <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-bgvariant-2 transition-all duration-500 group-hover:w-full"></span>
//             </li>
//           ))}
//         </ul>

//         {/* Desktop Right Category Button */}
//         <div className="hidden lg:block">
//           <div className="relative">
//             <button
//               onClick={toggleDropdown}
//               className="px-5 py-2.5 bg-white border border-gray-300 text-black flex items-center gap-3 rounded-lg font-semibold hover:bg-green-50 hover:border-emerald-600 transition-all duration-300 shadow-sm"
//             >
//               <FiMenu
//                 className={`text-xl transition-transform duration-300 ${
//                   isDropdownOpen ? "rotate-90 text-bgvariant-2" : ""
//                 }`}
//               />
//               <span>ALL CATEGORIES</span>
//             </button>

//             {isDropdownOpen && (
//               <div className="absolute left-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
//                 <ul className="py-3">
//                   {products.map((product, i) => (
//                     <li
//                       key={product.name + i}
//                       style={{ transitionDelay: `${i * 50}ms` }}
//                       className={`px-6 py-3.5 text-gray-700 hover:bg-emerald-50 hover:text-bgvariant-2 cursor-pointer transition-all duration-300 flex items-center justify-between group`}
//                       onClick={() => handleNavigation(product.path)}
//                     >
//                       <span className="font-medium">{product.name}</span>
//                       <FiChevronRight className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Mobile Sliding Menu */}
//       {isMobileMenuOpen && (
//         <div className="fixed inset-0 z-50 lg:hidden">
//           <div
//             className="absolute inset-0 bg-opacity-50 transition-opacity duration-300"
//             onClick={closeAll}
//           />
//           <div
//             className="absolute left-0 top-0 h-full w-80 max-w-full bg-white shadow-2xl transform transition-transform duration-500 ease-out"
//             style={{
//               transform: isMobileMenuOpen ? "translateX(0)" : "translateX(-100%)",
//             }}
//           >
//             <div className="p-5 border-b border-gray-100">
//               <div className="flex justify-between items-center">
//                 <h2 className="text-2xl font-bold text-emerald-800">Menu</h2>
//                 <button
//                   onClick={closeAll}
//                   className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
//                 >
//                   <FiX className="text-xl" />
//                 </button>
//               </div>
//             </div>

//             <nav className="p-5 space-y-1">
//               {categories.map((item) => (
//                 <div
//                   key={item.name}
//                   onClick={() => handleNavigation(item.path)}
//                   className="flex items-center justify-between py-3.5 px-4 rounded-xl text-gray-700 hover:bg-emerald-50 hover:text-bgvariant-2 cursor-pointer transition-all duration-300 group"
//                 >
//                   <span className="font-semibold text-base">{item.name}</span>
//                   <FiChevronRight className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
//                 </div>
//               ))}
//             </nav>

//             <div className="absolute border-t border-gray-200 shadow-2xl bottom-0 left-0 right-0 p-5">
//               <p className="text-xs text-gray-500 text-center">
//                 © 2025 YourBrand. All rights reserved.
//               </p>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default NavbarBottom;
