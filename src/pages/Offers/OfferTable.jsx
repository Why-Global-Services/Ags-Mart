// // import React, { useState } from "react";
// // import { FaStar, FaPlusCircle, FaEdit, FaTrashAlt, FaEye } from "react-icons/fa";
// // import DataTable from "react-data-table-component";
// // import { Modal, Button } from "antd";
// // import { Link } from "react-router-dom";
// // import dayjs from "dayjs";

// // export default function Offers() {
// //   const [products] = useState([
// //     {
// //       _id: "1",
// //       title: "Summer Sale",
// //       offerbanner: "https://via.placeholder.com/150",
// //       terms: "Valid until stock lasts",
// //       discount: "20%",
// //       expiryTime: "2023-12-31"
// //     },
// //     {
// //       _id: "2",
// //       title: "Winter Special",
// //       offerbanner: "https://via.placeholder.com/150",
// //       terms: "Minimum purchase required",
// //       discount: "15%",
// //       expiryTime: "2023-12-15"
// //     }
// //   ]);

// //   const [selectedMonth, setSelectedMonth] = useState("This Month");
// //   const [selectedOffer, setSelectedOffer] = useState(null);
// //   const [isModalOpen, setIsModalOpen] = useState(false);

// //   const toggleModal = (offer) => {
// //     setSelectedOffer(offer);
// //     setIsModalOpen(true);
// //   };

// //   const closeModal = () => {
// //     setIsModalOpen(false);
// //   };

// //   const columns = [
// //     { name: "S.No", cell: (row, index) => index + 1, width: "7%" },
// //     {
// //       name: "Offers",
// //       width: "20%",
// //       cell: (row) => (
// //         <div className="flex items-center space-x-4">
// //           <img
// //             src={row.offerbanner}
// //             alt={row.title}
// //             className="w-8 h-8 object-cover rounded-md"
// //           />
// //           <p>{row.title}</p>
// //         </div>
// //       ),
// //     },
// //     {
// //       name: "Terms & Condition",
// //       selector: (row) => row.terms,
// //       sortable: true,
// //       width: "20%",
// //     },
// //     { name: "Discount", selector: (row) => row.discount, width: "10%" },
// //     {
// //       name: "Expired",
// //       selector: (row) => dayjs(row.expiryTime).format("DD/MM/YYYY"),
// //     },
// //     {
// //       name: "Actions",
// //       cell: (row) => (
// //         <div className="flex space-x-2">
// //           <div
// //             onClick={() => toggleModal(row)}
// //             className="bg-gray-100 text-gray-800 p-2 rounded cursor-pointer hover:bg-gray-200"
// //           >
// //             <FaEye />
// //           </div>
// //           <Link
// //             to={`/offer/offerDetails/${row._id}`}
// //             className="relative group bg-gray-100 text-gray-800 p-2 rounded cursor-pointer hover:bg-gray-200 flex items-center"
// //           >
// //             <FaPlusCircle />
// //             <div className="absolute -top-full left-1/2 transform -translate-x-1/2 mt-1 whitespace-nowrap bg-black text-white text-xs px-3 py-1 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
// //               Assign
// //             </div>
// //           </Link>

// //           <Link
// //             to={`/offer/${row._id}`}
// //             className="bg-orange-100 text-orange-600 p-2 rounded hover:bg-orange-200"
// //           >
// //             <FaEdit />
// //           </Link>
// //           <button
// //             onClick={() => console.log("Delete", row._id)}
// //             className="bg-red-100 text-red-600 p-2 rounded hover:bg-red-200 cursor-pointer"
// //           >
// //             <FaTrashAlt />
// //           </button>
// //         </div>
// //       ),
// //     },
// //   ];

// //   const NoDataComponent = () => (
// //     <div className="text-center py-4">
// //       <p className="text-gray-600">There are no records to display.</p>
// //     </div>
// //   );

