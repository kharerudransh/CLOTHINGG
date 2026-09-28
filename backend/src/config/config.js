import dotenv from "dotenv";
dotenv.config();


if(!process.env.PORT){
    throw new Error("PORT is not defined in the environment variables");
}
if(!process.env.MONGO_URL){
    throw new Error("MONGO_URL is not defined in the environment variables");
}
if(!process.env.JWT_TOKEN){
    throw new Error("JWT_TOKEN is not defined in the environment variables");
}

if(!process.env.GMAIL_USER){
    throw new Error("GMAIL_USER is not defined in the environment variables");
}
if(!process.env.GMAIL_APP_PASSWORD){
    throw new Error("GMAIL_APP_PASSWORD is not defined in the environment variables");
}
if(!process.env.GOOGLE_CLIENTID){
    throw new Error("GOOGLE_CLIENT_ID is not defined in the environment variables");
}
if(!process.env.GOOGLE_CLIENT_SECRET){
    throw new Error("GOOGLE_CLIENT_SECRET is not defined in the environment variables");
}
if(!process.env.ImageKitURLENDPOINTS){
    throw new Error("ImageKitURLENDPOINTS is not defined in the environment variables");
}
if(!process.env.ImageKit_Public_Key){
    throw new Error("ImageKit_Public_Key is not defined in the environment variables");
}
if(!process.env.ImageKit_Private_Key){
    throw new Error("ImageKit_Private_Key is not defined in the environment variables");
}

export const CONFIG= {
    PORT: process.env.PORT,
    MONGO_URL: process.env.MONGO_URL,
    JWT_TOKEN: process.env.JWT_TOKEN,
    GMAIL_USER:process.env.GMAIL_USER,
    GMAIL_APP_PASSWORD:process.env.GMAIL_APP_PASSWORD,
    GOOGLE_CLIENTID:process.env.GOOGLE_CLIENTID,
    GOOGLE_CLIENT_SECRET:process.env.GOOGLE_CLIENT_SECRET,
    ImageKitURLENDPOINTS:process.env.ImageKitURLENDPOINTS,
    ImageKit_Public_Key:process.env.ImageKit_Public_Key,
    ImageKit_Private_Key:process.env.ImageKit_Private_Key
}
