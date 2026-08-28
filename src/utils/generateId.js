const { v4: uuidv4 } = require("uuid");

exports.generateOrderId = async () => {
  const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, ""); // Format: 240118 (YYMMDD)
  const timePart = new Date().toISOString().slice(11, 23).replace(/[:.]/g, ""); // HHMMSSmmm (milliseconds included)
  const shortId1 = uuidv4().split("-")[0].toUpperCase(); // Use first part of UUID
  const shortId2 = uuidv4().split("-")[1].toUpperCase(); // Use second part of UUID

  return `POVI-${datePart}${timePart}${shortId1}`;
};
