import User from "../models/User.js";
import OTP from "../models/OTP.js";
import otpGenerator from "otp-generator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import mailSender from "../utils/mailSender.js";
dotenv.config();


//OTP
export const sendOTP = async (req,res) => {

    try{
        //Fetch Email
        const {email} = req.body;

        //Check if user already exist or not 
        const checkUserPresent = await User.findOne({email});

        if(checkUserPresent){
            return res.status(401).json({
                success:false,
                message:'User already registered'
            })
        }

        //Generate OTP
        var otp = otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false
        });
        console.log("OTP generated",otp);

        //check unique otp or not 
        const result = await OTP.findOne({otp: otp});

        while(result){
            otp = otpGenerator(6,{
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false
            });
            result = await OTP.findOne({otp: otp});
        }

        const otpPayload = {email,otp};

        //create an entry for OTP
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        //return response succesful
        res.status(200).json({
            success:true,
            message:'OTP Sent Successfully',
            otp
        })
    }

    catch(error){
        console.log(error)
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
     
};

//SignUp
export const signUp = async (req,res) => {

    try{
        //data fetch
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;

        //validate
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
            return res.status(403).json({
                success:false,
                message:'All fields are required'
            });
        }
        
        //2 password match
        if(password !== confirmPassword){
            return res.status(400).json({
                success:false,
                message:'Password and ConfirmPassword Value does not match, Please Try Again!'
            });
        }

        //check user already exist or not
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success:false,
                message:'User is Already Registered'
            });
        }

        //find most recent OTP stored for the user
        const recentOtp = (await OTP.find({email})).toSorted({createdAt:-1}).limit(1);
        console.log(recentOtp);
        //validate OTP
        if(recentOtp.length == 0) {
            //OTP not found
            return res.status(400).json({
                success:false,
                message:'OTP not Found'
            })
        } else if(otp !== recentOtp.otp){
            //Invalid OTP
            return res.status(400).json({
                success:false,
                message:'Invalid OTP'
            })
        }

        //Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        //entry create in DB
        const profileDetails = await Profiler.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null
        });

        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password:hashedPassword,
            accountType,
            additionalDetails:profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
        })
        
        return res.status(200).json({
            success:true,
            message:'User is registered Successfully',
            user
        });

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'User cannot be registered Please Try Again',
        })
    }

}

//Login
export const login = async (req,res) => {
    
    try{
        //fetch data
        const {email,password} = req.body;

        //validation
        if(!email || !password) {
            return res.status(403).json({
                success:false,
                message:'All fields are required, Please Try Again!'
            });
        }

        //user check exist or not
        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user) {
            return res.status(401).json({
                success:false,
                message:"User is not registrered, Please SignUp First"
            });
        }

        //generate JWT, after password matching
        if(await bcrypt.compare(password, user.password)){
            const payload = {
                email:user.email,
                id:user._id,
                accountType:user.accountType
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn:"2h"
            });
            user.token = token;
            user.password = undefined;

            //create cookie and send response
            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly:true
            }
            res.cookie("token",token, options).status(200).json({
                success:true,
                token,
                user,
                message:'Logged in Successfully'
            })
        }
        else {
            return res.status(401).json({
                success:false,
                message:'Password is incorrect'
            });
        }
    }
    
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Login Failure, Please Try Again!'
        });

    }
}

//Change Password 
export const changePassword = async (req, res) => {
    try {
        // Fetch data from req.body
        const { email, oldPassword, newPassword, confirmPassword } = req.body;
        
        // Validation
        if (!email || !oldPassword || !newPassword || !confirmPassword) {
            return res.status(403).json({
                success: false,
                message: 'All fields are required'
            });
        }
        
        // Check if newPassword and confirmPassword match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'New Password and Confirm Password do not match'
            });
        }
        
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Verify old password
        const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Old password is incorrect'
            });
        }
        
        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        
        // Update password in DB
        user.password = hashedNewPassword;
        await user.save();
        
        // Send mail - Password Updated
        try {
            const mailResponse = await mailSender(
                email,
                "Password Updated Successfully",
                `<h2>Password Update Confirmation</h2>
                <p>Dear ${user.firstName} ${user.lastName},</p>
                <p>Your password has been successfully updated.</p>
                <p>If you did not make this change, please contact support immediately.</p>
                <p>Best regards</p>`
            );
            console.log("Email sent successfully:", mailResponse);
        } catch (emailError) {
            console.log("Error sending email:", emailError);
            // Don't fail the password change if email fails
        }
        
        // Return response
        return res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Error while updating password, Please try again'
        });
    }
}