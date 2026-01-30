import React, { useState, useEffect } from "react";
import { FaEye, FaEdit, FaTrashAlt, FaDownload, FaPlus } from "react-icons/fa";
import DataTable from "react-data-table-component";
import { Modal, Button, Switch, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import {
  getCategoryById,
  getCategory,
  updateCategory,
  deleteCategory,
} from "../../services/Categories";

const Categories = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [categoryToView, setCategoryToView] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("This Month");
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getCategory();
      const categoriesData = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response)
          ? response
          : [];
      const categoriesWithStatus = categoriesData.map((category) => ({
        ...category,
        status: category.status || "active",
      }));
      setCategories(categoriesWithStatus);
      filterCategories("all", categoriesWithStatus);
    } catch (error) {
      message.error("Failed to fetch categories");
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const activeData = categories
      .filter((cat) => cat.status === "active")
      .map((cat, index) => ({
        "S.No": index + 1,
        "Category Title": cat.categoryTitle,
        Status: cat.status,
        "Created At": new Date(cat.createdAt).toLocaleDateString(),
        Description: cat.categoryDescription || "No description",
      }));

    const inactiveData = categories
      .filter((cat) => cat.status === "inactive")
      .map((cat, index) => ({
        "S.No": index + 1,
        "Category Title": cat.categoryTitle,
        Status: cat.status,
        "Created At": new Date(cat.createdAt).toLocaleDateString(),
        Description: cat.categoryDescription || "No description",
      }));

    const columnWidths = [
      { wch: 8 },
      { wch: 25 },
      { wch: 12 },
      { wch: 15 },
      { wch: 40 },
    ];

    const activeWorksheet = XLSX.utils.json_to_sheet(activeData);
    const inactiveWorksheet = XLSX.utils.json_to_sheet(inactiveData);
    activeWorksheet["!cols"] = columnWidths;
    inactiveWorksheet["!cols"] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, activeWorksheet, "Active Categories");
    XLSX.utils.book_append_sheet(workbook, inactiveWorksheet, "Inactive Categories");

    XLSX.writeFile(workbook, "Categories.xlsx");
  };

  const filterCategories = (status, data = categories) => {
    setFilterStatus(status);
    setActiveTab(status);
    let filtered;
    if (status === "all") {
      filtered = data;
    } else {
      filtered = data.filter((category) => category.status === status);
    }
    setFilteredCategories(filtered);
  };

  useEffect(() => {
    filterCategories(
      filterStatus,
      categories.filter((category) =>
        category.categoryTitle
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, categories]);

  const handleEditClick = async (category) => {
    try {
      const response = await getCategoryById(category._id);
      navigate(`/categories/edit/${category._id}`, {
        state: { category: response.data || response },
      });
    } catch (error) {
      message.error("Failed to fetch category details");
      console.error("Error fetching category details:", error);
    }
  };

  const handleAddCategoryClick = () => {
    navigate("/categories/add");
  };

  const toggleModal = async (category) => {
    try {
      const response = await getCategoryById(category._id);
      setCategoryToView(response.data || response);
      setIsOpen(true);
    } catch (error) {
      message.error("Failed to fetch category details");
      console.error("Error fetching category details:", error);
    }
  };

  const handleDeleteClick = (category) => {
    setCategoryToView(category);
    setShowDeleteModal(true);
  };

  const handleToggleChange = async (checked, row) => {
    const newStatus = checked ? "active" : "inactive";
    try {
      await updateCategory(row._id, { status: newStatus });
      const updatedCategories = categories.map((category) =>
        category._id === row._id
          ? { ...category, status: newStatus }
          : category
      );
      setCategories(updatedCategories);
      filterCategories(filterStatus, updatedCategories);
      message.success("Category status updated successfully");
    } catch (error) {
      message.error("Failed to update category status");
      console.error("Error updating category status:", error);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteCategory(categoryToView._id);
      const updatedCategories = categories.filter(
        (category) => category._id !== categoryToView._id
      );
      setCategories(updatedCategories);
      filterCategories(filterStatus, updatedCategories);
      toast.success("Category deleted successfully");
    } catch (error) {
      toast.error("Failed to delete category");
      console.error("Error deleting category:", error);
    } finally {
      setShowDeleteModal(false);
    }
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
      width: "10%",
      sortable: false,
    },
    {
      name: "Image",
      cell: (row) => (
        <div className="flex items-center justify-center">
          {row.categoryImage ? (
            <img
              src={
                Array.isArray(row.categoryImage)
                  ? row.categoryImage[0]
                  : row.categoryImage
              }
              alt={row.categoryTitle || "Category"}
              className="w-6 h-6 object-cover rounded-md"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/24";
              }}
            />
          ) : (
            <div className="w-6 h-6 bg-gray-100 flex items-center justify-center rounded-md">
              -
            </div>
          )}
        </div>
      ),
      width: "15%",
    },
    {
      name: "Category Name",
      selector: (row) => row.categoryTitle || "-",
      width: "35%",
    },
    {
      name: "Status",
      cell: (row) => (
        <div className="flex justify-center">
          <Switch
            checked={row.status === "active"}
            onChange={(checked) => handleToggleChange(checked, row)}
            checkedChildren="Active"
            unCheckedChildren="Inactive"
            aria-label={`Toggle status for ${row.categoryTitle || "category"}`}
            size="small"
          />
        </div>
      ),
      width: "20%",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex justify-center space-x-1">
          <button
            onClick={() => toggleModal(row)}
            className="bg-gray-100 text-gray-800 p-1 rounded cursor-pointer hover:bg-gray-200"
            aria-label={`View details for ${row.categoryTitle || "category"}`}
          >
            <FaEye size={14} />
          </button>
          <button
            onClick={() => handleEditClick(row)}
            className="bg-orange-100 text-orange-600 p-1 rounded hover:bg-orange-200 cursor-pointer"
            aria-label={`Edit ${row.categoryTitle || "category"}`}
          >
            <FaEdit size={14} />
          </button>
          <button
            onClick={() => handleDeleteClick(row)}
            className="bg-red-100 text-red-600 p-1 rounded hover:bg-red-200 cursor-pointer"
            aria-label={`Delete ${row.categoryTitle || "category"}`}
          >
            <FaTrashAlt size={14} />
          </button>
        </div>
      ),
      width: "20%",
    },
  ];

  return (
    <div className="p-4 w-full bg-gray-100">
      <div className="bg-white min-h-[calc(100vh-100px)] p-6 shadow-md rounded-md">
        <div className="flex flex-col md:flex-row justify-between items-center mb-5 space-y-4 md:space-y-0 px-8">
          <h2 className="text-2xl font-semibold text-gray-800">
            Categories
          </h2>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-full md:w-64"
            />


          </div>
        </div>

        <div className="mb-5 px-8">
          <div className="flex">
            <div
              className={`cursor-pointer px-4 py-2 font-medium ${activeTab === "all"
                ? "text-secondary border-b-2 border-secondary"
                : "text-gray-500 hover:text-gray-700"
                }`}
              onClick={() => filterCategories("all")}
            >
              All
            </div>
            <div
              className={`cursor-pointer px-4 py-2 font-medium ${activeTab === "active"
                ? "text-secondary border-b-2 border-secondary"
                : "text-gray-500 hover:text-gray-700"
                }`}
              onClick={() => filterCategories("active")}
            >
              Active
            </div>
            <div
              className={`cursor-pointer px-4 py-2 font-medium ${activeTab === "inactive"
                ? "text-secondary border-b-2 border-secondary"
                : "text-gray-500 hover:text-gray-700"
                }`}
              onClick={() => filterCategories("inactive")}
            >
              Inactive
            </div>
            <div className="flex gap-3 ms-auto">
              {/* Add Offer Button */}
              <button
                onClick={handleAddCategoryClick}
                className="flex items-center cursor-pointer justify-center w-10 h-10 rounded-full bg-white border border-gray-300 hover:bg-green-100 hover:border-green-500 transition-all duration-300 shadow-sm"
                title="Add Offer"
              >
                <FaPlus className="text-secondary hover:text-green-600 w-4 h-4" />
              </button>

              {/* Export to Excel Button */}
              <button
                onClick={exportToExcel}
                className="flex items-center  cursor-pointer justify-center w-10 h-10 rounded-full bg-white border border-gray-300 hover:bg-green-100 hover:border-green-500 transition-all duration-300 shadow-sm"
                title="Export to Excel"
              >
                <FaDownload className="text-secondary hover:text-green-600 w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="w-full overflow-x-auto rounded px-8">
          <DataTable
            columns={columns}
            data={filteredCategories}
            pagination
            paginationPerPage={rowsPerPage}
            paginationDefaultPage={currentPage}
            onChangePage={(page) => setCurrentPage(page)}
            onChangeRowsPerPage={(newPerPage, page) => {
              setRowsPerPage(newPerPage);
              setCurrentPage(page);
            }}
            fixedHeader
            fixedHeaderScrollHeight="400px"
            customStyles={customStyles}
            highlightOnHover
            responsive
            progressPending={loading}
            className="bg-white rounded shadow"
            noDataComponent={<div className="p-4 text-center">No categories found</div>}
          />
        </div>
      </div>

      <Modal
        title="Category Details"
        open={isOpen}
        onCancel={() => setIsOpen(false)}
        footer={[<Button key="close" onClick={() => setIsOpen(false)}>Close</Button>]}
        width={600}
      >
        {categoryToView && (
          <div className="space-y-4">
            <div className="flex flex-col items-center mb-4">
              {categoryToView.categoryImage && (
                <img
                  src={
                    Array.isArray(categoryToView.categoryImage)
                      ? categoryToView.categoryImage[0]
                      : categoryToView.categoryImage
                  }
                  alt={categoryToView.categoryTitle}
                  className="w-52 h-40 object-contain rounded-md border border-gray-200 p-2"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/208x160";
                  }}
                />
              )}
              <h3 className="text-xl font-semibold mt-3">
                {categoryToView.categoryTitle}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-gray-600">Status</p>
                <p className="capitalize">{categoryToView.status}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Created At</p>
                <p>{new Date(categoryToView.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="md:col-span-2">
                <p className="font-medium text-gray-600">Description</p>
                <p>
                  {categoryToView.categoryDescription || "No description"}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
      <Modal
        title="Confirm Delete"
        open={showDeleteModal}
        onOk={handleDeleteConfirm}
        onCancel={() => setShowDeleteModal(false)}
        confirmLoading={loading}
        footer={[
          <Button key="back" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger
            onClick={handleDeleteConfirm}
            loading={loading}
          >
            Delete
          </Button>,
        ]}
      >
        <p>Are you sure you want to delete the category "{categoryToView?.categoryTitle}"?</p>
      </Modal>
    </div>
  );
};

export default Categories;