import React, { useState, useEffect } from "react";
import { FaEye, FaEdit, FaTrashAlt, FaDownload, FaPlus, FaStar } from "react-icons/fa";
import DataTable from "react-data-table-component";
import { Modal, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { getTestimonial, deleteTestimonial } from "../../Interceptor/interceptor";

const Reviews = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [categoryToView, setCategoryToView] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
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
      const res = await getTestimonial();
      setCategories(res.data);
    } catch (error) {
      message.error("Failed to fetch reviews");
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = categories;
    if (searchQuery) {
      filtered = filtered.filter((review) =>
        (review.productName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (review.name || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredCategories(filtered);
  }, [searchQuery, categories]);

  const exportToExcel = () => {
    const dataToExport = categories.map((cat, index) => ({
      "S.No": index + 1,
      "Reviewer Name": cat.name,
      "Product Name": cat.productName,
      Rating: cat.rating,
      Comments: cat.comments || "No comments",
      "Created At": new Date(cat.createdAt).toLocaleDateString(),
    }));

    const columnWidths = [
      { wch: 8 },
      { wch: 15 },
      { wch: 20 },
      { wch: 10 },
      { wch: 30 },
      { wch: 15 },
    ];

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    worksheet["!cols"] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "All Reviews");
    XLSX.writeFile(workbook, "Reviews.xlsx");
  };

  const handleEditClick = (review) => {
    navigate(`/testimonial/edit/${review._id}`, { state: { review } });
  };

  const handleAddReviewClick = () => {
    navigate("/testimonial/add");
  };

  const toggleModal = (review) => {
    setCategoryToView(review);
    setIsOpen(true);
  };

  const handleDeleteClick = (review) => {
    setCategoryToView(review);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToView) return;
    try {
      setDeleteLoading(true);
      await deleteTestimonial(categoryToView._id);
      const updatedCategories = categories.filter(
        (review) => review._id !== categoryToView._id
      );
      setCategories(updatedCategories);
      toast.success("Review deleted successfully");
      setShowDeleteModal(false);
      setCategoryToView(null);
    } catch (error) {
      toast.error("Failed to delete review");
      console.error("Error deleting review:", error);
    } finally {
      setDeleteLoading(false);
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
      },
    },
    rows: {
      style: {
        borderBottom: "1px solid #e5e7eb",
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
  };

  const columns = [
    {
      name: "S.No",
      cell: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
      width: "8%",
    },
    {
      name: "Product Name",
      selector: (row) => row.productName || "-",
      width: "30%",
    },
    {
      name: "Rating",
      cell: (row) => (
        <div className="flex justify-center">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                size={14}
                className={i < row.rating ? "text-yellow-400" : "text-gray-300"}
              />
            ))}
          </div>
        </div>
      ),
      width: "15%",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex justify-center space-x-1">
          <button
            onClick={() => toggleModal(row)}
            className="bg-gray-100 cursor-pointer text-gray-800 p-1 rounded hover:bg-gray-200"
            aria-label="View"
          >
            <FaEye size={14} />
          </button>
          <button
            onClick={() => handleEditClick(row)}
            className="bg-orange-100 cursor-pointer text-orange-600 p-1 rounded hover:bg-orange-200"
            aria-label="Edit"
          >
            <FaEdit size={14} />
          </button>
          <button
            onClick={() => handleDeleteClick(row)}
            className="bg-red-100 cursor-pointer text-red-600 p-1 rounded hover:bg-red-200"
            aria-label="Delete"
          >
            <FaTrashAlt size={14} />
          </button>
        </div>
      ),
      width: "35%",
    },
  ];

  return (
    <div className="p-4 w-full bg-gray-100">
      <div className="bg-white min-h-[calc(100vh-100px)] p-6 shadow-md rounded-md">
        <div className="flex flex-col md:flex-row justify-between items-center mb-5 space-y-4 md:space-y-0 px-8">
          <h2 className="text-2xl font-semibold text-gray-800">Testimonial</h2>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-full md:w-64"
            />
          </div>
        </div>

        <div className="mb-5 px-8">
          <div className="flex justify-end">
            <div className="flex gap-3">
              <button
                onClick={handleAddReviewClick}
                className="flex items-center cursor-pointer justify-center w-10 h-10 rounded-full bg-white border border-gray-300 hover:bg-green-100 hover:border-green-500 transition-all duration-300 shadow-sm"
                title="Add Review"
              >
                <FaPlus className="text-secondary hover:text-green-600 w-4 h-4" />
              </button>
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
            noDataComponent={<div className="p-4 text-center">No reviews found</div>}
          />
        </div>
      </div>

      {/* View Modal */}
      <Modal
        title="Review Details"
        open={isOpen}
        onCancel={() => setIsOpen(false)}
        footer={[<Button key="close" onClick={() => setIsOpen(false)}>Close</Button>]}
        width={600}
      >
        {categoryToView && (
          <div className="space-y-4">
            <div className="flex flex-col items-center mb-4">
              {categoryToView.imageURL && (
                <img
                  src={categoryToView.imageURL}
                  alt={categoryToView.productName}
                  className="w-52 h-40 object-contain rounded-md border border-gray-200 p-2"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/208x160";
                  }}
                />
              )}
              <h3 className="text-xl font-semibold mt-3">{categoryToView.productName}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-gray-600">Reviewer</p>
                <p>{categoryToView.name}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Rating</p>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      size={16}
                      className={i < categoryToView.rating ? "text-yellow-400" : "text-gray-300"}
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="font-medium text-gray-600">Created At</p>
                <p>{new Date(categoryToView.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="md:col-span-2">
                <p className="font-medium text-gray-600">Comments</p>
                <p>{categoryToView.comments || "No comments"}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal
        title="Confirm Delete"
        open={showDeleteModal}
        onOk={handleDeleteConfirm}
        onCancel={() => setShowDeleteModal(false)}
        confirmLoading={deleteLoading}
        footer={[
          <Button key="back" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger
            onClick={handleDeleteConfirm}
            loading={deleteLoading}
          >
            Delete
          </Button>,
        ]}
      >
        <p>
          Are you sure you want to delete the review for "
          <strong>{categoryToView?.productName}</strong>"?
        </p>
      </Modal>
    </div>
  );
};

export default Reviews;