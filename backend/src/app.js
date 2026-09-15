import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import authRouter from "./routes/auth.routes.js";

const app = express();

app.use(cors({
    origin: "http://localhost:5173",  // exact frontend URL, wildcard nahi
    credentials: true
}));

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

//routes
//auth routes
app.use("/api/auth",authRouter);

export default app;