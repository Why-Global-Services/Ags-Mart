const mongoose = require("mongoose")
const {v4} = require("uuid")


const storeSettingSchema = new mongoose.Schema({
    _id:{
        type: String,
        default: v4
    },
    appName: {
        type: String,
        required: true
    },
    supportNumber: {
        type: Number,
        required: true
    },
    supportEmail: {
        type: String,
        required: true
    },
    systemTimeZone: {
        type: String,
    },
    taxName: {
        type: String,
        required: true
    },
    taxNumber: {
        type: String,
        required: true
    },
    lowStockLimit: {
        type: String,
        required: true
    },
    adminStoreState: {
        type: String
    },
    latitude: {
        type: String
    },
    longitude: {
        type: String
    },
    maxDaysToReturnItems: {
        type: Number,
        required: true
    },
    minimumCartAmount: {
        type: Number,
        required: true
    },
    maximumItemsAllowedInCart: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    copyrightDetails: {
        type: String,
        required: true
    },
    logo: {
        type: String,
        required: true
    },
    favicon: {
        type: String,
        required: true
    },
    cartButtonOnProductListView: {
        type: Boolean,
        default: true
    },
    expandProductImage: {
        type: Boolean,
        default: false
    },
    storePickup: {
        type: Boolean,
        default: true
    },
    zipcodeWiseDeliveryCharge: {
        type: Boolean,
        default: false
    },
    deliveryBoyBonus: {
        type: Number
    },
    orderDeliveryOTPSystem: {
        type: Boolean,
        default: false
    },
    versionSystemStatus: {
        type: String,
        default: false
    },
    currentVersionOfAndroidAPP: {
        type: Number
    },
    currentVersionOfIOSAPP: {
        type: Number
    },
    referEarnStatus: {
        type: Boolean,
        default: false
    },
    referEarnMethod: {
        type: String,
        enum: ["percentage", "flat"],
        default: "percentage"
    },
    minimumReferEarnOrderAmout: {
        type: Number
    },
    referEarnBonus: {
        type: Number
    },
    maximumReferEarnAmount: {
        type: Number
    },
    timesBonusToCustomers: {
        type: String
    },
    countryCurrencyCode: {
        type: String
    },
    storeCurrency: {
        type: String
    },
    walletBalanceStatus: {
        type: Boolean,
        default: false
    },
    walletBalanceAmount: {
        type: Number
    },
    customAppStatus: {
        type: Boolean
    },
    customAppMessage: {
        type: String
    },
    deliveryBoyAppStatus: {
        type: Boolean
    },
    deliveryBoyAppMessage: {
        type: String
    },
    adminAppStatus: {
        type: Boolean
    },
    adminAppMessage: {
        type: String
    },
    webMaintainanceMode: {
        type: Boolean
    },
    webMaintainanceModeMessage: {
        type: String
    },
    addPromoCodeDiscountURL: {
        type: String,
        required: true
    },
    flashSaleActiveDeactiveURL: {
        type: String,
        required: true
    },
    remainingItemsInCartURL: {
        type: String,
        require: true
    },
    offerPopup: {
        type: Boolean
    },
    offerPopupMethod: {
        type: String,
        enum: ["appearOnce", "appearUponRefresh"],
        default: "appearOnce"
    },
    androidAppStoreLink: {
        type: String
    },
    iOSAppStoreLink: {
        type: String
    },
    schemeForAPP: {
        type: String
    },
    hostForAPP: {
        type: String
    },
    googleLogin: {
        type: Boolean
    },
    appleLogin: {
        type: Boolean
    },
    whatsAppNumber: {
        type: Number
    },
    pinCodeWiseDeliverability: {
        type: Boolean
    },
    cityWiseDeliverability: {
        type: Boolean
    },
    freeDeliveryAmountOnCity: {
        type: Number
    },
    deliveryAmountOnCity: {
        type: Number
    }

},{
    timestamps: true,
    collection:"storeSettings"
})

const storeSettings = mongoose.model("storeSettings", storeSettingSchema)


module.exports = {
    storeSettings
}