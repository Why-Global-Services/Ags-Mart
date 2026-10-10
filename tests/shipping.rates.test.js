const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const axios = require("axios");

const {
  calculateShipmentDimensions,
  getShippingRateEstimate,
} = require("../src/utils/shiprocket");
const {
  calculateOrderShippingAndPricing,
} = require("../src/services/shipping.service");
const app = require("../app");
const { orderDetailsModel } = require("../src/models/orders.model");

test("Dynamic Shipping Rates & Package Calculations", async (t) => {
  // 1. Weight & Dimensions Calculations
  await t.test("Weight & Dimensions: Empty items array returns safe defaults", () => {
    const result = calculateShipmentDimensions([]);
    assert.equal(result.weight, 0.5); // 500g fallback
    assert.equal(result.length, 10);
    assert.equal(result.breadth, 10);
    assert.equal(result.height, 10);
  });

  await t.test("Weight & Dimensions: Correctly parses gram strings (e.g., 500g, 250gm)", () => {
    const items = [
      { unit: "500g", quantity: 2 },
      { selectedUnit: "250gm", quantity: 1 },
    ];
    // (500 * 2) + (250 * 1) = 1250g = 1.25kg
    const result = calculateShipmentDimensions(items);
    assert.equal(result.weight, 1.25);
  });

  await t.test("Weight & Dimensions: Correctly parses kg strings (e.g., 1.5 kg, 2kg)", () => {
    const items = [
      { unit: "1.5 kg", quantity: 1 },
      { selectedUnit: "2kg", quantity: 2 },
    ];
    // (1500 * 1) + (2000 * 2) = 5500g = 5.5kg
    const result = calculateShipmentDimensions(items);
    assert.equal(result.weight, 5.5);
  });

  await t.test("Weight & Dimensions: Correctly parses ml and liter units", () => {
    const items = [
      { unit: "500ml", quantity: 2 },
      { selectedUnit: "1 Ltr", quantity: 1 },
    ];
    // (500 * 2) + (1000 * 1) = 2000g = 2.0kg
    const result = calculateShipmentDimensions(items);
    assert.equal(result.weight, 2.0);
  });

  await t.test("Weight & Dimensions: Falls back to 500g per item when unit/weight is missing", () => {
    const items = [
      { productName: "Test Item Without Weight", quantity: 3 },
    ];
    // 500g * 3 = 1500g = 1.5kg
    const result = calculateShipmentDimensions(items);
    assert.equal(result.weight, 1.5);
  });

  await t.test("Weight & Dimensions: Correctly stacks height and takes max length and breadth", () => {
    const items = [
      {
        shipping: {
          productWeight: 200,
          dimension: { length: 15, width: 12, height: 5 },
        },
        quantity: 2,
      },
      {
        shipping: {
          productWeight: 300,
          dimension: { length: 20, width: 10, height: 4 },
        },
        quantity: 1,
      },
    ];
    const result = calculateShipmentDimensions(items);
    // maxLength = max(15, 20) = 20
    // maxWidth = max(12, 10) = 12
    // totalHeight = (5 * 2) + (4 * 1) = 14
    // totalWeight = (200 * 2 + 300 * 1) / 1000 = 0.7kg
    assert.equal(result.length, 20);
    assert.equal(result.breadth, 12);
    assert.equal(result.height, 14);
    assert.equal(result.weight, 0.7);
  });

  // 2. Rate Estimation Logic
  await t.test("Rate Estimation: Rejects invalid pincodes immediately with fallback rate", async () => {
    const invalidPins = ["", "123", "abc123", "012345", "1234567"];
    for (const pin of invalidPins) {
      const res = await getShippingRateEstimate({ deliveryPincode: pin });
      assert.equal(res.available, false);
      assert.equal(res.fallbackApplied, true);
      assert.equal(res.rate, 50);
    }
  });

  await t.test("Rate Estimation: Sorts available couriers ascending and picks lowest rate", async () => {
    const originalPost = axios.post;
    const originalGet = axios.get;

    // Mock Shiprocket login & serviceability API
    axios.post = async (url) => {
      if (url.includes("/auth/login")) {
        return { data: { token: "mock_test_token" } };
      }
      return originalPost(url);
    };

    axios.get = async (url) => {
      if (url.includes("/courier/serviceability/")) {
        return {
          data: {
            data: {
              available_courier_companies: [
                { courier_name: "Courier Fast", rate: 120, courier_company_id: 10 },
                { courier_name: "Courier Economy", rate: 68.5, courier_company_id: 20 },
                { courier_name: "Courier Express", rate: 85, courier_company_id: 30 },
              ],
            },
          },
        };
      }
      return originalGet(url);
    };

    try {
      const res = await getShippingRateEstimate({
        pickupPincode: "600001",
        deliveryPincode: "560001",
        weight: 0.5,
        cod: 0,
        declaredValue: 500,
      });

      assert.equal(res.success, true);
      assert.equal(res.available, true);
      assert.equal(res.rate, 69); // Math.round(68.5)
      assert.equal(res.courierName, "Courier Economy");
      assert.equal(res.courierCompanyId, 20);
    } finally {
      axios.post = originalPost;
      axios.get = originalGet;
    }
  });

  await t.test("Rate Estimation: Handles COD vs Prepaid parameters properly", async () => {
    const originalPost = axios.post;
    const originalGet = axios.get;
    let capturedParams = null;

    axios.post = async () => ({ data: { token: "mock_test_token" } });
    axios.get = async (url, config) => {
      capturedParams = config.params;
      return {
        data: {
          data: {
            available_courier_companies: [
              { courier_name: "Blue Dart", rate: 80, courier_company_id: 1 },
            ],
          },
        },
      };
    };

    try {
      // Test COD = 1
      await getShippingRateEstimate({
        pickupPincode: "600001",
        deliveryPincode: "560001",
        cod: 1,
      });
      assert.equal(capturedParams.cod, 1);

      // Test Prepaid = 0
      await getShippingRateEstimate({
        pickupPincode: "600001",
        deliveryPincode: "560001",
        cod: 0,
      });
      assert.equal(capturedParams.cod, 0);
    } finally {
      axios.post = originalPost;
      axios.get = originalGet;
    }
  });

  await t.test("Rate Estimation: Gracefully falls back to 50 when Shiprocket API fails", async () => {
    const originalPost = axios.post;
    const originalGet = axios.get;

    axios.post = async () => ({ data: { token: "mock_test_token" } });
    axios.get = async () => {
      throw new Error("Shiprocket 503 Service Unavailable");
    };

    try {
      const res = await getShippingRateEstimate({
        pickupPincode: "600001",
        deliveryPincode: "560001",
        weight: 1,
      });

      assert.equal(res.rate, 50);
      assert.equal(res.fallbackApplied, true);
      assert.equal(res.available, false);
    } finally {
      axios.post = originalPost;
      axios.get = originalGet;
    }
  });

  // 3. Dynamic Rate Application For All Orders (Regardless of Subtotal)
  await t.test("Pricing Policy: Orders >= 999 apply dynamic Shiprocket courier rates (no free shipping assumed)", async () => {
    const originalPost = axios.post;
    const originalGet = axios.get;

    axios.post = async () => ({ data: { token: "mock_test_token" } });
    axios.get = async () => ({
      data: {
        data: {
          available_courier_companies: [
            { courier_name: "Blue Dart Express", rate: 85, courier_company_id: 101 },
          ],
        },
      },
    });

    try {
      const pricing = await calculateOrderShippingAndPricing({
        subtotalOverride: 1500,
        deliveryPincode: "560001",
        paymentMethod: "RazorPay",
      });

      assert.equal(pricing.shippingCharge, 85);
      assert.equal(pricing.shipping, 85);
      assert.equal(pricing.subtotal, 1500);
      assert.equal(pricing.finalTotal, 1585); // 1500 + 85
      assert.equal(pricing.quote.provider, "Shiprocket");
      assert.equal(pricing.quote.courierName, "Blue Dart Express");
    } finally {
      axios.post = originalPost;
      axios.get = originalGet;
    }
  });

  await t.test("Pricing Policy: Orders >= 999 fall back gracefully to 50 when courier API fails", async () => {
    const originalPost = axios.post;
    const originalGet = axios.get;

    axios.post = async () => ({ data: { token: "mock_test_token" } });
    axios.get = async () => {
      throw new Error("Shiprocket rate API timeout");
    };

    try {
      const pricing = await calculateOrderShippingAndPricing({
        subtotalOverride: 1200,
        deliveryPincode: "560001",
      });

      assert.equal(pricing.shippingCharge, 50);
      assert.equal(pricing.finalTotal, 1250); // 1200 + 50
      assert.equal(pricing.quote.fallbackApplied, true);
    } finally {
      axios.post = originalPost;
      axios.get = originalGet;
    }
  });

  await t.test("Pricing Policy: Orders < 999 calculate dynamic Shiprocket courier rates", async () => {
    const originalPost = axios.post;
    const originalGet = axios.get;

    axios.post = async () => ({ data: { token: "mock_test_token" } });
    axios.get = async () => ({
      data: {
        data: {
          available_courier_companies: [
            { courier_name: "Delhivery Surface", rate: 65, courier_company_id: 15 },
          ],
        },
      },
    });

    try {
      const pricing = await calculateOrderShippingAndPricing({
        subtotalOverride: 450,
        deliveryPincode: "600028",
        paymentMethod: "COD",
      });

      assert.equal(pricing.shippingCharge, 65);
      assert.equal(pricing.finalTotal, 515); // 450 + 65
      assert.equal(pricing.quote.courierName, "Delhivery Surface");
    } finally {
      axios.post = originalPost;
      axios.get = originalGet;
    }
  });

  await t.test("Pricing Policy: Orders < 999 fall back gracefully to 50 on invalid pincode", async () => {
    const pricing = await calculateOrderShippingAndPricing({
      subtotalOverride: 650,
      deliveryPincode: "invalid-pin",
    });

    assert.equal(pricing.shippingCharge, 50);
    assert.equal(pricing.finalTotal, 700); // 650 + 50
    assert.equal(pricing.quote.fallbackApplied, true);
  });

  await t.test("Pricing Policy: Total agreement consistency (Estimate === Order Total === Payment Amount)", async () => {
    const originalPost = axios.post;
    const originalGet = axios.get;

    axios.post = async () => ({ data: { token: "mock_test_token" } });
    axios.get = async () => ({
      data: {
        data: {
          available_courier_companies: [
            { courier_name: "Shadowfax", rate: 70, courier_company_id: 18 },
          ],
        },
      },
    });

    try {
      const subtotal = 800;
      const pricing = await calculateOrderShippingAndPricing({
        subtotalOverride: subtotal,
        deliveryPincode: "600028",
        paymentMethod: "RazorPay",
      });

      const calculatedShipping = pricing.shippingCharge;
      const expectedTotal = subtotal + calculatedShipping;

      assert.equal(calculatedShipping, 70);
      assert.equal(pricing.finalTotal, expectedTotal);
      assert.equal(pricing.finalTotal, 870);
    } finally {
      axios.post = originalPost;
      axios.get = originalGet;
    }
  });
});

