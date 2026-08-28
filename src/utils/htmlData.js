const sanitizeHtml = require("sanitize-html");

// htmlData.js
const currentYear = new Date().getFullYear();

exports.sendUserOtp = (mailData) => {
  const sanitizedOtp = sanitizeHtml(mailData.OTP.toString());
  const userName = mailData.name ? sanitizeHtml(mailData.name) : "Valued Customer";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
    </head>
    <body style="margin: 0; padding: 20px; background-color: #f8f7f5; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;">
      <div style="max-width: 480px; margin: 0 auto;">
        <!-- Brand Header -->
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-flex; align-items: center; gap: 12px; padding: 12px 24px; color: #8b4513; font-family: 'Poppins', sans-serif;">
            <img 
              src="https://facesync.blr1.digitaloceanspaces.com/Websetting/NATURESHUNT_1770095195323_povi-logo.jpeg"
              alt="Povi's Collections Logo"
              style="height: 50px; width: auto; object-fit: contain; background: white; padding: 4px; border-radius: 6px;"
            />
            <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #d4af37;">Povi's Collections</h1>
          </div>
          <p style="color: #8b4513; margin: 8px 0 0; font-size: 14px;">Elegance. Craftsmanship. Heritage.</p>
        </div>

        <!-- Main Card -->
        <div style="background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 8px 30px rgba(139, 69, 19, 0.1); border: 1px solid #f0e6d6;">
          
          <!-- Premium Gradient Header -->
          <div style="background: linear-gradient(135deg, #d4af37 0%, #8b4513 100%); padding: 32px 24px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600; font-family: 'Poppins', sans-serif;">Secure Login Code</h1>
            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Your access to exquisite jewelry collections</p>
          </div>

          <!-- Content Area -->
          <div style="padding: 32px 24px; text-align: center;">
            <div style="display: inline-flex; align-items: center; gap: 8px; background: #f9f3e9; padding: 8px 20px; border-radius: 50px; margin-bottom: 20px;">
              <span style="color: #8b4513; font-size: 18px;">✨</span>
              <p style="margin: 0; color: #8b4513; font-weight: 500;">Hello, ${userName}!</p>
            </div>

            <p style="color: #8b4513; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
              Use this one-time code to securely access your Povi's Collections account:
            </p>

            <!-- OTP Display -->
            <div style="background: linear-gradient(135deg, #f9f3e9 0%, #f5ebdc 100%); border: 2px dashed #d4af37; border-radius: 16px; padding: 28px; margin: 32px 0; position: relative;">
              <div style="position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: white; padding: 0 16px; color: #8b4513; font-size: 13px; font-weight: 600; letter-spacing: 0.5px;">
                VERIFICATION CODE
              </div>
              <div style="font-family: 'Poppins', monospace; font-size: 40px; font-weight: 700; letter-spacing: 10px; color: #8b4513; line-height: 1;">
                ${sanitizedOtp}
              </div>
            </div>

            <!-- Info Box -->
            <div style="background: #f8f7f5; border-radius: 12px; padding: 20px; margin: 32px 0;">
              <div style="display: flex; align-items: flex-start; gap: 12px;">
                <span style="color: #d4af37; font-size: 20px;">⏳</span>
                <div style="text-align: left;">
                  <p style="margin: 0 0 4px; color: #8b4513; font-weight: 600; font-size: 15px;">Expires in 10 minutes</p>
                  <p style="margin: 0; color: #a67c52; font-size: 14px;">For security reasons, this code will automatically expire.</p>
                </div>
              </div>
            </div>

            <div style="border-top: 1px solid #f0e6d6; padding-top: 24px;">
              <p style="color: #a67c52; font-size: 14px; margin: 0;">
                Didn't request this?<br>
                <span style="color: #8b4513;">Your account may be secure - no action is needed.</span>
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f9f3e9; padding: 24px; text-align: center; border-top: 1px solid #f0e6d6;">
            <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 16px;">
              <a href="#" style="color: #8b4513; text-decoration: none; font-size: 20px;">💎</a>
              <a href="#" style="color: #8b4513; text-decoration: none; font-size: 20px;">✨</a>
              <a href="#" style="color: #8b4513; text-decoration: none; font-size: 20px;">🔮</a>
            </div>
            <p style="margin: 0; color: #8b4513; font-size: 12px;">
              © ${currentYear} Povi's Collections. Handcrafted with precision and passion.<br>
              <span style="color: #a67c52;">Timeless jewelry for every occasion.</span>
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

  const sanitizedTitle = title || "✨ Sparkling New Arrivals Have Arrived!";
  const sanitizedMessage = 
    message || 
    "Discover our latest collection of exquisite jewelry pieces. Each design is crafted with precision and passion to celebrate your special moments.";
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
    <body style="margin: 0; padding: 20px; background: linear-gradient(135deg, #f8f7f5 0%, #f9f3e9 100%); font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto;">

        <!-- Premium Header -->
        <div style="background: white; border-radius: 20px 20px 0 0; padding: 24px; text-align: center; box-shadow: 0 4px 20px rgba(139, 69, 19, 0.08);">
          <div style="display: inline-flex; align-items: center; gap: 12px; margin-bottom: 16px;">
            <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #d4af37 0%, #8b4513 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 24px; color: white;">💎</span>
            </div>
            <div style="text-align: left;">
              <h1 style="margin: 0; font-family: 'Poppins', sans-serif; color: #8b4513; font-size: 28px; font-weight: 800;">Povi's Collections</h1>
              <p style="margin: 0; color: #d4af37; font-size: 14px;">Exquisite Jewelry & Accessories</p>
            </div>
          </div>
          <div style="display: inline-flex; align-items: center; gap: 8px; background: #f9f3e9; padding: 8px 20px; border-radius: 50px;">
            <span style="color: #8b4513;">✨</span>
            <span style="color: #8b4513; font-weight: 600; font-size: 14px;">NEW COLLECTION • HANDCRAFTED • LIMITED EDITION</span>
          </div>
        </div>

        <!-- Main Card -->
        <div style="background: white; border-radius: 0 0 20px 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(139, 69, 19, 0.15);">

          <!-- Hero Image -->
          <div style="position: relative;">
            <img src="${sanitizedImage}" alt="Povi's Collections New Arrivals" style="width: 100%; height: 320px; object-fit: cover; display: block;">
            <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(139, 69, 19, 0.9)); padding: 32px; text-align: left;">
              <h2 style="margin: 0; color: white; font-family: 'Poppins', sans-serif; font-size: 32px; font-weight: 800; line-height: 1.2;">${sanitizedTitle}</h2>
              <div style="display: flex; align-items: center; gap: 12px; margin-top: 12px;">
                <span style="background: rgba(255,255,255,0.2); color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">💎 Premium Quality</span>
                <span style="background: rgba(255,255,255,0.2); color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">✨ Handcrafted</span>
                <span style="background: rgba(255,255,255,0.2); color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">🔮 Certified Stones</span>
              </div>
            </div>
          </div>

          <!-- Content -->
          <div style="padding: 40px 32px; text-align: center;">
            <p style="color: #8b4513; font-size: 18px; line-height: 1.7; margin: 0 0 32px; font-family: 'Inter', sans-serif;">
              ${sanitizedMessage}
            </p>

            <!-- CTA Button -->
            <a href="https://poviscollection.com/shoppage" style="display: inline-flex; align-items: center; gap: 10px; background: linear-gradient(135deg, #d4af37 0%, #8b4513 100%); color: white; padding: 18px 42px; border-radius: 50px; font-weight: 700; text-decoration: none; font-size: 18px; font-family: 'Poppins', sans-serif; box-shadow: 0 8px 25px rgba(139, 69, 19, 0.3); transition: all 0.3s; margin-bottom: 40px;">
              <span>Explore Collection</span>
              <span style="font-size: 20px;">→</span>
            </a>

            <!-- Social Proof -->
            <div style="background: #f9f3e9; border-radius: 16px; padding: 24px; margin: 32px 0;">
              <p style="color: #8b4513; font-weight: 600; margin: 0 0 16px; font-size: 16px;">💫 Trusted by Jewelry Lovers</p>
              <div style="display: flex; align-items: center; justify-content: center; gap: 20px;">
                <div style="text-align: center;">
                  <div style="font-size: 28px; color: #8b4513; font-weight: 800;">5000+</div>
                  <div style="color: #d4af37; font-size: 14px;">Satisfied Customers</div>
                </div>
                <div style="height: 40px; width: 1px; background: #e0c9a6;"></div>
                <div style="text-align: center;">
                  <div style="font-size: 28px; color: #8b4513; font-weight: 800;">4.9★</div>
                  <div style="color: #d4af37; font-size: 14px;">Average Rating</div>
                </div>
                <div style="height: 40px; width: 1px; background: #e0c9a6;"></div>
                <div style="text-align: center;">
                  <div style="font-size: 28px; color: #8b4513; font-weight: 800;">48h</div>
                  <div style="color: #d4af37; font-size: 14px;">Express Shipping</div>
                </div>
              </div>
            </div>

            <!-- Product Preview -->
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 40px 0;">
              <div style="background: linear-gradient(135deg, #f8f7f5 0%, #f9f3e9 100%); border-radius: 16px; padding: 20px; text-align: center; border: 1px solid #f0e6d6;">
                <div style="height: 120px; background: #f9f3e9; border-radius: 12px; margin-bottom: 16px; display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 40px; color: #8b4513;">💍</span>
                </div>
                <p style="margin: 0 0 8px; color: #8b4513; font-weight: 700; font-size: 16px;">Diamond Solitaire Ring</p>
                <p style="margin: 0; color: #d4af37; font-size: 14px; font-weight: 600;">✨ Limited Stock</p>
              </div>
              <div style="background: linear-gradient(135deg, #f8f7f5 0%, #f9f3e9 100%); border-radius: 16px; padding: 20px; text-align: center; border: 1px solid #f0e6d6;">
                <div style="height: 120px; background: #f9f3e9; border-radius: 12px; margin-bottom: 16px; display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 40px; color: #8b4513;">📿</span>
                </div>
                <p style="margin: 0 0 8px; color: #8b4513; font-weight: 700; font-size: 16px;">Gold Pearl Necklace</p>
                <p style="margin: 0; color: #d4af37; font-size: 14px; font-weight: 600;">💎 68% claimed</p>
              </div>
            </div>
          </div>

          <!-- Premium Footer -->
          <div style="background: linear-gradient(135deg, #8b4513 0%, #5d2906 100%); padding: 32px; text-align: center; color: white; border-top: 1px solid rgba(255,255,255,0.1);">
            <div style="display: flex; justify-content: center; gap: 24px; margin-bottom: 24px;">
              <a href="#" style="color: #d4af37; text-decoration: none; font-size: 20px; opacity: 0.8;">💎</a>
              <a href="#" style="color: #d4af37; text-decoration: none; font-size: 20px; opacity: 0.8;">✨</a>
              <a href="#" style="color: #d4af37; text-decoration: none; font-size: 20px; opacity: 0.8;">🔮</a>
              <a href="#" style="color: #d4af37; text-decoration: none; font-size: 20px; opacity: 0.8;">💍</a>
            </div>
            <p style="margin: 0 0 16px; font-size: 14px; opacity: 0.9;">
              Every piece comes with <strong>Lifetime Quality Assurance</strong> and certification
            </p>
            <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 20px;">
              <a href="#" style="color: rgba(212, 175, 55, 0.8); text-decoration: none; font-size: 14px; font-weight: 500;">Instagram</a>
              <a href="#" style="color: rgba(212, 175, 55, 0.8); text-decoration: none; font-size: 14px; font-weight: 500;">Facebook</a>
              <a href="#" style="color: rgba(212, 175, 55, 0.8); text-decoration: none; font-size: 14px; font-weight: 500;">Pinterest</a>
            </div>
            <p style="margin: 0; font-size: 12px; opacity: 0.7;">
              © ${currentYear} Povi's Collections • Timeless jewelry for every occasion<br>
              <a href="#" style="color: rgba(212, 175, 55, 0.7); text-decoration: underline;">Unsubscribe</a> from promotional emails
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};