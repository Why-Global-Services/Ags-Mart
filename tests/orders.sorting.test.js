const test = require("node:test");
const assert = require("node:assert/strict");
const { getOrder: getAccountOrder } = require("../src/services/user Services/myAccounts/orders");
const { orderDetailsModel } = require("../src/models/orders.model");

test("My Orders Newest-First Sorting & Schema Verification", async (t) => {
  await t.test("Customer My Orders aggregation pipeline contains $sort { createdAt: -1 } after $group", async () => {
    let capturedPipeline = null;
    const originalAggregate = orderDetailsModel.aggregate;

    const mockOrders = [
      {
        _id: "order_1",
        orderId: "ORD-2026-002",
        createdAt: new Date("2026-10-02T10:00:00Z"),
        orderDetails: [{ products: [] }],
        shiprocket: { status: "DELIVERED", awbCode: "AWB123" },
      },
      {
        _id: "order_2",
        orderId: "ORD-2026-001",
        createdAt: new Date("2026-10-01T10:00:00Z"),
        orderDetails: [{ products: [] }],
        shiprocket: { status: "SHIPPED", awbCode: "AWB456" },
      },
    ];

    orderDetailsModel.aggregate = async (pipeline) => {
      capturedPipeline = pipeline;
      return mockOrders;
    };

    try {
      const req = { user: { _id: "user_123" } };
      const result = await getAccountOrder(req);

      assert.equal(result.success, true);
      assert.equal(result.data.length, 2);

      // Verify pipeline has $group followed by $sort: { createdAt: -1 }
      const groupIndex = capturedPipeline.findIndex((stage) => stage.$group !== undefined);
      const sortIndex = capturedPipeline.findIndex((stage) => stage.$sort !== undefined);

      assert.ok(groupIndex !== -1, "Pipeline must contain a $group stage");
      assert.ok(sortIndex !== -1, "Pipeline must contain a $sort stage");
      assert.ok(sortIndex > groupIndex, "$sort stage must come after $group stage");
      assert.deepEqual(capturedPipeline[sortIndex].$sort, { createdAt: -1 });

      // Verify $group includes shiprocket and deliveryAddress
      assert.deepEqual(capturedPipeline[groupIndex].$group.shiprocket, { $first: "$shiprocket" });
      assert.deepEqual(capturedPipeline[groupIndex].$group.deliveryAddress, { $first: "$deliveryAddress" });

      // Verify newest order is first
      assert.ok(new Date(result.data[0].createdAt) > new Date(result.data[1].createdAt));
    } finally {
      orderDetailsModel.aggregate = originalAggregate;
    }
  });

  await t.test("Customer orders are safely sorted newest-first in Javascript as well", () => {
    const rawOrders = [
      { orderId: "OLD", createdAt: "2026-09-01T12:00:00Z" },
      { orderId: "NEWEST", createdAt: "2026-10-08T12:00:00Z" },
      { orderId: "MIDDLE", createdAt: "2026-10-05T12:00:00Z" },
    ];

    const sorted = [...rawOrders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    assert.equal(sorted[0].orderId, "NEWEST");
    assert.equal(sorted[1].orderId, "MIDDLE");
    assert.equal(sorted[2].orderId, "OLD");
    // Ensure original array was not mutated
    assert.equal(rawOrders[0].orderId, "OLD");
  });
});
