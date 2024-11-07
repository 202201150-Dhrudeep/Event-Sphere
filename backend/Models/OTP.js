const mongoose = require("mongoose");
// const mailSender = require("../utils/mailsender");
// const emailTemplate = require("../mail/templates/emailVerificationTemplate");

const OTPSchema = new mongoose.Schema({
    userId:{
        type:String,
        required: true,
    },
    otp: {
        type:String,
        required:true,
    },
    createdAt: {
        type:Date,
        default:Date.now(),
    },
    expiresAt: {
        type:Date,
        required:true,
    }
});

// async function sendVerificationOTP(email, otp) {
//     try {
//         const mailResponse = await mailSender(email,
// 			"Verification Email",
// 			emailTemplate(otp))
//         console.log("Email sent Successfully: ", mailResponse.response);
//     } catch (error) {
//         console.log("error occured while sending mails: ", error);
//         throw error;
//     }
// }

// OTPSchema.pre("save", async function (next) {
//     console.log("Mail in pre hook", this.email)
//     await sendVerificationOTP(this.email, this.otp);
//     next();
// }) 

module.exports = mongoose.model("OTP", OTPSchema);