const test = require("node:test");
const assert = require("node:assert/strict");

const {
  validateWebhookToken,
  extractPayload,
  mapShiprocketStatus,
  canTransitionStatus,
} = require("../src/services/shipping.service");

test("Webhook Service Unit Tests", async (t) => {
  await t.test("Authentication: should validate correct webhook token", () => {
    process.env.SHIPROCKET_WEBHOOK_TOKEN = "test_secret_token_123";
    assert.equal(validateWebhookToken("test_secret_token_123"), true);
  });

  await t.test("Authentication: should reject invalid or missing token", () => {
    process.env.SHIPROCKET_WEBHOOK_TOKEN = "test_secret_token_123";
    assert.equal(validateWebhookToken("wrong_token"), false);
    assert.equal(validateWebhookToken(undefined), false);
    assert.equal(validateWebhookToken(""), false);
  });

  await t.test("Payload Extraction: should handle flat tracking webhook payload", () => {
    const flatPayload = {
      awb: "AWB123456",
      courier_name: "Blue Dart",
      current_status: "DELIVERED",
      shipment_id: "98765",
      order_id: "SR_ORD_001",
      channel_order_id: "ORD-9999",
      tracking_url: "https://shiprocket.co/track/AWB123456",
    };

    const extracted = extractPayload(flatPayload);
    assert.equal(extracted.awb, "AWB123456");
    assert.equal(extracted.shipmentId, "98765");
    assert.equal(extracted.srOrderId, "SR_ORD_001");
    assert.equal(extracted.channelOrderId, "ORD-9999");
    assert.equal(extracted.rawStatus, "DELIVERED");
    assert.equal(extracted.courierName, "Blue Dart");
    assert.equal(extracted.trackingUrl, "https://shiprocket.co/track/AWB123456");
  });

  await t.test("Payload Extraction: should handle nested data payload", () => {
    const nestedPayload = {
      data: {
        awb_code: "AWB789",
        courier: "Delhivery",
        status: "In Transit",
        shipment_id: 112233,
        channel_order_id: "ORD-5555",
      },
    };

    const extracted = extractPayload(nestedPayload);
    assert.equal(extracted.awb, "AWB789");
    assert.equal(extracted.shipmentId, "112233");
    assert.equal(extracted.channelOrderId, "ORD-5555");
    assert.equal(extracted.rawStatus, "In Transit");
    assert.equal(extracted.courierName, "Delhivery");
  });

  await t.test("Status Mapping: should map Shipped / In Transit / Out for Delivery", () => {
    assert.equal(mapShiprocketStatus("SHIPPED"), "Shipped");
    assert.equal(mapShiprocketStatus("IN TRANSIT"), "Shipped");
    assert.equal(mapShiprocketStatus("in-transit"), "Shipped");
    assert.equal(mapShiprocketStatus("PICKED UP"), "Shipped");
    assert.equal(mapShiprocketStatus("OUT FOR DELIVERY"), "Shipped");
    assert.equal(mapShiprocketStatus("REACHED AT DESTINATION"), "Shipped");
  });

  await t.test("Status Mapping: should map Delivered", () => {
    assert.equal(mapShiprocketStatus("DELIVERED"), "Delivered");
    assert.equal(mapShiprocketStatus("Delivered"), "Delivered");
  });

  await t.test("Status Mapping: should map Cancelled", () => {
    assert.equal(mapShiprocketStatus("CANCELLED"), "Cancelled");
    assert.equal(mapShiprocketStatus("CANCELED"), "Cancelled");
  });

  await t.test("Status Mapping: should map Returned / RTO", () => {
    assert.equal(mapShiprocketStatus("RTO INITIATED"), "Returned");
    assert.equal(mapShiprocketStatus("RTO DELIVERED"), "Returned");
    assert.equal(mapShiprocketStatus("RETURNED"), "Returned");
    assert.equal(mapShiprocketStatus("UNDELIVERED"), "Returned");
  });

  await t.test("Status Mapping: should map Packing / Manifested / Confirmed", () => {
    assert.equal(mapShiprocketStatus("NEW"), "Packing");
    assert.equal(mapShiprocketStatus("ORDER CONFIRMED"), "Packing");
    assert.equal(mapShiprocketStatus("MANIFEST GENERATED"), "Packing");
    assert.equal(mapShiprocketStatus("READY TO SHIP"), "Packing");
  });

  await t.test("Status Mapping: should return null for unknown status", () => {
    assert.equal(mapShiprocketStatus("CUSTOM_UNKNOWN_STATUS"), null);
    assert.equal(mapShiprocketStatus(""), null);
    assert.equal(mapShiprocketStatus(null), null);
  });

  await t.test("Transition & Idempotency: should allow forward progression", () => {
    assert.equal(canTransitionStatus("Pending", "Ordered"), true);
    assert.equal(canTransitionStatus("Ordered", "Packing"), true);
    assert.equal(canTransitionStatus("Packing", "Shipped"), true);
    assert.equal(canTransitionStatus("Shipped", "Delivered"), true);
  });

  await t.test("Transition & Idempotency: should prevent out-of-order regression", () => {
    // Cannot regress from Shipped to Packing
    assert.equal(canTransitionStatus("Shipped", "Packing"), false);
    // Cannot regress from Delivered to Shipped
    assert.equal(canTransitionStatus("Delivered", "Shipped"), false);
    // Cannot regress from Delivered to Packing
    assert.equal(canTransitionStatus("Delivered", "Packing"), false);
  });

  await t.test("Transition & Idempotency: should preserve terminal statuses", () => {
    // Cancelled cannot be overwritten by shipment updates
    assert.equal(canTransitionStatus("Cancelled", "Shipped"), false);
    assert.equal(canTransitionStatus("Cancelled", "Delivered"), false);
    assert.equal(canTransitionStatus("Cancelled", "Packing"), false);

    // Returned cannot be overwritten by in-transit updates
    assert.equal(canTransitionStatus("Returned", "Shipped"), false);
    assert.equal(canTransitionStatus("Returned", "Packing"), false);

    // Delivered can transition to Returned (customer returns item)
    assert.equal(canTransitionStatus("Delivered", "Returned"), true);
  });

  await t.test("Transition & Idempotency: duplicate event should not trigger transition", () => {
    assert.equal(canTransitionStatus("Shipped", "Shipped"), false);
    assert.equal(canTransitionStatus("Delivered", "Delivered"), false);
  });
});
