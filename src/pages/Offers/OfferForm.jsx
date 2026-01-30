// import React, { useState, useEffect } from "react";
// import { FaUpload } from "react-icons/fa";

// import { toast } from "react-toastify";
// import { useNavigate, useParams } from "react-router-dom";
// import dayjs from "dayjs";
// import customParseFormat from "dayjs/plugin/customParseFormat";
// dayjs.extend(customParseFormat);

// const OfferForm = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     offerbanner: null,
//     title: "",
//     terms: "",
//     keywords: "",
//     discount: "",
//     expiryTime: "",
//   });
//   const [uploadedImage, setUploadedImage] = useState(null);
//   const [error, setError] = useState("");
//   const [isEdit, setIsEdit] = useState(false);

//   useEffect(() => {
//     if (id) {
//       setIsEdit(true);
//       fetchOfferDetails(id);
//     }
//   }, [id]);

//   const fetchOfferDetails = async (offerId) => {
//     try {
//       const response = await getOfferById(offerId);
//       console.log( "offer detailsgfdddF", response);

//       if (response.offerDetails) {
//         setFormData((prev) => ({
//           ...prev,
//           title: response.offerDetails.title || "",
//           terms: response.offerDetails.terms || "",
//           keywords: response.offerDetails.keywords || "",
//           discount: response.offerDetails.discount || "",
//           expiryTime: response.offerDetails.expiryTime
//             ? dayjs(response.offerDetails.expiryTime).format("YYYY-MM-DD")
//             : "",
//         }));

//         if (response.offerDetails.offerbanner) {
//           setUploadedImage(response.offerDetails.offerbanner);
//         }
//       }
//     } catch (err) {
//       console.error("Error fetching offer details:", err);
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;

//     if (name === "expiryTime") {
//       setFormData((prevState) => ({
//         ...prevState,
//         expiryTime: value, // Store in YYYY-MM-DD format
//       }));
//     } else {
//       setFormData((prevState) => ({
//         ...prevState,
//         [name]: value,
//       }));
//     }
//   };

//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const imageUrl = URL.createObjectURL(file);
//       setUploadedImage(imageUrl);
//       setFormData((prev) => ({
//         ...prev,
//         offerbanner: file,
//       }));
//     }
//   };

//   const validateForm = () => {
//     if (!formData.title) return "Offer title is required.";
//     return "";
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const validationError = validateForm();
//     if (validationError) {
//       setError(validationError);
//       return;
//     }
//     setError("");

//     try {
//       const data = new FormData();
//       data.append("title", formData.title);
//       data.append("terms", formData.terms);
//       data.append("keywords", formData.keywords);
//       data.append("discount", formData.discount);
//       data.append("expiryTime", formData.expiryTime); // Format to DD/MM/YYYY before sending

//       if (formData.offerbanner) {
//         data.append("offerbanner", formData.offerbanner);
//       }

//       if (isEdit) {
//         await editOffer(id, data);
//         toast.success("Offer updated successfully");
//       } else {
//         await CreateOffers(data);
//         toast.success("Offer created successfully");
//       }
//       navigate("/offer");
//     } catch (err) {
//       console.error("Error saving offer:", err);
//       setError("Failed to save offer. Please try again.");
//     }
//   };

//   return (
//     <div className="bg-gray-50 min-h-screen p-6">
//       <h1 className="text-3xl font-title text-gray-800">
//         {isEdit ? "Edit Offer" : "Create Offer"}
//       </h1>
//       <button
//         onClick={() => navigate("/offer")}
//         className="text-black rounded my-3 mr-4 w-full md:w-auto hover:underline cursor-pointer"
//       >
//         ← Go back
//       </button>

//       <div className="col-span-2 space-y-2 bg-white shadow-lg rounded-lg p-6 w-full">
//         <h2 className="text-xl font-semibold mb-6">
//           {isEdit ? "Update Offer Image" : "Add Offer Image"}
//         </h2>
//         <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col justify-center items-center relative">
//           <FaUpload className="text-orange-500 text-4xl mb-2" />
//           <input
//             type="file"
//             onChange={handleFileUpload}
//             className="absolute opacity-0 cursor-pointer inset-0"
//           />
//           <p className="text-gray-500">
//             Drag your image here, or{" "}
//             <span className="text-orange-500 cursor-pointer">
//               click to browse
//             </span>
//           </p>
//         </div>
//         {uploadedImage && (
//           <img
//             src={uploadedImage}
//             alt="Uploaded"
//             className="mt-4 w-full h-32 object-cover rounded-lg"
//           />
//         )}

