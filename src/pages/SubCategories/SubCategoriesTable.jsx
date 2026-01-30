// import React, { useState, useEffect } from "react";
// import { FaEye, FaEdit, FaTrashAlt, FaDownload } from "react-icons/fa";
// import DataTable from "react-data-table-component";
// import { Modal, Button, Switch, message } from "antd";
// import { useNavigate } from "react-router-dom";
// import {
//   getSubCategory,
//   getSubCategoryById,
//   updateSubCategory,
//   deleteSubCategory,
// } from "../../services/Subcategory";

// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";
// import { getCategory } from "../../services/Categories";

// const SubCategories = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [filterStatus, setFilterStatus] = useState("active");
//   const [subCategoryToView, setSubCategoryToView] = useState(null);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [selectedMonth, setSelectedMonth] = useState("This Month");
//   const [activeTab, setActiveTab] = useState("active");
//   const [loading, setLoading] = useState(false);
//   const [categories, setCategories] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState("all");
//   const navigate = useNavigate();
//   const [subCategories, setSubCategories] = useState([]);
//   const [filteredSubCategories, setFilteredSubCategories] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");

//   useEffect(() => {
//     fetchCategories();
//     fetchSubCategories();
//   }, []);

//   const fetchCategories = async () => {
//     try {
//       setLoading(true);
//       const response = await getCategory();
//       const categoriesData = response.success && Array.isArray(response.data)
//         ? response.data
//         : Array.isArray(response)
//         ? response
//         : [];
//       setCategories(categoriesData);
//     } catch (error) {
//       message.error("Failed to fetch categories");
//       console.error("Error fetching categories:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleExcelDownload = () => {
//     const dataToExport = filteredSubCategories.map((item, index) => ({
//       "S.No": index + 1,
//       "SubCategory Name": item.subCategoryTitle,
//       "Parent Category": item.categoryTitle,
//       "Status": item.status,
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(dataToExport);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "SubCategories");

//     const excelBuffer = XLSX.write(workbook, {
//       bookType: "xlsx",
//       type: "array",
//     });

//     const fileData = new Blob([excelBuffer], {
//       type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//     });

//     saveAs(fileData, "SubCategories_List.xlsx");
//   };

//   const fetchSubCategories = async () => {
//     try {
//       setLoading(true);
//       const response = await getSubCategory();
//       const subCategoriesData = response.success && Array.isArray(response.subCategories)
//         ? response.subCategories
//         : Array.isArray(response)
//         ? response
//         : [];

//       const subCategoriesWithStatus = subCategoriesData.map(subCategory => ({
//         ...subCategory,
//         status: subCategory.status || "active"
//       }));

//       setSubCategories(subCategoriesWithStatus);
//       filterSubCategories("active", subCategoriesWithStatus);
//     } catch (error) {
//       message.error("Failed to fetch subcategories");
//       console.error("Error fetching subcategories:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filterSubCategories = (status, data = subCategories, keyword = searchTerm) => {
//     setFilterStatus(status);
//     setActiveTab(status);

//     let filtered = data.filter(
//       (subCategory) =>
//         subCategory.status === status &&
//         (!keyword || subCategory.subCategoryTitle.toLowerCase().includes(keyword.toLowerCase()))
//     );

//     if (selectedCategory !== "all") {
//       filtered = filtered.filter(
//         (subCategory) => subCategory.categoryTitle === selectedCategory
//       );
//     }

//     setFilteredSubCategories(filtered);
//   };
//   useEffect(() => {
//     filterSubCategories(filterStatus, subCategories, searchTerm);
//   }, [searchTerm]);

//   const handleCategoryFilterChange = (categoryTitle) => {
//     setSelectedCategory(categoryTitle);

//     let filtered = subCategories.filter(
//       (subCategory) => subCategory.status === filterStatus
//     );

