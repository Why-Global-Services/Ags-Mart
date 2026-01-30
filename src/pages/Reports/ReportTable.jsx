// import React, { useEffect, useState } from "react";
// import { FaDownload, FaFilter } from "react-icons/fa";
// import DataTable from "react-data-table-component";
// import { Modal, Button, Select, DatePicker } from "antd";
// import { useNavigate } from "react-router-dom";
// import jsPDF from "jspdf";
// import "jspdf-autotable";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   Legend,
//   PieChart,
//   Pie,
//   Cell,
//   BarChart,
//   Bar,
//   CartesianGrid,
// } from "recharts";
// import { getReview } from "../../services/Report";

// const { Option } = Select;

// const COLORS = [
//   "#FF8096",
//   "#FFB347",
//   "#8884d8",
//   "#82ca9d",
//   "#a4de6c",
//   "#d0ed57",
// ];

// const ReportTable = () => {
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [selectedMonth, setSelectedMonth] = useState("This Month");
//   const [reportType, setReportType] = useState("Sales Report");
//   const [dateRange, setDateRange] = useState([]);
//   const [chartFilter, setChartFilter] = useState("all");
//   const [activeIndex, setActiveIndex] = useState(null);
//   const navigate = useNavigate();

//   // Enhanced sales data with more entries
//   const salesData = [
//     {
//       _id: "1",
//       orderId: "ORD123",
//       userName: "Ashwin Kumar",
//       mobile: "9876543210",
//       address: "Chennai, TN",
//       totalAmount: 1499.99,
//       status: "Delivered",
//       endDate: "2025-04-20T00:00:00Z",
//       paymentMethod: "Credit Card",
//       items: 3,
//     },
//     {
//       _id: "2",
//       orderId: "ORD124",
//       userName: "Priya Ramesh",
//       mobile: "9123456780",
//       address: "Bangalore, KA",
//       totalAmount: 2599.0,
//       status: "Pending",
//       endDate: "2025-04-25T00:00:00Z",
//       paymentMethod: "UPI",
//       items: 5,
//     },
//     {
//       _id: "3",
//       orderId: "ORD125",
//       userName: "Rahul Sharma",
//       mobile: "8765432109",
//       address: "Mumbai, MH",
//       totalAmount: 3499.5,
//       status: "Delivered",
//       endDate: "2025-04-15T00:00:00Z",
//       paymentMethod: "Debit Card",
//       items: 2,
//     },
//     {
//       _id: "4",
//       orderId: "ORD126",
//       userName: "Sneha Patel",
//       mobile: "7654321098",
//       address: "Delhi, DL",
//       totalAmount: 1999.0,
//       status: "Cancelled",
//       endDate: "2025-04-10T00:00:00Z",
//       paymentMethod: "Net Banking",
//       items: 4,
//     },
//     {
//       _id: "5",
//       orderId: "ORD127",
//       userName: "Vikram Singh",
//       mobile: "6543210987",
//       address: "Hyderabad, TS",
//       totalAmount: 4499.75,
//       status: "Delivered",
//       endDate: "2025-04-18T00:00:00Z",
//       paymentMethod: "Credit Card",
//       items: 6,
//     },
//   ];

//   // Enhanced inventory data with more entries
//   const inventoryData = [
//     {
//       _id: "inv1",
//       productName: "Lip Stick",
//       sku: "SKU001-LIP-001",
//       unitOfMeasure: "Pieces",
//       totalUnitsSold: 120,
//       totalSales: 143988,
//       category: "Makeup",
//       stock: 85,
//     },
//     {
//       _id: "inv2",
//       productName: "Face Cream",
//       sku: "SKU002-FACE-002",
//       unitOfMeasure: "Pieces",
//       totalUnitsSold: 220,
//       totalSales: 32978,
//       category: "Skincare",
//       stock: 45,
//     },
//     {
//       _id: "inv3",
//       productName: "Compact Powder",
//       sku: "SKU003-COMP-003",
//       unitOfMeasure: "Pieces",
//       totalUnitsSold: 95,
//       totalSales: 85900,
//       category: "Makeup",
//       stock: 30,
//     },
//     {
//       _id: "inv4",
//       productName: "Eyeliner",
//       sku: "SKU004-EYE-004",
//       unitOfMeasure: "Pieces",
//       totalUnitsSold: 150,
//       totalSales: 67900,
//       category: "Makeup",
//       stock: 60,
//     },
//     {
//       _id: "inv5",
//       productName: "Sunscreen",
//       sku: "SKU005-SUN-005",
//       unitOfMeasure: "Pieces",
//       totalUnitsSold: 180,
//       totalSales: 89900,
//       category: "Skincare",
//       stock: 25,
//     },
//     {
//       _id: "inv6",
//       productName: "Shampoo",
//       sku: "SKU006-HAIR-006",
//       unitOfMeasure: "Bottles",
//       totalUnitsSold: 75,
//       totalSales: 44900,
//       category: "Haircare",
//       stock: 40,
//     },
//   ];

//   // useEffect(() => {
//   //   const fetchReport = async () => {
//   //     try {
//   //       const response = await getReview();
//   //       console.log(response,'responce');
        
//   //       setReportData(response.data); 
//   //     } catch (error) {
//   //       console.error('Error fetching review report:', error);
//   //     } finally {
//   //       // setLoading(false);
//   //     }
//   //   };

//   //   fetchReport();
//   // }, []);

//   const CustomTooltip = ({ active, payload, reportType }) => {
//     if (active && payload && payload.length) {
//       const data = payload[0].payload;
//       return (
//         <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
//           <p className="font-bold" style={{ color: payload[0].color }}>
//             {data.name}
//           </p>
//           <p className="text-sm">
//             {data.value} {reportType === "Sales Report" ? "orders" : "units"}
//           </p>
//           <p className="text-sm text-gray-500">
//             {((data.percent || 0) * 100).toFixed(1)}% of total
//           </p>
//         </div>
//       );
//     }
//     return null;
//   };

//   const handleDownloadClick = () => {
//     const doc = new jsPDF();
//     doc.setFontSize(16);
//     doc.text(`${reportType} - ${selectedMonth}`, 14, 20);

