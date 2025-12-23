import {instance} from "../config/razorpay.js";
import Course from "../models/Course.js";
import User from "../models/User.js";
import mailSender from "../utils/mailSender.js";
import courseEnrollmentEmail from "../mail/courseEnrollmentEmail.js";
import mongoose from "mongoose";
import crypto from "crypto";


export const capturePayment = async (req,res) => {
    //Get courseId and UserID
    const {course_id} = req.body;
    const userId = req.user.id;

    //validation
    if(!course_id){
        return res.json({
            success:false,
            message:'Please provide valid course Id'
        })
    }

    //valid CourseDetails
    let course;
    try{
        course = await Course.findById(course_id);
        if(!course){
            return res.json({
                success:false,
                message:'Could not find the course'
            })
        }

        //user already pay for the same course
        const uid = new mongoose.Types.ObjectId(userId);
        if(course.studentEnrolled.includes(uid)) {
            return res.status(200).json({
                success:false,
                message:'Student is already enrolled'
            })
        }
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }

    //order create
    const amount = course.price;
    const currency = "INR";

    const option= {
        amount:amount * 100,
        currency,
        receipt:Math.random(Date.now()).toString(),
        notes:{
            courseId:course_id,
            userId,
        }
    };

    try{
        //initiate the payment using razorpay
        const paymentResponse = await instance.orders.craete(option);
        console.log(paymentResponse);

        return res.status(200).json({
            success:true,
            courseName:course.courseName,
            courseDescription:course.courseDescription,
            thumbnail:course.thumbnail,
            orderId:paymentResponse.id,
            currency:paymentResponse.currency,
            amount:paymentResponse.amount
        })
    }
    catch(error){
        console.log(error)
        res.json({
            success:false,
            message:"Could not initiate order"
        })
    }
}

export const verifySignature = async (req,res) => {
    const webhookSecret = "12345678";

    const signature = req.headers["x-razorpay-signature"];

    const shasum = crypto.createHmac("sha256",webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if(signature === digest){
        console.log("Payment is Authorised");

        const {courseId, userId} = req.body.payload.payment.entity.notes;

        try{
            //find the course and enroll the student
            const enrolledCourse = await Course.findByIdAndUpdate(
                                        {_id:courseId},
                                        { $push: { studentEnrolled: userId } },
                                        { new: true }
                                    );

            if(!enrolledCourse){
                return res.status(500).json({
                    success:false,
                    message:'Course not found'
                })
            }

            //find the user and add the course to his profile
            const user = await User.findByIdAndUpdate(
                            {_id:userId},
                            {
                                $push: { courses: courseId }
                            },
                            { new: true }
                        );

            //mail send to the user for course enrollment
            const emailResponse = await mailSender(
                enrolledCourse.email,
                "Congratulations! Enrolled Successfully",
            )

            console.log("Email sent successfully:", emailResponse);

            return res.status(200).json({
                success:true,   
                message:"Payment verified and course added successfully"
            })
        
        }
        catch(error){
            console.log("Error in enrolling the course:", error);
            return res.status(500).json({
                success:false,
                message:"Error in enrolling the course"
            })
        }
    }
    else{
        return res.status(400).json({
            success:false,
            message:"Invalid signature"
        })
    }


}
