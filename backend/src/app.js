import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import authRouter from "./routes/auth.routes.js";
import passport from "passport";
import {Strategy as GoogleStrategy} from "passport-google-oauth20";
import { CONFIG } from "./config/config.js";
import productRouter from "./routes/product.routes.js";

const app = express();

app.use(cors({
    origin: "http://localhost:5173",  // exact frontend URL, wildcard nahi
    credentials: true
}));

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(passport.initialize());


//Google auth gmail sign in 
passport.use(new GoogleStrategy({
    clientID: CONFIG.GOOGLE_CLIENTID,
    clientSecret: CONFIG.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback",
    scope: ["email", "profile"],
    session:false,
},( accessToken, refreshToken, profile, done) => {
    // yahan Google se aaye profile info ko db mein save / match kar lenge
    return done(null, profile); 
}));



//routes
//auth routes
app.use("/api/auth",authRouter);

//product routes
app.use("/api/products",productRouter);

export default app;