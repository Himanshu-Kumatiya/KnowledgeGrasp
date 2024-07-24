const mongoose=require("mongoose");
require("dotenv").config();

exports.connectDB=()=>{
    mongoose.connect(process.env.MONGO_DB_URL)
    .then(()=>console.log("DB connected successfully"))
    .catch((error)=>{
        console.log("DB conenction failed");
        console.error(error);
        process.exit(1);
    })
}