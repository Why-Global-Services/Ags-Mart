import React, { useEffect, useMemo, useState } from "react";
import { FaSearch, FaPlus } from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import ReusableTable from "../../components/ReusableTable";
import { Spin, message } from "antd";
import ActionsMenu from "../../components/ActionMenu";
import ReusableModal from "../../components/ReusableModal";
import { getFeaturedProducts } from "../../services/FeaturedSection";

const FeaturedDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [featuredData, setFeaturedData] = useState(null);
  const [assignedProducts, setAssignedProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getFeaturedProducts(id);

        if (res.success && res.data && res.data.length > 0) {
          const featuredDetails = res.data[0].featruedSectionDetails;
          setFeaturedData(featuredDetails);

          const allProducts = res.data.flatMap((entry) => entry.productDetails || []);
          const uniqueProductIds = new Set();

          const processedProducts = allProducts.reduce((acc, product) => {
            if (uniqueProductIds.has(product._id)) return acc;
            uniqueProductIds.add(product._id);

            let stock = 0;
            let price = "-";
            let variantInfo = "-";

            if (product.productType === "variation" && product.varient?.length > 0) {
              // Aggregate stock from all variants
              stock = product.varient.reduce(
                (sum, variant) => sum + (parseInt(variant.stockCount, 10) || 0),
                0
              );
              // Use first variant's price as representative
              const firstVariant = product.varient[0];
              price = firstVariant.price?.salePrice || firstVariant.price?.regularPrice || "-";
              variantInfo = product.varient.map(v => v.productTitle).join(", ");
            } else if (product.productType === "nonVariation" && product.nonVarient?.length > 0) {
              const nonVarient = product.nonVarient[0];
              stock = parseInt(nonVarient.stockCount, 10) || 0;
              price = nonVarient.price?.salePrice || nonVarient.price?.regularPrice || "-";
              variantInfo = nonVarient.productTitle || "-";
            }

            acc.push({
              id: product._id,
              _id: product._id,
              productName: product.productName || "-",
              brand: product.productBrand || "-",
              category: product.productCategory || "-",
              subcategory: product.productSubCategory || "-",
              price,
              quantityInStock: stock.toString(),
              productImage: product.productImage || [],
              variantInfo,
              skuCode: product.inventory?.sku || "-",
              productDetails: product, // Store full product details for modal
            });

            return acc;
          }, []);

          setAssignedProducts(processedProducts);
        } else {
          message.warning("No featured section details found");
        }
      } catch (error) {
        console.error("Error fetching featured section details:", error);
        message.error("Failed to fetch featured section details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return assignedProducts;
    return assignedProducts.filter((product) =>
      product.productName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [assignedProducts, searchQuery]);

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const productFields = [
    { key: "productName", label: "Product Name" },
    { key: "brand", label: "Brand" },
    { key: "category", label: "Category" },
    { key: "subcategory", label: "Subcategory" },
    { key: "price", label: "Sale Price", type: "currency" },
    { key: "quantityInStock", label: "Total Stock" },
    { key: "skuCode", label: "Product SKU" },
    {
      key: "productDetails.productType",
      label: "Product Type",
      render: (value) => (value === "variation" ? "Variant Product" : "Standard Product"),
    },
    {
      key: "productDetails.varient",
      label: "Variants",
      showIf: (data) => data.productDetails.productType === "variation",
      render: (variants) =>
        variants?.length > 0 ? (
          <ul className="list-disc pl-5">
            {variants.map((variant, index) => (
              <li key={index}>
                {variant.productTitle} (Color: {variant.varientValue}, Stock: {variant.stockCount}, 
                Price: ₹{variant.price?.salePrice || variant.price?.regularPrice}, 
                SKU: {variant.skuCode})
              </li>
            ))}
          </ul>
        ) : (
          "-"
        ),
    },
    {
      key: "productDetails.nonVarient",
      label: "Product Info",
      showIf: (data) => data.productDetails.productType === "nonVariation",
      render: (nonVarient) =>
        nonVarient?.length > 0 ? (
          <ul className="list-disc pl-5">
            <li>
              {nonVarient[0].productTitle} (Stock: {nonVarient[0].stockCount}, 
              Price: ₹{nonVarient[0].price?.salePrice || nonVarient[0].price?.regularPrice})
            </li>
          </ul>
        ) : (
          "-"
        ),
    },
    { key: "productDetails.productDescription", label: "Description" },
    {
      key: "productDetails.productBenifits",
      label: "Benefits",
      render: (value) => (
        <ul className="list-disc pl-5">
          {Object.values(value).map((benefit, index) => (
            <li key={index}>{benefit}</li>
          ))}
        </ul>
      ),
    },
    {
      key: "productDetails.ingredients",
      label: "Ingredients",
      render: (value) => (
        <ul className="list-disc pl-5">
          {value.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      ),
    },
    { key: "productDetails.inventory.gtin", label: "GTIN" },
    { key: "productDetails.shipping.productWeight", label: "Weight" },
    {
      key: "productDetails.shipping.dimension",
      label: "Dimensions",
      render: (value) => `${value.length}x${value.width}x${value.height} mm`,
    },
  ];

  const productColumns = [
    {
      name: "Product Name",
      selector: (row) => row.productName,
      cell: (row) => (
        <div className="flex items-center space-x-3">
          {row.productImage?.[0] && (
            <img
              src={row.productImage[0]}
              alt={row.productName}
              className="w-10 h-10 object-cover rounded-md"
            />
          )}
          <p className="text-gray-700 font-medium">{row.productName}</p>
        </div>
      ),
      width: "250px",
      sortable: true,
    },
    {
      name: "Category",
      selector: (row) => row.category,
      width: "150px",
      sortable: true,
    },
    {
      name: "Subcategory",
      selector: (row) => row.subcategory,
      width: "150px",
      sortable: true,
    },
    {
      name: "Stock",
      selector: (row) => row.quantityInStock,
      width: "100px",
      sortable: true,
    },
    {
      name: "Price",
      selector: (row) => row.price,
      cell: (row) => `₹${row.price}`,
      width: "120px",
      sortable: true,
    },
    {
      name: "Brand",
      selector: (row) => row.brand,
      width: "150px",
      sortable: true,
    },
    {
      name: "Status",
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            parseInt(row.quantityInStock) > 0
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {parseInt(row.quantityInStock) > 0 ? "Active" : "Inactive"}
        </span>
      ),
      width: "120px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <ActionsMenu
          item={row}
          onView={handleViewProduct}
          showAssign={false}
          showEdit={false}
          showDelete={false}
        />
      ),
      width: "150px",
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <button
        onClick={() => navigate("/featuredproducts")}
        className="rounded px-4 text-sm text-blue-700 hover:underline"
      >
        ← Go Back
      </button>

      <div className="bg-white shadow-lg rounded-lg mt-3 p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">
            Featured Section Details
          </h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-300 rounded-md pl-10 pr-4 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Spin size="large" />
          </div>
        ) : featuredData ? (
          <div className="border border-gray-200 p-4 rounded-lg bg-gray-50 mb-6">
            <h2 className="text-xl font-semibold text-gray-800">{featuredData.title}</h2>
            <p className="text-gray-600 mt-2 text-sm">{featuredData.description}</p>
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 font-medium">Status:</span>
                <span
                  className={`px-2 py-1 rounded-md text-sm ${
                    featuredData.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {featuredData.status}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 font-medium">Created At:</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">
                  {featuredData.createdAt
                    ? dayjs(featuredData.createdAt).format("DD/MM/YYYY")
                    : "-"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 font-medium">Updated At:</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-sm">
                  {featuredData.updatedAt
                    ? dayjs(featuredData.updatedAt).format("DD/MM/YYYY")
                    : "-"}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No featured section details found</p>
        )}

        <div className="flex justify-end py-5">
          <Link
            to={`/featuredproducts/featuredDetails/${id}/assignProducts`}
            className="flex gap-2 items-center border border-primaryColor rounded hover:bg-primary duration-300 hover:text-white px-5 py-1.5 text-primary"
          >
            {featuredData ? (
              <>
                <FaPlus /> Update Products
              </>
            ) : (
              <>
                <FaPlus /> Assign Products
              </>
            )}
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden p-2">
          <ReusableTable
            columns={productColumns}
            data={filteredProducts}
            loading={loading}
            noDataMessage="No products assigned to this featured section"
            pagination
            paginationRowsPerPageOptions={[5, 10, 15]}
            fixedHeader
            fixedHeaderScrollHeight="500px"
          />
        </div>
      </div>

      {selectedProduct && (
        <ReusableModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Product Details"
          data={selectedProduct}
          fields={productFields}
          imageConfig={{
            show: true,
            path: "productImage",
            alt: "productName",
            render: (images) => (
              <div className="grid grid-cols-2 gap-4 mt-4">
                {images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${selectedProduct.productName} ${index + 1}`}
                    className="w-full h-40 object-cover rounded-md"
                  />
                ))}
              </div>
            ),
          }}
        />
      )}
    </div>
  );
};

export default FeaturedDetails;