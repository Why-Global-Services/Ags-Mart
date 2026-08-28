// // page.js - CORRECTED VERSION
// "use client";

// import Link from "next/link";
// import { useState, useEffect } from "react";

// export default function Dashboard() {
//   const [orders, setOrders] = useState([]);
//   const [accountDetails, setAccountDetails] = useState({});
//   const [loading, setLoading] = useState(false);
//   useEffect(() => {
//     setOrders([]);
//     setAccountDetails({
//       name: "John Doe",
//       email: "john@example.com",
//       phone: "1234567890"
//     });
//   }, []);

//   return (
//     <div className="bg-gray-50 p-4 rounded-xl">
//       <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
//       <p className="mb-6 text-gray-900 font-fontcontent">
//         From your account dashboard you can view your recent orders, manage your
//         shipping and billing addresses, and edit your password and account
//         details.
//       </p>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//         <div className="bg-gray-50 shadow-xl p-5 rounded-2xl border border-gray-100 shadow-neumorph hover:shadow-lg transition-shadow duration-300">
//           <div className="flex items-center gap-3 mb-3">
//             <div className="bg-emerald-50 p-3 rounded-xl flex items-center justify-center">
//               📦
//             </div>
//             <h3 className="font-bold text-black text-xl">Recent Orders</h3>
//           </div>
//           <ul className="space-y-2">
//             {orders && orders.length > 0 ? (
//               orders.slice(0, 3).map((order) => (
//                 <li
//                   key={order.id}
//                   className="flex mt-2 flex-col sm:flex-row justify-between items-center py-2 border-b border-gray-100 last:border-0"
//                 >
//                   <span className="text-sm text-gray-600">#{order.id}</span>
//                   <span
//                     className={`text-xs px-2 py-1 mt-2 sm:mt-0 rounded-full ${
//                       order.status === "Delivered"
//                         ? "bg-green-100 text-green-800"
//                         : order.status === "Processing"
//                         ? "bg-yellow-100 text-yellow-800"
//                         : "bg-blue-100 text-blue-800"
//                     }`}
//                   >
//                     {order.status}
//                   </span>
//                 </li>
//               ))
//             ) : (
//               <li className="text-sm text-gray-900 py-2 font-fonttitle">
//                 No recent orders
//               </li>
//             )}
//           </ul>
//           <Link
//             href="/accountpage/orders"
//             className="mt-4 text-sm text-blue-600 hover:underline font-medium font-fontcontent"
//           >
//             View all orders
//           </Link>
//         </div>

//         {/* Account Details Card */}
//         <div className="bg-gray-50 shadow-xl p-5 rounded-2xl border border-gray-100 shadow-neumorph hover:shadow-lg transition-shadow duration-300">
//           <div className="flex items-center gap-3 mb-3">
//             <div className="bg-purple-100 p-3 rounded-xl flex items-center justify-center">
//               👤
//             </div>
//             <h3 className="font-bold text-xl">Account Details</h3>
//           </div>
//           <div className="space-y-1 text-sm text-black">
//             <p className="truncate">{accountDetails?.name || "N/A"}</p>
//             <p className="truncate">{accountDetails?.email || "N/A"}</p>
//             <p className="truncate">{accountDetails?.phone || "Not provided"}</p>
//           </div>
//           <Link
//             href="/accountpage/account"
//             className="mt-4 text-sm text-blue-600 hover:underline font-medium font-fontcontent"
//           >
//             Edit details
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }

import React from 'react'
import Orders from './orders/components/Orders'

const page = () => {
  return (
<Orders/>  )
}

export default page