//     if (categoryTitle !== "all") {
//       filtered = filtered.filter(
//         (subCategory) => subCategory.categoryTitle === categoryTitle
//       );
//     }

//     setFilteredSubCategories(filtered);
//   };

//   const handleEditClick = async (subCategory) => {
//     try {
//       const response = await getSubCategoryById(subCategory._id);
//       navigate(`/subcategories/edit/${subCategory._id}`, {
//         state: { subCategory: response.data?.[0] || response }
//       });
//     } catch (error) {
//       message.error("Failed to fetch subcategory details");
//       console.error("Error fetching subcategory details:", error);
//     }
//   };

//   const handleAddSubCategoryClick = () => {
//     navigate("/subcategories/add");
//   };

//   const toggleModal = async (subCategory) => {
//     try {
//       const response = await getSubCategoryById(subCategory._id);
//       setSubCategoryToView(response.data?.[0] || response);
//       setIsOpen(true);
//     } catch (error) {
//       message.error("Failed to fetch subcategory details");
//       console.error("Error fetching subcategory details:", error);
//     }
//   };

//   const handleDeleteClick = (subCategory) => {
//     setSubCategoryToView(subCategory);
//     setShowDeleteModal(true);
//   };

//   const handleToggleChange = async (checked, row) => {
//     const newStatus = checked ? "active" : "inactive";
//     try {
//       await updateSubCategory(row._id, { status: newStatus });
//       const updatedSubCategories = subCategories.map((subCategory) =>
//         subCategory._id === row._id ? { ...subCategory, status: newStatus } : subCategory
//       );
//       setSubCategories(updatedSubCategories);
//       filterSubCategories(filterStatus, updatedSubCategories);
//       message.success("Subcategory status updated successfully");
//     } catch (error) {
//       message.error("Failed to update subcategory status");
//       console.error("Error updating subcategory status:", error);
//     }
//   };

//   const handleDeleteConfirm = async () => {
//     if (!subCategoryToView?._id) {
//       message.error("No subcategory selected for deletion");
//       setShowDeleteModal(false);
//       return;
//     }

//     try {
//       setLoading(true);
//       await deleteSubCategory(subCategoryToView._id);
//       const updatedSubCategories = subCategories.filter(
//         (subCategory) => subCategory._id !== subCategoryToView._id
//       );
//       setSubCategories(updatedSubCategories);
//       filterSubCategories(filterStatus, updatedSubCategories);
//       message.success("Subcategory deleted successfully");
//     } catch (error) {
//       message.error(error.response?.data?.message || "Failed to delete subcategory");
//       console.error("Error deleting subcategory:", error);
//     } finally {
//       setLoading(false);
//       setShowDeleteModal(false);
//       setSubCategoryToView(null);
//     }
//   };

