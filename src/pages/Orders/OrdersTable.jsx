// import React, { useState, useRef, useEffect } from "react";
// import DataTable from "react-data-table-component";
// import { Modal, Button, message, Select, DatePicker, Input, Dropdown } from "antd";
// import { FaEdit, FaEye, FaPrint, FaDownload, FaCalendarAlt } from "react-icons/fa";
// import { useReactToPrint } from "react-to-print";
// import axios from "axios";
// import { getOrder, updateOrder } from "../../Interceptor/interceptor";
// import dayjs from "dayjs";
// import * as XLSX from "xlsx";
// import { toast } from "react-toastify";

// const { RangePicker } = DatePicker;
// const { Search } = Input;
// const { MonthPicker } = DatePicker;

// const Order = () => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [editingOrder, setEditingOrder] = useState(null);
//   const [orders, setOrders] = useState([]);
//   const [filteredOrders, setFilteredOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [updating, setUpdating] = useState(false);
//   const [searchText, setSearchText] = useState("");
//   const [dateRange, setDateRange] = useState([]);
//   const [monthFilter, setMonthFilter] = useState(null);
//   const [selectedMonth, setSelectedMonth] = useState("This Month");
//   const [statusFilter, setStatusFilter] = useState("ALL");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [exportType, setExportType] = useState("all");
//   const [customDateRange, setCustomDateRange] = useState([]);
//   const printRef = useRef();

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   useEffect(() => {
//     filterOrders();
//   }, [orders, searchText, dateRange, monthFilter, statusFilter]);

//   const fetchOrders = async () => {
//     try {
//       setLoading(true);
//       const response = await getOrder();
//       setOrders(response.data);
//       setLoading(false);
//     } catch (error) {
//       console.error("Error fetching orders:", error);
//       message.error("Failed to fetch orders");
//       setLoading(false);
//     }
//   };

//   const filterOrders = () => {
//     let result = [...orders];

//     if (statusFilter !== "ALL") {
//       result = result.filter((order) => order.orderStatus === statusFilter);
//     }

//     if (searchText) {
//       const lowerSearch = searchText.toLowerCase();
//       result = result.filter(
//         (order) =>
//           order.orderId.toLowerCase().includes(lowerSearch) ||
//           (order.userDetails?.name || "").toLowerCase().includes(lowerSearch) ||
//           (order.userDetails?.email || "").toLowerCase().includes(lowerSearch) ||
//           order.orderStatus.toLowerCase().includes(lowerSearch) ||
//           order.paymentStatus.toLowerCase().includes(lowerSearch) ||
//           order.paymentMethod.toLowerCase().includes(lowerSearch)
//       );
//     }

//     if (dateRange && dateRange.length === 2) {
//       const startDate = dayjs(dateRange[0]).startOf('day');
//       const endDate = dayjs(dateRange[1]).endOf('day');
//       result = result.filter((order) => {
//         const orderDate = dayjs(order.createdAt);
//         return orderDate.isAfter(startDate) && orderDate.isBefore(endDate);
//       });
//     }

//     if (monthFilter) {
//       const month = dayjs(monthFilter).month();
//       const year = dayjs(monthFilter).year();
//       result = result.filter((order) => {
//         const orderDate = dayjs(order.createdAt);
//         return orderDate.month() === month && orderDate.year() === year;
//       });
//     }

//     setFilteredOrders(result);
//   };

//   // Helper function to safely get products from orderDetails
//   const getProductsFromOrder = (order) => {
//     if (!order.orderDetails) return [];

//     // If orderDetails is an array
//     if (Array.isArray(order.orderDetails)) {
//       return order.orderDetails.map(item => ({
//         name: item.products?.productDetails?.productName || "N/A",
//         quantity: item.products?.quantity || 0,
//         price: item.products?.subtotal || 0
//       }));
//     }

//     // If orderDetails is an object with products array
//     if (order.orderDetails.products && Array.isArray(order.orderDetails.products)) {
//       return order.orderDetails.products.map(item => ({
//         name: item.selectedVariant?.productTitle || item.productName || "N/A",
//         quantity: item.quantity || 0,
//         price: item.price || 0
//       }));
//     }

//     // If orderDetails is a single product object
//     if (order.orderDetails.products && typeof order.orderDetails.products === 'object') {
//       return [{
//         name: order.orderDetails.products.productDetails?.productName || "N/A",
//         quantity: order.orderDetails.products.quantity || 0,
//         price: order.orderDetails.products.subtotal || 0
//       }];
//     }

//     return [];
//   };

//   // Get filtered data based on export type
//   const getExportData = () => {
//     let data = [...orders];

//     // Apply current filters
//     if (statusFilter !== "ALL") {
//       data = data.filter((order) => order.orderStatus === statusFilter);
//     }

//     if (searchText) {
//       const lowerSearch = searchText.toLowerCase();
//       data = data.filter(
//         (order) =>
//           order.orderId.toLowerCase().includes(lowerSearch) ||
//           (order.userDetails?.name || "").toLowerCase().includes(lowerSearch) ||
//           (order.userDetails?.email || "").toLowerCase().includes(lowerSearch)
//       );
//     }

//     // Apply export-specific date filters
//     switch (exportType) {
//       case "monthly":
//         const currentMonth = dayjs().month();
//         const currentYear = dayjs().year();
//         data = data.filter((order) => {
//           const orderDate = dayjs(order.createdAt);
//           return orderDate.month() === currentMonth && orderDate.year() === currentYear;
//         });
//         break;

//       case "weekly":
//         const startOfWeek = dayjs().startOf('week');
//         const endOfWeek = dayjs().endOf('week');
//         data = data.filter((order) => {
//           const orderDate = dayjs(order.createdAt);
//           return orderDate.isAfter(startOfWeek) && orderDate.isBefore(endOfWeek);
//         });
//         break;

//       case "custom":
//         if (customDateRange && customDateRange.length === 2) {
//           const startDate = dayjs(customDateRange[0]).startOf('day');
//           const endDate = dayjs(customDateRange[1]).endOf('day');
//           data = data.filter((order) => {
//             const orderDate = dayjs(order.createdAt);
//             return orderDate.isAfter(startDate) && orderDate.isBefore(endDate);
//           });
//         }
//         break;

//       case "all":
//       default:
//         // No additional filtering for "all"
//         break;
//     }

//     return data;
//   };

//   const exportToExcel = (type = "all") => {
//     setExportType(type);

//     let data = getExportData();

//     if (data.length === 0) {
//       toast.warning("No data available for the selected export criteria");
//       return;
//     }

//     const worksheetData = data.map((order, index) => {
//       const products = getProductsFromOrder(order);
//       const productsText = products.map(product =>
//         `${product.name} (Qty: ${product.quantity})`
//       ).join(", ") || "N/A";

//       return {
//         "S.No": index + 1,
//         "Order ID": order.orderId,
//         "Customer Name": order.userDetails?.name || "N/A",
//         "Customer Email": order.userDetails?.email || "N/A",
//         "Order Date": new Date(order.createdAt).toLocaleDateString(),
//         "Order Time": new Date(order.createdAt).toLocaleTimeString(),
//         "Order Status": order.orderStatus,
//         "Payment Status": order.paymentStatus,
//         "Payment Method": order.paymentMethod,
//         "Total Amount": `₹${order.totalPrice || order.orderDetails?.price || 0}`,
//         "Products": productsText,
//         "Shipping Address": order.deliveryAddress
//           ? `${order.deliveryAddress.addressLine1 || ""}, ${order.deliveryAddress.city || ""}, ${order.deliveryAddress.state || ""} - ${order.deliveryAddress.zipCode || ""}`
//           : "N/A",
//         "Customer Phone": order.deliveryAddress?.phone || "N/A"
//       };
//     });

//     const worksheet = XLSX.utils.json_to_sheet(worksheetData);

//     // Set column widths
//     const columnWidths = [
//       { wch: 8 },   // S.No
//       { wch: 20 },  // Order ID
//       { wch: 25 },  // Customer Name
//       { wch: 30 },  // Customer Email
//       { wch: 15 },  // Order Date
//       { wch: 15 },  // Order Time
//       { wch: 15 },  // Order Status
//       { wch: 15 },  // Payment Status
//       { wch: 20 },  // Payment Method
//       { wch: 15 },  // Total Amount
//       { wch: 40 },  // Products
//       { wch: 50 },  // Shipping Address
//       { wch: 20 }   // Customer Phone
//     ];
//     worksheet["!cols"] = columnWidths;

//     // Create workbook and add worksheet
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

//     // Generate filename based on export type
//     let fileName = "Orders";
//     switch (type) {
//       case "monthly":
//         fileName = `Monthly_Orders_${dayjs().format('MMMM_YYYY')}`;
//         break;
//       case "weekly":
//         const weekStart = dayjs().startOf('week').format('DD_MMM');
//         const weekEnd = dayjs().endOf('week').format('DD_MMM_YYYY');
//         fileName = `Weekly_Orders_${weekStart}_to_${weekEnd}`;
//         break;
//       case "custom":
//         if (customDateRange && customDateRange.length === 2) {
//           const start = dayjs(customDateRange[0]).format('DD_MMM_YYYY');
//           const end = dayjs(customDateRange[1]).format('DD_MMM_YYYY');
//           fileName = `Orders_${start}_to_${end}`;
//         } else {
//           fileName = `Orders_${dayjs().format('DD_MMM_YYYY')}`;
//         }
//         break;
//       default:
//         fileName = `All_Orders_${dayjs().format('DD_MMM_YYYY')}`;
//     }

//     XLSX.writeFile(workbook, `${fileName}.xlsx`);
//     toast.success(`Exported ${data.length} orders successfully`);
//   };

//   const handleSearch = (value) => {
//     setSearchText(value);
//   };

//   const handleDateRangeChange = (dates) => {
//     setDateRange(dates);
//     setMonthFilter(null);
//   };

//   const handleMonthChange = (month) => {
//     setSelectedMonth(month);
//     if (month === "This Month") {
//       setMonthFilter(dayjs());
//     } else if (month === "Last Month") {
//       setMonthFilter(dayjs().subtract(1, 'month'));
//     } else {
//       setMonthFilter(null);
//     }
//     setDateRange([]);
//   };

//   const resetFilters = () => {
//     setSearchText("");
//     setDateRange([]);
//     setMonthFilter(null);
//     setSelectedMonth("This Month");
//     setStatusFilter("ALL");
//     setCustomDateRange([]);
//   };

//   const handleViewOrder = (order) => {
//     setSelectedOrder(order);
//     setIsModalOpen(true);
//   };

//   const handleEditOrder = (order) => {
//     setEditingOrder({ ...order });
//     setIsEditModalOpen(true);
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setSelectedOrder(null);
//   };

//   const closeEditModal = () => {
//     setIsEditModalOpen(false);
//     setEditingOrder(null);
//   };

//   const handleStatusChange = (value) => {
//     setEditingOrder((prev) => ({ ...prev, orderStatus: value }));
//   };

//   const handlePaymentStatusChange = (value) => {
//     setEditingOrder((prev) => ({ ...prev, paymentStatus: value }));
//   };

//   const updateOrderStatus = async () => {
//     if (!editingOrder) return;

//     try {
//       setUpdating(true);
//       await updateOrder(editingOrder._id, editingOrder.orderStatus, editingOrder.paymentStatus);

//       setOrders(prevOrders =>
//         prevOrders.map(order =>
//           order._id === editingOrder._id
//             ? { ...order, orderStatus: editingOrder.orderStatus, paymentStatus: editingOrder.paymentStatus }
//             : order
//         )
//       );

//       toast.success("Status updated successfully");
//       closeEditModal();
//     } catch (error) {
//       console.error("Error updating Status:", error);
//       toast.error("Failed to update status");
//     } finally {
//       setUpdating(false);
//     }
//   };

//   const handlePrint = useReactToPrint({
//     content: () => printRef.current,
//     pageStyle: `
//       @page {
//         size: A4;
//         margin: 10mm;
//       }
//       @media print {
//         body {
//           padding: 20px;
//         }
//         .print-button {
//           display: none;
//         }
//         .ant-modal-footer {
//           display: none;
//         }
//       }
//     `,
//     documentTitle: `Order_${selectedOrder?.orderId || "Details"}`,
//   });

//   // Export dropdown items
//   const exportItems = [
//     {
//       key: 'all',
//       label: 'All Orders',
//       onClick: () => exportToExcel('all')
//     },
//     {
//       key: 'monthly',
//       label: 'This Month',
//       onClick: () => exportToExcel('monthly')
//     },
//     {
//       key: 'weekly',
//       label: 'This Week',
//       onClick: () => exportToExcel('weekly')
//     },
//     {
//       key: 'custom',
//       label: 'Custom Date Range',
//       onClick: () => {
//         Modal.confirm({
//           title: 'Export Custom Date Range',
//           content: (
//             <div className="mt-4">
//               <p className="mb-2">Select date range:</p>
//               <RangePicker
//                 value={customDateRange}
//                 onChange={setCustomDateRange}
//                 style={{ width: '100%' }}
//               />
//             </div>
//           ),
//           onOk() {
//             if (customDateRange && customDateRange.length === 2) {
//               exportToExcel('custom');
//             } else {
//               toast.error("Please select a valid date range");
//             }
//           },
//           okText: 'Export',
//           cancelText: 'Cancel'
//         });
//       }
//     }
//   ];

//   const columns = [
//     {
//       name: "S.No",
//       cell: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
//       width: "80px",
//       sortable: false,
//       style: { paddingLeft: "30px" }
//     },
//     {
//       name: "Order ID",
//       selector: (row) => row.orderId,
//       sortable: true,
//       center: true,
//       width: "310px",
//     },
//     {
//       name: "Customer Name",
//       selector: (row) => row.userDetails?.name || "N/A",
//       sortable: true,
//       center: true,
//       width: "150px",
//     },
//     {
//       name: "Email",
//       selector: (row) => row.userDetails?.email || "N/A",
//       sortable: true,
//       center: true,
//       width: "200px",
//     },
//     {
//       name: "Order Date",
//       selector: (row) => new Date(row.createdAt).toLocaleDateString(),
//       sortable: true,
//       center: true,
//       width: "120px",
//     },
//     {
//       name: "Order Status",
//       cell: (row) => (
//         <div
//           className={`font-semibold px-2 py-1 rounded-md ${
//             row.orderStatus === "Pending"
//               ? "text-yellow-600"
//               : row.orderStatus === "Shipped"
//               ? "text-blue-600"
//               : row.orderStatus === "Delivered"
//               ? "text-green-600"
//               : row.orderStatus === "Cancelled"
//               ? "text-red-600"
//               : row.orderStatus === "Return Request"
//               ? "text-orange-600"
//               : row.orderStatus === "Returned"
//               ? "text-purple-600"
//               : "text-gray-600"
//           }`}
//         >
//           {row.orderStatus}
//         </div>
//       ),
//       sortable: true,
//       center: true,
//       width: "200px",
//     },
//     {
//       name: "Payment Status",
//       cell: (row) => (
//         <div
//           className={`font-semibold px-2 py-1 rounded-md ${
//             row.paymentStatus === "Pending"
//               ? "text-yellow-600"
//               : row.paymentStatus === "Paid"
//               ? "text-green-600"
//               : "text-red-600"
//           }`}
//         >
//           {row.paymentStatus}
//         </div>
//       ),
//       sortable: true,
//       center: true,
//       width: "200px",
//     },
//     {
//       name: "Payment Method",
//       selector: (row) => row.paymentMethod,
//       sortable: true,
//       center: true,
//       width: "200px",
//     },
//     {
//       name: "Total Amount",
//       selector: (row) => `₹${Math.round(row?.orderDetails?.price || row?.totalPrice || 0)}`,
//       sortable: true,
//       center: true,
//       width: "200px",
//     },
//     {
//       name: "Action",
//       cell: (row) => (
//         <div className="flex gap-2 justify-center">
//           <div
//             onClick={() => handleViewOrder(row)}
//             className="bg-gray-100 text-gray-800 p-2 rounded cursor-pointer hover:bg-gray-200"
//           >
//             <FaEye />
//           </div>
//           <div
//             onClick={() => handleEditOrder(row)}
//             className="bg-orange-100 text-orange-600 p-2 rounded hover:bg-orange-200 cursor-pointer"
//             title="Edit"
//           >
//             <FaEdit />
//           </div>
//         </div>
//       ),
//       center: true,
//       width: "80px",
//     },
//   ];

//   const customStyles = {
//     headCells: {
//       style: {
//         backgroundColor: "var(--color-table)",
//         color: "#fff",
//         fontWeight: "600",
//         padding: "12px 10px",
//         fontSize: "14px",
//         lineHeight: "1.5",
//         fontFamily: "var(--font-fonttitle)",
//         textAlign: "center",
//         justifyContent: "center",
//         whiteSpace: "normal",
//         wordBreak: "break-word",
//       },
//     },
//     cells: {
//       style: {
//         padding: "12px 10px",
//         fontSize: "14px",
//         fontFamily: "var(--font-fontcontent)",
//         textAlign: "center",
//         justifyContent: "center",
//         whiteSpace: "normal",
//         wordBreak: "break-word",
//         borderRight: "1px solid #e5e7eb",
//         "&:last-child": {
//           borderRight: "none",
//         },
//       },
//     },
//     rows: {
//       style: {
//         borderBottom: "1px solid #e5e7eb",
//         margin: "0",
//         padding: "0",
//         width: "100%",
//         minHeight: "50px",
//       },
//     },
//     table: {
//       style: {
//         width: "100%",
//         tableLayout: "fixed",
//         borderCollapse: "collapse",
//         borderTop: "none",
//       },
//     },
//     subHeader: {
//       style: {
//         padding: "0",
//         margin: "0",
//       },
//     },
//   };

//   const statusOptions = [
//     { value: "Ordered", label: "Ordered" },
//     { value: "Shipped", label: "Shipped" },
//     { value: "Delivered", label: "Delivered" },
//     { value: "Returned", label: "Returned" },
//   ];

//   const paymentOptions = [
//     { value: "Pending", label: "Pending" },
//     { value: "Completed", label: "Completed" },
//     { value: "Refunded", label: "Refunded" },
//     { value: "Failed", label:"Failed" },
//   ]

//   const monthOptions = [
//     { value: "This Month", label: "This Month" },
//     { value: "Last Month", label: "Last Month" },
//     { value: "All Time", label: "All Time" },
//   ];

//   return (
//     <div className="p-4 w-full bg-gray-100">
//       <div className="bg-white min-h-[calc(100vh-100px)] p-6 shadow-md rounded-md">
//         <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0 px-8">
//           <h2 className="text-2xl font-semibold text-gray-800">
//             Order Details
//           </h2>
//           <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
//             <div className="w-full md:w-54">
//               <select
//                 className="w-full border border-gray-300 rounded-md p-2 cursor-pointer"
//                 value={selectedMonth}
//                 onChange={(e) => handleMonthChange(e.target.value)}
//               >
//                 {monthOptions.map((option) => (
//                   <option key={option.value} value={option.value}>
//                     {option.label}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <input
//               type="text"
//               placeholder="Search Orders"
//               value={searchText}
//               onChange={(e) => setSearchText(e.target.value)}
//               className="border border-gray-300 p-2 rounded-md w-full h-9 md:w-54"
//             />

//             <button
//               type="default"
//               onClick={resetFilters}
//               className="w-48 h-9 bg-table cursor-pointer text-white px-4 rounded-md hover:bg-secondary transition duration-300 text-sm font-medium"
//               danger
//             >
//               Reset
//             </button>
//           </div>
//         </div>

//         {/* Tabbed Status Filter */}
//         <div className="flex mb-6 px-8">
//           <button
//             onClick={() => setStatusFilter("ALL")}
//             className={`cursor-pointer px-4 py-2 font-medium ${
//               statusFilter === "ALL"
//                 ? "bg-white border-b-2 text-secondary"
//                 : "bg-white text-gray-500 hover:text-gray-700"
//             } `}
//           >
//             ALL
//           </button>
//           {statusOptions.map((status) => (
//             <button
//               key={status.value}
//               onClick={() => setStatusFilter(status.value)}
//               className={`px-4 py-2 font-medium cursor-pointer ${
//                 statusFilter === status.value
//                   ? "bg-white border-b-2 text-secondary"
//                   : "bg-white text-gray-500 hover:text-gray-700 "
//               }`}
//             >
//               {status.label}
//             </button>
//           ))}
//           <div className="flex gap-3 ms-auto">
//             {/* Enhanced Export Dropdown */}
//             <Dropdown
//               menu={{ items: exportItems }}
//               placement="bottomRight"
//               trigger={['click']}
//             >
//               <button
//                 className="flex items-center cursor-pointer justify-center w-10 h-10 rounded-full bg-white border border-gray-300 hover:bg-green-100 hover:border-green-500 transition-all duration-300 shadow-sm"
//                 title="Export Options"
//               >
//                 <FaDownload className="text-secondary hover:text-green-600 w-4 h-4" />
//               </button>
//             </Dropdown>
//           </div>
//         </div>

//         <div className="w-full overflow-x-auto rounded px-8">
//           <DataTable
//             columns={columns}
//             data={filteredOrders}
//             pagination
//             paginationPerPage={rowsPerPage}
//             paginationDefaultPage={currentPage}
//             onChangePage={page => setCurrentPage(page)}
//             onChangeRowsPerPage={(newPerPage, page) => {
//               setRowsPerPage(newPerPage);
//               setCurrentPage(page);
//             }}
//             fixedHeader
//             fixedHeaderScrollHeight="calc(100vh - 300px)"
//             customStyles={customStyles}
//             highlightOnHover
//             responsive
//             progressPending={loading}
//             noDataComponent="No orders found"
//             dense
//           />
//         </div>
//       </div>

//       {/* View Order Modal - Fixed product display */}
//       <Modal
//         title="Order Details"
//         visible={isModalOpen}
//         onCancel={closeModal}
//         footer={[
//           <Button
//             key="print"
//             type="primary"
//             icon={<FaPrint />}
//             onClick={handlePrint}
//             className="print-button"
//           >
//             Print
//           </Button>,
//           <Button key="close" onClick={closeModal}>
//             Close
//           </Button>,
//         ]}
//         width={800}
//         getContainer={false}
//       >
//         <div ref={printRef} className="p-4 print-content">
//           {selectedOrder ? (
//             <>
//               <div className="text-center mb-4">
//                 <h1 className="text-xl font-bold">Order Invoice</h1>
//                 <p className="text-gray-600">Order ID: {selectedOrder.orderId}</p>
//                 <p className="text-gray-600">
//                   Date: {new Date(selectedOrder.createdAt).toLocaleString()}
//                 </p>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//                 <div className="border p-4 rounded">
//                   <h2 className="text-lg font-semibold mb-3">Customer Details</h2>
//                   <div className="space-y-2">
//                     <p>
//                       <strong>Name:</strong> {selectedOrder.userDetails?.name}
//                     </p>
//                     <p>
//                       <strong>Email:</strong> {selectedOrder.userDetails?.email}
//                     </p>
//                     <p>
//                       <strong>User ID:</strong> {selectedOrder.userId}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="border p-4 rounded">
//                   <h2 className="text-lg font-semibold mb-3">Shipping Address</h2>
//                   {selectedOrder?.deliveryAddress ? (
//                     <div className="space-y-2">
//                       <p>
//                         <strong>Name:</strong>{" "}
//                         {selectedOrder?.deliveryAddress?.fullName}
//                       </p>
//                       <p>
//                         <strong>Address:</strong>{" "}
//                         {selectedOrder?.deliveryAddress?.addressLine1}
//                       </p>
//                       <p>
//                         <strong>City:</strong>{" "}
//                         {selectedOrder?.deliveryAddress?.city}
//                       </p>
//                       <p>
//                         <strong>State:</strong>{" "}
//                         {selectedOrder?.deliveryAddress?.state}
//                       </p>
//                       <p>
//                         <strong>Zip Code:</strong>{" "}
//                         {selectedOrder?.deliveryAddress?.zipCode}
//                       </p>
//                       <p>
//                         <strong>Country:</strong>{" "}
//                         {selectedOrder?.deliveryAddress?.country}
//                       </p>
//                       <p>
//                         <strong>Phone:</strong>{" "}
//                         {selectedOrder?.deliveryAddress?.phone}
//                       </p>
//                     </div>
//                   ) : (
//                     <p>No address provided</p>
//                   )}
//                 </div>
//               </div>

//               <div className="border-b pb-4 mb-4">
//                 <h2 className="text-lg font-semibold mb-3">Order Summary</h2>
//                 <div className="space-y-2">
//                   <p>
//                     <strong>Order Status:</strong>{" "}
//                     <span
//                       className={`font-semibold ${
//                         selectedOrder.orderStatus === "Pending"
//                           ? "text-yellow-600"
//                           : selectedOrder.orderStatus === "Shipped"
//                           ? "text-blue-600"
//                           : selectedOrder.orderStatus === "Delivered"
//                           ? "text-green-600"
//                           : selectedOrder.orderStatus === "Cancelled"
//                           ? "text-red-600"
//                           : selectedOrder.orderStatus === "Return Request"
//                           ? "text-orange-600"
//                           : selectedOrder.orderStatus === "Returned"
//                           ? "text-purple-600"
//                           : "text-gray-600"
//                       }`}
//                     >
//                       {selectedOrder.orderStatus}
//                     </span>
//                   </p>
//                   <p>
//                     <strong>Payment Status:</strong>{" "}
//                     <span
//                       className={`font-semibold ${
//                         selectedOrder.paymentStatus === "Pending"
//                           ? "text-yellow-600"
//                           : selectedOrder.paymentStatus === "Paid"
//                           ? "text-green-600"
//                           : "text-red-600"
//                       }`}
//                     >
//                       {selectedOrder.paymentStatus}
//                     </span>
//                   </p>
//                   <p>
//                     <strong>Payment Method:</strong> {selectedOrder.paymentMethod}
//                   </p>
//                   {selectedOrder.returnStatus && (
//                     <p>
//                       <strong>Return Status:</strong> {selectedOrder.returnStatus}
//                     </p>
//                   )}
//                   {selectedOrder.reason && (
//                     <p>
//                       <strong>Return Reason:</strong> {selectedOrder.reason}
//                     </p>
//                   )}
//                   {selectedOrder.returnImage && (
//                     <div>
//                       <strong>Return Image:</strong>
//                       <img
//                         src={selectedOrder.returnImage}
//                         alt="Return proof"
//                         className="h-20 w-20 object-cover mt-2"
//                       />
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="mb-6">
//                 <h2 className="text-lg font-semibold mb-3">Products</h2>
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full border">
//                     <thead>
//                       <tr className="bg-gray-100">
//                         <th className="border p-2">Product</th>
//                         <th className="border p-2">Price</th>
//                         <th className="border p-2">Quantity</th>
//                         <th className="border p-2">Subtotal</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {getProductsFromOrder(selectedOrder).map((product, index) => (
//                         <tr key={index}>
//                           <td className="border p-2">
//                             <div className="flex items-center">
//                               <div>
//                                 <p className="font-medium">
//                                   {product.name}
//                                 </p>
//                               </div>
//                             </div>
//                           </td>
//                           <td className="border p-2">₹{product.price}</td>
//                           <td className="border p-2">{product.quantity}</td>
//                           <td className="border p-2">
//                             ₹{product.price * product.quantity}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                     <tfoot>
//                       <tr>
//                         <td
//                           colSpan="3"
//                           className="border p-2 text-right font-bold"
//                         >
//                           Total:
//                         </td>
//                         <td className="border p-2 font-bold">
//                           ₹{selectedOrder?.totalPrice || selectedOrder?.orderDetails?.price || 0}
//                         </td>
//                       </tr>
//                     </tfoot>
//                   </table>
//                 </div>
//               </div>

//               <div className="mt-6 pt-4 border-t text-center text-sm text-gray-500">
//                 <p>
//                   Last updated:{" "}
//                   {new Date(selectedOrder?.updatedAt).toLocaleString()}
//                 </p>
//               </div>
//             </>
//           ) : (
//             <p>No order selected</p>
//           )}
//         </div>
//       </Modal>

//       {/* Edit Order Status Modal */}
//       <Modal
//         title="Update Order Status"
//         visible={isEditModalOpen}
//         onCancel={closeEditModal}
//         footer={[
//           <Button key="cancel" onClick={closeEditModal}>
//             Cancel
//           </Button>,
//           <Button
//             key="update"
//             type="primary"
//             loading={updating}
//             onClick={updateOrderStatus}
//           >
//             Update Status
//           </Button>,
//         ]}
//       >
//         {editingOrder && (
//           <div>
//             <div className="mb-4">
//               <p>
//                 <strong>Order ID:</strong> {editingOrder?.orderId}
//               </p>
//               <div className=" grid gap-5 mt-3">
//               <p>
//                 <strong>Order Status:</strong>{" "}
//                 <span
//                   className={`font-semibold ${
//                     editingOrder.orderStatus === "Pending"
//                       ? "text-yellow-600"
//                       : editingOrder.orderStatus === "Shipped"
//                       ? "text-blue-600"
//                       : editingOrder.orderStatus === "Delivered"
//                       ? "text-green-600"
//                       : editingOrder.orderStatus === "Cancelled"
//                       ? "text-red-600"
//                       : editingOrder.orderStatus === "Return Request"
//                       ? "text-orange-600"
//                       : editingOrder.orderStatus === "Returned"
//                       ? "text-purple-600"
//                       : "text-gray-600"
//                   }`}
//                 >
//                   {editingOrder.orderStatus}
//                 </span>
//               </p>
//               <p>
//                 <strong>Payment Status:</strong>{" "}
//                 <span
//                   className={`font-semibold ${
//                     editingOrder?.paymentStatus === "Pending"
//                       ? "text-yellow-600"
//                       : editingOrder?.paymentStatus === "Paid"
//                       ? "text-green-600"
//                       : "text-red-600"
//                   }`}
//                 >
//                   {editingOrder?.paymentStatus}
//                 </span>
//               </p>
//               </div>

//             </div>

//             <div className="mb-4">
//               <label className="block mb-2 font-medium">
//                 Select Order Status:
//               </label>
//               <Select
//                 style={{ width: "100%" }}
//                 value={editingOrder?.orderStatus}
//                 onChange={handleStatusChange}
//                 options={statusOptions}
//               />
//             </div>

//             <div className="mb-4">
//               <label className="block mb-2 font-medium">
//                 Select Payment Status:
//               </label>
//               <Select
//                 style={{ width: "100%" }}
//                 value={editingOrder?.paymentStatus}
//                 onChange={handlePaymentStatusChange}
//                 options={paymentOptions}
//               />
//             </div>
//           </div>
//         )}
//       </Modal>
//     </div>
//   );
// };

// export default Order;

import React, { useState, useRef, useEffect } from "react";
import DataTable from "react-data-table-component";
import {
  Modal,
  Button,
  message,
  Select,
  DatePicker,
  Input,
  Dropdown,
} from "antd";
import {
  FaEdit,
  FaEye,
  FaPrint,
  FaDownload,
  FaCalendarAlt,
} from "react-icons/fa";
import { useReactToPrint } from "react-to-print";
import axios from "axios";
import {
  getOrder,
  updateOrder,
  updateReturn,
} from "../../Interceptor/interceptor";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
const PrintableInvoice = React.lazy(() => import("./PrintableInvoice"))
// import PrintableInvoice from "./PrintableInvoice";

const { RangePicker } = DatePicker;

const Order = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  // const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState([]);
  const [monthFilter, setMonthFilter] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("This Month");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedReturnProduct, setSelectedReturnProduct] = useState(null);
  const [selectedReturnOrderId, setSelectedReturnOrderId] = useState(null);
  const [returnStatus, setReturnStatus] = useState(null);

  // For export date-wise popup
  const [isCustomExportModalOpen, setIsCustomExportModalOpen] = useState(false);
  const [exportDateRange, setExportDateRange] = useState([]);

  const printRef = useRef();
  const invoicePrintRef = useRef(); 

  useEffect(() => {
    fetchOrders();
  }, []);

  // useEffect(() => {
  //   filterOrders();
  // }, [orders, searchText, dateRange, monthFilter, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getOrder();
      setOrders(response.data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      message.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReturnModal = (orderId, product) => {
    console.log(product, "return products ");
    setSelectedReturnOrderId(orderId);
    setSelectedReturnProduct(product);
    setIsReturnModalOpen(true);
  };

  // Helper for inclusive date range check
  const isWithinRange = (date, start, end) => {
    if (!start || !end) return true;
    const time = dayjs(date).valueOf();
    const startTime = dayjs(start).startOf("day").valueOf();
    const endTime = dayjs(end).endOf("day").valueOf();
    return time >= startTime && time <= endTime;
  };

  const filterOrders = () => {
    let result = [...orders];

    if (statusFilter !== "ALL") {
      result = result.filter((order) => order.orderStatus === statusFilter);
    }

    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      result = result.filter(
        (order) =>
          order.orderId?.toLowerCase().includes(lowerSearch) ||
          (order.userDetails?.name || "").toLowerCase().includes(lowerSearch) ||
          (order.userDetails?.email || "")
            .toLowerCase()
            .includes(lowerSearch) ||
          (order.orderStatus || "").toLowerCase().includes(lowerSearch) ||
          (order.paymentStatus || "").toLowerCase().includes(lowerSearch) ||
          (order.paymentMethod || "").toLowerCase().includes(lowerSearch),
      );
    }

    // Date range filter for table (if you use it elsewhere in UI)
    if (dateRange && dateRange.length === 2) {
      const [startDate, endDate] = dateRange;
      result = result.filter((order) =>
        isWithinRange(order.createdAt, startDate, endDate),
      );
    }

    // Month filter (This Month / Last Month)
    if (monthFilter) {
      const month = dayjs(monthFilter).month();
      const year = dayjs(monthFilter).year();
      result = result.filter((order) => {
        const orderDate = dayjs(order.createdAt);
        return orderDate.month() === month && orderDate.year() === year;
      });
    }

    // setFilteredOrders(result);
  };

  const filteredOrders = React.useMemo(() => {
    let result = [...orders];

    if (statusFilter !== "ALL") {
      result = result.filter((order) => order.orderStatus === statusFilter);
    }

    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      result = result.filter(
        (order) =>
          order.orderId?.toLowerCase().includes(lowerSearch) ||
          order.userDetails?.name?.toLowerCase().includes(lowerSearch) ||
          order.userDetails?.email?.toLowerCase().includes(lowerSearch) ||
          order.orderStatus?.toLowerCase().includes(lowerSearch) ||
          order.paymentStatus?.toLowerCase().includes(lowerSearch) ||
          order.paymentMethod?.toLowerCase().includes(lowerSearch),
      );
    }

    if (dateRange?.length === 2) {
      const [startDate, endDate] = dateRange;
      result = result.filter((order) =>
        isWithinRange(order.createdAt, startDate, endDate),
      );
    }

    if (monthFilter) {
      const month = dayjs(monthFilter).month();
      const year = dayjs(monthFilter).year();
      result = result.filter((order) => {
        const orderDate = dayjs(order.createdAt);
        return orderDate.month() === month && orderDate.year() === year;
      });
    }

    return result;
  }, [orders, searchText, dateRange, monthFilter, statusFilter]);

  // Helper function to safely get products from orderDetails
  const getProductsFromOrder = (order) => {
    if (!order.orderDetails) return [];

    // If orderDetails is an array
    if (Array.isArray(order.orderDetails)) {
      return order.orderDetails.map((item) => ({
        name: item.products?.productDetails?.productName || "N/A",
        quantity: item.products?.quantity || 0,
        price: item.products?.subtotal || 0,
      }));
    }

    // If orderDetails is an object with products array
    if (
      order.orderDetails.products &&
      Array.isArray(order.orderDetails.products)
    ) {
      return order.orderDetails.products.map((item) => ({
        name: item.selectedVariant?.productTitle || item.productName || "N/A",
        quantity: item.quantity || 0,
        price: item.price || 0,
      }));
    }

    // If orderDetails is a single product object
    if (
      order.orderDetails.products &&
      typeof order.orderDetails.products === "object"
    ) {
      return [
        {
          name:
            order.orderDetails.products.productDetails?.productName || "N/A",
          quantity: order.orderDetails.products.quantity || 0,
          price: order.orderDetails.products.subtotal || 0,
        },
      ];
    }

    return [];
  };

  // Get filtered data based on export type (no state dependency now)
  const getExportData = (type = "all", range = null) => {
    let data = [...orders];

    // Apply same filters used on table (status & search)
    if (statusFilter !== "ALL") {
      data = data.filter((order) => order.orderStatus === statusFilter);
    }

    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      data = data.filter(
        (order) =>
          order.orderId?.toLowerCase().includes(lowerSearch) ||
          (order.userDetails?.name || "").toLowerCase().includes(lowerSearch) ||
          (order.userDetails?.email || "").toLowerCase().includes(lowerSearch),
      );
    }

    // Export-specific date filters
    switch (type) {
      case "monthly": {
        const currentMonth = dayjs().month();
        const currentYear = dayjs().year();
        data = data.filter((order) => {
          const orderDate = dayjs(order.createdAt);
          return (
            orderDate.month() === currentMonth &&
            orderDate.year() === currentYear
          );
        });
        break;
      }

      case "weekly": {
        const startOfWeek = dayjs().startOf("week");
        const endOfWeek = dayjs().endOf("week");
        data = data.filter((order) =>
          isWithinRange(order.createdAt, startOfWeek, endOfWeek),
        );
        break;
      }

      case "custom": {
        const [startDate, endDate] = range || [];
        if (startDate && endDate) {
          data = data.filter((order) =>
            isWithinRange(order.createdAt, startDate, endDate),
          );
        } else {
          data = [];
        }
        break;
      }

      case "all":
      default:
        // No additional date filter
        break;
    }

    return data;
  };

  const exportToExcel = (type = "all", range = null) => {
    const data = getExportData(type, range);

    if (!data || data.length === 0) {
      toast.warning("No data available for the selected export criteria");
      return;
    }

    const worksheetData = data.map((order, index) => {
      const products = getProductsFromOrder(order);
      const productsText =
        products
          .map((product) => `${product.name} (Qty: ${product.quantity})`)
          .join(", ") || "N/A";

      return {
        "S.No": index + 1,
        "Order ID": order.orderId,
        "Customer Name": order.userDetails?.name || "N/A",
        "Customer Email": order.userDetails?.email || "N/A",
        "Order Date": new Date(order.createdAt).toLocaleDateString(),
        "Order Time": new Date(order.createdAt).toLocaleTimeString(),
        "Order Status": order.orderStatus,
        "Payment Status": order.paymentStatus,
        "Payment Method": order.paymentMethod,
        "Total Amount": `₹${
          order.totalPrice || order.orderDetails?.price || 0
        }`,
        Products: productsText,
        "Shipping Address": order.deliveryAddress
          ? `${order.deliveryAddress.addressLine1 || ""}, ${
              order.deliveryAddress.city || ""
            }, ${order.deliveryAddress.state || ""} - ${
              order.deliveryAddress.zipCode || ""
            }`
          : "N/A",
        "Customer Phone": order.deliveryAddress?.phone || "N/A",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    // Set column widths
    const columnWidths = [
      { wch: 8 }, // S.No
      { wch: 20 }, // Order ID
      { wch: 25 }, // Customer Name
      { wch: 30 }, // Customer Email
      { wch: 15 }, // Order Date
      { wch: 15 }, // Order Time
      { wch: 15 }, // Order Status
      { wch: 15 }, // Payment Status
      { wch: 20 }, // Payment Method
      { wch: 15 }, // Total Amount
      { wch: 40 }, // Products
      { wch: 50 }, // Shipping Address
      { wch: 20 }, // Customer Phone
    ];
    worksheet["!cols"] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

    // Generate filename
    let fileName = "Orders";
    switch (type) {
      case "monthly":
        fileName = `Monthly_Orders_${dayjs().format("MMMM_YYYY")}`;
        break;
      case "weekly": {
        const weekStart = dayjs().startOf("week").format("DD_MMM");
        const weekEnd = dayjs().endOf("week").format("DD_MMM_YYYY");
        fileName = `Weekly_Orders_${weekStart}_to_${weekEnd}`;
        break;
      }
      case "custom": {
        const [start, end] = range || [];
        if (start && end) {
          const startStr = dayjs(start).format("DD_MMM_YYYY");
          const endStr = dayjs(end).format("DD_MMM_YYYY");
          fileName = `Orders_${startStr}_to_${endStr}`;
        } else {
          fileName = `Orders_${dayjs().format("DD_MMM_YYYY")}`;
        }
        break;
      }
      default:
        fileName = `All_Orders_${dayjs().format("DD_MMM_YYYY")}`;
    }

    XLSX.writeFile(workbook, `${fileName}.xlsx`);
    toast.success(`Exported ${data.length} orders successfully`);
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates || []);
    setMonthFilter(null);
  };

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
    if (month === "This Month") {
      setMonthFilter(dayjs());
    } else if (month === "Last Month") {
      setMonthFilter(dayjs().subtract(1, "month"));
    } else {
      setMonthFilter(null);
    }
    setDateRange([]);
  };

  const getProductCodes = (order) => {
  if (!order?.orderDetails?.products?.length) return "N/A";

  return order.orderDetails.products
    .map(
      (item) => item?.selectedVariant?.productCode
    )
    .filter(Boolean) // remove null/undefined
    .join(", ");
};

  const resetFilters = () => {
    setSearchText("");
    setDateRange([]);
    setMonthFilter(null);
    setSelectedMonth("This Month");
    setStatusFilter("ALL");
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleEditOrder = (order) => {
    setEditingOrder({ ...order });
    setIsEditModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingOrder(null);
  };

  const handleStatusChange = (value) => {
    setEditingOrder((prev) => ({ ...prev, orderStatus: value }));
  };

  const handlePaymentStatusChange = (value) => {
    setEditingOrder((prev) => ({ ...prev, paymentStatus: value }));
  };

  const updateOrderStatus = async () => {
    if (!editingOrder) return;

    try {
      setUpdating(true);
      await updateOrder(
        editingOrder._id,
        editingOrder.orderStatus,
        editingOrder.paymentStatus,
      );

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === editingOrder._id
            ? {
                ...order,
                orderStatus: editingOrder.orderStatus,
                paymentStatus: editingOrder.paymentStatus,
              }
            : order,
        ),
      );

      toast.success("Status updated successfully");
      closeEditModal();
    } catch (error) {
      console.error("Error updating Status:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  // Update the handlePrint function:
const handlePrint = useReactToPrint({
  contentRef: invoicePrintRef,  // Changed from content to contentRef
  pageStyle: `
    @page {
      size: A4;
      margin: 10mm;
    }
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  `,
  documentTitle: `Invoice_${selectedOrder?.orderId || "Details"}`,
});

  // Export dropdown items
  const exportItems = [
    {
      key: "all",
      label: "All Orders",
      onClick: () => exportToExcel("all"),
    },
    {
      key: "monthly",
      label: "This Month",
      onClick: () => exportToExcel("monthly"),
    },
    {
      key: "weekly",
      label: "This Week",
      onClick: () => exportToExcel("weekly"),
    },
    {
      key: "datewise",
      label: "Date Wise (Custom Range)",
      onClick: () => setIsCustomExportModalOpen(true),
    },
  ];

  const columns = React.useMemo(
    () => [
      {
        name: "S.No",
        cell: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
        width: "80px",
      },
      {
        name: "Order ID",
        selector: (row) => row.orderId,
        sortable: true,
        center: true,
        width: "310px",
      },
      {
        name: "Customer Name",
        selector: (row) => row.userDetails?.name || "N/A",
        sortable: true,
        center: true,
        width: "150px",
      },
      {
        name: "Email",
        selector: (row) => row.userDetails?.email || "N/A",
        sortable: true,
        center: true,
        width: "200px",
      },
      {
        name: "Order Date",
        selector: (row) => new Date(row.createdAt).toLocaleDateString(),
        sortable: true,
        center: true,
        width: "120px",
      },
      {
  name: "Product Codes",
  cell: (row) => (
    <div className="text-sm text-gray-700 font-medium text-center">
      {getProductCodes(row)}
    </div>
  ),
  center: true,
  width: "220px",
},
      {
        name: "Order Status",
        cell: (row) => row.orderStatus,
        center: true,
        width: "200px",
      },
      {
        name: "Payment Status",
        cell: (row) => row.paymentStatus,
        center: true,
        width: "200px",
      },
      {
        name: "Payment Method",
        selector: (row) => row.paymentMethod,
        center: true,
        width: "200px",
      },
      {
        name: "Total Amount",
        selector: (row) => `₹${Math.round(row?.totalPrice || 0)}`,
        center: true,
        width: "200px",
      },
      {
        name: "Action",
        cell: (row) => (
          <div className="flex gap-2 justify-center">
            <div
              onClick={() => handleViewOrder(row)}
              className="bg-gray-100 p-2 rounded cursor-pointer"
            >
              <FaEye />
            </div>
            <div
              onClick={() => handleEditOrder(row)}
              className="bg-orange-100 p-2 rounded cursor-pointer"
            >
              <FaEdit />
            </div>
          </div>
        ),
        center: true,
        width: "80px",
      },
    ],
    [currentPage, rowsPerPage, handleViewOrder, handleEditOrder],
  );

  const customStyles = React.useMemo(
    () => ({
      headCells: {
        style: {
          backgroundColor: "var(--color-table)",
          color: "#fff",
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
          borderRight: "1px solid #e5e7eb",
          "&:last-child": {
            borderRight: "none",
          },
        },
      },
      rows: {
        style: {
          borderBottom: "1px solid #e5e7eb",
          margin: "0",
          padding: "0",
          width: "100%",
          minHeight: "50px",
        },
      },
      table: {
        style: {
          width: "100%",
          tableLayout: "fixed",
          borderCollapse: "collapse",
          borderTop: "none",
        },
      },
      subHeader: {
        style: {
          padding: "0",
          margin: "0",
        },
      },
    }),
    [],
  );

  const statusOptions = [
    { value: "Ordered", label: "Ordered" },
    { value: "Shipped", label: "Shipped" },
    { value: "Delivered", label: "Delivered" },
    { value: "Returned", label: "Returned" },
  ];

  const paymentOptions = [
    { value: "Pending", label: "Pending" },
    { value: "Completed", label: "Completed" },
    { value: "Refunded", label: "Refunded" },
    { value: "Failed", label: "Failed" },
  ];

  const monthOptions = [
    { value: "This Month", label: "This Month" },
    { value: "Last Month", label: "Last Month" },
    { value: "All Time", label: "All Time" },
  ];

  const handleCustomExportOk = () => {
    if (!exportDateRange || exportDateRange.length !== 2) {
      toast.error("Please select a valid date range");
      return;
    }
    exportToExcel("custom", exportDateRange);
    setIsCustomExportModalOpen(false);
  };

  const handleReturnDecision = async (decision) => {
    if (!selectedReturnProduct || !selectedReturnOrderId) {
      toast.error("Invalid return request");
      return;
    }

    const updatePayload = {
      orderId: selectedReturnOrderId,
      productId: selectedReturnProduct.productId,
      status: decision === "Returned" ? "Approved" : "Rejected", // "Approved" or "Rejected"
    };

    // Include variantId if it's a variation product
    if (
      selectedReturnProduct.productType === "variation" &&
      selectedReturnProduct.variantId
    ) {
      updatePayload.variantId = selectedReturnProduct.variantId;
    }

    try {
      setUpdating(true);
      const response = await updateReturn(updatePayload);

      toast.success(
        decision === "Returned"
          ? "Return approved successfully"
          : "Return rejected successfully",
      );

      setIsReturnModalOpen(false);
      setSelectedReturnProduct(null);
      setSelectedReturnOrderId(null);

      // Refresh orders list
      await fetchOrders();
    } catch (error) {
      console.error("Error updating return status:", error);
      toast.error(
        error.response?.data?.message || "Failed to update return status",
      );
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-4 w-full bg-gray-100">
      <div className="bg-white min-h-[calc(100vh-100px)] p-6 shadow-md rounded-md">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0 px-8">
          <h2 className="text-2xl font-semibold text-gray-800">
            Order Details
          </h2>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="w-full md:w-54">
              <select
                className="w-full border border-gray-300 rounded-md p-2 cursor-pointer"
                value={selectedMonth}
                onChange={(e) => handleMonthChange(e.target.value)}
              >
                {monthOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <input
              type="text"
              placeholder="Search Orders"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="border border-gray-300 p-2 rounded-md w-full h-9 md:w-54"
            />

            <button
              type="button"
              onClick={resetFilters}
              className="w-48 h-9 bg-table cursor-pointer text-white px-4 rounded-md hover:bg-secondary transition duration-300 text-sm font-medium"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Tabbed Status Filter */}
        <div className="flex mb-6 px-8">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`cursor-pointer px-4 py-2 font-medium ${
              statusFilter === "ALL"
                ? "bg-white border-b-2 text-secondary"
                : "bg-white text-gray-500 hover:text-gray-700"
            } `}
          >
            ALL
          </button>
          {statusOptions.map((status) => (
            <button
              key={status.value}
              onClick={() => setStatusFilter(status.value)}
              className={`px-4 py-2 font-medium cursor-pointer ${
                statusFilter === status.value
                  ? "bg-white border-b-2 text-secondary"
                  : "bg-white text-gray-500 hover:text-gray-700 "
              }`}
            >
              {status.label}
            </button>
          ))}

          <div className="flex gap-3 ms-auto">
            {/* Export Dropdown */}
            <Dropdown
              menu={{ items: exportItems }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <button
                className="flex items-center cursor-pointer justify-center w-10 h-10 rounded-full bg-white border border-gray-300 hover:bg-green-100 hover:border-green-500 transition-all duration-300 shadow-sm"
                title="Export Options"
              >
                <FaDownload className="text-secondary hover:text-green-600 w-4 h-4" />
              </button>
            </Dropdown>
          </div>
        </div>

        <div className="w-full overflow-x-auto rounded px-8">
          <DataTable
            columns={columns}
            data={filteredOrders}
            pagination
            paginationPerPage={rowsPerPage}
            paginationDefaultPage={currentPage}
            onChangePage={(page) => setCurrentPage(page)}
            onChangeRowsPerPage={(newPerPage, page) => {
              setRowsPerPage(newPerPage);
              setCurrentPage(page);
            }}
            fixedHeader
            fixedHeaderScrollHeight="calc(100vh - 300px)"
            customStyles={customStyles}
            highlightOnHover
            responsive
            progressPending={loading}
            noDataComponent="No orders found"
            dense
          />
        </div>
      </div>

      {/* View Order Modal */}
      <Modal
        title="Order Details"
        visible={isModalOpen}
        onCancel={closeModal}
        footer={[
          <Button
  key="print"
  type="primary"
  icon={<FaPrint />}
  onClick={handlePrint}
  className="print-button"
>
  Print Invoice
</Button>,
          <Button key="close" onClick={closeModal}>
            Close
          </Button>,
        ]}
        width={800}
        getContainer={false}
      >
        <div ref={printRef} className="p-4 print-content">
          {selectedOrder ? (
            <>
              <div className="text-center mb-4">
                <h1 className="text-xl font-bold">Order Invoice</h1>
                <p className="text-gray-600">
                  Order ID: {selectedOrder.orderId}
                </p>
                <p className="text-gray-600">
                  Date: {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="border p-4 rounded">
                  <h2 className="text-lg font-semibold mb-3">
                    Customer Details
                  </h2>
                  <div className="space-y-2">
                    <p>
                      <strong>Name:</strong> {selectedOrder.userDetails?.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedOrder.userDetails?.email}
                    </p>
                    <p>
                      <strong>User ID:</strong> {selectedOrder.userId}
                    </p>
                  </div>
                </div>

                <div className="border p-4 rounded">
                  <h2 className="text-lg font-semibold mb-3">
                    Shipping Address
                  </h2>
                  {selectedOrder?.deliveryAddress ? (
                    <div className="space-y-2">
                      <p>
                        <strong>Name:</strong>{" "}
                        {selectedOrder.deliveryAddress?.fullName || "N/A"}
                      </p>

                      <p>
                        <strong>Address:</strong>{" "}
                        {selectedOrder.deliveryAddress?.addressLine1 || "N/A"}
                      </p>

                      {selectedOrder.deliveryAddress?.landMark && (
                        <p>
                          <strong>Landmark:</strong>{" "}
                          {selectedOrder.deliveryAddress.landMark}
                        </p>
                      )}

                      <p>
                        <strong>City:</strong>{" "}
                        {selectedOrder.deliveryAddress?.city || "N/A"}
                      </p>

                      <p>
                        <strong>State:</strong>{" "}
                        {selectedOrder.deliveryAddress?.state || "N/A"}
                      </p>

                      <p>
                        <strong>Zip Code:</strong>{" "}
                        {selectedOrder.deliveryAddress?.zipCode ||
                          "Not Provided"}
                      </p>

                      <p>
                        <strong>Country:</strong>{" "}
                        {selectedOrder.deliveryAddress?.country || "India"}
                      </p>

                      <p>
                        <strong>Phone:</strong>{" "}
                        {selectedOrder.deliveryAddress?.phone || "N/A"}
                      </p>
                    </div>
                  ) : (
                    <p>No address provided</p>
                  )}
                </div>
              </div>

              <div className="border-b pb-4 mb-4">
                <h2 className="text-lg font-semibold mb-3">Order Summary</h2>
                <div className="space-y-2">
                  <p>
                    <strong>Order Status:</strong>{" "}
                    <span
                      className={`font-semibold ${
                        selectedOrder.orderStatus === "Pending"
                          ? "text-yellow-600"
                          : selectedOrder.orderStatus === "Shipped"
                            ? "text-blue-600"
                            : selectedOrder.orderStatus === "Delivered"
                              ? "text-green-600"
                              : selectedOrder.orderStatus === "Cancelled"
                                ? "text-red-600"
                                : selectedOrder.orderStatus === "Return Request"
                                  ? "text-orange-600"
                                  : selectedOrder.orderStatus === "Returned"
                                    ? "text-purple-600"
                                    : "text-gray-600"
                      }`}
                    >
                      {selectedOrder.orderStatus}
                    </span>
                  </p>
                  <p>
                    <strong>Payment Status:</strong>{" "}
                    <span
                      className={`font-semibold ${
                        selectedOrder.paymentStatus === "Pending"
                          ? "text-yellow-600"
                          : selectedOrder.paymentStatus === "Paid"
                            ? "text-green-600"
                            : "text-red-600"
                      }`}
                    >
                      {selectedOrder.paymentStatus}
                    </span>
                  </p>
                  <p>
                    <strong>Payment Method:</strong>{" "}
                    {selectedOrder.paymentMethod}
                  </p>
                  {selectedOrder.returnStatus && (
                    <p>
                      <strong>Return Status:</strong>{" "}
                      {selectedOrder.returnStatus}
                    </p>
                  )}
                  {selectedOrder.reason && (
                    <p>
                      <strong>Return Reason:</strong> {selectedOrder.reason}
                    </p>
                  )}
                  {selectedOrder.returnImage && (
                    <div>
                      <strong>Return Image:</strong>
                      <img
                        src={selectedOrder.returnImage}
                        alt="Return proof"
                        className="h-20 w-20 object-cover mt-2"
                      />
                    </div>
                  )}
                </div>
              </div>
              {/* 
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Products</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full border">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2">Product</th>
                        <th className="border p-2">Price</th>
                        <th className="border p-2">Quantity</th>
                        <th className="border p-2">Subtotal</th>
                      </tr>
                    </thead>

                    <tbody>
                      {getProductsFromOrder(selectedOrder).map(
                        (product, index) => (
                          <tr key={index}>
                            <td className="border p-2">
                              <div className="flex items-center gap-3">
                                <img
                                  src={product.productImage}
                                  alt={product.name}
                                  className="w-14 h-14 object-cover rounded"
                                />
                                <p className="font-medium">{product.name}</p>
                              </div>
                            </td>

                            <td className="border p-2">₹{product.price}</td>

                            <td className="border p-2">{product.quantity}</td>

                            <td className="border p-2">
                              ₹{product.price * product.quantity}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>

                    <tfoot>
                      <tr>
                        <td
                          colSpan="3"
                          className="border p-2 text-right font-bold"
                        >
                          Total:
                        </td>
                        <td className="border p-2 font-bold">
                          ₹
                          {selectedOrder?.totalPrice ||
                            selectedOrder?.orderDetails?.price ||
                            0}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div> */}

              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Products</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full border">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2">Product Image</th>
                        <th className="border p-2">Product</th>
                        <th className="border p-2">Code</th>
                        <th className="border p-2">Price</th>
                        <th className="border p-2">Quantity</th>
                        <th className="border p-2">Status</th>
                        <th className="border p-2">Subtotal</th>
                      </tr>
                    </thead>

                    <tbody>
                      {selectedOrder?.orderDetails?.products?.map(
                        (product, index) => (
                          <tr key={index}>
                            {/* Product Image */}
                            <td className="border p-2">
                              <div className="flex justify-center">
                                <img
                                  src={
                                    product.productImage?.[0] ||
                                    product.selectedVariant
                                      ?.variantImages?.[0] ||
                                    product.selectedVariant
                                      ?.nonVariantImages?.[0] ||
                                    "/default-image.png"
                                  }
                                  alt={product.productTitle}
                                  className="w-14 h-14 object-cover rounded"
                                  onError={(e) => {
                                    e.target.src = "/default-image.png";
                                  }}
                                />
                              </div>
                            </td>

                            {/* Product Name */}
                            <td className="border p-2">
                              <p className="font-medium">
                                {product.productTitle}
                              </p>
                              {product.selectedVariant?.productTitle && (
                                <p className="text-sm text-gray-600">
                                  {" "}
                                  {product.selectedVariant.productTitle}
                                </p>
                              )}
                            </td>
                            <td className="border p-2 text-center font-medium text-gray-700">
                              {product?.selectedVariant?.productCode || "N/A"}
                            </td>

                            {/* Price */}
                            <td className="border p-2">₹{product.price}</td>

                            {/* Quantity */}
                            <td className="border p-2">{product.quantity}</td>

                            {/* Status */}
                            {/* Product Status Column */}
                            <td className="border p-2 text-center">
                              <span
                                onClick={() => {
                                  // Only clickable if return is requested
                                  if (
                                    product.orderStatus === "Return Request"
                                  ) {
                                    handleOpenReturnModal(
                                      selectedOrder._id,
                                      product,
                                    );
                                  }
                                }}
                                className={`px-2 py-1 rounded text-xs font-semibold inline-block
      ${
        product.orderStatus === "Return Request"
          ? "bg-orange-100 text-orange-700 cursor-pointer hover:bg-orange-200"
          : product.orderStatus === "Returned"
            ? "bg-green-100 text-green-700"
            : product.orderStatus === "Delivered"
              ? "bg-blue-100 text-blue-700"
              : product.orderStatus === "Cancelled"
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-600"
      }
    `}
                              >
                                {product.orderStatus === "Return Request"
                                  ? "⚠️ Return Requested"
                                  : product.orderStatus === "Returned"
                                    ? "✅ Returned"
                                    : product.orderStatus === "Delivered"
                                      ? "📦 Delivered"
                                      : product.orderStatus === "Cancelled"
                                        ? "❌ Cancelled"
                                        : product.orderStatus || "N/A"}
                              </span>

                              {/* Show return status badge if exists */}
                              {product.returnStatus && (
                                <div className="mt-1">
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded
        ${
          product.returnStatus === "In Process"
            ? "bg-yellow-100 text-yellow-700"
            : product.returnStatus === "Approved"
              ? "bg-green-100 text-green-700"
              : product.returnStatus === "Rejected"
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-600"
        }
      `}
                                  >
                                    {product.returnStatus}
                                  </span>
                                </div>
                              )}
                            </td>

                            {/* Subtotal */}
                            <td className="border p-2">₹{product.subtotal}</td>
                          </tr>
                        ),
                      )}
                    </tbody>

                    <tfoot>
                      <tr>
                        <td
                          colSpan="5"
                          className="border p-2 text-right font-bold"
                        >
                          Total:
                        </td>
                        <td className="border p-2 font-bold">
                          ₹{selectedOrder?.totalPrice || 0}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t text-center text-sm text-gray-500">
                <p>
                  Last updated:{" "}
                  {new Date(selectedOrder?.updatedAt).toLocaleString()}
                </p>
              </div>
            </>
          ) : (
            <p>No order selected</p>
          )}
        </div>
      </Modal>


{/* Hidden Printable Invoice - Always rendered */}
<div style={{ display: 'none' }}>
  <React.Suspense fallback={<div>Loading...</div>}>
    <PrintableInvoice ref={invoicePrintRef} order={selectedOrder} />
  </React.Suspense>
</div>

      {/* Edit Order Status Modal */}
      <Modal
        title="Update Order Status"
        visible={isEditModalOpen}
        onCancel={closeEditModal}
        footer={[
          <Button key="cancel" onClick={closeEditModal}>
            Cancel
          </Button>,
          <Button
            key="update"
            type="primary"
            loading={updating}
            onClick={updateOrderStatus}
          >
            Update Status
          </Button>,
        ]}
      >
        {editingOrder && (
          <div>
            <div className="mb-4">
              <p>
                <strong>Order ID:</strong> {editingOrder?.orderId}
              </p>
              <div className=" grid gap-5 mt-3">
                <p>
                  <strong>Order Status:</strong>{" "}
                  <span
                    className={`font-semibold ${
                      editingOrder.orderStatus === "Pending"
                        ? "text-yellow-600"
                        : editingOrder.orderStatus === "Shipped"
                          ? "text-blue-600"
                          : editingOrder.orderStatus === "Delivered"
                            ? "text-green-600"
                            : editingOrder.orderStatus === "Cancelled"
                              ? "text-red-600"
                              : editingOrder.orderStatus === "Return Request"
                                ? "text-orange-600"
                                : editingOrder.orderStatus === "Returned"
                                  ? "text-purple-600"
                                  : "text-gray-600"
                    }`}
                  >
                    {editingOrder.orderStatus}
                  </span>
                </p>
                <p>
                  <strong>Payment Status:</strong>{" "}
                  <span
                    className={`font-semibold ${
                      editingOrder?.paymentStatus === "Pending"
                        ? "text-yellow-600"
                        : editingOrder?.paymentStatus === "Paid"
                          ? "text-green-600"
                          : "text-red-600"
                    }`}
                  >
                    {editingOrder?.paymentStatus}
                  </span>
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-medium">
                Select Order Status:
              </label>
              <Select
                style={{ width: "100%" }}
                value={editingOrder?.orderStatus}
                onChange={handleStatusChange}
                options={statusOptions}
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-medium">
                Select Payment Status:
              </label>
              <Select
                style={{ width: "100%" }}
                value={editingOrder?.paymentStatus}
                onChange={handlePaymentStatusChange}
                options={paymentOptions}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Custom Date Range Export Modal (Date Wise) */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <FaCalendarAlt />
            <span>Export Orders - Date Wise</span>
          </div>
        }
        visible={isCustomExportModalOpen}
        onCancel={() => setIsCustomExportModalOpen(false)}
        onOk={handleCustomExportOk}
        okText="Export"
        cancelText="Cancel"
      >
        <p className="mb-2">Select date range (From - To):</p>
        <RangePicker
          value={exportDateRange}
          onChange={(dates) => setExportDateRange(dates || [])}
          style={{ width: "100%" }}
        />
      </Modal>

      <Modal
        title="Return Request Details"
        open={isReturnModalOpen}
        onCancel={() => {
          setIsReturnModalOpen(false);
          setSelectedReturnProduct(null);
        }}
        footer={null}
        width={600}
      >
        {selectedReturnProduct && (
          <div className="space-y-4">
            {/* Product Info */}
            <div className="flex gap-4 border-b pb-4">
              <img
                src={
                  selectedReturnProduct.selectedVariant?.variantImages?.[0] ||
                  selectedReturnProduct.selectedVariant
                    ?.nonVariantImages?.[0] ||
                  selectedReturnProduct.productImage?.[0] ||
                  "/default-image.png"
                }
                alt="Product"
                className="w-24 h-24 object-cover rounded border"
                onError={(e) => {
                  e.target.src = "/default-image.png";
                }}
              />

              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {selectedReturnProduct.productTitle || "N/A"}
                </h3>
                {selectedReturnProduct.selectedVariant?.productTitle && (
                  <p className="text-sm text-gray-600">
                    Variant:{" "}
                    {selectedReturnProduct.selectedVariant.productTitle}
                  </p>
                )}
                <div className="mt-2 space-y-1">
                  <p className="text-sm">
                    <strong>Quantity:</strong> {selectedReturnProduct.quantity}
                  </p>
                  <p className="text-sm">
                    <strong>Price:</strong> ₹{selectedReturnProduct.price}
                  </p>
                  <p className="text-sm">
                    <strong>Subtotal:</strong> ₹{selectedReturnProduct.subtotal}
                  </p>
                </div>
              </div>
            </div>

            {/* Return Reason */}
            <div>
              <p className="font-medium mb-2">Return Reason:</p>
              <p className="text-gray-700 bg-gray-50 p-3 rounded border">
                {selectedReturnProduct.returnReason || "No reason provided"}
              </p>
            </div>

            {/* Return Image */}
            {selectedReturnProduct.returnImage && (
              <div>
                <p className="font-medium mb-2">Return Image:</p>
                <img
                  src={selectedReturnProduct.returnImage}
                  alt="Return proof"
                  className="w-full max-w-md h-auto object-cover rounded border"
                  onError={(e) => {
                    e.target.src = "/default-image.png";
                  }}
                />
              </div>
            )}

            {/* Current Status */}
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm">
                <strong>Current Status:</strong>{" "}
                <span className="text-blue-700">
                  {selectedReturnProduct.returnStatus || "In Process"}
                </span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                danger
                icon={<span>❌</span>}
                onClick={() => handleReturnDecision("Rejected")}
                loading={updating}
              >
                Reject Return
              </Button>

              <Button
                type="primary"
                icon={<span>✅</span>}
                onClick={() => handleReturnDecision("Returned")}
                loading={updating}
              >
                Approve Return
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Order;
