
import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Modal, Button, Switch, message, Input } from "antd";
import { FaEye, FaDownload } from "react-icons/fa";
import * as XLSX from "xlsx";
import {
  getAllCustomers,
  getCustomerById,
  updateCustomer,
} from "../../Interceptor/interceptor";
import { toast } from "react-toastify";

export default function Customer() {
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [blockTab, setBlockTab] = useState("all");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await getAllCustomers();
      if (response && response.data) {
        setCustomers(response.data);
      }
    } catch (error) {
      message.error("Failed to fetch customers");
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  // Excel Export Function
  const exportToExcel = () => {
    // Prepare unblocked customers data
    const unblockedData = customers
      .filter((customer) => customer.status === "unblock")
      .map((customer, index) => ({
        "S.No": index + 1,
        "Customer Name": customer.name,
        Email: customer.email || "-",
        "Phone Number": customer.address && customer.address.length > 0 ? customer.address[0].phone || "-" : "-",
        Status: "Unblocked",
        "Registered On": customer.createdAt
          ? new Date(customer.createdAt).toLocaleDateString()
          : "-",
      }));

    // Prepare blocked customers data
    const blockedData = customers
      .filter((customer) => customer.status === "block")
      .map((customer, index) => ({
        "S.No": index + 1,
        "Customer Name": customer.name,
        Email: customer.email || "-",
        "Phone Number": customer.address && customer.address.length > 0 ? customer.address[0].phone || "-" : "-",
        Status: "Blocked",
        "Registered On": customer.createdAt
          ? new Date(customer.createdAt).toLocaleDateString()
          : "-",
      }));

    // Create worksheets
    const unblockedWorksheet = XLSX.utils.json_to_sheet(unblockedData);
    const blockedWorksheet = XLSX.utils.json_to_sheet(blockedData);

    // Set column widths
    const columnWidths = [
      { wch: 8 }, // S.No
      { wch: 25 }, // Customer Name
      { wch: 30 }, // Email
      { wch: 15 }, // Phone Number
      { wch: 12 }, // Status
      { wch: 15 }, // Registered On
    ];

    unblockedWorksheet["!cols"] = columnWidths;
    blockedWorksheet["!cols"] = columnWidths;

    // Create workbook with both sheets
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      unblockedWorksheet,
      "Active Customers"
    );
    XLSX.utils.book_append_sheet(
      workbook,
      blockedWorksheet,
      "Blocked Customers"
    );

    // Export the file
    XLSX.writeFile(workbook, "Customers.xlsx");
  };

  const toggleModal = async (customerId) => {
    try {
      const response = customers.find((item) => item._id === customerId);
      if (response) {
        setSelectedCustomer(response);
        setIsDetailsModalOpen(true);
      }
    } catch (error) {
      message.error("Failed to fetch customer details");
      console.error("Error fetching customer details:", error);
    }
  };

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

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedCustomer(null);
  };

  useEffect(() => {
    fetchCustomers();
  }, [blockTab]);

  const handleToggleChange = async (checked, customer) => {
    const newStatus = checked ? "block" : "unblock";

    try {
      const response = await updateCustomer(customer._id, {
        status: newStatus,
      });
      if (response) {
        toast.success(
          `Customer ${newStatus === "block" ? "blocked" : "unblocked"
          } successfully`
        );
        setCustomers(
          customers.map((c) =>
            c._id === customer._id ? { ...c, status: newStatus } : c
          )
        );
      }
      fetchCustomers();
    } catch (error) {
      message.error(`Failed to update customer status`);
      console.error("Error updating customer status:", error);
    }
  };

  const filterProducts = (status) => {
    setBlockTab(status);
  };

  const filteredCustomers = customers
    .filter((customer) => {
      if (blockTab === "block") return customer.status === "block";
      if (blockTab === "unblock") return customer.status === "unblock";
      return true; // For "all" tab, return all customers
    })
    .filter(
      (customer) =>
        customer.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        (customer.address &&
          customer.address.length > 0 &&
          customer.address[0].phone?.toLowerCase().includes(searchText.toLowerCase()))
    );

  const columns = [
    {
      name: "S.No",
      cell: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
      sortable: true,
      width: "10%",
    },
    {
      name: "",
      cell: (row) => {
        const colors = [
          "#FFB3BA",
          "#B3E5FC",
          "#C8E6C9",
          "#FFF9C4",
          "#FFCCBC",
          "#D1C4E9",
        ];
        const firstChar = row.name.charAt(0).toUpperCase();
        const colorIndex = firstChar.charCodeAt(0) % colors.length;
        const bgColor = colors[colorIndex];

        return (
          <div
            className="w-10 h-10 flex items-center justify-center rounded-full text-white font-bold"
            style={{ backgroundColor: bgColor }}
          >
            {firstChar}
          </div>
        );
      },
      width: "10%",
      center: true,
    },
    {
      name: "Customer Name",
      selector: (row) => row.name,
      sortable: true,
      width: "20%",
    },
    {
      name: "Email",
      selector: (row) => row.email || "-",
      width: "20%",
    },
    {
      name: "Phone Number",
      selector: (row) =>
        row.address && row.address.length > 0 ? row.address[0].phone || "-" : "-",
      sortable: true,
      width: "20%",
    },
    {
      name: "Status",
      cell: (row) => (
        <Switch
          checked={row.status === "block"}
          onChange={(checked) => handleToggleChange(checked, row)}
          checkedChildren="Blocked"
          unCheckedChildren="Unblock"
        />
      ),
      width: "10%",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div
          onClick={() => toggleModal(row._id)}
          className="bg-gray-100 text-gray-800 p-2 rounded cursor-pointer hover:bg-gray-200 items-center"
        >
          <FaEye />
        </div>
      ),
      width: "10%",
      center: true,
    },
  ];

  return (
    <div className="p-4 bg-gray-100 min-h-screen font-content">
      <div className="bg-white min-h-[calc(100vh-100px)] p-6 shadow-md rounded-md">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4 px-8">
          <h1 className="text-2xl font-semibold text-gray-800 whitespace-nowrap">
            Customers
          </h1>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <Input
              placeholder="Search customers..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full md:w-64"
              allowClear
            />
            
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="mb-6 px-6">
          <div className="flex">
            <div
              className={`cursor-pointer px-4 py-2 font-medium ${blockTab === "all"
                ? "text-secondary border-b-2 border-secondary"
                : "text-gray-500 hover:text-gray-700"
                }`}
              onClick={() => filterProducts("all")}
            >
              All
            </div>
            <div
              className={`cursor-pointer px-4 py-2 font-medium ${blockTab === "unblock"
                ? "text-secondary border-b-2 border-secondary"
                : "text-gray-500 hover:text-gray-700"
                }`}
              onClick={() => filterProducts("unblock")}
            >
              Unblock
            </div>
            <div
              className={`cursor-pointer px-4 py-2 font-medium ${blockTab === "block"
                ? "text-secondary border-b-2 border-secondary"
                : "text-gray-500 hover:text-gray-700"
                }`}
              onClick={() => filterProducts("block")}
            >
              Blocked
            </div>
            <div className="flex gap-3 ms-auto">
             

              {/* Export to Excel Button */}
              <button
                onClick={exportToExcel}
                className="flex items-center cursor-pointer justify-center w-10 h-10 rounded-full bg-white border border-gray-300 hover:bg-green-100 hover:border-green-500 transition-all duration-300 shadow-sm"
                title="Export to Excel"
              >
                <FaDownload className="text-secondary hover:text-green-600 w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="w-full overflow-x-auto rounded px-6">
          <DataTable
            columns={columns}
            data={filteredCustomers}
            customStyles={customStyles}
            pagination
            paginationPerPage={rowsPerPage}
            paginationDefaultPage={currentPage}
            onChangePage={(page) => setCurrentPage(page)}
            onChangeRowsPerPage={(newPerPage, page) => {
              setRowsPerPage(newPerPage);
              setCurrentPage(page);
            }}
            highlightOnHover
            progressPending={loading}
            className="bg-white rounded shadow"
          />
        </div>

        {/* Customer Details Modal */}
        <Modal
          open={isDetailsModalOpen}
          onCancel={handleCloseDetailsModal}
          footer={[
            <Button
              key="close"
              type="primary"
              onClick={handleCloseDetailsModal}
              className="bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Close
            </Button>,
          ]}
          width={800}
          className="rounded-lg shadow-xl"
        >
          {selectedCustomer && (
            <div className="p-8 space-y-6">
              <h1 className="text-3xl font-extrabold text-gray-900 text-center">
                Customer Overview
              </h1>

              <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br via-white p-6 rounded-xl">
                  <h2 className="text-2xl font-semibold text-pink-700 mb-4">
                    Basic Info
                  </h2>
                  <p>
                    <strong>Name:</strong> {selectedCustomer.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedCustomer.email}
                  </p>
                </div>

                <div className="p-6 rounded-xl">
                  <h2 className="text-2xl font-semibold text-pink-700 mb-4">
                    Customer Insights
                  </h2>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${selectedCustomer.status === "block"
                        ? "bg-red-200 text-red-900"
                        : "bg-green-200 text-green-900"
                        }`}
                    >
                      {selectedCustomer.status === "block"
                        ? "Blocked"
                        : "Active"}
                    </span>
                  </p>
                  <p>
                    <strong>Role:</strong> {selectedCustomer.role}
                  </p>
                </div>
              </section>

              {selectedCustomer.address && selectedCustomer.address.length > 0 && (
                <section className="bg-gradient-to-br from-green-50 via-white to-green-100 p-6 rounded-xl shadow-md">
                  <h2 className="text-2xl font-semibold text-green-700 mb-4">
                    Address Details
                  </h2>
                  {selectedCustomer.address.map((addr, index) => (
                    <div key={index} className="space-y-4">
                      <h3 className="font-semibold text-lg mb-2">
                        Address {index + 1}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <p>
                          <strong>Full Name:</strong> {addr.fullName || "-"}
                        </p>
                        <p>
                          <strong>Type:</strong> {addr.addressType}
                        </p>
                        <p>
                          <strong>Address:</strong> {addr.addressLine1 || "-"}
                        </p>
                        <p>
                          <strong>City:</strong> {addr.city || "-"}
                        </p>
                        <p>
                          <strong>State:</strong> {addr.state || "-"}
                        </p>
                        <p>
                          <strong>Zip Code:</strong> {addr.zipCode || "-"}
                        </p>
                        <p>
                          <strong>Country:</strong> {addr.country || "-"}
                        </p>
                        <p>
                          <strong>Phone:</strong> {addr.phone || "-"}
                        </p>
                      </div>
                    </div>
                  ))}
                </section>
              )}
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
