// import React, { useState } from "react";
// import { FaEye, FaEdit, FaTrashAlt, FaStar } from "react-icons/fa";
// import DataTable from "react-data-table-component";
// import { Modal, Button, Switch } from "antd";
// import { Link, useNavigate } from "react-router-dom";

// const Featuredproductsview = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [filterStatus, setFilterStatus] = useState("active");
//   const [productToView, setProductToView] = useState(null);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [selectedMonth, setSelectedMonth] = useState("This Month");
//   const [activeTab, setActiveTab] = useState("active");
//   const [selectedCategory, setSelectedCategory] = useState("all");
//   const navigate = useNavigate();

//   // Sample data
//   const [products, setProducts] = useState([
//       {
//         id: 1,
//         name: "Sample Product 1",
//         type: "BodyWash",
//         brand: "Wow",
//         price: 10,
//         discountPrice: 100,
//         code: "lesa mole",
//         productImages: ["https://via.placeholder.com/150"],
//         category: "Body Care",
//         stock: 100,
//         costPrice: 8,
//         rating: 4.5,
//         title: "best living",
//         shortdescription: "best living sofa",
//         style: "style 2",
//         productype :"new added product",

//       },
//       {
//         id: 2,
//         name: "Sample Product 1",
//         type: "FacePack",
//         brand: "Wow",
//         price: 10,
//         discountPrice: 100,
//         code: "lesa mole",
//         productImages: ["https://via.placeholder.com/150"],
//         category: "Face Care",
//         stock: 50,
//         costPrice: 7,
//         rating: 4.2,
//         title: "best living",
//         shortdescription: "best living sofa",
//         style: "style 2",
//         productype :"new added product",

//       },
//       {
//         id: 3,
//         name: "Lipsticks",
//         type: "SunScreen",
//         brand: "Wow",
//         price: 10,
//         discountPrice: 100,
//         code: "lei80 dvw",
//         productImages: ["https://via.placeholder.com/150"],
//         category: "Makeup",
//         stock: 75,
//         costPrice: 6,
//         rating: 4.7,
//         title: "best living",
//         shortdescription: "best living sofa",
//         style: "style 2",
//         productype :"new added product",

//       },
//       {
//         id: 4,
//         name: "SunScreen",
//         type: "BodyWash",
//         brand: "Wow",
//         price: 10,
//         discountPrice: 100,
//         code: "leiFa cePa",
//         productImages: ["https://via.placeholder.com/150"],
//         category: "Skin Care",
//         stock: 120,
//         costPrice: 9,
//         rating: 4.3,
//         title: "best living",
//         shortdescription: "best living sofa",
//         style: "style 2",
//         productype :"new added product",

//       },
//     ]);

//     const [filteredProducts, setFilteredProducts] = useState(products);

//   const categories = ["all", "Lipsticks", "FaceCream", "SunScreen", "BodyWash", "FacePack"];

//   const filterProducts = (status, category = selectedCategory) => {
//     setFilterStatus(status);
//     setActiveTab(status);

//     let filtered = products.filter((product) => product.status === status);

//     if (category !== "all") {
//       filtered = filtered.filter((product) => product.category === category);
//     }

//     setFilteredProducts(filtered);
//   };

//   const handleEditClick = (product) => {
//     navigate(`/categories/edit/${product._id}`, { state: { product } });
//   };

//   const handleAddProductClick = () => {
//     navigate("/featuredproducts/add");
//   };

//   const toggleModal = (product) => {
//     setProductToView(product);
//     setIsOpen(true);
//   };

//   const handleDeleteClick = (id) => {
//     setShowDeleteModal(true);
//   };

//   const columns = [
//     { name: "ID", cell: (row, index) => index + 1, width: "60px" },
//     {
//       name: "Title",
//       width: "200px",
//       cell: (row) => (
//         <div className="flex items-center space-x-4">

//           <p>{row.title}</p>
//         </div>
//       ),
//     },
//     {
//       name: "SHORT DESCRIPTION",
//       selector: (row) => row.shortdescription || "-",
//       width: "200px",
//     },
//     {
//       name: "STYLE",
//       selector: (row) => row.style || "-",
//       width: "100px",
//     },
//     { name: "CATEGORIES", selector: (row) => row.category || "-", width: "fit" },
//     { name: "PRODUCT TYPE", selector: (row) => `${row.productype}`, width: "fit" },
//     { name: "DATE", selector: (row) => `${row.date}`, width: "fit" },
//     {
//       name: "ACTIONS",selector: (row) => `${row.action}`, width: "fit"}

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

