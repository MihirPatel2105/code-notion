import Section from '../models/Section.js';
import Course from '../models/Course.js'

export const createSection = async (req,res) => {
    try{
        //Ftech data
        const {sectionName, courseId} = req.body;

        //Validation
        if(!sectionName || !courseId) {
            return res.status(400).json({
                success:false,
                message:'Missing Properties'
            })
        }

        //Create Section
        const newSection = await Section.create({sectionName});

        //Update course with section objectID
        const updatedCourseDetails = await Course.findByIdAndUpdate(
                                            courseId,
                                            {
                                                $push:{
                                                    courseContent:newSection._id
                                                }
                                            },
                                            {new:true}
                                        )
                                        .populate({
                                            path:'courseContent',
                                            populate:{
                                                path:'subSection'
                                            }
                                        })
        return res.status(200).json({
            success:true,
            message:'Section created successfully',
            updatedCourseDetails
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:'Unable to create Section, Please Try Again!',
            error:error.message
        })

    }
}

//Update The Section
export const updateSection = async (req,res) => {
    try{
        //Fetch data
        const {sectionName, sectionId} = req.body;

        //validation
        if(!sectionName || !sectionIdId) {
            return res.status(400).json({
                success:false,
                message:'Missing Properties'
            })
        }

        //update data
        const section = await Section.findByIdAndUpdate(sectionId, {sectionName}, {new:true});

        return res.status(200).json({
            success:true,
            message:'Section Updated Successfully'
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:'Unable to create Section, Please Try Again!',
            error:error.message
        })
    }
    
}

//Delete Section
export const deleteSetion = async (req,res) => {
    try{
        //Fetch ID - assuming that we are sending id in params
        const {sectionId} = req.params

        //use findByIdDelete
        await Section.findByIdAndDelete(sectionId);

        return res.status(200).json({
            success:true,
            message:'Section Deleted Successfully'
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:'Unable to create Section, Please Try Again!',
            error:error.message
        })
    }
}