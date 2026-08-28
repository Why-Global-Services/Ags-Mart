const nodemailer = require("nodemailer");
const sanitizeHtml = require("sanitize-html");
const config = require("../config/config");
const htmlData = require("./htmlData");
const ApiError = require("../utils/apiError");
require("dotenv").config();

const mailService = async (sendTo, subject, htmlDataForMail) => {
  if (!sendTo) {
    return { status: false, message: "Mail id is not provided" };
  }
  if (!htmlDataForMail) {
    return { status: false, message: "htmlData is not provided" };
  }
  const transporter = nodemailer.createTransport({
    ...config.email.smtp,
  });

  const sanitizedEmail = sanitizeHtml(sendTo);

  const mailOption = {
    from: config.email.smtp.auth.user,
    to: sanitizedEmail,
    subject: subject || "Mail for user to login",
    html: htmlDataForMail,
  };

  // console.log("mailO", mailOption);

  const isMailSent = await transporter.sendMail(mailOption);
  // console.log("isMail", isMailSent);
  if (!isMailSent) {
    return { success: false, message: `Unable to sent the ${subject} Email` };
  }

  return { success: true, message: "mail sent successfully" };
};

exports.sendUserOtp = async (mailData) => {
  const htmlDataForMail = htmlData.sendUserOtp(mailData);
  // console.log(mailData);
  const recipients = `${mailData.email}`;
  // console.log("reciptent", recipients);
  let email = await mailService(
    recipients,
    "Mail for user request",
    htmlDataForMail
  );

  if (!email.success) {
    throw new ApiError(
      500,
      "Unable to send user request mail. please try again"
    );
  }

  return { success: true, message: "send To support team Email successfully" };
};

exports.sendNotification = async (mailData) => {
  const htmlDataForMail = htmlData.notificationTemplate(mailData);

  // console.log(mailData);

  const recipients = mailData.email; // Now it's correct
  // console.log("recipient", recipients);

  let email = await mailService(
    recipients,
    "Mail for user request",
    htmlDataForMail
  );

  if (!email.success) {
    throw new ApiError(
      500,
      "Unable to send user request mail. Please try again."
    );
  }

  return { success: true, message: "Sent notification email successfully" };
};
