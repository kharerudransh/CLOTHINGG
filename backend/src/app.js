import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import authRouter from "./routes/auth.routes.js";
import passport from "passport";
import {Strategy as GoogleStrategy} from "passport-google-oauth20";
import { CONFIG } from "./config/config.js";
import productRouter from "./routes/product.routes.js";
import cartRouter from "./routes/cart.routes.js";

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,   // https://<name>.vercel.app, no trailing slash
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Blocked by CORS: ${origin}`), false);
  },
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
  callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
  proxy: true,
}, (accessToken, refreshToken, profile, done) => done(null, profile)));



//routes
//auth routes
app.use("/api/auth",authRouter);

//product routes
app.use("/api/products",productRouter);

//cart routes
app.use("/api/cart",cartRouter);


export default app;