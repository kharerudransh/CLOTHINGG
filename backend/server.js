import app from "./src/app.js";
import dotenv from "dotenv";
import connectDB from "./src/config/database.js";
import { CONFIG } from "./src/config/config.js";

//env file config 
dotenv.config();
const PORT = CONFIG.PORT 

//database connection
connectDB();

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});