const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

// 🧩 Common Sub-Schemas

const priceSchema = new mongoose.Schema(
  {
    costPrice: { type: Number, default: 0 },
    salePrice: { type: Number, default: 0, required: true },
    realPrice: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
  },
  { _id: false }
);

const inventorySchema = new mongoose.Schema(
  {
    sku: String,
    productCode: String, // Added as alternative to SKU
    gtin: String,
    stockManagement: {
      type: String,
      enum: ["automatic", "manual"],
      default: "manual",
    },
    trackStock: {
      type: String,
      enum: ["inStock", "outOfStock", "onBackorder"],
      default: "inStock",
    },
    purchaseLimit: {
      type: Number,
      default: 10,
      min: 1,
      max: 100,
    }, // Max quantity per order
  },
  { _id: false }
);

const shippingSchema = new mongoose.Schema(
  {
    productWeight: Number, // in grams
    dimension: {
      length: Number, // in cm
      width: Number,
      height: Number,
    },
    shippingClass: {
      type: String,
      enum: ["standard", "express", "freeShipping"],
      default: "standard",
    },
  },
  { _id: false }
);



// 🎨 NEW: Size-Color Combination Schema
const sizeColorVariantSchema = new mongoose.Schema(
  {
    size: { type: String, required: true }, // e.g., "Small", "Medium", "Large", "XL"
    color: { type: String, required: true }, // e.g., "Red", "Blue", "Green"
    stockCount: { type: Number, default: 0 },
    skuCode: String,
    productCode: String,
    variantImages: { type: [String], default: [] },
    price: priceSchema,
    _id: { type: String, default: uuidv4 },
  },
  { _id: false }
);

// 🎨 Variant Sub-schemas (Simplified and Fixed)
const variantSchema = new mongoose.Schema(
  {
    variantType: {
      type: String,
      enum: ["sizeColor", "colorOnly", "sizeOnly"],
      required: true,
    },

    // For size + color combinations (e.g., Small-Red, Medium-Blue)
    sizeColorVariants: {
      type: [sizeColorVariantSchema],
      validate: {
        validator: function (val) {
          if (this.variantType === "sizeColor") {
            return Array.isArray(val) && val.length > 0;
          }
          return true;
        },
        message:
          "Size-color combinations are required when variantType is 'sizeColor'.",
      },
    },

    // For color-only variants
    colorOnlyVariants: {
      type: [
        {
          color: { type: String, required: true },
          stockCount: { type: Number, default: 0 },
          skuCode: String,
          productCode: String,
          variantImages: { type: [String], default: [] },
          price: priceSchema,
          _id: { type: String, default: uuidv4 },
        },
      ],
      validate: {
        validator: function (val) {
          if (this.variantType === "colorOnly") {
            return Array.isArray(val) && val.length > 0;
          }
          return true;
        },
        message: "Color variants are required when variantType is 'colorOnly'.",
      },
    },

    // For size-only variants
    sizeOnlyVariants: {
      type: [
        {
          size: { type: String, required: true },
          stockCount: { type: Number, default: 0 },
          skuCode: String,
          productCode: String,
          variantImages: { type: [String], default: [] },
          price: priceSchema,
          _id: { type: String, default: uuidv4 },
        },
      ],
      validate: {
        validator: function (val) {
          if (this.variantType === "sizeOnly") {
            return Array.isArray(val) && val.length > 0;
          }
          return true;
        },
        message: "Size variants are required when variantType is 'sizeOnly'.",
      },
    },

    _id: { type: String, default: uuidv4 },
  },
  { _id: false }
);


// 💄 Main Product Schema
const ProductSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },

    // 🏷️ Basic Info
    productName: { type: String, required: true },
    productTitle: { type: String },
    productCategory: {
      type: String,
      required: true,
      trim: true
    },
    category_id: { type: String, required: true },
    productSubCategory: {
      type: String,
      required: true,
      trim: true
    },
    subcategory_id: { type: String, required: true },

    // ⚙️ Product Type
    productType: {
      type: String,
      enum: ["variant", "nonVariant", "combo"],
      required: true,
    },

    productImages: { type: [String], default: [] },

    // 🧩 Variant Products (Fixed spelling and structure)
    variant: {
      type: variantSchema,
      validate: {
        validator: function (val) {
          if (this.productType === "variant") {
            return val !== null && val !== undefined;
          }
          return true;
        },
        message: "Variant data is required for variant products.",
      },
    },

    // 🧱 Non-Variant Products
    nonVariant: {
      type: {
        productTitle: String,
        nonVariantImages: { type: [String], default: [] },
        price: priceSchema,
        stockCount: { type: Number, default: 0 },
        skuCode: String,
        productCode: String,
        _id: { type: String, default: uuidv4 },
      },
      validate: {
        validator: function (val) {
          if (this.productType === "nonVariant") {
            return val !== null && val !== undefined;
          }
          return true;
        },
        message: "Non-variant data is required for nonVariant products.",
      },
    },
    // 📝 Common Info
    productDescription: { type: String, required: true },
    productBenifits: { type: [String], required: true },
    productUsage: { type: String, required: true },
    productIngrediants: { type: [String], required: true },


    // 📦 Inventory & Shipping
    inventory: inventorySchema,
    shipping: shippingSchema,

    // 🔍 SEO & Relations
    searchTags: { type: [String], index: true },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    linkProducts: {
      relatedProducts: { type: [String], default: [] },
    },

    // 🔄 Return Eligibility
    isReturnable: {
      type: Boolean,
      default: false,
    },

    // Today's Special Flag
    isTodaySpecial: {
      type: Boolean,
      default: false,
    },

    // 🟢 Status
    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "active",
    },
    createdBy: { type: String, ref: "User" },
    updatedBy: { type: String, ref: "User" },
  },
  { timestamps: true, collection: "product" }
);

// ⚡ Indexing for Faster Queries
ProductSchema.index({
  productName: "text",
  productCategory: 1,
  productSubCategory: 1,
  status: 1,
});

// ProductSchema.index({ searchTags: 1 });
// ProductSchema.index({ averageRating: -1 });

const Product = mongoose.model("product", ProductSchema);
module.exports = { Product };
