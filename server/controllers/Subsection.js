import SubSection from "../models/SubSection.js";
import Section from "../models/Section.js";
import { uploadImageToCloudinary } from "../utils/imageUploader.js";

export const createSubSection = async (req,res) => {
    try{
        //Fetch data
        const {sectionId, title, timeDuration, description} = req.body;

        //extract file/video
        const video = req.files.videoFile;

        //validation
        if(!sectionId || !title || !timeDuration || !description || !video){
            return res.status(400).json({
                success:false,
                message:'All fields are required'
            })
        }

        //upload video to cloudinary
        const uploadDetails = await uploadImageToCloudinary(video,process.env.FOLDER_NAME)

        //create a sub section
        const subSectionDetails = await SubSection.create({
            title:title,
            timeDuration:timeDuration,
            description:description,
            videoUrl:uploadDetails.secure_url
        })

        //upload section with this sub section ObjectId
        const updatedSection = await Section.findByIdAndUpdate({_id:sectionId},
                                                                {
                                                                    $push:{
                                                                        subSection: subSectionDetails._id
                                                                    }
                                                                },
                                                                {new:true})
                                                                .populate("subSection")

        console.log("Updated Section with populated subSections:", updatedSection); 

        return res.status(200).json({
            success:true,
            message:'Sub Section Craeted successfully',
            updatedSection
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:'Unable to create SubSection, Please Try Again!',
            error:error.message
        })
    }
}

//Update SubSection
export const updateSubSection = async (req,res) => {
    try{
        //Fetch data
        const { subSectionId, sectionId, title, description, timeDuration } = req.body;

        //validation
         if (!subSectionId || !sectionId) {
            return res.status(400).json({
                success: false,
                message: "subSectionId and sectionId are required",
            });
        }

        const subSection = await SubSection.findById(subSectionId);
        if (!subSection) {
            return res.status(404).json({
                success: false,
                message: "SubSection not found",
            });
        }

        // Update fields if provided
        if (title) subSection.title = title;
        if (description) subSection.description = description;
        if (timeDuration) subSection.timeDuration = timeDuration;

        // If new video is uploaded
        if (req.files.videoFile) {
            const video = req.files.videoFile;
            const uploadDetails = await uploadImageToCloudinary(
                video,
                process.env.FOLDER_NAME
            );
            subSection.videoUrl = uploadDetails.secure_url;
        }

        await subSection.save();

        // Populate section after update
        const updatedSection = await Section.findById(sectionId)
            .populate("subSection");

        return res.status(200).json({
            success: true,
            message: "SubSection updated successfully",
            data: updatedSection,
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:'Unable to create SubSection, Please Try Again!',
            error:error.message
        })
    }
}

//Delete Subsection
export const deleteSubSection = async (req,res) => {
    try{
        //Fetch Data
        const { subSectionId, sectionId } = req.body;

        //validation
        if (!subSectionId || !sectionId) {
            return res.status(400).json({
                success: false,
                message: "subSectionId and sectionId are required",
            });
        }
        
        //Remove subsection reference from section
        await Section.findByIdAndUpdate(
            sectionId,
            {
                $pull: {
                    subSection: subSectionId,
                },
            }
        );
        // Delete subsection
        const deletedSubSection = await SubSection.findByIdAndDelete(subSectionId);
        if (!deletedSubSection) {
            return res.status(404).json({
                success: false,
                message: "SubSection not found",
            });
        }

        // Populate updated section
        const updatedSection = await Section.findById(sectionId)
            .populate("subSection");

        return res.status(200).json({
            success: true,
            message: "SubSection deleted successfully",
            data: updatedSection,
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:'Unable to create SubSection, Please Try Again!',
            error:error.message
        })
    }
}

