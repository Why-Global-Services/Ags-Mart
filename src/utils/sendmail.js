const nodemailer = require("nodemailer");
const sanitizeHtml = require("sanitize-html");
const ncrypt = require("ncrypt-js");
const mongoose = require("mongoose");
const config = require("../config/config");
const htmlData = require("./htmlData");
const ApiError = require("../utils/apiError");
const { OrderNotification } = require("../models/orderNotification.model");
const { emailSettings } = require("../models/settingsemail.model");
require("dotenv").config();

/**
 * Resolves SMTP configuration dynamically from database EmailSetting or config/environment variables.
 */
const getSmtpConfig = async () => {
  try {
    // 1. Try DB settings first (only if MongoDB connection is open)
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const dbSettings = await emailSettings.findOne();
      if (dbSettings && dbSettings.email && dbSettings.smtpHost) {
        let email = dbSettings.email;
        let password = dbSettings.password;
        let host = dbSettings.smtpHost;

        try {
          const ncryptObject = new ncrypt(config.encryptionDecryptionKey);
          email = ncryptObject.decrypt(email);
          password = ncryptObject.decrypt(password);
          host = ncryptObject.decrypt(host);
        } catch (decryptErr) {
          // Fallback to plain if not encrypted
        }

        return {
          host,
          port: dbSettings.smtpPort || 587,
          auth: {
            user: email,
            pass: password,
          },
          tls: {
            rejectUnauthorized: false,
          },
          from: email,
        };
      }
    }
  } catch (err) {
    // DB lookup fallback
  }

  // 2. Try config / env variables
  if (config.email?.smtp?.host && config.email?.smtp?.auth?.user) {
    return {
      host: config.email.smtp.host,
      port: config.email.smtp.port || 587,
      auth: {
        user: config.email.smtp.auth.user,
        pass: config.email.smtp.auth.pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
      from: config.email.from || config.email.smtp.auth.user,
    };
  }

  // 3. Fallback to process.env directly
  if (process.env.SMTP_HOST && process.env.SMTP_USERNAME) {
    return {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
      from: process.env.EMAIL_FROM || process.env.SMTP_USERNAME,
    };
  }

  return null;
};

const mailService = async (sendTo, subject, htmlDataForMail) => {
  if (!sendTo) {
    return { success: false, message: "Recipient email is not provided" };
  }
  if (!htmlDataForMail) {
    return { success: false, message: "htmlData is not provided" };
  }

  const smtpConfig = await getSmtpConfig();

  if (!smtpConfig || !smtpConfig.host || !smtpConfig.auth?.user) {
    console.warn("⚠️ SMTP / Email configuration not available. Skipping email delivery.");
    return {
      success: false,
      disabled: true,
      message: "Email provider credentials are not configured",
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      auth: smtpConfig.auth,
      tls: smtpConfig.tls,
    });

    const sanitizedEmail = sanitizeHtml(sendTo);

    const mailOption = {
      from: smtpConfig.from,
      to: sanitizedEmail,
      subject: subject || "Agrowmed Mart Notification",
      html: htmlDataForMail,
    };

    const isMailSent = await transporter.sendMail(mailOption);

    return {
      success: true,
      message: "Mail sent successfully",
      messageId: isMailSent?.messageId,
    };
  } catch (err) {
    console.error("❌ Email transport error:", err.message);
    return {
      success: false,
      error: err.message,
      message: `Failed to send email: ${err.message}`,
    };
  }
};

exports.mailService = mailService;

exports.sendUserOtp = async (mailData) => {
  const htmlDataForMail = htmlData.sendUserOtp(mailData);
  const recipients = `${mailData.email}`;
  let email = await mailService(
    recipients,
    "Mail for user request",
    htmlDataForMail
  );

  if (!email.success && !email.disabled) {
    throw new ApiError(
      500,
      "Unable to send user request mail. please try again"
    );
  }

  return { success: true, message: "send To support team Email successfully" };
};

exports.sendNotification = async (mailData) => {
  const htmlDataForMail = htmlData.notificationTemplate(mailData);
  const recipients = mailData.email;
  let email = await mailService(
    recipients,
    "Mail for user request",
    htmlDataForMail
  );

  if (!email.success && !email.disabled) {
    throw new ApiError(
      500,
      "Unable to send user request mail. Please try again."
    );
  }

  return { success: true, message: "Sent notification email successfully" };
};

/**
 * Standard status mapping to email subject and description.
 */