//         <div className="space-y-4">
//           <h2 className="text-xl font-title mb-4">Offer Details</h2>
//           <input
//             type="text"
//             name="title"
//             placeholder="Offer Title"
//             className="border rounded p-2 w-full"
//             onChange={handleInputChange}
//             value={formData.title}
//           />
//           <input
//             type="text"
//             name="terms"
//             placeholder="Offer Terms"
//             className="border rounded p-2 w-full"
//             onChange={handleInputChange}
//             value={formData.terms}
//           />
//           <input
//             type="text"
//             name="keywords"
//             placeholder="Keywords"
//             className="border rounded p-2 w-full"
//             onChange={handleInputChange}
//             value={formData.keywords}
//           />
//           <input
//             type="text"
//             name="discount"
//             placeholder="Discount Percentage"
//             className="border rounded p-2 w-full"
//             onChange={handleInputChange}
//             value={formData.discount}
//           />
//           <input
//             type="date"
//             name="expiryTime"
//             className="border rounded p-2 w-full"
//             onChange={handleInputChange}
//             value={formData.expiryTime}
//           />
//         </div>

//         <div className="mt-6 flex justify-end">
//           <button
//             className="bg-gray-500 text-white px-6 py-2 rounded mr-4"
//             onClick={() => navigate("/offer")}
//           >
//             Cancel
//           </button>
//           <button
//             className="bg-blue-500 text-white px-6 py-2 rounded"
//             onClick={handleSubmit}
//           >
//             {isEdit ? "Update Offer" : "Create Offer"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OfferForm;

// import React, { useState, useEffect } from "react";
// import { FaUpload } from "react-icons/fa";
// import { toast } from "react-toastify";
// import { useNavigate, useParams } from "react-router-dom";
// import dayjs from "dayjs";
// import customParseFormat from "dayjs/plugin/customParseFormat";
// import { createOfferData, updateOfferData } from "../../services/Offer";

// dayjs.extend(customParseFormat);

// // API functions
// const createOffer = async (formData) => {
//   try {
//     const response = createOfferData(formData)
//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.message || "Failed to create offer");
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Error creating offer:", error);
//     throw error;
//   }
// };

// const editOffer = async (id, formData) => {
//   try {
//     const response = updateOfferData(id, formData)

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.message || "Failed to update offer");
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Error updating offer:", error);
//     throw error;
//   }
// };

// const OfferForm = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     offerbanner: null,
//     title: "",
//     terms: "",
//     keywords: "",
//     discount: "",
//     fromDate: "",
//     toDate: "",
//   });
//   const [uploadedImage, setUploadedImage] = useState(null);
//   const [error, setError] = useState("");
//   const [isEdit, setIsEdit] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     if (id) {
//       setIsEdit(true);
//       fetchOfferDetails(id);
//     }
//   }, [id]);

//   const fetchOfferDetails = async (offerId) => {
//     setIsLoading(true);
//     try {
//       const response = await getOfferById(offerId);

//       if (response.offerDetails) {
//         setFormData((prev) => ({
//           ...prev,
//           title: response.offerDetails.title || "",
//           terms: response.offerDetails.terms || "",
//           keywords: response.offerDetails.keywords || "",
//           discount: response.offerDetails.discount || "",
//           fromDate: response.offerDetails.fromDate
//             ? dayjs(response.offerDetails.fromDate).format("YYYY-MM-DD")
//             : "",
//           toDate: response.offerDetails.toDate
//             ? dayjs(response.offerDetails.toDate).format("YYYY-MM-DD")
//             : "",
//         }));

//         if (response.offerDetails.offerbanner) {
//           setUploadedImage(`${API_BASE_URL}/${response.offerDetails.offerbanner}`);
//         }
//       }
//     } catch (err) {
//       console.error("Error fetching offer details:", err);
//       toast.error("Failed to fetch offer details");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prevState) => ({
//       ...prevState,
//       [name]: value,
//     }));
//   };

//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       // Validate file type and size
//       if (!file.type.match("image.*")) {
//         setError("Please upload an image file");
//         return;
//       }
//       if (file.size > 5 * 1024 * 1024) { // 5MB limit
//         setError("Image size should be less than 5MB");
//         return;
//       }

//       const imageUrl = URL.createObjectURL(file);
//       setUploadedImage(imageUrl);
//       setFormData((prev) => ({
//         ...prev,
//         offerbanner: file,
//       }));
//       setError("");
//     }
//   };