//     // Add date range if selected
//     if (dateRange.length === 2) {
//       doc.setFontSize(10);
//       doc.text(
//         `Date Range: ${dateRange[0].format(
//           "YYYY-MM-DD"
//         )} to ${dateRange[1].format("YYYY-MM-DD")}`,
//         14,
//         30
//       );
//     }

//     const head =
//       reportType === "Sales Report"
//         ? [
//             [
//               "S No",
//               "Order ID",
//               "User Name",
//               "Mobile",
//               "Address",
//               "Amount (₹)",
//               "Status",
//               "Payment",
//               "Items",
//               "Date",
//             ],
//           ]
//         : [
//             [
//               "S No",
//               "Product",
//               "SKU",
//               "Category",
//               "Unit",
//               "Sold",
//               "Stock",
//               "Sales (₹)",
//             ],
//           ];

//     const body =
//       reportType === "Sales Report"
//         ? salesData.map((row, i) => [
//             i + 1,
//             row.orderId,
//             row.userName,
//             row.mobile,
//             row.address,
//             `₹${row.totalAmount.toFixed(2)}`,
//             row.status,
//             row.paymentMethod,
//             row.items,
//             new Date(row.endDate).toLocaleDateString(),
//           ])
//         : inventoryData.map((row, i) => [
//             i + 1,
//             row.productName,
//             row.sku,
//             row.category,
//             row.unitOfMeasure,
//             row.totalUnitsSold,
//             row.stock,
//             `₹${row.totalSales.toFixed(2)}`,
//           ]);

//     doc.autoTable({
//       head,
//       body,
//       startY: dateRange.length === 2 ? 40 : 30,
//       styles: { fontSize: 9 },
//       headStyles: { fillColor: [255, 128, 150] },
//       columnStyles: {
//         0: { cellWidth: "auto" },
//         1: { cellWidth: "auto" },
//         2: { cellWidth: "auto" },
//         3: { cellWidth: "auto" },
//         4: { cellWidth: "auto" },
//         5: { cellWidth: "auto" },
//         6: { cellWidth: "auto" },
//         7: { cellWidth: "auto" },
//       },
//     });

//     // Add charts to PDF
//     if (reportType === "Sales Report") {
//       doc.addPage();
//       doc.setFontSize(16);
//       doc.text("Sales Trend", 105, 20, { align: "center" });
//       // Here you would add the chart image if possible
//     }

//     doc.save(
//       `${reportType.replace(" ", "_")}_${new Date()
//         .toISOString()
//         .slice(0, 10)}.pdf`
//     );
//   };

//   const salesColumns = [
//     {
//       name: "S No",
//       selector: (row, index) => index + 1,
//       sortable: true,
//       width: "70px",
//     },
//     {
//       name: "Order ID",
//       selector: (row) => row.orderId,
//       sortable: true,
//       width: "120px",
//     },
//     {
//       name: "User Name",
//       cell: (row) => (
//         <div className="truncate max-w-[150px]" title={row.userName}>
//           {row.userName}
//         </div>
//       ),
//       width: "150px",
//     },
//     { name: "Mobile", selector: (row) => row.mobile, width: "120px" },
//     {
//       name: "Address",
//       cell: (row) => (
//         <div className="truncate max-w-[200px]" title={row.address}>
//           {row.address}
//         </div>
//       ),
//       width: "200px",
//     },
//     {
//       name: "Amount (₹)",
//       selector: (row) => `₹${row.totalAmount}`,
//       sortable: true,
//       width: "120px",
//     },
//     {
//       name: "Status",
//       selector: (row) => row.status,
//       cell: (row) => (
//         <span
//           className={`px-2 py-1 rounded-full text-xs ${
//             row.status === "Delivered"
//               ? "bg-green-100 text-green-800"
//               : row.status === "Pending"
//               ? "bg-yellow-100 text-yellow-800"
//               : "bg-red-100 text-red-800"
//           }`}
//         >
//           {row.status}
//         </span>
//       ),
//       width: "100px",
//     },
//     {
//       name: "Payment",
//       selector: (row) => row.paymentMethod,
//       width: "120px",
//     },
//     {
//       name: "Items",
//       selector: (row) => row.items,
//       width: "80px",
//     },
//     {
//       name: "Date",
//       selector: (row) =>
//         row.endDate ? new Date(row.endDate).toLocaleDateString() : "N/A",
//       sortable: true,
//       width: "100px",
//     },
//     {
//       name: "Actions",
//       cell: () => (
//         <button
//           onClick={handleDownloadClick}
//           className="bg-blue-100 text-blue-600 p-2 rounded hover:bg-blue-200 transition-colors"
//           title="Download Report"
//         >
//           <FaDownload />
//         </button>
//       ),
//       width: "80px",
//     },
//   ];

//   const inventoryColumns = [
//     { name: "S No", selector: (row, index) => index + 1, width: "70px" },
//     {
//       name: "Product",
//       selector: (row) => row.productName,
//       width: "150px",
//     },
//     {
//       name: "SKU",
//       selector: (row) => row.sku,
//       width: "150px",
//     },
//     {
//       name: "Category",
//       selector: (row) => row.category,
//       width: "120px",
//     },
//     {
//       name: "Unit",
//       selector: (row) => row.unitOfMeasure,
//       width: "100px",
//     },
//     {
//       name: "Sold",
//       selector: (row) => row.totalUnitsSold,
//       sortable: true,
//       width: "80px",
//     },
//     {
//       name: "Stock",
//       selector: (row) => row.stock,
//       sortable: true,
//       cell: (row) => (
//         <span
//           className={`px-2 py-1 rounded-full text-xs ${
//             row.stock > 50
//               ? "bg-green-100 text-green-800"
//               : row.stock > 20
//               ? "bg-yellow-100 text-yellow-800"
//               : "bg-red-100 text-red-800"
//           }`}
//         >
//           {row.stock}
//         </span>
//       ),
//       width: "80px",
//     },
//     {
//       name: "Sales (₹)",
//       selector: (row) => `₹${row.totalSales.toFixed(2)}`,
//       sortable: true,
//       width: "120px",
//     },
//     {
//       name: "Actions",
//       cell: () => (
//         <button
//           onClick={handleDownloadClick}
//           className="bg-blue-100 text-blue-600 p-2 rounded hover:bg-blue-200 transition-colors"
//           title="Download Report"
//         >
//           <FaDownload />
//         </button>
//       ),
//       width: "80px",
//     },
//   ];