// //   return (
// //     <div className="p-4 w-full bg-gray-100">
// //       <div className="bg-white min-h-[calc(100vh-100px)] p-4 shadow-md rounded-md">
// //         <div className="flex sm:flex-row flex-col justify-between items-center">
// //           <h2 className="text-xl font-semibold text-gray-800 w-full text-left">
// //             All Offer List
// //           </h2>
// //           <div className="flex flex-col sm:flex-row w-full sm:mt-0 mt-3 sm:justify-end gap-2">
// //             <Link
// //               to={"/offer/create"}
// //               className="bg-white border border-primaryColor px-4 py-2 rounded-md hover:bg-primary hover:text-white duration-500 text-center sm:w-auto w-full"
// //             >
// //               Add offers
// //             </Link>
// //             <select
// //               className="border border-primaryColor rounded-md p-2 focus:outline-none sm:w-auto w-full"
// //               value={selectedMonth}
// //               onChange={(e) => setSelectedMonth(e.target.value)}
// //             >
// //               <option value="This Month">This Month</option>
// //               <option value="Last Month">Last Month</option>
// //             </select>
// //           </div>
// //         </div>
// //         <DataTable
// //           className="mt-10"
// //           customStyles={{
// //             headCells: {
// //               style: {
// //                 backgroundColor: "#FF8096",
// //                 color: "#fff",
// //                 fontWeight: "bold",
// //               },
// //             },
// //           }}
// //           columns={columns}
// //           data={products}
// //           pagination
// //           highlightOnHover
// //           responsive
// //           noDataComponent={<NoDataComponent />}
// //         />

// //         <Modal
// //           title="Offer Details"
// //           open={isModalOpen}
// //           onCancel={closeModal}
// //           footer={null}
// //           width={600}
// //         >
// //           {selectedOffer && (
// //             <div className="p-4">
// //               <div className="flex justify-center mb-4">
// //                 <img
// //                   src={selectedOffer.offerbanner}
// //                   alt={selectedOffer.title}
// //                   className="w-32 h-32 object-cover rounded-md"
// //                 />
// //               </div>
// //               <div className="grid grid-cols-2 gap-4">
// //                 <p className="font-semibold">Offer:</p>
// //                 <p>{selectedOffer.title}</p>

// //                 <p className="font-semibold">Terms & Conditions:</p>
// //                 <p>{selectedOffer.terms}</p>

// //                 <p className="font-semibold">Discount:</p>
// //                 <p>{selectedOffer.discount}</p>

// //                 <p className="font-semibold">Expiry Date:</p>
// //                 <p>{dayjs(selectedOffer.expiryTime).format("DD/MM/YYYY")}</p>
// //               </div>
// //             </div>
// //           )}
// //         </Modal>
// //       </div>
// //     </div>
// //   );
// // }


// import React, { useState, useEffect } from "react";
// import { FaStar, FaPlusCircle, FaEdit, FaTrashAlt, FaEye } from "react-icons/fa";
// import DataTable from "react-data-table-component";
// import { Modal, Button, Spin, message } from "antd";
// import { Link } from "react-router-dom";
// import dayjs from "dayjs";
// import axios from "axios";
// import { deleteOffer, getOffer } from "../../services/Offer";

// export default function Offers() {
//   const [offers, setOffers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedMonth, setSelectedMonth] = useState("This Month");
//   const [selectedOffer, setSelectedOffer] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   useEffect(() => {
//     fetchOffers();
//   }, []);

//   const fetchOffers = async () => {
//     try {
//       setLoading(true);
//       const response = await getOffer();
//       setOffers(response.data || []);
//       if (response.success) {
//         setOffers(response.data || []);
//         console.log(offers,'offers');

//       } else {
//         message.error(response.data.message || "Failed to fetch offers");
//       }
//     } catch (error) {
//       console.error("Error fetching offers:", error);
//       message.error("Failed to fetch offers");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleModal = (offer) => {
//     setSelectedOffer(offer);
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//   };

//   const handleDelete = async (id) => {
//     try {
//       const response = await deleteOffer(id);
//       if (response.success) {
//         message.success("Offer deleted successfully");
//         fetchOffers(); // Refresh the list
//       } else {
//         message.error(response.data.message || "Failed to delete offer");
//       }
//     } catch (error) {
//       console.error("Error deleting offer:", error);
//       message.error("Failed to delete offer");
//     }
//   };

