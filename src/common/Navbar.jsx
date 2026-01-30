import { useState, useRef, useEffect } from "react";
import {
  FaHome,
  FaCalendar,
  FaUser,
  FaShoppingCart,
  FaTasks,
  FaTags,
  FaRegFilePdf,
  FaTag,
  FaBell,
  FaCog,
  FaBars,
  FaUsers,
  FaStar,
  FaChartBar,
  FaClock,
} from "react-icons/fa";
import { FaBarsProgress } from "react-icons/fa6";
import { BiSolidOffer } from "react-icons/bi";
import { TbCategoryFilled } from "react-icons/tb";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { motion } from "framer-motion";
import { Link, NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./authContext";
import { adminLogin, getoneUser } from "../Interceptor/interceptor";
import { IoSettingsSharp } from "react-icons/io5";

const Navbar = ({ toggleSidebar }) => {
  const { permissions } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [data, setData] = useState({});
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      name: "Ronald Richards",
      message: "Your profile has been verified.",
      time: "23 mins ago",
      img: "https://randomuser.me/api/portraits/men/1.jpg",
    },
    {
      id: 2,
      name: "Arlene McCoy",
      message: "You can stitch between multiple videos.",
      time: "23 mins ago",
      img: "https://randomuser.me/api/portraits/women/2.jpg",
    },
    {
      id: 3,
      name: "Annette Black",
      message: "Invited you to prototyping.",
      time: "23 mins ago",
      img: "https://randomuser.me/api/portraits/women/3.jpg",
    },
  ]);

  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("Token");
    localStorage.removeItem("UserPermissions");
    navigate("/");
  };

  useEffect(() => {
    const fetchData = async () => {
      const Navbarresponse = await getoneUser();
      setData(Navbarresponse.data);
      console.log("response", Navbarresponse);
    };
    fetchData();
  }, []);

  console.log("data", data);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // const menuItems = [
  //   { icon: FaHome, label: "Dashboard", path: "/" },
  //   { icon: FaCalendar, label: "Products", path: "/products" },
  //   { icon: FaTasks, label: "Categories", path: "/categories" },
  //   { icon: TbCategoryFilled, label: "SubCategories", path: "/subcategories" },
  //   { icon: FaShoppingCart, label: "Orders", path: "/orders" },
  //   { icon: FaUser, label: "Customers", path: "/customers" },
  //   { icon: FaShoppingCart, label: "Reviews", path: "/reviews" },
  //   { icon: BiSolidOffer, label: "Offers", path: "/offer" },
  //   { icon: FaTag, label: "Brand", path: "/brand" },
  //   { icon: FaTags, label: "Coupons", path: "/coupons" },
  //   {
  //     icon: FaStar,
  //     label: "Featured Section",
  //     path: "/featuredproducts",
  //   },
  //   { icon: FaChartBar, label: "Reports", path: "/report" },
  //   { icon: FaUser, label: "Profile", path: "/profile" },
  //   { icon: FaUsers, label: "System Users", path: "/systemUser" },
  //   { icon: FaBarsProgress, label: "Setting", path: "/setting" },
  //   { icon: FaBell, label: "Notification", path: "/notification" },
  // ];

  const menuItems = [
    // { icon: FaHome, label: "Dashboard", path: "/dashboard", permission: true },
    {
      icon: FaCalendar,
      label: "Products",
      path: "/products",
      permission: permissions?.products,
    },
    {
      icon: FaTasks,
      label: "Categories",
      path: "/categories",
      permission: permissions?.category,
    },
    {
      icon: TbCategoryFilled,
      label: "SubCategories",
      path: "/subcategories",
      permission: permissions?.subCategory,
    },
    {
      icon: FaShoppingCart,
      label: "Orders",
      path: "/orders",
      permission: permissions?.orders,
    },
    {
      icon: FaUser,
      label: "Customers",
      path: "/customers",
      permission: permissions?.customers,
    },
    // {
    //   icon: FaShoppingCart,
    //   label: "Reviews",
    //   path: "/reviews",
    //   permission: permissions?.reviews,
    // },
    // {
    //   icon: BiSolidOffer,
    //   label: "Offers",
    //   path: "/offers",
    //   permission: permissions?.offers,
    // },
    // {
    //   icon: FaTag,
    //   label: "Brand",
    //   path: "/brand",
    //   permission: permissions?.brands,
    // },
    { icon: FaTags, label: "Coupons", path: "/coupons", permission: true },
    // {
    //   icon: FaStar,
    //   label: "Featured Section",
    //   path: "/featuredproducts",
    //   permission: true,
    // },
    // {
    //   icon: FaChartBar,
    //   label: "Reports",
    //   path: "/report",
    //   permission: permissions?.reports,
    // },
    {
      icon: FaUser,
      label: "Profile",
      path: "/profile",
      permission: permissions?.profile,
    },
    { icon: IoSettingsSharp, label: "Web Setting", path: "/websetting", permission: true },
    // {
    //   icon: FaUsers,
    //   label: "System Users",
    //   path: "/systemUser",
    //   permission: permissions?.systemUser,
    // },
    {
      icon: FaBarsProgress,
      label: "Settings",
      path: "/setting/privacy&policy",
      permission: permissions?.settings,
    },
    { icon: FaUser, label: "User Queries", path: "/userqueries", permission: true },
    // {
    //   icon: FaBell,
    //   label: "Notification",
    //   path: "/notification",
    //   permission: permissions?.notifications,
    // },
  ].filter((item) => item.permission);

// Helper function for time of day
const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
};

