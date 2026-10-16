const test = require("node:test");
const assert = require("node:assert/strict");
const {
  evaluateCouponEligibility,
  evaluateProductCoupon,
} = require("../src/utils/couponEligibility");
const { validateCouponPayload } = require("../src/services/admin.service");
const { errorConverter } = require("../src/middlwares/errors");
const ApiError = require("../src/utils/apiError");

test("Dynamic Coupon Eligibility & Applicability Suite", async (t) => {
  const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Helper mock orders model for order count and chained findOne.lean() checks
  const createMockOrderDetailsModel = (orderCount = 0) => ({
    countDocuments: async () => orderCount,
    findOne: () => ({
      lean: async () => (orderCount > 0 ? { _id: "existing_order_123" } : null),
    }),
  });

  // 1. ALL PRODUCTS COUPON
  await t.test("1. All-Products coupon evaluates as eligible on all non-discounted products", async () => {
    const coupon = {
      code: "ALLPROD10",
      status: "active",
      validFrom: pastDate,
      validUntil: futureDate,
      usageLimit: 100,
      usageCount: 0,
      offerType: "DISCOUNT",
      discountType: "percentage",
      discountValue: 10,
      applicabilityType: "ALL_PRODUCTS",
    };

    const cartItems = [
      { productId: "prod_1", quantity: 2, price: 100, productType: "nonVariant" },
      { productId: "prod_2", quantity: 1, price: 200, productType: "nonVariant" },
    ];

    const productMap = new Map([
      ["prod_1", { _id: "prod_1", productType: "nonVariant", nonVariant: { price: { salePrice: 100, discount: 0 } } }],
      ["prod_2", { _id: "prod_2", productType: "nonVariant", nonVariant: { price: { salePrice: 200, discount: 0 } } }],
    ]);

    const result = await evaluateCouponEligibility({
      coupon,
      items: cartItems,
      productMap,
      orderDetailsModel: createMockOrderDetailsModel(0),
    });

    assert.equal(result.isEligible, true);
    assert.equal(result.eligibleSubtotal, 400);
    assert.equal(result.discountAmount, 40); // 10% of 400 = 40
  });

  // 2. SELECTED PRODUCTS COUPON
  await t.test("2. Selected-Product coupon applies ONLY to selected products", async () => {
    const coupon = {
      code: "SELECT20",
      status: "active",
      validFrom: pastDate,
      validUntil: futureDate,
      usageLimit: 50,
      usageCount: 0,
      offerType: "DISCOUNT",
      discountType: "percentage",
      discountValue: 20,
      applicabilityType: "SELECTED_PRODUCTS",
      applicableProductIds: ["prod_selected_1", "prod_selected_2"],
    };

    // Product card evaluation
    const prod1 = { _id: "prod_selected_1", productType: "nonVariant", nonVariant: { price: { salePrice: 100, discount: 0 } } };
    const prodUnrelated = { _id: "prod_unrelated", productType: "nonVariant", nonVariant: { price: { salePrice: 200, discount: 0 } } };

    const prod1Eval = evaluateProductCoupon({ coupon, product: prod1 });
    assert.equal(prod1Eval.applies, true);

    const prodUnrelatedEval = evaluateProductCoupon({ coupon, product: prodUnrelated });
    assert.equal(prodUnrelatedEval.applies, false);

    // Cart evaluation with ONLY unrelated product
    const unrelatedCart = [{ productId: "prod_unrelated", quantity: 1, price: 300, productType: "nonVariant" }];
    const productMap = new Map([["prod_unrelated", prodUnrelated]]);

    const cartRes1 = await evaluateCouponEligibility({
      coupon,
      items: unrelatedCart,
      productMap,
      orderDetailsModel: createMockOrderDetailsModel(0),
    });

    assert.equal(cartRes1.isEligible, false);
    assert.match(cartRes1.reason, /not applicable to the products in your cart/i);
  });

  // 3. MIXED CART: ELIGIBLE + UNRELATED PRODUCTS
  await t.test("3. Mixed cart applies discount ONLY to eligible items, excluding unrelated products", async () => {
    const coupon = {
      code: "TARGETED50",
      status: "active",
      validFrom: pastDate,
      validUntil: futureDate,
      usageLimit: 100,
      usageCount: 0,
      offerType: "DISCOUNT",
      discountType: "percentage",
      discountValue: 50,
      applicabilityType: "SELECTED_PRODUCTS",
      applicableProductIds: ["prod_eligible"],
    };

    const mixedCart = [
      { productId: "prod_eligible", quantity: 1, price: 200, productType: "nonVariant" },
      { productId: "prod_unrelated", quantity: 1, price: 800, productType: "nonVariant" },
    ];

    const productMap = new Map([
      ["prod_eligible", { _id: "prod_eligible", productType: "nonVariant", nonVariant: { price: { salePrice: 200, discount: 0 } } }],
      ["prod_unrelated", { _id: "prod_unrelated", productType: "nonVariant", nonVariant: { price: { salePrice: 800, discount: 0 } } }],
    ]);

    const result = await evaluateCouponEligibility({
      coupon,
      items: mixedCart,
      productMap,
      orderDetailsModel: createMockOrderDetailsModel(0),
    });

    assert.equal(result.isEligible, true);
    assert.equal(result.eligibleSubtotal, 200); // Only prod_eligible counts
    assert.equal(result.discountAmount, 100); // 50% of 200 = 100, NOT 50% of 1000 (500)
  });

  // 4. CONDITIONAL ELIGIBILITY: MINIMUM SUBTOTAL & MINIMUM QUANTITY
  await t.test("4. Conditional coupon validates minimum subtotal and quantity thresholds accurately", async () => {
    const conditionalCoupon = {
      code: "TIERED100",
      status: "active",
      validFrom: pastDate,
      validUntil: futureDate,
      usageLimit: 10,
      usageCount: 0,
      offerType: "DISCOUNT",
      discountType: "fixed",
      discountValue: 100,
      applicabilityType: "CONDITIONAL",
      conditions: {
        minSubtotal: 500,
        minQuantity: 2,
      },
    };

    const p1Doc = { _id: "p1", productType: "nonVariant", nonVariant: { price: { salePrice: 200, discount: 0 } } };
    const productMap = new Map([["p1", p1Doc]]);

    // Case A: Below subtotal threshold (subtotal 400 < 500)
    const belowSubtotalCart = [{ productId: "p1", quantity: 2, price: 200, productType: "nonVariant" }];
    const resA = await evaluateCouponEligibility({
      coupon: conditionalCoupon,
      items: belowSubtotalCart,
      productMap,
      orderDetailsModel: createMockOrderDetailsModel(0),
    });
    assert.equal(resA.isEligible, false);
    assert.match(resA.reason, /minimum purchase/i);

    // Case B: Above subtotal but below quantity (qty 1 < 2)
    const belowQtyCart = [{ productId: "p1", quantity: 1, price: 600, productType: "nonVariant" }];
    const resB = await evaluateCouponEligibility({
      coupon: conditionalCoupon,
      items: belowQtyCart,
      productMap,
      orderDetailsModel: createMockOrderDetailsModel(0),
    });
    assert.equal(resB.isEligible, false);
    assert.match(resB.reason, /minimum 2 eligible item/i);

    // Case C: Meeting both conditions (subtotal 600 >= 500, qty 2 >= 2)
    const qualifyingCart = [{ productId: "p1", quantity: 2, price: 300, productType: "nonVariant" }];
    const resC = await evaluateCouponEligibility({
      coupon: conditionalCoupon,
      items: qualifyingCart,
      productMap,
      orderDetailsModel: createMockOrderDetailsModel(0),
    });
    assert.equal(resC.isEligible, true);
    assert.equal(resC.discountAmount, 100);
  });

  // 5. DISCOUNT TYPES & CAPPING
  await t.test("5. Percentage cap and fixed discount capping prevent negative subtotal", async () => {
    const p1Doc = { _id: "p1", productType: "nonVariant", nonVariant: { price: { salePrice: 1000, discount: 0 } } };
    const productMap = new Map([["p1", p1Doc]]);

    // 5A. Percentage with maxDiscountAmount
    const pctCappedCoupon = {
      code: "CAP50",
      status: "active",
      validFrom: pastDate,
      validUntil: futureDate,
      offerType: "DISCOUNT",
      discountType: "percentage",
      discountValue: 50,
      maxDiscountAmount: 150,
      applicabilityType: "ALL_PRODUCTS",
    };

    const cartA = [{ productId: "p1", quantity: 1, price: 1000, productType: "nonVariant" }];
    const resA = await evaluateCouponEligibility({
      coupon: pctCappedCoupon,
      items: cartA,
      productMap,
      orderDetailsModel: createMockOrderDetailsModel(0),
    });
    assert.equal(resA.isEligible, true);
    assert.equal(resA.discountAmount, 150); // Capped at 150 instead of 500

    // 5B. Fixed discount exceeding eligible subtotal is safely capped
    const fixedExceedingCoupon = {
      code: "FLAT500",
      status: "active",
      validFrom: pastDate,
      validUntil: futureDate,
      offerType: "DISCOUNT",
      discountType: "fixed",
      discountValue: 500,
      applicabilityType: "ALL_PRODUCTS",
    };

    const smallCart = [{ productId: "p1", quantity: 1, price: 200, productType: "nonVariant" }];
    const resB = await evaluateCouponEligibility({
      coupon: fixedExceedingCoupon,
      items: smallCart,
      productMap,
      orderDetailsModel: createMockOrderDetailsModel(0),
    });
    assert.equal(resB.isEligible, true);
    assert.equal(resB.discountAmount, 200); // Capped at subtotal, never exceeds!
  });

  // 6. FREE PRODUCT COUPON
  await t.test("6. Free Product coupon evaluates accurately without monetary discount", async () => {
    const freeProductCoupon = {
      code: "FREEBIE",
      status: "active",
      validFrom: pastDate,
      validUntil: futureDate,
      offerType: "FREE_PRODUCT",
      freeProduct: {
        productId: "free_prod_1",
        variantId: "variant_1",
        productType: "variant",
      },
      applicabilityType: "ALL_PRODUCTS",
    };

    const cart = [{ productId: "regular_prod", quantity: 1, price: 300, productType: "nonVariant" }];
    const productMap = new Map([
      ["regular_prod", { _id: "regular_prod", productType: "nonVariant", nonVariant: { price: { salePrice: 300, discount: 0 } } }],
    ]);

    const res = await evaluateCouponEligibility({
      coupon: freeProductCoupon,
      items: cart,
      productMap,
      orderDetailsModel: createMockOrderDetailsModel(0),
    });
    assert.equal(res.isEligible, true);
    assert.equal(res.discountAmount, 0); // Monetary discount is 0
  });

  // 7. FIRST ORDER ONLY RESTRICTION
  await t.test("7. First-order-only coupon allows new customers and rejects existing customers", async () => {
    const firstOrderCoupon = {
      code: "WELCOME100",
      status: "active",
      validFrom: pastDate,
      validUntil: futureDate,
      offerType: "DISCOUNT",
      discountType: "fixed",
      discountValue: 100,
      firstOrderOnly: true,
      applicabilityType: "ALL_PRODUCTS",
    };

    const cart = [{ productId: "p1", quantity: 1, price: 300, productType: "nonVariant" }];
    const productMap = new Map([
      ["p1", { _id: "p1", productType: "nonVariant", nonVariant: { price: { salePrice: 300, discount: 0 } } }],
    ]);

    // New customer (orderCount: 0)
    const newCustomerRes = await evaluateCouponEligibility({
      coupon: firstOrderCoupon,
      items: cart,
      user: { _id: "new_user_1" },
      productMap,
      orderDetailsModel: createMockOrderDetailsModel(0),
    });
    assert.equal(newCustomerRes.isEligible, true);

    // Existing customer (orderCount: 1)
    const existingCustomerRes = await evaluateCouponEligibility({
      coupon: firstOrderCoupon,
      items: cart,
      user: { _id: "existing_user_2" },
      productMap,
      orderDetailsModel: createMockOrderDetailsModel(1),
    });
    assert.equal(existingCustomerRes.isEligible, false);
    assert.match(existingCustomerRes.reason, /only valid for your first order/i);
  });

  // 8. ALREADY-DISCOUNTED PRODUCTS POLICY
  await t.test("8. Products with promotional discounts are excluded from coupon eligibility", async () => {
    const coupon = {
      code: "NOSTACK",
      status: "active",
      validFrom: pastDate,
      validUntil: futureDate,
      offerType: "DISCOUNT",
      discountType: "percentage",
      discountValue: 10,
      applicabilityType: "ALL_PRODUCTS",
    };

    // Cart with only discounted items
    const discountedCart = [
      { productId: "promo_item", quantity: 1, price: 200, productType: "nonVariant" },
    ];
    const productMap = new Map([
      ["promo_item", { _id: "promo_item", productType: "nonVariant", nonVariant: { price: { salePrice: 200, discount: 25, costPrice: 300 } } }],
    ]);

    const res = await evaluateCouponEligibility({
      coupon,
      items: discountedCart,
      productMap,
      orderDetailsModel: createMockOrderDetailsModel(0),
    });
    assert.equal(res.isEligible, false);
    assert.match(res.reason, /already discounted/i);
  });

  // 9. ADMIN PAYLOAD VALIDATION & OPERATIONAL ERROR HANDLING
  await t.test("9. Admin payload validation and duplicate key handling return clear 400 Bad Requests", () => {
    // 9A. Invalid discount value
    assert.throws(
      () => validateCouponPayload({
        offerType: "DISCOUNT",
        discountType: "percentage",
        discountValue: 0,
      }),
      (err) => (err.statusCode === 400 || err.status === 400) && /greater than 0/i.test(err.message)
    );

    // 9B. Selected products without products
    assert.throws(
      () => validateCouponPayload({
        applicabilityType: "SELECTED_PRODUCTS",
        applicableProductIds: "[]",
      }),
      (err) => (err.statusCode === 400 || err.status === 400) && /at least one product/i.test(err.message)
    );

    // 9C. Mongo duplicate key error conversion
    const duplicateKeyError = new Error("E11000 duplicate key error collection: coupons index: code_1 dup key: { code: \"AGS20\" }");
    duplicateKeyError.name = "MongoServerError";
    duplicateKeyError.code = 11000;

    let converted = null;
    errorConverter(duplicateKeyError, {}, {}, (err) => {
      converted = err;
    });

    assert.ok(converted);
    assert.equal(converted.statusCode, 400);
    assert.equal(converted.isOperational, true);
    assert.match(converted.message, /already exists/i);
  });
});
