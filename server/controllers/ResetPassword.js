 const User =require("../models/User");
 const mailSender=require("../utils/mailSender");
const bcrypt=require("bcrypt")
 exports.resetPasswordToken=async(req,res)=>{
     try{
        const email=req.body.email;
        const user=await User.findOne({email:email});
        if(!user)
        {
            return res.status(401).json({
                success:false,
                message:"Email is not registered"
            })
        }
        
        //creating token for the unique url for a user
        const token=crypto.randomUUID();
        const updatedDetails=await User.findOneAndUpdate(
            {email:email},
            {token:token, resetPasswordExpiry:Date.now()+10*60*1000},
            {new:true});
        
        const url= `https://localhost:3000/update-password/${token}`;
        await mailSender(email,"Password Reset Link",
            `Password Reset Link : ${url}`
        );
        return res.status(401).json({
            success:true,
            message:"Email sent successfully, please check your email to proceed further",
        });
            
    }
    catch(err)
    {
        console.log(err.message);
        res.status(500).json({
            success:false,
            message:"Something went wrong while sending mail for reset password"
        })
    }

 }


 exports.resetPassword=async(req,res)=>{
    try{
        const {password,confirmPassword,token}=req.body;
        if(password!=confirmPassword)
        {
            return res.status(403).json({
                success:false,
                message:"Password and confirm password are not matching"
            })
        }
        const user=await User.findOne({token:token});
        if(!user)
        {
            return res.status(403).json({
                success:false,
                message:"token is invalid"
            })
        }
        if(user.resetPasswordExpiry<Date.now())
        {
            return res.status(403).json({
                success:false,
                message:"Token is expired, please generate your token again"
            });

        }
        const hashPass=await bcrypt.hash(password,10);
        await User.findOneAndUpdate({token:token},
            {
                password:hashPass
            },{new:true}
        );
        return res.status(200).json({
            success:true,
            message:"Password reset successfully "
        })
    }
    catch(err)
    {
        console.log(err.message);
        res.status(500).json({
            success:false,
            message:"Something went wrong while accessing reset page"
        })
    }
 }