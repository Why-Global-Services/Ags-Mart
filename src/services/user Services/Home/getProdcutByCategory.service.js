const { Product } = require("../../../models/Product.model.js");

const GetAllProductsGroupedByCategory = async (req, res) => {
  try {
    const products = await Product.find({status: "active"});

    const normalize = str => str?.toLowerCase().replace(/[\s\-]/g, "").trim();

    const grouped = {};

    // Group products by category
    products.forEach(prod => {
      const key = prod.productCategory;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(prod);
    });

    // Convert grouped object to array format
    const groupedArray = Object.entries(grouped).map(([category, products]) => ({
      category,
      products
    }));

    return { success: true, categories: groupedArray };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Server error" };
  }
};

module.exports = { GetAllProductsGroupedByCategory };
