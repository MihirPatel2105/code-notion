import { contactUsEmail } from "../mail/templates/contectFormRes.js";
import mailSender from "../utils/mailSender.js";

export const contactUsController = async (req,res) => {
    const { email, firstname, lastname, message, phoneNo, countrycode } = req.body
    console.log(req.body)
    try{
        const emailRes = await mailSender(
            email,
            "Your Data send successfully",
            contactUsEmail(email, firstname, lastname, message, phoneNo, countrycode)
        )
        console.log("Email Res ", emailRes)
        return res.status(200).json({
            success: true,
            message: "Email send successfully",
        })
    }
    catch(error){
        console.log("Error message :", error.message)
        return res.status(500).json({
            success: false,
            message: "Something went wrong...",
        })
    }
}