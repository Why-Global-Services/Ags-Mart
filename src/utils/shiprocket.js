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

let cachedPickupPincode = null;

/**
 * Extracts numeric weight in grams from a unit string (e.g., "500g", "1 kg", "250 ml").
 * Returns grams or null if unable to parse.
 */
function parseWeightFromUnit(unitStr) {
  if (!unitStr || typeof unitStr !== "string") return null;
  const str = unitStr.toLowerCase().trim();

  // e.g. "1.5 kg" or "2kg"
  const kgMatch = str.match(/([0-9.]+)\s*(?:kg|kilo|kilogram)/);
  if (kgMatch && !isNaN(parseFloat(kgMatch[1]))) {
    return Math.round(parseFloat(kgMatch[1]) * 1000);
  }

  // e.g. "500 g" or "250gm" or "500grams"
  const gMatch = str.match(/([0-9.]+)\s*(?:g|gm|gms|gram|grams)/);
  if (gMatch && !isNaN(parseFloat(gMatch[1]))) {
    return Math.round(parseFloat(gMatch[1]));
  }

  // e.g. "500 ml" or "1 l"
  const lMatch = str.match(/([0-9.]+)\s*(?:l|ltr|liter|litre)/);
  if (lMatch && !isNaN(parseFloat(lMatch[1]))) {
    return Math.round(parseFloat(lMatch[1]) * 1000);
  }
  const mlMatch = str.match(/([0-9.]+)\s*(?:ml|milliliter)/);
  if (mlMatch && !isNaN(parseFloat(mlMatch[1]))) {
    return Math.round(parseFloat(mlMatch[1]));
  }

  return null;
}

/**
 * Calculates shipment dimensions and weight for an array of items.
 * Supports varied item structures with fallback values.
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
  if (!Array.isArray(items) || items.length === 0) {
    return {
      length: 10,
      breadth: 10,
      height: 10,
      weight: 0.5,
    };
  }

  let totalWeightGrams = 0;
  let maxLength = 0;
  let maxWidth = 0;
  let totalHeight = 0;

  items.forEach((item) => {
    const shipping = item.shipping || item.selectedVariant?.shipping || {};
    const dimension = shipping.dimension || item.dimension || {};

    let weightInGrams = Number(shipping.productWeight || item.productWeight || item.weight) || 0;

    // If weight not explicitly defined, try parsing unit string
    if (weightInGrams <= 0) {
      const unit =
        item.variantDetails?.unit ||
        item.selectedUnit ||
        item.unit ||
        item.selectedVariant?.unit ||
        "";
      const parsedGrams = parseWeightFromUnit(unit);
      if (parsedGrams && parsedGrams > 0) {
        weightInGrams = parsedGrams;
      }
    }

    // Fallback to 500g default per item if still 0
    if (weightInGrams <= 0) {
      weightInGrams = 500;
    }

    const length = Number(dimension.length) > 0 ? Number(dimension.length) : 10;
    const width = Number(dimension.width || dimension.breadth) > 0 ? Number(dimension.width || dimension.breadth) : 10;
    const height = Number(dimension.height) > 0 ? Number(dimension.height) : 10;
    const qty = Math.max(1, Number(item.quantity) || 1);

    totalWeightGrams += weightInGrams * qty;
    maxLength = Math.max(maxLength, length);
    maxWidth = Math.max(maxWidth, width);
    totalHeight += height * qty;
  });

  const totalWeightKg = totalWeightGrams / 1000;

  return {
    length: Math.max(1, Math.round(maxLength || 10)),
    breadth: Math.max(1, Math.round(maxWidth || 10)),
    height: Math.max(1, Math.round(totalHeight || 10)),
    weight: parseFloat(Math.max(0.05, totalWeightKg).toFixed(3)),
  };
}

/**
 * Resolves the pickup pincode for rate calculation and shipment.
 */
async function getPickupPincode() {
  if (process.env.SHIPROCKET_PICKUP_PINCODE) {
    return String(process.env.SHIPROCKET_PICKUP_PINCODE).trim();
  }

  if (cachedPickupPincode) {
    return cachedPickupPincode;
  }

  try {
    const token = await shiprocketLogin();
    const pickupRes = await axios.get(`${SHIPROCKET_API}/settings/company/pickup`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000,
    });

    const pin = pickupRes.data?.data?.shipping_address?.[0]?.pin_code;
    if (pin) {
      cachedPickupPincode = String(pin).trim();
      return cachedPickupPincode;
    }
  } catch (err) {
    console.warn("Could not fetch pickup pincode from Shiprocket account, using fallback:", err.message);
  }

  return "600001"; // Default Tamil Nadu / Chennai fallback pincode
}

