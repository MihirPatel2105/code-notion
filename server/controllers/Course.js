import Course from "../models/Course.js";
import Category from "../models/Category.js";
import User from "../models/User.js";
import { uploadImageToCloudinary } from "../utils/imageUploader.js";
import Section from "../models/Section.js";
import SubSection from "../models/SubSection.js";
import CourseProgress from "../models/CourseProgress.js";
import { convertSecondsToDuration } from "../utils/secToDuration.js";


//Create Course handler function
export const craeteCourse = async (req, res) => {
    try {
        //Fetch Data
        const { courseName, courseDescription, whatYouWillLearn, price, tag } = req.body;

        //get thumbnail
        const thumbnail = req.files.thumbnailImage;

        //validation
        if (!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail) {
            return res.status(400).json({
                success: false,
                message: 'All Fields Are Required'
            })
        }

        //Check for instructor
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        console.log("Instructor Details", instructorDetails);

        if (!instructorDetails) {
            return res.status(404).json({
                success: false,
                message: 'Instructor Details not found'
            })
        }

        //check given tag is valid or not
        const categoryDetails = await Category.findById(tag);
        if (!categoryDetails) {
            return res.status(404).json({
                success: false,
                message: 'Category Details not found'
            })
        }

        //Upload image to cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        //craete an entry for newcourse
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            price,
            category: categoryDetails._id,
            thumbnail: thumbnailImage.secure_url
        })

        // add new courseto the user schema of instructor
        await User.findByIdAndUpdate(
            { _id: instructorDetails._id },
            {
                $push: {
                    courses: newCourse._id
                }
            },
            { new: true }
        );

        //Update Category schema
        await Category.findByIdAndUpdate(
            { _id: categoryDetails._id },
            {
                $push: {
                    courses: newCourse._id
                }
            },
            { new: true }
        );

        return res.status(200).json({
            succes: true,
            message: "Course Created Succesfullt",
            data: newCourse
        });
    }

    catch (error) {
        return res.status(500).json({
            success: false,
            message: ''
        })
    }
}


//Get all courses
export const getAllCourses = async (req, res) => {
    try {
        const allCourses = await Course.find({}, {
            courseName: true,
            price: true,
            thumbnail: true,
            instructor: true,
            ratingAndreviews: true,
            studentEnrolled: true
        })
            .populate("instructor")
            .exec();

        return res.status(200).json({
            success: true,
            message: 'All Courses fetched successfully',
            data: allCourses
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Cannot Fetch course data',
            error: error.message
        })
    }

}

// get course details

export const getCourseDetaisl = async (req, res) => {
    try {
        //get data
        const { courseId } = req.body;

        //find course details
        const courseDetails = await Course.find(
            { _id: courseId })
            .populate(
                {
                    path: "instructor",
                    populate: {
                        path: "additionalDetails"
                    },
                }
            )
            .populate("category")
            .populate("ratingAndreviews")
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection"
                },
            })
            .exec();

        //validation
        if (!courseDetails) {
            return res.status(400).json({
                success: false,
                message: `Could not find the course with ${courseId}`
            })
        }

        return res.status(200).json({
            success: true,
            message: 'Course Deatisl fetched successfully'
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


export const editCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const updates = req.body;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        // Update thumbnail if provided
        if (req.files?.thumbnailImage) {
            const thumbnailImage = await uploadImageToCloudinary(
                req.files.thumbnailImage,
                process.env.FOLDER_NAME
            );
            course.thumbnail = thumbnailImage.secure_url;
        }

        // Update other fields
        for (const key in updates) {
            if (key !== "courseId") {
                course[key] = updates[key];
            }
        }

        await course.save();

        const updatedCourse = await Course.findById(courseId)
            .populate({
                path: "instructor",
                populate: { path: "additionalDetails" },
            })
            .populate("category")
            .populate("ratingAndReviews")
            .populate({
                path: "courseContent",
                populate: { path: "subSection" },
            });

        return res.status(200).json({
            success: true,
            message: "Course updated successfully",
            data: updatedCourse,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/* =====================================================
   GET FULL COURSE DETAILS (ENROLLED USER)
===================================================== */
export const getFullCourseDetails = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user.id;

        const course = await Course.findById(courseId)
            .populate({
                path: "instructor",
                populate: { path: "additionalDetails" },
            })
            .populate("category")
            .populate("ratingAndReviews")
            .populate({
                path: "courseContent",
                populate: { path: "subSection" },
            });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        const progress = await CourseProgress.findOne({
            courseID: courseId,
            userId,
        });

        let totalSeconds = 0;
        course.courseContent.forEach(section => {
            section.subSection.forEach(sub => {
                totalSeconds += parseInt(sub.timeDuration);
            });
        });

        return res.status(200).json({
            success: true,
            data: {
                courseDetails: course,
                totalDuration: convertSecondsToDuration(totalSeconds),
                completedVideos: progress?.completedVideos || [],
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/* =====================================================
   GET INSTRUCTOR COURSES
===================================================== */
export const getInstructorCourses = async (req, res) => {
    try {
        const instructorId = req.user.id;

        const courses = await Course.find({ instructor: instructorId }).sort({
            createdAt: -1,
        });

        return res.status(200).json({
            success: true,
            data: courses,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/* =====================================================
   DELETE COURSE
===================================================== */
export const deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.body;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        // Remove course from students
        for (const studentId of course.studentsEnrolled) {
            await User.findByIdAndUpdate(studentId, {
                $pull: { courses: courseId },
            });
        }

        // Delete sections & subsections
        for (const sectionId of course.courseContent) {
            const section = await Section.findById(sectionId);
            if (section) {
                for (const subId of section.subSection) {
                    await SubSection.findByIdAndDelete(subId);
                }
                await Section.findByIdAndDelete(sectionId);
            }
        }

        await Course.findByIdAndDelete(courseId);

        return res.status(200).json({
            success: true,
            message: "Course deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};