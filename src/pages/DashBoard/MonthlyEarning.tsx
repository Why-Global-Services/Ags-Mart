import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const data = [
  { month: "Jan", purple: 50, orange: 150, gray: 100 },
  { month: "Feb", purple: 80, orange: 90, gray: 70 },
  { month: "Mar", purple: 100, orange: 110, gray: 90 },
  { month: "Apr", purple: 70, orange: 60, gray: 80 },
  { month: "May", purple: 80, orange: 50, gray: 70 },
  { month: "Jun", purple: 110, orange: 100, gray: 110 },
  { month: "Jul", purple: 90, orange: 120, gray: 100 },
  { month: "Aug", purple: 130, orange: 110, gray: 90 },
  { month: "Sep", purple: 100, orange: 90, gray: 80 },
  { month: "Oct", purple: 120, orange: 80, gray: 70 },
  { month: "Nov", purple: 140, orange: 100, gray: 90 },
  { month: "Dec", purple: 160, orange: 120, gray: 110 },
];

const pieData = [
  { name: "Online", value: 42, color: "#FB923C" },  // Orange
  { name: "Offline", value: 20, color: "#A78BFA" }, // Purple
  { name: "Marketing", value: 12, color: "#E5E7EB" },
];

const MonthlyEarning = () => {
  const [selectedSegment, setSelectedSegment] = useState(pieData[0]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gray-50">
      {/* Line Chart */}
      <div className="md:col-span-2 p-6 shadow-lg rounded-2xl bg-white transition-all duration-300 hover:shadow-xl">
        <h2 className="text-xl font-semibold text-gray-800 mb-5">
          📊 Monthly Earning
        </h2>
        <div className="p-4 border border-green-100 rounded-xl hover:bg-gray-50 transition">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={data}
              margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
            >
              <XAxis dataKey="month" tick={{ fill: "#4B5563" }} stroke="#D1FAE5" />
              <YAxis tick={{ fill: "#4B5563" }} stroke="#D1FAE5" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #E5E7EB",
                }}
              />
              <Legend wrapperStyle={{ paddingTop: "10px" }} />
              <Line
                type="monotone"
                dataKey="purple"
                stroke="#A78BFA"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="orange"
                stroke="#FB923C"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="gray"
                stroke="#9CA3AF"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="p-6 shadow-lg bg-white rounded-2xl flex flex-col items-center transition-all duration-300 hover:shadow-xl">
        <h2 className="text-xl font-semibold text-gray-800 mb-5">
          📈 Sales Analytics
        </h2>
        <div className="flex justify-between w-full px-6 mb-4">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-800">56,241</div>
            <p className="text-gray-500 text-sm">Marketplace</p>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-800">23,651</div>
            <p className="text-gray-500 text-sm">Total Income</p>
          </div>
        </div>
        {/* <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={4}
              dataKey="value"
              onClick={(data) => setSelectedSegment(data)}
              className="cursor-pointer"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer> */}
        <ResponsiveContainer width="100%" height={200}>
  <PieChart>
    <Pie
      data={pieData}
      cx="50%"
      cy="50%"
      innerRadius={50}
      paddingAngle={4}
      dataKey="value"
      onClick={(data) => setSelectedSegment(data)}
      className="cursor-pointer"
    >
      {pieData.map((entry, index) => (
        <Cell 
          key={`cell-${index}`} 
          fill={entry.color}
          outerRadius={
            selectedSegment && selectedSegment.name === entry.name 
              ? 80  // Slightly larger radius for selected segment
              : 70  // Default radius
          }
        />
      ))}
    </Pie>
  </PieChart>
</ResponsiveContainer>
        <p className="text-center mt-3 text-lg font-semibold text-gray-700">
          {selectedSegment.name}
        </p>
        <p className="text-center text-gray-600">{selectedSegment.value}</p>
      </div>
    </div>
  );
};

export default MonthlyEarning;
