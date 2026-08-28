const { Product } = require("../../../models/Product.model");

const getproductsBasedOnBrands = async(req,res)=>{
    const { _id } = req.params;
    const findProducts = await Product.aggregate([
      {
        $match: {
          status: "active",
          productBrand: _id, // _id is brand name
        },
      },
    ]);
  
    return {
      success: true,
      message: "Product get successfully",
      data: findProducts,
    };
}

module.exports = {
    getproductsBasedOnBrands
}