//   return (
//     <div className="p-4 w-full bg-gray-100 ">
//       <div className="bg-white min-h-[calc(100vh-100px)] p-4 shadow-md rounded-md">
//         <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-4 md:space-y-0">
//           <h2 className="text-xl font-semibold text-gray-800 w-full text-center md:text-left">
//             Featured Section List
//           </h2>
//           <div className="flex space-x-2 w-full justify-end">
//           <button
//               onClick={handleAddProductClick}
//               className="bg-white border border-primary px-4 py-2 rounded-md hover:bg-primaryColor hover:bg-primary hover:text-white duration-500 cursor-pointer"
//             >
//               Add Section
//             </button>

//           </div>
//         </div>

//         <div className="w-[40%] mb-5">
//           <div className="flex">
//             <div
//               className={`cursor-pointer px-4 py-2 text-lg font-medium ${
//                 activeTab === "active"
//                   ? "text-primaryColor border-b-2 border-primaryColor"
//                   : "text-gray-500"
//               }`}
//               onClick={() => filterProducts("active")}
//             >
//               Your Products
//             </div>

//           </div>
//         </div>

//         <DataTable
//           columns={columns}
//           data={filteredProducts}
//           pagination
//           fixedHeaderScrollHeight="400px"
//           customStyles={customStyles}
//           highlightOnHover
//           responsive
//         />
//       </div>

//     </div>
//   );
// };

// export default Featuredproductsview;
import React, { useState, useEffect } from "react";
import { Button, Switch, message, Input } from "antd";
import ActionsMenu from "../../components/ActionMenu";
import ReusableModal from "../../components/ReusableModal";
import DataTable from "react-data-table-component";
import {
  getAllFeatured,
  deleteFeaturedSection,
  updatefeaturedStatus,
} from "../../services/FeaturedSection";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import { FaDownload, FaPlus } from "react-icons/fa";

