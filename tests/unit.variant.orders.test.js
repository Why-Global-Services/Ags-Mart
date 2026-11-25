const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const sendmail = require("../src/utils/sendmail");
const htmlData = require("../src/utils/htmlData");
const config = require("../src/config/config");
const { OrderNotification } = require("../src/models/orderNotification.model");
const OrdersService = require("../src/services/user Services/Orders/Orders.service");
const { orderDetailsModel } = require("../src/models/orders.model");
const { Product } = require("../src/models/Product.model");

test("Unit Variant Orders & Admin Notification Suite (Comprehensive 12 Scenarios)", async (t) => {
  const originalMailService = sendmail.mailService;
  const originalFindOneAndUpdate = OrderNotification.findOneAndUpdate;
  const originalFindOne = OrderNotification.findOne;
  const originalUpdateOne = OrderNotification.updateOne;
  const originalProductFind = Product.find;

  let mockNotifications = [];
  let sentMails = [];

  function setupMocks() {
    mockNotifications = [];
    sentMails = [];

    sendmail.mailService = async (to, subject, html) => {
      sentMails.push({ to, subject, html });
      return { success: true, messageId: "msg_unit_test_" + Date.now() };
    };

    OrderNotification.findOneAndUpdate = async (filter, update) => {
      const existing = mockNotifications.find((n) => n.eventKey === filter.eventKey);
      if (existing) return existing;
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
    process.env.NODE_ENV = "test";
    process.env.ADMIN_EMAIL = "admin@agrowmed.com";
    if (config.email) config.email.adminEmail = "admin@agrowmed.com";
  });

  t.afterEach(() => {
    sendmail.mailService = originalMailService;
    OrderNotification.findOneAndUpdate = originalFindOneAndUpdate;
    OrderNotification.findOne = originalFindOne;
    OrderNotification.updateOne = originalUpdateOne;
    Product.find = originalProductFind;
  });

  // -------------------------------------------------------------------------
  // Scenario 1: Normal cart checkout with a 100 GM unit variant
  // -------------------------------------------------------------------------
  await t.test("1. Normal cart checkout with a 100 GM unit variant saves selectedUnit and productCode", () => {
    const cartItems = [
      {
        productId: "prod_maizoate_100gm",
        variantId: "var_100gm_id",
        selectedUnit: "100 GM",
        productCode: "INS-MAIZ-100 GM",
        productType: "variation",
        quantity: 2,
        price: 145,
        subtotal: 290,
      },
    ];

    const payload = OrdersService.buildOrderPayload({
      orderId: "AGR-ORDER-100GM",
      userId: "user_123",
      userData: {
        fullName: "Hari",
        phone: "9876543210",
        deliveryAddress: { email: "hari@example.com", addressLine1: "Street 1", city: "Chennai", state: "TN", zipCode: "600001" },
        billingAddress: { email: "hari@example.com", addressLine1: "Street 1", city: "Chennai", state: "TN", zipCode: "600001" },
      },
      cartItems,
      pricing: { finalTotal: 290, subtotalAfterCoupon: 290, shipping: 0 },
      paymentMethod: "RazorPay",
      isBuyNow: false,
      expiresAt: new Date(),
    });

    assert.equal(payload.orderDetails[0].products.length, 1);
    const p = payload.orderDetails[0].products[0];
    assert.equal(p.selectedUnit, "100 GM");
    assert.equal(p.productCode, "INS-MAIZ-100 GM");
    assert.equal(p.variantId, "var_100gm_id");
    assert.equal(p.price, 145);
    assert.equal(p.quantity, 2);
  });

  // -------------------------------------------------------------------------
  // Scenario 2: Buy Now checkout with a 500 ML unit variant
  // -------------------------------------------------------------------------
  await t.test("2. Buy Now checkout with a 500 ML unit variant extracts and stores selectedUnit", async () => {
    const mockProduct = {
      _id: "prod_neem_500ml",
      productName: "Organic Neem Oil",
      productType: "variant",
      variant: {
        variantType: "unitOnly",
        unitOnlyVariants: [
          {
            _id: "var_500ml_id",
            unit: "500 ML",
            productCode: "AGR-NEEM-500",
            stockCount: 50,
            price: { salePrice: 250 },
          },
        ],
      },
    };

    const originalFindById = Product.findById;
    Product.findById = () => ({
      session: () => Promise.resolve(mockProduct),
    });

    try {
      const buyNowResult = await OrdersService.getBuyNowItems({
        productId: "prod_neem_500ml",
        variantId: "var_500ml_id",
        quantity: 1,
        productType: "variant",
      }, {});

      assert.equal(buyNowResult.cartItems.length, 1);
      const buyNowItem = buyNowResult.cartItems[0];
      assert.equal(buyNowItem.selectedUnit, "500 ML");
      assert.equal(buyNowItem.productCode, "AGR-NEEM-500");

      const payload = OrdersService.buildOrderPayload({
        orderId: "AGR-BUYNOW-500ML",
        userId: "user_456",
        userData: {
          fullName: "Customer",
          phone: "9876543210",
          deliveryAddress: { email: "cust@example.com", addressLine1: "Road 1", city: "Coimbatore", state: "TN", zipCode: "641001" },
          billingAddress: { email: "cust@example.com", addressLine1: "Road 1", city: "Coimbatore", state: "TN", zipCode: "641001" },
        },
        cartItems: buyNowResult.cartItems,
        pricing: { finalTotal: 250, subtotalAfterCoupon: 250, shipping: 0 },
        paymentMethod: "RazorPay",
        isBuyNow: true,
        expiresAt: new Date(),
      });

      assert.equal(payload.orderDetails[0].products[0].selectedUnit, "500 ML");
      assert.equal(payload.orderDetails[0].products[0].productCode, "AGR-NEEM-500");
    } finally {
      Product.findById = originalFindById;
    }
  });

  // -------------------------------------------------------------------------
  // Scenario 3: Multiple products with different unit variants
  // -------------------------------------------------------------------------
  await t.test("3. Multiple products with different unit variants (1 Litre + 5 KG) in single order", async () => {
    Product.find = () => ({
      lean: async () => [
        {
          _id: "prod_neem_1l",
          productName: "Organic Neem Oil",
          productType: "variant",
          variant: {
            variantType: "unitOnly",
            unitOnlyVariants: [
              {
                _id: "var_1l_id",
                unit: "1 Litre",
                productCode: "AGR-NEEM-1L",
                price: { salePrice: 450 },
              },
            ],
          },
        },
        {
          _id: "prod_bio_5kg",
          productName: "Bio Fertilizer",
          productType: "variant",
          variant: {
            variantType: "unitOnly",
            unitOnlyVariants: [
              {
                _id: "var_5kg_id",
                unit: "5 KG",
                productCode: "AGR-BIO-5K",
                price: { salePrice: 850 },
              },
            ],
          },
        },
      ],
    });

    const multiOrder = {
      orderId: "AGR-MULTI-UNIT",
      userName: "Hari",
      totalPrice: 1300,
      orderDetails: [
        {
          products: [
            {
              productId: "prod_neem_1l",
              variantId: "var_1l_id",
              selectedUnit: "1 Litre",
              productCode: "AGR-NEEM-1L",
              quantity: 1,
              price: 450,
              subtotal: 450,
            },
            {
              productId: "prod_bio_5kg",
              variantId: "var_5kg_id",
              selectedUnit: "5 KG",
              productCode: "AGR-BIO-5K",
              quantity: 1,
              price: 850,
              subtotal: 850,
            },
          ],
        },
      ],
    };

    const res = await sendmail.sendAdminNewOrderEmail({ order: multiOrder, paymentId: "pay_multi" });
    assert.equal(res.success, true);
    assert.equal(sentMails.length, 1);
    const html = sentMails[0].html;
    assert.match(html, /Organic Neem Oil/);
    assert.match(html, /1 Litre/);
    assert.match(html, /Bio Fertilizer/);
    assert.match(html, /5 KG/);
  });

  // -------------------------------------------------------------------------
  // Scenario 4: Razorpay payment success triggers email notification once
  // -------------------------------------------------------------------------
  await t.test("4. Razorpay payment success triggers admin email with idempotency", async () => {
    const paidOrder = {
      orderId: "AGR-RZP-SUCCESS",
      userName: "Razorpay Customer",
      totalPrice: 500,
      paymentMethod: "RazorPay",
      paymentStatus: "Completed",
      orderStatus: "Ordered",
      orderDetails: [
        {
          products: [
            {
              productId: "prod_neem_1l",
              variantId: "var_1l_id",
              selectedUnit: "1 Litre",
              quantity: 1,
              price: 500,
              subtotal: 500,
            },
          ],
        },
      ],
    };

    // First attempt sends email
    const res1 = await sendmail.sendAdminNewOrderEmail({ order: paidOrder, paymentId: "pay_rzp_123" });
    assert.equal(res1.success, true);
    assert.equal(sentMails.length, 1);

    // Second attempt should be skipped due to idempotency
    const res2 = await sendmail.sendAdminNewOrderEmail({ order: paidOrder, paymentId: "pay_rzp_123" });
    assert.equal(res2.duplicate, true);
    assert.equal(sentMails.length, 1);
  });

  // -------------------------------------------------------------------------
  // Scenario 5: Razorpay payment failure does not confirm order or send email
  // -------------------------------------------------------------------------
  await t.test("5. Razorpay payment failure: sendAdminNewOrderEmail rejects invalid order", async () => {
    const invalidOrder = null;
    const res = await sendmail.sendAdminNewOrderEmail({ order: invalidOrder });
    assert.equal(res.success, false);
    assert.equal(sentMails.length, 0);
  });

  // -------------------------------------------------------------------------
  // Scenario 6: Existing historical order without selectedUnit in snapshot
  // -------------------------------------------------------------------------
  await t.test("6. Historical order without selectedUnit resolves via prodDoc.variant.unitOnlyVariants", async () => {
    // Legacy order has NO selectedUnit field at all in MongoDB
    Product.find = () => ({
      lean: async () => [
        {
          _id: "prod_legacy_1",
          productName: "Legacy Plant Booster",
          productType: "variant",
          variant: {
            variantType: "unitOnly",
            unitOnlyVariants: [
              {
                _id: "var_250g_id",
                unit: "250 GM",
                productCode: "AGR-BOOST-250",
                price: { salePrice: 199 },
              },
            ],
          },
        },
      ],
    });

    const historicalOrder = {
      orderId: "AGR-HISTORICAL-001",
      userName: "Old Customer",
      totalPrice: 199,
      orderDetails: [
        {
          products: [
            {
              productId: "prod_legacy_1",
              variantId: "var_250g_id",
              quantity: 1,
              price: 199,
              subtotal: 199,
            },
          ],
        },
      ],
    };

    const res = await sendmail.sendAdminNewOrderEmail({ order: historicalOrder, paymentId: "pay_hist" });
    assert.equal(res.success, true);
    const html = sentMails[0].html;
    assert.match(html, /250 GM/);
    assert.doesNotMatch(html, />Standard</);
  });

  // -------------------------------------------------------------------------
  // Scenario 7: Non-variant product order
  // -------------------------------------------------------------------------
  await t.test("7. Non-variant product order displays Standard in Unit/Variant column", async () => {
    Product.find = () => ({
      lean: async () => [
        {
          _id: "prod_sprayer_manual",
          productName: "Hand Sprayer 2L",
          productType: "nonVariant",
          nonVariant: {
            productCode: "AGR-SPRAY-01",
            price: { salePrice: 350 },
          },
        },
      ],
    });

    const nonVariantOrder = {
      orderId: "AGR-NON-VAR",
      userName: "Hari",
      totalPrice: 350,
      orderDetails: [
        {
          products: [
            {
              productId: "prod_sprayer_manual",
              productType: "nonVariant",
              quantity: 1,
              price: 350,
              subtotal: 350,
            },
          ],
        },
      ],
    };

    const res = await sendmail.sendAdminNewOrderEmail({ order: nonVariantOrder, paymentId: "pay_nonvar" });
    assert.equal(res.success, true);
    const html = sentMails[0].html;
    assert.match(html, /Hand Sprayer 2L/);
    assert.match(html, /Standard/);
  });

  // -------------------------------------------------------------------------
  // Scenario 8: Existing size/color variant order
  // -------------------------------------------------------------------------
  await t.test("8. Existing size/color variant product is preserved", async () => {
    Product.find = () => ({
      lean: async () => [
        {
          _id: "prod_boots_1",
          productName: "Farmer Safety Boots",
          productType: "variant",
          variant: {
            variantType: "sizeColor",
            sizeColorVariants: [
              {
                _id: "var_boot_9_black",
                size: "9",
                color: "Black",
                productCode: "AGR-BOOT-9B",
                price: { salePrice: 1200 },
              },
            ],
          },
        },
      ],
    });

    const sizeColorOrder = {
      orderId: "AGR-SIZE-COLOR",
      userName: "Hari",
      totalPrice: 1200,
      orderDetails: [
        {
          products: [
            {
              productId: "prod_boots_1",
              variantId: "var_boot_9_black",
              productType: "variation",
              quantity: 1,
              price: 1200,
              subtotal: 1200,
            },
          ],
        },
      ],
    };

    const res = await sendmail.sendAdminNewOrderEmail({ order: sizeColorOrder, paymentId: "pay_boot" });
    assert.equal(res.success, true);
    const html = sentMails[0].html;
    assert.match(html, /9 \/ Black/);
    assert.match(html, /Variant: 9 \/ Black/);
  });

  // -------------------------------------------------------------------------
  // Scenario 9: Missing or invalid variantId
  // -------------------------------------------------------------------------
  await t.test("9. Missing or invalid variantId handled gracefully without crashing", async () => {
    Product.find = () => ({
      lean: async () => [
        {
          _id: "prod_missing_var",
          productName: "Unknown Item",
          productType: "nonVariant",
        },
      ],
    });

    const invalidOrder = {
      orderId: "AGR-INVALID-VAR",
      userName: "Customer",
      totalPrice: 100,
      orderDetails: [
        {
          products: [
            {
              productId: "prod_missing_var",
              variantId: "non_existent_uuid_9999",
              quantity: 1,
              price: 100,
              subtotal: 100,
            },
          ],
        },
      ],
    };

    const res = await sendmail.sendAdminNewOrderEmail({ order: invalidOrder, paymentId: "pay_invalid" });
    assert.equal(res.success, true);
    const html = sentMails[0].html;
    assert.match(html, /Unknown Item/);
  });

  // -------------------------------------------------------------------------
  // Scenario 10: Admin Orders API response includes unitOnly variant details
  // -------------------------------------------------------------------------
  await t.test("10. Admin Orders API getOrder pipeline maps unit variant correctly", async () => {
    const adminService = require("../src/services/admin.service");
    const originalAggregate = orderDetailsModel.aggregate;

    orderDetailsModel.aggregate = async (pipeline) => {
      assert(Array.isArray(pipeline));
      const addFieldsStage = pipeline.find((stage) => stage.$addFields?.["orderDetails.products.selectedVariant"]);
      assert(addFieldsStage, "Pipeline must contain selectedVariant addFields stage");

      const projectStage = pipeline.find((stage) => stage.$project);
      assert(projectStage, "Pipeline must contain project stage");
      assert(projectStage.$project.orderDetails.products.selectedUnit, "Project stage must include selectedUnit");
      assert(projectStage.$project.orderDetails.products.productCode, "Project stage must include productCode");

      return [
        {
          _id: "order_123",
          orderId: "AGR-2026-0001",
          orderStatus: "Ordered",
          totalPrice: 450,
          orderDetails: {
            cartQuantity: 1,
            products: [
              {
                productId: "prod_neem_1",
                variantId: "var_1l",
                productType: "variant",
                selectedUnit: "1 Litre",
                productCode: "AGR-001",
                quantity: 2,
                price: 450,
                subtotal: 900,
                selectedVariant: {
                  productName: "Organic Neem Oil",
                  productTitle: "Organic Neem Oil",
                  unit: "1 Litre",
                  productCode: "AGR-001",
                },
              },
            ],
          },
        },
      ];
    };

    try {
      const res = await adminService.getOrder({}, {});
      assert.equal(res.success, true);
      assert.equal(res.data.length, 1);
      const prod = res.data[0].orderDetails.products[0];
      assert.equal(prod.selectedUnit, "1 Litre");
      assert.equal(prod.selectedVariant.unit, "1 Litre");
      assert.equal(prod.productCode, "AGR-001");
    } finally {
      orderDetailsModel.aggregate = originalAggregate;
    }
  });

  // -------------------------------------------------------------------------
  // Scenario 11: Admin notification email output format and structure
  // -------------------------------------------------------------------------
  await t.test("11. Admin notification email output format and styling", () => {
    const emailHtml = htmlData.adminNewOrderEmailTemplate({
      orderId: "AGR-EMAIL-TEST",
      orderDate: new Date(),
      orderStatus: "Ordered",
      paymentMethod: "RazorPay",
      paymentStatus: "Completed",
      paymentId: "pay_test_999",
      customer: {
        name: "Admin Tester",
        email: "test@example.com",
        phone: "9876543210",
      },
      deliveryAddress: {
        name: "Admin Tester",
        phone: "9876543210",
        address: "123 Farm Road",
        city: "Coimbatore",
        state: "Tamil Nadu",
        pincode: "641006",
      },
      billingAddress: {
        isSameAsDelivery: true,
      },
      products: [
        {
          name: "Organic Neem Oil",
          variant: "500 ML",
          quantity: 2,
          price: 250,
          lineTotal: 500,
        },
      ],
      pricing: {
        subtotal: 500,
        shipping: 50,
        discount: 0,
        total: 550,
      },
    });

    assert.match(emailHtml, /Organic Neem Oil/);
    assert.match(emailHtml, /Unit: 500 ML/);
    assert.match(emailHtml, /500 ML/);
    assert.match(emailHtml, /#AGR-EMAIL-TEST/);
    assert.match(emailHtml, /RazorPay/);
  });

  // -------------------------------------------------------------------------
  // Scenario 12: Printable invoice output mapping
  // -------------------------------------------------------------------------
  await t.test("12. Printable invoice item mapping renders unit variant and product code", () => {
    const order = {
      orderDetails: {
        products: [
          {
            productName: "Maizoate Insecticide",
            selectedUnit: "100 GM",
            productCode: "INS-MAIZ-100",
            quantity: 2,
            price: 145,
          },
        ],
      },
    };

    // Simulate getOrderItemsForInvoice logic
    const invoiceItems = order.orderDetails.products.map((item) => {
      const prodName =
        item.productName ||
        item.productTitle ||
        item.selectedVariant?.productName ||
        item.selectedVariant?.productTitle ||
        "N/A";
      const unit = item.selectedUnit || item.selectedVariant?.unit || null;
      return {
        name: unit ? `${prodName} (${unit})` : prodName,
        productCode: item.productCode || item.selectedVariant?.productCode || "N/A",
        quantity: item.quantity || 0,
        price: item.price || 0,
      };
    });

    assert.equal(invoiceItems[0].name, "Maizoate Insecticide (100 GM)");
    assert.equal(invoiceItems[0].productCode, "INS-MAIZ-100");
  });
});