//   const columns = [
//     {
//       name: "S.No",
//       cell: (row, index) => index + 1,
//       width: "80px",
//       sortable: false,
//       style: { paddingLeft: "20px" }
//     },
//     {
//       name: "SubCategory Name",
//       selector: row => row.subCategoryTitle,
//       sortable: true,
//       cell: (row) => (
//         <div className="flex items-center space-x-4">
//           {row.subCategoryImage && (
//             <img
//               src={Array.isArray(row.subCategoryImage) ? row.subCategoryImage[0] : row.subCategoryImage}
//               alt={row.subCategoryTitle}
//               className="w-10 h-10 object-cover rounded-md"
//               onError={(e) => {
//                 e.target.src = "https://via.placeholder.com/40";
//               }}
//             />
//           )}
//           <p className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">
//             {row.subCategoryTitle}
//           </p>
//         </div>
//       ),
//       grow: 2,
//       minWidth: "200px"
//     },
//     {
//       name: "Parent Category",
//       selector: row => row.categoryTitle,
//       sortable: true,
//       cell: (row) => (
//         <span className="font-medium">
//           {row.categoryTitle || "N/A"}
//         </span>
//       ),
//       width: "150px"
//     },
//     {
//       name: "Status",
//       cell: (row) => (
//         <Switch
//           checked={row.status === "active"}
//           onChange={(checked) => handleToggleChange(checked, row)}
//           checkedChildren="Active"
//           unCheckedChildren="Inactive"
//         />
//       ),
//       width: "150px",
//       center: true
//     },
//     {
//       name: "Actions",
//       cell: (row) => (
//         <div className="flex space-x-2 justify-end">
//           <button
//             onClick={() => toggleModal(row)}
//             className="bg-gray-100 text-gray-800 p-2 rounded cursor-pointer hover:bg-gray-200"
//             title="View"
//           >
//             <FaEye />
//           </button>
//           <button
//             onClick={() => handleEditClick(row)}
//             className="bg-orange-100 text-orange-600 p-2 rounded hover:bg-orange-200 cursor-pointer"
//             title="Edit"
//           >
//             <FaEdit />
//           </button>
//           <button
//             onClick={() => handleDeleteClick(row)}
//             className="bg-red-100 text-red-600 p-2 rounded hover:bg-red-200"
//             title="Delete"
//           >
//             <FaTrashAlt />
//           </button>
//         </div>
//       ),
//       width: "180px",
//       right: true
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
//         padding: "12px 16px",
//       },
//     },
//     table: {
//       style: {
//         width: "100%",
//       }
//     },
//   };

//   return (
//     <div className="p-4 w-full bg-gray-100">
//       <div className="bg-white min-h-[calc(100vh-100px)] p-6 shadow-md rounded-md">
//         <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
//           <h2 className="text-2xl font-semibold text-gray-800">
//             All SubCategories
//           </h2>
//           <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
//           <button
//   onClick={handleExcelDownload}
//   className="text-green-600 border border-green-500 hover:bg-green-50 p-2 rounded-md flex items-center gap-2"
// >
//   <FaDownload className="text-green-600" />
//   Export Excel
// </button>

//             <button
//               onClick={handleAddSubCategoryClick}
//               className="bg-white border border-primary px-4 py-2 rounded-md hover:bg-primary hover:text-white duration-500 cursor-pointer whitespace-nowrap"
//             >
//               Add SubCategory
//             </button>
//             <div className="w-full md:w-54">
//             <select
//               className="w-full border border-gray-300 rounded-md p-2"
//               value={selectedCategory}
//               onChange={(e) => handleCategoryFilterChange(e.target.value)}
//             >
//               <option value="all">All Categories</option>
//               {categories.map((category) => (
//                 <option key={category._id} value={category.categoryTitle}>
//                   {category.categoryTitle}
//                 </option>
//               ))}
//             </select>
//           </div>

//             <input
//             type="text"
//             placeholder="Search SubCategory"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="border border-gray-300 p-2 rounded-md w-full md:w-72"
//             />

//           </div>
//         </div>

//         <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//   <div className="flex">
//     <div
//       className={`cursor-pointer px-4 py-2 text-lg font-medium ${
//         activeTab === "active"
//           ? "text-primary border-b-2 border-primary"
//           : "text-gray-500 hover:text-gray-700"
//       }`}
//       onClick={() => filterSubCategories("active")}
//     >
//       Active
//     </div>
//     <div
//       className={`cursor-pointer px-4 py-2 text-lg font-medium ${
//         activeTab === "inactive"
//           ? "text-primary border-b-2 border-primary"
//           : "text-gray-500 hover:text-gray-700"
//       }`}
//       onClick={() => filterSubCategories("inactive")}
//     >
//       Inactive
//     </div>
//   </div>

// </div>

//         <div className="w-full overflow-x-auto rounded">
//           <DataTable
//             columns={columns}
//             data={filteredSubCategories}
//             pagination
//             fixedHeader
//             fixedHeaderScrollHeight="calc(100vh - 300px)"
//             customStyles={customStyles}
//             highlightOnHover
//             responsive
//             progressPending={loading}
//             noDataComponent="No subcategories found"
//             dense
//           />
//         </div>
//       </div>

