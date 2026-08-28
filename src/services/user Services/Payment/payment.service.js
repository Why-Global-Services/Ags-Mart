const config = require("../../../config/config");
const { cart } = require("../../../models/cart.model");
const { orderDetailsModel } = require("../../../models/orders.model");
const { paymentDetailsModel } = require("../../../models/payment.model");
const stripe = require("stripe")(config.stripe.secretKey);
const mongoose = require("mongoose");

const createStripeCheckoutSession = async (
  amount,
  userId,
  orderId,
  userOrderId
) => {
  // userOrderId is UUID and orderId is Generated ID

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "Test Product",
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        orderId,
        userOrderId,
      },
      // success_url: `http://localhost:3000/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      success_url: `https://ecommercethemes.whydev.co.in/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      // cancel_url: `http://localhost:3000/checkout`,
      cancel_url: `https://ecommercethemes.whydev.co.in/checkout`,
    });

    await paymentDetailsModel.findOneAndUpdate(
      { orderId },
      {
        paymentStatus: "pending",
      }
    );

    return { success_url: session.url };
  } catch (err) {
    console.error(err);
    return { error: "Checkout session creation failed" };
  }
};

const verifyStripePayment = async (req, res) => {
  const { session_id } = req.query;

  const MAX_RETRIES = 3;
  let attempt = 0;
  let success = false;

  while (attempt < MAX_RETRIES && !success) {
    try {
      const dbSession = await mongoose.startSession();
      dbSession.startTransaction();

      const session = await stripe.checkout.sessions.retrieve(session_id, {
        expand: ["payment_intent"],
      });

      const paymentIntent = session.payment_intent;
      let data = {};

      if (session.payment_status === "paid") {
        data = {
          success: paymentIntent.status,
          paymentId: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          userId: session.metadata.userId,
          orderId: session.metadata.orderId,
        };

        const orderId = session.metadata.orderId;
        const userOrderId = session.metadata.userOrderId;
        const userId = session.metadata.userId;

        // DB operations inside transaction
        await paymentDetailsModel.findOneAndUpdate(
          { orderId: userOrderId },
          {
            stripePayOrderId: paymentIntent?.id || null,
            paymentStatus: "completed",
            pendingPaymentExpiry: null,
          },
          { new: true, session: dbSession }
        );

        await orderDetailsModel.findOneAndUpdate(
          { orderId },
          { paymentStatus: "Completed", orderStatus: "Ordered" },
          { new: true, session: dbSession }
        );

        await cart.findOneAndDelete({ userId }).session(dbSession);
      }

      await dbSession.commitTransaction();
      dbSession.endSession();

      success = true;
      return { success: true, message: "Payment completed", data };
    } catch (err) {
      console.error(`Attempt ${attempt + 1} failed:`, err.message);
      attempt += 1;
      if (attempt < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, 500)); // delay before retry
      } else {
        return {
          success: false,
          error: "Payment verification failed after retries",
          err,
        };
      }
    }
  }
};

module.exports = {
  createStripeCheckoutSession,
  verifyStripePayment,
};
