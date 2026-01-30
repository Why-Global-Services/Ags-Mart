// ReviewTable.jsx
import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Modal, Button, Input, message, Popconfirm } from "antd";
import { FaEye, FaDownload, FaStar, FaTrash } from "react-icons/fa";
import * as XLSX from "xlsx";
import { deleteReviewsRatings, getReviews } from "../../Interceptor/interceptor";
import toast from "react-hot-toast";

export default function ReviewTable() {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedReview, setSelectedReview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await getReviews();
      if (res?.succes && Array.isArray(res.data)) {
        const formatted = res.data.map(item => ({
          ...item,
          product: item.product || {},
          reviews: item.reviews || [],
          firstImage: (
            item.product.productImages?.[0] ||
            item.product.nonVariant?.nonVariantImages?.[0] ||
            "https://via.placeholder.com/150"
          ),
          price: item.product.nonVariant?.price?.salePrice || "-",
        }));
        setReviews(formatted);
        setFilteredReviews(formatted);
      }
    } catch (err) {
      toast.error("Failed to load reviews");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId, productId, r) => {
  try {
    setDeletingId(reviewId);
    // 🔌 TODO: Call your delete API here
    await deleteReviewsRatings(reviewId);

    // Simulate API delay (remove this in production)
    await new Promise(resolve => setTimeout(resolve, 500));

    toast.success("Review deleted successfully");

    // ✅ FIXED: Update selectedReview state correctly
    setSelectedReview((prev) => {
      if (!prev) return null;
      
      // Filter out ONLY the deleted review by its _id
      const updatedReviews = prev.reviews.filter((review) => review._id !== reviewId);
      
      // Recalculate average rating
      const newAvgRating = updatedReviews.length > 0
        ? updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length
        : 0;
      
      return {
        ...prev,
        reviews: updatedReviews,
        totalReviews: updatedReviews.length,
        averageRating: newAvgRating,
      };
    });

    // ✅ FIXED: Update main reviews array
    setReviews((prev) =>
      prev.map((item) => {
        // Match the correct product
        if (item.product._id === productId) {
          // Filter out ONLY the deleted review
          const updatedReviews = item.reviews.filter((review) => review._id !== reviewId);
          
          // Recalculate average rating
          const newAvgRating = updatedReviews.length > 0
            ? updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length
            : 0;
          
          return {
            ...item,
            reviews: updatedReviews,
            totalReviews: updatedReviews.length,
            averageRating: newAvgRating,
          };
        }
        return item;
      })
    );

    // ✅ FIXED: Update filtered reviews
    setFilteredReviews((prev) =>
      prev.map((item) => {
        if (item.product._id === productId) {
          const updatedReviews = item.reviews.filter((review) => review._id !== reviewId);
          
          const newAvgRating = updatedReviews.length > 0
            ? updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length
            : 0;
          
          return {
            ...item,
            reviews: updatedReviews,
            totalReviews: updatedReviews.length,
            averageRating: newAvgRating,
          };
        }
        return item;
      })
    );

  } catch (err) {
    toast.error("Failed to delete review");
    console.error(err);
  } finally {
    setDeletingId(null);
  }
};

  // Filter by search & rating tab
  useEffect(() => {
    let filtered = [...reviews];

    // Search
    if (searchText) {
      filtered = filtered.filter(item =>
        item.product.productName?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Rating tab filter
    if (activeTab !== "all") {
      const rating = parseInt(activeTab);
      filtered = filtered.filter(item => Math.floor(item.averageRating) === rating);
    }

    setFilteredReviews(filtered);
  }, [searchText, activeTab, reviews]);

  // Export to Excel
  const exportToExcel = () => {
    const data = filteredReviews.flatMap((item, idx) =>
      item.reviews.map((review, rIdx) => ({
        "S.No": idx + 1,
        "Product Name": item.product.productName || "-",
        "Rating": review.rating,
        "Review": review.review || "-",
        "Customer": review.userName || "Anonymous",
        "Date": new Date(review.createdAt).toLocaleDateString(),
        "Avg Rating": item.averageRating?.toFixed(1),
        "Total Reviews": item.totalReviews,
      }))
    );

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reviews");
    XLSX.writeFile(wb, "Product_Reviews.xlsx");
    toast.success("Reviews exported successfully!");
  };

  const openModal = (row) => {
    setSelectedReview(row);
    setIsModalOpen(true);
  };

  const columns = [
    {
      name: "S.No",
      cell: (_, index) => index + 1,
      width: "80px",
      center: true,
    },
    {
      name: "Image",
      cell: (row) => (
        <img
          src={row.firstImage}
          alt="product"
          className="w-12 h-12 object-cover rounded-lg border"
          onError={(e) => (e.target.src = "https://via.placeholder.com/48")}
        />
      ),
      center: true,
    },
    {
      name: "Product Name",
      selector: (row) => row.product.productName || "-",
      sortable: true,
    },
    {
      name: "Category",
      selector: (row) => row.product.productCategory || "-",
      center: true,
    },
    {
      name: "Price",
      cell: (row) => `₹${row.price}`,
      center: true,
    },
    {
      name: "Avg Rating",
      cell: (row) => (
        <div className="flex items-center justify-center gap-1">
          <FaStar className="text-yellow-500" />
          <span className="font-bold">{row.averageRating?.toFixed(1) || "0"}</span>
          <span className="text-gray-500 text-sm">({row.totalReviews})</span>
        </div>
      ),
      center: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <button
          onClick={() => openModal(row)}
          className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition"
        >
          <FaEye className="text-gray-700" />
        </button>
      ),
      center: true,
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: "var(--color-table)",
        color: "#fff",
        fontWeight: "600",
        fontSize: "14px",
        textAlign: "center",
      },
    },
    cells: {
      style: {
        textAlign: "center",
        padding: "12px 8px",
        fontSize: "14px",
      },
    },
    rows: {
      style: {
        "&:hover": { backgroundColor: "#f9f9f9" },
      },
    },
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen font-content">
      <div className="bg-white min-h-[calc(100vh-100px)] p-6 shadow-md rounded-md">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 px-8">
          <h1 className="text-2xl font-semibold text-gray-800 whitespace-nowrap">
            Product Reviews
          </h1>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <Input
              placeholder="Search products..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              className="w-full md:w-64"
            />
          </div>
        </div>

        {/* Tabs + Export */}
        <div className="mb-6 px-6">
          <div className="flex items-center border-b">
            {["all", "5", "4", "3", "2", "1"].map((tab) => (
              <div
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`cursor-pointer px-6 py-3 font-medium text-sm transition-all ${
                  activeTab === tab
                    ? "text-secondary border-b-2 border-secondary"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab === "all" ? "All Reviews" : `${tab} Star${tab !== "1" ? "s" : ""}`}
              </div>
            ))}
            <div className="ml-auto">
              <button
                onClick={exportToExcel}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-300 hover:bg-green-100 hover:border-green-500 transition-all shadow-sm"
                title="Export to Excel"
              >
                <FaDownload className="text-secondary hover:text-green-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto rounded px-6">
          <DataTable
            columns={columns}
            data={filteredReviews}
            customStyles={customStyles}
            pagination
            highlightOnHover
            progressPending={loading}
            noDataComponent="No reviews found"
          />
        </div>

        {/* Review Details Modal */}
        <Modal
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          width={900}
          title={<h2 className="text-2xl font-bold">{selectedReview?.product.productName}</h2>}
        >
          {selectedReview && (
            <div className="space-y-8">
              {/* Product Info */}
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <img
                    src={selectedReview.firstImage}
                    alt="product"
                    className="w-full h-64 object-contain rounded-xl border"
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xl">
                    <FaStar className="text-yellow-500" />
                    <span className="font-bold">{selectedReview.averageRating?.toFixed(1)}</span>
                    <span className="text-gray-600">({selectedReview.totalReviews} reviews)</span>
                  </div>
                  <p><strong>Category:</strong> {selectedReview.product.productCategory}</p>
                  <p><strong>Price:</strong> ₹{selectedReview.price}</p>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedReview.product.productDescription?.slice(0, 300)}...
                  </p>
                </div>
              </div>

              {/* Reviews List */}
              <div>
                <h3 className="text-xl font-bold mb-4">Customer Reviews</h3>
                <div className="space-y-6 max-h-96 overflow-y-auto">
                  {selectedReview.reviews.length > 0 ? (
                    selectedReview.reviews.map((r, i) => (
                      <div key={r._id || i} className="bg-gray-50 p-6 rounded-xl border relative">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold text-lg">{r.userName}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(r.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex">
                              {[...Array(5)].map((_, idx) => (
                                <FaStar
                                  key={idx}
                                  className={idx < r.rating ? "text-yellow-500" : "text-gray-300"}
                                />
                              ))}
                            </div>

                            {/* ✅ Delete Button with Popconfirm */}
                            <Popconfirm
                              title="Delete Review"
                              description="Are you sure you want to delete this review?"
                              onConfirm={() => handleDeleteReview(r._id, selectedReview.product._id, r)}
                              okText="Yes"
                              cancelText="No"
                              okButtonProps={{ 
                                danger: true,
                                loading: deletingId === r._id 
                              }}
                            >
                              <button
                                disabled={deletingId === r._id}
                                className="text-red-600 hover:text-red-800 transition p-2 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Delete review"
                              >
                                <FaTrash className="text-lg" />
                              </button>
                            </Popconfirm>
                          </div>
                        </div>
                        <p className="text-gray-800">{r.review}</p>
                        {r.reviewImages?.length > 0 && (
                          <div className="flex flex-wrap gap-3 mt-4">
                            {r.reviewImages.map((img, idx) => (
                              <img
                                key={idx}
                                src={img}
                                alt="review"
                                className="w-24 h-24 object-cover rounded-lg border cursor-pointer hover:opacity-90"
                                onClick={() => window.open(img, "_blank")}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No reviews available for this product
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}