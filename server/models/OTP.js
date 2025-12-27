import mongoose from "mongoose";
import mailSender from "../utils/mailSender.js";

const OTPSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    otp:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires: 5*60
    }
});

// A function -> send emails
async function sendVerificationEmail(email,otp){
    try{
        const mailResponse = await mailSender(email,"Verification Email from CodeNotion",otp);
        console.log("Email sent successfully", mailResponse);
    }
    catch(error){
        console.log("Error occured While Sending Mails", error);
        throw error;
    }
}

//Pre Middleware
OTPSchema.pre("save",async function(next){
    await sendVerificationEmail(this.email, this.otp);
    next();
})

export default mongoose.model("OTP",OTPSchema);