//   const columns = [
//     { name: "S.No", cell: (row, index) => index + 1, width: "7%" },
//     {
//       name: "Offers Name",
//       width: "20%",
//       cell: (row) => (
//         <div className="flex items-center space-x-4">
//           <img
//             src={row.offerImage}
//             alt={row.offerTitle}
//             className="w-8 h-8 object-cover rounded-md"
//           />
//           <p>{row.offerTitle}</p>
//         </div>
//       ),
//     },
//     {
//       name: "Offer Terms",
//       selector: (row) => row.offerTerms,
//       sortable: true,
//       width: "20%",
//     },
//     { 
//       name: "Discount", 
//       selector: (row) => `${row.discountPercentage}%`, 
//       width: "10%" 
//     },
//     {
//       name: "Status",
//       selector: (row) => row.status,
//       cell: (row) => (
//         <span className={`px-2 py-1 rounded-full text-xs ${
//           row.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//         }`}>
//           {row.status}
//         </span>
//       ),
//       width: "10%",
//     },
//     {
//       name: "Valid From",
//       selector: (row) => dayjs(row.validFrom).format("DD/MM/YYYY"),
//     },
//     {
//       name: "Valid To",
//       selector: (row) => dayjs(row.validTo).format("DD/MM/YYYY"),
//     },
//     {
//       name: "Actions",
//       cell: (row) => (
//         <div className="flex space-x-2">
//           <div
//             onClick={() => toggleModal(row)}
//             className="bg-gray-100 text-gray-800 p-2 rounded cursor-pointer hover:bg-gray-200"
//           >
//             <FaEye />
//           </div>
//           <Link
//             to={`/offer/offerDetails/${row._id}`}
//             className="relative group bg-gray-100 text-gray-800 p-2 rounded cursor-pointer hover:bg-gray-200 flex items-center"
//           >
//             <FaPlusCircle />
//             <div className="absolute -top-full left-1/2 transform -translate-x-1/2 mt-1 whitespace-nowrap bg-black text-white text-xs px-3 py-1 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
//               Assign
//             </div>
//           </Link>

//           <Link
//             to={`/offer/${row._id}`}
//             className="bg-orange-100 text-orange-600 p-2 rounded hover:bg-orange-200"
//           >
//             <FaEdit />
//           </Link>
//           <button
//             onClick={() => handleDelete(row._id)}
//             className="bg-red-100 text-red-600 p-2 rounded hover:bg-red-200 cursor-pointer"
//           >
//             <FaTrashAlt />
//           </button>
//         </div>
//       ),
//     },
//   ];

//   const NoDataComponent = () => (
//     <div className="text-center py-4">
//       <p className="text-gray-600">There are no records to display.</p>
//     </div>
//   );

//   return (
//     <div className="p-4 w-full bg-gray-100">
//       <div className="bg-white min-h-[calc(100vh-100px)] p-4 shadow-md rounded-md">
//         <div className="flex sm:flex-row flex-col justify-between items-center">
//           <h2 className="text-xl font-semibold text-gray-800 w-full text-left">
//             All Offer List
//           </h2>
//           <div className="flex flex-col sm:flex-row w-full sm:mt-0 mt-3 sm:justify-end gap-2">
//             <Link
//               to={"/offer/create"}
//               className="bg-white border border-primaryColor px-4 py-2 rounded-md hover:bg-primary hover:text-white duration-500 text-center sm:w-auto w-full"
//             >
//               Add offers
//             </Link>
//             <select
//               className="border border-primaryColor rounded-md p-2 focus:outline-none sm:w-auto w-full"
//               value={selectedMonth}
//               onChange={(e) => setSelectedMonth(e.target.value)}
//             >
//               <option value="This Month">This Month</option>
//               <option value="Last Month">Last Month</option>
//             </select>
//           </div>
//         </div>

//         {loading ? (
//           <div className="flex justify-center items-center h-64">
//             <Spin size="large" />
//           </div>
//         ) : (
//           <DataTable
//             className="mt-10"
//             customStyles={{
//               headCells: {
//                 style: {
//                   backgroundColor: "#FF8096",
//                   color: "#fff",
//                   fontWeight: "bold",
//                 },
//               },
//             }}
//             columns={columns}
//             data={offers}
//             pagination
//             highlightOnHover
//             responsive
//             noDataComponent={<NoDataComponent />}
//           />
//         )}

