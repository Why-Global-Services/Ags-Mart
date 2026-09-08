'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FiMenu, FiX, FiHome, FiShoppingCart, FiMapPin, FiUser } from "react-icons/fi";
import { FiLogOut } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { VscSignOut } from "react-icons/vsc";
import { useAuth } from "@/context/AuthContext";

export default function MyAccountLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePath, setActivePath] = useState("/accountpage");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const accountDetails = {
    name: user?.name || "User",
    email: user?.email || "john@example.com"
  };

  useEffect(() => {
    if (pathname) setActivePath(pathname);
  }, [pathname]);

  const menuItems = [
    // { label: "Dashboard", path: "/accountpage", exact: true, icon: <FiHome /> },
    { label: "Orders", path: "/accountpage", exact: true, icon: <FiShoppingCart /> },
    { label: "Addresses", path: "/accountpage/addresses", icon: <FiMapPin /> },
    { label: "Account Details", path: "/accountpage/account", icon: <FiUser /> },
  ];

  const normalizePath = (path) => path.replace(/\/+$/, "");
  const isActive = (itemPath, exact = false) => {
    const current = normalizePath(activePath || "");
    const target = normalizePath(itemPath);
    return exact ? current === target : current.startsWith(target);
  };

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
    setShowLogoutConfirm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-6 lg:p-8">
      <div className="container mx-auto px-4">
        <div className="mb-6 sm:mb-8 flex items-center gap-3 sm:gap-4 lg:block">
          {/* Mobile/Tablet Menu Button (LEFT on < lg, hidden on lg+) */}
          <div className="shrink-0 lg:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="group relative"
              aria-label="Open Account Menu"
            >
              <div className="flex items-center gap-2 sm:gap-3 px-3.5 sm:px-5 py-2.5 sm:py-3 bg-bgvariant-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="relative shrink-0">
                  <FiMenu size={18} className="text-white transition-transform duration-300 group-hover:rotate-90" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping"></div>
                </div>
                <span className="text-white text-xs sm:text-sm font-semibold">Menu</span>
              </div>
            </button>
          </div>

          {/* My Account Heading & Subtitle (RIGHT on < lg, CENTERED on lg+) */}
          <div className="flex-1 min-w-0 lg:w-full lg:text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-bgvariant-3 truncate sm:whitespace-normal">
              My Account
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-700 mt-0.5 sm:mt-2 leading-tight sm:leading-normal">
              Manage your profile and preferences
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="hidden lg:block lg:w-1/4">
            <div className="bg-gray-50 rounded-2xl shadow-xl border border-gray-100 p-6 sticky top-6">
              <div className="flex items-center gap-4 mb-6 p-4 bg-emerald-50 rounded-xl">
                <div className="w-14 h-14 rounded-full bg-bgvariant-3 flex items-center justify-center text-white font-bold text-lg">
                  {accountDetails.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-black">Welcome Back</p>
                  <p className="text-sm text-gray-800">{accountDetails.name}</p>
                </div>
              </div>

              <nav>
                <ul className="space-y-2">
                  {menuItems.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.path}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                          isActive(item.path, item.exact)
                            ? "bg-bgvariant-3 text-white shadow-md"
                            : "hover:bg-emerald-50 text-gray-700 hover:shadow-sm"
                        }`}
                      >
                        <span className={`p-2 rounded-lg ${
                          isActive(item.path, item.exact)
                            ? "bg-white/20 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {item.icon}
                        </span>
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </li>
                  ))}
                  
                  <li>
                    <button
                      onClick={() => setShowLogoutConfirm(true)}
                      className="flex items-center gap-3 p-3 rounded-xl transition-all w-full text-left hover:bg-red-50 text-red-600 hover:shadow-sm"
                    >
                      <span className="p-2 rounded-lg bg-red-100 text-red-600">
                        <FiLogOut />
                      </span>
                      <span className="font-medium">Logout</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          {menuOpen && (
            <>
              <div 
                className="lg:hidden fixed inset-0 bg-black/50 z-40"
                onClick={() => setMenuOpen(false)}
              />
              
              <div className="lg:hidden fixed top-0 left-0 bottom-0 w-80 bg-gray-50 z-50 transform transition-transform duration-300 shadow-xl">
                <div className="p-6 h-full flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Menu</h2>
                    <button
                      onClick={() => setMenuOpen(false)}
                      className="p-2 rounded-lg hover:bg-gray-100"
                    >
                      <FiX size={20} className="text-black" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 mb-6 p-4 bg-emerald-50 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-bgvariant-3 flex items-center justify-center text-white font-bold text-lg">
                      {accountDetails.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">Welcome Back</p>
                      <p className="text-sm text-gray-800">{accountDetails.name}</p>
                    </div>
                  </div>

                  <nav className="flex-1">
                    <ul className="space-y-2">
                      {menuItems.map((item) => (
                        <li key={item.label}>
                          <Link
                            href={item.path}
                            onClick={() => setMenuOpen(false)}
                            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                              isActive(item.path, item.exact)
                                ? "bg-bgvariant-3 text-white shadow-md"
                                : "hover:bg-bgvariant-2 text-gray-700 hover:shadow-sm"
                            }`}
                          >
                            <span className={`p-2 rounded-lg ${
                              isActive(item.path, item.exact)
                                ? "bg-white/20 text-white"
                                : "bg-gray-100 text-gray-600"
                            }`}>
                              {item.icon}
                            </span>
                            <span className="font-medium">{item.label}</span>
                          </Link>
                        </li>
                      ))}
                      
                      <li>
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            setShowLogoutConfirm(true);
                          }}
                          className="flex items-center gap-3 p-3 rounded-xl transition-all w-full text-left hover:bg-red-50 text-red-600 hover:shadow-sm"
                        >
                          <span className="p-2 rounded-lg bg-red-100 text-red-600">
                            <FiLogOut />
                          </span>
                          <span className="font-medium">Logout</span>
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            </>
          )}

          <div className="w-full lg:w-3/4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              {children}
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ 
                type: "spring", 
                damping: 25, 
                stiffness: 300 
              }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center"
            >
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring", 
                  damping: 15, 
                  stiffness: 200,
                  delay: 0.1 
                }}
                className="w-16 h-16 bg-gray-50 shadow-xl rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <VscSignOut className="text-red-600 text-2xl" />
              </motion.div>
              <motion.h3 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl font-bold text-gray-800 mb-2"
              >
                Ready to Leave?
              </motion.h3>
              
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-gray-600 mb-6"
              >
                Are you sure you want to logout? You'll need to sign in again to access your account.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex gap-3"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: "0 10px 25px -5px rgba(239, 68, 68, 0.4)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="flex-1 py-3 bg-red-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                >
                  Logout
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}