//   const validateForm = () => {
//     if (!formData.title.trim()) return "Offer title is required";
//     if (!formData.fromDate) return "From date is required";
//     if (!formData.toDate) return "To date is required";
//     if (dayjs(formData.toDate).isBefore(dayjs(formData.fromDate))) {
//       return "To date must be after from date";
//     }
//     if (!isEdit && !formData.offerbanner) return "Offer banner is required";
//     return "";
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const validationError = validateForm();
//     if (validationError) {
//       setError(validationError);
//       toast.error(validationError);
//       return;
//     }
//     setError("");
//     setIsLoading(true);

//     try {
//       const data = new FormData();
//       data.append("offerTitle", formData.title);
//       data.append("offerTerms", formData.terms);
//       data.append("keyWords", formData.keywords);
//       data.append("discountPercentage", formData.discount);
//       data.append("validFrom", formData.fromDate);
//       data.append("validTo", formData.toDate);

//       if (formData.offerbanner) {
//         data.append("offerImage", formData.offerbanner);
//       }

//       if (isEdit) {
//         await editOffer(id, data);
//         toast.success("Offer updated successfully");
//       } else {
//         await createOffer(data);
//         toast.success("Offer created successfully");
//       }
//       navigate("/offer");
//     } catch (err) {
//       console.error("Error saving offer:", err);
//       setError(err.message || "Failed to save offer. Please try again.");
//       toast.error(err.message || "Failed to save offer. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="bg-gray-50 min-h-screen p-6">
//       <h1 className="text-3xl font-title text-gray-800">
//         {isEdit ? "Edit Offer" : "Create Offer"}
//       </h1>
//       <button
//         onClick={() => navigate("/offer")}
//         className="text-black rounded my-3 mr-4 w-full md:w-auto hover:underline cursor-pointer"
//       >
//         ← Go back
//       </button>

//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           {error}
//         </div>
//       )}

//       <div className="col-span-2 space-y-2 bg-white shadow-lg rounded-lg p-6 w-full">
//         <h2 className="text-xl font-semibold mb-6">
//           {isEdit ? "Update Offer Image" : "Add Offer Image"}
//         </h2>
//         <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col justify-center items-center relative">
//           <FaUpload className="text-orange-500 text-4xl mb-2" />
//           <input
//             type="file"
//             onChange={handleFileUpload}
//             accept="image/*"
//             className="absolute opacity-0 cursor-pointer inset-0"
//           />
//           <p className="text-gray-500">
//             Drag your image here, or{" "}
//             <span className="text-orange-500 cursor-pointer">
//               click to browse
//             </span>
//           </p>
//           <p className="text-gray-400 text-sm mt-2">
//             (JPEG, PNG, max 5MB)
//           </p>
//         </div>
//         {uploadedImage && (
//           <img
//             src={uploadedImage}
//             alt="Uploaded"
//             className="mt-4 w-full h-32 object-cover rounded-lg"
//           />
//         )}

//         <div className="space-y-4 mt-6">
//           <h2 className="text-xl font-title mb-4">Offer Details</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-gray-700 mb-1">Offer Title*</label>
//               <input
//                 type="text"
//                 name="title"
//                 placeholder="Offer Title"
//                 className="border rounded p-2 w-full"
//                 onChange={handleInputChange}
//                 value={formData.title}
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-gray-700 mb-1">Discount (%)*</label>
//               <input
//                 type="number"
//                 name="discount"
//                 placeholder="Discount Percentage"
//                 className="border rounded p-2 w-full"
//                 onChange={handleInputChange}
//                 value={formData.discount}
//                 min="1"
//                 max="100"
//                 required
//               />
//             </div>
//           </div>

//           <div>
//             <label className="block text-gray-700 mb-1">Terms & Conditions</label>
//             <textarea
//               name="terms"
//               placeholder="Offer Terms"
//               className="border rounded p-2 w-full"
//               onChange={handleInputChange}
//               value={formData.terms}
//               rows="3"
//             />
//           </div>

//           <div>
//             <label className="block text-gray-700 mb-1">Keywords (comma separated)</label>
//             <input
//               type="text"
//               name="keywords"
//               placeholder="Keywords"
//               className="border rounded p-2 w-full"
//               onChange={handleInputChange}
//               value={formData.keywords}
//             />
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-gray-700 mb-1">From Date*</label>
//               <input
//                 type="date"
//                 name="fromDate"
//                 className="border rounded p-2 w-full"
//                 onChange={handleInputChange}
//                 value={formData.fromDate}
//                 min={dayjs().format("YYYY-MM-DD")}
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-gray-700 mb-1">To Date*</label>
//               <input
//                 type="date"
//                 name="toDate"
//                 className="border rounded p-2 w-full"
//                 onChange={handleInputChange}
//                 value={formData.toDate}
//                 min={formData.fromDate || dayjs().format("YYYY-MM-DD")}
//                 required
//               />
//             </div>
//           </div>
//         </div>

