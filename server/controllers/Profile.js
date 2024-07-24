const Profile = require("../models/Profile");
const User = require("../models/User");
const { uploadImage } = require("../utils/imageUploader");
exports.updateProfile = async (req, res) =>{
    try {
        const { gender, contactNumber, dateOfBirth = "", about = "" } = req.body;
        const userId = req.user.id;
        console.log("userId ",userId);
        if (!gender || !contactNumber || !userId) {
            return res.status(400).json({
                success: false,
                message: "Fill all required fields"
            })
        }
        const userDetails=await User.findById(userId);
        console.log(userDetails);
        const profileId=userDetails.additionalDetails;
        const updatedProfile=await Profile.findByIdAndUpdate({_id:profileId},{
            dateOfBirth:dateOfBirth,
            about:about,
            gender:gender,
            contactNumber:contactNumber
        });
        res.status(200).json({
            success: false,
            message: "Successfully updated Profile",
            profile:updatedProfile
        })
    }
    catch (err) {
        console.log(err.message);
        res.status(500).json({
            success: false,
            message: "Server error while updating Profile"
        })
    }
}

exports.deleteAccount=async(req,res)=>{
    try{
        const {userId}=req.user.id;
        const userDetails=await User.findById(userId);
        if(!userDetails)
        {
            res.status(404).json({
                success: false,
                message: "User not found"
            });
        } 
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});
        await User.findByIdAndDelete({_id:userId});
        res.status(200).json({
            success: false,
            message: "User deleted successfully"
        });
    }
    catch(err)
    {
        console.log(err.message);
        res.status(500).json({
            success: false,
            message: "Server error while deleting Profile"
        })
    
    }
}

exports.getAllUserDetails=async(req,res)=>{
    try{
        const userProfile=await User.findById(req.user.id).populate("additionalDetails").exec();
        res.status(200).json({
            success: true,
            message: "Fetched user details",
            data:userProfile
        })
    }
    catch(err)
    {
        console.log(err.message);
        res.status(500).json({
            success: false,
            message: "Server error while fecthing Profile"
        })
    }
}

exports.updateDisplayPicture = async (req, res) => {
    try {
      const displayPicture = req.files.displayPicture;
      const userId = req.user.id;
      const image = await uploadImage(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
      )
      console.log(image)
      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )
      res.send({
        success: true,
        message: `Image Updated successfully`,
        data: updatedProfile,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};
  
exports.getEnrolledCourses = async (req, res) => {
    try {
      const userId = req.user.id
      const userDetails = await User.findOne({
        _id: userId,
      })
        .populate("courses")
        .exec()
      if (!userDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find user with id: ${userDetails}`,
        })
      }
      return res.status(200).json({
        success: true,
        data: userDetails.courses,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};