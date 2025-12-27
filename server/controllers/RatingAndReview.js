import RatingAndReview from "../models/RatingAndReview.js";
import Course from "../models/Course.js";
import mongoose from "mongoose";

//create rating
export const createRating = async (req,res) => {
    try{
        //get user id
        const userId = req.user.id;
        const {rating, review, courseId} = req.body;

        // check if user is enrolled in course
        const courseDetails = await Course.findOne(
            {_id : courseId,
            studentsEnrolled: {$elemMatch: {$eq: userId}} 
            }
        )

        if(!courseDetails) {
            return res.status(404).json({
                success:false,
                message:"Student is not enrolled in the course"
            })
        }

        //check if user already reviewed
        const alreadyReviewed = await RatingAndReview.findOne(
            {
                user: userId,
                course: courseId
            }
        )
        
        if(alreadyReviewed) {
            return res.status(400).json({
                success:false,
                message:"Student has already reviewed for this course"
            })
        }

        //create rating and review
        const ratingReview = await RatingAndReview.create({
            rating,review,
            course:courseId,
            user:userId
        })

        //update course with this rating and review
        const updatedCourseDetails = await Course.findByIdAndUpdate({_id:courseId},
            {
                $push:{
                    ratingAndreviews:ratingReview._id
                }
            },
            {new:true}
        )
        
        console.log(updatedCourseDetails)
        return res.status(200).json({
            success:true,
            message:"Rating and Review created Successfully",
            ratingReview
        })
    }
    catch(error) {
        return res.status(500).json({
            success:false,
            message:"Cannot create rating and review",
            error: error.message
        })
    }
}


//get Average Rating
export const getAverageRating = async (req,res) => {
    try{
        //get course id
        const courseId = req.body.courseId;

        //calculate avg rating
        const result = await RatingAndReview.aggregate([
            {
                $match:{
                    course: new mongoose.Types.ObjectId(courseId)
                }
            },
            {
                $group:{
                    _id:null,
                    averageRating:{ $avg:"$rating"}
                }
            }
        ])

        //return rating
        if(result.length > 0) {
            return res.status(200).json({
                success:true,
                averageRating: result[0].averageRating
            })
        }

        //if no rating 
        return res.status(200).json({
            success:true,
            message:'Average Rating is 0, No rating given till now',
            averageRating:0
        })
    }
    catch(error) {
        return res.status(500).json({
            success:false,
            message:"Cannot fetch average rating",
            error: error.message
        })
    }
}


//get All rating
export const getAllRating = async (req,res) => {
    try{
        const allReviews = await RatingAndReview.find({})
                                .sort({rating:"desc"})
                                .populate({
                                    path:"user",
                                    select:"firstName lastName email image"
                                })
                                .populate({
                                    path:"course",
                                    select:"courseName"
                                })
                                .exec();
                                
        return res.status(200).json({
            success:true,
            message:"All Ratings fetched Successfully",
            data: allReviews
        })
    }
    catch(error) {
        return res.status(500).json({
            success:false,
            message:"Cannot fetch Rating",
            error: error.message
        })
    }
}