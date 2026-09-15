import mongoose from "mongoose";
import { CONFIG } from "./config.js";

async function connectDB(){
    try {
        await mongoose.connect(CONFIG.MONGO_URL).then(()=>{
            console.log("Database connected successfully");
        })
    } catch (error) {
        console.log("Database connection failed");
        console.log(error);
        process.exit(1);
    }
}
mongoose.connection.on("disconnected",()=>{
    console.log("Database disconnected");
})
mongoose.connection.on("error",(error)=>{
    console.log("Database connection error");
    console.log(error);
})
export default connectDB;