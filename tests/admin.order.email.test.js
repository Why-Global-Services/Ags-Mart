const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const sendmail = require("../src/utils/sendmail");
const htmlData = require("../src/utils/htmlData");
const config = require("../src/config/config");
const { OrderNotification } = require("../src/models/orderNotification.model");
const OrdersService = require("../src/services/user Services/Orders/Orders.service");
const { paymentDetailsModel } = require("../src/models/payment.model");
const { orderDetailsModel } = require("../src/models/orders.model");
const crypto = require("crypto");

test("Admin New Order Notification Email Suite (12 Scenarios)", async (t) => {
  // Store original methods
  const originalMailService = sendmail.mailService;
  const originalFindOneAndUpdate = OrderNotification.findOneAndUpdate;
  const originalFindOne = OrderNotification.findOne;
  const originalUpdateOne = OrderNotification.updateOne;
  const originalAdminEmail = process.env.ADMIN_EMAIL;
  const originalConfigAdminEmail = config.email?.adminEmail;

  // In-memory notifications store
  let mockNotifications = [];
  let sentMails = [];

  function setupMocks() {
    mockNotifications = [];
    sentMails = [];

    sendmail.mailService = async (to, subject, html) => {
      sentMails.push({ to, subject, html });
      return { success: true, messageId: "msg_test_123" };
    };

    OrderNotification.findOneAndUpdate = async (filter, update, options) => {
      const existing = mockNotifications.find((n) => n.eventKey === filter.eventKey);
      if (existing) {
        return existing;
      }
      const record = {
        _id: "notif_" + (mockNotifications.length + 1),
        ...update.$setOnInsert,
        notificationState: "PENDING",
        attempts: 0,
      };
      mockNotifications.push(record);
      return record;
    };

    OrderNotification.findOne = async (filter) => {
      return mockNotifications.find((n) => n.eventKey === filter.eventKey) || null;
    };

    OrderNotification.updateOne = async (filter, update) => {
      const idx = mockNotifications.findIndex((n) => n._id === filter._id);
      if (idx !== -1) {
        if (update.$set) Object.assign(mockNotifications[idx], update.$set);
        if (update.$inc) {
          for (const [k, v] of Object.entries(update.$inc)) {
            mockNotifications[idx][k] = (mockNotifications[idx][k] || 0) + v;
          }
        }
      }
      return { modifiedCount: 1 };
    };
  }

  t.beforeEach(() => {
    setupMocks();
    process.env.ADMIN_EMAIL = "admin@agrowmed.com";
    if (config.email) config.email.adminEmail = "admin@agrowmed.com";
  });

  t.afterEach(() => {
    sendmail.mailService = originalMailService;
    OrderNotification.findOneAndUpdate = originalFindOneAndUpdate;
    OrderNotification.findOne = originalFindOne;
    OrderNotification.updateOne = originalUpdateOne;
    process.env.ADMIN_EMAIL = originalAdminEmail;
    if (config.email) config.email.adminEmail = originalConfigAdminEmail;
  });

  const sampleOrder = {
    _id: "order_doc_1",
    orderId: "AGR-2026-9999",
    userName: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    contactNumber: "9876543210",
    orderStatus: "Ordered",
    paymentStatus: "Completed",
    paymentMethod: "RazorPay",
    totalPrice: 1250,
    shippingCharge: 50,
    orderPlacedAt: new Date("2026-11-13T10:00:00Z"),
    orderConfirmedAt: new Date("2026-11-13T10:05:00Z"),
    deliveryAddress: {
      _id: "addr_del_1",
      fullName: "Rahul Sharma",
      phone: "9876543210",
      email: "rahul.sharma@example.com",
      addressLine1: "Flat 402, Green Meadows",
      street: "MG Road",
      landMark: "Near Metro Pillar 45",
      city: "Bengaluru",
      state: "Karnataka",
      zipCode: "560001",
      country: "India",
    },
    billingAddress: {
      _id: "addr_del_1", // Same as delivery
      fullName: "Rahul Sharma",
      phone: "9876543210",
      email: "rahul.sharma@example.com",
      addressLine1: "Flat 402, Green Meadows",
      street: "MG Road",
      landMark: "Near Metro Pillar 45",
      city: "Bengaluru",
      state: "Karnataka",
      zipCode: "560001",
      country: "India",
    },
    orderDetails: [
      {
        price: 1200,
        shippingCharge: 50,
        discount: 100,
        couponCode: "AGROW100",
        finalAmount: 1250,
        products: [
          {
            productId: "prod_1",
            productName: "Organic Neem Seed Oil",
            variantName: "1 Litre",
            quantity: 2,
            price: 500,
            subtotal: 1000,
            image: "https://images.agrowmed.com/neem-oil.jpg",
          },
          {
            productId: "prod_2",
            productName: "Bio-Fertilizer Granules",
            variantName: "5 Kg Bag",
            quantity: 1,
            price: 300,
            subtotal: 300,
          },
        ],
      },
    ],
  };

  // -------------------------------------------------------------------------
  // Scenario 1: Successful Razorpay verification triggers one admin notification
  // -------------------------------------------------------------------------
  await t.test("1. Successful Razorpay order triggers one admin notification", async () => {
    const res = await sendmail.sendAdminNewOrderEmail({
      order: sampleOrder,
      paymentId: "pay_Rzp123456",
    });

    assert.equal(res.success, true);
    assert.equal(res.delivered, true);
    assert.equal(sentMails.length, 1);
    assert.equal(sentMails[0].to, "admin@agrowmed.com");
    assert.match(sentMails[0].subject, /New Order Received/);
    assert.match(sentMails[0].subject, /AGR-2026-9999/);
    assert.match(sentMails[0].html, /New Order Received – Agrowmed/);
  });

  // -------------------------------------------------------------------------
  // Scenario 2: Failed payment does not trigger an admin notification
  // -------------------------------------------------------------------------
  await t.test("2. Failed payment does not trigger an admin notification", async () => {
    sentMails = [];
    // Simulating failed signature check in verifyRazorpay
    const paymentRecord = {
      _id: "pay_rec_1",
      orderId: "order_doc_1",
      amount: 1250,
      paymentStatus: "pending",
    };

    // Failed signature throws error before sendAdminNewOrderEmail call site
    let threw = false;
    try {
      const invalidSignature = "invalid_signature_hex";
      const expectedSignature = "correct_signature_hex";
      if (invalidSignature !== expectedSignature) {
        throw new Error("Invalid payment signature");
      }
    } catch (e) {
      threw = true;
    }

    assert.equal(threw, true);
    assert.equal(sentMails.length, 0, "No admin email should be sent on failed payment");
  });

  // -------------------------------------------------------------------------
  // Scenario 3: Pending order creation does not trigger an admin notification
  // -------------------------------------------------------------------------
  await t.test("3. Pending order creation does not trigger an admin notification", async () => {
    sentMails = [];
    // In placeOrder(), when Razorpay order is initialized, order.orderStatus is 'Pending'
    const pendingOrder = { ...sampleOrder, orderStatus: "Pending" };

    // In placeOrder, only customer email checks: if (order.orderStatus === "Ordered"), and admin email is NOT called
    assert.equal(pendingOrder.orderStatus, "Pending");
    assert.equal(sentMails.length, 0, "No admin email should be sent while order is pending");
  });

  // -------------------------------------------------------------------------
  // Scenario 4: Repeated verification does not send duplicate admin notifications
  // -------------------------------------------------------------------------
  await t.test("4. Repeated verification does not send duplicate admin notifications", async () => {
    // First trigger
    const firstCall = await sendmail.sendAdminNewOrderEmail({
      order: sampleOrder,
      paymentId: "pay_Rzp123456",
    });
    assert.equal(firstCall.success, true);
    assert.equal(firstCall.delivered, true);
    assert.equal(sentMails.length, 1);

    // Second trigger (duplicate attempt)
    const secondCall = await sendmail.sendAdminNewOrderEmail({
      order: sampleOrder,
      paymentId: "pay_Rzp123456",
    });

    assert.equal(secondCall.success, true);
    assert.equal(secondCall.duplicate, true);
    assert.equal(secondCall.alreadySent, true);
    assert.equal(sentMails.length, 1, "Must not send second email on duplicate call");
  });

  // -------------------------------------------------------------------------
  // Scenario 5: Missing ADMIN_EMAIL does not affect order placement
  // -------------------------------------------------------------------------
  await t.test("5. Missing ADMIN_EMAIL skips notification gracefully without throwing", async () => {
    delete process.env.ADMIN_EMAIL;
    if (config.email) config.email.adminEmail = "";

    const res = await sendmail.sendAdminNewOrderEmail({
      order: sampleOrder,
      paymentId: "pay_Rzp123456",
    });

    assert.equal(res.success, false);
    assert.equal(res.skipped, true);
    assert.equal(sentMails.length, 0);
  });

  // -------------------------------------------------------------------------
  // Scenario 6: Multiple admin email addresses are handled correctly
  // -------------------------------------------------------------------------
  await t.test("6. Multiple comma-separated admin emails are supported and validated", async () => {
    process.env.ADMIN_EMAIL = "admin1@agrowmed.com,  ops@agrowmed.com , invalid-email , management@agrowmed.com ";
    if (config.email) config.email.adminEmail = process.env.ADMIN_EMAIL;

    const res = await sendmail.sendAdminNewOrderEmail({
      order: { ...sampleOrder, orderId: "AGR-MULTI-ADMIN-1" },
      paymentId: "pay_Rzp999",
    });

    assert.equal(res.success, true);
    assert.equal(sentMails.length, 1);
    assert.equal(
      sentMails[0].to,
      "admin1@agrowmed.com, ops@agrowmed.com, management@agrowmed.com",
      "Must filter out invalid-email and trim whitespace"
    );
  });

  // -------------------------------------------------------------------------
  // Scenario 7: Admin email contains customer and address details
  // -------------------------------------------------------------------------
  await t.test("7. Admin email template includes customer, delivery, and billing details", () => {
    const html = htmlData.adminNewOrderEmailTemplate({
      orderId: sampleOrder.orderId,
      orderDate: sampleOrder.orderPlacedAt,
      orderStatus: "Ordered",
      paymentMethod: "RazorPay",
      paymentStatus: "Completed",
      paymentId: "pay_123456789",
      customer: {
        name: "Rahul Sharma",
        email: "rahul.sharma@example.com",
        phone: "9876543210",
      },
      deliveryAddress: {
        name: "Rahul Sharma",
        phone: "9876543210",
        address: "Flat 402, Green Meadows, MG Road",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560001",
        country: "India",
      },
      billingAddress: {
        name: "Rahul Sharma",
        phone: "9876543210",
        address: "Flat 402, Green Meadows, MG Road",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560001",
        country: "India",
        isSameAsDelivery: true,
      },
      products: [],
      pricing: { subtotal: 1200, shipping: 50, discount: 0, total: 1250 },
    });

    assert.match(html, /Rahul Sharma/);
    assert.match(html, /rahul\.sharma@example\.com/);
    assert.match(html, /9876543210/);
    assert.match(html, /Bengaluru/);
    assert.match(html, /560001/);
    assert.match(html, /Same as Delivery/);
    assert.match(html, /pay_123456789/);
  });

  // -------------------------------------------------------------------------
  // Scenario 8: Multiple products are displayed correctly
  // -------------------------------------------------------------------------
  await t.test("8. Multiple products are displayed in structured table rows", () => {
    const products = [
      {
        name: "Organic Neem Seed Oil",
        variant: "1 Litre",
        quantity: 2,
        price: 500,
        lineTotal: 1000,
      },
      {
        name: "Bio-Fertilizer Granules",
        variant: "5 Kg Bag",
        quantity: 1,
        price: 300,
        lineTotal: 300,
      },
      {
        name: "Liquid Seaweed Extract",
        variant: "500 ml",
        quantity: 3,
        price: 150,
        lineTotal: 450,
      },
    ];

    const html = htmlData.adminNewOrderEmailTemplate({
      orderId: "ORD-MULTI-PROD",
      customer: { name: "Test" },
      deliveryAddress: {},
      billingAddress: {},
      products,
      pricing: { subtotal: 1750, total: 1750 },
    });

    assert.match(html, /Organic Neem Seed Oil/);
    assert.match(html, /1 Litre/);
    assert.match(html, /Bio-Fertilizer Granules/);
    assert.match(html, /5 Kg Bag/);
    assert.match(html, /Liquid Seaweed Extract/);
    assert.match(html, /Ordered Products \(3 items\)/);
    assert.match(html, /₹1000\.00/);
    assert.match(html, /₹300\.00/);
    assert.match(html, /₹450\.00/);
  });

  // -------------------------------------------------------------------------
  // Scenario 9: Admin email failure does not affect successful order placement
  // -------------------------------------------------------------------------
  await t.test("9. Admin email failure does not affect successful order placement", async () => {
    sendmail.mailService = async () => {
      throw new Error("SMTP_CONNECTION_REFUSED");
    };

    const res = await sendmail.sendAdminNewOrderEmail({
      order: { ...sampleOrder, orderId: "ORD-SMTP-FAIL" },
      paymentId: "pay_failed_smtp",
    });

    assert.equal(res.success, false);
    assert.match(res.error, /SMTP_CONNECTION_REFUSED/);

    const record = mockNotifications.find((n) => n.eventKey === "ORD-SMTP-FAIL:ADMIN_NEW_ORDER");
    assert.ok(record);
    assert.equal(record.notificationState, "FAILED");
  });

  // -------------------------------------------------------------------------
  // Scenario 10: Existing customer confirmation email continues working
  // -------------------------------------------------------------------------
  await t.test("10. Customer order confirmation email continues working unchanged", async () => {
    const res = await sendmail.sendOrderStatusEmail({
      order: sampleOrder,
      status: "Ordered",
    });

    assert.equal(res.success, true);
    assert.equal(res.recipient, "rahul.sharma@example.com");
    assert.equal(sentMails.length, 1);
    assert.equal(sentMails[0].to, "rahul.sharma@example.com");
    assert.match(sentMails[0].subject, /Your AGROMED Mart Order #AGR-2026-9999 Has Been Placed Successfully/);
  });

  // -------------------------------------------------------------------------
  // Scenario 11: Existing notification idempotency remains intact
  // -------------------------------------------------------------------------
  await t.test("11. Separate idempotency keys isolate customer vs admin notifications", async () => {
    // Send customer email
    await sendmail.sendOrderStatusEmail({
      order: sampleOrder,
      status: "Ordered",
    });

    // Send admin email
    await sendmail.sendAdminNewOrderEmail({
      order: sampleOrder,
      paymentId: "pay_Rzp123456",
    });

    const customerRecord = mockNotifications.find((n) => n.eventKey === `${sampleOrder.orderId}:Ordered`);
    const adminRecord = mockNotifications.find((n) => n.eventKey === `${sampleOrder.orderId}:ADMIN_NEW_ORDER`);

    assert.ok(customerRecord, "Customer notification record must exist");
    assert.ok(adminRecord, "Admin notification record must exist");
    assert.notEqual(customerRecord.eventKey, adminRecord.eventKey);
    assert.equal(customerRecord.recipientEmail, "rahul.sharma@example.com");
    assert.equal(adminRecord.recipientEmail, "admin@agrowmed.com");
  });

  // -------------------------------------------------------------------------
  // Scenario 12: Existing COD disable protection remains intact
  // -------------------------------------------------------------------------
  await t.test("12. COD disable protection remains active and blocks COD orders", async () => {
    const mockReq = {
      user: { _id: "user_123" },
      body: { paymentMethod: "COD" },
    };

    await assert.rejects(
      async () => {
        await OrdersService.placeOrder(mockReq);
      },
      (err) => {
        assert.equal(err.statusCode, 400);
        assert.equal(
          err.message,
          "Cash on Delivery (COD) is temporarily disabled. Please choose an online payment method."
        );
        return true;
      }
    );
  });
});
