import { z } from "zod";

/* ---------------- PRICE ---------------- */
export const priceSchema = z.object({
  costPrice: z.coerce.number().min(0).optional(),
  salePrice: z.coerce.number().positive(),
  realPrice: z.coerce.number().min(0).optional(),
  discount: z.coerce.number().min(0).optional(),
  tax: z.coerce.number().min(0).optional(),
});

/* ---------------- INVENTORY ---------------- */
export const inventorySchema = z.object({
  sku: z.string().optional(),
  productCode: z.string().optional(),
  gtin: z.string().optional(),
  stockManagement: z.enum(["automatic", "manual"]).default("manual"),
  trackStock: z.enum(["inStock", "outOfStock", "onBackorder"]).default("inStock"),
  purchaseLimit: z.number().min(1).max(100).default(10),
});

/* ---------------- SHIPPING ---------------- */
export const shippingSchema = z.object({
  productWeight: z.number().optional(),
  dimension: z
    .object({
      length: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
    })
    .optional(),
  shippingClass: z
    .enum(["standard", "express", "freeShipping"])
    .default("standard"),
});

export const linkProductsSchema = z.object({
  relatedProducts: z.array(z.string()).optional(),
});


export const sizeColorVariantSchema = z.object({
  size: z.string().min(1),
  color: z.string().min(1),
  stockCount: z.coerce.number().min(0).default(0),
  skuCode: z.string().optional(),
  productCode: z.string().optional(),
  variantImages: z.any().optional(),
  price: priceSchema,
});


export const colorOnlyVariantSchema = z.object({
  color: z.string().min(1),
  stockCount: z.coerce.number().min(0).default(0),
  skuCode: z.string().optional(),
  productCode: z.string().optional(),
  variantImages: z.any().optional(),
  price: priceSchema,
});


export const sizeOnlyVariantSchema = z.object({
  size: z.string().min(1),
  stockCount: z.coerce.number().min(0).default(0),
  skuCode: z.string().optional(),
  productCode: z.string().optional(),
  variantImages: z.any().optional(),
  price: priceSchema,
});


export const variantSchema = z
  .object({
    variantType: z.enum(["sizeColor", "colorOnly", "sizeOnly"]),

    sizeColorVariants: z.array(sizeColorVariantSchema).optional(),
    colorOnlyVariants: z.array(colorOnlyVariantSchema).optional(),
    sizeOnlyVariants: z.array(sizeOnlyVariantSchema).optional(),
  });


export const nonVariantSchema = z.object({
  productTitle: z.string().optional(),

  price: z.object({
    costPrice: z.coerce.number().optional().default(0),
    salePrice: z.coerce.number().optional().default(0),
    discount: z.coerce.number().optional().default(0),
    tax: z.coerce.number().optional().default(0),
  }),

  stockCount: z.coerce.number().optional().default(0),

  skuCode: z.string().optional(),
  productCode: z.string().optional(),

  nonVariantImages: z.any().optional(), // IMPORTANT
});



export const productSchema = z
  .object({
    productName: z.string().min(1),
    productTitle: z.string().optional(),

    productCategory: z.string().min(1),
    category_id: z.string().min(1),

    productSubCategory: z.string().min(1),
    subcategory_id: z.string().min(1),

    productType: z.enum(["variant", "nonVariant", "combo"]),

    productImages: z.any().optional(),

    variant: variantSchema.optional(),
    nonVariant: nonVariantSchema.optional(),

    productDescription: z.string().min(10),
    productBenifits: z.array(z.string()).min(1),
    productUsage: z.string().min(1),
    productIngrediants: z.array(z.string()).min(1),

    inventory: inventorySchema.optional(),
    // shipping: shippingSchema.optional(),
    linkProducts: linkProductsSchema.optional(),
    isReturnable: z.boolean().optional(),
    isTodaySpecial: z.boolean().optional(),

    searchTags: z.array(z.string()).optional(),

    status: z.enum(["active", "inactive", "draft"]).default("active"),
    createdBy: z.string().optional(),
    updatedBy: z.string().optional(),
  })
.superRefine((data, ctx) => {

  if (data.productType === "variant") {
    if (!data.variant) {
      ctx.addIssue({
        path: ["variant"],
        message: "Variant data is required",
        code: "custom",
      });
      return;
    }

    const v = data.variant;

    if (v.variantType === "sizeColor" && !v.sizeColorVariants?.length) {
      ctx.addIssue({
        path: ["variant", "sizeColorVariants"],
        message: "Size + Color variants are required",
        code: "custom",
      });
    }

    if (v.variantType === "colorOnly" && !v.colorOnlyVariants?.length) {
      ctx.addIssue({
        path: ["variant", "colorOnlyVariants"],
        message: "Color variants are required",
        code: "custom",
      });
    }

    if (v.variantType === "sizeOnly" && !v.sizeOnlyVariants?.length) {
      ctx.addIssue({
        path: ["variant", "sizeOnlyVariants"],
        message: "Size variants are required",
        code: "custom",
      });
    }
  }

  if (data.productType === "nonVariant" && !data.nonVariant) {
    ctx.addIssue({
      path: ["nonVariant"],
      message: "Non-variant data is required",
      code: "custom",
    });
  }
});
