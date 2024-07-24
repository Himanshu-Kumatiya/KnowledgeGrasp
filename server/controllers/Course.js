const User=require("../models/User");
const Category=require("../models/Category");
const RatingAndReview=require("../models/RatingAndReview");
const Course=require("../models/Course");
const { uploadImage}=require("../utils/imageUploader")
exports.createCourse=async(req,res)=>{
    try{
        const {courseName,courseDescription,whatYouWillLearn,price,category,tag}=req.body;
        const thumbnail=req.files.thumbnailImage;
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !category || !tag)
        {
            console.log(err.message);
            return res.status(500).json({
                success:false,
                message:"All fields are required"
            })
        }
        const userId=req.user.id;
        console.log(userId);
        const instructorDetails=await User.findById(userId);
        console.log("Instructor details : ",instructorDetails);
        if(!instructorDetails)
        {
            return res.status(404).json({
            success:false,
            message:"Instructor details not found"
            })
        }
        const categoryDetails=await Category.findById(category);
        if(!categoryDetails){
             return res.status(404).json({
                success:false,
                message:"category details not found"
            })
        }
        const thumbnailImage=await uploadImage(thumbnail,process.env.FOLDER_NAME);
        const newCourse=await Course.create({
            courseName,
            tag,
            courseDescription,
            instructor:instructorDetails._id,
            whatYouWillLearn,price,category:categoryDetails._id,
            thumbnail:thumbnailImage.secure_url

        })
        await User.findByIdAndUpdate({_id:instructorDetails._id},
            {
                $push:{
                    courses:newCourse._id,
                }
            },{new:true}
        );
        await Category.findByIdAndUpdate({_id:category},
            {
                $push:{
                    courses:newCourse._id,
                }
            },{new:true}
        );

        return res.status(200).json({
            success:true,
            message:"Course Created successfully",
            data:newCourse
        })

    }
    catch(err)
    {
        console.log(err.message);
        res.status(500).json({
            success:false,
            message:"Failed to create Course"
        })
    }
}

exports.getAllCourses=async (req,res)=>{
    try{
        const allCourses=await Course.find({},
        //     {
        //     courseName:true,
        //     price:true,
        //     thumbnail:true,
        //     instructor:true,
        //     ratingAndReviews:true,
        //     studentsEnrolled:true
        // }
    ).populate("instructor").exec();
    return res.status(200).json({
        success:true,
        message:"All the courses are fecthed",
        data:allCourses
    })
    }
    catch(err)
    {
        console.log(err.message);
        res.status(200).json({
            success:false,
            message:"Cannot Fetch courses data"
        })
    }
}

exports.getCourse=async(req,res)=>{
    try{
        const {courseId}=req.body;
        const course=await Course.findById(
            {_id:courseId})
            .populate({
                path:"instructor",
                populate:{
                    path:"additionalDetails"
                }
            })
            .populate("category")
            .populate("ratingAndReviews")
            .populate({
                path:"courseContent",
                populate:{
                    path:"subSection"
                }
            }).exec();
        if(!course)
        {
            return res.status(400).json({
                success:false,
                message:`No such course with courseId ${courseId}`
            })
        }
        return res.status(200).json({
            success:true,
            message:"Course details fetched successfully",
            data:course
        })
    }
    catch(err)
    {  
        console.log(err.message);
        res.status(500).json({
            success:false,
            message:err.message
        })

    }
}