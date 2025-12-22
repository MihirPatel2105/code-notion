import Category from '../models/Category.js'

export const craeteCategory = async(req,res) => {
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

export const showAllcategory = async (req,res) => {
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