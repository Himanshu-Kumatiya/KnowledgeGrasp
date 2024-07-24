const { instance } = require("../config/Razorpay");
const User = require("../models/User");
const Course = require("../models/Course");
const mailSender = require("../utils/mailSender");
const { courseEnrollmentEmail } = require("../mail-templates/courseEnrollmentEmail");
exports.capturePayment = async (req, res) => {
    const { course_id } = req.body;
    const userId = req.user.id;
    if (!course_id) {
        return res.json({
            success: false,
            message: 'Please provide course ID'
        });
    }
    let course;
    try {
        course = await Course.findById(course_id);
        if (!course) {
            return res.json({
                success: false,
                message: 'Please provide valid course ID'
            });
        }
        const uid = new mongoose.Types.ObjectId(userId);
        if (course.studentsEnrolled.includes(uid)) {
            return res.status(200).json({
                success: false,
                message: 'Student is already enrolled'
            });
        }
    }
    catch (err) {
        console.log(err.message);
        return res.status(500).json({
            success: false,
            message: 'Server error while creating order '
        });
    }

    //order created
    const amount = course.price;
    const currency = "INR";
    const options = {
        amount: amount * 100,
        currency,
        receipt: Math.random(Date.now()).toString(),
        notes: {
            courseId: course_id,
            userId
        }
    }
    try {
        //initiate the payment using razorpay
        const paymentRes = await instance.orders.create(options);
        console.log(paymentRes);
        return res.status(200).json({
            success: true,
            course: course,
            orderId: paymentRes.id,
            currency: paymentRes.currency,
            amount: paymentRes.amount
        })
    }
    catch (err) {
        console.log(err.message);
        return res.status(500).json({
            success: false,
            message: 'Server error while creating order '
        });
    }

}

exports.verifySignature=async (req,res)=>{
    const webhookSecret="12345678";
    const signature=req.header['x-razorpay-signature'];
    const shasum=crypto.createHmac("sha256",webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest=shasum.digest("hex");
    if(signature===digest){
        console.log("Payment is Authorised");
        const {courseId,userId}=req.body.payload.payment.entity.notes;
        try{
            const enrolledCourse=await Course.findOneAndUpdate({_id:courseId},
                {
                    $push:{studentsEnrolled:userId},
                    
                },{new:true}
            )
            if(!enrolledCourse)
            {
                return res.status(400).json({
                        success:false,
                        message:"Course not found"
                })
            }
            console.log(enrolledCourse);
            const enrolledUser=await User.findByIdAndUpdate(userId,{$push:{
                courses:courseId
            }},{new:true});
            console.log(enrolledUser);
            const emailRes=await mailSender(User.email,
                    `Congratulations, you have enrolled to ${enrolledCourse.courseName}`
            );
            console.log(emailRes);
            return res.status(200).json({
                success:true,
                message:"Signature verified and course Added", 
            })
        }
        catch(err)
        {
            console.log(err.message);
            return res.status(500).json({
                success:false,
                message:error.message
            });
        }
    }
    else{
        res.status(400).json({
            success:false,
            message:"Invalid request"
        })
    }
}