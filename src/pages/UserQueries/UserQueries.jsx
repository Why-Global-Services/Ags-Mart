import React, { useState, useEffect } from "react";
import { FaEye, FaDownload } from "react-icons/fa";
import DataTable from "react-data-table-component";
import { Modal, Button } from "antd";
import { getUserQueries } from "../../Interceptor/interceptor";
import * as XLSX from "xlsx";

const UserQueries = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messageToView, setMessageToView] = useState(null);
  const [allQueries, setAllQueries] = useState([]);
  const [filteredQueries, setFilteredQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch user queries using interceptor
  useEffect(() => {
    const fetchQueries = async () => {
      try {
        setLoading(true);
        const response = await getUserQueries();
        const transformedData = response.data.map((item, index) => ({
          id: item._id || index,
          name: item.name || "Unknown",
          email: item.email || "-",
          phone: item.phone || "-",
          message: item.message || "No message provided",
          createdAt: item.createdAt || new Date().toISOString(),
        }));
        setAllQueries(transformedData);
        setFilteredQueries(transformedData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchQueries();
  }, []);

  // Filter queries by search term
  useEffect(() => {
    if (!allQueries.length) return;

    const filtered = allQueries.filter(
      (item) =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredQueries(filtered);
  }, [searchTerm, allQueries]);

  // Handle message modal
  const toggleModal = (query) => {
    setMessageToView(query);
    setIsOpen(true);
  };

  const handleExportToExcel = () => {
    const exportData = filteredQueries.map((query, index) => ({
      "S.No": index + 1,
      "Name": query.name || "-",
      "Email": query.email || "-",
      "Phone": query.phone || "-",
      "Date": new Date(query.createdAt).toLocaleDateString(),
      "Message": query.message || "-"
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "UserQueries");
    XLSX.writeFile(workbook, "User_Queries_Export.xlsx");
  };

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: "var(--color-table)",
        color: "#fff",
        fontWeight: "600",
        padding: "12px 10px",
        fontSize: "14px",
        lineHeight: "1.5",
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
      width: "8%",
    },
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
      width: "20%",
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
      width: "28%",
    },
    {
      name: "Phone No",
      selector: (row) => row.phone,
      sortable: true,
      width: "17%",
    },
    {
      name: "Date",
      selector: (row) => new Date(row.createdAt).toLocaleDateString(),
      sortable: true,
      width: "12%",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex justify-center space-x-1">
          <button
            onClick={() => toggleModal(row)}
            className="bg-gray-100 text-gray-800 p-1 rounded cursor-pointer hover:bg-gray-200"
            aria-label={`View message from ${row.name}`}
          >
            <FaEye size={14} />
          </button>
        </div>
      ),
      width: "15%",
    },
  ];

  if (loading) {
    return <div className="p-4 text-center">Loading queries...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white min-h-[calc(100vh-100px)] p-4 shadow-md rounded-md">
        <div className="flex flex-row justify-between items-center gap-4 flex-wrap">
          <h2 className="mt-3 ms-2 text-2xl font-semibold text-gray-800 flex-shrink-0 w-48">
            User Queries
          </h2>
          <div className="flex gap-2 items-center flex-wrap">
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              className="w-48 h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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

        <div className="w-full overflow-x-auto mt-4">
          <DataTable
            columns={columns}
            data={filteredQueries}
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
            className="bg-white rounded shadow"
            noDataComponent={<div className="p-4 text-center">No queries found</div>}
          />
        </div>

        <Modal
          title="Query Details"
          open={isOpen}
          onCancel={() => setIsOpen(false)}
          footer={[
            <Button
              key="close"
              onClick={() => setIsOpen(false)}
              className="bg-indigo-600 text-white hover:bg-indigo-700"
              aria-label="Close query details"
            >
              Close
            </Button>,
          ]}
          width={600}
          className="rounded-lg shadow-xl"
        >
          {messageToView && (
            <div className="space-y-4 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Name</h3>
                  <p>{messageToView.name}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <p>{messageToView.email}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Phone</h3>
                  <p>{messageToView.phone}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Date</h3>
                  <p>{new Date(messageToView.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold">Message</h3>
                <div className="bg-gray-50 p-3 rounded-md mt-2">
                  <p className="whitespace-pre-line">{messageToView.message}</p>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default UserQueries;