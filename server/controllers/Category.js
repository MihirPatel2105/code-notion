import Category from '../models/Category.js'

export const createCategory = async(req,res) => {
    try{
        //Fetch Data
        const {name,description} = req.body;

        //validation
        if(!name || !description) {
            return res.status(400).json({
                success:false,
                message:'All Fields are Required'
            });
        }

        //create entry in db
        const categoryDetails = await Category.create({
            name:name,
            description:description
        })
        console.log(categoryDetails)
        return res.status(200).json({
            success:true,
            message:'Category Created Successfully'
        })

    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

//Show All Tags

export const showAllCategories = async (req,res) => {
    try{
        const allCategories = await Category.find({}, {name:true, description:true});
        res.status(200).json({
            success:true,
            message:'All categories returned successfully',
            allCategories,
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

//category pageDeatails

export const categoryPageDetails = async (req,res) => {
    try{
        //get categoryID
        const {categoryId} = req.body;

        //get course for specified caategory
        const selectedCategory = await Category.findById(categoryId)
                                        .populate('courses')
                                        .exec();
                                        
        //validation
        if(!selectedCategory){
            return res.status(400).json({
                success:false,
                message:'Could not find the category'
            })
        }

        //get courses for different category
        const differentCategory = await Category.find(
                                        {_id: {$ne: categoryId} })
                                        .populate('courses')
                                        .exec();

        //get top selling courses
        const allCategories = await Category.find()
            .populate({
                path: 'courses',
                options: { sort: { studentsEnrolled: -1 } }
            })
            .exec();

        const topSellingCourses = allCategories
            .flatMap(category => category.course)
            .sort((a, b) => b.studentsEnrolled - a.studentsEnrolled)
            .slice(0, 10);

        return res.status(200).json({
            success: true,
            data: {
                selectedCategory,
                differentCategory,
                topSellingCourses
            }
        });

    }
    catch(error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })

    }
}