// Format date function
const formatDate = (date, short = false) => {
  const options = short 
    ? { weekday: 'short', month: 'short', day: 'numeric' }
    : { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

// Format time function
const formatTime = (date) => {
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  }).toLowerCase();
};

  return (
    <div>
      <div className="flex items-center justify-between bg-primary p-4 shadow-md mb-0.5">
        {/* Left Section */}
<div className="flex items-center space-x-4">
  {/* Sidebar Toggle Button */}
  <button
    onClick={toggleSidebar}
    className="hidden lg:flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 group shadow-sm"
    title="Toggle Sidebar"
  >
    <FaBars className="text-gray-600 text-lg group-hover:text-gray-800" />
  </button>

  {/* Greeting Section */}
  <div className="hidden lg:flex flex-col">
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
      <p className="text-sm text-gray-500">Good {getTimeOfDay()}!</p>
    </div>
    <h1 className="text-xl font-bold text-gray-800">
      Welcome, <span className="text-secondary">{data.userName || "Admin"}</span>
    </h1>
    <div className="flex items-center gap-3 mt-1">
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <FaCalendar className="w-3 h-3" />
        <span>{formatDate(new Date())}</span>
      </div>
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <FaClock className="w-3 h-3" />
        <span className="font-medium">{formatTime(new Date())}</span>
      </div>
    </div>
  </div>

  {/* Mobile Header */}
  <div className="lg:hidden flex items-center justify-between w-full">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
        {data.userName?.charAt(0) || "A"}
      </div>
      <div>
        <h2 className="font-bold text-gray-800">{data.userName || "Admin"}</h2>
        <div className="flex items-center gap-2">
          <p className="text-xs text-gray-500">{formatDate(new Date(), true)}</p>
          <span className="text-gray-300">•</span>
          <p className="text-xs font-medium text-blue-600">{formatTime(new Date())}</p>
        </div>
      </div>
    </div>
    <button
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
    >
      <FaBars className="text-gray-700 text-xl" />
    </button>
  </div>
</div>




        {/* Right Section */}
        <div className="flex items-center space-x-6">
          {/* Notification Bell */}
          {/* <div className="relative cursor-pointer mr-10" ref={notificationRef}>
            <motion.div
              animate={{ rotate: [0, -15, 15, -15, 0] }}
              transition={{
                repeat: Infinity,
                duration: 0.5,
                ease: "easeInOut",
              }}
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            >
              <Link to="/notification">
                <FaBell className="text-gray-600 text-xl" />
              </Link>
            </motion.div>
            {notifications.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-1.5 rounded-full">
                {notifications.length}
              </span>
            )} */}

            {/* Notification Dropdown */}
            {/* {isNotificationOpen && (
              <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-80 bg-white shadow-lg rounded-sm border border-gray-200 z-50">
                <div className="pb-2 pt-4 flex justify-between px-5 border-b border-gray-400">
                  <h3 className="text-lg font-bold text-blue-500">
                    Notifications
                  </h3>
                  <button
                    className="text-sm font-medium underline text-gray-500"
                    onClick={() => setNotifications([])}
                  >
                    Clear All
                  </button>
                </div>
                <ul className="py-2">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <li
                        key={notif.id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={notif.img}
                            alt="User"
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <p className="text-sm font-medium">{notif.name}</p>
                            <p className="text-xs text-gray-500">
                              {notif.message}
                            </p>
                            <p className="text-xs text-gray-400">
                              {notif.time}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <p className="text-center py-4 text-gray-500">
                      0 Notifications
                    </p>
                  )}
                </ul>
                <div className="p-4 border-t border-gray-200 flex justify-between items-center">
                  <Link
                    to="/notification"
                    className="text-blue-500 hover:text-blue-700 flex items-center"
                  >
                    See All Notifications <IoIosArrowForward className="ml-2" />
                  </Link>
                </div>
              </div>
            )} */}
          {/* </div> */}

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <div
              className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-gray-100"
              onClick={() => setIsOpen(!isOpen)}
            >
              {/* <img
                src="https://randomuser.me/api/portraits/women/44.jpg"
                alt="User"
                className="w-8 h-8 rounded-full"
              /> */}
              <span className="text-gray-600 font-medium">{data.userName}</span>
              <IoIosArrowDown className="text-gray-500 transition-transform duration-200" />
            </div>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-24 bg-white shadow-lg rounded-md border z-50">
                <ul className="py-2">
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    <Link
                      to="/profile"
                      className="block w-full h-full"
                      onClick={() => setIsOpen(false)}
                    >
                      Profile
                    </Link>
                  </li>
                  <li
                    className="px-4 py-2 hover:bg-red-100 text-red-500 cursor-pointer"
                    onClick={handleLogout}
                  >
                    Logout
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Settings Icon */}
          <Link to="/setting/privacy&policy">
            <FaCog className="text-gray-600 text-xl cursor-pointer mr-3 animate-spin" />
          </Link>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-transparent z-50 lg:hidden">
          <div className="w-64 bg-gray-100 text-black h-full p-4 absolute left-0 top-0">
            <button
              className="text-black text-2xl absolute top-4 right-4"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              &times;
            </button>
            <div className="mt-10">
              {menuItems.map(({ icon: Icon, label, path }, index) => (
                <NavLink
                  to={path}
                  key={index}
                  className={({ isActive }) =>
                    `flex items-center py-2 px-3 rounded transition-all duration-300 ${
                      isActive ? "bg-primary text-white" : "hover:bg-gray-800"
                    }`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="mr-3 min-w-[20px]" />
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
