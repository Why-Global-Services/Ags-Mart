const findProductVariant = (product, variantId) => {
  if (!product || !variantId) return null;

  if (product.productType === "nonVariant") {
    return String(product.nonVariant?._id) === String(variantId)
      ? product.nonVariant
      : null;
  }

  if (
    product.productType !== "variant" ||
    product.variant?.variantType !== "unitOnly"
  ) {
    return null;
  }

  return (product.variant.unitOnlyVariants || []).find(
    (variant) => String(variant._id) === String(variantId),
  ) || null;
};

module.exports = { findProductVariant };