//         <div className="mt-6 flex justify-end space-x-4">
//           <button
//             className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition"
//             onClick={() => navigate("/offer")}
//             disabled={isLoading}
//           >
//             Cancel
//           </button>
//           <button
//             className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition disabled:opacity-50"
//             onClick={handleSubmit}
//             disabled={isLoading}
//           >
//             {isLoading ? (
//               "Processing..."
//             ) : isEdit ? (
//               "Update Offer"
//             ) : (
//               "Create Offer"
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OfferForm;

import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { createOfferData, updateOfferData } from "../../services/Offer";
import ReusableForm from "../../components/ReusableForm";

const OfferForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Initial form state
  const [formData, setFormData] = useState({
    title: "",
    terms: "",
    keywords: "",
    discount: "",
    fromDate: "",
    toDate: "",
  });

  const [uploadedImage, setUploadedImage] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    if (id && location.state?.offerData) {
      setIsEdit(true);
      const offer = location.state.offerData;

      setFormData({
        title: offer.offerTitle || "",
        terms: offer.offerTerms || "",
        keywords: offer.keyWords || "",
        discount: offer.discountPercentage || "",
        fromDate: dayjs(offer.validFrom).format("YYYY-MM-DD"),
        toDate: dayjs(offer.validTo).format("YYYY-MM-DD"),
      });

      setUploadedImage(offer.offerImage);
    }
  }, [id, location]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match("image.*")) {
        setError("Please upload an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }
      setUploadedImage(URL.createObjectURL(file));
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
      setError("");
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const formPayload = new FormData();
      formPayload.append("offerTitle", formData.title);
      formPayload.append("offerTerms", formData.terms);
      formPayload.append("keyWords", formData.keywords);
      formPayload.append("discountPercentage", formData.discount);
      formPayload.append("validFrom", formData.fromDate);
      formPayload.append("validTo", formData.toDate);

      if (formData.image) {
        formPayload.append("offerImage", formData.image);
      }

      const response = isEdit
        ? await updateOfferData(id, formPayload)
        : await createOfferData(formPayload);

      if (response.success) {
        toast.success(
          isEdit ? "Offer updated successfully" : "Offer created successfully"
        );
        navigate("/offers");
      } else {
        throw new Error(response.message || "Operation failed");
      }
    } catch (error) {
      console.error("Error saving offer:", error);
      toast.error(error.message || "Failed to save offer");
    } finally {
      setIsLoading(false);
    }
  };

  const formFields = [
    {
      name: "title",
      label: "Offer Title",
      type: "text",
      placeholder: "Enter offer title",
      required: true,
    },
    {
      name: "discount",
      label: "Discount Percentage",
      type: "number",
      placeholder: "Enter discount percentage",
      required: true,
      min: 0,
      max: 100,
    },
    {
      name: "terms",
      label: "Terms & Conditions",
      type: "textarea",
      placeholder: "Enter terms and conditions",
      gridSpan: "full",
    },
    {
      name: "keywords",
      label: "Keywords",
      type: "text",
      placeholder: "Enter keywords (comma separated)",
      gridSpan: "full",
    },
    {
      name: "fromDate",
      label: "Valid From",
      type: "date",
      required: true,
    },
    {
      name: "toDate",
      label: "Valid To",
      type: "date",
      required: true,
    },
  ];
  const handleImageRemove = () => {
    setUploadedImage(null);
    // Also clear any file input value if needed
  };

  return (
    <div className="bg-gray-50 font-['roboto sans'] min-h-screen p-6">
      <h1 className="text-xl font-bold text-black mb-4">
        {isEdit ? "Edit Offer" : "Create Offer"}
      </h1>
      <button
        onClick={() => navigate("/offers")}
        className="text-black rounded mb-6  cursor-pointer flex items-center gap-1"
      >
        ← Back to Offers
      </button>

      <ReusableForm
        formData={formData}
        handleInputChange={handleInputChange}
        handleFileUpload={handleFileUpload}
        handleSubmit={handleSubmit}
        uploadedImage={uploadedImage}
        error={error}
        isLoading={isLoading}
        isEdit={isEdit}
        onCancel={() => navigate("/offers")}
        fields={formFields}
        title="Offer Details"
        imageUploadConfig={{
          enabled: true,
          label: "Offer Banner",
          accept: "image/*",
          maxSize: 5,
          required: !isEdit,
        }}
        handleImageRemove={handleImageRemove}
      />
    </div>
  );
};

export default OfferForm;
