const dotenv = require("dotenv");
const path = require("path");
const Joi = require("joi");
dotenv.config({ path: path.join(__dirname, "../../.env") });

const envVarsSchema = Joi.object()
  .keys({
    PORT: Joi.number().default(3333),
    MONGODB_URL: Joi.string().required().description("Mongo DB url"),
    JWT_SECRET: Joi.string().required().description("JWT secret key"),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number()
      .default(43200)
      .description("minutes after which access tokens expire"),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number()
      .default(30)
      .description("days after which refresh tokens expire"),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description("minutes after which reset password token expires"),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description("minutes after which verify email token expires"),
    SMTP_HOST: Joi.string().description("server that will send the emails"),
    SMTP_PORT: Joi.number().description("port to connect to the email server"),
    SMTP_USERNAME: Joi.string().description("username for email server"),
    SMTP_PASSWORD: Joi.string().description("password for email server"),
    EMAIL_FROM: Joi.string().description(
      "the from field in the emails sent by the app"
    ),
    ENCRYPTION_SECRETKEY: Joi.string().description("Encryption Decryption Key"),

    GOOGLE_CLIENT_ID: Joi.string()
      .required()
      .description("Google OAuth Client ID"),
    GOOGLE_CLIENT_SECRET: Joi.string()
      .required()
      .description("Google OAuth Secret"),
    GOOGLE_CALLBACK_URL: Joi.string()
      .required()
      .description("Google OAuth callback URL"),

    RAZORPAY_KEY: Joi.string().description("razorpay key id"),
    RAZORPAY_SECRET: Joi.string().description("razorpay secret key"),
    STRIPE_PUBLISHABLE_KEY: Joi.string().description("Stripe publishable key"),
    STRIPE_SECRET_KEY: Joi.string().description("Stripe secret key"),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  encryptionDecryptionKey: envVars.ENCRYPTION_SECRETKEY,
  mongoose: {
    url: envVars.MONGODB_URL,
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes:
      envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    },
    adminEmail: envVars.ADMIN_EMAIL,
  },

  google: {
    clientId: envVars.GOOGLE_CLIENT_ID,
    clientSecret: envVars.GOOGLE_CLIENT_SECRET,
    callbackUrl: envVars.GOOGLE_CALLBACK_URL,
  },

  razorpay: {
    keyId: envVars.RAZORPAY_KEY,
    secretKey: envVars.RAZORPAY_SECRET,
  },
  stripe: {
    keyId: envVars.STRIPE_PUBLISHABLE_KEY,
    secretKey: envVars.STRIPE_SECRET_KEY,
  },
  payPal: {
    clientId: envVars.PAYPAL_CLIENT_SECRET,
    clientSecret: envVars.CLIENT_ID,
  },
};
