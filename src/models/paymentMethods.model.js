const mongoose = require("mongoose")
const {v4} = require("uuid")


const paymentMethodSchema = new mongoose.Schema({
    _id:{
        type: String,
        default: v4
    },
    razorPay: {
        keyId:{
            type: String
        },
        razorPaySecretKey:{
            type:String
        },
        webhookSecretkey: {
            type: String
        },
        paymentEndpointURL: {
            type: String
        }
    },
    googlePay:{
        googlePayMerchantID:{
            type: String
        },
        googlePayMerchantName: {
            type: String
        },
        merchantInformation: {
            type: String
        },
        paymentGatewayName: {
            type: String
        },
        gatewayMerchantID: {
            type: String
        }
    },
    stripe: {
        stripePublishableKey: {
            type: String
        },
        stripeSecretKey: {
            type: String
        },
        stripeWebhookSecret:{
            type: String
        },
        currency: {
            type: String
        }
    },
    phonePe: {
        phonePeMerchantID: {
            type: String
        },
        phonePeMerchantKey:{
            type: String
        },
        callbackURL: {
            type: String
        },
        currency:{
            type: String
        }
    },
    payTM: {
        paytmMerchantID:{
            type: String
        },
        paytmMerchantKey:{
            type: String
        },
        paytmWebsiteName:{
            type: String
        },
        callbackURL: {
            type: String
        },
        currency: {
            type: String
        }
    },
    payPal: {
        paymentMode: {
            type: String
        },
        payPalBusinessEmail: {
            type: String
        },
        notificationURL: {
            type: String
        },
        currencyCode: {
            type: String
        }
    },
    instamojo:{
        InstamojoAPIKey:{
            type: String
        },
        InstamojoAuthToken: {
            type: String
        },
        paymentURL: {
            type: String
        },
        currencyCode: {
            type: String
        }
    },
    cashOnDelivery: {
        type: Boolean
    },
    bankTransfer: {
        recipientsfullName:{
            type: String
        },
        bankAccountNumber: {
            type: String
        },
        IFSCcode: {
            type: String
        }
    }
},{
    timestamps: true,
    collection: "paymentMethod"
})

const paymentMethod = mongoose.model("paymentMethod", paymentMethodSchema)

module.exports = {
    paymentMethod
}