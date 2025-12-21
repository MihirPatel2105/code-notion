import Tag from '../models/tags.js';

export const craeteTag = async(req,res) => {
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
        const tagDetails = await Tag.create({
            name:name,
            description:description
        })
        console.log(tagDetails)

        return res.status(200).json({
            success:true,
            message:'Tag Created Successfully'
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

export const showAlltags = async (req,res) => {
    try{
        const allTags = await Tag.find({}, {name:true, description:true});
        res.status(200).json({
            success:true,
            message:'All tags returned successfully',
            allTags,
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}