const Featuredproductsview = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [productToView, setProductToView] = useState(null);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      const response = await getAllFeatured();
      const productsData = Array.isArray(response.data) ? response.data : [];
      const productsWithStatus = productsData.map((product) => ({
        ...product,
        status: product.status || "active",
      }));
      setProducts(productsWithStatus);
    } catch (error) {
      console.error("Error fetching featured products:", error);
      message.error("Failed to fetch featured products");
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let result = [...products];

    // Apply search filter
    if (searchTerm.trim()) {
      result = result.filter(
        (product) =>
          product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    result = result.filter((product) => product.status === activeTab);
    return result;
  };

  const filteredProducts = filterProducts();

  const exportToExcel = () => {
    console.log("Export to Excel triggered ✅");

    if (!filteredProducts || filteredProducts.length === 0) {
      message.warning("No products to export");
      return;
    }

    const exportData = filteredProducts.map((item, index) => ({
      SNo: index + 1,
      Title: item.title || "-",
      Description: item.description || "-",
      Status: item.status || "-",
      CreatedAt: dayjs(item.createdAt).format("DD/MM/YYYY") || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "FeaturedProducts");

    XLSX.writeFile(workbook, "Featured_Products_List.xlsx");
  };

  const handleView = (product) => {
    setProductToView(product);
    setIsOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await deleteFeaturedSection(id);
      const updatedProducts = products.filter((product) => product._id !== id);
      setProducts(updatedProducts);
      message.success("Featured section deleted successfully");
    } catch (error) {
      console.error("Error deleting featured product:", error);
      message.error("Failed to delete featured section");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = (product) => {
    navigate(`/featuredproducts/assign/${product._id}`, { state: { product } });
  };

  const handleAddProductClick = () => {
    navigate("/featuredproducts/add");
  };

  const handleStatusToggle = async (checked, product) => {
    const newStatus = checked ? "active" : "inactive";
    try {
      await updatefeaturedStatus(product._id, newStatus);
      const updatedProducts = products.map((p) =>
        p._id === product._id ? { ...p, status: newStatus } : p
      );
      setProducts(updatedProducts);
      message.success(`Featured status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating featured status:", error);
      message.error("Failed to update featured status");
    }
  };

  const columns = [
    {
      name: "S.No",
      cell: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
      sortable: true,
      width: "10%",
      center: true,
    },
    {
      name: "Title",
      selector: (row) => row.title || "-",
      sortable: true,
      width: "20%",
      center: true,
    },
    {
      name: "SHORT DESCRIPTION",
      selector: (row) => row.description || "-",
      sortable: true,
      width: "25%",
      wrap: true,
      center: true,
    },
    {
      name: "DATE",
      cell: (row) => dayjs(row.createdAt).format("DD/MM/YYYY") || "-",
      sortable: true,
      width: "15%",
      center: true,
      selector: (row) => dayjs(row.createdAt).valueOf(),
    },
    {
      name: "Status",
      cell: (row) => (
        <Switch
          checked={row.status === "active"}
          onChange={(checked) => handleStatusToggle(checked, row)}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
        />
      ),
      width: "10%",
      center: true,
    },
    {
      name: "ACTIONS",
      cell: (row) => (
        <ActionsMenu
          item={row}
          onView={() => handleView(row)}
          onDelete={() => handleDelete(row._id)}
          onAssign={() => handleAssign(row)}
          editPath={`/featuredproducts/${row._id}`}
          assignPath={`/featuredproducts/featuredDetails/${row._id}`}
        />
      ),
      width: "20%",
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

  const modalFields = [
    { key: "title", label: "Title" },
    { key: "description", label: "Description" },
    { key: "createdAt", label: "Date", type: "date" },
    { key: "status", label: "Status", type: "status" },
  ];

  return (
    <div className="p-4 w-full bg-gray-100">
      <div className="bg-white min-h-[calc(100vh-100px)] p-6 shadow-md rounded-md">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-4 md:space-y-0 px-8">
          <h2 className="text-xl font-semibold text-gray-800 w-full text-center md:text-left">
            Featured Section
          </h2>
          <div className="flex flex-col gap-3 justify-end md:gap-4 w-full">
            <div className="flex flex-col md:flex-row gap-3 w-full justify-end">
              <div className="w-full md:w-48">
                <Input
                  placeholder="Search by title"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

            </div>
          </div>
        </div>

        <div className="mb-5 px-8">
          <div className="flex">
            <div
              className={`cursor-pointer px-4 py-2 font-medium ${activeTab === "active"
                  ? "text-secondary border-b-2 border-secondary"
                  : "text-gray-500 hover:text-gray-700"
                }`}
              onClick={() => setActiveTab("active")}
            >
              Active
            </div>
            <div
              className={`cursor-pointer px-4 py-2 font-medium ${activeTab === "inactive"
                  ? "text-secondary border-b-2 border-secondary"
                  : "text-gray-500 hover:text-gray-700"
                }`}
              onClick={() => setActiveTab("inactive")}
            >
              Inactive
            </div>
            <div className="flex gap-3 ms-auto">
              {/* Add Offer Button */}
              <button
                onClick={handleAddProductClick}
                className="flex items-center cursor-pointer justify-center w-10 h-10 rounded-full bg-white border border-gray-300 hover:bg-green-100 hover:border-green-500 transition-all duration-300 shadow-sm"
                title="Add Offer"
              >
                <FaPlus className="text-secondary hover:text-green-600 w-4 h-4" />
              </button>

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
        <div className="w-full overflow-x-auto rounded px-8">
          <DataTable
            columns={columns}
            data={filteredProducts}
            pagination
            paginationPerPage={rowsPerPage}
            paginationDefaultPage={currentPage}
            onChangePage={(page) => setCurrentPage(page)}
            onChangeRowsPerPage={(newPerPage, page) => {
              setRowsPerPage(newPerPage);
              setCurrentPage(page);
            }}
            customStyles={customStyles}
            highlightOnHover
            responsive
            progressPending={loading}
            noDataComponent="No featured products found"
            dense
          />
        </div>

        <ReusableModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Product Details"
          data={productToView}
          fields={modalFields}
          imageConfig={{
            show: true,
            path: "image",
            alt: "title",
          }}
        />
      </div>
    </div>
  );
};

export default Featuredproductsview;