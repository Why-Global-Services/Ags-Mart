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


export const unitOnlyVariantSchema = z.object({
  unit: z.string().trim().min(1, "Unit is required"),
  stockCount: z.coerce.number().min(0).default(0),
  skuCode: z.string().optional(),
  productCode: z.string().optional(),
  variantImages: z.any().optional(),
  price: priceSchema,
});

export const variantSchema = z
  .object({
    variantType: z.literal("unitOnly").default("unitOnly"),
    unitOnlyVariants: z.array(unitOnlyVariantSchema).optional(),
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

    // SUBCATEGORY TEMPORARILY DISABLED
    // Re-enable these fields and their validation when product subcategories are restored.
    // productSubCategory: z.string().min(1),
    // subcategory_id: z.string().min(1),

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

    if (v.variantType === "unitOnly" && !v.unitOnlyVariants?.length) {
      ctx.addIssue({
        path: ["variant", "unitOnlyVariants"],
        message: "Unit variants are required",
        code: "custom",
      });
    }

    if (v.unitOnlyVariants?.length) {
      const seen = new Set();
      v.unitOnlyVariants.forEach((variant, index) => {
        const normalized = variant.unit?.trim().toLowerCase();
        if (normalized) {
          if (seen.has(normalized)) {
            ctx.addIssue({
              path: ["variant", "unitOnlyVariants", index, "unit"],
              message: "This unit has already been added.",
              code: "custom",
            });
          } else {
            seen.add(normalized);
          }
        }
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
