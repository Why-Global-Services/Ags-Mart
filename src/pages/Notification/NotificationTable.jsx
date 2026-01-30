// import React, { useState } from "react";
// import { FaEye, FaTrashAlt, FaCalendarAlt, FaSearch } from "react-icons/fa";
// import DataTable from "react-data-table-component";
// import { Modal, Button, DatePicker } from "antd";
// import { useNavigate } from "react-router-dom";
// import dayjs from "dayjs";

// const NotificationTable = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [notificationToView, setNotificationToView] = useState(null);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [selectedDate, setSelectedDate] = useState(null);
//   const navigate = useNavigate();
//   const [searchTerm, setSearchTerm] = useState("");

//   // Sample data with notifications
//   const notifications = [
//     {
//       _id: "1",
//       userId: "user123",
//       title: "New Product Alert",
//       image: "https://via.placeholder.com/150/FF8096/FFFFFF?text=Wow",
//       message: "Check out our new lipstick collection!",
//       sendTo: "All Users",
//       createdAt: new Date(),
//     },
//     {
//       _id: "2",
//       userId: "user456",
//       title: "Special Offer",
//       image: "https://via.placeholder.com/150/FF8096/FFFFFF?text=L'Oreal",
//       message: "20% off on all sunscreens this weekend",
//       sendTo: "Specific User",
//       createdAt: new Date(Date.now() - 86400000), // Yesterday
//     },
//     {
//       _id: "3",
//       userId: "user789",
//       title: "Maintenance Notice",
//       image: "https://via.placeholder.com/150/FF8096/FFFFFF?text=Wow",
//       message: "App will be down for maintenance tomorrow",
//       sendTo: "All Users",
//       createdAt: new Date(Date.now() - 2592000000), // 30 days ago
//     },
//   ];

//   // Filter notifications based on selected date
//   const filterByDate = (notification) => {
//     if (!selectedDate) return true;

//     const notificationDate = dayjs(notification.createdAt);
//     const selectedDay = dayjs(selectedDate);

//     return notificationDate.isSame(selectedDay, "day");
//   };

//   // Filter notifications based on search term
//   const filterBySearch = (notification) => {
//     if (!searchTerm) return true;
//     return (
//       notification.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       notification.sendTo.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//   };

//   // Apply all filters
//   const filteredNotifications = notifications.filter(
//     (notification) => filterByDate(notification) && filterBySearch(notification)
//   );

//   const handleAddNotificationClick = () => {
//     navigate("/notifications/add");
//   };

//   const toggleModal = (notification) => {
//     setNotificationToView(notification);
//     setIsOpen(true);
//   };

//   const handleDeleteClick = (id) => {
//     setShowDeleteModal(true);
//   };

//   const handleDateChange = (date) => {
//     setSelectedDate(date);
//   };

//   const columns = [
//     { 
//       name: "ID", 
//       cell: (row, index) => index + 1, 
//       width: "60px" 
//     },
//     {
//       name: "User ID",
//       selector: (row) => row.userId,
//       grow: 1,
//       minWidth: "120px",
//     },
//     {
//       name: "Title",
//       selector: (row) => row.title,
//       grow: 2,
//       minWidth: "200px",
//     },
//     {
//       name: "Image",
//       cell: (row) => (
//         <img
//           src={row.image}
//           alt={row.title}
//           className="w-10 h-10 object-cover rounded-md"
//         />
//       ),
//       width: "100px",
//     },
//     {
//       name: "Message",
//       selector: (row) => row.message,
//       grow: 3,
//       minWidth: "250px",
//       wrap: true,
//     },
//     {
//       name: "Send to",
//       selector: (row) => row.sendTo,
//       minWidth: "120px",
//     },
//     {
//       name: "Date",
//       selector: (row) => {
//         const date = new Date(row.createdAt);
//         return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
//       },
//       minWidth: "100px",
//     },
//     {
//       name: "Time",
//       selector: (row) => {
//         const date = new Date(row.createdAt);
//         return `${date.getHours().toString().padStart(2, "0")}:${date
//           .getMinutes()
//           .toString()
//           .padStart(2, "0")}`;
//       },
//       width: "80px",
//     },
//     {
//       name: "Actions",
//       cell: (row) => (
//         <div className="flex space-x-2">
//           <button
//             onClick={() => toggleModal(row)}
//             className="bg-gray-100 text-gray-800 p-2 rounded cursor-pointer hover:bg-gray-200"
//           >
//             <FaEye />
//           </button>
//           <button
//             onClick={() => handleDeleteClick(row._id)}
//             className="bg-red-100 text-red-600 p-2 rounded hover:bg-red-200"
//           >
//             <FaTrashAlt />
//           </button>
//         </div>
//       ),
//       width: "120px",
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
//       style: {
//         padding: "8px 12px",
//         fontSize: "14px",
//       },
//     },
//   };