//       <Modal
//         title="SubCategory Details"
//         open={isOpen}
//         onCancel={() => setIsOpen(false)}
//         footer={[
//           <Button key="close" onClick={() => setIsOpen(false)}>
//             Close
//           </Button>,
//         ]}
//         width={600}
//       >
//         {subCategoryToView && (
//           <div className="space-y-4">
//             <div className="flex flex-col items-center mb-4">
//               <img
//                 src={subCategoryToView.subCategoryImage || "https://via.placeholder.com/208x160"}
//                 alt={subCategoryToView.subCategoryTitle}
//                 className="w-52 h-40 object-contain rounded-md border border-gray-200 p-2"
//                 onError={(e) => {
//                   e.target.src = "https://via.placeholder.com/208x160";
//                 }}
//               />
//               <h3 className="text-xl font-semibold mt-3">{subCategoryToView.subCategoryTitle}</h3>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <p className="font-medium text-gray-600">Parent Category</p>
//                 <p>{subCategoryToView.categoryTitle || "N/A"}</p>
//               </div>
//               <div>
//                 <p className="font-medium text-gray-600">Status</p>
//                 <p className="capitalize">{subCategoryToView.status || "active"}</p>
//               </div>
//               <div>
//                 <p className="font-medium text-gray-600">Description</p>
//                 <p className="text-gray-800">
//                   {subCategoryToView.subCategoryDescription || "No description available"}
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}
//       </Modal>

//       <Modal
//         title="Confirm Delete"
//         open={showDeleteModal}
//         onOk={handleDeleteConfirm}
//         onCancel={() => setShowDeleteModal(false)}
//         footer={[
//           <Button key="back" onClick={() => setShowDeleteModal(false)}>
//             Cancel
//           </Button>,
//           <Button
//             key="submit"
//             type="primary"
//             danger
//             onClick={handleDeleteConfirm}
//             loading={loading}
//           >
//             Delete
//           </Button>,
//         ]}
//       >
//         <p>Are you sure you want to delete the subcategory "{subCategoryToView?.subCategoryTitle}"?</p>
//       </Modal>
//     </div>
//   );
// };

// export default SubCategories;

import React, { useState, useEffect } from "react";
import { FaEye, FaEdit, FaTrashAlt, FaDownload, FaPlus } from "react-icons/fa";
import DataTable from "react-data-table-component";
import { Modal, Button, Switch, message, Tooltip } from "antd";
import { useNavigate } from "react-router-dom";
import {
  getSubCategory,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory,
} from "../../services/Subcategory";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { getCategory } from "../../services/Categories";

