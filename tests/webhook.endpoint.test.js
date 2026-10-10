const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const app = require("../app");
const { orderDetailsModel } = require("../src/models/orders.model");

test("Shiprocket Webhook HTTP Endpoint Tests", async (t) => {
  let server;
  let baseUrl;
  const TEST_TOKEN = "test_webhook_secret_key_456";

  t.before(async () => {
    process.env.SHIPROCKET_WEBHOOK_TOKEN = TEST_TOKEN;
    await new Promise((resolve) => {
      server = http.createServer(app).listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  t.after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  await t.test("POST /v1/shipping/webhook - should return 401 when x-api-key is missing", async () => {
    const res = await fetch(`${baseUrl}/v1/shipping/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current_status: "DELIVERED" }),
    });

    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.code, 401);
  });

  await t.test("POST /v1/shipping/webhook - should return 401 when x-api-key is invalid", async () => {
    const res = await fetch(`${baseUrl}/v1/shipping/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "invalid_wrong_token",
      },
      body: JSON.stringify({ current_status: "DELIVERED" }),
    });

    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.code, 401);
  });

  await t.test("POST /v1/shipping/webhook - should return 200 with matched: false when order is not found (Shiprocket test ping / dummy)", async () => {
    // Mock orderDetailsModel.findOne to return null
    const originalFindOne = orderDetailsModel.findOne;
    orderDetailsModel.findOne = async () => null;

    try {
      const res = await fetch(`${baseUrl}/v1/shipping/webhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": TEST_TOKEN,
        },
        body: JSON.stringify({
          shipment_id: "9999999",
          current_status: "SHIPPED",
          channel_order_id: "ORD-NONEXISTENT",
        }),
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.matched, false);
      assert.equal(data.identifiers.shipmentId, "9999999");
      assert.equal(data.identifiers.channelOrderId, "ORD-NONEXISTENT");
    } finally {
      orderDetailsModel.findOne = originalFindOne;
    }
  });

  await t.test("POST /v1/shipping/webhook - should return 200 with matched: false for empty test payload with no identifiers", async () => {
    const res = await fetch(`${baseUrl}/v1/shipping/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": TEST_TOKEN,
      },
      body: JSON.stringify({}),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.matched, false);
  });

  await t.test("POST /v1/shipping/webhook - should authenticate via Bearer token in Authorization header", async () => {
    const res = await fetch(`${baseUrl}/v1/shipping/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authorization": `Bearer ${TEST_TOKEN}`,
      },
      body: JSON.stringify({}),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
  });

  await t.test("GET /v1/shipping/webhook - should return 200 for dashboard endpoint validation ping", async () => {
    const res = await fetch(`${baseUrl}/v1/shipping/webhook`, {
      method: "GET",
      headers: {
        "x-api-key": TEST_TOKEN,
      },
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
  });

  await t.test("HEAD /v1/shipping/webhook - should return 200 for HEAD ping", async () => {
    const res = await fetch(`${baseUrl}/v1/shipping/webhook`, {
      method: "HEAD",
      headers: {
        "x-api-key": TEST_TOKEN,
      },
    });

    assert.equal(res.status, 200);
  });

  await t.test("POST /v1/shipping/webhook - should successfully update matching order to Shipped", async () => {
    const mockOrder = {
      _id: "mongo_mock_id_1",
      orderId: "ORD-TEST-100",
      orderStatus: "Ordered",
      shiprocket: {
        shipmentId: "SR_SHIP_100",
        awbCode: null,
        courierName: null,
        status: "NEW",
      },
      paymentMethod: "RazorPay",
      paymentStatus: "Completed",
    };

    let updatedSetFields = null;
    const originalFindOne = orderDetailsModel.findOne;
    const originalFindOneAndUpdate = orderDetailsModel.findOneAndUpdate;
    const originalUpdateOne = orderDetailsModel.updateOne;

    orderDetailsModel.findOne = async () => mockOrder;
    orderDetailsModel.findOneAndUpdate = async (query, update) => {
      updatedSetFields = update.$set;
      return {
        ...mockOrder,
        orderStatus: update.$set.orderStatus || mockOrder.orderStatus,
        shiprocket: {
          ...mockOrder.shiprocket,
          ...update.$set["shiprocket.awbCode"] && { awbCode: update.$set["shiprocket.awbCode"] },
          ...update.$set["shiprocket.courierName"] && { courierName: update.$set["shiprocket.courierName"] },
          ...update.$set["shiprocket.trackingUrl"] && { trackingUrl: update.$set["shiprocket.trackingUrl"] },
        },
      };
    };
    orderDetailsModel.updateOne = async () => ({ acknowledged: true });

    try {
      const res = await fetch(`${baseUrl}/v1/shipping/webhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": TEST_TOKEN,
        },
        body: JSON.stringify({
          shipment_id: "SR_SHIP_100",
          awb: "AWB998877",
          courier_name: "Delhivery Surface",
          current_status: "IN TRANSIT",
          tracking_url: "https://shiprocket.co/tracking/AWB998877",
        }),
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.orderStatus, "Shipped");
      assert.equal(updatedSetFields.orderStatus, "Shipped");
      assert.equal(updatedSetFields["shiprocket.awbCode"], "AWB998877");
      assert.equal(updatedSetFields["shiprocket.courierName"], "Delhivery Surface");
    } finally {
      orderDetailsModel.findOne = originalFindOne;
      orderDetailsModel.findOneAndUpdate = originalFindOneAndUpdate;
      orderDetailsModel.updateOne = originalUpdateOne;
    }
  });

  await t.test("POST /v1/shipping/webhook - should transition Shipped to Delivered and complete COD payment", async () => {
    const mockOrder = {
      _id: "mongo_mock_id_2",
      orderId: "ORD-TEST-200",
      orderStatus: "Shipped",
      shiprocket: {
        shipmentId: "SR_SHIP_200",
        awbCode: "AWB111222",
        status: "IN TRANSIT",
      },
      paymentMethod: "COD",
      paymentStatus: "Pending",
    };

    let updatedSetFields = null;
    const originalFindOne = orderDetailsModel.findOne;
    const originalFindOneAndUpdate = orderDetailsModel.findOneAndUpdate;
    const originalUpdateOne = orderDetailsModel.updateOne;

    orderDetailsModel.findOne = async () => mockOrder;
    orderDetailsModel.findOneAndUpdate = async (query, update) => {
      updatedSetFields = update.$set;
      return {
        ...mockOrder,
        orderStatus: update.$set.orderStatus,
        paymentStatus: update.$set.paymentStatus || mockOrder.paymentStatus,
      };
    };
    orderDetailsModel.updateOne = async () => ({ acknowledged: true });

    try {
      const res = await fetch(`${baseUrl}/v1/shipping/webhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": TEST_TOKEN,
        },
        body: JSON.stringify({
          awb: "AWB111222",
          current_status: "DELIVERED",
        }),
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.orderStatus, "Delivered");
      assert.equal(updatedSetFields.orderStatus, "Delivered");
      assert.equal(updatedSetFields.paymentStatus, "Completed");
    } finally {
      orderDetailsModel.findOne = originalFindOne;
      orderDetailsModel.findOneAndUpdate = originalFindOneAndUpdate;
      orderDetailsModel.updateOne = originalUpdateOne;
    }
  });

  await t.test("POST /v1/shipping/webhook - duplicate delivery should be idempotent and preserve status", async () => {
    const mockOrder = {
      _id: "mongo_mock_id_3",
      orderId: "ORD-TEST-300",
      orderStatus: "Delivered",
      shiprocket: {
        shipmentId: "SR_SHIP_300",
        awbCode: "AWB333444",
        status: "DELIVERED",
      },
    };

    let updatedSetFields = null;
    const originalFindOne = orderDetailsModel.findOne;
    const originalFindOneAndUpdate = orderDetailsModel.findOneAndUpdate;
    const originalUpdateOne = orderDetailsModel.updateOne;

    orderDetailsModel.findOne = async () => mockOrder;
    orderDetailsModel.findOneAndUpdate = async (query, update) => {
      updatedSetFields = update.$set;
      return mockOrder;
    };
    orderDetailsModel.updateOne = async () => ({ acknowledged: true });

    try {
      const res = await fetch(`${baseUrl}/v1/shipping/webhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": TEST_TOKEN,
        },
        body: JSON.stringify({
          shipment_id: "SR_SHIP_300",
          current_status: "DELIVERED",
        }),
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.orderStatus, "Delivered");
      // orderStatus should NOT have been included in update since it did not transition
      assert.equal(updatedSetFields.orderStatus, undefined);
    } finally {
      orderDetailsModel.findOne = originalFindOne;
      orderDetailsModel.findOneAndUpdate = originalFindOneAndUpdate;
      orderDetailsModel.updateOne = originalUpdateOne;
    }
  });

  await t.test("POST /v1/shipping/webhook - out of order event should not regress Delivered to In Transit", async () => {
    const mockOrder = {
      _id: "mongo_mock_id_4",
      orderId: "ORD-TEST-400",
      orderStatus: "Delivered",
      shiprocket: {
        shipmentId: "SR_SHIP_400",
        awbCode: "AWB444555",
        status: "DELIVERED",
      },
    };

    let updatedSetFields = null;
    const originalFindOne = orderDetailsModel.findOne;
    const originalFindOneAndUpdate = orderDetailsModel.findOneAndUpdate;
    const originalUpdateOne = orderDetailsModel.updateOne;

    orderDetailsModel.findOne = async () => mockOrder;
    orderDetailsModel.findOneAndUpdate = async (query, update) => {
      updatedSetFields = update.$set;
      return mockOrder;
    };
    orderDetailsModel.updateOne = async () => ({ acknowledged: true });

    try {
      const res = await fetch(`${baseUrl}/v1/shipping/webhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": TEST_TOKEN,
        },
        body: JSON.stringify({
          shipment_id: "SR_SHIP_400",
          current_status: "IN TRANSIT",
        }),
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.orderStatus, "Delivered"); // Preserved Delivered!
      assert.equal(updatedSetFields.orderStatus, undefined);
    } finally {
      orderDetailsModel.findOne = originalFindOne;
      orderDetailsModel.findOneAndUpdate = originalFindOneAndUpdate;
      orderDetailsModel.updateOne = originalUpdateOne;
    }
  });

  await t.test("POST /v1/shipping/webhook - should transition Delivered to Returned on RTO event", async () => {
    const mockOrder = {
      _id: "mongo_mock_id_5",
      orderId: "ORD-TEST-500",
      orderStatus: "Delivered",
      shiprocket: {
        shipmentId: "SR_SHIP_500",
        awbCode: "AWB555666",
        status: "DELIVERED",
      },
    };

    let updatedSetFields = null;
    const originalFindOne = orderDetailsModel.findOne;
    const originalFindOneAndUpdate = orderDetailsModel.findOneAndUpdate;
    const originalUpdateOne = orderDetailsModel.updateOne;

    orderDetailsModel.findOne = async () => mockOrder;
    orderDetailsModel.findOneAndUpdate = async (query, update) => {
      updatedSetFields = update.$set;
      return {
        ...mockOrder,
        orderStatus: update.$set.orderStatus,
      };
    };
    orderDetailsModel.updateOne = async () => ({ acknowledged: true });

    try {
      const res = await fetch(`${baseUrl}/v1/shipping/webhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": TEST_TOKEN,
        },
        body: JSON.stringify({
          shipment_id: "SR_SHIP_500",
          current_status: "RTO INITIATED",
        }),
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.orderStatus, "Returned");
      assert.equal(updatedSetFields.orderStatus, "Returned");
    } finally {
      orderDetailsModel.findOne = originalFindOne;
      orderDetailsModel.findOneAndUpdate = originalFindOneAndUpdate;
      orderDetailsModel.updateOne = originalUpdateOne;
    }
  });
});
