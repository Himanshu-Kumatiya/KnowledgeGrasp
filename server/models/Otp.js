const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail-templates/emailVerificationTemplate");
const otp = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 10 * 60
    }
})

async function sendVerificationEmail(email, otp) {
    try {
        const mailResponse = await mailSender(email,
            "Verification email from Knowledge grasp ", emailTemplate(otp));
        console.log("Email sent Successfully: ", mailResponse);
    }
    catch (err) {
        console.log("Error occured while sending mails ", err.message);
        throw err;
    }
}
otp.pre("save",async function(next){
    await sendVerificationEmail(this.email,this.otp);
    next();
})

const OTP= mongoose.model("Otp", otp);
module.exports=OTP;
