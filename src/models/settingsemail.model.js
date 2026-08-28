const mongoose = require("mongoose");;
const { v4 } = require("uuid");



const emailSettingSchema = new mongoose.Schema({
    _id: { type: String, default:v4 },
    email: { type: String, required: true },
    password: { type: String, required: true },
    smtpHost: { type: String, required: true },
    smtpPort: { type: Number, required: true },
    emailContentType: { type: String, enum: ['HTML', 'Text'], required: true },
    smtpEncryption: { type: String, enum: ['SSL', 'TLS'], required: true }
}, { timestamps: true });

const emailSettings = mongoose.model("EmailSetting", emailSettingSchema);
module.exports =  {
    emailSettings
}