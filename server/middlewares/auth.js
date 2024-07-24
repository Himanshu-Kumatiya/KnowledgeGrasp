const jwt=require("jsonwebtoken");
require("dotenv").config();
const bcrypt=require("bcrypt");
const User=require("../models/User");
exports.auth=async (req,res,next)=>{
    try{
        //console.log(req.cookies);
        const token=req.cookies.token || req.body.token || req.header("Authorisation").replace('Bearer',"");
        if(!token)
        {
            return res.status(401).json({
                success:false,
                message:"Token is missing"
            });
        }
        try{
            const decode=jwt.verify(token,process.env.JWT_SECRET);
            //console.log(decode);
            req.user=decode;
            next();
        }
        catch(err)
        {
            console.log(err.message);
            res.status(402).json({
                success:false,
                message:"You are not the authorized user"
            })
        }
    }
    catch(err)
    {
        console.log(err.message);
        res.status(500).json("Something went wrong while validating the token")
    }
}

exports.isStudent=async(req,res,next)=>{
    try{
        if(req.user.accountType!=="Student")
        {
            return res.status(401).json({
                success:false,
                message:"this is a protected route for Student only"
            })
        }
        next();
    }catch(err){
        console.log(err.message);
        return res.status(500).json({
            success:false,
            message:"User role is invalid"
        })
    }
}
exports.isInstructor=async(req,res,next)=>{
    try{
        if(req.user.accountType!=="Instructor")
        {
            return res.status(401).json({
                success:false,
                message:"this is a protected route for Instructor only"
            })
        }
        next();
    }catch(err){
        console.log(err.message);
        return res.status(500).json({
            success:false,
            message:"User role is invalid"
        })
    }
}
exports.isAdmin=async(req,res,next)=>{
    try{
        if(req.user.accountType!=="Admin")
        {
            return res.status(401).json({
                success:false,
                message:"this is a protected route for Admin only"
            })
        }
        next();
    }catch(err){
        console.log(err.message);
        return res.status(500).json({
            success:false,
            message:"User role is invalid"
        })
    }
}
