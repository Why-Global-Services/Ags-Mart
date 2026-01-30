import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Store,
  Mail,
  Users,
  CreditCard,
  Truck,
  Clock,
  Contact,
  Info,
  Shield,
  FileText,
  Package,
  PackageCheck,
  ClipboardList,
  Bike,
  HardDriveUpload,
  Menu,
  Puzzle,
  X,
  HelpCircle, // Added for FAQ
} from "lucide-react";

const SettingSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Check if current route matches the link
  const isActive = (path) => location.pathname === path;

  const icons = {
    "/setting/storesetting": <Store className="w-4 h-4" />,
    "/setting/emailsetting": <Mail className="w-4 h-4" />,
    "/setting/users": <Users className="w-4 h-4" />,
    "/setting/paymethods": <CreditCard className="w-4 h-4" />,
    "/setting/shippingmethods": <Truck className="w-4 h-4" />,
    "/setting/timeslots": <Clock className="w-4 h-4" />,
    "/setting/contactus": <Contact className="w-4 h-4" />,
    "/setting/aboutus": <Info className="w-4 h-4" />,
    "/setting/privacy&policy": <Shield className="w-4 h-4" />,
    "/setting/terms&conditions": <FileText className="w-4 h-4" />,
    "/setting/returnpolicy": <PackageCheck className="w-4 h-4" />,
    "/setting/shippingpolicy": <Package className="w-4 h-4" />,
    "/setting/adminpolicy": <ClipboardList className="w-4 h-4" />,
    "/setting/deliverypolicy": <Bike className="w-4 h-4" />,
    "/setting/systemregistration": <HardDriveUpload className="w-4 h-4" />,
    "/setting/moduleManager": <Puzzle className="w-4 h-4" />,
    // "/setting/faq": <HelpCircle className="w-4 h-4" />, 
  };

  const menuItems = [
    // { path: "/setting/storesetting", label: "Store Settings" },
    // { path: "/setting/emailsetting", label: "Email Settings" },
    // { path: "/setting/paymethods", label: "Payment Methods" },
    // { path: "/setting/shippingmethods", label: "Shipping Methods" },
    // { path: "/setting/timeslots", label: "Time Slots" },
    // { path: "/setting/contactus", label: "Contact Us" },
    { path: "/setting/aboutus", label: "About Us" },
    { path: "/setting/privacy&policy", label: "Privacy & Policy" },
    { path: "/setting/terms&conditions", label: "Terms & Conditions" },
    { path: "/setting/returnpolicy", label: "Return Policy" },
    { path: "/setting/shippingpolicy", label: "Shipping Policy" },
    // { path: "/setting/adminpolicy", label: "Admin Policy" },
    // { path: "/setting/deliverypolicy", label: "Delivery Policy" },
    // { path: "/setting/systemregistration", label: "System Registration" },
    // { path: "/setting/moduleManager", label: "Module Manager" },
    // { path: "/setting/faq", label: "FAQ" },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="md:hidden fixed bottom-4 right-4 z-50 bg-pink-600 text-white p-3 rounded-full shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <div
        className={`bg-white shadow-md rounded-xl p-4 h-[calc(100vh-2rem)] md:h-fit w-78 space-y-2 fixed md:static z-40 transition-all duration-300 ${
          isOpen ? " right-4 top-4 bottom-4" : "hidden md:block"
        }`}
      >
        <div className="h-full flex flex-col overflow-hidden">
          <h2 className="text-lg font-semibold px-4 py-2">Settings</h2>

          {/* Scrollable content container */}
          <div className="flex-1 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center w-full gap-3 px-4 py-2 rounded-lg transition-colors duration-200 ${
                  isActive(item.path)
                    ? "bg-primary text-secondary font-medium"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
                aria-current={isActive(item.path) ? "page" : undefined}
              >
                {icons[item.path]}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Fixed footer at bottom */}
          <div className="px-4 py-2 mt-auto text-sm text-gray-500 border-t border-gray-200">
            Current plan: <span className="text-secondary">Premium</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingSidebar;