const SubCategories = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [subCategoryToView, setSubCategoryToView] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("This Month");
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const navigate = useNavigate();
  const [subCategories, setSubCategories] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getCategory();
      const categoriesData =
        response.success && Array.isArray(response.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : [];
      setCategories(categoriesData);
    } catch (error) {
      message.error("Failed to fetch categories");
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExcelDownload = () => {
    const dataToExport = filteredSubCategories.map((item, index) => ({
      "S.No": (currentPage - 1) * rowsPerPage + index + 1,
      "SubCategory Name": item.subCategoryTitle,
      "Parent Category": item.categoryTitle,
      Status: item.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SubCategories");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(fileData, "SubCategories_List.xlsx");
  };

  const fetchSubCategories = async () => {
    try {
      setLoading(true);
      const response = await getSubCategory();
      const subCategoriesData =
        response.success && Array.isArray(response.subCategories)
          ? response.subCategories
          : Array.isArray(response)
          ? response
          : [];

      const subCategoriesWithStatus = subCategoriesData.map((subCategory) => ({
        ...subCategory,
        status: subCategory.status || "active",
      }));

      setSubCategories(subCategoriesWithStatus);
      filterSubCategories("all", subCategoriesWithStatus);
    } catch (error) {
      message.error("Failed to fetch subcategories");
      console.error("Error fetching subcategories:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterSubCategories = (
    status,
    data = subCategories,
    keyword = searchTerm
  ) => {
    setFilterStatus(status);
    setActiveTab(status);

    let filtered = data;

    if (status !== "all") {
      filtered = filtered.filter(
        (subCategory) => subCategory.status === status
      );
    }

    if (keyword) {
      filtered = filtered.filter((subCategory) =>
        subCategory.subCategoryTitle
          .toLowerCase()
          .includes(keyword.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (subCategory) => subCategory.categoryTitle === selectedCategory
      );
    }

    setFilteredSubCategories(filtered);
  };

  useEffect(() => {
    filterSubCategories(filterStatus, subCategories, searchTerm);
  }, [searchTerm, subCategories]);

  const handleCategoryFilterChange = (categoryTitle) => {
    setSelectedCategory(categoryTitle);

    let filtered = subCategories;

    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (subCategory) => subCategory.status === filterStatus
      );
    }

    if (categoryTitle !== "all") {
      filtered = filtered.filter(
        (subCategory) => subCategory.categoryTitle === categoryTitle
      );
    }

    if (searchTerm) {
      filtered = filtered.filter((subCategory) =>
        subCategory.subCategoryTitle
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSubCategories(filtered);
  };

  const handleEditClick = async (subCategory) => {
    try {
      navigate(`/subcategories/edit/${subCategory._id}`, {
        state: { subCategory: subCategory },
      });
    } catch (error) {
      message.error("Failed to fetch subcategory details");
      console.error("Error fetching subcategory details:", error);
    }
  };

  const handleAddSubCategoryClick = () => {
    navigate("/subcategories/add");
  };

  const toggleModal = async (subCategory) => {
    try {
      const response = await getSubCategoryById(subCategory._id);
      setSubCategoryToView(response.data?.[0] || response);
      setIsOpen(true);
    } catch (error) {
      message.error("Failed to fetch subcategory details");
      console.error("Error fetching subcategory details:", error);
    }
  };

  const handleDeleteClick = (subCategory) => {
    setSubCategoryToView(subCategory);
    setShowDeleteModal(true);
  };

  const handleToggleChange = async (checked, row) => {
    const newStatus = checked ? "active" : "inactive";
    try {
      await updateSubCategory(row._id, { status: newStatus });
      const updatedSubCategories = subCategories.map((subCategory) =>
        subCategory._id === row._id
          ? { ...subCategory, status: newStatus }
          : subCategory
      );
      setSubCategories(updatedSubCategories);
      filterSubCategories(filterStatus, updatedSubCategories);
      message.success("Subcategory status updated successfully");
    } catch (error) {
      message.error("Failed to update subcategory status");
      console.error("Error updating subcategory status:", error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!subCategoryToView?._id) {
      message.error("No subcategory selected for deletion");
      setShowDeleteModal(false);
      return;
    }

    try {
      setLoading(true);
      await deleteSubCategory(subCategoryToView._id);
      const updatedSubCategories = subCategories.filter(
        (subCategory) => subCategory._id !== subCategoryToView._id
      );
      setSubCategories(updatedSubCategories);
      filterSubCategories(filterStatus, updatedSubCategories);
      message.success("Subcategory deleted successfully");
    } catch (error) {
      message.error(
        error.response?.data?.message || "Failed to delete subcategory"
      );
      console.error("Error deleting subcategory:", error);
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setSubCategoryToView(null);
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

  // const columns = [
  //   {
  //     name: "S.No",
  //     cell: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
  //     width: "10%",
  //     sortable: false,
  //   },
  //   {
  //     name: "Image",
  //     cell: (row) => (
  //       <div className="flex items-center justify-center">
  //         {row.subCategoryImage ? (
  //           <img
  //             src={
  //               Array.isArray(row.subCategoryImage)
  //                 ? row.subCategoryImage[0]
  //                 : row.subCategoryImage
  //             }
  //             alt={row.subCategoryTitle || "SubCategory"}
  //             className="w-6 h-6 object-cover rounded-md"
  //             onError={(e) => {
  //               e.target.onerror = null;
  //               e.target.src = "https://via.placeholder.com/24";
  //             }}
  //           />
  //         ) : (
  //           <div className="w-6 h-6 bg-gray-100 flex items-center justify-center rounded-md">
  //             -
  //           </div>
  //         )}
  //       </div>
  //     ),
  //     width: "15%",
  //   },
  //   {
  //     name: "SubCategory Name",
  //     selector: row => row.subCategoryTitle || "-",
  //     sortable: true,
  //     width: "25%",
  //   },
  //   {
  //     name: "Parent Category",
  //     selector: row => row.categoryTitle || "-",
  //     sortable: true,
  //     width: "25%",
  //   },
  //   {
  //     name: "Status",
  //     cell: (row) => (
  //       <div className="flex justify-center">
  //         <Switch
  //           checked={row.status === "active"}
  //           onChange={(checked) => handleToggleChange(checked, row)}
  //           checkedChildren="Active"
  //           unCheckedChildren="Inactive"
  //           aria-label={`Toggle status for ${row.subCategoryTitle || "subcategory"}`}
  //           size="small"
  //         />
  //       </div>
  //     ),
  //     width: "15%",
  //   },
  //   {
  //     name: "Actions",
  //     cell: (row) => (
  //       <div className="flex justify-center space-x-1">
  //         <Tooltip title="View">
  //           <button
  //             onClick={() => toggleModal(row)}
  //             className="bg-gray-100 text-gray-800 p-1 rounded cursor-pointer hover:bg-gray-200"
  //             aria-label={`View details for ${row.subCategoryTitle || "subcategory"}`}
  //           >
  //             <FaEye size={14} />
  //           </button>
  //         </Tooltip>
  //         <Tooltip title="Edit">
  //           <button
  //             onClick={() => handleEditClick(row)}
  //             className="bg-orange-100 text-orange-600 p-1 rounded hover:bg-orange-200 cursor-pointer"
  //             aria-label={`Edit ${row.subCategoryTitle || "subcategory"}`}
  //           >
  //             <FaEdit size={14} />
  //           </button>
  //         </Tooltip>
  //         <Tooltip title="Delete">
  //           <button
  //             onClick={() => handleDeleteClick(row)}
  //             className="bg-red-100 text-red-600 p-1 rounded hover:bg-red-200 cursor-pointer"
  //             aria-label={`Delete ${row.subCategoryTitle || "subcategory"}`}
  //           >
  //             <FaTrashAlt size={14} />
  //           </button>
  //         </Tooltip>
  //       </div>
  //     ),
  //     width: "10%",
  //   },
  // ];

  const columns = [
    {
      name: "S.No",
      cell: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
      width: "12%",
      sortable: false,
      center: true,
    },
    {
      name: "SubCategory Name",
      selector: (row) => row.subCategoryTitle || "-",
      sortable: true,
      width: "38%",
      center: true,
    },
    {
      name: "Parent Category",
      selector: (row) => row.categoryTitle || "-",
      sortable: true,
      width: "30%",
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
          size="small"
        />
      ),
      width: "10%",
      center: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex justify-center space-x-1">
          <Tooltip title="View">
            <button
              onClick={() => toggleModal(row)}
              className="bg-gray-100 text-gray-800 p-1 rounded hover:bg-gray-200"
            >
              <FaEye size={14} />
            </button>
          </Tooltip>
          <Tooltip title="Edit">
            <button
              onClick={() => handleEditClick(row)}
              className="bg-orange-100 text-orange-600 p-1 rounded hover:bg-orange-200"
            >
              <FaEdit size={14} />
            </button>
          </Tooltip>
          <Tooltip title="Delete">
            <button
              onClick={() => handleDeleteClick(row)}
              className="bg-red-100 text-red-600 p-1 rounded hover:bg-red-200"
            >
              <FaTrashAlt size={14} />
            </button>
          </Tooltip>
        </div>
      ),
      width: "10%",
      center: true,
    },
  ];

  return (
    <div className="p-4 w-full bg-gray-100">
      <div className="bg-white min-h-[calc(100vh-100px)] p-6 shadow-md rounded-md">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 px-8">
          <h2 className="text-2xl font-semibold text-gray-800">
            SubCategories
          </h2>

          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search SubCategory"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 p-2 rounded-md w-full md:w-48"
            />

            <select
              className="border border-gray-300 rounded-md p-2 cursor-pointer w-full md:w-48"
              value={selectedCategory}
              onChange={(e) => handleCategoryFilterChange(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category.categoryTitle}>
                  {category.categoryTitle}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6 px-8">
          <div className="flex">
            <button
              className={`px-4 py-2 font-medium  cursor-pointer ${
                activeTab === "all"
                  ? "text-secondary border-b-2 border-secondary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => filterSubCategories("all")}
            >
              All
            </button>
            <button
              className={`px-4 py-2 font-medium cursor-pointer ${
                activeTab === "active"
                  ? "text-secondary border-b-2 border-secondary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => filterSubCategories("active")}
            >
              Active
            </button>
            <button
              className={`px-4 py-2 font-medium cursor-pointer ${
                activeTab === "inactive"
                  ? "text-secondary border-b-2 border-secondary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => filterSubCategories("inactive")}
            >
              Inactive
            </button>
            <div className="flex gap-3 ms-auto">
              {/* Add Offer Button */}
              <button
                onClick={handleAddSubCategoryClick}
                className="flex items-center cursor-pointer justify-center w-10 h-10 rounded-full bg-white border border-gray-300 hover:bg-green-100 hover:border-green-500 transition-all duration-300 shadow-sm"
                title="Add Offer"
              >
                <FaPlus className="text-secondary hover:text-green-600 w-4 h-4" />
              </button>

              {/* Export to Excel Button */}
              <button
                onClick={handleExcelDownload}
                className="flex items-center justify-center cursor-pointer w-10 h-10 rounded-full bg-white border border-gray-300 hover:bg-green-100 hover:border-green-500 transition-all duration-300 shadow-sm"
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
            data={filteredSubCategories}
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
            noDataComponent={
              <div className="p-4 text-center">No subcategories found</div>
            }
          />
        </div>
      </div>

      <Modal
        title="SubCategory Details"
        open={isOpen}
        onCancel={() => setIsOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsOpen(false)}>
            Close
          </Button>,
        ]}
        width={600}
      >
        {subCategoryToView && (
          <div className="space-y-4">
            <div className="flex flex-col items-center mb-4">
              <img
                src={
                  subCategoryToView.subCategoryImage ||
                  "https://via.placeholder.com/208x160"
                }
                alt={subCategoryToView.subCategoryTitle}
                className="w-52 h-40 object-contain rounded-md border border-gray-200 p-2"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/208x160";
                }}
              />
              <h3 className="text-xl font-semibold mt-3">
                {subCategoryToView.subCategoryTitle}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-gray-600">Parent Category</p>
                <p>{subCategoryToView.categoryTitle || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Status</p>
                <p className="capitalize">
                  {subCategoryToView.status || "active"}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Description</p>
                <p className="text-gray-800">
                  {subCategoryToView.subCategoryDescription ||
                    "No description available"}
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
        <p>
          Are you sure you want to delete the subcategory "
          {subCategoryToView?.subCategoryTitle}"?
        </p>
      </Modal>
    </div>
  );
};

export default SubCategories;
