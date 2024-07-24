const RatingAndReview=require("../models/RatingAndReview");
const User=require("../models/User");
const Course=require("../models/Course");
const { default: mongoose } = require("mongoose");

exports.createRating=async (req,res)=>{
    try{
        //get user id
        const {userId}=req.user.id;
        const {rating,review,courseId}=req.body;
        const courseDetails=await Course.findOne({_id:userId},
            {
                studentsEnrolled:{$elemMatch:{$eq:userId}}
            }
        );
        if(!courseDetails)
        {
            return res.status(400).json({
                success:false,
                message:"Student is not enrolled in the course"
            })
        }
        const alreadyReviewed=await RatingAndReview.findOne({user:userId,
            course:courseId
        });
        if(alreadyReviewed)
            {
                return res.status(400).json({
                    success:false,
                    message:"Course is already reviewed by the user"
                })
            }
        const ratingReview=await RatingAndReview.create({
            rating,review,course:courseId,user:userId
        });
        await Course.findByIdAndUpdate({
            _id:courseId
        },{
            $push:{
                ratingAndReviews:ratingReview._id
            }
        },{new:true});
        return res.status(200).json({
            success:true,
            message:"Your rating and review is successfully added"
        })


    }
    catch(err)
    {
        console.log(err.message);
        res.status(500).json({
            success:true,
            message:"server error while adding review and rating"
        })
    }
}

exports.getAverageRating=async(req,res)=>{
    try{
        const {courseId}=req.body;

        const result=await RatingAndReview.aggregate([
            {
                $match:{
                    course:new ObjectId(courseId)
                }
            },
            {
                $group:{
                    _id:null,
                    averageRating:{$avg:"$rating"}
                } 
            }
        ])
        if(result.length>0)
        {
            return res.status(200).json({
                success:true,
                averageRating:result[0].averageRating
            })
        }
        return res.status(200).json({
            success:true,
            message:"No rating is given till now",
            averageRating:0
        })
    }
    catch(err)
    {
        console.log(err.message);
        return res.status(500).json({
            success:false,
            message:err.message
        })
    }
}

exports.getAllRating=async(req,res)=>{
    try{
        const allReviews=await RatingAndReview.find({})
                        .sort({rating:"desc"})
                        .populate({
                            path:"user",
                            select:"firstName lastName email image"
                        })
                        .populate({
                            path:"course",
                            select:'courseName'
                        });
        return res.status(200).json({
            success:true,
            message:"All reviews fetched successfully",
            allReviews
        });

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