/**
 * Fetches courier serviceability and dynamic shipping rate from Shiprocket.
 * Does NOT book or create any shipment.
 *
 * @param {object} params
 * @param {string} [params.pickupPincode]
 * @param {string} params.deliveryPincode
 * @param {number} [params.weight=0.5] - in kg
 * @param {number} [params.length=10] - in cm
 * @param {number} [params.breadth=10] - in cm
 * @param {number} [params.height=10] - in cm
 * @param {number|boolean} [params.cod=0] - 1 for COD, 0 for Prepaid
 * @param {number} [params.declaredValue=0]
 * @returns {Promise<object>}
 */
async function getShippingRateEstimate({
  pickupPincode,
  deliveryPincode,
  weight = 0.5,
  length = 10,
  breadth = 10,
  height = 10,
  cod = 0,
  declaredValue = 0,
}) {
  const cleanDeliveryPin = String(deliveryPincode || "").trim();
  const pincodeRegex = /^[1-9][0-9]{5}$/;

  if (!pincodeRegex.test(cleanDeliveryPin)) {
    return {
      success: false,
      available: false,
      fallbackApplied: true,
      rate: 50,
      message: "Invalid or unsupported delivery pincode format (must be 6 digits)",
    };
  }

  const effectivePickupPin = pickupPincode ? String(pickupPincode).trim() : await getPickupPincode();

  let token;
  try {
    token = await shiprocketLogin();
  } catch (authErr) {
    console.warn("Shiprocket login failed for rate estimate:", authErr.message);
    return {
      success: false,
      available: false,
      fallbackApplied: true,
      rate: 50,
      message: "Shiprocket service unavailable, using default shipping rate",
    };
  }

  const numericWeight = Math.max(0.05, Number(weight) || 0.5);
  const isCod = cod === 1 || cod === true || cod === "COD";

  const queryParams = {
    pickup_postcode: effectivePickupPin,
    delivery_postcode: cleanDeliveryPin,
    weight: numericWeight.toFixed(3),
    cod: isCod ? 1 : 0,
    declared_value: Math.max(0, Number(declaredValue) || 0),
    length: Math.max(1, Math.round(Number(length) || 10)),
    breadth: Math.max(1, Math.round(Number(breadth) || 10)),
    height: Math.max(1, Math.round(Number(height) || 10)),
  };

  try {
    const response = await axios.get(`${SHIPROCKET_API}/courier/serviceability/`, {
      params: queryParams,
      headers: { Authorization: `Bearer ${token}` },
      timeout: 6000,
    });

    const courierData = response.data?.data;
    const availableCouriers = Array.isArray(courierData?.available_courier_companies)
      ? courierData.available_courier_companies
      : [];

    if (availableCouriers.length === 0) {
      return {
        success: true,
        available: false,
        fallbackApplied: true,
        rate: 50,
        pickupPincode: effectivePickupPin,
        deliveryPincode: cleanDeliveryPin,
        message: "No couriers available for this delivery pincode, standard rate applied",
      };
    }

    // Sort couriers by rate ascending to get the best/cheapest rate
    const validCouriers = availableCouriers
      .filter((c) => Number(c.rate) > 0)
      .sort((a, b) => Number(a.rate) - Number(b.rate));

    if (validCouriers.length === 0) {
      return {
        success: true,
        available: false,
        fallbackApplied: true,
        rate: 50,
        pickupPincode: effectivePickupPin,
        deliveryPincode: cleanDeliveryPin,
        message: "No valid rates available, standard rate applied",
      };
    }

    const bestCourier = validCouriers[0];
    const bestRate = Math.round(Number(bestCourier.rate));

    return {
      success: true,
      available: true,
      fallbackApplied: false,
      rate: bestRate,
      courierName: bestCourier.courier_name,
      courierCompanyId: bestCourier.courier_company_id,
      estimatedDays: bestCourier.estimated_delivery_days || bestCourier.etd || "3-5 days",
      pickupPincode: effectivePickupPin,
      deliveryPincode: cleanDeliveryPin,
      weight: queryParams.weight,
      dimensions: {
        length: queryParams.length,
        breadth: queryParams.breadth,
        height: queryParams.height,
      },
      allCouriers: validCouriers.slice(0, 5).map((c) => ({
        id: c.courier_company_id,
        name: c.courier_name,
        rate: Math.round(Number(c.rate)),
        etd: c.estimated_delivery_days || c.etd || "3-5 days",
      })),
    };
  } catch (error) {
    console.warn("Shiprocket serviceability API request failed:", error.response?.data?.message || error.message);
    return {
      success: false,
      available: false,
      fallbackApplied: true,
      rate: 50,
      pickupPincode: effectivePickupPin,
      deliveryPincode: cleanDeliveryPin,
      message: error.response?.data?.message || "Courier serviceability check failed, standard rate applied",
    };
  }
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
  getShippingRateEstimate,
  getPickupPincode,
  parseWeightFromUnit,
  trackShipment,
  shiprocketLogin,
  allShipmentDetails,
};