import express from "express";

import {
    getNearbyPlaces,
    getHotels,
} from "../controllers/placeController.js";

const router = express.Router();


// Nearby places
router.get(
    "/nearby",
    getNearbyPlaces
);


// Hotels
router.get(
    "/hotels",
    getHotels
);


export default router;