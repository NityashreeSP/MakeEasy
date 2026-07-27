import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import savedPlaceRoutes from "./routes/savedPlaceRoutes.js";
import tripRoutes from "./routes/tripRoutes.js";
import placeRoutes from "./routes/placeRoutes.js";

// ==========================================
// ENVIRONMENT VARIABLES
// ==========================================

dotenv.config();

// ==========================================
// CONNECT DATABASE
// ==========================================

connectDB();

// ==========================================
// CREATE EXPRESS APP
// ==========================================

const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(
    cors({
        origin:
            process.env.CLIENT_URL ||
            "http://localhost:5173",

        credentials: true,
    })
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(morgan("dev"));

// ==========================================
// API ROUTES
// ==========================================

// Authentication
app.use(
    "/api/auth",
    authRoutes
);

// Saved places
app.use(
    "/api/places",
    savedPlaceRoutes
);

// Trips
app.use(
    "/api/trips",
    tripRoutes
);

// Nearby places / Geoapify
app.use(
    "/api/places",
    placeRoutes
);

// ==========================================
// ROOT ROUTE
// ==========================================

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message:
            "Welcome to TerraGuide AI API 🚀",
    });
});

// ==========================================
// HEALTH CHECK
// ==========================================

app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message:
            "TerraGuide AI backend is healthy",
    });
});

// ==========================================
// 404 HANDLER
// ==========================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found",
    });
});

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {
    console.error(
        "Server Error:",
        err.stack
    );

    res.status(
        err.status || 500
    ).json({
        success: false,
        message:
            err.message ||
            "Internal Server Error",
    });
});

// ==========================================
// START SERVER
// ==========================================

const PORT =
    process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(
        `🚀 Server Running on Port ${PORT}`
    );
});