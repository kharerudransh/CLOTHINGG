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
if(!process.env.RESEND_MAIL){
    throw new Error("RESEND_MAIL is not defined in the environment variables");
}
if(!process.env.MAIL_FROM){
    throw new Error("MAIL_FROM is not defined in the environment variables");
}
if(!process.env.GMAIL_USER){
    throw new Error("GMAIL_USER is not defined in the environment variables");
}
if(!process.env.GMAIL_APP_PASSWORD){
    throw new Error("GMAIL_APP_PASSWORD is not defined in the environment variables");
}
export const CONFIG= {
    PORT: process.env.PORT,
    MONGO_URL: process.env.MONGO_URL,
    JWT_TOKEN: process.env.JWT_TOKEN,
    RESEND_MAIL:process.env.RESEND_MAIL,
    MAIL_FROM:process.env.MAIL_FROM,
    GMAIL_USER:process.env.GMAIL_USER,
    GMAIL_APP_PASSWORD:process.env.GMAIL_APP_PASSWORD
    
}

