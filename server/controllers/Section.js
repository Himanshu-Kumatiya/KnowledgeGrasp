const Section=require("../models/Section");
const Course=require("../models/Course");

exports.createSection=async(req,res)=>{
    try{
        const {sectionName,courseId}=req.body;
        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:"Missing Properties"
            });
        }
        const newSection=await Section.create({
            sectionName
        });
        const updatedCourse=await Course.findByIdAndUpdate(courseId,{
            $push:{
                courseContent:newSection._id
            }
        },{new:true})
        return res.status(200).json({
            success:true,
            message:"Section created successfully",
            data:updatedCourse
        })
    }
    catch(err)
    {
        console.log(err.message);
        res.status(500).json({
            success:false,
            message:"Unable to create section"
        })
    }
}

exports.updateSection=async(req,res)=>{
    try{
        const {sectionName,sectionId}=req.body;
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success:false,
                message:"Missing Properties"
            });
        }
        
        const updatedSection=await Section.findByIdAndUpdate({courseId},{
            sectionName
        },{new:true})
        return res.status(200).json({
            success:true,
            message:"Section Updated successfully",
            data:updatedSection
        })

    }catch(err)
    {
        console.log(err.message);
        res.status(500).json({
            success:false,
            message:"Unable to update section"
        })
    }
}

exports.deleteSection=async(req,res)=>{
    try{
        const {sectionId}=req.params;
        await Section.findByIdAndUpdate(sectionId);
        
        return res.status(200).json({
            success:true,
            message:"Section deleted successfully",
            
        })
    }
    catch(err)
    {
        console.log(err.message);
        res.status(500).json({
            success:false,
            message:"Server error while fetching deleting section"
        })
    }
}
