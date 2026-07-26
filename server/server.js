import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import savedPlaceRoutes from "./routes/savedPlaceRoutes.js";
import connectDB from "./config/db.js";
import tripRoutes from "./routes/tripRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import placeRoutes from "./routes/placeRoutes.js";

dotenv.config();

connectDB();

const app = express();

app.use(cors());

app.use(express.json());

app.use(cookieParser());

app.use(morgan("dev"));

app.use("/api/auth", authRoutes);

app.use("/api/places", savedPlaceRoutes);

app.use("/api/trips", tripRoutes);

app.use("/api/places", placeRoutes);

app.get("/", (req, res) => {

  res.json({
    success: true,
    message: "Welcome to TerraGuide AI API 🚀",
  });

});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(`Server Running on Port ${PORT}`);

});