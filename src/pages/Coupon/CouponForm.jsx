import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaUpload, FaTimes, FaSearch, FaCheck, FaLayerGroup, FaBoxOpen, FaSlidersH, FaInfoCircle } from "react-icons/fa";
import { Switch } from 'antd';
import { 
  createCoupon, 
  editCoupon, 
  getOneCoupon,
  getCategory
} from "../../Interceptor/interceptor";
import { toast } from "react-toastify";
import { getAllProduct } from "../../services/Products";

const CouponForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [variants, setVariants] = useState([]);
  const [productSearchTerm, setProductSearchTerm] = useState("");

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

    // Applicability fields
    applicabilityType: "ALL_PRODUCTS", // ALL_PRODUCTS | SELECTED_PRODUCTS | CONDITIONAL
    applicableProductIds: [],
    applicableCategories: [],
    conditions: {
      minSubtotal: 0,
      minQuantity: 0,
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
    fetchCategories();
  }, []);

  useEffect(() => {
    if (isEditMode && products.length > 0) {
      fetchCouponData();
    }
  }, [id, products]);

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      setProductsError(null);
      const res = await getAllProduct();
      const data = res?.data || res || [];
      const safeData = Array.isArray(data) ? data : (Array.isArray(res) ? res : []);
      setProducts(safeData);
    } catch (err) {
      console.error("Failed to fetch products", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to load products";
      setProductsError(errMsg);
      toast.error(`Products: ${errMsg}`);
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await getCategory();
      const data = res?.data || res || [];
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  const handleFreeProductSelect = (productId) => {
    const selected = products.find((p) => p._id === productId);

    if (!selected) return;

    // Detect variants
    let productVariants = [];

    if (selected?.variant?.unitOnlyVariants?.length) {
      productVariants = selected.variant.unitOnlyVariants;
    } else if (selected?.variant?.sizeColorVariants?.length) {
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

        applicabilityType: data.applicabilityType || "ALL_PRODUCTS",
        applicableProductIds: Array.isArray(data.applicableProductIds) ? data.applicableProductIds : [],
        applicableCategories: Array.isArray(data.applicableCategories) ? data.applicableCategories : [],
        conditions: {
          minSubtotal: data.conditions?.minSubtotal ?? data.minPurchaseAmount ?? 0,
          minQuantity: data.conditions?.minQuantity ?? 0,
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

          if (selected.variant.unitOnlyVariants?.length) {
            productVariants = selected.variant.unitOnlyVariants;
          } else if (selected.variant.sizeColorVariants?.length) {
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

  const handleConditionChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        [field]: Number(value) < 0 ? 0 : Number(value)
      }
    }));
  };

  const handleProductToggle = (productId) => {
    if (!productId) return;
    setFormData(prev => {
      const currentList = Array.isArray(prev.applicableProductIds) ? prev.applicableProductIds : [];
      const exists = currentList.includes(productId);
      const updated = exists 
        ? currentList.filter(id => id !== productId)
        : [...currentList, productId];
      return {
        ...prev,
        applicableProductIds: updated
      };
    });
  };

  const handleSelectAllFilteredProducts = () => {
    const filteredIds = filteredProducts.map(p => p._id).filter(Boolean);
    setFormData(prev => {
      const currentList = Array.isArray(prev.applicableProductIds) ? prev.applicableProductIds : [];
      const combined = Array.from(new Set([...currentList, ...filteredIds]));
      return {
        ...prev,
        applicableProductIds: combined
      };
    });
  };

  const handleClearAllProducts = () => {
    setFormData(prev => ({
      ...prev,
      applicableProductIds: []
    }));
  };

  const handleCategoryToggle = (catId) => {
    if (!catId) return;
    setFormData(prev => {
      const currentList = Array.isArray(prev.applicableCategories) ? prev.applicableCategories : [];
      const exists = currentList.includes(catId);
      const updated = exists
        ? currentList.filter(id => id !== catId)
        : [...currentList, catId];
      return {
        ...prev,
        applicableCategories: updated
      };
    });
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
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    // Client-side validations
    if (!formData.code || !formData.code.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    if (!formData.message || !formData.message.trim()) {
      toast.error("Please enter a coupon description message");
      return;
    }
    if (!formData.validFrom || !formData.validUntil) {
      toast.error("Please select both start and end dates");
      return;
    }
    if (new Date(formData.validFrom) > new Date(formData.validUntil)) {
      toast.error("Valid until date must be after valid from date");
      return;
    }
    if (!isEditMode && !formData.couponImage) {
      toast.error("Please select a coupon image");
      return;
    }

    if (formData.offerType === "DISCOUNT") {
      if (Number(formData.discountValue) <= 0) {
        toast.error("Discount value must be greater than 0");
        return;
      }
      if (formData.discountType === "percentage" && Number(formData.discountValue) > 100) {
        toast.error("Percentage discount cannot exceed 100%");
        return;
      }
    } else if (formData.offerType === "FREE_PRODUCT") {
      if (!formData.freeProduct?.productId) {
        toast.error("Please select a free product");
        return;
      }
    }

    if (formData.applicabilityType === "SELECTED_PRODUCTS") {
      if (!formData.applicableProductIds || formData.applicableProductIds.length === 0) {
        toast.error("Please select at least one product for this coupon");
        return;
      }
    }

    setLoading(true);

    try {
      const formPayload = new FormData();
      
      formPayload.append("code", formData.code.trim().toUpperCase());
      formPayload.append("message", formData.message.trim());
      formPayload.append("offerType", formData.offerType);
      formPayload.append("minPurchaseAmount", formData.minPurchaseAmount || 0);
      formPayload.append("validFrom", formData.validFrom);
      formPayload.append("validUntil", formData.validUntil);
      formPayload.append("usageLimit", formData.usageLimit || 1);
      formPayload.append("repeatUsage", formData.repeatUsage);
      formPayload.append("cashBack", formData.cashBack);
      formPayload.append("status", formData.status);
      formPayload.append("firstOrderOnly", formData.firstOrderOnly);

      // Append Applicability configuration
      formPayload.append("applicabilityType", formData.applicabilityType);
      formPayload.append("applicableProductIds", JSON.stringify(formData.applicableProductIds || []));
      formPayload.append("applicableCategories", JSON.stringify(formData.applicableCategories || []));
      formPayload.append("conditions", JSON.stringify({
        minSubtotal: Number(formData.conditions?.minSubtotal ?? formData.minPurchaseAmount ?? 0),
        minQuantity: Number(formData.conditions?.minQuantity ?? 0),
        applicableProductIds: formData.applicableProductIds || [],
        applicableCategories: formData.applicableCategories || [],
        firstOrderOnly: Boolean(formData.firstOrderOnly)
      }));

      // Append type-specific fields
      if (formData.offerType === "DISCOUNT") {
        formPayload.append("discountValue", formData.discountValue);
        formPayload.append("discountType", formData.discountType);
        formPayload.append("maxDiscountAmount", formData.maxDiscountAmount || 0);
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
        await editCoupon(id, formPayload);
        toast.success("Coupon updated successfully");
      } else {
        await createCoupon(formPayload);
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

  const filteredProducts = (Array.isArray(products) ? products : []).filter((p) => {
    if (!p) return false;
    if (!productSearchTerm.trim()) return true;
    const term = productSearchTerm.toLowerCase();
    const nameMatch = (p.productName || p.productTitle || p.title || "").toLowerCase().includes(term);
    const skuVal = (typeof p.sku === "string" ? p.sku : "") || (p.inventory?.sku || "") || (p.inventory?.productCode || "") || (p.nonVariant?.skuCode || "");
    const skuMatch = skuVal.toLowerCase().includes(term);
    return nameMatch || skuMatch;
  });

  if (loading && isEditMode && products.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#f8faf8] via-[#f0f7f2] to-[#e8f3ec] min-h-screen p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-title text-gray-900 tracking-tight">
            {isEditMode ? "Edit Coupon" : "Add Coupon"}
          </h1>
          <p className="text-sm text-gray-600 mt-0.5">Configure discounts, applicability, and customer eligibility rules</p>
        </div>
        <button
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-emerald-800 bg-white/80 hover:bg-emerald-50 border border-emerald-200/60 shadow-sm transition-all cursor-pointer w-fit"
          onClick={() => navigate(-1)}
        >
          ← Go back
        </button>
      </div>

      <div className="col-span-2 space-y-6 agri-glass-card rounded-2xl p-4 sm:p-6 lg:p-8 w-full bg-white shadow-sm border border-emerald-100">
        {/* Image Upload Section */}
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          {isEditMode ? "Coupon Image" : "Add Coupon Image"} <span className="text-red-500">*</span>
        </h2>
        <div className="border-2 border-dashed border-emerald-300/80 bg-emerald-50/30 rounded-2xl p-8 sm:p-12 flex flex-col justify-center items-center relative hover:bg-emerald-50/50 transition-all">
          <FaUpload className="text-emerald-600 text-4xl mb-2" />
          <input
            type="file"
            onChange={handleFileUpload}
            className="absolute opacity-0 cursor-pointer inset-0"
            accept="image/*"
          />
          <p className="text-gray-600 text-sm">
            Drag your image here, or{" "}
            <span className="text-emerald-700 font-semibold cursor-pointer">
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
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
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
        </div>

        {/* Coupon Information Section */}
        <div className="mt-6">
          <h2 className="text-xl font-title mb-4 text-gray-800 border-b pb-2">
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
                placeholder="e.g. WELCOME10"
                className="border rounded-lg p-2.5 w-full text-gray-800 uppercase focus:ring-2 focus:ring-emerald-500 outline-none"
                onChange={handleInputChange}
                value={formData.code}
                required
              />
            </div>

            {/* Coupon Type */}
            <div className="w-full mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Coupon Offer Type <span className="text-red-500">*</span>
              </label>
              <select
                name="offerType"
                className="border rounded-lg p-2.5 w-full text-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.offerType}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    offerType: e.target.value,
                  }));
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
            <div className="border border-blue-200 p-4 rounded-xl bg-blue-50/50 mb-6">
              <h3 className="font-semibold mb-3 text-blue-900 flex items-center gap-2">
                <FaSlidersH className="text-blue-600" /> Discount Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Discount Type */}
                <div className="w-full mb-2">
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Discount Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="discountType"
                    className="border rounded-lg p-2.5 w-full bg-white text-gray-800"
                    value={formData.discountType}
                    onChange={handleInputChange}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                {/* Discount Value */}
                <div className="w-full mb-2">
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Discount Value {formData.discountType === "percentage" ? "(%)" : "(₹)"} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="discountValue"
                    className="border rounded-lg p-2.5 w-full bg-white text-gray-800"
                    value={formData.discountValue}
                    onChange={handleInputChange}
                    min="0"
                    max={formData.discountType === "percentage" ? "100" : undefined}
                    required
                  />
                </div>

                {/* Max Discount */}
                <div className="w-full mb-2">
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Max Discount Amount (₹)
                  </label>
                  <input
                    type="number"
                    name="maxDiscountAmount"
                    placeholder="0 for unlimited"
                    className="border rounded-lg p-2.5 w-full bg-white text-gray-800"
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
            <div className="border border-emerald-200 p-4 rounded-xl bg-emerald-50/50 mb-6">
              <h3 className="font-semibold mb-3 text-emerald-900 flex items-center gap-2">
                <FaBoxOpen className="text-emerald-700" /> Free Product Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product Select */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Select Free Product <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.freeProduct.productId}
                    onChange={(e) => handleFreeProductSelect(e.target.value)}
                    className="border rounded-lg p-2.5 w-full bg-white text-gray-800"
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
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
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
                      className="border rounded-lg p-2.5 w-full bg-white text-gray-800"
                      required
                    >
                      <option value="">-- Select Variant --</option>
                      {variants.map((v) => (
                        <option key={v._id} value={v._id}>
                          {v.unit && `Unit: ${v.unit} `}
                          {v.size && `Size: ${v.size} `}
                          {v.color && `Color: ${v.color} `}
                          ₹{v.price?.salePrice}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* COUPON APPLICABILITY SECTION                                   */}
          {/* ============================================================== */}
          <div className="border border-emerald-200 rounded-xl p-5 bg-gradient-to-br from-emerald-50/40 via-white to-emerald-50/20 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FaLayerGroup className="text-emerald-700" /> Coupon Applicability
              </h3>
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                {formData.applicabilityType === "ALL_PRODUCTS" && "Applies Storewide"}
                {formData.applicabilityType === "SELECTED_PRODUCTS" && `${formData.applicableProductIds.length} Products Selected`}
                {formData.applicabilityType === "CONDITIONAL" && "Conditional Rules"}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Select which products this coupon applies to or set advanced cart eligibility rules.
            </p>

            {/* Applicability Mode Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <div
                onClick={() => setFormData(prev => ({ ...prev, applicabilityType: "ALL_PRODUCTS" }))}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  formData.applicabilityType === "ALL_PRODUCTS"
                    ? "border-emerald-600 bg-emerald-50/60 shadow-sm"
                    : "border-gray-200 bg-white hover:border-emerald-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">All Products</span>
                  {formData.applicabilityType === "ALL_PRODUCTS" && (
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                      <FaCheck size={10} />
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Coupon applies to every eligible product across the entire store.
                </p>
              </div>

              <div
                onClick={() => setFormData(prev => ({ ...prev, applicabilityType: "SELECTED_PRODUCTS" }))}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  formData.applicabilityType === "SELECTED_PRODUCTS"
                    ? "border-emerald-600 bg-emerald-50/60 shadow-sm"
                    : "border-gray-200 bg-white hover:border-emerald-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Selected Products</span>
                  {formData.applicabilityType === "SELECTED_PRODUCTS" && (
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                      <FaCheck size={10} />
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Applies only to specifically selected products. Discount calculates on eligible items only.
                </p>
              </div>

              <div
                onClick={() => setFormData(prev => ({ ...prev, applicabilityType: "CONDITIONAL" }))}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  formData.applicabilityType === "CONDITIONAL"
                    ? "border-emerald-600 bg-emerald-50/60 shadow-sm"
                    : "border-gray-200 bg-white hover:border-emerald-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Conditional Eligibility</span>
                  {formData.applicabilityType === "CONDITIONAL" && (
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                      <FaCheck size={10} />
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Configurable cart thresholds, minimum item quantity, and category restrictions.
                </p>
              </div>
            </div>

            {/* A. ALL PRODUCTS: Explanatory banner */}
            {formData.applicabilityType === "ALL_PRODUCTS" && (
              <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-lg p-3 text-xs text-emerald-900 flex items-center gap-2">
                <FaInfoCircle className="text-emerald-700 text-base shrink-0" />
                <span>
                  This coupon applies to all products in the cart. Products that already have promotional discounts will be protected according to store policies.
                </span>
              </div>
            )}

            {/* B. SELECTED PRODUCTS: Product Search & Multi-Selection */}
            {formData.applicabilityType === "SELECTED_PRODUCTS" && (
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-sm font-semibold text-gray-800">
                    Choose Applicable Products <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={handleSelectAllFilteredProducts}
                      className="text-emerald-700 hover:text-emerald-800 font-medium underline cursor-pointer"
                    >
                      Select all filtered ({filteredProducts.length})
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={handleClearAllProducts}
                      className="text-red-600 hover:text-red-700 font-medium underline cursor-pointer"
                    >
                      Clear all ({(formData.applicableProductIds || []).length})
                    </button>
                  </div>
                </div>

                {/* Selected Products Chips */}
                {(formData.applicableProductIds || []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2.5 bg-gray-50 rounded-lg border border-gray-200 max-h-32 overflow-y-auto">
                    {(formData.applicableProductIds || []).map((pId) => {
                      const prod = products.find((p) => p && p._id === pId);
                      return (
                        <span
                          key={pId}
                          className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-medium shadow-2xs"
                        >
                          <span className="max-w-[180px] truncate">{prod?.productName || prod?.productTitle || prod?.title || pId}</span>
                          <button
                            type="button"
                            onClick={() => handleProductToggle(pId)}
                            className="text-emerald-700 hover:text-red-600 ml-0.5 cursor-pointer"
                          >
                            <FaTimes size={10} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Search Bar */}
                <div className="relative">
                  <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products by title or SKU..."
                    value={productSearchTerm}
                    onChange={(e) => setProductSearchTerm(e.target.value)}
                    className="border rounded-lg pl-9 pr-3 py-2 w-full text-sm text-gray-800 bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Inline Loading / Error / Checklist */}
                {productsLoading && (
                  <div className="p-6 text-center text-sm text-gray-500 flex items-center justify-center gap-2 border rounded-lg bg-white">
                    <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                    <span>Loading products...</span>
                  </div>
                )}

                {productsError && !productsLoading && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center justify-between">
                    <span>Failed to load products: {productsError}</span>
                    <button
                      type="button"
                      onClick={fetchProducts}
                      className="px-2.5 py-1 bg-red-600 text-white rounded font-medium hover:bg-red-700 transition cursor-pointer"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {/* Products List Checklist */}
                {!productsLoading && !productsError && (
                  <div className="border rounded-lg max-h-60 overflow-y-auto divide-y bg-white">
                    {filteredProducts.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        {productSearchTerm.trim()
                          ? `No products found matching "${productSearchTerm}"`
                          : "No products available"}
                      </div>
                    ) : (
                      filteredProducts.map((p) => {
                        const isSelected = Array.isArray(formData.applicableProductIds) && formData.applicableProductIds.includes(p._id);
                        const imageSrc =
                          p.productImages?.[0] ||
                          p.productImage?.[0] ||
                          p.mainImage ||
                          (typeof p.images?.[0] === 'string' ? p.images[0] : null) ||
                          p.nonVariant?.nonVariantImages?.[0];

                        const rawPrice =
                          (typeof p.price === 'number' ? p.price : null) ??
                          (typeof p.price?.salePrice === 'number' ? p.price.salePrice : null) ??
                          (typeof p.pricing?.salePrice === 'number' ? p.pricing.salePrice : null) ??
                          (typeof p.salePrice === 'number' ? p.salePrice : null) ??
                          (typeof p.basePrice === 'number' ? p.basePrice : null) ??
                          (typeof p.nonVariant?.price?.salePrice === 'number' ? p.nonVariant.price.salePrice : null) ??
                          0;
                        const price = typeof rawPrice === 'object' ? (rawPrice?.salePrice ?? 0) : rawPrice;

                        const sku =
                          (typeof p.sku === 'string' && p.sku ? p.sku : "") ||
                          (typeof p.inventory?.sku === 'string' ? p.inventory.sku : "") ||
                          (typeof p.inventory?.productCode === 'string' ? p.inventory.productCode : "") ||
                          (typeof p.nonVariant?.skuCode === 'string' ? p.nonVariant.skuCode : "");

                        return (
                          <div
                            key={p._id}
                            onClick={() => handleProductToggle(p._id)}
                            className={`p-2.5 flex items-center justify-between hover:bg-emerald-50/50 cursor-pointer transition-colors ${
                              isSelected ? "bg-emerald-50/70" : ""
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}} // Handled by parent div onClick
                                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4 pointer-events-none"
                              />
                              {imageSrc && (
                                <img
                                  src={imageSrc}
                                  alt={p.productName || "Product"}
                                  className="w-9 h-9 rounded object-cover border"
                                />
                              )}
                              <div>
                                <p className="text-sm font-medium text-gray-900 leading-snug">
                                  {p.productName || p.productTitle || p.title || "Unnamed Product"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {sku ? `SKU: ${sku} • ` : ""}₹{price}
                                </p>
                              </div>
                            </div>
                            {isSelected && (
                              <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                                Selected
                              </span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}

            {/* C. CONDITIONAL ELIGIBILITY: Cart Conditions & Categories */}
            {formData.applicabilityType === "CONDITIONAL" && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Subtotal Required (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.conditions.minSubtotal}
                      onChange={(e) => {
                        handleConditionChange("minSubtotal", e.target.value);
                        setFormData(prev => ({ ...prev, minPurchaseAmount: Number(e.target.value) }));
                      }}
                      min="0"
                      className="border rounded-lg p-2.5 w-full bg-white text-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="e.g. 500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Cart subtotal of eligible items must reach this value.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Eligible Item Quantity
                    </label>
                    <input
                      type="number"
                      value={formData.conditions.minQuantity}
                      onChange={(e) => handleConditionChange("minQuantity", e.target.value)}
                      min="0"
                      className="border rounded-lg p-2.5 w-full bg-white text-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="e.g. 2"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Cart must contain at least this many eligible items.
                    </p>
                  </div>
                </div>

                {/* Category Restrictions */}
                {categories.length > 0 && (
                  <div className="pt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Restricted to Specific Categories (Optional)
                    </label>
                    <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2 bg-white rounded-lg border">
                      {categories.map((cat) => {
                        const isCatSelected = Array.isArray(formData.applicableCategories) && formData.applicableCategories.includes(cat._id);
                        return (
                          <button
                            type="button"
                            key={cat._id}
                            onClick={() => handleCategoryToggle(cat._id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer border flex items-center gap-1.5 ${
                              isCatSelected
                                ? "bg-emerald-700 text-white border-emerald-700"
                                : "bg-gray-50 text-gray-700 border-gray-200 hover:border-emerald-300"
                            }`}
                          >
                            {isCatSelected && <FaCheck size={10} />}
                            {cat.categoryTitle || cat.categoryName || cat.name || cat._id}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {(formData.applicableCategories || []).length === 0
                        ? "No category restrictions. Applies to all categories."
                        : `Selected ${(formData.applicableCategories || []).length} categories.`}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Common Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="w-full mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Minimum Purchase Amount (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="minPurchaseAmount"
                placeholder="Minimum Purchase Amount"
                className="border rounded-lg p-2.5 w-full text-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                onChange={(e) => {
                  handleInputChange(e);
                  handleConditionChange("minSubtotal", e.target.value);
                }}
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
                className="border rounded-lg p-2.5 w-full text-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                onChange={handleInputChange}
                value={formData.usageLimit}
                min="1"
                required
              />
            </div>
          </div>

          <div className="w-full mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Message / Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="message"
              placeholder="e.g. Get 15% off on your order over ₹499"
              className="border rounded-lg p-2.5 w-full text-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none"
              onChange={handleInputChange}
              value={formData.message}
              rows={3}
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
                className="border rounded-lg p-2.5 w-full text-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none"
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
                className="border rounded-lg p-2.5 w-full text-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none"
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
                className="border rounded-lg p-2.5 w-full text-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                onChange={handleInputChange}
                value={formData.repeatUsage}
                required
              >
                <option value="allowed">Allowed (Multiple orders per customer)</option>
                <option value="notAllowed">Not Allowed (Single use per customer)</option>
              </select>
            </div>

            <div className="flex items-center mb-4 sm:pt-6">
              <label className="flex items-center space-x-3 cursor-pointer">
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
                <span className="text-sm font-medium text-gray-700">
                  First Order Only Coupon (New Customers)
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-center mb-6">
            <label className="flex items-center space-x-2 cursor-pointer">
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
              <span className="text-sm font-medium text-gray-700">
                Coupon Status
              </span>
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="mt-8 flex justify-end gap-3 border-t pt-4">
          <button
            type="button"
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition cursor-pointer text-sm font-medium"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-2.5 rounded-xl transition cursor-pointer disabled:bg-opacity-50 text-sm font-semibold shadow-sm shadow-emerald-700/20"
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