//   const customStyles = {
//     headCells: {
//       style: {
//         backgroundColor: "#FF8096",
//         color: "#fff",
//         fontWeight: "bold",
//         padding: "12px 16px",
//       },
//     },
//     cells: {
//       style: { padding: "8px 12px" },
//     },
//   };

//   // Enhanced graph data with more metrics
//   const graphData = [
//     { name: "Jan", Sales: 2400, Orders: 42, Returns: 3 },
//     { name: "Feb", Sales: 1398, Orders: 38, Returns: 2 },
//     { name: "Mar", Sales: 9800, Orders: 128, Returns: 8 },
//     { name: "Apr", Sales: 3908, Orders: 56, Returns: 4 },
//     { name: "May", Sales: 4800, Orders: 72, Returns: 5 },
//     { name: "Jun", Sales: 6800, Orders: 94, Returns: 6 },
//     { name: "Jul", Sales: 7300, Orders: 105, Returns: 7 },
//   ];

//   // Enhanced pie data with categories
//   const pieData =
//     reportType === "Sales Report"
//       ? [
//           {
//             name: "Delivered",
//             value: salesData.filter((d) => d.status === "Delivered").length,
//           },
//           {
//             name: "Pending",
//             value: salesData.filter((d) => d.status === "Pending").length,
//           },
//           {
//             name: "Cancelled",
//             value: salesData.filter((d) => d.status === "Cancelled").length,
//           },
//         ]
//       : [
//           ...inventoryData
//             .filter(
//               (item) => chartFilter === "all" || item.category === chartFilter
//             )
//             .map((item) => ({
//               name: item.productName,
//               value: item.totalUnitsSold,
//               category: item.category,
//             })),
//         ];

//   // Filtered graph data based on selected month
//   const filteredGraphData =
//     selectedMonth === "This Month"
//       ? graphData.slice(3)
//       : selectedMonth === "Last Month"
//       ? graphData.slice(2, 5)
//       : graphData;

//   return (
//     <div className="p-4 w-full bg-gray-50">
//       <div className="bg-white min-h-[calc(100vh-100px)] p-6 shadow-sm rounded-lg overflow-x-auto">
//       <h2 className="text-xl font-semibold text-gray-800 w-full mb-5  text-center md:text-left">
//             {reportType} Analytics
//           </h2>
//         <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          
//           <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full">
//             <Select
//               className="w-full sm:min-w-[180px] sm:flex-1"
//               value={reportType}
//               onChange={setReportType}
//             >
//               <Option value="Sales Report">Sales Report</Option>
//               <Option value="Inventory Report">Inventory Report</Option>
//             </Select>

//             <Select
//               className="w-full sm:min-w-[150px] sm:flex-1"
//               value={selectedMonth}
//               onChange={setSelectedMonth}
//             >
//               <Option value="This Month">This Month</Option>
//               <Option value="Last Month">Last Month</Option>
//               <Option value="Last 3 Months">Last 3 Months</Option>
//               <Option value="Last 6 Months">Last 6 Months</Option>
//               <Option value="This Year">This Year</Option>
//             </Select>

//             <DatePicker.RangePicker
//               value={dateRange}
//               onChange={setDateRange}
//               className="w-full sm:min-w-[240px] sm:flex-1"
//             />

//             <button
//               onClick={handleDownloadClick}
//               className="w-full sm:w-auto flex items-center justify-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors"
//             >
//               <FaDownload /> Export PDF
//             </button>
//           </div>
//         </div>

//         {/* Combined Chart Section */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
//           {/* Summary Cards */}
//           <div className="bg-gradient-to-r from-pink-50 to-pink-100 p-4 rounded-lg border border-pink-200">
//             <h3 className="text-sm font-medium text-pink-800">
//               Total {reportType === "Sales Report" ? "Sales" : "Units Sold"}
//             </h3>
//             <p className="text-2xl font-bold text-pink-600 mt-2">
//               {reportType === "Sales Report"
//                 ? `₹${salesData
//                     .reduce((sum, item) => sum + item.totalAmount, 0)
//                     .toLocaleString()}`
//                 : inventoryData
//                     .reduce((sum, item) => sum + item.totalUnitsSold, 0)
//                     .toLocaleString()}
//             </p>
//             <p className="text-xs text-pink-500 mt-1">
//               {selectedMonth} •{" "}
//               {dateRange.length === 2
//                 ? `${dateRange[0].format("MMM D")}-${dateRange[1].format(
//                     "MMM D"
//                   )}`
//                 : "All dates"}
//             </p>
//           </div>

//           <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
//             <h3 className="text-sm font-medium text-blue-800">
//               {reportType === "Sales Report" ? "Total Orders" : "Categories"}
//             </h3>
//             <p className="text-2xl font-bold text-blue-600 mt-2">
//               {reportType === "Sales Report"
//                 ? salesData.length
//                 : new Set(inventoryData.map((item) => item.category)).size}
//             </p>
//             <p className="text-xs text-blue-500 mt-1">
//               {selectedMonth} •{" "}
//               {reportType === "Sales Report" ? "Completed" : "Active"}
//             </p>
//           </div>

//           <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
//             <h3 className="text-sm font-medium text-purple-800">
//               {reportType === "Sales Report"
//                 ? "Avg. Order Value"
//                 : "Avg. Units Sold"}
//             </h3>
//             <p className="text-2xl font-bold text-purple-600 mt-2">
//               {reportType === "Sales Report"
//                 ? `₹${(
//                     salesData.reduce((sum, item) => sum + item.totalAmount, 0) /
//                     salesData.length
//                   ).toFixed(2)}`
//                 : (
//                     inventoryData.reduce(
//                       (sum, item) => sum + item.totalUnitsSold,
//                       0
//                     ) / inventoryData.length
//                   ).toFixed(2)}
//             </p>

