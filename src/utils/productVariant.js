const findProductVariant = (product, variantId, productType) => {
  if (!product) return null;

  const rawProductType = String(product.productType || productType || "").trim();
  const isNonVariant =
    rawProductType === "nonVariant" || rawProductType === "nonVariation";

  if (isNonVariant) {
    return (
      product.nonVariant || {
        price: product.price || {},
        stockCount: product.stockCount || 0,
        _id: product._id,
      }
    );
  }

  if (!variantId) return null;

  const normalizedVariantId = String(variantId).trim();
  if (
    !normalizedVariantId ||
    normalizedVariantId === "null" ||
    normalizedVariantId === "undefined"
  ) {
    return null;
  }

  const pType = String(product.productType || "").trim().toLowerCase();
  const vType = String(product.variant?.variantType || "").trim();

  // Variant product MUST be unitOnly
  if (pType !== "variant" || vType !== "unitOnly") {
    return null;
  }

  const unitVariants = product.variant?.unitOnlyVariants;
  if (!Array.isArray(unitVariants) || unitVariants.length === 0) {
    return null;
  }

  return (
    unitVariants.find((variant) => {
      if (!variant) return false;
      const vId =
        variant._id != null
          ? String(variant._id).trim()
          : variant.id != null
            ? String(variant.id).trim()
            : "";
      return vId === normalizedVariantId;
    }) || null
  );
};

module.exports = { findProductVariant };