const getStatusSubjectAndMessage = (status, orderId) => {
  switch (status) {
    case "Ordered":
      return {
        subject: `Your AGROMED Mart Order #${orderId} Has Been Placed Successfully`,
        message: "Thank you for your order! We have received your order and are currently preparing it for processing.",
      };
    case "Packing":
      return {
        subject: `Your AGROWMED Mart Order #${orderId} is Being Packed`,
        message: "Great news! Your items are carefully being picked and packed for shipment.",
      };
    case "Shipped":
      return {
        subject: `Your AGROWMED Mart Order #${orderId} Has Been Shipped`,
        message: "Your order is on the way! Our courier partner has picked up your package and it is in transit.",
      };
    case "Out for Delivery":
      return {
        subject: `Your AGROWMED Mart Order #${orderId} is Out for Delivery`,
        message: "Your package is out for delivery today. Please ensure someone is available at the delivery address.",
      };
    case "Delivered":
      return {
        subject: `Your AGROWMED Mart Order #${orderId} Has Been Delivered`,
        message: "Your package has been successfully delivered. We hope you love your purchase!",
      };
    case "Cancelled":
      return {
        subject: `Your AGROWMED Mart Order #${orderId} Has Been Cancelled`,
        message: "Your order has been cancelled. If this was unexpected or you have questions, please reach out to our support team.",
      };
    case "Returned":
      return {
        subject: `Update on Your AGROWMED Mart Order #${orderId} - Returned/RTO`,
        message: "Your order has been marked as returned or return-to-origin. Please contact support if you need further assistance.",
      };
    default:
      return {
        subject: `Status Update on Your AGROWMED Mart Order #${orderId}: ${status}`,
        message: `Your order status has been updated to ${status}.`,
      };
  }
};

/**
 * Sends order status email to customer with database-backed atomic idempotency.
 * Non-blocking: failures are logged and recorded in OrderNotification for safe retry.
 *
 * @param {object} params
 * @param {object} params.order - The order document
 * @param {string} params.status - Normalized order status
 * @param {string} [params.eventIdentifier] - Optional unique identifier from webhook or caller
 * @param {boolean} [params.isRetry] - Force retry if previously failed
 * @returns {Promise<object>}
 */