//   return (
//     <div className="p-4 w-full bg-gray-100 min-h-screen">
//       <div className="bg-white p-4 shadow-md rounded-md overflow-x-auto">
//       <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
//   <h2 className="text-xl font-semibold text-gray-800">
//     All Notifications
//   </h2>

//   <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
//     <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
//       <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//       <input
//         type="text"
//         placeholder="Search notifications..."
//         className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-pink-500"
//         value={searchTerm}
//         onChange={(e) => setSearchTerm(e.target.value)}
//       />
//     </div>

//     <div className="flex items-center border border-gray-300 rounded-md px-3 h-[40px]">
//       <FaCalendarAlt className="text-gray-400 mr-2" />
//       <DatePicker
//         bordered={false}
//         placeholder="Select date"
//         onChange={handleDateChange}
//         allowClear
//         style={{ width: 120 }}
//         className="text-sm"
//       />
//     </div>

//     <button
//       onClick={handleAddNotificationClick}
//       className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors duration-300 flex items-center justify-center h-[40px]"
//     >
//       <span className="text-lg mr-1">+</span> Add Notification
//     </button>
//   </div>
// </div>

//         <DataTable
//           columns={columns}
//           data={filteredNotifications}
//           pagination
//           fixedHeader
//           fixedHeaderScrollHeight="500px"
//           customStyles={customStyles}
//           highlightOnHover
//           responsive
//           noDataComponent={
//             <div className="p-4 text-center">No notifications found</div>
//           }
//           dense
//           persistTableHead
//           style={{ width: '100%' }}
//         />
//       </div>

//       <Modal
//         title="Notification Details"
//         open={isOpen}
//         onCancel={() => setIsOpen(false)}
//         footer={[
//           <Button key="close" onClick={() => setIsOpen(false)}>
//             Close
//           </Button>,
//         ]}
//       >
//         {notificationToView && (
//           <div className="space-y-4">
//             <div className="flex flex-col items-center mb-4">
//               <img
//                 src={notificationToView.image}
//                 alt={notificationToView.title}
//                 className="w-32 h-32 object-contain rounded-md"
//               />
//             </div>
//             <div className="space-y-2">
//               <p>
//                 <span className="font-semibold">User ID:</span>{" "}
//                 {notificationToView.userId}
//               </p>
//               <p>
//                 <span className="font-semibold">Title:</span>{" "}
//                 {notificationToView.title}
//               </p>
//               <p>
//                 <span className="font-semibold">Message:</span>{" "}
//                 {notificationToView.message}
//               </p>
//               <p>
//                 <span className="font-semibold">Sent to:</span>{" "}
//                 {notificationToView.sendTo}
//               </p>
//               <p>
//                 <span className="font-semibold">Date:</span>{" "}
//                 {new Date(notificationToView.createdAt).toLocaleDateString()}
//               </p>
//               <p>
//                 <span className="font-semibold">Time:</span>{" "}
//                 {new Date(notificationToView.createdAt).toLocaleTimeString()}
//               </p>
//             </div>
//           </div>
//         )}
//       </Modal>

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
//             onClick={() => {
//               // Add your delete logic here
//               setShowDeleteModal(false);
//             }}
//           >
//             Delete
//           </Button>,
//         ]}
//       >
//         <p>Are you sure you want to delete this notification?</p>
//       </Modal>
//     </div>
//   );
// };

// export default NotificationTable;


import React, { useState, useEffect, useMemo } from "react";
import { FaCalendarAlt, FaSearch, FaEye, FaDownload } from "react-icons/fa";
import { Button, DatePicker, Modal, Switch } from "antd";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import { getNotification } from "../../services/Notification";
import * as XLSX from "xlsx";

