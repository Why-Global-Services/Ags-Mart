// import React, { useState } from "react";
// import { FaUpload, FaTimes } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";

// const NotificationForm = () => {
//   const navigate = useNavigate();
//   const [sendTo, setSendTo] = useState("all");
//   const [selectedUser, setSelectedUser] = useState("");
//   const [title, setTitle] = useState("");
//   const [message, setMessage] = useState("");
//   const [image, setImage] = useState(null);
//   const [imagePreview, setImagePreview] = useState("");
//   const [error, setError] = useState("");
//   const [includeImage, setIncludeImage] = useState(true);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log({
//       sendTo,
//       selectedUser,
//       title,
//       message,
//       image: includeImage ? image : null,
//     });
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setImage(file);
//       setImagePreview(URL.createObjectURL(file));
//     }
//   };

//   const removeImage = () => {
//     setImage(null);
//     setImagePreview("");
//   };

//   return (
//     <div className="bg-gray-50 min-h-screen p-6">
//       <h1 className="text-3xl font-title text-gray-800">Notification Center</h1>
//       <button
//         className="text-black rounded my-3 mr-4 w-full md:w-auto cursor-pointer"
//         onClick={() => navigate(-1)}
//       >
//         ← Go back
//       </button>

//       <div className="bg-white shadow-lg rounded-sm p-6 w-full mt-1">
//         <form onSubmit={handleSubmit}>
    
//           {/* Title */}
//           <div className="mb-6">
//             <label className="block text-gray-800 font-semibold mb-2">
//               Title <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="text"
//               placeholder="Notification Title"
//               className="w-full px-4 py-2 border rounded-sm focus:outline-none focus:ring-1 focus:ring-black"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               required
//             />
//           </div>

//           {/* Message */}
//           <div className="mb-6">
//             <label className="block text-gray-800 font-semibold mb-2">
//               Message <span className="text-red-500">*</span>
//             </label>
//             <textarea
//               rows="4"
//               placeholder="Notification Message"
//               className="w-full px-4 py-2 border rounded-sm focus:outline-none focus:ring-1 focus:ring-black"
//               value={message}
//               onChange={(e) => setMessage(e.target.value)}
//               required
//             />
//           </div>

//           {/* Image Toggle */}
//           <div className="mb-4 flex items-center space-x-2">
//             <input
//               type="checkbox"
//               id="includeImage"
//               checked={includeImage}
//               onChange={(e) => setIncludeImage(e.target.checked)}
//               className="h-4 w-4 text-pink-500 focus:ring-pink-500"
//             />
//             <label htmlFor="includeImage" className="text-gray-800 font-medium">
//               Include Image <span className="text-red-500">*</span>
//             </label>
//           </div>

//           {/* Image Upload */}
//           {includeImage && (
//             <div className="mb-6">
//               <label className="block text-gray-800 font-semibold mb-2">
//                 Notification Image
//               </label>
//               <div className="border-2 border-dashed border-gray-300 rounded-sm p-12 flex flex-col justify-center items-center relative">
//                 <FaUpload className="text-orange-500 text-4xl mb-2" />
//                 <input
//                   type="file"
//                   onChange={handleImageChange}
//                   className="absolute opacity-0 cursor-pointer inset-0"
//                   accept="image/*"
//                 />
//                 <p className="text-gray-500">
//                   Drag your image here, or{" "}
//                   <span className="text-orange-500 cursor-pointer">
//                     click to browse
//                   </span>
//                 </p>
//               </div>

//               {imagePreview && (
//                 <div className="mt-4 relative w-32">
//                   <img
//                     src={imagePreview}
//                     alt="Preview"
//                     className="w-full h-32 object-cover rounded-lg"
//                   />
//                   <button
//                     onClick={removeImage}
//                     className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
//                   >
//                     <FaTimes size={12} />
//                   </button>
//                 </div>
//               )}
//             </div>
//           )}

//           {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

