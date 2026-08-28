const { offers } = require("../../../models/offers.model");
const ApiError = require("../../../utils/apiError");

const bestOfferProducts = async (req) => {
  const findOfferProducts = await offers.aggregate([
    {
      $lookup: {
        from: "offerProducts",
        localField: "_id",
        foreignField: "offerId",
        as: "offerProductLinks",
      },
    },
    {
      $unwind: {
        path: "$offerProductLinks",
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $lookup: {
        from: "product",
        localField: "offerProductLinks.productIds",
        foreignField: "_id",
        as: "offerProducts",
      },
    },
    {
      $addFields: {
        // Flag the offer as flash sale if it's ending in next 24 hours
        isFlashSale: {
          $lte: [
            "$endDate",
            {
              $add: [new Date(), 1000 * 60 * 60 * 24], // now + 24 hours
            },
          ],
        },
        offerProducts: {
          $map: {
            input: "$offerProducts",
            as: "product",
            in: {
              $mergeObjects: [
                "$$product",
                {
                  selectedVariant: {
                    $cond: [
                      { $eq: ["$$product.productType", "variation"] },
                      "$$product.varient",
                      "$$product.nonVarient",
                    ],
                  },
                },
              ],
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 1,
        discountPercentage: 1,
        isFlashSale: 1,
        validTo:1,
        offerProducts: {
          _id: 1,
          name: 1,
          productType: 1,
          selectedVariant: 1,
          productImage: 1,
          productDescription: 1,
          price: 1,
        },
      },
    },
  ]);

  const offerApplyProducts = findOfferProducts.map((product) => {
    const discount = product.discountPercentage;
    // console.log(product);
    // product.offerProducts.selectedVariant.map((prod)=>{
    //   console.log(prod);
    // })
  });

  if (findOfferProducts.length === 0) {
   return {
    success: true,
    message: "No products found",
    data: findOfferProducts,
   }
  }

  return {
    success: true,
    message: "best offer Products get successfully",
    data: findOfferProducts,
  };
};

module.exports = {
  bestOfferProducts,
};
