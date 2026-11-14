const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const OrdersService = require("../src/services/user Services/Orders/Orders.service");
const userService = require("../src/services/user.service");

test("Temporarily Disable COD Payment - Verification Suite", async (t) => {
  await t.test("placeOrder rejects paymentMethod 'COD' with 400 Bad Request immediately", async () => {
    const mockReq = {
      user: { _id: "user_test_123" },
      body: {
        paymentMethod: "COD",
        cartItems: [],
      },
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

  await t.test("placeOrder rejects lowercase 'cod' and mixed case 'Cod'", async () => {
    for (const codVariant of ["cod", "Cod", "cOd", "COD"]) {
      const mockReq = {
        user: { _id: "user_test_123" },
        body: {
          paymentMethod: codVariant,
          cartItems: [],
        },
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
    }
  });

  await t.test("processPayment rejects 'COD' as secondary defense", async () => {
    await assert.rejects(
      async () => {
        await OrdersService.processPayment({
          paymentMethod: "COD",
          amount: 500,
          order: { _id: "o1", orderDetails: [{ _id: "od1" }] },
          userId: "user_123",
        });
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

  await t.test("calculateShippingCharge defaults to 'RazorPay' prepaid rate calculation", async () => {
    const estimate = await OrdersService.calculateShippingCharge({
      cartItems: [],
      subtotalAfterCoupon: 100,
    });
    assert.equal(typeof estimate.shipping, "number");
  });

  await t.test("RazorPay payment method passes COD check and proceeds into order placement", async () => {
    const originalStartSession = mongoose.startSession;

    mongoose.startSession = async () => {
      throw new Error("REACHED_DATABASE_SESSION");
    };

    try {
      const mockReq = {
        user: { _id: "user_test_123" },
        body: {
          paymentMethod: "RazorPay",
          cartItems: [{ productId: "p1", quantity: 1, price: 100 }],
        },
      };

      try {
        await OrdersService.placeOrder(mockReq);
        assert.fail("Should have reached session");
      } catch (err) {
        assert.equal(
          err.message,
          "REACHED_DATABASE_SESSION",
          "RazorPay must pass COD check and reach database session initialization"
        );
      }
    } finally {
      mongoose.startSession = originalStartSession;
    }
  });

  await t.test("Legacy userService.placeOrder rejects 'COD'", async () => {
    await assert.rejects(
      async () => {
        await userService.placeOrder({
          user: { _id: "u1" },
          body: {
            paymentMethod: "COD",
            address_id: "addr_1",
          },
        });
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