//             <p className="text-xs text-purple-500 mt-1">
//               {selectedMonth} • Per{" "}
//               {reportType === "Sales Report" ? "order" : "product"}
//             </p>
//           </div>
//         </div>

//         {/* Charts Section */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
//           {/* Line/Bar Chart */}
//           <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm lg:col-span-2">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="font-semibold text-gray-700">
//                 {reportType === "Sales Report"
//                   ? "Sales Trend"
//                   : "Inventory Movement"}
//               </h3>
//               <div className="flex items-center gap-2">
//                 <FaFilter className="text-gray-500" />
//                 <Select
//                   size="small"
//                   defaultValue="all"
//                   onChange={(val) => setChartFilter(val)}
//                   className="w-32"
//                 >
//                   <Option value="all">All Data</Option>
//                   {reportType === "Sales Report" ? (
//                     <>
//                       <Option value="Sales">Sales</Option>
//                       <Option value="Orders">Orders</Option>
//                       <Option value="Returns">Returns</Option>
//                     </>
//                   ) : (
//                     inventoryData
//                       .reduce((categories, item) => {
//                         if (!categories.includes(item.category)) {
//                           categories.push(item.category);
//                         }
//                         return categories;
//                       }, [])
//                       .map((category) => (
//                         <Option key={category} value={category}>
//                           {category}
//                         </Option>
//                       ))
//                   )}
//                 </Select>
//               </div>
//             </div>
//             <div className="h-80">
//               <ResponsiveContainer width="100%" height="100%">
//                 {reportType === "Sales Report" ? (
//                   <LineChart data={filteredGraphData}>
//                     <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
//                     <XAxis dataKey="name" />
//                     <YAxis />
//                     <Tooltip
//                       contentStyle={{
//                         background: "rgba(255, 255, 255, 0.9)",
//                         border: "1px solid #e2e8f0",
//                         borderRadius: "6px",
//                         boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
//                       }}
//                     />
//                     <Legend />
//                     <Line
//                       type="monotone"
//                       dataKey="Sales"
//                       stroke="#FF8096"
//                       strokeWidth={3}
//                       dot={{ r: 4 }}
//                       activeDot={{ r: 6 }}
//                     />
//                     <Line
//                       type="monotone"
//                       dataKey="Orders"
//                       stroke="#8884d8"
//                       strokeWidth={2}
//                       dot={{ r: 4 }}
//                     />
//                   </LineChart>
//                 ) : (
//                   <BarChart data={inventoryData}>
//                     <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
//                     <XAxis dataKey="productName" />
//                     <YAxis />
//                     <Tooltip
//                       contentStyle={{
//                         background: "rgba(255, 255, 255, 0.9)",
//                         border: "1px solid #e2e8f0",
//                         borderRadius: "6px",
//                         boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
//                       }}
//                     />
//                     <Legend />
//                     <Bar
//                       dataKey="totalUnitsSold"
//                       name="Units Sold"
//                       fill="#8884d8"
//                       radius={[4, 4, 0, 0]}
//                     />
//                     <Bar
//                       dataKey="stock"
//                       name="Current Stock"
//                       fill="#82ca9d"
//                       radius={[4, 4, 0, 0]}
//                     />
//                   </BarChart>
//                 )}
//               </ResponsiveContainer>
//             </div>
//           </div>

//           {/* Pie Chart */}
//           <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="font-semibold text-gray-700">
//                 {reportType === "Sales Report"
//                   ? "Order Status"
//                   : "Product Distribution"}
//               </h3>
//               {reportType === "Inventory Report" && (
//                 <div className="flex items-center gap-2">
//                   <FaFilter className="text-gray-500" />
//                   <Select
//                     size="small"
//                     value={chartFilter}
//                     onChange={setChartFilter}
//                     className="w-32"
//                   >
//                     <Option value="all">All Categories</Option>
//                     {Array.from(
//                       new Set(inventoryData.map((item) => item.category))
//                     ).map((category) => (
//                       <Option key={category} value={category}>
//                         {category}
//                       </Option>
//                     ))}
//                   </Select>
//                 </div>
//               )}
//             </div>
//             <div className="h-80 relative">
//               <ResponsiveContainer width="100%" height="100%">
//                 <PieChart>
//                   {/* Semi-transparent background pie for depth effect */}
//                   <Pie
//                     data={pieData}
//                     dataKey="value"
//                     cx="50%"
//                     cy="50%"
//                     outerRadius={80}
//                     innerRadius={60}
//                     fill="#8884d8"
//                     fillOpacity={0.1}
//                     stroke="none"
//                   />

//                   {/* Main pie with modern effects */}
//                   <Pie
//                     data={pieData}
//                     dataKey="value"
//                     nameKey="name"
//                     cx="50%"
//                     cy="50%"
//                     innerRadius={60}
//                     outerRadius={80}
//                     cornerRadius={10}
//                     padAngle={2}
//                     startAngle={90}
//                     endAngle={-270}
//                   >
//                     {pieData.map((entry, index) => (
//                       <Cell
//                         key={`cell-${index}`}
//                         fill={COLORS[index % COLORS.length]}
//                         stroke="#fff"
//                         strokeWidth={2}
//                         style={{
//                           filter: `drop-shadow(0px 0px 4px ${
//                             COLORS[index % COLORS.length]
//                           }80)`,
//                         }}
//                       />
//                     ))}
//                   </Pie>

//                   {/* Center circle with summary info */}
//                   <circle cx="50%" cy="50%" r="40" fill="#fff" />
//                   <text
//                     x="50%"
//                     y="45%"
//                     textAnchor="middle"
//                     dominantBaseline="middle"
//                     className="text-lg font-bold"
//                     fill="#4a5568"
//                   >
//                     {pieData.reduce((sum, item) => sum + item.value, 0)}
//                   </text>
//                   <text
//                     x="50%"
//                     y="55%"
//                     textAnchor="middle"
//                     dominantBaseline="middle"
//                     className="text-xs"
//                     fill="#718096"
//                   >
//                     {reportType === "Sales Report" ? "Orders" : "Products"}
//                   </text>

