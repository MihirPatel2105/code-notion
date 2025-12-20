import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";
dotenv.config();

//Auth
export const auth = async (req,res,next) => {
    try{
        //extract token
        const token = req.cookies.token
                        || req.body.token   
                        || req.header("Authorisation").replace("Bearer","");

        //If token is missing
        if(!token) {
            return res.status(401).json({
                success:false,
                messsage:"Token is Missing"
            });
        }

        //Verify token
        try{
            const decode = jwt.verify(token,process.env.JWT_SECRET);
            console.log(decode);
            req.user = decode;
        }
        catch(error){
            return res.status(401).json({
                success:false,
                message:'Token is Invalid'
            });
        }
        next();
    }
    catch(error){
        return res.status(401).json({
            success:false,
            message:'Something went Wrong While validating the token'
        });
    }
}

//isStudent
export const isStudent = async (req,res,next) => {
    try{
        if(req.user.accountType !== "Student"){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for Students only"
            });
        }
        next();
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:'User role cannot be verified, Please Try Again!'
        })
    }
}


//isInstructor
export const isInstructor = async (req,res,next) => {
    try{
        if(req.user.accountType !== "Instructor"){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for Instructor only"
            });
        }
        next();
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:'User role cannot be verified, Please Try Again!'
        })
    }
}


//isAdmin
export const isAdmin = async (req,res,next) => {
    try{
        if(req.user.accountType !== "Admin"){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for Admin only"
            });
        }
        next();
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:'User role cannot be verified, Please Try Again!'
        })
    }
}