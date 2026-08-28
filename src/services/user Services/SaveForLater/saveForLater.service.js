const { Product } = require("../../../models/Product.model");
const { cart } = require("../../../models/cart.model");
const { saveLater } = require("../../../models/saveLater.model");
const ApiError = require("../../../utils/apiError");
const httpStatus = require("http-status");
const { addToCart, editCart } = require("../Cart/cart.service");


const saveLaterProduct = async (req) => {
  const { productId, variantId } = req.query;
  const userId = req.user._id;

  if (!userId) {
    throw new ApiError(400, "User must login");
  }

  const findProduct = await Product.findById(productId);
  if (!findProduct) {
    throw new ApiError(404, "Product not found");
  }

  const existingCart = await cart.findOne({ userId });
  const itemToAdd = existingCart?.items.find(
    (item) => String(item.variantId) === String(variantId)
  );

  if (!itemToAdd) {
    throw new ApiError(404, "Item not found in cart");
  }

  const findSaveLater = await saveLater.findOne({ userId });

  if (findSaveLater) {
    const alreadyExists = findSaveLater.items.some(
      (item) => String(item.variantId) === String(variantId)
    );

    if (!alreadyExists) {
      findSaveLater.items.push(itemToAdd);
      const updatedSaveLater = await findSaveLater.save();
      await editCart(req);
      return {
        success: true,
        message: "Item added to SaveLater",
        data: updatedSaveLater,
      };
    } else {
      await editCart(req);
      return {
        success: false,
        message: "Item already exists in SaveLater",
      };
    }
  } else {
    const created = await saveLater.create({
      userId,
      items: [itemToAdd],
    });
    await editCart(req);
    return {
      success: true,
      message: "SaveLater created successfully",
      data: created,
    };
  }
};


  const getSaveLaterProduct = async(req, res)=>{
    const userId = req.user._id;
  
    if (!userId) {
      throw new ApiError(400, "User must login");
    }
  
    const SaveLaterItems = await saveLater.findOne({ userId });
  
    if (!SaveLaterItems) {
    }
  

    const SaveLaterProduct = await saveLater.aggregate([{
      $match: {
        userId: userId
      }
    }, {
      $unwind: {
        path: "$items",
        preserveNullAndEmptyArrays: true
      }
    },{
      $lookup: {
        from: "product",
        localField: "items.productId",
        foreignField: "_id",
        as: "product"
      }
    },{
      $unwind: {
        path: "$product",
        preserveNullAndEmptyArrays: true
      }
    },    {
          $addFields: {
            selectedVariant: {
              $cond: {
                if: { $eq: ["$items.productType", "variation"] },
                then: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$product.varient",   // array to filter
                        as: "itemVar",               // alias used *inside* cond
                        cond: {
                          $eq: [
                            { $toString: "$$itemVar._id" },
                            "$items.variantId"
                          ]
                        }
                      }
                    },
                    0
                  ]
                },
                else: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$product.nonVarient",
                        as: "itemNv",
                        cond: {
                          $eq: [
                            { $toString: "$$itemNv._id" },
                            "$items.variantId"
                          ]
                        }
                      }
                    },
                    0
                  ]
                }
              }
            }
          }
        },{
          $project: {
            _id: 0,
            productId: "$items.productId",
            variantId: "$items.variantId",
            quantity: "$items.quantity",
            productType: "$items.productType",
            
            // Flattened product info
            productImage: { $arrayElemAt: ["$product.productImage", 0] },
            productStatus: "$product.status",
        
            // Selected variant details
            "selectedVariant.productTitle": 1,
            "selectedVariant.price.salePrice": 1,
            "selectedVariant.varientImage": 1
          }
        }
    ])
  
    return {
      success: true,
      message: "SaveLater product(s) found successfully",
      data: SaveLaterProduct,
    };
  }

  const removeSaveLater = async(req, res)=>{
    const userId = req.user._id;
    const {variantId} = req.query;

    if(!userId){
      throw new ApiError(httpStatus.NOT_FOUND, "UserId not provided")
    }

    if(!variantId){
      throw new ApiError(httpStatus.NOT_FOUND, "No variantId provided ")
    }

    const findSaveLater = await saveLater.findOne({userId})

    if(!findSaveLater){
      throw new ApiError(httpStatus.NOT_FOUND, "No SaveLater found")
    }

    const items = findSaveLater.items.filter((item)=> item.variantId != variantId)

    const data = await saveLater.findOneAndUpdate(
      { userId },
      { $set: { items:items } },
      { new: true }
    );

    return {success: true, message: "SaveLater edited successfully", data: data}

  }

  const moveToCart = async(req, res)=>{
    const userId = req.user._id;
    const {productId, variantId} = req.query;

    if(!userId){
      throw new ApiError(httpStatus.NOT_FOUND, "UserId not provided")
    }

    const findProduct = await Product.findById(productId);
  
    if (!findProduct) {
      throw new ApiError(404, "Product not Found");
    }

    const data = await saveLater.findOne({userId})
    const quantity = data.items.find((item)=> item.variantId == variantId)

    const addedToCart = await addToCart({...req, body: quantity})

    await removeSaveLater(req)

    return {success: true, message: "Product moved to cart successfully", data: addedToCart}

  }


  module.exports = {
    saveLaterProduct,
    getSaveLaterProduct,
    removeSaveLater,
    moveToCart
  }