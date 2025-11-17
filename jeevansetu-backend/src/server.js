// jeevansetu-backend/src/server.js

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./config/db.js";
import healthRoute from "./routes/health.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import donationRoutes from "./routes/donationRoutes.js";

// Load env variables
dotenv.config();

// Connect DB
connectDB();

// Initialize app
const app = express();

// Middleware 
app.use(helmet());
app.use(cors({origin :  "http://localhost:5173" ,  credentials : true}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Routes 
app.use("/api/health", healthRoute);
app.use("/api/auth" , authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/donations", donationRoutes);

// Server listen
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
});