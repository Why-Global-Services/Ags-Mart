const axios = require("axios");

const sendOrderCreatedWhatsApp = async ({
  name,
  email,
  phone,
  orderId,
  amount,
  paymentType,
  awbNumber,
  courierName,
  shippingStatus,
}) => {
  try {
    const destination = phone.startsWith("91") ? phone : `91${phone}`;

    // Sanitize userName for AiSensy
    const rawName = name || "User";
    const userName = rawName.replace(/[^a-zA-Z0-9]/g, "");

    if (!userName || userName.length < 3) {
      throw new Error("Invalid userName after sanitization");
    }
    console.log(process.env.AISENSY_API_KEY);
    await axios.post("https://backend.aisensy.com/campaign/t1/api/v2", {
      apiKey: process.env.AISENSY_API_KEY,
      campaignName: "order_confirmed_v1", // EXACT copied name
      destination,
      userName, // REQUIRED FIELD
      templateParams: [
        name || "Customer", // {{1}}
        email || "-", // {{2}}
        orderId || "-", // {{3}}
        amount?.toString() || "0", // {{4}}
        paymentType || "COD", // {{5}}
        awbNumber || "-", // {{6}}
        courierName || "-", // {{7}}
        shippingStatus || "-", // {{8}}
      ],
    },
  {
    timeout: 10000,
  }
  );

    console.log("✅ WhatsApp Order Created message sent");
  } catch (err) {
    console.error("❌ AiSensy Error:", err.response?.data || err.message);
  }
};

module.exports = {
    sendOrderCreatedWhatsApp
};