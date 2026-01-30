import React from "react";
import { useDashboard } from "../../context/DashboardContext";
import { FiTrendingUp, FiTrendingDown, FiUsers, FiShoppingBag } from "react-icons/fi";

const BestSellers = () => {
  const { dashboardData, loading, error } = useDashboard();

  if (loading) return (
    <div className="p-6 bg-gray-100 min-h-[300px] flex items-center justify-center">
      <div className="animate-pulse text-gray-500">Loading product data...</div>
    </div>
  );
  
  if (error) return (
    <div className="p-6 bg-gray-100 min-h-[300px] flex items-center justify-center">
      <div className="text-red-500">Error: {error}</div>
    </div>
  );
  
  if (!dashboardData?.bestSellers) return (
    <div className="p-6 bg-gray-100 min-h-[300px] flex items-center justify-center">
      <div className="text-gray-500">No product data available</div>
    </div>
  );


  const bestSellers = dashboardData.bestSellers
    .map(item => {
      const productName = item.productDetails?.nonVarient?.[0]?.productName || 
                         item.productDetails?.varient?.[0]?.productName || 
                         "Unknown Product";
      const price = item.priceNum || 0;
      const sold = item.totalSold || 0;
      const revenue = price * sold;
      
      return {
        id: item._id,
        product: productName,
        price: price,
        sold: sold,
        revenue: revenue,
        img: item.productDetails?.productImage?.[0] || "/images/default-product.png"
      };
    })
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5);


  const userStatsCards = [
    {
      title: "Current Users",
      value: dashboardData.userStats.currentMonthCount,
      icon: <FiUsers className="text-blue-500 text-2xl" />,
      trend: "neutral",
      description: "Active users this month"
    },
    {
      title: "User Growth",
      value: dashboardData.userStats.incrementPercentage,
      icon: dashboardData.userStats.trend === "increase" 
        ? <FiTrendingUp className="text-green-500 text-2xl" /> 
        : <FiTrendingDown className="text-red-500 text-2xl" />,
      trend: dashboardData.userStats.trend,
      description: "Compared to last month"
    },
    {
      title: "Previous Users",
      value: dashboardData.userStats.previousMonthCount,
      icon: <FiUsers className="text-purple-500 text-2xl" />,
      trend: "neutral",
      description: "Active users last month"
    },
    {
      title: "Top Product Sales",
      value: bestSellers[0]?.sold || 0,
      icon: <FiShoppingBag className="text-amber-500 text-2xl" />,
      trend: "neutral",
      description: bestSellers[0]?.product || "No data"
    }
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 px-4 md:px-6 pb-6 bg-gray-100">

<div className="bg-white rounded-xl shadow-sm w-full lg:w-3/5">
  <div className="p-6">
    <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">Top Performing Products</h2>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 text-gray-600 text-sm">
            <th className="py-3 px-4 w-[45%] text-start">Product</th>
            <th className="py-3 px-4 w-[15%] text-center">Price</th>
            <th className="py-3 px-4 w-[15%] text-center">Sold</th>
            <th className="py-3 px-4 w-[25%] text-center">Revenue</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {bestSellers.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
              <td className="py-4 px-4 text-start">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Uncomment if you want to use product images
                  <div className="flex-shrink-0 w-10 h-10 rounded-md bg-gray-100 overflow-hidden">
                    <img 
                      src={item.img} 
                      alt={item.product}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/images/default-product.png";
                      }}
                    />
                  </div> */}
                  <span className="font-medium text-gray-800">
                    {item.product}
                  </span>
                </div>
              </td>
              <td className="py-4 px-4 text-center text-gray-600 font-medium">
                ${item.price.toFixed(2)}
              </td>
              <td className="py-4 px-4 text-center text-gray-600">
                {item.sold.toLocaleString()}
              </td>
              <td className="py-4 px-4 text-center text-gray-600 font-medium">
                ${item.revenue.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
</div>
   
      <div className="w-full lg:w-2/5">
  <div className="bg-white rounded-xl shadow-sm p-6 h-full">
    <h2 className="text-xl font-semibold text-gray-800 mb-6">User Analytics</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {userStatsCards.map((card, index) => (
        <div 
          key={index} 
          className={`p-4 rounded-lg border ${
            card.trend === 'increase' ? 'border-green-100 bg-green-50' :
            card.trend === 'decrease' ? 'border-red-100 bg-red-50' :
            'border-gray-100 bg-gray-50'
          }`}
        >
          <div className="flex justify-between">
            <div className="pr-2 overflow-hidden"> {/* Added overflow-hidden */}
              <p className="text-xs text-gray-500 whitespace-normal break-words">
                {card.title}
              </p>
              <p className="text-sm font-semibold mt-1 text-gray-800 whitespace-normal break-words">
                {typeof card.value === 'number' ? card.value : card.value}
              </p>
            </div>
            <div className="flex-shrink-0 pl-2"> {/* Added flex-shrink-0 and pl-2 */}
              <div className="p-2 rounded-full bg-white shadow-xs">
                {card.icon}
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 whitespace-normal break-words">
            {card.description}
          </p>
        </div>
      ))}
    </div>
    
    {/* Summary Card */}
    <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 p-2 bg-indigo-100 rounded-full">
          <FiUsers className="text-indigo-600" />
        </div>
        <div className="overflow-hidden"> {/* Added overflow-hidden */}
          <p className="text-sm font-medium text-indigo-800 whitespace-normal break-words">
            User Engagement
          </p>
          <p className="text-xs text-indigo-600 mt-1 whitespace-normal break-words">
            {dashboardData.userStats.trend === 'increase' ? 
              'Growing user base' : 
              'Needs attention'}
          </p>
        </div>
      </div>
      <div className="mt-3 h-2 bg-indigo-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${
            dashboardData.userStats.trend === 'increase' ? 
            'bg-green-500' : 'bg-amber-500'
          }`} 
          style={{
            width: `${Math.min(
              Math.abs(parseFloat(dashboardData.userStats.incrementPercentage || '0')), 
              100
            )}%`
          }}
        ></div>
      </div>
    </div>
  </div>
</div>
    </div>
  );
};

export default BestSellers;