test("Shipping Rate API Endpoints", async (t) => {
  let server;
  let baseUrl;

  t.before(async () => {
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

  await t.test("POST /v1/shipping/estimate - calculates dynamic rate for order above 999 (not zero)", async () => {
    const originalPost = axios.post;
    const originalGet = axios.get;

    axios.post = async () => ({ data: { token: "mock_test_token" } });
    axios.get = async () => ({
      data: {
        data: {
          available_courier_companies: [
            { courier_name: "Blue Dart Air", rate: 95, courier_company_id: 50 },
          ],
        },
      },
    });

    try {
      const res = await fetch(`${baseUrl}/v1/shipping/estimate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subtotal: 1500,
          deliveryPincode: "560001",
        }),
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.shippingCharge, 95);
      assert.equal(body.data.finalTotal, 1595); // 1500 + 95
      assert.equal(body.data.quote.courierName, "Blue Dart Air");
    } finally {
      axios.post = originalPost;
      axios.get = originalGet;
    }
  });

  await t.test("POST /v1/user/shipping-estimate - returns fallback 50 when pincode is invalid", async () => {
    const res = await fetch(`${baseUrl}/v1/user/shipping-estimate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subtotal: 500,
        deliveryPincode: "000000", // invalid triggers fallback 50
      }),
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.shippingCharge, 50);
    assert.equal(body.data.finalTotal, 550);
    assert.equal(body.data.quote.fallbackApplied, true);
  });
});