//                   {/* Custom active shape for hover effect */}
//                   <Pie
//                     data={pieData}
//                     dataKey="value"
//                     cx="50%"
//                     cy="50%"
//                     innerRadius={60}
//                     outerRadius={90}
//                     activeIndex={activeIndex}
//                     activeShape={(props) => {
//                       const {
//                         cx,
//                         cy,
//                         innerRadius,
//                         outerRadius,
//                         startAngle,
//                         endAngle,
//                         fill,
//                         payload,
//                         percent,
//                         value,
//                       } = props;

//                       return (
//                         <g>
//                           <path
//                             d={`
//                     M${cx},${cy}
//                     L${
//                       cx + outerRadius * Math.cos((-startAngle * Math.PI) / 180)
//                     },${
//                               cy +
//                               outerRadius *
//                                 Math.sin((-startAngle * Math.PI) / 180)
//                             }
//                     A${outerRadius},${outerRadius} 0 ${
//                               endAngle - startAngle > 180 ? 1 : 0
//                             },1 ${
//                               cx +
//                               outerRadius *
//                                 Math.cos((-endAngle * Math.PI) / 180)
//                             },${
//                               cy +
//                               outerRadius *
//                                 Math.sin((-endAngle * Math.PI) / 180)
//                             }
//                     L${cx},${cy}
//                     Z
//                   `}
//                             fill={fill}
//                             stroke="#fff"
//                             strokeWidth={2}
//                           />
//                           <text
//                             x={
//                               cx +
//                               (outerRadius + 20) *
//                                 Math.cos(
//                                   (-((startAngle + endAngle) / 2) * Math.PI) /
//                                     180
//                                 )
//                             }
//                             y={
//                               cy +
//                               (outerRadius + 20) *
//                                 Math.sin(
//                                   (-((startAngle + endAngle) / 2) * Math.PI) /
//                                     180
//                                 )
//                             }
//                             textAnchor="middle"
//                             dominantBaseline="middle"
//                             fill="#4a5568"
//                             className="text-xs font-medium"
//                           >
//                             {`${payload.name}: ${value}`}
//                           </text>
//                         </g>
//                       );
//                     }}
//                     onMouseEnter={(_, index) => setActiveIndex(index)}
//                     onMouseLeave={() => setActiveIndex(null)}
//                   >
//                     {pieData.map((entry, index) => (
//                       <Cell
//                         key={`cell-${index}`}
//                         fill="transparent"
//                         stroke="transparent"
//                       />
//                     ))}
//                   </Pie>

//                   <Tooltip
//                     content={<CustomTooltip reportType={reportType} />}
//                   />
//                 </PieChart>
//               </ResponsiveContainer>
//             </div>
//           </div>
//         </div>

//         {/* DataTable */}
//         <div className="mb-4 rounded-lg">
//           <h3 className="font-semibold text-gray-700 mb-2">
//             Detailed {reportType === "Sales Report" ? "Orders" : "Inventory"}{" "}
//             Data
//           </h3>
//           <DataTable
//             columns={
//               reportType === "Sales Report" ? salesColumns : inventoryColumns
//             }
//             data={reportType === "Sales Report" ? salesData : inventoryData}
//             pagination
//             paginationPerPage={10}
//             fixedHeaderScrollHeight="600px"
//             customStyles={customStyles}
//             highlightOnHover
//             responsive
//           />
//         </div>
//       </div>

//       <Modal
//         title="Confirm Delete"
//         open={showDeleteModal}
//         onOk={() => setShowDeleteModal(false)}
//         onCancel={() => setShowDeleteModal(false)}
//         footer={[
//           <Button key="back" onClick={() => setShowDeleteModal(false)}>
//             Cancel
//           </Button>,
//           <Button
//             key="submit"
//             type="primary"
//             danger
//             onClick={() => setShowDeleteModal(false)}
//           >
//             Delete
//           </Button>,
//         ]}
//       >
//         <p>Are you sure you want to delete this item?</p>
//       </Modal>
//     </div>
//   );
// }; 

// export default ReportTable;

import React, { useState, useEffect } from "react";
import { FaDownload, FaFilter, FaStar, FaEye } from "react-icons/fa";
import DataTable from "react-data-table-component";
import { Modal, Button, Select, DatePicker, Spin, message } from "antd";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
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
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";
import { getReport, getReportInventory } from "../../services/Report";

const { Option } = Select;

const COLORS = ["#FF8096", "#FFB347", "#8884d8", "#82ca9d", "#a4de6c", "#d0ed57"];

