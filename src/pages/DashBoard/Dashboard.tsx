// import React from "react";

// const stats = [
//   {
//     title: "Orders",
//     value: 1758,
//     change: "+11%",
//     changeColor: "text-green-500",
//     percentage: 11,
//     description: "Total number of orders received last month.",
//   },
//   {
//     title: "Revenue",
//     value: "$48,259",
//     change: "+27%",
//     changeColor: "text-red-500",
//     percentage: 27,
//     description: "Total revenue generated from sales last month.",
//   },
//   {
//     title: "Average Price",
//     value: "$17.5",
//     change: "0%",
//     changeColor: "text-gray-500",
//     percentage: 10,
//     description: "Average price of products sold last month.",
//   },
//   {
//     title: "Product Sold",
//     value: 2048,
//     change: "+89%",
//     changeColor: "text-blue-500",
//     percentage: 89,
//     description: "Total number of products sold last month.",
//   },
// ];

// const PieChart = ({ percentage, change }) => {
//   const isPositive = change.startsWith("+");
//   const color = isPositive ? "#A78BFA" : "#FB923C";

//   return (
//     <div
//       className="relative w-14 h-14 rounded-full"
//       style={{
//         background: `conic-gradient(${color} ${percentage}%, #e5e7eb ${percentage}% 100%)`,
//       }}
//     >
//       <div className="absolute inset-2 bg-white rounded-full"></div>
//     </div>
//   );
// };

// const Dashboard = () => {
//   return (
//     <div className="p-6  ">
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//         {stats.map((stat, index) => (
//           <div
//             key={index}
//             className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 p-4"
//           >
//             <div className="flex items-center justify-between mb-4">
//               <PieChart percentage={stat.percentage} change={stat.change} />
//               <div
//                 className={`text-sm font-semibold px-2 py-1 rounded-md shadow-sm ${stat.changeColor} bg-white`}
//               >
//                 {stat.change}
//               </div>
//             </div>
//             <p className="text-sm text-gray-400 mb-1">Last Month</p>
//             <div className="flex items-center justify-between mb-1">
//               <h3 className="text-lg font-medium text-gray-700">{stat.title}</h3>
//               <p className="text-lg font-bold text-gray-800">{stat.value}</p>
//             </div>
//             <p className="text-sm text-gray-500">{stat.description}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Dashboard;


import React from "react";
import { useDashboard } from "../../context/DashboardContext";

const Dashboard = () => {
  const { dashboardData, loading, error } = useDashboard();

  if (loading) return <div className="p-6">Loading dashboard data...</div>;
  if (error) return <div className="p-6">Error: {error}</div>;
  if (!dashboardData) return <div className="p-6">No data available</div>;

  const stats = [
    {
      title: "Orders",
      currentValue: dashboardData.orderStats.currentMonthOrders,
      previousValue: dashboardData.orderStats.previousMonthOrders,
      change: dashboardData.orderStats.increasePercentage,
      trend: dashboardData.orderStats.trend,
      description: "Number of orders this month compared to last month.",
    },
    {
      title: "Revenue",
      currentValue: dashboardData.revenueStats.thistotal,
      previousValue: dashboardData.revenueStats.previoustotal,
      change: dashboardData.revenueStats.revenueIncreasePercentage,
      trend: dashboardData.revenueStats.trend,
      description: "Total revenue generated this month compared to last month.",
    },
    {
      title: "Average Price",
      currentValue: dashboardData.productStats.thisMonthProductAverage,
      previousValue: dashboardData.productStats.previousMonthProductAverage,
      change: dashboardData.productStats.AverageProductPercentage,
      trend: dashboardData.productStats.trend,
      description: "Average product price this month compared to last month.",
    },
    {
      title: "Products Sold",
      currentValue: dashboardData.salesStats.nowmonthsales,
      previousValue: dashboardData.salesStats.previousmonthSales,
      change: dashboardData.salesStats.salesIncrement,
      trend: dashboardData.salesStats.trend,
      description: "Number of products sold this month compared to last month.",
    },
  ];

  const PieChart = ({ percentage, trend }) => {
    const percentageNum = parseFloat(percentage.replace('%', ''));
    const absPercentage = Math.min(Math.abs(percentageNum), 100);
    const color = trend === 'increase' ? "#A78BFA" : "#FB923C";

    return (
      <div
        className="relative w-14 h-14 rounded-full"
        style={{
          background: `conic-gradient(${color} ${absPercentage}%, #e5e7eb ${absPercentage}% 100%)`,
        }}
      >
        <div className="absolute inset-2 bg-white rounded-full"></div>
      </div>
    );
  };

  const formatValue = (value, isCurrency = false) => {
    if (isCurrency) {
      return `$${parseFloat(value).toFixed(2)}`;
    }
    return value;
  };

  const getChangeColor = (trend) => {
    return trend === 'increase' ? 'text-green-500' : 'text-red-500';
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <PieChart 
                percentage={stat.change} 
                trend={stat.trend} 
              />
              <div
                className={`text-sm font-semibold px-2 py-1 rounded-md shadow-sm ${getChangeColor(stat.trend)}`}
              >
                {stat.change}%
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-1">Last Month: {formatValue(stat.previousValue, stat.title === 'Revenue' || stat.title === 'Average Price')}</p>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-medium text-gray-700">{stat.title}</h3>
              <p className="text-lg font-bold text-gray-800">
                {formatValue(stat.currentValue, stat.title === 'Revenue' || stat.title === 'Average Price')}
              </p>
            </div>
            <p className="text-sm text-gray-500">{stat.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;