const findProductVariant = (product, variantId) => {
  if (!product || !variantId) return null;

  const normalizedVariantId = String(variantId).trim();
  if (!normalizedVariantId) return null;

  if (product.productType === "nonVariant") {
    const nonVariantId =
      product.nonVariant?._id != null
        ? String(product.nonVariant._id).trim()
        : product.nonVariant?.id != null
          ? String(product.nonVariant.id).trim()
          : "";
    return nonVariantId === normalizedVariantId ||
      String(product._id || "").trim() === normalizedVariantId
      ? product.nonVariant
      : null;
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
