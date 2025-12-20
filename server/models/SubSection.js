import mongoose from "mongoose";

const subSectionSchema = new mongoose.Schema({
    title: {
        type: String
    },
    timeDuration: {
        type: String
    },
    description:{
        tye: String
    },
    videourl:{
        type: String
    }
})

export default mongoose.model("SubSection",subSectionSchema); 