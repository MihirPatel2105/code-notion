import User from "../models/User.js";
import mailSender from "../utils/mailSender.js";
import bcrypt from "bcrypt";

//resetPasswordToken
export const resetPasswordToken = async (req,res) => {
    try{
        //Fetch email 
        const  email = req.body.email;

        //check user and validation
        const user = await User.findOne({email:email});
        if(!user){
            return res.json({
                success:false,
                message:"Your Email is not registered with us"
            })
        }

        //generate Token  
        const token = crypto.randomUUID();

        //update user by adding token and expiration time
        const updateDetails = await User.findOneAndUpdate(
                                        {email:email},
                                        {
                                            token:token,
                                            resetPasswordExpires: Date.now() + 5*60*1000
                                        },
                                        {new:true});

        //create url
        const url = `http://localhost:3000/update-password/${token}`

        //send mail
        await mailSender(email,
                        "Password Reset Link",
                        `Password Reset Link ${url} `
        );

        return res.json({
            success:true,
            message:'Email sent successfully, Please check email and chnage password'
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Something Went Wrong While Sending Reset Password Mail'
        })
    }
}

//reset password

export const resetPassword = async(req,res) => {
    try{
        //Fetch data
        const {password, confirmPassword, token} = req.body;
        
        //validation
        if(password !== confirmPassword){
            return res.json({
                success:false,
                message:'Password not matching'
            });
        }
        //get userdetails from db using token
        const userDetails = await User.findOne({token: token});

        //if no entry - invalid token
        if(!userDetails){
            return res.json({
                success:false,
                message:'Token is Invalid'
            })
        }
        //token time check
        if( userDetails.resetPasswordExpires < Date.now()){
            return res.json({
                success: false,
                message:'Token is Expired, Please regenerate Your Token'
            })
        }

        //hash pwd
        const hashedPassword = await bcrypt.hash(password, 10);

        //password update
        await User.findOneAndUpdate(
            {token:token},
            {password:hashedPassword},
            {new:true}
        );

        return res.status(200).json({
            success:true,
            message:'Password Reset Successful'
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Something Went Wrong While Sending Reset Password Mail'
        })
    }
}