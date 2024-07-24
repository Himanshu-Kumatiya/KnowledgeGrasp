const User=require("../models/User");
const OTP=require("../models/Otp");
const otpGen=require("otp-generator");
const bcrypt=require("bcrypt");
const Profile=require("../models/Profile");
const jwt=require("jsonwebtoken");
const mailSender=require("../utils/mailSender");
require("dotenv").config();
exports.sendOtp=async (req,res)=>{
    try{
        const {email}=req.body;
        const userPresent=await User.findOne({email});
        if(userPresent)
        {
            return res.status(401).json({
                success:false,
                message:"User already registered"
            });
        }
        var otp=otpGen.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false
        });
        console.log("OTP generated: ",otp);
        const result=await OTP.findOne({otp:otp});
        while(result)
        {
            otp=otpGen.generate(6,{
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false
            });
            result=await OTP.findOne({otp:otp});
        }
        const otpPayload={email,otp};
        const otpCreated=await OTP.create(otpPayload);
        console.log("otp created",otpCreated);
        res.status(200).json({
            success:true,
            message:"Otp sent successfully",
            otp
        })
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({
            success:false,
            message:err.message,
        })
    }
};
exports.signUp=async (req,res)=>{
    const {firstName,lastName,email,password,confirmPassword,accountType,contactNumber,otp}=req.body;
    if(!firstName || !lastName || !email || !password || !confirmPassword || !otp)
    {
       return res.status(403).json({
        success:false,
        message:"ALL field required"
       }); 
    }
    if(password!==confirmPassword)
    {
        return res.status(402).json({
            success:false,
            message:"Password and confirm password are not same"
        })
    }
    try{
        const userExist=await User.findOne({email});
        if(userExist){
            return res.status(400).json({
                success:false,
                message:"User Already exist"
            })
        }
        const recentOtp=await OTP.find({email}).sort({createdAt:-1}).limit(1);
        console.log(recentOtp);
        if(recentOtp.length==0)
        {
            return res.status(400).json({
                success:false,
                message:"Otp not found"
            })
        }
        else if(otp!==recentOtp[0].otp)
        {
            return res.status(400).json({
                success:false,
                message:"Invalid OTP"
            })
        }
        
        const hashedPass=await bcrypt.hash(password,10);
        //console.log("Ok h yh tk",hashedPass);
        const profile=await Profile.create({
            gender:null,dateOfBirth:null,about:null,contactNumber:null
        });
        const user=await User.create({
            firstName,lastName,email,password:hashedPass
            ,accountType,contactNumber,
            additionalDetails:profile._id,
            image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
        })
        console.log("signup user ",user);
        res.status(200).json({
            success:true,
            message:"User is registered successfully",
            user
        });
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({
            success:false,
            message:"error while signup : "+err.message,
        })
    }
}
exports.login=async(req,res)=>{
    try{
        const {email,password}=req.body;
        if(!email || !password)
        {
            return res.status(403).json({
                success:false,
                message:"Fill all the credentials"
            })
        }
        const user=await User.findOne({email});
        if(!user)
        {
            return res.status(401).json({
                success:false,
                message:"User is not registered, Please Sing Up"
            })
        }
        if(await bcrypt.compare(password,user.password))
        {
            const payload={
                email:user.email,
                id:user._id,
                accountType:user.accountType
            }
            const token=jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn:"2h"
            });
            user.token=token;
            user.password=undefined;
            const options={
                expires:new Date(Date.now()+3*24*60*60*1000),
                httpOnly:true
            }

            res.cookie("token",token,options).status(200).json({
                success:true,
                token,user,
                message:"Logged In successfully"
            })
        }
        else{
            return res.status(401).status({
                success:false,
                message:"Password is incorrect"
            })
        }
        


    }catch(err)
    {
        console.log(err);
        res.status(500).json({
            success:false,
            message:"Login failure",
        })
    }
}

exports.changePassword=async(req,res)=>{
    const {email,oldPassword,newPassword,confirmPassword}=req.body;
    if(newPassword!=confirmPassword)
    {
        return res.status(402).json({
            success:false,
            message:"Confirm password does not match new password"
        })
    }
    try{
        const hashedPass=bcrypt.hash(newPassword,10);
        const updatedUser=await User.findOneAndUpdate({email:email},{password:newPassword});
        res.status(200).json({
            success:true,
            message:"Password changed successfully",
            
        });
        try {
            const mailResponse = await mailSender(email,"Password Updated",
                `Your password is updated and new password is  ${newPassword}`);
            console.log("Email sent Successfully: ", mailResponse);
        }
        catch (err) {
            console.log("Error occured while sending mails ", err.message);
            throw err;
        }
    }
    catch(err)
    {
        console.log(err);
        res.status(400).json({
            success:false,
            message:"Server error"
        })
    }
}