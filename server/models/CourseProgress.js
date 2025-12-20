import mongoose from "mongoose";

const courseProgress = new mongoose.Schema({
    courseID: {
        type:mongoose.Schema.Types.ObjectId,
        ref: "Course"
    },
    completedVideos: [
        {
            typre:mongoose.Schema.Types.ObjectId,
            ref: "subsection"
        }
    ]
});

export default mongoose.model("CourseProgress",courseProgress);