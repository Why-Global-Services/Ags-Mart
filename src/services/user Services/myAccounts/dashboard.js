const { orderDetailsModel } = require("../../../models/orders.model");
const { saveLater } = require("../../../models/saveLater.model");
const { User } = require("../../../models/users.model");


const dashBoard = async(req, res)=>{
    const userId = req.user._id;

    const recentOrder = await orderDetailsModel.aggregate([
        {
            $match: {userId}
        },
        {
            $sort: {createdAt: -1}
        },
        {
            $limit: 1
        }
    ])

    const SavedItems = await saveLater.aggregate([
        {
        $match: {
          userId: userId
        }
      },
      {
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
          }
      ])
    const latestSavedItems = SavedItems[0]

    const address = await User.findById({_id: userId}, {address: {$slice:-1}})

    return {success: true, message: "Fetched Dashboard Details", data: {recentOrder, latestSavedItems, address}}
}

module.exports = {
    dashBoard
}