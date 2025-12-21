import Course from "../models/Course.js";
import Tag from "../models/tags.js";
import User from "../models/User.js";
import { uploadImageToCloudinary} from "../utils/imageUploader.js";

//Create Course handler function
export const craeteCourse = async (req,res) => {
    try{
        //Fetch Data
        const {courseName, courseDescription, whatYouWillLearn, price, tag} = req.body;

        //get thumbnail
        const thumbnail = req.files.thumbnailImage;

        //validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail){
            return res.status(400).json({
                success:false,
                message:'All Fields Are Required'
            })
        }

        //Check for instructor
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        console.log("Instructor Details", instructorDetails);

        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:'Instructor Details not found'
            })
        }

        //check given tag is valid or not
        const tagDetails = await Tag.findById(tag);
        if(!tagDetails){
            return res.status(404).json({
                success:false,
                message:'tag Details not found'
            })
        }

        //Upload image to cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        //craete an entry for newcourse
        const newCourse = await Course.create({
            courseName,
            courseDecription,
            instructor: instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            price,
            tag:tagDetails._id,
            thumbnail:thumbnailImage.secure_url
        })
        
        // add new courseto the user schema of instructor
        await User.findByIdAndUpdate(
            {_id: instructorDetails._id},
            {
                $push:{
                    courses: newCourse._id
                }
            },
            {new:true}
        );

        //Update Tag schema
        await Tag.findByIdAndUpdate(
            {_id: tagDetails._id},
            {
                $push: {
                    courses: newCourse._id
                }
            },
            {new: true}
        );

        return res.status(200).json({
            succes:true,
            message:"Course Created Succesfullt",
            data:newCourse
        });
    }

    catch(error){
        return res.status(500).json({
            success:false,
            message:''
        })
    }
}


//Get all courses
export const showAllCourses = async (req,res) => {
    try{
        const allCourses = await Course.find({}, {courseName:true,
                                                 price:true,              
                                                 thumbnail:true,
                                                 instructor:true,
                                                 ratingAndreviews:true,
                                                 studentEnrolled:true})
                                                 .populate("instructor")
                                                 .exec();
                            
        return res.status(200).json({
            success:true,
            message:'All Courses fetched successfully',
            data: allCourses
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:'Cannot Fetch course data',
            error: error.message
        })
    }

}