exports.sendOrderStatusEmail = async ({
  order,
  status,
  eventIdentifier = null,
  isRetry = false,
  courierName = null,
  awbCode = null,
  trackingUrl = null,
}) => {
  if (!order || !order.orderId || !status) {
    return { success: false, reason: "Missing order or status" };
  }

  // 1. Determine customer contact email snapshot
  const recipientEmail =
    order.deliveryAddress?.email ||
    order.billingAddress?.email ||
    order.email ||
    null;

  if (!recipientEmail || recipientEmail === "no-email@example.com") {
    console.log(`ℹ️ No valid contact email for order #${order.orderId}. Skipping customer notification.`);
    return { success: false, reason: "No contact email provided" };
  }

  const normalizedStatus = String(status).trim();
  const eventKey = eventIdentifier
    ? `${order.orderId}:${normalizedStatus}:${eventIdentifier}`
    : `${order.orderId}:${normalizedStatus}`;

  const { subject, message: statusMessage } = getStatusSubjectAndMessage(
    normalizedStatus,
    order.orderId
  );

  // Resolve base URL for frontend
  const frontendBaseUrl = (
    process.env.FRONTEND_URL && !process.env.FRONTEND_URL.includes("localhost")
      ? process.env.FRONTEND_URL
      : (process.env.NODE_ENV === "production"
          ? "https://agrowmed.com"
          : (process.env.FRONTEND_URL || "https://agrowmed.com"))
  ).replace(/\/+$/, "");

  // Dedicated Agrowmed customer tracking URL (never relative, never raw order ID as host)
  const agrowmedTrackingUrl = `${frontendBaseUrl}/track?orderId=${encodeURIComponent(order.orderId)}`;

  const resolvedCourier = courierName || order.shiprocket?.courierName || null;
  const resolvedAwb = awbCode || order.shiprocket?.awbCode || null;

  // Validate passed trackingUrl: must be genuine http/https URL, never bare channel_order_id
  const rawShiprocketUrl = trackingUrl || order.shiprocket?.trackingUrl || null;
  const validShiprocketUrl =
    rawShiprocketUrl && typeof rawShiprocketUrl === "string" && rawShiprocketUrl.startsWith("http")
      ? rawShiprocketUrl
      : (resolvedAwb ? `https://shiprocket.co/tracking/${resolvedAwb}` : null);

  const shipmentDetails = {
    awbCode: resolvedAwb,
    courierName: resolvedCourier,
    trackingUrl: agrowmedTrackingUrl,
    courierTrackingUrl: validShiprocketUrl,
    shipmentId: order.shiprocket?.shipmentId || null,
  };

  // 2. Atomic Database-Backed Idempotency Claim
  let notificationRecord;
  try {
    notificationRecord = await OrderNotification.findOneAndUpdate(
      { eventKey },
      {
        $setOnInsert: {
          orderId: order.orderId,
          status: normalizedStatus,
          eventKey,
          recipientEmail,
          customerName: order.userName || "Valued Customer",
          subject,
          shipmentDetails,
          notificationState: "PENDING",
          attempts: 0,
        },
      },
      { upsert: true, new: true }
    );
  } catch (dbErr) {
    if (dbErr.code === 11000) {
      notificationRecord = await OrderNotification.findOne({ eventKey });
    } else {
      console.error("❌ Failed to query OrderNotification record:", dbErr.message);
      return { success: false, error: dbErr.message };
    }
  }

  // Check if already successfully delivered
  if (notificationRecord.notificationState === "SENT" && !isRetry) {
    console.log(`ℹ️ Notification for ${eventKey} already sent. Skipping duplicate.`);
    return { success: true, duplicate: true, alreadySent: true };
  }

  // 3. Increment attempt count
  await OrderNotification.updateOne(
    { _id: notificationRecord._id },
    {
      $inc: { attempts: 1 },
      $set: { lastAttemptAt: new Date() },
    }
  );

  // 4. Render Email Template
  const emailHtml = htmlData.orderStatusEmailTemplate({
    orderId: order.orderId,
    customerName: order.userName,
    status: normalizedStatus,
    statusMessage,
    courierName: shipmentDetails.courierName,
    awbCode: shipmentDetails.awbCode,
    trackingUrl: shipmentDetails.trackingUrl,
    courierTrackingUrl: shipmentDetails.courierTrackingUrl,
    orderPlacedAt: order.orderPlacedAt || order.createdAt,
    totalAmount: order.totalPrice,
  });

  // 5. Attempt Send
  try {
    const sendResult = await (exports.mailService || mailService)(recipientEmail, subject, emailHtml);

    if (sendResult.success) {
      await OrderNotification.updateOne(
        { _id: notificationRecord._id },
        {
          $set: {
            notificationState: "SENT",
            deliveredAt: new Date(),
            lastError: null,
          },
        }
      );
      console.log(`✅ Order status email sent for #${order.orderId} [${normalizedStatus}]`);
      return { success: true, delivered: true, recipient: recipientEmail };
    } else if (sendResult.disabled) {
      await OrderNotification.updateOne(
        { _id: notificationRecord._id },
        {
          $set: {
            notificationState: "SKIPPED",
            lastError: sendResult.message,
          },
        }
      );
      return { success: false, disabled: true, reason: sendResult.message };
    } else {
      await OrderNotification.updateOne(
        { _id: notificationRecord._id },
        {
          $set: {
            notificationState: "FAILED",
            lastError: sendResult.error || sendResult.message,
          },
        }
      );
      return { success: false, error: sendResult.error || sendResult.message };
    }
  } catch (sendErr) {
    console.error(`❌ Unexpected error sending order status email for #${order.orderId}:`, sendErr.message);
    await OrderNotification.updateOne(
      { _id: notificationRecord._id },
      {
        $set: {
          notificationState: "FAILED",
          lastError: sendErr.message,
        },
      }
    );
    return { success: false, error: sendErr.message };
  }
};

/**
 * Sends a separate, detailed new-order notification email to the configured administrator(s).
 * Triggered exclusively after successful Razorpay payment verification and order confirmation.
 * Database-backed atomic idempotency with event key `<orderId>:ADMIN_NEW_ORDER`.
 *
 * @param {object} params
 * @param {object} params.order - Authoritative order document
 * @param {string} [params.paymentId] - Razorpay payment ID
 * @param {boolean} [params.isRetry] - Force retry if previously failed
 * @returns {Promise<object>}
 */
