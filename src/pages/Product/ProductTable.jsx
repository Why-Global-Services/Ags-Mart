import React, { useState, useEffect, useMemo } from "react";
import { FaEye, FaEdit, FaTrashAlt, FaDownload, FaPlus } from "react-icons/fa";
import DataTable from "react-data-table-component";
import { Modal, Button, Switch } from "antd";
import { useNavigate } from "react-router-dom";
import {
  getAllProduct,
  updateProductStatus,
  // deleteProduct,
} from "../../services/Products";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";

const Product = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [variantFilter, setVariantFilter] = useState("all");
  const [productToView, setProductToView] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  // Filter states
  const [filterType, setFilterType] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getAllProduct();
      setProducts(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Extract unique categories and subcategories
  const categories = useMemo(() => {
    return [
      ...new Set(
        products.map((product) => product.productCategory).filter(Boolean)
      ),
    ];
  }, [products]);

  const subCategories = useMemo(() => {
    return [
      ...new Set(
        products.map((product) => product.productSubCategory).filter(Boolean)
      ),
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((product) => product.status === filterStatus);
    }

    // Variant filter
    if (variantFilter === "variation") {
      filtered = filtered.filter(
        (product) =>
          product.productType === "variation" &&
          Array.isArray(product.varient) &&
          product.varient.length > 0
      );
    } else if (variantFilter === "nonVariation") {
      filtered = filtered.filter(
        (product) =>
          product.productType === "nonVariation" &&
          Array.isArray(product.nonVarient) &&
          product.nonVarient.length > 0
      );
    }

    // Apply selected filter
    if (filterType && filterValue) {
      if (filterType === "category") {
        filtered = filtered.filter(
          (product) =>
            product.productCategory?.toLowerCase() === filterValue.toLowerCase()
        );
      } else if (filterType === "subcategory") {
        filtered = filtered.filter(
          (product) =>
            product.productSubCategory?.toLowerCase() ===
            filterValue.toLowerCase()
        );
      } else if (filterType === "stock") {
        filtered = [...filtered].sort((a, b) => {
          const stockA =
            Array.isArray(a.varient) && a.varient.length > 0
              ? a.varient.reduce(
                  (total, v) => total + Number(v.stockCount || 0),
                  0
                )
              : Array.isArray(a.nonVarient)
              ? a.nonVarient.reduce(
                  (total, v) => total + Number(v.stockCount || 0),
                  0
                )
              : 0;
          const stockB =
            Array.isArray(b.varient) && b.varient.length > 0
              ? b.varient.reduce(
                  (total, v) => total + Number(v.stockCount || 0),
                  0
                )
              : Array.isArray(b.nonVarient)
              ? b.nonVarient.reduce(
                  (total, v) => total + Number(v.stockCount || 0),
                  0
                )
              : 0;
          return filterValue === "highToLow"
            ? stockB - stockA
            : stockA - stockB;
        });
      } else if (filterType === "price") {
        filtered = [...filtered].sort((a, b) => {
          const priceA =
            Number(
              a.nonVarient?.[0]?.price?.salePrice ||
                a.varient?.[0]?.price?.salePrice ||
                0
            ) || 0;
          const priceB =
            Number(
              b.nonVarient?.[0]?.price?.salePrice ||
                b.varient?.[0]?.price?.salePrice ||
                0
            ) || 0;
          return filterValue === "highToLow"
            ? priceB - priceA
            : priceA - priceB;
        });
      }
    }

    // Search filter
if (searchTerm.trim()) {
  const term = searchTerm.toLowerCase();

  filtered = filtered.filter((product) =>
    [
      product.productName,
      product.productTitle,
      product.productCategory,
      product.productSubCategory,
      ...(product.searchTags || []),
    ]
      .filter(Boolean)
      .some((field) =>
        field.toString().toLowerCase().includes(term)
      )
  );
}


    return filtered;
  }, [
  products,
  filterStatus,
  variantFilter,
  filterType,
  filterValue,
  searchTerm, // 👈 ADD THIS
]);

  const filterProducts = (status) => {
    setFilterStatus(status);
    setActiveTab(status);
  };

  const handleVariantFilterChange = (e) => {
    setVariantFilter(e.target.value);
  };

  const toggleModal = (product) => {
    setProductToView(product);
    setIsOpen(true);
  };

  // const handleDeleteProduct = async (id) => {
  //   try {
  //     await deleteProduct(id);
  //     setProducts(products.filter((product) => product._id !== id));
  //     toast.success("Product deleted successfully");
  //     setShowDeleteModal(false);
  //   } catch (error) {
  //     toast.error(error.response?.data?.message || "Failed to delete product");
  //     console.error("Error deleting product:", error);
  //   }
  // };

  const handleToggleChange = async (productId, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      await updateProductStatus(productId, "status", newStatus);
      setProducts(
        products.map((product) =>
          product._id === productId
            ? { ...product, status: newStatus }
            : product
        )
      );
      toast.success("Status updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
      console.error("Error updating product status:", error);
    }
  };

  const handleEditClick = (product) => {
  navigate("/productForm", {
    state: {
      product,
      isUpdate: true,
    },
  });
};

  const handleAddProductClick = () => {
    navigate("/productForm");
  };

  // 🔽 EXPORT WITH FULL PRODUCT DETAILS
  const handleExportToExcel = () => {
    // use filteredProducts to export only what is currently filtered
    // 👉 if you want ALL products always, change `filteredProducts` to `products`
    const exportData = filteredProducts.map((product, index) => {
      const isVariant = product.productType === "variant";
      const isNonVariant = product.productType === "nonVariant";

      // Total stock (similar logic as table)
      let totalStock = 0;
      if (isVariant && product.variant) {
        if (Array.isArray(product.variant.sizeOnlyVariants)) {
          totalStock += product.variant.sizeOnlyVariants.reduce(
            (sum, v) => sum + Number(v.stockCount || 0),
            0
          );
        }
        if (Array.isArray(product.variant.colorOnlyVariants)) {
          totalStock += product.variant.colorOnlyVariants.reduce(
            (sum, v) => sum + Number(v.stockCount || 0),
            0
          );
        }
        if (Array.isArray(product.variant.sizeColorVariants)) {
          totalStock += product.variant.sizeColorVariants.reduce(
            (sum, v) => sum + Number(v.stockCount || 0),
            0
          );
        }
      } else if (isNonVariant && product.nonVariant) {
        totalStock = Number(product.nonVariant.stockCount || 0);
      }

      // Price details from first variant or nonVariant
      let costPrice = 0;
      let salePrice = 0;
      let discount = 0;
      let tax = 0;

      if (isVariant && product.variant) {
        const firstVariant =
          product.variant.sizeOnlyVariants?.[0] ||
          product.variant.colorOnlyVariants?.[0] ||
          product.variant.sizeColorVariants?.[0];

        if (firstVariant?.price) {
          costPrice = Number(firstVariant.price.costPrice || 0);
          salePrice = Number(firstVariant.price.salePrice || 0);
          discount = Number(firstVariant.price.discount || 0);
          tax = Number(firstVariant.price.tax || 0);
        }
      } else if (isNonVariant && product.nonVariant?.price) {
        costPrice = Number(product.nonVariant.price.costPrice || 0);
        salePrice = Number(product.nonVariant.price.salePrice || 0);
        discount = Number(product.nonVariant.price.discount || 0);
        tax = Number(product.nonVariant.price.tax || 0);
      }

      // Ingredients (support both productIngrediants & ingredients)
      let ingredientsArray = [];
      if (Array.isArray(product.productIngrediants)) {
        ingredientsArray = ingredientsArray.concat(product.productIngrediants);
      }
      if (Array.isArray(product.ingredients)) {
        ingredientsArray = ingredientsArray.concat(product.ingredients);
      }
      const ingredients = ingredientsArray.length
        ? [...new Set(ingredientsArray)].join(", ")
        : "";

      // Usage
      const usage = product.productUsage || product.usage || "";

      // Search tags
      const searchTags =
        Array.isArray(product.searchTags) && product.searchTags.length > 0
          ? product.searchTags.join(", ")
          : "";

      // Related products
      const relatedProducts =
        Array.isArray(product.relatedProducts) &&
        product.relatedProducts.length > 0
          ? product.relatedProducts
              .map((item) =>
                typeof item === "string"
                  ? item
                  : item.productName ||
                    item.productTitle ||
                    item.name ||
                    ""
              )
              .filter(Boolean)
              .join(", ")
          : "";

      return {
        "S.No": index + 1,
        "Product Name": product.productName || product.productTitle || "-",
        "Category": product.productCategory || "-",
        "Sub Category": product.productSubCategory || "-",
        "Product Type": product.productType || "-",
        "Stock": totalStock || 0,
        "Cost Price": costPrice,
        "Sale Price": salePrice,
        "Discount (%)": discount,
        "Tax (%)": tax,
        "Ingredients": ingredients || "-",
        "Usage": usage || "-",
        "Search Tags": searchTags || "-",
        "Related Products": relatedProducts || "-",
        "Status": product.status || "-",
        "Created At": product.createdAt
          ? new Date(product.createdAt).toLocaleString()
          : "-",
        "Updated At": product.updatedAt
          ? new Date(product.updatedAt).toLocaleString()
          : "-",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    XLSX.writeFile(workbook, "Products_Export.xlsx");
  };

  const handleFilterTypeChange = (e) => {
    setFilterType(e.target.value);
    setFilterValue("");
  };

  const resetFilters = () => {
    setFilterType("");
    setFilterValue("");
    setVariantFilter("all");
  };

  // DataTable customStyles
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

  const columns = [
    {
      name: "S.No",
      cell: (row, index) =>
        (currentPage - 1) * rowsPerPage + index + 1,
      width: "6%",
    },
    {
      name: "Image",
      cell: (row) => (
        <div className="flex items-center justify-center">
          {Array.isArray(row.productImages) &&
          row.productImages.length > 0 ? (
            <img
              src={row.productImages[0]}
              alt={row.productName || "Product"}
              className="w-10 h-10 object-cover rounded-md"
            />
          ) : (
            <div className="w-6 h-6 bg-gray-100 flex items-center justify-center rounded-md">
              -
            </div>
          )}
        </div>
      ),
    },
    {
      name: "Product",
      selector: (row) => row.productName || "-",
    },
    {
      name: "Category",
      selector: (row) => row.productCategory || "-",
    },
    {
      name: "Stock",
      selector: (row) => {
        let totalStock = 0;

        if (row.productType === "variant") {
          if (Array.isArray(row.variant?.sizeOnlyVariants)) {
            totalStock += row.variant.sizeOnlyVariants.reduce(
              (sum, v) => sum + Number(v.stockCount || 0),
              0
            );
          }
          if (Array.isArray(row.variant?.colorOnlyVariants)) {
            totalStock += row.variant.colorOnlyVariants.reduce(
              (sum, v) => sum + Number(v.stockCount || 0),
              0
            );
          }
          if (Array.isArray(row.variant?.sizeColorVariants)) {
            totalStock += row.variant.sizeColorVariants.reduce(
              (sum, v) => sum + Number(v.stockCount || 0),
              0
            );
          }
        }
        if (row.productType === "nonVariant") {
          totalStock = row.nonVariant?.stockCount || 0;
        }

        return totalStock || 0;
      },
    },
    {
      name: "Price",
      selector: (row) => {
        let price = 0;

        if (row.productType === "variant") {
          const v =
            row.variant?.sizeOnlyVariants?.[0] ||
            row.variant?.colorOnlyVariants?.[0] ||
            row.variant?.sizeColorVariants?.[0];

          price = v?.price?.salePrice || 0;
        }

        if (row.productType === "nonVariant") {
          price = row.nonVariant?.price?.salePrice || 0;
        }

        return `₹${Number(price).toFixed(2)}`;
      },
    },
    {
      name: "Status",
      cell: (row) => (
        <div className="flex justify-center">
          <Switch
            checked={row.status === "active"}
            onChange={() =>
              handleToggleChange(row._id, row.status)
            }
            checkedChildren="Active"
            unCheckedChildren="Inactive"
            aria-label={`Toggle status for ${
              row.productName || "product"
            }`}
            size="small"
          />
        </div>
      ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex justify-center space-x-1">
          <button
            onClick={() => toggleModal(row)}
            className="bg-gray-100 text-gray-800 p-1 rounded cursor-pointer hover:bg-gray-200"
            aria-label={`View details for ${
              row.productName || "product"
            }`}
          >
            <FaEye size={14} />
          </button>
          <button
            onClick={() => handleEditClick(row)}
            className="bg-orange-100 text-orange-600 p-1 rounded hover:bg-orange-200 cursor-pointer"
            aria-label={`Edit ${row.productName || "product"}`}
          >
            <FaEdit size={14} />
          </button>
          {/* <button
            onClick={() => setShowDeleteModal(row._id)}
            className="bg-red-100 text-red-600 p-1 rounded hover:bg-red-200 cursor-pointer"
            aria-label={`Delete ${row.productName || "product"}`}
          >
            <FaTrashAlt size={14} />
          </button> */}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen font-content">
      <div className="bg-white min-h-[calc(100vh-100px)] p-6 shadow-md rounded-md">
        <div className="flex flex-row justify-between items-center gap-4 flex-wrap px-8">
          <h2 className="mt-3 ms-2 text-2xl font-semibold text-gray-800 flex-shrink-0 w-48">
            Products
          </h2>
          <div className="flex gap-2 items-center flex-wrap mb-5">
            {/* FIRST SELECT */}
            <select
              className="w-48 h-10 px-3 cursor-pointer rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={filterType}
              onChange={handleFilterTypeChange}
            >
              <option value="">Select Filter</option>
              <option value="category">Category</option>
              <option value="subcategory">Subcategory</option>
              <option value="stock">Stock</option>
              <option value="price">Price</option>
            </select>

            {/* SECOND SELECT */}
            {filterType && (
              <select
                className="w-48 h-10 px-3 cursor-pointer rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
              >
                {filterType === "category" && (
                  <>
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </>
                )}

                {filterType === "subcategory" && (
                  <>
                    <option value="">Select Subcategory</option>
                    {subCategories.map((subcategory) => (
                      <option key={subcategory} value={subcategory}>
                        {subcategory}
                      </option>
                    ))}
                  </>
                )}

                {filterType === "stock" && (
                  <>
                    <option value="">Select Order</option>
                    <option value="highToLow">High to Low</option>
                    <option value="lowToHigh">Low to High</option>
                  </>
                )}

                {filterType === "price" && (
                  <>
                    <option value="">Select Order</option>
                    <option value="highToLow">High to Low</option>
                    <option value="lowToHigh">Low to High</option>
                  </>
                )}
              </select>
            )}

            <button
              onClick={resetFilters}
              className="w-48 h-10 bg-table text-white cursor-pointer px-4 rounded-md hover:bg-secondary transition duration-300 text-sm font-medium"
            >
              Reset
            </button>

            <select
              className="w-48 h-10 px-3 rounded-md cursor-pointer border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={variantFilter}
              onChange={handleVariantFilterChange}
            >
              <option value="all">All Products</option>
              <option value="variation">Variant Products</option>
              <option value="nonVariation">Simple Products</option>
            </select>

            <input
  type="text"
  placeholder="Search products..."
  value={searchTerm}
  onChange={(e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // reset pagination on search
  }}
  className="w-48 h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
/>

          </div>
        </div>

        

        <div className="mb-6 px-8">
          <div className="flex">
            <button
              className={`cursor-pointer px-4 py-2 font-medium  ${
                activeTab === "all"
                  ? "text-secondary border-b-2 border-secondary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => filterProducts("all")}
              aria-label="Show all products"
            >
              All
            </button>
            <button
              className={`cursor-pointer px-4 py-2 font-medium ${
                activeTab === "active"
                  ? "text-secondary border-b-2 border-secondary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => filterProducts("active")}
              aria-label="Show active products"
            >
              Active
            </button>
            <button
              className={`cursor-pointer px-4 py-2 font-medium ${
                activeTab === "inactive"
                  ? "text-secondary border-b-2 border-secondary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => filterProducts("inactive")}
              aria-label="Show inactive products"
            >
              Inactive
            </button>
            <div className="flex gap-2 ms-auto">
              {/* Add Product Button */}
              <button
                onClick={handleAddProductClick}
                className="flex items-center cursor-pointer justify-center w-10 h-10 rounded-full bg-white border border-gray-300 hover:bg-green-100 hover:border-green-500 transition-all duration-300 shadow-sm"
                title="Add Product"
              >
                <FaPlus className="text-secondary hover:text-green-600 w-4 h-4" />
              </button>

              {/* Export to Excel Button */}
              <button
                onClick={handleExportToExcel}
                className="flex items-center cursor-pointer justify-center w-10 h-10 rounded-full bg-white border border-gray-300 hover:bg-green-100 hover:border-green-500 transition-all duration-300 shadow-sm"
                title="Export to Excel"
              >
                <FaDownload className="text-secondary hover:text-green-600 w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="w-full overflow-x-auto px-8">
          <DataTable
            columns={columns}
            data={filteredProducts}
            noWrap={false}
            pagination
            paginationPerPage={rowsPerPage}
            paginationDefaultPage={currentPage}
            onChangePage={(page) => setCurrentPage(page)}
            onChangeRowsPerPage={(newPerPage, page) => {
              setRowsPerPage(newPerPage);
              setCurrentPage(page);
            }}
            fixedHeaderScrollHeight="600px"
            customStyles={customStyles}
            highlightOnHover
            responsive
            progressPending={loading}
            className="bg-white rounded shadow"
            noDataComponent={
              <div className="p-4 text-center">No products found</div>
            }
          />
        </div>
      </div>

      {/* PRODUCT DETAILS MODAL */}
      <Modal
        title="Product Details"
        open={isOpen}
        onCancel={() => setIsOpen(false)}
        footer={[
          <Button
            key="close"
            onClick={() => setIsOpen(false)}
            className="bg-indigo-600 text-white hover:bg-indigo-700"
            aria-label="Close product details"
          >
            Close
          </Button>,
        ]}
        width={800}
        className="rounded-lg shadow-xl"
      >
        {productToView && (
          <div className="space-y-4 p-4">
            {/* Images */}
            <div>
              <h3 className="font-semibold mb-2">Product Images</h3>

              {Array.isArray(productToView.productImages) &&
              productToView.productImages.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {productToView.productImages.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Product Image ${index + 1}`}
                      className="w-32 h-32 object-contain rounded-md"
                    />
                  ))}
                </div>
              ) : (
                <div className="w-full h-32 bg-gray-100 flex items-center justify-center rounded-md">
                  No Product Images Available
                </div>
              )}
            </div>

            {/* Variant or Non-Variant Details */}
            <div className="space-y-4">
              {productToView.productType === "variant" ? (
                Array.isArray(productToView?.variant?.sizeOnlyVariants) &&
                productToView.variant.sizeOnlyVariants.length > 0 ? (
                  productToView.variant.sizeOnlyVariants.map(
                    (variant, index) => (
                      <div
                        key={index}
                        className="space-y-4 border-b pb-4 mb-4"
                      >
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="w-full md:w-1/3">
                            <div className="space-y-2">
                              <h3 className="font-semibold">
                                Variant {index + 1} Image
                              </h3>

                              {variant.variantImages?.length > 0 ? (
                                <img
                                  src={variant.variantImages[0]}
                                  alt={`Variant Image ${index + 1}`}
                                  className="w-full h-32 object-contain rounded-lg shadow-xl"
                                />
                              ) : (
                                <div className="w-full h-32 bg-gray-100 flex items-center justify-center rounded-md">
                                  No Variant Image
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="w-full md:w-2/3 space-y-2">
                            <h2 className="text-2xl font-bold">
                              Variant {index + 1}:{" "}
                              {productToView.productTitle}
                            </h2>
                            <p className="text-gray-600">
                              {productToView.productDescription || "-"}
                            </p>
                          </div>
                        </div>

                        {/* Variant Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h3 className="font-semibold">Category</h3>
                            <p>{productToView.productCategory || "-"}</p>
                          </div>

                          <div>
                            <h3 className="font-semibold">Sub Category</h3>
                            <p>{productToView.productSubCategory || "-"}</p>
                          </div>

                          <div>
                            <h3 className="font-semibold">Stock Count</h3>
                            <p>{variant.stockCount || "-"}</p>
                          </div>

                          <div>
                            <h3 className="font-semibold">Product Type</h3>
                            <p>{productToView.productType || "-"}</p>
                          </div>

                          <div>
                            <h3 className="font-semibold">Variation</h3>
                            <p>SKU: {variant.skuCode || "-"}</p>
                          </div>

                          <div>
                            <h3 className="font-semibold">Cost Price</h3>
                            <p>₹{variant.price?.costPrice ?? "0"}</p>
                          </div>

                          <div>
                            <h3 className="font-semibold">Sale Price</h3>
                            <p>₹{variant.price?.salePrice ?? "0"}</p>
                          </div>

                          <div>
                            <h3 className="font-semibold">Discount</h3>
                            <p>{variant.price?.discount ?? "0"}%</p>
                          </div>

                          <div>
                            <h3 className="font-semibold">Tax</h3>
                            <p>{variant.price?.tax ?? "0"}%</p>
                          </div>

                          {/* Ingredients */}
                          <div>
                            <h3 className="font-semibold">Ingredients</h3>
                            <p>
                              {Array.isArray(
                                productToView.productIngrediants
                              ) &&
                              productToView.productIngrediants.length > 0
                                ? productToView.productIngrediants.join(", ")
                                : "-"}
                            </p>
                          </div>

                          {/* Usage */}
                          <div>
                            <h3 className="font-semibold">Usage</h3>
                            <p>
                              {productToView.productUsage ||
                                productToView.usage ||
                                "-"}
                            </p>
                          </div>

                          {/* Search Tags */}
                          <div>
                            <h3 className="font-semibold">Search Tags</h3>
                            <p>
                              {Array.isArray(productToView.searchTags) &&
                              productToView.searchTags.length > 0
                                ? productToView.searchTags.join(", ")
                                : "-"}
                            </p>
                          </div>

                          {/* Related Products */}
                          <div>
                            <h3 className="font-semibold">
                              Related Products
                            </h3>
                            <p>
                              {Array.isArray(
                                productToView.relatedProducts
                              ) &&
                              productToView.relatedProducts.length > 0
                                ? productToView.relatedProducts
                                    .map((item) =>
                                      typeof item === "string"
                                        ? item
                                        : item.productName ||
                                          item.productTitle ||
                                          item.name ||
                                          ""
                                    )
                                    .filter(Boolean)
                                    .join(", ")
                                : "-"}
                            </p>
                          </div>

                          <div>
                            <h3 className="font-semibold">Created At</h3>
                            <p>
                              {productToView.createdAt
                                ? new Date(
                                    productToView.createdAt
                                  ).toLocaleString()
                                : "-"}
                            </p>
                          </div>

                          <div>
                            <h3 className="font-semibold">Updated At</h3>
                            <p>
                              {productToView.updatedAt
                                ? new Date(
                                    productToView.updatedAt
                                  ).toLocaleString()
                                : "-"}
                            </p>
                          </div>
                        </div>

                        {/* Pills for Ingredients (optional extra UI) */}
                        {Array.isArray(productToView.ingredients) &&
                          productToView.ingredients.length > 0 && (
                            <div className="mt-4">
                              <h3 className="font-semibold">
                                Key Ingredients
                              </h3>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {productToView.ingredients.map(
                                  (ingredient, index) => (
                                    <span
                                      key={index}
                                      className="bg-pink-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                                    >
                                      {ingredient}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {/* Category Details */}
                        {productToView.categoryDetails && (
                          <div className="mt-4">
                            <h3 className="font-semibold">
                              Category Details
                            </h3>
                            <p>
                              <strong>Title:</strong>{" "}
                              {productToView.categoryDetails.categoryTitle ||
                                "-"}
                            </p>
                            <p>
                              <strong>Description:</strong>{" "}
                              {productToView.categoryDetails
                                .categoryDescription || "-"}
                            </p>
                            {productToView.categoryDetails.categoryImage && (
                              <img
                                src={
                                  productToView.categoryDetails.categoryImage
                                }
                                alt="Category Image"
                                className="w-32 h-32 object-contain rounded-md mt-2"
                              />
                            )}
                          </div>
                        )}

                        {/* Subcategory Details */}
                        {productToView.subCategoryDetails && (
                          <div className="mt-4">
                            <h3 className="font-semibold">
                              Subcategory Details
                            </h3>
                            <p>
                              <strong>Title:</strong>{" "}
                              {productToView.subCategoryDetails
                                .subCategoryTitle || "-"}
                            </p>
                            <p>
                              <strong>Description:</strong>{" "}
                              {productToView.subCategoryDetails
                                .subCategoryDescription || "-"}
                            </p>
                            {productToView.subCategoryDetails
                              .subCategoryImage && (
                              <img
                                src={
                                  productToView.subCategoryDetails
                                    .subCategoryImage
                                }
                                alt="Subcategory Image"
                                className="w-32 h-32 object-contain rounded-md mt-2"
                              />
                            )}
                          </div>
                        )}

                        {/* Reviews */}
                        {Array.isArray(productToView.productReviews) &&
                          productToView.productReviews.length > 0 && (
                            <div className="mt-4">
                              <h3 className="font-semibold">
                                Product Reviews
                              </h3>
                              {productToView.productReviews.map(
                                (review, index) => (
                                  <div
                                    key={index}
                                    className="border-t pt-2 mt-2"
                                  >
                                    <p>
                                      <strong>Rating:</strong>{" "}
                                      {review.rating || "-"} / 5
                                    </p>
                                    <p>
                                      <strong>Review:</strong>{" "}
                                      {review.review || "-"}
                                    </p>
                                    <p>
                                      <strong>Created At:</strong>{" "}
                                      {review.createdAt
                                        ? new Date(
                                            review.createdAt
                                          ).toLocaleString()
                                        : "-"}
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                      </div>
                    )
                  )
                ) : (
                  <p>No variants available for this product.</p>
                )
              ) : (
                // NON-VARIANT PRODUCT
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/3">
                      <div className="space-y-2">
                        <h3 className="font-semibold">Product Image</h3>

                        {Array.isArray(productToView.productImages) &&
                        productToView.productImages.length > 0 ? (
                          <img
                            src={productToView.nonVariant.nonVariantImages[0]}
                            alt="Product Image"
                            className="w-full h-32 object-contain rounded-md"
                          />
                        ) : (
                          <div className="w-full h-32 bg-gray-100 flex items-center justify-center rounded-md">
                            No Product Image Available
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="w-full md:w-2/3 space-y-2">
                      <h2 className="text-2xl font-bold">
                        {productToView.nonVariant?.[0]?.productTitle ||
                          productToView.productTitle ||
                          "-"}
                      </h2>
                      <p className="text-gray-600">
                        {productToView.productDescription || "-"}
                      </p>
                    </div>
                  </div>

                  {/* Non-variant details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold">Category</h3>
                      <p>{productToView.productCategory || "-"}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold">Sub Category</h3>
                      <p>{productToView.productSubCategory || "-"}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold">Stock Count</h3>
                      <p>
                        {Array.isArray(productToView.nonVariant)
                          ? productToView.nonVariant.reduce(
                              (total, v) => total + (v.stockCount || 0),
                              0
                            )
                          : productToView.nonVariant?.stockCount ?? "-"}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold">Product Type</h3>
                      <p>{productToView.productType || "-"}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold">Cost Price</h3>
                      <p>
                        ₹
                        {productToView.nonVariant?.price?.costPrice ??
                          "0"}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold">Sale Price</h3>
                      <p>
                        ₹
                        {productToView.nonVariant?.price?.salePrice ?? "0"}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold">Discount</h3>
                      <p>
                        {productToView.nonVariant?.price?.discount ??
                          "0"}
                        %
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold">Tax</h3>
                      <p>
                        {productToView.nonVariant?.price?.tax ?? "0"}%
                      </p>
                    </div>

                    {/* Ingredients */}
                    <div>
                      <h3 className="font-semibold">Ingredients</h3>
                      <p>
                        {Array.isArray(
                          productToView.productIngrediants
                        ) && productToView.productIngrediants.length > 0
                          ? productToView.productIngrediants.join(", ")
                          : "-"}
                      </p>
                    </div>

                    {/* Usage */}
                    <div>
                      <h3 className="font-semibold">Usage</h3>
                      <p>
                        {productToView.productUsage ||
                          productToView.usage ||
                          "-"}
                      </p>
                    </div>

                    {/* Search Tags */}
                    <div>
                      <h3 className="font-semibold">Search Tags</h3>
                      <p>
                        {Array.isArray(productToView.searchTags) &&
                        productToView.searchTags.length > 0
                          ? productToView.searchTags.join(", ")
                          : "-"}
                      </p>
                    </div>

                    {/* Related Products */}
                    <div>
                      <h3 className="font-semibold">Related Products</h3>
                      <p>
                        {Array.isArray(productToView.relatedProducts) &&
                        productToView.relatedProducts.length > 0
                          ? productToView.relatedProducts
                              .map((item) =>
                                typeof item === "string"
                                  ? item
                                  : item.productName ||
                                    item.productTitle ||
                                    item.name ||
                                    ""
                              )
                              .filter(Boolean)
                              .join(", ")
                          : "-"}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold">Created At</h3>
                      <p>
                        {productToView.createdAt
                          ? new Date(
                              productToView.createdAt
                            ).toLocaleString()
                          : "-"}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold">Updated At</h3>
                      <p>
                        {productToView.updatedAt
                          ? new Date(
                              productToView.updatedAt
                            ).toLocaleString()
                          : "-"}
                      </p>
                    </div>
                  </div>

                  {/* Optional ingredient pill section */}
                  {Array.isArray(productToView.ingredients) &&
                    productToView.ingredients.length > 0 && (
                      <div className="mt-4">
                        <h3 className="font-semibold">Key Ingredients</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {productToView.ingredients.map(
                            (ingredient, index) => (
                              <span
                                key={index}
                                className="bg-pink-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                              >
                                {ingredient}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Category */}
                  {productToView.categoryDetails && (
                    <div className="mt-4">
                      <h3 className="font-semibold">Category Details</h3>
                      <p>
                        <strong>Title:</strong>{" "}
                        {productToView.categoryDetails.categoryTitle || "-"}
                      </p>
                      <p>
                        <strong>Description:</strong>{" "}
                        {productToView.categoryDetails.categoryDescription ||
                          "-"}
                      </p>
                      {productToView.categoryDetails.categoryImage && (
                        <img
                          src={productToView.categoryDetails.categoryImage}
                          alt="Category Image"
                          className="w-32 h-32 object-contain rounded-md mt-2"
                        />
                      )}
                    </div>
                  )}

                  {/* Subcategory */}
                  {productToView.subCategoryDetails && (
                    <div className="mt-4">
                      <h3 className="font-semibold">
                        Subcategory Details
                      </h3>
                      <p>
                        <strong>Title:</strong>{" "}
                        {productToView.subCategoryDetails.subCategoryTitle ||
                          "-"}
                      </p>
                      <p>
                        <strong>Description:</strong>{" "}
                        {productToView.subCategoryDetails
                          .subCategoryDescription || "-"}
                      </p>
                      {productToView.subCategoryDetails.subCategoryImage && (
                        <img
                          src={
                            productToView.subCategoryDetails.subCategoryImage
                          }
                          alt="Subcategory Image"
                          className="w-32 h-32 object-contain rounded-md mt-2"
                        />
                      )}
                    </div>
                  )}

                  {/* Reviews */}
                  {Array.isArray(productToView.productReviews) &&
                    productToView.productReviews.length > 0 && (
                      <div className="mt-4">
                        <h3 className="font-semibold">
                          Product Reviews
                        </h3>
                        {productToView.productReviews.map((review, i) => (
                          <div key={i} className="border-t pt-2 mt-2">
                            <p>
                              <strong>Rating:</strong>{" "}
                              {review.rating || "-"} / 5
                            </p>
                            <p>
                              <strong>Review:</strong>{" "}
                              {review.review || "-"}
                            </p>
                            <p>
                              <strong>Created At:</strong>{" "}
                              {review.createdAt
                                ? new Date(
                                    review.createdAt
                                  ).toLocaleString()
                                : "-"}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        title="Confirm Delete"
        open={Boolean(showDeleteModal)}
        onOk={() => handleDeleteProduct(showDeleteModal)}
        onCancel={() => setShowDeleteModal(false)}
        footer={[
          <Button
            key="back"
            onClick={() => setShowDeleteModal(false)}
            aria-label="Cancel delete"
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger
            onClick={() => handleDeleteProduct(showDeleteModal)}
            aria-label="Confirm delete product"
          >
            Delete
          </Button>,
        ]}
        className="rounded-lg shadow-xl"
      >
        <p>Are you sure you want to delete this product?</p>
      </Modal>
    </div>
  );
};

export default Product;















  {/* {productToView && (
          <div className="space-y-4 p-4">
            <div>
              <h3 className="font-semibold mb-2">Product Images</h3>
              {Array.isArray(productToView.productImage) &&
              productToView.productImage.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {productToView.productImage.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Product Image ${index + 1}`}
                      className="w-32 h-32 object-contain rounded-md"
                    />
                  ))}
                </div>
              ) : (
                <div className="w-full h-32 bg-gray-100 flex items-center justify-center rounded-md">
                  No Product Images Available
                </div>
              )}
            </div>

            <div className="space-y-4">
              {productToView.productType === "variation" ? (
                Array.isArray(productToView.varient) &&
                productToView.varient.length > 0 ? (
                  productToView.varient.map((variant, index) => (
                    <div key={index} className="space-y-4 border-b pb-4 mb-4">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-1/3">
                          <div className="space-y-2">
                            <h3 className="font-semibold">
                              Variant {index + 1} Image
                            </h3>
                            {variant.varientImage ? (
                              <img
                                src={variant.varientImage}
                                alt={`Variant Image ${index + 1}`}
                                className="w-full h-32 object-contain rounded-lg shadow-xl" // Fixed typo: rounded-mlg -> rounded-lg
                              />
                            ) : (
                              <div className="w-full h-32 bg-gray-100 flex items-center justify-center rounded-md">
                                No Variant Image
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="w-full md:w-2/3 space-y-2">
                          <h2 className="text-2xl font-bold">
                            Variant {index + 1}: {variant.productTitle || "-"}
                          </h2>
                          <p className="text-gray-600">
                            {productToView.productDescription || "-"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-semibold">Brand</h3>
                          <p>{productToView.productBrand || "-"}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Category</h3>
                          <p>{productToView.productCategory || "-"}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Sub Category</h3>
                          <p>{productToView.productSubCategory || "-"}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Stock Count</h3>
                          <p>{variant.stockCount || "-"}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Product Type</h3>
                          <p>{productToView.productType || "-"}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Variation</h3>
                          <p>SKU: {variant.skuCode || "-"}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Sale Price</h3>
                          <p>
                            ₹{Number(variant.price?.salePrice || 0).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Regular Price</h3>
                          <p>
                            ₹
                            {Number(variant.price?.regularPrice || 0).toFixed(
                              2
                            )}
                          </p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Discount</h3>
                          <p>{variant.price?.discount || "0"}%</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Tax</h3>
                          <p>{variant.price?.tax || "0"}%</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">SKU</h3>
                          <p>{variant.skuCode || "-"}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">GTIN</h3>
                          <p>{productToView.inventory?.gtin || "-"}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Track Stock</h3>
                          <p>
                            {productToView.inventory?.trackStock === "inStock"
                              ? "Yes"
                              : "No"}
                          </p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Purchase Limit</h3>
                          <p>{productToView.inventory?.purchaseLimit || "-"}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Weight</h3>
                          <p>
                            {productToView.shipping?.productWeight || "-"} g
                          </p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Dimensions (LxWxH)</h3>
                          <p>
                            {productToView.shipping?.dimension?.length || "0"} x{" "}
                            {productToView.shipping?.dimension?.width || "0"} x{" "}
                            {productToView.shipping?.dimension?.height || "0"}{" "}
                            cm
                          </p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Shipping Class</h3>
                          <p>{productToView.shipping?.shippingClass || "-"}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Up-Sell Products</h3>
                          <ul>
                            {productToView.linkProducts?.upSellProducts &&
                            productToView.linkProducts.upSellProducts.length > 0
                              ? productToView.upSellProducts.map(
                                  (productName, index) => (
                                    <p key={index}>{productName.productName}</p>
                                  )
                                )
                              : "-"}
                          </ul>
                        </div>
                        <div>
                          <h3 className="font-semibold">Cross-Sell Products</h3>
                          <ul>
                            {Array.isArray(
                              productToView.linkProducts?.crossSellProducts
                            ) &&
                            productToView.linkProducts.crossSellProducts
                              .length > 0
                              ? productToView.crossSellProducts.map(
                                  (productName, index) => (
                                    <p key={index}>{productName.productName}</p>
                                  )
                                )
                              : "-"}
                          </ul>
                        </div>
                        <div>
                          <h3 className="font-semibold">Created At</h3>
                          <p>
                            {productToView.createdAt
                              ? new Date(
                                  productToView.createdAt
                                ).toLocaleString()
                              : "-"}
                          </p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Updated At</h3>
                          <p>
                            {productToView.updatedAt
                              ? new Date(
                                  productToView.updatedAt
                                ).toLocaleString()
                              : "-"}
                          </p>
                        </div>
                      </div>

                      {Array.isArray(productToView.ingredients) &&
                        productToView.ingredients.length > 0 && (
                          <div className="mt-4">
                            <h3 className="font-semibold">Key Ingredients</h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {productToView.ingredients.map(
                                (ingredient, index) => (
                                  <span
                                    key={index}
                                    className="bg-pink-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                                  >
                                    {ingredient}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {productToView.categoryDetails && (
                        <div className="mt-4">
                          <h3 className="font-semibold">Category Details</h3>
                          <p>
                            <strong>Title:</strong>{" "}
                            {productToView.categoryDetails.categoryTitle || "-"}
                          </p>
                          <p>
                            <strong>Description:</strong>{" "}
                            {productToView.categoryDetails
                              .categoryDescription || "-"}
                          </p>
                          {productToView.categoryDetails.categoryImage && (
                            <img
                              src={productToView.categoryDetails.categoryImage}
                              alt="Category Image"
                              className="w-32 h-32 object-contain rounded-md mt-2"
                            />
                          )}
                        </div>
                      )}

                      {productToView.subCategoryDetails && (
                        <div className="mt-4">
                          <h3 className="font-semibold">Subcategory Details</h3>
                          <p>
                            <strong>Title:</strong>{" "}
                            {productToView.subCategoryDetails
                              .subCategoryTitle || "-"}
                          </p>
                          <p>
                            <strong>Description:</strong>{" "}
                            {productToView.subCategoryDetails
                              .subCategoryDescription || "-"}
                          </p>
                          {productToView.subCategoryDetails
                            .subCategoryImage && (
                            <img
                              src={
                                productToView.subCategoryDetails
                                  .subCategoryImage
                              }
                              alt="Subcategory Image"
                              className="w-32 h-32 object-contain rounded-md mt-2"
                            />
                          )}
                        </div>
                      )}

                      {Array.isArray(productToView.productReviews) &&
                        productToView.productReviews.length > 0 && (
                          <div className="mt-4">
                            <h3 className="font-semibold">Product Reviews</h3>
                            {productToView.productReviews.map(
                              (review, index) => (
                                <div key={index} className="border-t pt-2 mt-2">
                                  <p>
                                    <strong>Rating:</strong>{" "}
                                    {review.rating || "-"} / 5
                                  </p>
                                  <p>
                                    <strong>Review:</strong>{" "}
                                    {review.review || "-"}
                                  </p>
                                  <p>
                                    <strong>Created At:</strong>{" "}
                                    {review.createdAt
                                      ? new Date(
                                          review.createdAt
                                        ).toLocaleString()
                                      : "-"}
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        )}
                    </div>
                  ))
                ) : (
                  <p>No variants available for this product.</p>
                )
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/3">
                      <div className="space-y-2">
                        <h3 className="font-semibold">Product Image</h3>
                        {Array.isArray(productToView.productImage) &&
                        productToView.productImage.length > 0 ? (
                          <img
                            src={productToView.productImage[0]}
                            alt="Product Image"
                            className="w-full h-32 object-contain rounded-md"
                          />
                        ) : (
                          <div className="w-full h-32 bg-gray-100 flex items-center justify-center rounded-md">
                            No Product Image Available
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="w-full md:w-2/3 space-y-2">
                      <h2 className="text-2xl font-bold">
                        {productToView.nonVarient[0].productTitle || "-"}
                      </h2>
                      <p className="text-gray-600">
                        {productToView.productDescription || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold">Brand</h3>
                      <p>{productToView.productBrand || "-"}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Category</h3>
                      <p>{productToView.productCategory || "-"}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Sub Category</h3>
                      <p>{productToView.productSubCategory || "-"}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Stock Count</h3>
                      <p>
                        {Array.isArray(productToView.nonVarient)
                          ? productToView.nonVarient.reduce(
                              (total, v) => total + Number(v.stockCount || 0),
                              0
                            )
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Product Type</h3>
                      <p>
                        {productToView.productType === "nonVariation"
                          ? "Simple"
                          : "Variant" || "-"}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Sale Price</h3>
                      <p>
                        ₹
                        {Number(
                          productToView.nonVarient?.[0]?.price?.salePrice || 0
                        ).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Regular Price</h3>
                      <p>
                        ₹
                        {Number(
                          productToView.nonVarient?.[0]?.price?.regularPrice ||
                            0
                        ).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Discount</h3>
                      <p>
                        {productToView.nonVarient?.[0]?.price?.discount || "0"}%
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Tax</h3>
                      <p>{productToView.nonVarient?.[0]?.price?.tax || "0"}%</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">SKU</h3>
                      <p>{productToView.inventory?.sku || "-"}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">GTIN</h3>
                      <p>{productToView.inventory?.gtin || "-"}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Track Stock</h3>
                      <p>
                        {productToView.inventory?.trackStock === "inStock"
                          ? "Yes"
                          : "No"}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Purchase Limit</h3>
                      <p>{productToView.inventory?.purchaseLimit || "-"}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Weight</h3>
                      <p>{productToView.shipping?.productWeight || "-"} g</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Dimensions (LxWxH)</h3>
                      <p>
                        {productToView.shipping?.dimension?.length || "0"} x{" "}
                        {productToView.shipping?.dimension?.width || "0"} x{" "}
                        {productToView.shipping?.dimension?.height || "0"} cm
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Shipping Class</h3>
                      <p>{productToView.shipping?.shippingClass || "-"}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Up-Sell Products</h3>
                      <p>
                        {productToView.linkProducts?.upSellProducts &&
                        Object.keys(productToView.linkProducts.upSellProducts)
                          .length > 0
                          ? Object.keys(
                              productToView.linkProducts.upSellProducts
                            ).join(", ")
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Cross-Sell Products</h3>
                      <p>
                        {Array.isArray(
                          productToView.linkProducts?.crossSellProducts
                        ) &&
                        productToView.linkProducts.crossSellProducts.length > 0
                          ? productToView.linkProducts.crossSellProducts.join(
                              ", "
                            )
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Created At</h3>
                      <p>
                        {productToView.createdAt
                          ? new Date(productToView.createdAt).toLocaleString()
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Updated At</h3>
                      <p>
                        {productToView.updatedAt
                          ? new Date(productToView.updatedAt).toLocaleString()
                          : "-"}
                      </p>
                    </div>
                  </div>

                  {Array.isArray(productToView.ingredients) &&
                    productToView.ingredients.length > 0 && (
                      <div className="mt-4">
                        <h3 className="font-semibold">Key Ingredients</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {productToView.ingredients.map(
                            (ingredient, index) => (
                              <span
                                key={index}
                                className="bg-pink-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                              >
                                {ingredient}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {productToView.categoryDetails && (
                    <div className="mt-4">
                      <h3 className="font-semibold">Category Details</h3>
                      <p>
                        <strong>Title:</strong>{" "}
                        {productToView.categoryDetails.categoryTitle || "-"}
                      </p>
                      <p>
                        <strong>Description:</strong>{" "}
                        {productToView.categoryDetails.categoryDescription ||
                          "-"}
                      </p>
                      {productToView.categoryDetails.categoryImage && (
                        <img
                          src={productToView.categoryDetails.categoryImage}
                          alt="Category Image"
                          className="w-32 h-32 object-contain rounded-md mt-2"
                        />
                      )}
                    </div>
                  )}

                  {productToView.subCategoryDetails && (
                    <div className="mt-4">
                      <h3 className="font-semibold">Subcategory Details</h3>
                      <p>
                        <strong>Title:</strong>{" "}
                        {productToView.subCategoryDetails.subCategoryTitle ||
                          "-"}
                      </p>
                      <p>
                        <strong>Description:</strong>{" "}
                        {productToView.subCategoryDetails
                          .subCategoryDescription || "-"}
                      </p>
                      {productToView.subCategoryDetails.subCategoryImage && (
                        <img
                          src={
                            productToView.subCategoryDetails.subCategoryImage
                          }
                          alt="Subcategory Image"
                          className="w-32 h-32 object-contain rounded-md mt-2"
                        />
                      )}
                    </div>
                  )}

                  {Array.isArray(productToView.productReviews) &&
                    productToView.productReviews.length > 0 && (
                      <div className="mt-4">
                        <h3 className="font-semibold">Product Reviews</h3>
                        {productToView.productReviews.map((review, index) => (
                          <div key={index} className="border-t pt-2 mt-2">
                            <p>
                              <strong>Rating:</strong> {review.rating || "-"} /
                              5
                            </p>
                            <p>
                              <strong>Review:</strong> {review.review || "-"}
                            </p>
                            <p>
                              <strong>Created At:</strong>{" "}
                              {review.createdAt
                                ? new Date(review.createdAt).toLocaleString()
                                : "-"}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>
        )} */}

        {/* {productToView && (
          <div className="space-y-4 p-4">
            <div>
              <h3 className="font-semibold mb-2">Product Images</h3>
              {Array.isArray(productToView.productImages) &&
              productToView.productImages.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {productToView.productImages.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Product Image ${index + 1}`}
                      className="w-32 h-32 object-contain rounded-md"
                    />
                  ))}
                </div>
              ) : (
                <div className="w-full h-32 bg-gray-100 flex items-center justify-center rounded-md">
                  No Product Images Available
                </div>
              )}
            </div>

            <div className="space-y-4">
              {productToView.productType === "variant" ? (
                Array.isArray(productToView?.variant?.sizeOnlyVariants) &&
                productToView.variant.sizeOnlyVariant.length > 0 ? (
                  productToView.variant.map((variant, index) => (
                    <div key={index} className="space-y-4 border-b pb-4 mb-4">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-1/3">
                          <div className="space-y-2">
                            <h3 className="font-semibold">
                              Variant {index + 1} Image
                            </h3>
                            {variant.variantImages ? (
                              <img
                                src={variant?.variantImages[0]}
                                alt={`Variant Image ${index + 1}`}
                                className="w-full h-32 object-contain rounded-lg shadow-xl"
                              />
                            ) : (
                              <div className="w-full h-32 bg-gray-100 flex items-center justify-center rounded-md">
                                No Variant Image
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="w-full md:w-2/3 space-y-2">
                          <h2 className="text-2xl font-bold">
                            Variant {index + 1}: {variant.productTitle || "-"}
                          </h2>
                          <p className="text-gray-600">
                            {productToView.productDescription || "-"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-semibold">Brand</h3>
                          <p>{productToView.productBrand || "-"}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Category</h3>
                          <p>{productToView.productCategory || "-"}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Sub Category</h3>
                          <p>{productToView.productSubCategory || "-"}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Stock Count</h3>
                          <p>{variant.stockCount || "-"}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Product Type</h3>
                          <p>{productToView.productType || "-"}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Variation</h3>
                          <p>SKU: {variant.skuCode || "-"}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Sale Price</h3>
                          <p>
                            ₹{Number(variant.price?.salePrice || 0).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Regular Price</h3>
                          <p>
                            ₹
                            {Number(variant.price?.regularPrice || 0).toFixed(
                              2
                            )}
                          </p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Discount</h3>
                          <p>{variant.price?.discount || "0"}%</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Tax</h3>
                          <p>{variant.price?.tax || "0"}%</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">SKU</h3>
                          <p>{variant.skuCode || "-"}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">GTIN</h3>
                          <p>{productToView.inventory?.gtin || "-"}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Track Stock</h3>
                          <p>
                            {productToView.inventory?.trackStock === "inStock"
                              ? "Yes"
                              : "No"}
                          </p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Purchase Limit</h3>
                          <p>{productToView.inventory?.purchaseLimit || "-"}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Weight</h3>
                          <p>
                            {productToView.shipping?.productWeight || "-"} g
                          </p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Dimensions (LxWxH)</h3>
                          <p>
                            {productToView.shipping?.dimension?.length || "0"} x{" "}
                            {productToView.shipping?.dimension?.width || "0"} x{" "}
                            {productToView.shipping?.dimension?.height || "0"}{" "}
                            cm
                          </p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Shipping Class</h3>
                          <p>{productToView.shipping?.shippingClass || "-"}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Up-Sell Products</h3>
                          <ul>
                            {productToView.linkProducts?.upSellProducts &&
                            productToView.linkProducts.upSellProducts.length > 0
                              ? productToView.linkProducts.upSellProducts.map(
                                  (product, index) => (
                                    <p key={index}>
                                      {product.productName || product}
                                    </p>
                                  )
                                )
                              : "-"}
                          </ul>
                        </div>
                        <div>
                          <h3 className="font-semibold">Cross-Sell Products</h3>
                          <ul>
                            {Array.isArray(
                              productToView.linkProducts?.crossSellProducts
                            ) &&
                            productToView.linkProducts.crossSellProducts
                              .length > 0
                              ? productToView.linkProducts.crossSellProducts.map(
                                  (product, index) => (
                                    <p key={index}>
                                      {product.productName || product}
                                    </p>
                                  )
                                )
                              : "-"}
                          </ul>
                        </div>
                        <div>
                          <h3 className="font-semibold">Created At</h3>
                          <p>
                            {productToView.createdAt
                              ? new Date(
                                  productToView.createdAt
                                ).toLocaleString()
                              : "-"}
                          </p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Updated At</h3>
                          <p>
                            {productToView.updatedAt
                              ? new Date(
                                  productToView.updatedAt
                                ).toLocaleString()
                              : "-"}
                          </p>
                        </div>
                      </div>

                      {Array.isArray(productToView.ingredients) &&
                        productToView.ingredients.length > 0 && (
                          <div className="mt-4">
                            <h3 className="font-semibold">Key Ingredients</h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {productToView.ingredients.map(
                                (ingredient, index) => (
                                  <span
                                    key={index}
                                    className="bg-pink-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                                  >
                                    {ingredient}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {productToView.categoryDetails && (
                        <div className="mt-4">
                          <h3 className="font-semibold">Category Details</h3>
                          <p>
                            <strong>Title:</strong>{" "}
                            {productToView.categoryDetails.categoryTitle || "-"}
                          </p>
                          <p>
                            <strong>Description:</strong>{" "}
                            {productToView.categoryDetails
                              .categoryDescription || "-"}
                          </p>
                          {productToView.categoryDetails.categoryImage && (
                            <img
                              src={productToView.categoryDetails.categoryImage}
                              alt="Category Image"
                              className="w-32 h-32 object-contain rounded-md mt-2"
                            />
                          )}
                        </div>
                      )}

                      {productToView.subCategoryDetails && (
                        <div className="mt-4">
                          <h3 className="font-semibold">Subcategory Details</h3>
                          <p>
                            <strong>Title:</strong>{" "}
                            {productToView.subCategoryDetails
                              .subCategoryTitle || "-"}
                          </p>
                          <p>
                            <strong>Description:</strong>{" "}
                            {productToView.subCategoryDetails
                              .subCategoryDescription || "-"}
                          </p>
                          {productToView.subCategoryDetails
                            .subCategoryImage && (
                            <img
                              src={
                                productToView.subCategoryDetails
                                  .subCategoryImage
                              }
                              alt="Subcategory Image"
                              className="w-32 h-32 object-contain rounded-md mt-2"
                            />
                          )}
                        </div>
                      )}

                      {Array.isArray(productToView.productReviews) &&
                        productToView.productReviews.length > 0 && (
                          <div className="mt-4">
                            <h3 className="font-semibold">Product Reviews</h3>
                            {productToView.productReviews.map(
                              (review, index) => (
                                <div key={index} className="border-t pt-2 mt-2">
                                  <p>
                                    <strong>Rating:</strong>{" "}
                                    {review.rating || "-"} / 5
                                  </p>
                                  <p>
                                    <strong>Review:</strong>{" "}
                                    {review.review || "-"}
                                  </p>
                                  <p>
                                    <strong>Created At:</strong>{" "}
                                    {review.createdAt
                                      ? new Date(
                                          review.createdAt
                                        ).toLocaleString()
                                      : "-"}
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        )}
                    </div>
                  ))
                ) : (
                  <p>No variants available for this product.</p>
                )
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/3">
                      <div className="space-y-2">
                        <h3 className="font-semibold">Product Image</h3>
                        {Array.isArray(productToView.productImage) &&
                        productToView.productImage.length > 0 ? (
                          <img
                            src={productToView.productImage[0]}
                            alt="Product Image"
                            className="w-full h-32 object-contain rounded-md"
                          />
                        ) : (
                          <div className="w-full h-32 bg-gray-100 flex items-center justify-center rounded-md">
                            No Product Image Available
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="w-full md:w-2/3 space-y-2">
                      <h2 className="text-2xl font-bold">
                        {productToView.nonVarient?.[0]?.productTitle || "-"}
                      </h2>
                      <p className="text-gray-600">
                        {productToView.productDescription || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold">Brand</h3>
                      <p>{productToView.productBrand || "-"}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Category</h3>
                      <p>{productToView.productCategory || "-"}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Sub Category</h3>
                      <p>{productToView.productSubCategory || "-"}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Stock Count</h3>
                      <p>
                        {Array.isArray(productToView.nonVarient) &&
                        productToView.nonVarient.length > 0
                          ? productToView.nonVarient.reduce(
                              (total, v) => total + Number(v.stockCount || 0),
                              0
                            )
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Product Type</h3>
                      <p>
                        {productToView.productType === "nonVariation"
                          ? "Simple"
                          : "Variant" || "-"}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Sale Price</h3>
                      <p>
                        ₹
                        {Number(
                          productToView.nonVarient?.[0]?.price?.salePrice || 0
                        ).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Regular Price</h3>
                      <p>
                        ₹
                        {Number(
                          productToView.nonVarient?.[0]?.price?.regularPrice ||
                            0
                        ).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Discount</h3>
                      <p>
                        {productToView.nonVarient?.[0]?.price?.discount || "0"}%
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Tax</h3>
                      <p>{productToView.nonVarient?.[0]?.price?.tax || "0"}%</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">SKU</h3>
                      <p>{productToView.inventory?.sku || "-"}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">GTIN</h3>
                      <p>{productToView.inventory?.gtin || "-"}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Track Stock</h3>
                      <p>
                        {productToView.inventory?.trackStock === "inStock"
                          ? "Yes"
                          : "No"}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Purchase Limit</h3>
                      <p>{productToView.inventory?.purchaseLimit || "-"}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Weight</h3>
                      <p>{productToView.shipping?.productWeight || "-"} g</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Dimensions (LxWxH)</h3>
                      <p>
                        {productToView.shipping?.dimension?.length || "0"} x{" "}
                        {productToView.shipping?.dimension?.width || "0"} x{" "}
                        {productToView.shipping?.dimension?.height || "0"} cm
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Shipping Class</h3>
                      <p>{productToView.shipping?.shippingClass || "-"}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Up-Sell Products</h3>
                      <ul>
                        {productToView.linkProducts?.upSellProducts &&
                        productToView.linkProducts.upSellProducts.length > 0
                          ? productToView.linkProducts.upSellProducts.map(
                              (product, index) => (
                                <p key={index}>
                                  {product.productName || product}
                                </p>
                              )
                            )
                          : "-"}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold">Cross-Sell Products</h3>
                      <ul>
                        {Array.isArray(
                          productToView.linkProducts?.crossSellProducts
                        ) &&
                        productToView.linkProducts.crossSellProducts.length > 0
                          ? productToView.linkProducts.crossSellProducts.map(
                              (product, index) => (
                                <p key={index}>
                                  {product.productName || product}
                                </p>
                              )
                            )
                          : "-"}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold">Created At</h3>
                      <p>
                        {productToView.createdAt
                          ? new Date(productToView.createdAt).toLocaleString()
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Updated At</h3>
                      <p>
                        {productToView.updatedAt
                          ? new Date(productToView.updatedAt).toLocaleString()
                          : "-"}
                      </p>
                    </div>
                  </div>

                  {Array.isArray(productToView.ingredients) &&
                    productToView.ingredients.length > 0 && (
                      <div className="mt-4">
                        <h3 className="font-semibold">Key Ingredients</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {productToView.ingredients.map(
                            (ingredient, index) => (
                              <span
                                key={index}
                                className="bg-pink-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                              >
                                {ingredient}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {productToView.categoryDetails && (
                    <div className="mt-4">
                      <h3 className="font-semibold">Category Details</h3>
                      <p>
                        <strong>Title:</strong>{" "}
                        {productToView.categoryDetails.categoryTitle || "-"}
                      </p>
                      <p>
                        <strong>Description:</strong>{" "}
                        {productToView.categoryDetails.categoryDescription ||
                          "-"}
                      </p>
                      {productToView.categoryDetails.categoryImage && (
                        <img
                          src={productToView.categoryDetails.categoryImage}
                          alt="Category Image"
                          className="w-32 h-32 object-contain rounded-md mt-2"
                        />
                      )}
                    </div>
                  )}

                  {productToView.subCategoryDetails && (
                    <div className="mt-4">
                      <h3 className="font-semibold">Subcategory Details</h3>
                      <p>
                        <strong>Title:</strong>{" "}
                        {productToView.subCategoryDetails.subCategoryTitle ||
                          "-"}
                      </p>
                      <p>
                        <strong>Description:</strong>{" "}
                        {productToView.subCategoryDetails
                          .subCategoryDescription || "-"}
                      </p>
                      {productToView.subCategoryDetails.subCategoryImage && (
                        <img
                          src={
                            productToView.subCategoryDetails.subCategoryImage
                          }
                          alt="Subcategory Image"
                          className="w-32 h-32 object-contain rounded-md mt-2"
                        />
                      )}
                    </div>
                  )}

                  {Array.isArray(productToView.productReviews) &&
                    productToView.productReviews.length > 0 && (
                      <div className="mt-4">
                        <h3 className="font-semibold">Product Reviews</h3>
                        {productToView.productReviews.map((review, index) => (
                          <div key={index} className="border-t pt-2 mt-2">
                            <p>
                              <strong>Rating:</strong> {review.rating || "-"} /
                              5
                            </p>
                            <p>
                              <strong>Review:</strong> {review.review || "-"}
                            </p>
                            <p>
                              <strong>Created At:</strong>{" "}
                              {review.createdAt
                                ? new Date(review.createdAt).toLocaleString()
                                : "-"}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>
        )} */}