//         <Modal
//           title="Offer Details"
//           open={isModalOpen}
//           onCancel={closeModal}
//           footer={null}
//           width={600}
//         >
//           {selectedOffer && (
//             <div className="p-4">
//               <div className="flex justify-center mb-4">
//                 <img
//                   src={selectedOffer.offerImage}
//                   alt={selectedOffer.offerTitle}
//                   className="w-32 h-32 object-cover rounded-md"
//                 />
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <p className="font-semibold">Offer Title:</p>
//                 <p>{selectedOffer.offerTitle}</p>

//                 <p className="font-semibold">Terms & Conditions:</p>
//                 <p>{selectedOffer.offerTerms}</p>

//                 <p className="font-semibold">Discount Percentage:</p>
//                 <p>{selectedOffer.discountPercentage}%</p>

//                 <p className="font-semibold">Keywords:</p>
//                 <p>{selectedOffer.keyWords}</p>

//                 <p className="font-semibold">Status:</p>
//                 <p>{selectedOffer.status}</p>

//                 <p className="font-semibold">Valid From:</p>
//                 <p>{dayjs(selectedOffer.validFrom).format("DD/MM/YYYY")}</p>

//                 <p className="font-semibold">Valid To:</p>
//                 <p>{dayjs(selectedOffer.validTo).format("DD/MM/YYYY")}</p>
//               </div>
//             </div>
//           )}
//         </Modal>
//       </div>
//     </div>
//   );
// }


// import React, { useState, useEffect } from "react";
// import { message, Switch } from "antd";
// import { Link } from "react-router-dom";
// import dayjs from "dayjs";
// import { deleteOffer, getOffer } from "../../services/Offer";
// import ReusableTable from "../../components/ReusableTable";
// import ReusableModal from "../../components/ReusableModal";
// import ActionsMenu from "../../components/ActionMenu";
//  import { toast } from "react-toastify";

// const Offers = () => {
//   const [offers, setOffers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedMonth, setSelectedMonth] = useState("This Month");
//   const [selectedOffer, setSelectedOffer] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   useEffect(() => {
//     fetchOffers();
//   }, []);

//   const fetchOffers = async () => {
//     try {
//       setLoading(true);
//       const response = await getOffer();
//       if (response.success) {
//         setOffers(response.data || []);
//       } else {
//         toast.error(response.message || "Failed to fetch offers");
//       }
//     } catch (error) {
//       console.error("Error fetching offers:", error);
//       toast.error("Failed to fetch offers");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleView = (offer) => {
//     setSelectedOffer(offer);
//     setIsModalOpen(true);
//   };

//   const handleDelete = async (id) => {
//     try {
//       const response = await deleteOffer(id);
//       if (response.success) {
//         toast.success("Offer deleted successfully");
//         fetchOffers();
//       } else {
//         toast.error(response.message || "Failed to delete offer");
//       }
//     } catch (error) {
//       console.error("Error deleting offer:", error);
//       toast.error("Failed to delete offer");
//     }
//   };


//   const handleStatusToggle = async (offerId, currentStatus) => {
//     // try {
//     //   const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
//     //   const response = await updateOfferStatus(offerId, newStatus);

//     //   if (response.success) {
//     //     toast.success(`Offer status updated to ${newStatus}`);
//     //     setOffers(offers.map(offer => 
//     //       offer._id === offerId ? { ...offer, status: newStatus } : offer
//     //     ));
//     //   } else {
//     //     toast.error(response.message || "Failed to update status");
//     //   }
//     // } catch (error) {
//     //   console.error("Error updating offer status:", error);
//     //   message.error("Failed to update status");
//     // }
//   };

//   const columns = [
//     {
//       name: "S.No",
//       cell: (row, index) => index + 1,
//       width: "70px"
//     },
//     {
//       name: "Offer Name",
//       cell: (row) => (
//         <div className="flex items-center space-x-3">
//           <img
//             src={row.offerImage}
//             alt={row.offerTitle}
//             className="w-10 h-10 rounded-full object-cover"
//           />
//           <span>{row.offerTitle}</span>
//         </div>
//       ),
//       width: "250px"
//     },
//     {
//       name: "Offer Terms",
//       selector: row => row.offerTerms,
//       wrap: true

