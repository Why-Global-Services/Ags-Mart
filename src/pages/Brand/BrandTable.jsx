import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FaEye, FaEdit, FaTrashAlt, FaPlus } from "react-icons/fa";
import { FiImage } from "react-icons/fi"; // Feather Icons
import DataTable from "react-data-table-component";
import { Modal, Button, Switch, message, Input } from "antd";
import { useNavigate } from "react-router-dom";
import {
  getBrand,
  getBrandById,
  updateBrand,
  deleteBrand,
} from "../../Interceptor/interceptor";
import { toast } from "react-toastify";

const Brands = () => {
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewModalData, setViewModalData] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all"); // Changed default to "all"
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // Changed default to "all"
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await getBrand();
      if (response.data) {
        const brandsWithStatus = response.data.map((brand) => ({
          ...brand,
          status: brand.status || "active",
        }));
        setBrands(brandsWithStatus);
        setFilterStatus("all"); // Changed default to "all"
        filterBrands("all", brandsWithStatus);
      } else {
        message.error("Failed to fetch brands");
      }
    } catch (error) {
      message.error("Failed to fetch brands");
      console.error("Error fetching brands:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterBrands = useCallback(
    (status, brandsData = brands) => {
      setFilterStatus(status);
      setActiveTab(status);
      if (status === "all") {
        return brandsData; // Return all brands if status is "all"
      }
      const filtered = brandsData.filter((brand) => brand.status === status);
      return filtered;
    },
    [brands]
  );

  const handleEditClick = useCallback(
    (brand) => {
      navigate(`/brand/edit/${brand._id}`);
    },
    [navigate]
  );

  const handleAddBrandClick = useCallback(() => {
    navigate("/brand/add");
  }, [navigate]);

  const openViewModal = useCallback(async (brand) => {
    try {
      const response = await getBrandById(brand._id);
      console.log("Full response:", response);
      console.log("Response data:", response.data);

      if (response?.data) {
        const brandData = response.data;
        console.log("Brand data to set in modal:", brandData);
        setViewModalData(brandData);
        setIsViewModalOpen(true);
      } else {
        console.warn("No brand data found or unexpected format:", response);
      }
    } catch (error) {
      message.error("Failed to fetch brand details");
      console.error("Error fetching brand:", error);
    }
  }, []);

  const handleDeleteClick = useCallback((id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    try {
      const response = await deleteBrand(deleteId);
      console.log("Delete response:", response);

      toast.success(response?.message || "Brand deleted successfully");

      await fetchBrands();
      filterBrands(filterStatus);
    } catch (error) {
      toast.error("Failed to delete brand");
      console.error("Error deleting brand:", error);
    } finally {
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  }, [deleteId, filterStatus, fetchBrands, filterBrands]);

  const handleToggleChange = useCallback(
    async (checked, row) => {
      const newStatus = checked ? "active" : "inactive";
      try {
        await updateBrand(row._id, { status: newStatus });
        const updatedBrands = brands.map((brand) =>
          brand._id === row._id ? { ...brand, status: newStatus } : brand
        );
        setBrands(updatedBrands);
        filterBrands(filterStatus, updatedBrands);
        message.success(`Brand status updated to ${newStatus}`);
      } catch (error) {
        message.error("Failed to update brand status");
        console.error("Error updating brand status:", error);
      }
    },
    [brands, filterStatus, filterBrands]
  );

  const columns = useMemo(
    () => [
      {
        name: "S.No",
        cell: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
        width: "80px",
        sortable: false,
        style: {
          paddingLeft: "20px",
        },
      },
      {
        name: "Image",
        cell: (row) => (
          <div className="flex items-center">
            {row.brandImage ? (
              <img
                src={row.brandImage}
                alt={row.brandName || "Brand"}
                className="w-12 h-12 object-cover rounded-md"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/48";
                }}
              />
            ) : (
              <FiImage className="text-gray-400 text-2xl" />
            )}
          </div>
        ),
        width: "100px",
      },
      {
        name: "Brand Name",
        cell: (row) => (
          <div className="flex items-center space-x-4">
            <p className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">
              {row.brandName || "No Name"}
            </p>
          </div>
        ),
        grow: 2,
        minWidth: "200px",
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
        width: "150px",
        center: true,
      },
      {
        name: "Actions",
        cell: (row) => (
          <div className="flex space-x-2 justify-end">
            <button
              onClick={() => openViewModal(row)}
              className="bg-gray-100 text-gray-800 p-2 rounded cursor-pointer hover:bg-gray-200"
              title="View"
            >
              <FaEye />
            </button>
            <button
              onClick={() => handleEditClick(row)}
              className="bg-orange-100 text-orange-600 p-2 rounded hover:bg-orange-200 cursor-pointer"
              title="Edit"
            >
              <FaEdit />
            </button>
            <button
              onClick={() => handleDeleteClick(row._id)}
              className="bg-red-100 text-red-600 p-2 rounded hover:bg-red-200"
              title="Delete"
            >
              <FaTrashAlt />
            </button>
          </div>
        ),
        width: "180px",
        right: true,
      },
    ],
    [handleToggleChange, openViewModal, handleEditClick, handleDeleteClick]
  );

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

  const filteredBrands = useMemo(() => {
    const baseFilter = filterBrands(filterStatus, brands);
    return baseFilter.filter((brand) =>
      brand.brandName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [filterStatus, brands, filterBrands, searchQuery]);

  return (
    <div className="p-4 w-full bg-gray-100">
      <div className="bg-white min-h-[calc(100vh-100px)] p-6 shadow-md rounded-md">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-4 md:space-y-0 px-8">
          <h2 className="text-xl font-semibold text-gray-800 w-full text-center md:text-left">
            Brands
          </h2>
          <div className="flex gap-2 w-full justify-end">
            <input
              type="text"
              placeholder="Search by Brand Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-300 hover:border-gray-300 p-2 rounded-md w-full md:w-48"
            />
          </div>
        </div>

        <div className="w-full mb-5 px-8">
          <div className="flex">
            <div
              className={`cursor-pointer px-4 py-2 font-medium ${activeTab === "all"
                  ? "text-secondary border-b-2 border-secondary"
                  : "text-gray-500 hover:text-gray-700"
                }`}
              onClick={() => setFilterStatus("all")}
            >
              All
            </div>
            <div
              className={`cursor-pointer px-4 py-2 font-medium ${activeTab === "active"
                  ? "text-secondary border-b-2 border-secondary"
                  : "text-gray-500 hover:text-gray-700"
                }`}
              onClick={() => setFilterStatus("active")}
            >
              Active
            </div>
            <div
              className={`cursor-pointer px-4 py-2 font-medium ${activeTab === "inactive"
                  ? "text-secondary border-b-2 border-secondary"
                  : "text-gray-500 hover:text-gray-700"
                }`}
              onClick={() => setFilterStatus("inactive")}
            >
              Inactive
            </div>
            <div className="flex gap-3 ms-auto">
              {/* Add Offer Button */}
              <button
                onClick={handleAddBrandClick}
                className="flex items-center cursor-pointer justify-center w-10 h-10 rounded-full bg-white border border-gray-300 hover:bg-green-100 hover:border-green-500 transition-all duration-300 shadow-sm"
                title="Add Offer"
              >
                <FaPlus className="text-secondary hover:text-green-600 w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
        <div className="w-full overflow-x-auto rounded px-8">
          <DataTable
            columns={columns}
            data={filteredBrands}
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
          />
        </div>
        <Modal
          title="Confirm Delete"
          open={showDeleteModal}
          onOk={confirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setDeleteId(null);
          }}
          footer={[
            <Button
              key="back"
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteId(null);
              }}
            >
              Cancel
            </Button>,
            <Button key="submit" type="primary" danger onClick={confirmDelete}>
              Delete
            </Button>,
          ]}
        >
          <p>Are you sure you want to delete this brand?</p>
        </Modal>

        <Modal
          title="Brand Details"
          open={isViewModalOpen}
          onCancel={() => setIsViewModalOpen(false)}
          width={600}
        >
          {viewModalData && (
            <div className="space-y-4">
              <div className="flex flex-col items-center mb-4">
                {viewModalData.brandImage && (
                  <img
                    src={viewModalData.brandImage}
                    alt={viewModalData.brandName}
                    className="w-52 h-40 object-contain rounded-md border border-gray-200 p-2"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/208x160";
                    }}
                  />
                )}
                <h3 className="text-xl font-semibold mt-3">
                  {viewModalData.brandName || "No Name"}
                </h3>
              </div>
              <div className="ml-60">
                <p className="font-medium text-gray-600">Status</p>
                <p className="capitalize">{viewModalData.status}</p>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default Brands;