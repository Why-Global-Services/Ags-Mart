const axios = require("axios");
const { Product } = require("../models/Product.model");
require("dotenv").config();

let authToken = null;
let tokenExpiry = null;

async function shiprocketLogin() {
  const now = Date.now();

  if (authToken && tokenExpiry && now < tokenExpiry) {
    return authToken;
  }

  const { data } = await axios.post(`https://apiv2.shiprocket.in/v1/external/auth/login`, {
    email: "Ddlogi73011@gmail.com",
    password: "DfYi#!aYTXf8xxqt",
  });

  authToken = data.token;
  tokenExpiry = now + 23 * 60 * 60 * 1000;

  return authToken;
}

function calculateShipmentDimensions(products) {
  console.log("Calculating dimensions for products:", products);
  let totalWeight = 0;
  let maxLength = 0, maxWidth = 0, totalHeight = 0;

  products.forEach(p => {
    const { length, width, height } = p.shipping.dimension;
    const weight = p.shipping.productWeight; // in grams
    const qty = p.quantity || 1;

    totalWeight += weight * qty; // still in grams
    maxLength = Math.max(maxLength, length);
    maxWidth = Math.max(maxWidth, width);
    totalHeight += height * qty;
  });

  return {
    length: Math.ceil(maxLength / 10),   // mm → cm
    breadth: Math.ceil(maxWidth / 10),   // mm → cm
    height: Math.ceil(totalHeight / 10), // mm → cm
    weight: parseFloat((totalWeight / 1000).toFixed(2)) // grams → kg
  };
}




// async function createShiprocketOrder(order, deliveryAddress, billingAddress, userEmail, product) {
//   // console.log("Creating Shiprocket order for:", product);
//   console.log("Delivery Address:", deliveryAddress);
//   console.log("Billing Address:", billingAddress);
//   const flatProductsId = Array.isArray(product) ? product : [product];

// const productsId = flatProductsId.flat();

// const productDetails = await Promise.all(
//   productsId.map(p => {
//     // console.log("Fetching product details for:", p, typeof p);
//     return typeof p === "string"
//       ? Product.findById(p)
//       : Product.findById(p.productId);
//   })
// );


// // console.log("Product Details for Shipment:", productDetails);
  
// const {length, weight, breadth, height} = calculateShipmentDimensions(productDetails);
//   // const payload = {
//   //   order_id: order.orderId,
//   //   order_date: new Date().toISOString().slice(0, 19).replace("T", " "),
//   //   pickup_location: "warehouse", // configure in shiprocket dashboard
//   //   billing_customer_name: billingAddress.fullName,
//   //   billing_last_name: "",
//   //   billing_address: billingAddress.addressLine1,
//   //   billing_city: billingAddress.city,
//   //   billing_pincode: billingAddress.zipCode,
//   //   billing_state: billingAddress.state,
//   //   billing_country: 'India',
//   //   billing_email: userEmail,
//   //   billing_phone: billingAddress.phone,
//   //   shipping_is_billing: true,
//   //   order_items: order.orderDetails[0].products.map((p) => ({
//   //     name: p.productName || "Product",
//   //     sku: p.productId,
//   //     units: p.quantity,
//   //     selling_price: p.price,
//   //     discount: 0,
//   //     tax: 0,
//   //   })),
//   //   payment_method: order.paymentMethod === "COD" ? "COD" : "Prepaid",
//   //   sub_total: order.orderDetails[0].price,
//   //   length: length,
//   //   breadth: breadth,
//   //   height: height,
//   //   weight: weight,
//   // };

//   // console.log("Shiprocket Order Payload:", payload);

//   const payload = {
//   order_id: order.orderId, // Your internal order ID
//   order_date: new Date().toISOString().slice(0, 19).replace("T", " "), // Format: YYYY-MM-DD HH:MM:SS
//   pickup_location: "warehouse", // Your Shiprocket pickup location name
//   billing_customer_name: billingAddress.fullName || "Test User",
//   billing_last_name: billingAddress.lastName || "",
//   billing_address: billingAddress.addressLine1 || "Street Address",
//   billing_address_2: billingAddress.addressLine2 || "", // Optional second line
//   billing_city: billingAddress.city || "City",
//   billing_state: billingAddress.state || "State",
//   billing_country: "India",
//   billing_pincode: billingAddress.zipCode || "000000",
//   billing_email: userEmail || "test@example.com",
//   billing_phone: billingAddress.phone || "9999999999",

//   // Shipping
//   shipping_is_billing: true, // Use billing address as shipping
//   shipping_customer_name: billingAddress.fullName || "Test User", // Required if shipping_is_billing false
//   shipping_last_name: billingAddress.lastName || "",
//   shipping_address: billingAddress.addressLine1 || "Street Address",
//   shipping_address_2: billingAddress.addressLine2 || "",
//   shipping_city: billingAddress.city || "City",
//   shipping_state: billingAddress.state || "State",
//   shipping_country: "India",
//   shipping_pincode: billingAddress.zipCode || "000000",
//   shipping_phone: billingAddress.phone || "9999999999",

//   // Order Items
//   order_items: order.orderDetails[0].products.map((p) => ({
//     name: p.productName || "Product",
//     sku: p.productId,
//     units: p.quantity,
//     selling_price: p.price,
//     discount: 0,
//     tax: 0,
//   })),