//     },
//     {
//       name: "Discount",
//       selector: row => `${row.discountPercentage}%`,
//       width: "100px"
//     },
//     {
//       name: "Status",
//       cell: row => (
//         <Switch
//           onClick={() => handleStatusToggle(row._id, row.status)}
//           className={`px-2 py-1 rounded-full text-xs cursor-pointer transition-colors ${
//             row.status === 'active' 
//               ? 'bg-green-100 text-green-800 hover:bg-green-200' 
//               : 'bg-red-100 text-red-800 hover:bg-red-200'
//           }`}
//         >
//           {row.status}
//         </Switch>
//       ),
//       width: "100px"
//     },
//     {
//       name: "Valid From",
//       cell: row => (
//         <div>
//           <div>{dayjs(row.validFrom).format("DD/MM/YYYY")}</div>
//         </div>
//       ),
//       width: "150px"
//     },
//     {
//       name: "Valid To",
//       cell: row => (
//         <div>
//           <div>{dayjs(row.validTo).format("DD/MM/YYYY")}</div>
//         </div>
//       ),
//       width: "150px"
//     },
//     {
//       name: "Actions",
//       cell: row => (
//         <ActionsMenu
//           item={row} // This passes the complete offer data to ActionsMenu
//           onView={() => handleView(row)}
//           onDelete={() => handleDelete(row._id)}
//           editPath={`/offers/${row._id}`}
//           assignPath={`/offers/assign/${row._id}`}
//         />
//       ),
//       width: "200px"
//     }
//   ];

//   const modalFields = [
//     { key: "offerTitle", label: "Offer Title" },
//     { key: "offerTerms", label: "Terms & Conditions" },
//     { key: "discountPercentage", label: "Discount", type: "percentage" },
//     { key: "keyWords", label: "Keywords" },
//     { key: "status", label: "Status", type: "status" },
//     { key: "validFrom", label: "Valid From", type: "date" },
//     { key: "validTo", label: "Valid To", type: "date" }
//   ];

//   return (
//     <div className="p-6 bg-gray-50">
//       <div className="bg-white rounded-lg shadow-md p-6">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-semibold">Offers</h1>
//           <div className="flex gap-4">
//             <select
//               className="border rounded-md px-3 py-2"
//               value={selectedMonth}
//               onChange={(e) => setSelectedMonth(e.target.value)}
//             >
//               <option value="This Month">This Month</option>
//               <option value="Last Month">Last Month</option>
//             </select>
//             <button
//               to="/offers/create"
//               className=" text-black px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
//             >
//               Add Offer
//             </button>
//           </div>
//         </div>

//         <ReusableTable
//           columns={columns}
//           data={offers}
//           loading={loading}
//           pagination={true}
//           highlightOnHover={true}
//         />

//         <ReusableModal
//           isOpen={isModalOpen}
//           onClose={() => setIsModalOpen(false)}
//           title="Offer Details"
//           data={selectedOffer}
//           fields={modalFields}
//           imageConfig={{
//             show: true,
//             path: "offerImage",
//             alt: "offerTitle"
//           }}
//         />
//       </div>
//     </div>
//   );
// };

// export default Offers;


