// # jeevansetu-backend/src/config/db.js

import mongoose from "mongoose";

const connectDB = async () => {
     
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`✅ MongoDB Connected :-  ${conn.connection.host}`);
    }
    catch(error){
        console.log("❌ MongoDB Connection Error", error.message);

        process.exit(1);   // Exit process if DB fails to connect 
    }
};


export default connectDB;