const ReportTable = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("This Month");
  const [reportType, setReportType] = useState("Sales Report");
  const [dateRange, setDateRange] = useState([]);
  const [chartFilter, setChartFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [salesData, setSalesData] = useState([]);
  const [stats, setStats] = useState(null);
  const [graphData, setGraphData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  const timeMap = {
    "This Month": "ThisMonth",
    "Last Month": "LastMonth",
    "Last 3 Months": "Last3Months",
    "Last 6 Months": "Last6Months",
    "This Year": "ThisYear",
  };

  const fetchSalesReport = async () => {
    try {
      setLoading(true);
      const params = {
        time: !dateRange || dateRange.length !== 2 ? timeMap[selectedMonth] : "Custom",
        ...(dateRange && dateRange.length === 2 && {
          startDate: dateRange[0]?.format("YYYY-MM-DD"),
          endDate: dateRange[1]?.format("YYYY-MM-DD"),
        }),
      };

      const response = await getReport(params);
      setSalesData(response.orders);
      setStats(response.stats);
      setGraphData(response.stats.graphData);
      message.success("Sales report data fetched successfully");
    } catch (error) {
      console.error("Error fetching sales report:", error);
      message.error("Failed to fetch sales report data");
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryReport = async () => {
    try {
      setLoading(true);
      const params = {
        time: !dateRange || dateRange.length !== 2 ? timeMap[selectedMonth] : "Custom",
        ...(dateRange && dateRange.length === 2 && {
          startDate: dateRange[0]?.format("YYYY-MM-DD"),
          endDate: dateRange[1]?.format("YYYY-MM-DD"),
        }),
      };
      const response = await getReportInventory(params);
      // Map inventory data to match the columns structure
      const mappedProducts = response.data.productsData.map((product) => ({
        productName: product.nonVarient[0]?.productName || "N/A",
        productImage: product.nonVarient[0]?.image || null, // Assuming image is available in nonVarient
        sku: product.inventory.sku,
        category: product.category || "-",
        brand: product.brand || "-", // Adjust if brand is available in API
        finalPrice: product.nonVarient[0]?.price || 0,
        totalReviews: product.totalReviews || 0, // Adjust if reviews are available
        averageRating: product.averageRating || 0, // Adjust if ratings are available
        totalUnitsSold: product.unitsSold || 0,
        stock: product.nonVarient[0]?.stockCount || 0,
        totalSales: (product.nonVarient[0]?.price || 0) * (product.unitsSold || 0),
      }));
      setSalesData(mappedProducts);
      setStats({
        totalUnitsSold: response.data.stats.unitsReport || 0,
        averageUnitsSold: response.data.stats.roundedAverageOfAverages || 0,
        totalCategories: response.data.stats.categorydata || 0,
      });
      setGraphData(
        response.data.productsData.map((product, index) => ({
          month: `Product ${index + 1}`,
          unitsSold: product.unitsSold || 0,
          stock: product.nonVarient[0]?.stockCount || 0,
        }))
      );
      message.success("Inventory report data fetched successfully");
    } catch (error) {
      console.error("Error fetching inventory report:", error);
      message.error("Failed to fetch inventory report data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reportType === "Sales Report") {
      fetchSalesReport();
    } else {
      fetchInventoryReport();
    }
  }, [reportType, selectedMonth, dateRange]);

  const CustomTooltip = ({ active, payload, reportType }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-bold" style={{ color: payload[0].color }}>
            {data.name}
          </p>
          <p className="text-sm">
            {data.value} {reportType === "Sales Report" ? "orders" : "units"}
          </p>
          <p className="text-sm text-gray-500">
            {((data.percent || 0) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  const toggleModal = (row) => {
    // Implement modal toggle logic for viewing reviews
    console.log("View reviews for:", row);
  };

  const handleDownloadClick = async () => {
    try {
      setLoading(true);
      message.info("Generating PDF report...");

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      doc.setFontSize(18);
      doc.setTextColor(40);
      doc.setFont("helvetica", "bold");
      doc.text(`${reportType} - ${selectedMonth}`, 105, 15, { align: "center" });

      if (dateRange.length === 2) {
        doc.setFontSize(10);
        doc.text(
          `Date Range: ${dateRange[0].format("YYYY-MM-DD")} to ${dateRange[1].format("YYYY-MM-DD")}`,
          105,
          22,
          { align: "center" }
        );
      }

      doc.setFontSize(14);
      doc.text("Summary Statistics", 14, 40);

      doc.autoTable({
        startY: 45,
        head: [["Metric", "Value"]],
        body:
          reportType === "Sales Report"
            ? [
                ["Total Orders", stats.totalOrders],
                ["Total Sales", `₹${stats.totalSales.toLocaleString()}`],
                ["Average Order Value", `₹${stats.averageOrderValue.toLocaleString()}`],
                ["Delivered Orders", stats.orderDelivered],
                ["Pending Orders", stats.orderPending],
                ["Cancelled Orders", stats.orderCancelled],
              ]
            : [
                ["Total Units Sold", stats.totalUnitsSold],
                ["Average Units Sold", stats.averageUnitsSold],
                ["Total Categories", stats.totalCategories],
              ],
        theme: "grid",
        headStyles: {
          fillColor: [255, 128, 150],
          textColor: 255,
          fontStyle: "bold",
        },
      });

      doc.setFontSize(14);
      doc.text("Detailed Data", 14, doc.lastAutoTable.finalY + 10);
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 15,
        head:
          reportType === "Sales Report"
            ? [
                ["S No", "Order ID", "Total Price", "Status", "Payment", "Items", "Date"],
              ]
            : [
                [
                  "S No",
                  "Images",
                  "Product",
                  "Category",
                  "Brand",
                  "Price",
                  "Total Reviews",
                  "Avg Rating",
                  "Actions",
                ],
              ],
        body: salesData.map((item, index) =>
          reportType === "Sales Report"
            ? [
                index + 1,
                item.orderId,
                `₹${item.totalPrice}`,
                item.orderStatus,
                item.paymentMethod,
                item.orderDetails.length,
                item.createdAt
                  ? new Date(item.createdAt).toLocaleDateString()
                  : "N/A",
              ]
            : [
                index + 1,
                "-", // Images (not included in PDF)
                item.productName,
                item.category,
                item.brand,
                `₹${item.finalPrice}`,
                item.totalReviews,
                item.averageRating.toFixed(1),
                "-", // Actions (not included in PDF)
              ]
        ),
        theme: "grid",
        headStyles: {
          fillColor: [255, 128, 150],
          textColor: 255,
          fontStyle: "bold",
        },
      });

      doc.save(
        `${reportType.replace(/\s+/g, "_")}_${selectedMonth.replace(/\s+/g, "_")}.pdf`
      );

      message.success("PDF report generated successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      message.error("Failed to generate PDF report");
    } finally {
      setLoading(false);
    }
  };

  const salesColumns = [
    {
      name: "S No",
      cell: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
      sortable: true,
      width: "80px",
      center: true,
    },
    {
      name: "Order ID",
      selector: (row) => row.orderId,
      sortable: true,
      width: "300px",
    },
    {
      name: "Total Price (₹)",
      selector: (row) => `₹${row.totalPrice}`,
      sortable: true,
      width: "200px",
      center: true,
    },
    {
      name: "Status",
      selector: (row) => row.orderStatus,
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.orderStatus === "Delivered"
              ? "bg-green-100 text-green-800"
              : row.orderStatus === "Pending"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.orderStatus}
        </span>
      ),
      width: "200px",
      center: true,
    },
    {
      name: "Payment",
      selector: (row) => row.paymentMethod,
      width: "200px",
    },
    {
      name: "Items",
      selector: (row) => row.orderDetails.length,
      width: "150px",
      center: true,
    },
    {
      name: "Date",
      selector: (row) =>
        row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "N/A",
      sortable: true,
      width: "200px",
      center: true,
    },
    {
      name: "Actions",
      cell: () => (
        <button
          onClick={handleDownloadClick}
          className="bg-blue-100 text-blue-600 p-2  cursor-pointer rounded hover:bg-blue-200 transition-colors"
          title="Download Report"
        >
          <FaDownload />
        </button>
      ),
      width: "100px",
      center: true,
    },
  ];

  const inventoryColumns = [
    {
      name: "S.No",
      cell: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
      width: "80px",
      center: true,
    },
    {
      name: "Images",
      cell: (row) => (
        <div>
          {row.productImage ? (
            <img
              src={
                Array.isArray(row.productImage)
                  ? row.productImage?.[0]
                  : row.productImage
              }
              alt={row.productName}
              className="w-10 h-10 object-cover rounded-md ml-6"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/40";
              }}
            />
          ) : (
            <div className="w-10 h-10 bg-gray-100 flex items-center justify-center rounded-md">
              -
            </div>
          )}
        </div>
      ),
      width: "80px",
    },
    {
      name: "Product Name",
      width: "300px",
      cell: (row) => (
        <div className="flex items-center space-x-4">
          <p className="truncate">{row.productName}</p>
        </div>
      ),
    },
    {
      name: "Category",
      selector: (row) => row.category || "-",
      width: "200px",
    },
    {
      name: "Brand",
      selector: (row) => row.brand || "-",
      width: "200px",
    },
    {
      name: "Price",
      cell: (row) => `₹${row.finalPrice || "-"}`,
      width: "200px",
      center: true,
    },
    {
      name: "Total Reviews",
      selector: (row) => row.totalReviews || 0,
      width: "150px",
      center: true,
    },
    {
      name: "Avg Rating",
      cell: (row) => (
        <div className="flex items-center space-x-1">
          <span className="text-yellow-400 p-1 rounded">
            <FaStar />
          </span>
          <span className="text-gray-800 text-sm font-medium">
            {row.averageRating?.toFixed(1) || "-"}
          </span>
        </div>
      ),
      width: "200px",
      center: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => toggleModal(row)}
            className="bg-gray-100 text-gray-800 p-2 rounded cursor-pointer hover:bg-gray-200"
            aria-label="View reviews"
          >
            <FaEye />
          </button>
        </div>
      ),
      width: "100px",
      center: true,
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: "var(--color-table)", // Pink header background
        color: "#fff", // White text for headers
        fontWeight: "600",
        padding: "12px 10px",
        fontSize: "14px",
        lineHeight: "1.5",
        fontFamily: "var(--font-fonttitle)",
        textAlign: "center",
        justifyContent: "center",
        whiteSpace: "normal",
        wordBreak: "break-word",
      },
    },
    cells: {
      style: {
        padding: "12px 10px",
        fontSize: "14px",
        fontFamily: "var(--font-fontcontent)",
        textAlign: "center",
        justifyContent: "center",
        whiteSpace: "normal",
        wordBreak: "break-word",
        borderRight: "1px solid #e5e7eb", // Vertical border for cells
        "&:last-child": {
          borderRight: "none", // Remove border for last cell in row
        },
      },
    },
    rows: {
      style: {
        borderBottom: "1px solid #e5e7eb", // Horizontal border for rows
        margin: "0",
        padding: "0",
        width: "100%",
        minHeight: "50px",
      },
    },
    table: {
      style: {
        width: "100%",
        tableLayout: "fixed", // Fixed table layout for consistent column widths
        borderCollapse: "collapse", // Ensure borders are merged
      },
    },
    subHeader: {
      style: {
        padding: "0",
        margin: "0",
      },
    },
  };

  const pieData =
    reportType === "Sales Report" && stats
      ? [
          { name: "Delivered", value: stats.orderDelivered },
          { name: "Pending", value: stats.orderPending },
          { name: "Cancelled", value: stats.orderCancelled },
        ]
      : [];

  return (
    <div className="p-4 w-full bg-gray-50">
      <div className="bg-white min-h-[calc(100vh-100px)] p-6 shadow-sm rounded-lg overflow-x-auto px-14">
        <h2 className="text-xl font-semibold text-gray-800 w-full mb-5 text-center md:text-left">
          {reportType} Analytics
        </h2>

        {loading && (
          <div className="flex justify-center my-8">
            <Spin size="large" />
          </div>
        )}

        {!loading && (
          <>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full">
                <Select
                  className="w-full sm:min-w-[180px] sm:flex-1"
                  value={reportType}
                  onChange={setReportType}
                >
                  <Option value="Sales Report">Sales Report</Option>
                  <Option value="Inventory Report">Inventory Report</Option>
                </Select>

                <Select
                  className="w-full sm:min-w-[150px] sm:flex-1"
                  value={selectedMonth}
                  onChange={setSelectedMonth}
                  disabled={dateRange.length > 0}
                >
                  <Option value="This Month">This Month</Option>
                  <Option value="Last Month">Last Month</Option>
                  <Option value="Last 3 Months">Last 3 Months</Option>
                  <Option value="Last 6 Months">Last 6 Months</Option>
                  <Option value="This Year">This Year</Option>
                </Select>

                <DatePicker.RangePicker
                  value={dateRange.length ? dateRange : null}
                  onChange={(dates) => {
                    if (!dates) {
                      setDateRange([]);
                      setSelectedMonth("This Month");
                    } else {
                      setDateRange(dates);
                      if (dates.length === 2) {
                        setSelectedMonth("Custom Range");
                      }
                    }
                  }}
                  className="w-full sm:min-w-[240px] sm:flex-1 cursor-pointer"
                />

                <div className="flex gap-3">
              {/* Export to Excel Button */}
              <button
                 onClick={handleDownloadClick}
                className="flex items-center cursor-pointer justify-center w-10 h-10 rounded-full bg-white border border-gray-300 hover:bg-green-100 hover:border-green-500 transition-all duration-300 shadow-sm"
                title="Export to Excel"
              >
                <FaDownload className="text-secondary hover:text-green-600 w-4 h-4" />
              </button>
            </div>
              </div>
            </div>

            {stats && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-r from-pink-50 to-pink-100 p-4 rounded-lg border border-pink-200">
                  <h3 className="text-sm font-medium text-pink-800">
                    Total {reportType === "Sales Report" ? "Sales" : "Units Sold"}
                  </h3>
                  <p className="text-2xl font-bold text-pink-600 mt-2">
                    {reportType === "Sales Report"
                      ? `₹${stats.totalSales.toLocaleString()}`
                      : stats.totalUnitsSold?.toLocaleString() || "N/A"}
                  </p>
                  <p className="text-xs text-pink-500 mt-1">
                    {selectedMonth} •{" "}
                    {dateRange.length === 2
                      ? `${dateRange[0].format("MMM D")}-${dateRange[1].format("MMM D")}`
                      : "All dates"}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <h3 className="text-sm font-medium text-blue-800">
                    {reportType === "Sales Report" ? "Total Orders" : "Categories"}
                  </h3>
                  <p className="text-2xl font-bold text-blue-600 mt-2">
                    {reportType === "Sales Report"
                      ? stats.totalOrders
                      : stats.totalCategories || "N/A"}
                  </p>
                  <p className="text-xs text-blue-500 mt-1">
                    {selectedMonth} •{" "}
                    {reportType === "Sales Report" ? "Completed" : "Active"}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                  <h3 className="text-sm font-medium text-purple-800">
                    {reportType === "Sales Report"
                      ? "Avg. Order Value"
                      : "Avg. Units Sold"}
                  </h3>
                  <p className="text-2xl font-bold text-purple-600 mt-2">
                    {reportType === "Sales Report"
                        ? `₹${stats.averageOrderValue?.toFixed(2) || "0.00"}`
                        : (stats.averageUnitsSold?.toFixed(2) || "0.00")}
                  </p>
                  <p className="text-xs text-purple-500 mt-1">
                    {selectedMonth} • Per{" "}
                    {reportType === "Sales Report" ? "order" : "product"}
                  </p>
                </div>
              </div>
            )}

            {stats && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm lg:col-span-2">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-700">
                      {reportType === "Sales Report"
                        ? "Sales Trend"
                        : "Inventory Movement"}
                    </h3>
                    <div className="flex items-center gap-2">
                      <FaFilter className="text-gray-500" />
                      <Select
                        size="small"
                        defaultValue="all"
                        onChange={(val) => setChartFilter(val)}
                        className="w-32"
                      >
                        <Option value="all">All Data</Option>
                        {reportType === "Sales Report" ? (
                          <>
                            <Option value="Sales">Sales</Option>
                            <Option value="Orders">Orders</Option>
                            <Option value="Returns">Returns</Option>
                          </>
                        ) : (
                          <Option value="units">Units</Option>
                        )}
                      </Select>
                    </div>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      {reportType === "Sales Report" ? (
                        <LineChart data={graphData}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip
                            contentStyle={{
                              background: "rgba(255, 255, 255, 0.9)",
                              border: "1px solid #e2e8f0",
                              borderRadius: "6px",
                              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            }}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="Sales"
                            stroke="#FF8096"
                            strokeWidth={3}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="Orders"
                            stroke="#8884d8"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                          />
                        </LineChart>
                      ) : (
                        <BarChart data={graphData}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip
                            contentStyle={{
                              background: "rgba(255, 255, 255, 0.9)",
                              border: "1px solid #e2e8f0",
                              borderRadius: "6px",
                              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            }}
                          />
                          <Legend />
                          <Bar
                            dataKey="unitsSold"
                            name="Units Sold"
                            fill="#8884d8"
                            radius={[4, 4, 0, 0]}
                          />
                          <Bar
                            dataKey="stock"
                            name="Current Stock"
                            fill="#82ca9d"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>

                {reportType === "Sales Report" && (
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-gray-700">
                        Order Status Distribution
                      </h3>
                    </div>
                    <div className="h-80 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            cornerRadius={10}
                            padAngle={2}
                            startAngle={90}
                            endAngle={-270}
                          >
                            {pieData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                                stroke="#fff"
                                strokeWidth={2}
                                style={{
                                  filter: `drop-shadow(0px 0px 4px ${COLORS[index % COLORS.length]}80)`,
                                }}
                              />
                            ))}
                          </Pie>
                          <circle cx="50%" cy="50%" r="40" fill="#fff" />
                          <text
                            x="50%"
                            y="45%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-lg font-bold"
                            fill="#4a5568"
                          >
                            {stats.totalOrders}
                          </text>
                          <text
                            x="50%"
                            y="55%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-xs"
                            fill="#718096"
                          >
                            Total Orders
                          </text>
                          <Tooltip content={<CustomTooltip reportType={reportType} />} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mb-4 rounded-lg w-full">
              <h3 className="font-semibold text-gray-700 mb-2">
                Detailed {reportType === "Sales Report" ? "Orders" : "Inventory"} Data
              </h3>
              <DataTable
                columns={reportType === "Sales Report" ? salesColumns : inventoryColumns}
                data={salesData}
                pagination
                paginationPerPage={rowsPerPage}
                paginationDefaultPage={currentPage}
                onChangePage={(page) => setCurrentPage(page)}
                onChangeRowsPerPage={(newPerPage, page) => {
                  setRowsPerPage(newPerPage);
                  setCurrentPage(page);
                }}
                fixedHeaderScrollHeight="600px"
                customStyles={customStyles}
                highlightOnHover
                responsive
              />
            </div>
          </>
        )}
      </div>

      <Modal
        title="Confirm Delete"
        open={showDeleteModal}
        onOk={() => setShowDeleteModal(false)}
        onCancel={() => setShowDeleteModal(false)}
        footer={[
          <Button key="back" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger
            onClick={() => setShowDeleteModal(false)}
          >
            Delete
          </Button>,
        ]}
      >
        <p>Are you sure you want to delete this item?</p>
      </Modal>
    </div>
  );
};

export default ReportTable;