exports.sendAdminNewOrderEmail = async ({
  order,
  paymentId = null,
  isRetry = false,
}) => {
  if (!order || !order.orderId) {
    return { success: false, reason: "Missing order or orderId" };
  }

  // 1. Resolve and validate admin recipient email(s) from config or process.env
  const rawAdminEmails = config.email?.adminEmail || process.env.ADMIN_EMAIL || "";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const adminRecipients = (typeof rawAdminEmails === "string" ? rawAdminEmails : "")
    .split(",")
    .map((s) => s.trim())
    .filter((email) => emailRegex.test(email));

  if (adminRecipients.length === 0) {
    console.warn(
      `⚠️ ADMIN_EMAIL is not configured or contains no valid email addresses. Skipping admin order notification for order #${order.orderId}.`
    );
    return {
      success: false,
      skipped: true,
      reason: "No valid admin email configured",
    };
  }

  const eventKey = `${order.orderId}:ADMIN_NEW_ORDER`;
  const subject = `🔔 New Order Received: #${order.orderId} - ₹${Number(order.totalPrice || 0).toFixed(2)} [Razorpay Paid]`;

  // 2. Atomic Database-Backed Idempotency Claim
  let notificationRecord;
  try {
    notificationRecord = await OrderNotification.findOneAndUpdate(
      { eventKey },
      {
        $setOnInsert: {
          orderId: order.orderId,
          status: "ADMIN_NEW_ORDER",
          eventKey,
          recipientEmail: adminRecipients.join(", "),
          customerName: order.userName || "Customer",
          subject,
          notificationState: "PENDING",
          attempts: 0,
        },
      },
      { upsert: true, new: true }
    );
  } catch (dbErr) {
    if (dbErr.code === 11000) {
      notificationRecord = await OrderNotification.findOne({ eventKey });
    } else {
      console.error(
        "❌ Failed to query OrderNotification record for admin email:",
        dbErr.message
      );
      return { success: false, error: dbErr.message };
    }
  }

  // Check if already successfully delivered
  if (
    notificationRecord &&
    notificationRecord.notificationState === "SENT" &&
    !isRetry
  ) {
    console.log(
      `ℹ️ Admin notification for ${eventKey} already sent. Skipping duplicate.`
    );
    return { success: true, duplicate: true, alreadySent: true };
  }

  // 3. Increment attempt count
  if (notificationRecord && notificationRecord._id) {
    await OrderNotification.updateOne(
      { _id: notificationRecord._id },
      {
        $inc: { attempts: 1 },
        $set: { lastAttemptAt: new Date() },
      }
    );
  }

  // 4. Enrich ordered products with catalog details (names, variants, images)
  const rawItems = order.orderDetails?.[0]?.products || [];
  const productIds = rawItems
    .map((p) => p.productId)
    .filter(Boolean);

  let productMap = new Map();
  if (productIds.length > 0) {
    try {
      const { Product } = require("../models/Product.model");
      if (
        Product &&
        typeof Product.find === "function" &&
        mongoose.connection &&
        mongoose.connection.readyState === 1
      ) {
        const foundProducts = await Product.find({
          _id: { $in: productIds },
        }).lean();
        (foundProducts || []).forEach((p) => productMap.set(String(p._id), p));
      }
    } catch (lookupErr) {
      // Non-blocking catalog lookup fallback
    }
  }

  const enrichedProducts = rawItems.map((item) => {
    const prodDoc = productMap.get(String(item.productId));
    const name =
      item.productName ||
      prodDoc?.productName ||
      `Product (${item.productId})`;

    const image =
      item.productImage ||
      (Array.isArray(prodDoc?.productImages)
        ? prodDoc.productImages[0]
        : prodDoc?.productImage) ||
      null;

    let variantLabel = "—";
    if (item.variantId && prodDoc) {
      const unitVar = prodDoc.unitOnlyVariants?.find(
        (v) => String(v._id) === String(item.variantId)
      );
      const sizeColorVar = prodDoc.sizeColorVariants?.find(
        (v) => String(v._id) === String(item.variantId)
      );
      if (unitVar?.unit) {
        variantLabel = unitVar.unit;
      } else if (sizeColorVar) {
        variantLabel = `${sizeColorVar.size} / ${sizeColorVar.color}`;
      }
    } else if (item.variantName) {
      variantLabel = item.variantName;
    }

    return {
      name,
      image,
      variant: variantLabel,
      quantity: item.quantity || 1,
      price: item.price || 0,
      lineTotal: item.subtotal || (item.price || 0) * (item.quantity || 1),
    };
  });

  // 5. Compare delivery and billing addresses
  const del = order.deliveryAddress || {};
  const bill = order.billingAddress || {};
  const isSameAsDelivery =
    (del._id && bill._id && String(del._id) === String(bill._id)) ||
    (del.addressLine1 &&
      bill.addressLine1 &&
      del.addressLine1 === bill.addressLine1 &&
      del.zipCode === bill.zipCode);

  // 6. Render Admin Email Template
  const emailHtml = htmlData.adminNewOrderEmailTemplate({
    orderId: order.orderId,
    orderDate:
      order.orderConfirmedAt ||
      order.orderPlacedAt ||
      order.createdAt ||
      new Date(),
    orderStatus: order.orderStatus || "Ordered",
    paymentMethod: order.paymentMethod || "RazorPay",
    paymentStatus: order.paymentStatus || "Completed",
    paymentId: paymentId || order.paymentDetails?.razorpayPaymentId || "N/A",
    customer: {
      name: order.userName || del.fullName || "Customer",
      email: order.email || del.email || bill.email || "N/A",
      phone: order.contactNumber || del.phone || bill.phone || "N/A",
    },
    deliveryAddress: {
      name: del.fullName || order.userName || "N/A",
      phone: del.phone || order.contactNumber || "N/A",
      address:
        [del.addressLine1, del.street, del.landMark]
          .filter(Boolean)
          .join(", ") || "N/A",
      city: del.city || "",
      state: del.state || "",
      pincode: del.zipCode || "",
      country: del.country || "India",
    },
    billingAddress: {
      name: bill.fullName || "N/A",
      phone: bill.phone || "N/A",
      address:
        [bill.addressLine1, bill.street, bill.landMark]
          .filter(Boolean)
          .join(", ") || "N/A",
      city: bill.city || "",
      state: bill.state || "",
      pincode: bill.zipCode || "",
      country: bill.country || "India",
      isSameAsDelivery: Boolean(isSameAsDelivery),
    },
    products: enrichedProducts,
    pricing: {
      subtotal:
        order.orderDetails?.[0]?.price !== undefined
          ? order.orderDetails[0].price
          : order.totalPrice || 0,
      shipping:
        order.shippingCharge !== undefined
          ? order.shippingCharge
          : order.orderDetails?.[0]?.shippingCharge || 0,
      couponCode: order.orderDetails?.[0]?.couponCode || null,
      discount: order.orderDetails?.[0]?.discount || 0,
      total: order.totalPrice || order.orderDetails?.[0]?.finalAmount || 0,
    },
  });

  // 7. Dispatch Email
  try {
    const sendResult = await (exports.mailService || mailService)(
      adminRecipients.join(", "),
      subject,
      emailHtml
    );

    if (sendResult.success) {
      if (notificationRecord && notificationRecord._id) {
        await OrderNotification.updateOne(
          { _id: notificationRecord._id },
          {
            $set: {
              notificationState: "SENT",
              deliveredAt: new Date(),
              lastError: null,
            },
          }
        );
      }
      console.log(
        `✅ Admin new order notification email sent for #${order.orderId} to [${adminRecipients.join(", ")}]`
      );
      return { success: true, delivered: true, recipients: adminRecipients };
    } else if (sendResult.disabled) {
      if (notificationRecord && notificationRecord._id) {
        await OrderNotification.updateOne(
          { _id: notificationRecord._id },
          {
            $set: {
              notificationState: "SKIPPED",
              lastError: sendResult.message,
            },
          }
        );
      }
      return { success: false, disabled: true, reason: sendResult.message };
    } else {
      if (notificationRecord && notificationRecord._id) {
        await OrderNotification.updateOne(
          { _id: notificationRecord._id },
          {
            $set: {
              notificationState: "FAILED",
              lastError: sendResult.error || sendResult.message,
            },
          }
        );
      }
      return { success: false, error: sendResult.error || sendResult.message };
    }
  } catch (sendErr) {
    console.error(
      `❌ Unexpected error sending admin order email for #${order.orderId}:`,
      sendErr.message
    );
    if (notificationRecord && notificationRecord._id) {
      await OrderNotification.updateOne(
        { _id: notificationRecord._id },
        {
          $set: {
            notificationState: "FAILED",
            lastError: sendErr.message,
          },
        }
      );
    }
    return { success: false, error: sendErr.message };
  }
};