//   payment_method: order.paymentMethod === "COD" ? "COD" : "Prepaid",
//   sub_total: order.orderDetails[0].price || 0,

//   // Shipment dimensions
//   length: length || 10, // cm
//   breadth: breadth || 10, // cm
//   height: height || 10, // cm
//   weight: weight || 0.5, // kg
// };

//   let data = null

//   console.log("Api:", process.env.SHIPROCKET_API);

// try {
//   const token = await shiprocketLogin();
//   const res = await axios.get("https://api64.ipify.org?format=json");
// console.log("Server Public IP:", res.data.ip);
//      const shiprocketOrder = await axios.post(
//     `${process.env.SHIPROCKET_API}/orders/create/adhoc`,
//     payload,
//     {
//       headers: { Authorization: `Bearer ${token}` },
//     }
//   );

//   data = shiprocketOrder;
// } catch (error) {
//   console.error("Error creating Shiprocket order:", error.response?.data || error.message);
// }

//   console.log("Shiprocket Order Response:", data);

//   return data;
// }

// 🚚 Track Shiprocket Order


async function createShiprocketOrder(order, deliveryAddress, billingAddress, userEmail, product,totalAmount) {
  try {

    console.log("order", order);
    console.log("deliveryAddress", deliveryAddress);
    console.log("billingAddress", billingAddress);
    console.log("userEmail", userEmail);
    console.log("product", product);
    // Flatten products array
    const flatProductsId = Array.isArray(product) ? product : [product];
    const productsId = flatProductsId.flat();

    // Fetch product details
    const productDetails = await Promise.all(
      productsId.map(p => 
        typeof p === "string" ? Product.findById(p) : Product.findById(p.productId)
      )
    );

    const { length, weight, breadth, height } = calculateShipmentDimensions(productDetails);

    // Login to Shiprocket API
    const token = await shiprocketLogin();

const pickupRes = await axios.get(
  "https://apiv2.shiprocket.in/v1/external/settings/company/pickup",
  { headers: { Authorization: `Bearer ${token}` } }
);

const pickupSlug = pickupRes.data?.data?.shipping_address?.[0]?.pickup_location;

if (!pickupSlug) {
  throw new Error("No pickup location found in Shiprocket account");
}


    // Build order payload
const payload = {
  order_id: order.orderId,
  order_date: new Date().toISOString().slice(0, 19).replace("T", " "),
  pickup_location: pickupSlug, // ✅ Use the slug from Shiprocket
  comment: "Order via API",

  // Billing info
  billing_customer_name: billingAddress.fullName, 
  billing_last_name: billingAddress.lastName || "NA",
  billing_address: billingAddress.addressLine1,
  billing_address_2: billingAddress.addressLine2 || "",
  billing_city: billingAddress.city,
  billing_state: billingAddress.state,
  billing_country: "India",
  billing_pincode: Number(billingAddress.zipCode),
  billing_email: userEmail,
  billing_phone: billingAddress.phone,

  // Shipping info (same as billing)
  shipping_is_billing: true,
  shipping_customer_name: billingAddress.fullName,
  shipping_last_name: billingAddress.lastName || "NA",
  shipping_address: billingAddress.addressLine1,
  shipping_address_2: billingAddress.addressLine2 || "",
  shipping_city: billingAddress.city,
  shipping_state: billingAddress.state,
  shipping_country: "India",
  shipping_pincode: Number(billingAddress.zipCode),
  shipping_email: userEmail,
  shipping_phone: billingAddress.phone,

order_items: order.orderDetails[0].products.map((p, index) => ({
  name: productDetails[index]?.productName || "Product", 
  sku: p.productId,
  units: p.quantity,
  selling_price: p.price,
  discount: 0,
  tax: order.orderDetails[0].taxAmount,
  hsn: p.hsn || 123456
})),


  payment_method: order.paymentMethod === "COD" ? "COD" : "Prepaid",
  shipping_charges: 0,
  giftwrap_charges: 0,
  transaction_charges: 0,
  total_discount: 0,
  sub_total: order.orderDetails[0].finalAmount,

  length: length || 10,
  breadth: breadth || 10,
  height: height || 10,
  weight: weight || 0.5
};



    console.log("Shiprocket Order Payload:", JSON.stringify(payload, null, 2));

    const shiprocketOrder = await axios.post(
      'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("Shiprocket Order Response:", shiprocketOrder.data);
    return shiprocketOrder.data;

  } catch (error) {
    console.error("Error creating Shiprocket order:", error.response?.data || error.message);
    return null;
  }
}



async function trackShipment(shipmentId) {
  const token = await shiprocketLogin();
  const { data } = await axios.get(
    `https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${shipmentId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
}


async function allShipmentDetails() {
  try {
    console.log("this is the kjabskjb");
    const token = await shiprocketLogin();
    const {data} = await axios.get(`https://apiv2.shiprocket.in/v1/external/orders`,{ headers: { Authorization: `Bearer ${token}` } })
    return data
  } catch (error) {
    console.error("Error Fetching Shiprocket order:", error.response?.data || error.message);
    return null;
  }

}

// if (require.main === module) {
//   (async () => {
//     try {
//       const result = await trackShipment(979724880);
//       console.log("res", JSON.stringify(result, null, 2));
//     } catch (err) {
//       console.error("err", err);
//     }
//   })();
// }

module.exports = {
    createShiprocketOrder,
    trackShipment,
    shiprocketLogin,
    allShipmentDetails,
}