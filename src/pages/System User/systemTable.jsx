import React, { useState, useEffect } from "react";
import { FaEdit, FaSearch, FaTrashAlt, FaEye } from "react-icons/fa";
import DataTable from "react-data-table-component";
import { Switch, Modal, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import { 
  getAllSystemUsers, 
  deleteSystemUser, 
  updateSystemUser,
  getSystemUserById
} from "./systemServices";

const SystemTable = () => {
  const [filterStatus, setFilterStatus] = useState("active");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState("active");
  const [selectedRole, setSelectedRole] = useState("all");
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  const userRoles = [
    "all",
    "Super Admin",
    "Admin",
    "Manager",
    "Employee",
    "Support",
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getAllSystemUsers();
      const usersData = Array.isArray(res) ? res : [];
      const usersWithStatus = usersData.map((user) => ({
        ...user,
        status: user.status || "active",
      }));
      setUsers(usersWithStatus);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      message.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    return users.filter(user => {
      const searchTermLower = searchTerm.toLowerCase().trim();
      const searchMatch = 
        searchTerm === '' || 
        user.userName?.toLowerCase().includes(searchTermLower) ||
        user.email?.toLowerCase().includes(searchTermLower);
      return (filterStatus === "all" || user.status === filterStatus) &&
             (selectedRole === "all" || user.userRole === selectedRole) &&
             searchMatch;
    });
  };

  const filteredUsers = filterUsers();

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (status) => {
    setFilterStatus(status);
    setActiveTab(status);
  };

  const handleAddUser = () => {
    navigate("/systemUser/add");
  };

  const handleEditClick = async (user) => {
    try {
      const response = await getSystemUserById(user._id);
      navigate(`/systemUser/edit/${user._id}`);
    } catch (error) {
      message.error("Failed to fetch user details");
      console.error("Error fetching user details:", error);
    }
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteSystemUser(selectedUser._id);
      const updatedUsers = users.filter((user) => user._id !== selectedUser._id);
      setUsers(updatedUsers);
      message.success("User deleted successfully");
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting user:", error);
      message.error("Failed to delete user");
    }
  };

  const handleToggleChange = async (checked, row) => {
    const newStatus = checked ? "active" : "inactive";
    try {
      await updateSystemUser(row._id, { status: newStatus });
      const updatedUsers = users.map((user) =>
        user._id === row._id ? { ...user, status: newStatus } : user
      );
      setUsers(updatedUsers);
      message.success(`User status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating user status:", error);
      message.error("Failed to update user status");
    }
  };

  const handleViewClick = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const columns = [
    { 
      name: "S No", 
      cell: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
      sortable: true,
      width: "8%",
      center: true,
    },
    {
      name: "User Name",
      selector: (row) => row.userName || "-",
      sortable: true,
      width: "10%",
      center: true,
    },
    { 
      name: "Mobile Number", 
      selector: (row) => row.mobileNumber || "-",
      sortable: true,
      width: "15%",
      center: true,
    },
    { 
      name: "E-mail ID", 
      selector: (row) => row.email || "-",
      sortable: true,
      width: "25%",
      center: true,
    },
    { 
      name: "Role", 
      selector: (row) => row.userRole || "-",
      sortable: true,
      width: "15%",
      center: true,
    },
    {
      name: "Status",
      cell: (row) => (
        <Switch
          checked={row.status === "active"}
          onChange={(checked) => handleToggleChange(checked, row)}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
        />
      ),
      width: "15%",
      center: true,
      sortable: true,
      selector: (row) => row.status,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex space-x-2 justify-center">
          <button
            onClick={() => handleViewClick(row)}
            className="bg-gray-100 text-gray-800 p-2 rounded cursor-pointer hover:bg-gray-200"
            title="View"
          >
            <FaEye />
          </button>
          <button
            onClick={() => handleEditClick(row)}
            className="bg-orange-100 text-orange-600 p-2 rounded cursor-pointer hover:bg-orange-200"
            title="Edit"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => handleDeleteClick(row)}
            className="bg-red-100 text-red-600 p-2 rounded cursor-pointer hover:bg-red-200"
            title="Delete"
          >
            <FaTrashAlt />
          </button>
        </div>
      ),
      width: "12%",
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
        borderRight: "1px solid #e5e7eb", // Vertical border for header cells
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
        border: "1px solid #e5e7eb", // Outer border for the entire table
      },
    },
    subHeader: {
      style: {
        padding: "0",
        margin: "0",
      },
    },
  };

  return (
    <div className="p-4 w-full bg-gray-100 overflow-hidden">
      <div className="bg-white min-h-[calc(100vh-100px)] p-6 shadow-md rounded-md overflow-x-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-4 md:space-y-0 px-8">
          <h2 className="text-xl font-semibold text-gray-800 w-full text-center md:text-left">
            Users
          </h2>
          <div className="flex space-x-2 w-full justify-end">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                className="border border-gray-300 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={searchTerm}
                onChange={handleSearch}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            <select
              value={selectedRole}
              onChange={handleRoleChange}
              className="border border-gray-300 cursor-pointer rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {userRoles.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <button
              onClick={handleAddUser}
              className="w-48 h-10 bg-table text-white cursor-pointer border border-table px-4 py-2 rounded-md hover:bg-secondary hover:text-white duration-500 whitespace-nowrap"
            >
              Add User
            </button>
          </div>
        </div>

        <div className="w-[40%] mb-5 px-8">
          <div className="flex">
            <div
              className={`cursor-pointer px-4 py-2 font-medium ${
                activeTab === "active"
                  ? "text-secondary border-b-2 border-secondary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => handleStatusFilter("active")}
            >
              Active
            </div>
            <div
              className={`cursor-pointer px-4 py-2 font-medium ${
                activeTab === "inactive"
                  ? "text-secondary border-b-2 border-secondary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => handleStatusFilter("inactive")}
            >
              Inactive
            </div>
          </div>
        </div>
        <div className="w-full overflow-x-auto rounded px-8">
          <DataTable
            columns={columns}
            data={filteredUsers}
            pagination
            paginationPerPage={rowsPerPage}
            paginationDefaultPage={currentPage}
            onChangePage={page => setCurrentPage(page)}
            onChangeRowsPerPage={(newPerPage, page) => {
              setRowsPerPage(newPerPage);
              setCurrentPage(page);
            }}
            customStyles={customStyles}
            highlightOnHover
            responsive
            progressPending={loading}
            noDataComponent="No users found"
            dense
          />
        </div>

        <Modal
          title="Confirm Delete"
          open={showDeleteModal}
          onOk={confirmDelete}
          onCancel={() => setShowDeleteModal(false)}
          footer={[
            <Button key="back" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              danger
              onClick={confirmDelete}
            >
              Delete
            </Button>,
          ]}
        >
          <p>Are you sure you want to delete user <strong>{selectedUser?.userName}</strong>?</p>
        </Modal>

        <Modal
          title="User Details"
          open={showViewModal}
          onCancel={() => setShowViewModal(false)}
          footer={[
            <Button key="close" onClick={() => setShowViewModal(false)}>
              Close
            </Button>,
          ]}
          width={600}
        >
          {selectedUser && (
            <div className="space-y-6 p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 capitalize">
                    {selectedUser.userName}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {selectedUser.email}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="font-medium text-gray-500">Mobile</p>
                  <p className="text-gray-800">
                    {selectedUser.mobileNumber || "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-gray-500">Role</p>
                  <p className="text-gray-800 capitalize">
                    {selectedUser.userRole}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-gray-500">Status</p>
                  <p className={`capitalize font-medium ${
                    selectedUser.status === 'active' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {selectedUser.status || "active"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default SystemTable;
