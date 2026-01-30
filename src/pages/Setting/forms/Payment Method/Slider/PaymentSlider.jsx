// // /pay/components/SettingTabs.jsx
// import { useNavigate, useLocation } from "react-router-dom";
// import {
//   CreditCard,
//   Wallet,
//   Phone,
//   DollarSign,
//   HandCoins,
//   Send,
//   Building2,
//   Smartphone,
//   ScanLine,
// } from "lucide-react";

// const tabs = [
//   {
//     path: "/setting/paymethods/razorpay",
//     label: "Razorpay",
//     icon: ScanLine,
//   },
//   {
//     path: "/setting/paymethods/googlePay",
//     label: "Google Pay",
//     icon: Smartphone,
//   },
//   {
//     path: "/setting/paymethods/stripe",
//     label: "Stripe",
//     icon: CreditCard,
//   },
//   {
//     path: "/setting/paymethods/phonePay",
//     label: "PhonePe",
//     icon: Phone,
//   },
//   {
//     path: "/setting/paymethods/paytm",
//     label: "Paytm",
//     icon: Send,
//   },
//   {
//     path: "/setting/paymethods/payPal",
//     label: "PayPal",
//     icon: Wallet,
//   },
//   {
//     path: "/setting/paymethods/instamojo",
//     label: "Instamojo",
//     icon: DollarSign,
//   },
//   {
//     path: "/setting/paymethods/cod",
//     label: "Cash on Delivery",
//     icon: HandCoins,
//   },
//   {
//     path: "/setting/paymethods/BankTransfer",
//     label: "Bank Transfer",
//     icon: Building2,
//   },
// ];

// const payTabs = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   return (
//     <div className="flex overflow-x-auto gap-3 p-2 bg-white rounded-xl shadow-sm hide-scrollbar">
//       {tabs.map(({ path, label, icon: Icon }) => {
//         const isActive = location.pathname === path;
//         return (
//           <button
//             key={path}
//             onClick={() => navigate(path)}
//             className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap border transition-all text-sm ${
//               isActive
//                 ? "bg-pink-100 text-pink-600 border-pink-400 shadow"
//                 : "bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200"
//             }`}
//           >
//             <Icon className={`w-4 h-4 ${isActive ? "animate-pulse" : ""}`} />
//             {label}
//           </button>
//         );
//       })}
//     </div>
//   );
// };

// export default payTabs;



import { useNavigate, useLocation } from "react-router-dom";
import {
  CreditCard,
  Wallet,
  Phone,
  DollarSign,
  HandCoins,
  Send,
  Building2,
  Smartphone,
  ScanLine,
} from "lucide-react";

const tabs = [
  {
    path: "/setting/paymethods/razorpay",
    label: "Razorpay",
    icon: ScanLine,
  },
  {
    path: "/setting/paymethods/googlePay",
    label: "Google Pay",
    icon: Smartphone,
  },
  {
    path: "/setting/paymethods/stripe",
    label: "Stripe",
    icon: CreditCard,
  },
  {
    path: "/setting/paymethods/phonePay",
    label: "PhonePe",
    icon: Phone,
  },
  {
    path: "/setting/paymethods/paytm",
    label: "Paytm",
    icon: Send,
  },
  {
    path: "/setting/paymethods/payPal",
    label: "PayPal",
    icon: Wallet,
  },
  {
    path: "/setting/paymethods/instamojo",
    label: "Instamojo",
    icon: DollarSign,
  },
  {
    path: "/setting/paymethods/cod",
    label: "Cash on Delivery",
    icon: HandCoins,
  },
  {
    path: "/setting/paymethods/BankTransfer",
    label: "Bank Transfer",
    icon: Building2,
  },
];

const payTabs = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Check if current path matches any tab path
  const isAnyTabActive = tabs.some(tab => location.pathname === tab.path);

  return (
    <div className="flex overflow-x-auto gap-3 p-2 bg-white rounded-xl shadow-sm hide-scrollbar">
      {tabs.map(({ path, label, icon: Icon }, index) => {
        // First tab is active if no tab matches current path, otherwise check if current path matches
        const isActive = !isAnyTabActive && index === 0 ? true : location.pathname === path;
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex items-center cursor-pointer gap-2 px-4 py-2 rounded-full whitespace-nowrap border transition-all text-sm ${
              isActive
                ? "bg-primary text-secondary border-secondary shadow"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200"
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? "animate-pulse" : ""}`} />
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default payTabs;