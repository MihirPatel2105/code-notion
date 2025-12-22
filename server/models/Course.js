import mongoose from "mongoose"

const courseSchema = new mongoose.Schema({
    courseName: {
        type:String
    },
    courseDescription:{
        type:String
    },
    instructor:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    whatYouWillLearn:{
        type:String
    },
    courseContent:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Section"
        }
    ],
    ratingAndreviews:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"RatingAndReview"
        }
    ],
    price:{
        type:Number
    },
    thumbnail:{
        type:String
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category"
    },
    studentEnrolled:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        }
    ]
})

export default mongoose.model("Course",courseSchema);