const NotificationTable = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notificationToView, setNotificationToView] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Filter states
  const [filterType, setFilterType] = useState("");
  const [filterValue, setFilterValue] = useState("");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await getNotification();
      setNotifications(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to fetch notifications");
      setLoading(false);
    }
  };

  // Extract unique sendTo values
  const sendToOptions = useMemo(() => {
    return [...new Set(notifications.map((notif) => notif.sendTo).filter(Boolean))];
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Apply date filter
    if (selectedDate) {
      filtered = filtered.filter((notif) => 
        dayjs(notif.createdAt).isSame(dayjs(selectedDate), "day")
      );
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((notif) => 
        (notif.title?.toLowerCase() || '').includes(searchLower) ||
        (notif.message?.toLowerCase() || '').includes(searchLower) ||
        (notif.sendTo?.toLowerCase() || '').includes(searchLower)
      );
    }

    // Apply selected filter
    if (filterType && filterValue) {
      if (filterType === "sendTo") {
        filtered = filtered.filter(
          (notif) => notif.sendTo?.toLowerCase() === filterValue.toLowerCase()
        );
      } else if (filterType === "date") {
        filtered = [...filtered].sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return filterValue === "newest" ? dateB - dateA : dateA - dateB;
        });
      }
    }

    return filtered;
  }, [notifications, selectedDate, searchTerm, filterType, filterValue]);

  const filterNotifications = (status) => {
    setActiveTab(status);
  };

  const toggleModal = (notification) => {
    setNotificationToView(notification);
    setIsOpen(true);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleAddNotificationClick = () => {
    navigate("/notifications/add");
  };

  const handleExportToExcel = () => {
    const exportData = filteredNotifications.map((notification, index) => ({
      "S.No": index + 1,
      "Title": notification.title || "-",
      "Message": notification.message || "-",
      "Sent To": notification.sendTo || "-",
      "Date": notification.createdAt 
        ? dayjs(notification.createdAt).format("DD/MM/YYYY") 
        : "-",
      "Time": notification.createdAt
        ? dayjs(notification.createdAt).format("HH:mm")
        : "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Notifications");
    XLSX.writeFile(workbook, "Notifications_Export.xlsx");
  };

  const handleFilterTypeChange = (e) => {
    setFilterType(e.target.value);
    setFilterValue("");
  };

  const resetFilters = () => {
    setFilterType("");
    setFilterValue("");
    setSelectedDate(null);
    setSearchTerm("");
  };

  // Custom styles matching the Product table
  const customStyles = {
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
      },
    },
    subHeader: {
      style: {
        padding: "0",
        margin: "0",
      },
    },
  };

  const columns = [
    {
      name: "S.No",
      cell: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
      width: "5%",
    },
    {
      name: "Image",
      cell: (row) => (
        <div className="flex items-center justify-center">
          {row.image ? (
            <img
              src={row.image}
              alt={row.title || "Notification"}
              className="w-6 h-6 object-cover rounded-md"
            />
          ) : (
            <div className="w-6 h-6 bg-gray-100 flex items-center justify-center rounded-md">
              -
            </div>
          )}
        </div>
      ),
      width: "9%",
    },
    {
      name: "Title",
      selector: (row) => row.title || "-",
      width: "20%",
    },
    {
      name: "Message",
      selector: (row) => row.message || "-",
      cell: (row) => (
        <div className="truncate max-w-xs" title={row.message}>
          {row.message || "-"}
        </div>
      ),
      width: "25%",
    },
    {
      name: "Sent To",
      selector: (row) => row.sendTo || "-",
      width: "12%",
    },
    {
      name: "Date",
      selector: (row) =>
        row.createdAt ? dayjs(row.createdAt).format("DD/MM/YYYY") : "-",
      width: "10%",
    },
    {
      name: "Time",
      selector: (row) =>
        row.createdAt ? dayjs(row.createdAt).format("HH:mm") : "-",
      width: "8%",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex justify-center space-x-1">
          <button
            onClick={() => toggleModal(row)}
            className="bg-gray-100 text-gray-800 p-1 rounded cursor-pointer hover:bg-gray-200"
            aria-label={`View details for ${row.title || "notification"}`}
          >
            <FaEye size={14} />
          </button>
        </div>
      ),
      width: "11%",
    },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen font-content">
      <div className="bg-white min-h-[calc(100vh-100px)] p-4 shadow-md rounded-md">
        <div className="flex flex-row justify-between items-center gap-4 flex-wrap">
          <h2 className="mt-3 ms-2 text-2xl font-semibold text-gray-800 flex-shrink-0 w-48">
            Notifications
          </h2>
          <div className="flex gap-2 items-center flex-wrap">
            <select
              className="w-48 h-10 px-3  cursor-pointer rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={filterType}
              onChange={handleFilterTypeChange}
            >
              <option value="">Select Filter</option>
              <option value="sendTo">Sent To</option>
              <option value="date">Date</option>
            </select>
            <select
              className="w-48 h-10 px-3 cursor-pointer    rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500  disabled:bg-gray-100"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              disabled={!filterType}
            >
              {filterType === "sendTo" && (
                <>
                  <option value="">Select Recipient</option>
                  {sendToOptions.map((sendTo) => (
                    <option key={sendTo} value={sendTo}>
                      {sendTo}
                    </option>
                  ))}
                </>
              )}
              {filterType === "date" && (
                <>
                  <option value="">Select Order</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </>
              )}
            </select>
            <button
              onClick={resetFilters}
              className="w-48 h-10 bg-table text-white cursor-pointer px-4 rounded-md hover:bg-secondary transition duration-300 "
            >
              Reset
            </button>
          </div>
        </div>
        
        <div className="flex flex-row justify-between items-center gap-4 flex-wrap">
          <div className="w-48"></div>
          <div className="flex gap-2 items-center flex-wrap">
            <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center border border-gray-300 rounded-md px-3 h-10">
              <FaCalendarAlt className="text-gray-400 mr-2" />
              <DatePicker
                bordered={false}
                placeholder="Select date"
                onChange={handleDateChange}
                allowClear
                style={{ width: 120 }}
                className="text-sm"
              />
            </div>
            <button
              onClick={handleAddNotificationClick}
              className="w-48 h-10 bg-table text-white border border-gray-300 px-4 py-2 rounded-md hover:bg-secondary cursor-pointer hover:text-white duration-500 whitespace-nowrap "
            >
              Add Notification
            </button>
            <button
              onClick={handleExportToExcel}
              className="w-48 h-10 flex items-center cursor-pointer justify-center gap-2 bg-white border border-green-500 text-green-600 px-4 rounded-md hover:bg-green-500 hover:text-white transition duration-300 text-sm font-medium group"
              title="Download Excel"
            >
              <FaDownload className="text-green-600 group-hover:text-white" />
              Export
            </button>
          </div>
        </div>

      

        <div className="w-full overflow-x-auto mt-10">
          <DataTable
            columns={columns}
            data={filteredNotifications}
            pagination
            paginationPerPage={rowsPerPage}
            paginationDefaultPage={currentPage}
            onChangePage={(page) => setCurrentPage(page)}
            onChangeRowsPerPage={(newPerPage, page) => {
              setRowsPerPage(newPerPage);
              setCurrentPage(page);
            }}
            fixedHeaderScrollHeight="400px"
            customStyles={customStyles}
            highlightOnHover
            responsive
            progressPending={loading}
            className="bg-white rounded shadow"
            noDataComponent={<div className="p-4 text-center">No notifications found</div>}
          />
        </div>
      </div>

      <Modal
        title="Notification Details"
        open={isOpen}
        onCancel={() => setIsOpen(false)}
        footer={[
          <Button
            key="close"
            onClick={() => setIsOpen(false)}
            className="bg-indigo-600 text-white hover:bg-indigo-700"
            aria-label="Close notification details"
          >
            Close
          </Button>,
        ]}
        width={800}
        className="rounded-lg shadow-xl"
      >
        {notificationToView && (
          <div className="space-y-4 p-4">
            <div className="flex flex-col md:flex-row gap-6">
              {notificationToView.image && (
                <div className="w-full md:w-1/3">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Notification Image</h3>
                    <img
                      src={notificationToView.image}
                      alt="Notification"
                      className="w-full h-32 object-contain rounded-md"
                    />
                  </div>
                </div>
              )}
              <div className="w-full md:w-2/3 space-y-2">
                <h2 className="text-2xl font-bold">{notificationToView.title || "-"}</h2>
                <p className="text-gray-600">{notificationToView.message || "-"}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Sent To</h3>
                <p>{notificationToView.sendTo || "-"}</p>
              </div>
              <div>
                <h3 className="font-semibold">Date</h3>
                <p>
                  {notificationToView.createdAt
                    ? dayjs(notificationToView.createdAt).format("DD/MM/YYYY")
                    : "-"}
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Time</h3>
                <p>
                  {notificationToView.createdAt
                    ? dayjs(notificationToView.createdAt).format("HH:mm")
                    : "-"}
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Created At</h3>
                <p>
                  {notificationToView.createdAt
                    ? dayjs(notificationToView.createdAt).format("DD/MM/YYYY HH:mm")
                    : "-"}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default NotificationTable;