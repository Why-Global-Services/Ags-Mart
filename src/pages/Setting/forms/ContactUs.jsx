import React, { useState, useEffect } from "react";
import { FaUpload } from "react-icons/fa";
import { getAllContactUs, createContactUs } from "../../../Interceptor/interceptor";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    address: "",
    mobile: "",
    email: "",
    boutiqueHours: "",
    bannerImage: null,
    bannerTitle: "",
    bannerContent: "",
  });
  const [savedData, setSavedData] = useState({
    address: "",
    mobile: "",
    email: "",
    boutiqueHours: "",
    bannerImage: null,
    bannerTitle: "",
    bannerContent: "",
  });
  const [allContacts, setAllContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all contact entries on component mount
  useEffect(() => {
    fetchAllContacts();
  }, []);

  const fetchAllContacts = async () => {
    setLoading(true);
    try {
      const response = await getAllContactUs();
      const contacts = Array.isArray(response.data) ? response.data : [response.data];
      setAllContacts(contacts);
      setError(null);
    } catch (err) {
      setError("Failed to fetch contact data. Please try again.");
      console.error("Error fetching contacts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size (e.g., allow only images, max 5MB)
      if (!file.type.startsWith("image/")) {
        setError("Please upload a valid image file.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should not exceed 5MB.");
        return;
      }

      // Convert image to base64 for preview and submission
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          [field]: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async () => {
    // Validate form data
    if (!formData.address.trim()) {
      setError("Address is required.");
      return;
    }
    if (!formData.mobile.trim()) {
      setError("Mobile number is required.");
      return;
    }
    if (!formData.email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!formData.boutiqueHours.trim()) {
      setError("Boutique hours are required.");
      return;
    }
    if (!formData.bannerTitle.trim()) {
      setError("Banner title is required.");
      return;
    }
    if (!formData.bannerContent.trim()) {
      setError("Banner content is required.");
      return;
    }

    try {
      // Prepare payload for backend
      const payload = {
        address: formData.address.trim(),
        mobile: formData.mobile.trim(),
        email: formData.email.trim(),
        boutiqueHours: formData.boutiqueHours.trim(),
        bannerImage: formData.bannerImage, // Base64 string
        bannerTitle: formData.bannerTitle.trim(),
        bannerContent: formData.bannerContent.trim(),
      };

      // Save the new contact data to the backend
      setSavedData(payload);
      console.log("Saved Data:", payload);

      // Refresh the contact list
      await fetchAllContacts();
      setError(null);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to save contact data. Please try again.";
      setError(errorMessage);
      console.error("Error saving contact:", err);
    }
  };

  const handleReset = () => {
    setFormData({
      address: "",
      mobile: "",
      email: "",
      boutiqueHours: "",
      bannerImage: null,
      bannerTitle: "",
      bannerContent: "",
    });
    setSavedData({
      address: "",
      mobile: "",
      email: "",
      boutiqueHours: "",
      bannerImage: null,
      bannerTitle: "",
      bannerContent: "",
    });
    setError(null);
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <div className="text-2xl font-semibold mb-4">Contact Us</div>
      <div className="text-xl font-medium mb-4">Banner Section</div>

      {/* Banner Image */}
      <div className="mb-6">
        <label
          htmlFor="bannerImage"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Banner Image
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col justify-center items-center">
          <FaUpload className="text-orange-500 text-4xl mb-2" />
          <input
            type="file"
            id="bannerImage"
            name="bannerImage"
            accept="image/*"
            onChange={(e) => handleImageChange(e, "bannerImage")}
            className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
          />
          <p className="text-gray-500 mt-2">
            Drag your images here, or click to browse
          </p>
          {formData.bannerImage && (
            <div className="mt-2">
              <img
                src={formData.bannerImage}
                alt="Banner Preview"
                className="max-w-xs rounded"
              />
            </div>
          )}
        </div>
      </div>

      {/* Banner Title */}
      <div className="mb-6">
        <label
          htmlFor="bannerTitle"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Banner Title
        </label>
        <input
          type="text"
          id="bannerTitle"
          name="bannerTitle"
          value={formData.bannerTitle}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Banner Content */}
      <div className="mb-6">
        <label
          htmlFor="bannerContent"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Banner Content
        </label>
        <textarea
          id="bannerContent"
          name="bannerContent"
          value={formData.bannerContent}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          rows="8"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {/* Form Section */}
      <div className="mb-6">
        <label
          htmlFor="address"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Address
        </label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <div className="mb-6">
        <label
          htmlFor="mobile"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Mobile Number
        </label>
        <input
          type="tel"
          id="mobile"
          name="mobile"
          value={formData.mobile}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <div className="mb-6">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <div className="mb-6">
        <label
          htmlFor="boutiqueHours"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Boutique Hours
        </label>
        <input
          type="text"
          id="boutiqueHours"
          name="boutiqueHours"
          value={formData.boutiqueHours}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <div className="mt-4 flex gap-4">
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-500 text-white cursor-pointer rounded hover:bg-gray-700"
        >
          Reset
        </button>
        <button
          onClick={handleUpdate}
          className="px-4 py-2 bg-table text-white cursor-pointer rounded hover:bg-secondary"
        >
          Update 
        </button>
      </div>

      {/* Preview Section */}
      {(savedData.address ||
        savedData.mobile ||
        savedData.email ||
        savedData.boutiqueHours ||
        savedData.bannerImage ||
        savedData.bannerTitle ||
        savedData.bannerContent) && (
        <div className="mt-10 p-4 border rounded bg-gray-50">
          <h3 className="text-xl font-semibold mb-2">Preview:</h3>
          {savedData.bannerImage && (
            <div className="mb-4">
              <img
                src={savedData.contactusBgImage}
                alt="Banner"
                className="w-full max-h-64 object-cover rounded"
              />
            </div>
          )}
          {savedData.bannerTitle && (
            <h2 className="text-2xl font-bold mb-2">{savedData.bannerTitle}</h2>
          )}
          {savedData.bannerContent && (
            <div className="prose max-w-none whitespace-pre-line mb-4">
              {savedData.bannerContent}
            </div>
          )}
          <div className="mt-4">
            <p>
              <strong>Address:</strong> {savedData.address}
            </p>
            <p>
              <strong>Mobile:</strong> {savedData.mobile}
            </p>
            <p>
              <strong>Email:</strong> {savedData.email}
            </p>
            <p>
              <strong>Boutique Hours:</strong> {savedData.boutiqueHours}
            </p>
          </div>
        </div>
      )}

      {/* All Contacts Section */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4">All Contact Entries</h3>
        {loading ? (
          <div>Loading...</div>
        ) : allContacts.length === 0 ? (
          <div>No contact entries found.</div>
        ) : (
          <div className="grid gap-4">
            {allContacts.map((contact) => (
              <div
                key={contact._id}
                className="p-4 border rounded bg-gray-50"
              >
                {contact.bannerImage && (
                  <div className="mb-4">
                    <img
                      src={contact.bannerImage}
                      alt="Banner"
                      className="w-full max-h-64 object-cover rounded"
                    />
                  </div>
                )}
                {contact.bannerTitle && (
                  <h4 className="text-lg font-bold">{contact.contactusBgImage}</h4>
                )}
                {contact.bannerContent && (
                  <div className="mt-2 whitespace-pre-line">
                    {contact.bannerContent}
                  </div>
                )}
                <div className="mt-2">
                  <p>
                    <strong>Address:</strong> {contact.address}
                  </p>
                  <p>
                    <strong>Mobile:</strong> {contact.mobile}
                  </p>
                  <p>
                    <strong>Email:</strong> {contact.email}
                  </p>
                  <p>
                    <strong>Boutique Hours:</strong> {contact.boutiqueHours}
                  </p>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Created: {new Date(contact.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactUs;