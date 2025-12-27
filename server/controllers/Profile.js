import Profile from "../models/Profile.js";
import User from "../models/User.js";
import Course from "../models/Course.js";

export const updateProfile = async (req,res) => {
    try{
        //Fetch data + get userId
        const {dateOfBirth="", about="", contactNumber, gender} = req.body;

        const id = req.user.id;

        //validation
        if(!contactNumber || !gender || !id){
            return res.status(400).json({
                success:false,
                message:'All fields are required'
            })
        }

        //find profile
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        //update profile
        profileDetails.dateOfBirth=dateOfBirth;
        profileDetails.about=about;
        profileDetails.gender=gender;
        profileDetails.contactNumber=contactNumber;
        await profileDetails.save();

        return res.status(200).json({
            success:true,
            message:'ProfileUpdated Successfully',
            profileDetails
        })

    }
    catch(error) {
        return res.status(500).json({
            success:false,
            message:'Unable to update Profile, Please Try Again!',
            error:error.message
        })
    }
}

//Delete Account
export const deleteAccount = async (req,res) => {
    try{
        //get id
        const id = req.user.id;

        //validation
        const userDetails = await User.findById(id);
        if(!userDetails){
            return res.status(404).json({
                success:false,
                message:'User not found'
            })
        }

        //deleteprofile
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});

        //unenroll user from all enrolled course
        if(userDetails.courses && userDetails.courses.length > 0) {
            await Promise.all(
                userDetails.courses.map(courseId =>
                    Course.findByIdAndUpdate(
                        courseId,
                        {
                            $pull: {
                                studentEnrolled: id, 
                            },
                        }
                    )
                )
            );
        }

        //delete user 
        await User.findByIdAndDelete({_id:id});

        return res.status(200).json({
            success:true,
            message:'Account Deleted Successfully'
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:'Unable to delete Account, Please Try Again!',
            error:error.message
        })
    }
}

export const getAllUserDetails = async (req,res) => {
    try{
        //fetch data
        const id = req.user.id;

        //validation
        const userDetails = await User.findById(id).populate("additionalDetails").exec();

        return res.status(200).json({
            success:true,
            message:'User data fetch successfully'
        })

    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:'Unable to get Details, Please Try Again!',
            error:error.message
        })
    }
}