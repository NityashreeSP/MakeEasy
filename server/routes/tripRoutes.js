import express from "express";

import {
    saveTrip,
    getMyTrips,
    getTripById,
    deleteTrip,
    updateTripItinerary,
} from "../controllers/tripController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();


// ==============================
// SAVE TRIP
// POST /api/trips
// ==============================

router.post(
    "/",
    protect,
    saveTrip
);


// ==============================
// GET ALL MY TRIPS
// GET /api/trips
// ==============================

router.get(
    "/",
    protect,
    getMyTrips
);


// ==============================
// GET ONE TRIP
// GET /api/trips/:id
// ==============================

router.get(
    "/:id",
    protect,
    getTripById
);


// ==============================
// UPDATE TRIP ITINERARY
// PUT /api/trips/:id
// ==============================

router.put(
    "/:id",
    protect,
    updateTripItinerary
);


// ==============================
// DELETE TRIP
// DELETE /api/trips/:id
// ==============================

router.delete(
    "/:id",
    protect,
    deleteTrip
);


export default router;