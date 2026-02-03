import { NavLink } from "react-router-dom";
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
  FaProductHunt,
  FaUsers,
  FaStar,
  FaChartBar,
} from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";
import { FaBarsProgress } from "react-icons/fa6";
import { BiSolidOffer } from "react-icons/bi";
import { TbCategoryFilled } from "react-icons/tb";
import { useAuth } from "./authContext";
import { useState, useEffect } from "react";
import { getWebSettings } from "../Interceptor/interceptor";
const Sidebar = ({ isCollapsed }) => {
  const { permissions } = useAuth();
  const [webSettings, setWebSettings] = useState(null);

  // Fetch web settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await getWebSettings();
        setWebSettings(response.data.AdminSettings[0]);
      } catch (error) {
        console.error("Failed to fetch web settings:", error);
      }
    };
    fetchSettings();
  }, []);

  const allMenuItems = [
    // { icon: FaHome, label: "Dashboard", path: "/dashboard", permission: true },
    { icon: FaCalendar, label: "Products", path: "/products", permission: permissions?.products },
    { icon: FaTasks, label: "Categories", path: "/categories", permission: permissions?.category },
    { icon: TbCategoryFilled, label: "SubCategories", path: "/subcategories", permission: permissions?.subCategory },
    { icon: FaShoppingCart, label: "Orders", path: "/orders", permission: permissions?.orders },
    { icon: FaUser, label: "Customers", path: "/customers", permission: permissions?.customers },
    { icon: FaShoppingCart, label: "Reviews", path: "/reviews", permission: permissions?.reviews },
    // { icon: BiSolidOffer, label: "Offers", path: "/offers", permission: permissions?.offers },
    // { icon: FaTag, label: "Brand", path: "/brand", permission: permissions?.brands },
    { icon: FaTags, label: "Coupons", path: "/coupons", permission: true },
    // { icon: FaStar, label: "Featured Section", path: "/featuredproducts", permission: true },
    // { icon: FaChartBar, label: "Reports", path: "/report", permission: permissions?.reports },
    { icon: FaUser, label: "Profile", path: "/profile", permission: permissions?.profile },
    // { icon: FaUsers, label: "System Users", path: "/systemUser", permission: permissions?.systemUser },
    { icon: FaBarsProgress, label: "Settings", path: "/setting/privacy&policy", permission: permissions?.settings },
    // { icon: FaBell, label: "Notification", path: "/notification", permission: permissions?.notifications },
    { icon: IoSettingsSharp, label: "Web Setting", path: "/websetting", permission: true },
    {icon: FaTag, label: "Testimonial", path: "/testimonial", permission: true},
    { icon: FaUser, label: "User Queries", path: "/userqueries", permission: true },
    { icon: FaTags, label: "TopBar", path: "/topbar", permission: true },
  ];

  // Filter menu items based on permissions
  const menuItems = allMenuItems.filter(item => item.permission);

  return (
    <div
      className={`bg-white text-black h-screen p-1 transition-[width] duration-500 ease-in-out hidden lg:block ${
        isCollapsed ? "w-20" : "w-60"
      }`}
    >
      {/* Logo Section */}
      <div className="sticky top-0 bg-white z-10 pt-1">
      <h1 className="text-xl font-bold flex items-center space-x-2 p-2">
  {webSettings?.adminLogo ? (
    <img
      src={webSettings.adminLogo}
      alt="Admin Logo"
      className={`h-18 w-65  object-cover ${
        isCollapsed ? "h-8 w-8" : ""
      }`}
    />
  ) : (
    <span className="bg-pink-300 h-6 w-6 inline-block rounded-full"></span>
  )}
  {/* <span
    className={`overflow-hidden transition-[max-width,opacity] duration-500 ease-in-out ${
      isCollapsed ? "max-w-0 opacity-0" : "max-w-full opacity-100 ml-2"
    } whitespace-nowrap`}
  >
    {webSettings?.adminName || "LOGO"}
  </span> */}
</h1>

      </div>

      {/* Apps Section */}
      <div className="mt-4 overflow-y-auto h-[calc(100%-80px)]">
        <div className="space-y-2 pb-4">
          {menuItems.map(({ icon: Icon, label, path }, index) => (
            <NavLink
              to={path}
              key={index}
              className={({ isActive }) =>
                `flex items-center w-full py-2 px-3 rounded transition-all duration-500 ${
                  isActive ? "bg-secondary text-white" : "hover:bg-gray-100"
                }`
              }
            >
              <Icon className="mr-3 min-w-[20px]" />
              <span
                className={`overflow-hidden transition-[max-width,opacity] duration-500 ease-in-out ${
                  isCollapsed ? "max-w-0 opacity-0" : "max-w-full opacity-100"
                } whitespace-nowrap`}
              >
                {label}
              </span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;