const Section=require("../models/Section");
const SubSection=require("../models/SubSection");
const { uploadImage } = require("../utils/imageUploader");

exports.createSubSection=async(req,res)=>{
    try{
        const {sectionId,title,timeDuration,description}=req.body;
        const video=req.files.videoFile;
        if(!sectionId || !title || !timeDuration || !description || !video)
        {
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }
        const uploadDetails=await uploadImage(video,process.env.FOLDER_NAME);
        const subsectionDetails=await SubSection.create({
            title,timeDuration,description,videoUrl:uploadDetails.secure_url
        });
        const updatedSection=await Section.findByIdAndUpdate(sectionId,
            {$push:{
                    subSection:subsectionDetails._id,
                }},{new:true}
        ).populate("subSection");

        res.status(200).json({
            success:true,
            message:"Sub section created successfully"
        })
    }
    catch(err)
    {
        console.log(err.message);
        res.status(500).json({
            success:false,
            message:"Server error while creating sub section"
        })
    }
}


exports.updateSubSection = async (req, res) => {
    try {
      const { sectionId, title, description } = req.body
      const subSection = await SubSection.findById(sectionId)
  
      if (!subSection) {
        return res.status(404).json({
          success: false,
          message: "SubSection not found",
        })
      }
  
      if (title !== undefined) {
        subSection.title = title
      }
  
      if (description !== undefined) {
        subSection.description = description
      }
      if (req.files && req.files.video !== undefined) {
        const video = req.files.video
        const uploadDetails = await uploadImage(
          video,
          process.env.FOLDER_NAME
        )
        subSection.videoUrl = uploadDetails.secure_url
        subSection.timeDuration = `${uploadDetails.duration}`
      }
  
      await subSection.save()
  
      return res.json({
        success: true,
        message: "Section updated successfully",
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating the section",
      })
    }
  }
  
  exports.deleteSubSection = async (req, res) => {
    try {
      const { subSectionId, sectionId } = req.body
      await Section.findByIdAndUpdate(
        { _id: sectionId },
        {
          $pull: {
            subSection: subSectionId,
          },
        }
      )
      const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })
  
      if (!subSection) {
        return res
          .status(404)
          .json({ success: false, message: "SubSection not found" })
      }
  
      return res.json({
        success: true,
        message: "SubSection deleted successfully",
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "An error occurred while deleting the SubSection",
      })
    }
  }