//           {/* Buttons */}
//           <div className="mt-6 flex justify-end space-x-4">
//             <button
//               type="button"
//               className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded transition cursor-pointer"
//               onClick={() => {
//                 setSendTo("all");
//                 setSelectedUser("");
//                 setTitle("");
//                 setMessage("");
//                 setImage(null);
//                 setImagePreview("");
//                 setIncludeImage(true);
//               }}
//             >
//               Reset
//             </button>
//             <button
//               type="submit"
//               className="bg-primary hover:bg-pink-600 text-white px-6 py-2 rounded transition cursor-pointer"
//             >
//               Send Notification
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default NotificationForm;



import React, { useState } from "react";
import { FaUpload, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";
import { createNotification } from "../../services/Notification";

const NotificationForm = () => {
  const navigate = useNavigate();
  const [sendTo, setSendTo] = useState("all");
  const [selectedUser, setSelectedUser] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");
  const [includeImage, setIncludeImage] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("sendTo", sendTo);
      if (sendTo === "specific" && selectedUser) {
        formData.append("userId", selectedUser);
      }
      formData.append("title", title);
      formData.append("message", message);
      if (includeImage && image) {
        formData.append("Image", image);
      }

      await createNotification(formData);
      
      toast.success("Notification sent successfully!");
      resetForm();
    } catch (error) {
      console.error("Error sending notification:", error);
      setError(error.message || "Failed to send notification. Please try again.");
      toast.error(error.message || "Failed to send notification");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      if (!file.type.match("image.*")) {
        setError("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("Image size should be less than 5MB");
        return;
      }
      
      setError("");
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview("");
  };

  const resetForm = () => {
    setSendTo("all");
    setSelectedUser("");
    setTitle("");
    setMessage("");
    setImage(null);
    setImagePreview("");
    setIncludeImage(true);
    setError("");
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <h1 className="text-3xl font-title text-gray-800">Notification Center</h1>
      <button
        className="text-black rounded my-3 mr-4 w-full md:w-auto cursor-pointer"
        onClick={() => navigate(-1)}
      >
        ← Go back
      </button>

      <div className="bg-white shadow-lg rounded-sm p-6 w-full mt-1">
        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="mb-6">
            <label className="block text-gray-800 font-semibold mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Notification Title"
              className="w-full px-4 py-2 border rounded-sm focus:outline-none focus:ring-1 focus:ring-black"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Message */}
          <div className="mb-6">
            <label className="block text-gray-800 font-semibold mb-2">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              rows="4"
              placeholder="Notification Message"
              className="w-full px-4 py-2 border rounded-sm focus:outline-none focus:ring-1 focus:ring-black"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          {/* Image Toggle */}
          <div className="mb-4 flex items-center space-x-2">
            <input
              type="checkbox"
              id="includeImage"
              checked={includeImage}
              onChange={(e) => setIncludeImage(e.target.checked)}
              className="h-4 w-4 text-pink-500 focus:ring-pink-500"
            />
            <label htmlFor="includeImage" className="text-gray-800 font-medium">
              Include Image
            </label>
          </div>

          {/* Image Upload */}
          {includeImage && (
            <div className="mb-6">
              <label className="block text-gray-800 font-semibold mb-2">
                Notification Image
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-sm p-12 flex flex-col justify-center items-center relative">
                <FaUpload className="text-orange-500 text-4xl mb-2" />
                <input
                  type="file"
                  onChange={handleImageChange}
                  className="absolute opacity-0 cursor-pointer inset-0"
                  accept="image/*"
                />
                <p className="text-gray-500">
                  Drag your image here, or{" "}
                  <span className="text-orange-500 cursor-pointer">
                    click to browse
                  </span>
                </p>
              </div>

              {imagePreview && (
                <div className="mt-4 relative w-32">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              )}
            </div>
          )}

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          {/* Buttons */}
          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded transition cursor-pointer"
              onClick={resetForm}
              disabled={isSubmitting}
            >
              Reset
            </button>
            <button
              type="submit"
              className="bg-table hover:bg-secondary text-white px-6 py-2 rounded transition cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Notification"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotificationForm;