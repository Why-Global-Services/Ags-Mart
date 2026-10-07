const axios = require("axios");
const { Product } = require("../models/Product.model");
require("dotenv").config();

let authToken = null;
let tokenExpiry = null;

const SHIPROCKET_API =
  process.env.SHIPROCKET_API || "https://apiv2.shiprocket.in/v1/external";

async function shiprocketLogin() {
  const now = Date.now();

  if (authToken && tokenExpiry && now < tokenExpiry) {
    return authToken;
  }

  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    throw new Error("Shiprocket credentials (SHIPROCKET_EMAIL, SHIPROCKET_PASSWORD) are not configured.");
  }

  const { data } = await axios.post(`${SHIPROCKET_API}/auth/login`, {
    email,
    password,
  });

  authToken = data.token;
  tokenExpiry = now + 23 * 60 * 60 * 1000;

  return authToken;
}

/**
 * Calculates shipment dimensions and weight for an array of items.
 * Each item has:
 *   shipping: { productWeight, dimension: { length, width, height } }
 *   quantity: number
 *
 * Database Units:
 *   productWeight = grams (g)
 *   dimension (length, width, height) = centimeters (cm)
 *
 * Shiprocket API Units:
 *   weight = kilograms (kg) [grams / 1000]
 *   length, breadth, height = centimeters (cm)
 */
function calculateShipmentDimensions(items) {
  let totalWeightKg = 0;
  let maxLength = 0;
  let maxWidth = 0;
  let totalHeight = 0;

  items.forEach((item) => {
    const shipping = item.shipping || {};
    const dimension = shipping.dimension || {};

    // Database stores weight in grams -> convert to kg for Shiprocket
    const weightInGrams = Number(shipping.productWeight) || 0;
    const length = Number(dimension.length) || 0;
    const width = Number(dimension.width) || 0;
    const height = Number(dimension.height) || 0;
    const qty = Number(item.quantity) || 1;

    totalWeightKg += (weightInGrams / 1000) * qty;
    maxLength = Math.max(maxLength, length);
    maxWidth = Math.max(maxWidth, width);
    totalHeight += height * qty;
  });

  return {
    length: Math.max(1, Math.round(maxLength)),
    breadth: Math.max(1, Math.round(maxWidth)),
    height: Math.max(1, Math.round(totalHeight)),
    weight: parseFloat(Math.max(0.01, totalWeightKg).toFixed(3)),
  };
}

/**
 * Creates a Shiprocket order.
 * Inspects all products in order.orderDetails[0].products,
 * supports both unitOnly variants and non-variant products,
 * calculates combined dimensions, and maps order_items.
 */
async function createShiprocketOrder(
  order,
  deliveryAddress,
  billingAddress,
  userEmail,
  productParam,
  totalAmount
) {
  try {
    const rawProducts =
      order?.orderDetails?.[0]?.products ||
      (Array.isArray(productParam) ? productParam.flat() : productParam ? [productParam] : []);

    if (!rawProducts || rawProducts.length === 0) {
      throw new Error(`No products found in order ${order?.orderId}`);
    }

    const itemsForShipment = [];
    const orderItems = [];

    for (const p of rawProducts) {
      const productId = p.productId || (typeof p === "string" ? p : null);
      const variantId = p.variantId || null;
      const quantity = Number(p.quantity) || 1;
      const price = Number(p.price) || 0;

      if (!productId) {
        throw new Error("Product ID is missing in order product item");
      }

      const productDoc = await Product.findById(productId);
      if (!productDoc) {
        throw new Error(`Product ${productId} not found`);
      }

      let shippingDetails = null;
      let sku = "";
      let hsn = "";
      let itemName = productDoc.productName || "Product";

      if (variantId) {
        const unitVariants = productDoc.variant?.unitOnlyVariants || [];
        const variant = unitVariants.find(
          (item) => String(item._id) === String(variantId)
        );

        if (!variant) {
          throw new Error(`Variant ${variantId} not found for product ${productDoc._id}`);
        }

        if (variant.unit) {
          itemName = `${productDoc.productName || "Product"} (${variant.unit})`;
        }

        // Use variant-level shipping if defined, fallback to product-level shipping
        shippingDetails = (variant.shipping && (Number(variant.shipping.productWeight) > 0 || Number(variant.shipping.dimension?.length) > 0))
          ? variant.shipping
          : (productDoc.shipping || {});

        sku = variant.skuCode || variant.productCode || productDoc.inventory?.sku || productDoc.inventory?.productCode || String(variant._id);
        hsn = variant.shipping?.hsnCode || productDoc.shipping?.hsnCode || "";
      } else {
        shippingDetails = productDoc.shipping || {};
        sku = productDoc.nonVariant?.skuCode || productDoc.nonVariant?.productCode || productDoc.inventory?.sku || productDoc.inventory?.productCode || String(productDoc._id);
        hsn = productDoc.shipping?.hsnCode || "";
      }

      // Safe defaults if product has no shipping configured at all
      if (!shippingDetails || (!shippingDetails.productWeight && !shippingDetails.dimension?.length)) {
        shippingDetails = {
          productWeight: 500, // 500g default
          dimension: { length: 10, width: 10, height: 10 },
          hsnCode: hsn || "330499",
          shippingClass: "standard",
        };
      }

      itemsForShipment.push({
        shipping: shippingDetails,
        quantity,
      });

      orderItems.push({
        name: itemName,
        sku,
        units: quantity,
        selling_price: price,
        discount: 0,
        tax: Number(order?.orderDetails?.[0]?.taxAmount) || 0,
        hsn: hsn || "330499",
      });
    }

    const { length, weight, breadth, height } = calculateShipmentDimensions(itemsForShipment);

    // Login to Shiprocket API
    const token = await shiprocketLogin();

    const pickupRes = await axios.get(
      `${SHIPROCKET_API}/settings/company/pickup`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const pickupSlug = pickupRes.data?.data?.shipping_address?.[0]?.pickup_location;
    if (!pickupSlug) {
      throw new Error("No pickup location found in Shiprocket account");
    }

    const effectiveBilling = billingAddress || order?.billingAddress || {};
    const effectiveDelivery = deliveryAddress || order?.deliveryAddress || effectiveBilling;

    const payload = {
      order_id: order.orderId,
      order_date: new Date().toISOString().slice(0, 19).replace("T", " "),
      pickup_location: pickupSlug,
      comment: "Order via API",

      // Billing info
      billing_customer_name: effectiveBilling.fullName || "Customer",
      billing_last_name: effectiveBilling.lastName || "NA",
      billing_address: effectiveBilling.addressLine1 || "Address",
      billing_address_2: effectiveBilling.addressLine2 || effectiveBilling.landMark || "",
      billing_city: effectiveBilling.city || "City",
      billing_state: effectiveBilling.state || "State",
      billing_country: effectiveBilling.country || "India",
      billing_pincode: Number(effectiveBilling.zipCode) || 0,
      billing_email: userEmail || order?.email || "customer@example.com",
      billing_phone: effectiveBilling.phone || order?.contactNumber || "9999999999",

      // Shipping info
      shipping_is_billing: true,
      shipping_customer_name: effectiveDelivery.fullName || effectiveBilling.fullName || "Customer",
      shipping_last_name: effectiveDelivery.lastName || effectiveBilling.lastName || "NA",
      shipping_address: effectiveDelivery.addressLine1 || effectiveBilling.addressLine1 || "Address",
      shipping_address_2: effectiveDelivery.addressLine2 || effectiveDelivery.landMark || "",
      shipping_city: effectiveDelivery.city || effectiveBilling.city || "City",
      shipping_state: effectiveDelivery.state || effectiveBilling.state || "State",
      shipping_country: effectiveDelivery.country || "India",
      shipping_pincode: Number(effectiveDelivery.zipCode || effectiveBilling.zipCode) || 0,
      shipping_email: userEmail || order?.email || "customer@example.com",
      shipping_phone: effectiveDelivery.phone || effectiveBilling.phone || "9999999999",

      order_items: orderItems,

      payment_method: order.paymentMethod === "COD" ? "COD" : "Prepaid",
      shipping_charges: 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: 0,
      sub_total: Number(order?.orderDetails?.[0]?.finalAmount || order?.totalPrice || totalAmount || 0),

      length,
      breadth,
      height,
      weight,
    };

    console.log("Shiprocket Order Payload:", JSON.stringify(payload, null, 2));

    const shiprocketOrder = await axios.post(
      `${SHIPROCKET_API}/orders/create/adhoc`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("Shiprocket Order Response:", shiprocketOrder.data);
    return shiprocketOrder.data;
  } catch (error) {
    console.error(
      "Error creating Shiprocket order:",
      error.response?.data || error.message
    );
    return null;
  }
}

async function trackShipment(shipmentId) {
  const token = await shiprocketLogin();
  const { data } = await axios.get(
    `${SHIPROCKET_API}/courier/track/shipment/${shipmentId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
}

async function allShipmentDetails() {
  try {
    const token = await shiprocketLogin();
    const { data } = await axios.get(`${SHIPROCKET_API}/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    console.error("Error Fetching Shiprocket order:", error.response?.data || error.message);
    return null;
  }
}

module.exports = {
  createShiprocketOrder,
  calculateShipmentDimensions,
  trackShipment,
  shiprocketLogin,
  allShipmentDetails,
};