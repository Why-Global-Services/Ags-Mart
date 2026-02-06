import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaUpload, FaTimes } from "react-icons/fa";
import { Switch } from 'antd';
import { 
  createCoupon, 
  editCoupon, 
  getOneCoupon 
} from "../../Interceptor/interceptor";
import { toast } from "react-toastify";
import { getAllProduct } from "../../services/Products";

const CouponForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);

  const [formData, setFormData] = useState({
    code: "",
    message: "",

    offerType: "DISCOUNT", // DISCOUNT | FREE_PRODUCT

    minPurchaseAmount: 0,

    // Discount fields (only for DISCOUNT type)
    discountValue: 0,
    discountType: "percentage",
    maxDiscountAmount: 0,

    // Free Product fields (only for FREE_PRODUCT type)
    freeProduct: {
      productId: "",
      variantId: "",
      productType: "nonVariant",
    },

    validFrom: "",
    validUntil: "",
    usageLimit: 1,
    repeatUsage: "allowed",

    couponImage: null,

    cashBack: false,
    status: "active",
    firstOrderOnly: false,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (isEditMode && products.length > 0) {
      fetchCouponData();
    }
  }, [id, products]);

  const fetchProducts = async () => {
    try {
      const res = await getAllProduct();
      const data = res?.data || res || [];
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products", err);
      toast.error("Failed to load products");
    }
  };

  const handleFreeProductSelect = (productId) => {
    const selected = products.find((p) => p._id === productId);

    if (!selected) return;

    // Detect variants
    let productVariants = [];

    if (selected?.variant?.sizeColorVariants?.length) {
      productVariants = selected.variant.sizeColorVariants;
    } else if (selected?.variant?.sizeOnlyVariants?.length) {
      productVariants = selected.variant.sizeOnlyVariants;
    } else if (selected?.variant?.colorOnlyVariants?.length) {
      productVariants = selected.variant.colorOnlyVariants;
    }

    setVariants(productVariants);

    setFormData((prev) => ({
      ...prev,
      freeProduct: {
        productId,
        variantId: "",
        productType: productVariants.length ? "variant" : "nonVariant",
      },
    }));
  };

  const fetchCouponData = async () => {
    try {
      setLoading(true);
      const response = await getOneCoupon(id);
      const data = response.data || response;

      setFormData({
        code: data.code || "",
        message: data.message || "",

        offerType: data.offerType || "DISCOUNT",

        minPurchaseAmount: data.minPurchaseAmount || 0,

        discountValue: data.discountValue || 0,
        discountType: data.discountType || "percentage",
        maxDiscountAmount: data.maxDiscountAmount || 0,

        freeProduct: data.freeProduct || {
          productId: "",
          variantId: "",
          productType: "nonVariant",
        },

        validFrom: data.validFrom ? data.validFrom.split("T")[0] : "",
        validUntil: data.validUntil ? data.validUntil.split("T")[0] : "",

        usageLimit: data.usageLimit || 1,
        repeatUsage: data.repeatUsage || "allowed",

        couponImage: null,

        cashBack: data.cashBack || false,
        status: data.status || "active",
        firstOrderOnly: data.firstOrderOnly || false,
      });

      // Load variants for edit mode
      if (data.offerType === "FREE_PRODUCT" && data.freeProduct?.productId) {
        const selected = products.find(
          (p) => p._id === data.freeProduct.productId
        );

        if (selected?.variant) {
          let productVariants = [];

          if (selected.variant.sizeColorVariants?.length) {
            productVariants = selected.variant.sizeColorVariants;
          } else if (selected.variant.sizeOnlyVariants?.length) {
            productVariants = selected.variant.sizeOnlyVariants;
          } else if (selected.variant.colorOnlyVariants?.length) {
            productVariants = selected.variant.colorOnlyVariants;
          }

          setVariants(productVariants);
        }
      }

      if (data.couponImage) {
        setExistingImage(data.couponImage);
        setImagePreview(data.couponImage);
      }

    } catch (error) {
      toast.error("Failed to fetch coupon data");
      console.error("Error fetching coupon:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('File is not an image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File is too large (max 5MB)');
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setImagePreview(imageUrl);
    setFormData(prev => ({
      ...prev,
      couponImage: file
    }));
  };

  const removeImage = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      couponImage: null
    }));
    if (!isEditMode) {
      setExistingImage(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formPayload = new FormData();
      
      // Append fields based on offer type
      formPayload.append("code", formData.code);
      formPayload.append("message", formData.message);
      formPayload.append("offerType", formData.offerType);
      formPayload.append("minPurchaseAmount", formData.minPurchaseAmount);
      formPayload.append("validFrom", formData.validFrom);
      formPayload.append("validUntil", formData.validUntil);
      formPayload.append("usageLimit", formData.usageLimit);
      formPayload.append("repeatUsage", formData.repeatUsage);
      formPayload.append("cashBack", formData.cashBack);
      formPayload.append("status", formData.status);
      formPayload.append("firstOrderOnly", formData.firstOrderOnly);

      // Append type-specific fields
      if (formData.offerType === "DISCOUNT") {
        formPayload.append("discountValue", formData.discountValue);
        formPayload.append("discountType", formData.discountType);
        formPayload.append("maxDiscountAmount", formData.maxDiscountAmount);
      } else if (formData.offerType === "FREE_PRODUCT") {
        formPayload.append("freeProduct", JSON.stringify(formData.freeProduct));
      }

      // Handle image upload
      if (formData.couponImage instanceof File) {
        formPayload.append('couponImage', formData.couponImage);
      } else if (isEditMode && existingImage) {
        formPayload.append('existingImage', existingImage);
      }

      if (isEditMode) {
        await editCoupon(id, formPayload, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success("Coupon updated successfully");
      } else {
        await createCoupon(formPayload, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success("Coupon created successfully");
      }
      navigate("/coupons");
    } catch (error) {
      toast.error(`${error.response?.data?.message || error.message}`);
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} coupon:`, error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode && products.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="mb-4">
        <h1 className="text-3xl font-title text-gray-800">
          {isEditMode ? "Edit Coupon" : "Add Coupon"}
        </h1>
        <button
          className="text-black rounded my-3 mr-4 w-full md:w-auto cursor-pointer"
          onClick={() => navigate(-1)}
        >
          ← Go back
        </button>
      </div>

      <div className="col-span-2 space-y-2 bg-white shadow-lg rounded-lg p-6 w-full">
        {/* Image Upload Section */}
        <h2 className="text-xl font-semibold mb-6 text-gray-800">
          {isEditMode ? "Edit Coupon Image" : "Add Coupon Image"}
        </h2>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col justify-center items-center relative">
          <FaUpload className="text-orange-500 text-4xl mb-2" />
          <input
            type="file"
            onChange={handleFileUpload}
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

        {/* Image Preview */}
        <div className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {(imagePreview || existingImage) && (
              <div className="relative">
                <img
                  src={imagePreview || existingImage}
                  alt="Coupon preview"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <FaTimes size={12} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Coupon Information Section */}
        <div className="mt-6">
          <h2 className="text-xl font-title mb-4 text-gray-800">
            Coupon Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Coupon Code */}
            <div className="w-full mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Coupon Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="code"
                placeholder="Enter coupon code"
                className="border rounded p-2 w-full text-gray-800"
                onChange={handleInputChange}
                value={formData.code}
                required
              />
            </div>

            {/* Coupon Type */}
            <div className="w-full mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Coupon Type <span className="text-red-500">*</span>
              </label>
              <select
                name="offerType"
                className="border rounded p-2 w-full"
                value={formData.offerType}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    offerType: e.target.value,
                  }));
                  // Reset variants when switching types
                  setVariants([]);
                }}
              >
                <option value="DISCOUNT">Discount Coupon</option>
                <option value="FREE_PRODUCT">Free Product Coupon</option>
              </select>
            </div>
          </div>

          {/* DISCOUNT TYPE FIELDS */}
          {formData.offerType === "DISCOUNT" && (
            <div className="border p-4 rounded bg-blue-50 mb-4">
              <h3 className="font-semibold mb-3 text-gray-800">
                Discount Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Discount Type */}
                <div className="w-full mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Discount Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="discountType"
                    className="border rounded p-2 w-full"
                    value={formData.discountType}
                    onChange={handleInputChange}
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </div>

                {/* Discount Value */}
                <div className="w-full mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Discount Value <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="discountValue"
                    className="border rounded p-2 w-full"
                    value={formData.discountValue}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>

                {/* Max Discount */}
                <div className="w-full mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Max Discount Amount
                  </label>
                  <input
                    type="number"
                    name="maxDiscountAmount"
                    className="border rounded p-2 w-full"
                    value={formData.maxDiscountAmount}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
              </div>
            </div>
          )}

          {/* FREE PRODUCT TYPE FIELDS */}
          {formData.offerType === "FREE_PRODUCT" && (
            <div className="border p-4 rounded bg-green-50 mb-4">
              <h3 className="font-semibold mb-3 text-gray-800">
                Free Product Details
              </h3>

              {/* Product Select */}
              <div className="mb-3">
                <label className="block text-sm mb-1">
                  Select Product <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.freeProduct.productId}
                  onChange={(e) => handleFreeProductSelect(e.target.value)}
                  className="border rounded p-2 w-full"
                  required
                >
                  <option value="">-- Select Product --</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.productName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Variant Select */}
              {variants.length > 0 && (
                <div className="mb-3">
                  <label className="block text-sm mb-1">
                    Select Variant <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.freeProduct.variantId}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        freeProduct: {
                          ...prev.freeProduct,
                          variantId: e.target.value,
                        },
                      }))
                    }
                    className="border rounded p-2 w-full"
                    required
                  >
                    <option value="">-- Select Variant --</option>
                    {variants.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.size && `Size: ${v.size} `}
                        {v.color && `Color: ${v.color} `}
                        ₹{v.price?.salePrice}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Common Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="w-full mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Minimum Purchase Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="minPurchaseAmount"
                placeholder="Minimum Purchase Amount"
                className="border rounded p-2 w-full text-gray-800"
                onChange={handleInputChange}
                value={formData.minPurchaseAmount}
                min="0"
                required
              />
            </div>

            <div className="w-full mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Usage Limit <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="usageLimit"
                placeholder="Usage Limit"
                className="border rounded p-2 w-full text-gray-800"
                onChange={handleInputChange}
                value={formData.usageLimit}
                min="1"
                required
              />
            </div>
          </div>

          <div className="w-full mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              name="message"
              placeholder="Coupon message or description"
              className="border rounded p-2 w-full text-gray-800"
              onChange={handleInputChange}
              value={formData.message}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="w-full mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="validFrom"
                className="border rounded p-2 w-full text-gray-800"
                onChange={handleInputChange}
                value={formData.validFrom}
                required
              />
            </div>

            <div className="w-full mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="validUntil"
                className="border rounded p-2 w-full text-gray-800"
                onChange={handleInputChange}
                value={formData.validUntil}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="w-full mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Repeat Usage <span className="text-red-500">*</span>
              </label>
              <select
                name="repeatUsage"
                className="border rounded p-2 w-full text-gray-800"
                onChange={handleInputChange}
                value={formData.repeatUsage}
                required
              >
                <option value="allowed">Allowed</option>
                <option value="notAllowed">Not Allowed</option>
              </select>
            </div>

            <div className="flex items-center mb-6">
              <label className="flex items-center space-x-3">
                <Switch
                  checked={formData.firstOrderOnly}
                  onChange={(checked) => {
                    setFormData((prev) => ({
                      ...prev,
                      firstOrderOnly: checked,
                      repeatUsage: checked ? "notAllowed" : prev.repeatUsage,
                      usageLimit: checked ? 1 : prev.usageLimit,
                    }));
                  }}
                />
                <span className="text-sm font-medium text-gray-600">
                  First Order Only Coupon
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-center mb-6">
            <label className="flex items-center space-x-2">
              <Switch
                checked={formData.status === "active"}
                onChange={(checked) => {
                  setFormData(prev => ({
                    ...prev,
                    status: checked ? "active" : "inactive"
                  }));
                }}
                checkedChildren="Active"
                unCheckedChildren="Inactive"
              />
              <span className="text-sm font-medium text-gray-600">
                Coupon Status
              </span>
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="mt-6 flex justify-end space-x-4">
          <button
            type="button"
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded transition cursor-pointer"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="bg-secondary text-white px-6 py-2 rounded transition cursor-pointer disabled:bg-opacity-50"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {isEditMode ? "Updating..." : "Creating..."}
              </span>
            ) : isEditMode ? (
              "Update Coupon"
            ) : (
              "Create Coupon"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CouponForm;