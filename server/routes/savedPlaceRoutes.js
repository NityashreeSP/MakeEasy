import express from "express";
import { savePlace, getSavedPlaces, deleteSavedPlace } from "../controllers/savedPlaceController.js";
import protect from "../middleware/authMiddleware.js";


const router = express.Router();

// Save a place
router.post("/save", protect, savePlace);

router.get("/saved", protect, getSavedPlaces);

router.delete("/:placeId", protect, deleteSavedPlace);

export default router;