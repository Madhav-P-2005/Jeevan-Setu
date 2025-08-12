// # jeevansetu-backend/src/routes/health.js


import express from "express";
import dotenv from "dotenv"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import connectDB from "./config/db.js"
import healthRoute from "./routes/health.js";


// Load env variables 
dotenv.config();


// Connect DB 
connectDB();


// Initialize app 
const app = express();