import React, { useState, useEffect } from "react";
import { message, Button, Switch } from "antd";
import { Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { deleteOffer, getOffer, updateOfferStatus } from "../../services/Offer";
import DataTable from "react-data-table-component";
import ReusableModal from "../../components/ReusableModal";
import ActionsMenu from "../../components/ActionMenu";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { FaDownload, FaPlus } from "react-icons/fa";

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const navigate = useNavigate();

  useEffect(() => {
    fetchOffers();
  }, []);

  useEffect(() => {
    filterOffers();
  }, [searchText, selectedMonth, offers, activeTab]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await getOffer();
      if (response.success) {
        const offersData = Array.isArray(response.data) ? response.data : [];
        const offersWithStatus = offersData.map((offer) => ({
          ...offer,
          status: offer.status || "active",
        }));
        setOffers(offersWithStatus);
      } else {
        toast.error(response.message || "Failed to fetch offers");
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
      toast.error("Failed to fetch offers");
    } finally {
      setLoading(false);
    }
  };

  const filterOffers = () => {
    let result = [...offers];

    // Apply month filter
    if (selectedMonth !== "all") {
      const currentDate = dayjs();
      let startDate, endDate;

      if (selectedMonth === "thisMonth") {
        startDate = currentDate.startOf("month");
        endDate = currentDate.endOf("month");
      } else if (selectedMonth === "lastMonth") {
        startDate = currentDate.subtract(1, "month").startOf("month");
        endDate = currentDate.subtract(1, "month").endOf("month");
      }

      result = result.filter((offer) => {
        const validFrom = dayjs(offer.validFrom);
        const validTo = dayjs(offer.validTo);
        return (
          (validFrom.isAfter(startDate) && validFrom.isBefore(endDate)) ||
          (validTo.isAfter(startDate) && validTo.isBefore(endDate)) ||
          (validFrom.isBefore(startDate) && validTo.isAfter(endDate))
        );
      });
    }

    // Apply search filter
    if (searchText.trim()) {
      const lowerSearch = searchText.toLowerCase().trim();
      result = result.filter((offer) => {
        if (
          offer.offerTitle?.toLowerCase().includes(lowerSearch) ||
          offer.offerTerms?.toLowerCase().includes(lowerSearch)
        ) {
          return true;
        }
        if (offer.keyWords && Array.isArray(offer.keyWords)) {
          return offer.keyWords.some((keyword) =>
            keyword?.toLowerCase().includes(lowerSearch)
          );
        }
        return false;
      });
    }

    // Apply status filter based on activeTab
    if (activeTab === "expired") {
      // Filter for expired offers (validTo is before current date)
      const currentDate = dayjs();
      result = result.filter((offer) => {
        const validTo = dayjs(offer.validTo);
        return validTo.isBefore(currentDate);
      });
    } else if (activeTab !== "all") {
      // Apply status filter for "active" and "inactive" tabs, skip for "all"
      result = result.filter((offer) => offer.status === activeTab);
    }

    setFilteredOffers(result);
  };

  const exportToExcel = () => {
    if (!filteredOffers || filteredOffers.length === 0) {
      toast.warn("No data to export");
      return;
    }

    const data = filteredOffers.map((offer, index) => ({
      "S.No": index + 1,
      "Offer Title": offer.offerTitle,
      "Offer Terms": offer.offerTerms,
      Discount: `${offer.discountPercentage}%`,
      Status: offer.status,
      "Valid From": dayjs(offer.validFrom).format("DD/MM/YYYY"),
      "Valid To": dayjs(offer.validTo).format("DD/MM/YYYY"),
      Keywords: offer.keyWords ? offer.keyWords.join(", ") : "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const columnWidths = [
      { wch: 8 }, // S.No
      { wch: 25 }, // Offer Title
      { wch: 30 }, // Offer Terms
      { wch: 10 }, // Discount
      { wch: 12 }, // Status
      { wch: 15 }, // Valid From
      { wch: 15 }, // Valid To
      { wch: 20 }, // Keywords
    ];
    worksheet["!cols"] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Offers");
    XLSX.writeFile(workbook, `Offers_${dayjs().format("YYYY-MM-DD")}.xlsx`);
  };

  const handleView = (offer) => {
    setSelectedOffer(offer);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await deleteOffer(id);
      if (response.success) {
        toast.success("Offer deleted successfully");
        fetchOffers();
      } else {
        toast.error(response.message || "Failed to delete offer");
      }
    } catch (error) {
      console.error("Error deleting offer:", error);
      toast.error("Failed to delete offer");
    }
  };

  const handleStatusToggle = async (checked, offer) => {
    const newStatus = checked ? "active" : "inactive";
    try {
      await updateOfferStatus(offer._id, newStatus);
      const updatedOffers = offers.map((o) =>
        o._id === offer._id ? { ...o, status: newStatus } : o
      );
      setOffers(updatedOffers);
      filterOffers();
      message.success("Offer status updated successfully");
    } catch (error) {
      console.error("Error updating offer status:", error);
      message.error("Failed to update offer status");
    }
  };

  const columns = [
    {
      name: "S.No",
      cell: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
      width: "80px",
      sortable: false,
      style: { paddingLeft: "20px" },
    },
    {
      name: "Offer Name",
      cell: (row) => (
        <div className="flex items-center space-x-4">
          <img
            src={row.offerImage}
            alt={row.offerTitle}
            className="w-10 h-10 rounded-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/40";
            }}
          />
          <p className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">
            {row.offerTitle}
          </p>
        </div>
      ),
      minWidth: "200px",
      sortable: true,
      selector: (row) => row.offerTitle,
    },
    {
      name: "Offer Terms",
      selector: (row) => row.offerTerms,
      wrap: true,
      sortable: true,
      minWidth: "200px",
    },
    {
      name: "Discount",
      selector: (row) => `${row.discountPercentage}%`,
      width: "100px",
      sortable: true,
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
      width: "150px",
      center: true,
      sortable: true,
      selector: (row) => row.status,
    },
    {
      name: "Valid From",
      cell: (row) => dayjs(row.validFrom).format("DD/MM/YYYY"),
      width: "150px",
      sortable: true,
      selector: (row) => dayjs(row.validFrom).valueOf(),
    },
    {
      name: "Valid To",
      cell: (row) => dayjs(row.validTo).format("DD/MM/YYYY"),
      width: "150px",
      sortable: true,
      selector: (row) => dayjs(row.validTo).valueOf(),
    },
    {
      name: "Actions",
      cell: (row) => (
        <ActionsMenu
          item={row}
          onView={() => handleView(row)}
          onDelete={() => handleDelete(row._id)}
          editPath={`/offers/${row._id}`}
          assignPath={`/offers/offerDetails/${row._id}`}
        />
      ),
      width: "200px",
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
    { key: "offerTitle", label: "Offer Title" },
    { key: "offerTerms", label: "Terms & Conditions" },
    { key: "discountPercentage", label: "Discount", type: "percentage" },
    { key: "keyWords", label: "Keywords" },
    { key: "status", label: "Status", type: "status" },
    { key: "validFrom", label: "Valid From", type: "date" },
    { key: "validTo", label: "Valid To", type: "date" },
  ];

  const handleAddOffer = () => {
    navigate("/offers/create");
  };

  return (
    <div className="p-4 bg-gray-50">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6 px-8">
          <h1 className="text-2xl font-semibold">Offers</h1>
          <div className="flex gap-4 items-center">
            <input
              placeholder="Search offers..."
              className="px-4 py-2 text-sm border-gray-300 border rounded-md hover:border-pink-600 focus:outline-none focus:ring-1 focus:ring-primary h-[36px] w-40"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <select
              className="w-32 py-2 border cursor-pointer border-gray-300 text-sm rounded-md px-3 focus:outline-none focus:ring-1 focus:ring-primary h-[36px]"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
            </select>
            

          </div>
        </div>

        <div className="mb-6 px-8">
          <div className="flex">
            <div
              className={`cursor-pointer px-4 py-2 font-medium ${activeTab === "all"
                  ? "text-secondary border-b-2 border-secondary"
                  : "text-gray-500 hover:text-gray-700"
                }`}
              onClick={() => setActiveTab("all")}
            >
              All
            </div>
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
            <div
              className={`cursor-pointer px-4 py-2 font-medium ${activeTab === "expired"
                  ? "text-secondary border-b-2 border-secondary"
                  : "text-gray-500 hover:text-gray-700"
                }`}
              onClick={() => setActiveTab("expired")}
            >
              Expired
            </div>
            <div className="flex gap-3 ms-auto">
              {/* Add Offer Button */}
              <button
                onClick={handleAddOffer}
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
            data={filteredOffers}
            pagination
            paginationPerPage={rowsPerPage}
            paginationDefaultPage={currentPage}
            onChangePage={(page) => setCurrentPage(page)}
            onChangeRowsPerPage={(newPerPage, page) => {
              setRowsPerPage(newPerPage);
              setCurrentPage(page);
            }}
            fixedHeader
            fixedHeaderScrollHeight="550px"
            customStyles={customStyles}
            highlightOnHover
            responsive
            progressPending={loading}
            noDataComponent="No offers found"
            dense
          />
        </div>

        <ReusableModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Offer Details"
          data={selectedOffer}
          fields={modalFields}
          imageConfig={{
            show: true,
            path: "offerImage",
            alt: "offerTitle",
          }}
        />
      </div>
    </div>
  );
};

export default Offers;