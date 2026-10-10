const sanitizeHtml = require("sanitize-html");

// htmlData.js
const currentYear = new Date().getFullYear();

exports.sendUserOtp = (mailData) => {
  const sanitizedOtp = sanitizeHtml(mailData.OTP.toString());
  const userName = mailData.name ? sanitizeHtml(mailData.name) : "Valued Farmer";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
    </head>
    <body style="margin: 0; padding: 20px; background-color: #f0fdf4; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;">
      <div style="max-width: 480px; margin: 0 auto;">
        <!-- Brand Header -->
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-flex; align-items: center; gap: 12px; padding: 12px 24px; color: #1a4a13; font-family: 'Poppins', sans-serif;">
            <h1 style="margin: 0; font-size: 26px; font-weight: 700; color: #1a4a13;">Agrowmed</h1>
          </div>
          <p style="color: #2d7a22; margin: 4px 0 0; font-size: 14px; font-weight: 500;">The Farmers' shop • Quality Agriculture Inputs</p>
        </div>

        <!-- Main Card -->
        <div style="background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 8px 30px rgba(26, 74, 19, 0.1); border: 1px solid #dcfce7;">
          
          <!-- Premium Green Gradient Header -->
          <div style="background: linear-gradient(135deg, #1a4a13 0%, #2d7a22 100%); padding: 32px 24px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600; font-family: 'Poppins', sans-serif;">Secure Verification Code</h1>
            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Access your Agrowmed account</p>
          </div>

          <!-- Content Area -->
          <div style="padding: 32px 24px; text-align: center;">
            <div style="display: inline-flex; align-items: center; gap: 8px; background: #f0fdf4; padding: 8px 20px; border-radius: 50px; margin-bottom: 20px; border: 1px solid #bbf7d0;">
              <span style="color: #1a4a13; font-size: 18px;">🌱</span>
              <p style="margin: 0; color: #1a4a13; font-weight: 600;">Hello, ${userName}!</p>
            </div>

            <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
              Use this one-time password (OTP) to securely sign in to your Agrowmed account:
            </p>

            <!-- OTP Display -->
            <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 2px dashed #4ade80; border-radius: 16px; padding: 24px; margin: 28px 0; position: relative;">
              <div style="position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: white; padding: 0 16px; color: #1a4a13; font-size: 12px; font-weight: 700; letter-spacing: 1px; border-radius: 20px; border: 1px solid #bbf7d0;">
                VERIFICATION CODE
              </div>
              <div style="font-family: 'Poppins', monospace; font-size: 38px; font-weight: 700; letter-spacing: 8px; color: #1a4a13; line-height: 1;">
                ${sanitizedOtp}
              </div>
            </div>

            <!-- Info Box -->
            <div style="background: #f9fafb; border-radius: 12px; padding: 16px; margin: 24px 0; border: 1px solid #e5e7eb;">
              <div style="display: flex; align-items: flex-start; gap: 12px;">
                <span style="color: #1a4a13; font-size: 18px;">⏳</span>
                <div style="text-align: left;">
                  <p style="margin: 0 0 4px; color: #1f2937; font-weight: 600; font-size: 14px;">Valid for 10 minutes</p>
                  <p style="margin: 0; color: #6b7280; font-size: 13px;">Please do not share this verification code with anyone.</p>
                </div>
              </div>
            </div>

            <div style="border-top: 1px solid #f3f4f6; padding-top: 20px;">
              <p style="color: #9ca3af; font-size: 13px; margin: 0;">
                Didn't request this code?<br>
                <span style="color: #4b5563;">You can safely ignore this email.</span>
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f0fdf4; padding: 20px; text-align: center; border-top: 1px solid #dcfce7;">
            <p style="margin: 0; color: #1a4a13; font-size: 12px; font-weight: 500;">
              © ${currentYear} Agrowmed. All rights reserved.<br>
              <span style="color: #4b5563; font-size: 11px;">Your trusted agricultural marketplace.</span>
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

exports.notificationTemplate = (mailData) => {
  const { email, title, message, imageURL } = mailData;

  const sanitizedTitle = title || "🌱 New Agriculture Products & Seasonal Offers!";
  const sanitizedMessage = 
    message || 
    "Discover the latest quality seeds, crop protection, fertilizers, and farm equipment at Agrowmed.";
  const sanitizedImage = 
    imageURL || 
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&h=600&fit=crop&q=80";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
    </head>
    <body style="margin: 0; padding: 20px; background: #f0fdf4; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto;">

        <!-- Header -->
        <div style="background: white; border-radius: 20px 20px 0 0; padding: 24px; text-align: center; box-shadow: 0 4px 20px rgba(26, 74, 19, 0.08);">
          <div style="display: inline-flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <div style="text-align: center;">
              <h1 style="margin: 0; font-family: 'Poppins', sans-serif; color: #1a4a13; font-size: 28px; font-weight: 800;">Agrowmed</h1>
              <p style="margin: 2px 0 0; color: #2d7a22; font-size: 14px; font-weight: 600;">The Farmers' shop</p>
            </div>
          </div>
        </div>

        <!-- Main Card -->
        <div style="background: white; border-radius: 0 0 20px 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(26, 74, 19, 0.12);">

          <!-- Content -->
          <div style="padding: 36px 32px; text-align: center;">
            <h2 style="margin: 0 0 16px; color: #1a4a13; font-family: 'Poppins', sans-serif; font-size: 24px; font-weight: 700;">${sanitizedTitle}</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.7; margin: 0 0 32px; font-family: 'Inter', sans-serif;">
              ${sanitizedMessage}
            </p>

            <!-- CTA Button -->
            <a href="https://agsmart.in/shoppage" style="display: inline-flex; align-items: center; gap: 10px; background: linear-gradient(135deg, #1a4a13 0%, #2d7a22 100%); color: white; padding: 16px 38px; border-radius: 50px; font-weight: 700; text-decoration: none; font-size: 16px; font-family: 'Poppins', sans-serif; box-shadow: 0 8px 25px rgba(26, 74, 19, 0.3); margin-bottom: 30px;">
              <span>Explore Products</span>
              <span style="font-size: 18px;">→</span>
            </a>
          </div>

          <!-- Footer -->
          <div style="background: #1a4a13; padding: 24px; text-align: center; color: white;">
            <p style="margin: 0; font-size: 12px; opacity: 0.85;">
              © ${currentYear} Agrowmed • Quality Agriculture Products & Farm Supplies
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

exports.orderStatusEmailTemplate = ({
  orderId,
  customerName = "Valued Customer",
  status = "Order Placed",
  statusMessage = "",
  courierName = null,
  awbCode = null,
  trackingUrl = null,
  orderPlacedAt = null,
  totalAmount = null,
}) => {
  const safeCustomer = sanitizeHtml(String(customerName || "Customer"));
  const safeOrderId = sanitizeHtml(String(orderId || ""));
  const safeStatus = sanitizeHtml(String(status || ""));
  const safeCourier = courierName ? sanitizeHtml(String(courierName)) : null;
  const safeAwb = awbCode ? sanitizeHtml(String(awbCode)) : null;
  const safeTrackingUrl = trackingUrl ? sanitizeHtml(String(trackingUrl)) : null;
  const safeMessage = statusMessage ? sanitizeHtml(String(statusMessage)) : "";

  // Dynamic badge accent color based on status
  let badgeColor = "#2d7a22";
  let badgeBg = "#ecfdf5";
  if (status === "Cancelled") {
    badgeColor = "#dc2626";
    badgeBg = "#fef2f2";
  } else if (status === "Returned") {
    badgeColor = "#d97706";
    badgeBg = "#fffbeb";
  } else if (status === "Shipped" || status === "Out for Delivery") {
    badgeColor = "#2563eb";
    badgeBg = "#eff6ff";
  } else if (status === "Delivered") {
    badgeColor = "#16a34a";
    badgeBg = "#f0fdf4";
  }

  const trackingSection = (safeAwb || safeCourier || safeTrackingUrl) ? `
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: left;">
      <h3 style="margin: 0 0 12px; font-size: 15px; font-weight: 700; color: #1e293b; font-family: 'Poppins', sans-serif;">
        📦 Shipment & Delivery Details
      </h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        ${safeCourier ? `
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 140px;">Courier Partner:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${safeCourier}</td>
          </tr>` : ""}
        ${safeAwb ? `
          <tr>
            <td style="padding: 6px 0; color: #64748b;">AWB / Tracking No:</td>
            <td style="padding: 6px 0; color: #0f172a; font-family: monospace; font-weight: 700;">${safeAwb}</td>
          </tr>` : ""}
      </table>
      ${safeTrackingUrl ? `
        <div style="margin-top: 16px; text-align: center;">
          <a href="${safeTrackingUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: #0284c7; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600;">
            Track Your Package &rarr;
          </a>
        </div>` : ""}
    </div>
  ` : "";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    </head>
    <body style="margin: 0; padding: 24px; background: #f8fafc; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;">
      <div style="max-width: 580px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1a4a13 0%, #2d7a22 100%); padding: 28px 24px; text-align: center; color: white;">
          <h1 style="margin: 0; font-family: 'Poppins', sans-serif; font-size: 26px; font-weight: 800; letter-spacing: 0.5px;">Ags Mart</h1>
          <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Your Trusted Agriculture & Retail Partner</p>
        </div>

        <!-- Body -->
        <div style="padding: 32px 28px;">
          <p style="margin: 0 0 16px; font-size: 16px; color: #334155;">
            Dear <strong>${safeCustomer}</strong>,
          </p>
          <p style="margin: 0 0 20px; font-size: 15px; color: #475569; line-height: 1.6;">
            We are writing to update you on the status of your order <strong>#${safeOrderId}</strong>.
          </p>

          <!-- Status Highlight Card -->
          <div style="background: ${badgeBg}; border: 1px solid ${badgeColor}33; border-radius: 12px; padding: 18px 20px; margin: 20px 0; text-align: center;">
            <p style="margin: 0 0 4px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: ${badgeColor};">
              Current Status
            </p>
            <p style="margin: 0; font-size: 22px; font-weight: 700; color: ${badgeColor}; font-family: 'Poppins', sans-serif;">
              ${safeStatus}
            </p>
            ${safeMessage ? `<p style="margin: 8px 0 0; font-size: 13px; color: #475569;">${safeMessage}</p>` : ""}
          </div>

          ${trackingSection}

          ${totalAmount ? `
            <div style="margin: 20px 0; padding: 12px 16px; background: #f1f5f9; border-radius: 8px; font-size: 14px; color: #334155; display: flex; justify-content: space-between;">
              <span>Total Order Value:</span>
              <strong>₹${Number(totalAmount).toFixed(2)}</strong>
            </div>
          ` : ""}

          <!-- Support & Help -->
          <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b; line-height: 1.6;">
            <p style="margin: 0 0 6px;">Need assistance with your order?</p>
            <p style="margin: 0;">
              Contact our support team at <a href="mailto:support@agsmart.in" style="color: #2d7a22; font-weight: 600; text-decoration: none;">support@agsmart.in</a> or visit our portal at <a href="https://agsmart.in" style="color: #2d7a22; font-weight: 600; text-decoration: none;">agsmart.in</a>.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #0f172a; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
          <p style="margin: 0 0 4px;">© ${currentYear} Ags Mart. All rights reserved.</p>
          <p style="margin: 0; font-size: 11px; opacity: 0.8;">Thank you for shopping with us!</p>
        </div>
      </div>
    </body>
    </html>
  `;
};