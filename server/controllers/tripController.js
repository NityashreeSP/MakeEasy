import Trip from "../models/Trip.js";

// ==============================
// SAVE NEW TRIP
// POST /api/trips
// ==============================

export const saveTrip = async (req, res) => {
    try {
        const {
            destination,
            startDate,
            days,
            travellers,
            totalBudget,

            budgetPerPerson,
            budgetPerDay,
            budgetPerPersonPerDay,
            budgetLevel,
            budgetLabel,
            budgetRecommendation,
            budgetBreakdown,

            interests,
            itinerary,
            weather,
        } = req.body;

        // Basic validation
        if (
            !destination ||
            !startDate ||
            !days ||
            !travellers ||
            totalBudget === undefined
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Please provide all required trip details",
            });
        }

        // User comes from JWT middleware
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Not authorized",
            });
        }

        const trip = await Trip.create({
            user: req.user.id,

            destination,
            startDate,
            days,
            travellers,
            totalBudget,

            budgetPerPerson,
            budgetPerDay,
            budgetPerPersonPerDay,
            budgetLevel,
            budgetLabel,
            budgetRecommendation,
            budgetBreakdown,

            interests,
            itinerary,
            weather,
        });

        return res.status(201).json({
            success: true,
            message:
                "Trip saved successfully",
            trip,
        });

    } catch (error) {
        console.error(
            "Save trip error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to save trip",
        });
    }
};


// ==============================
// GET LOGGED-IN USER'S TRIPS
// GET /api/trips
// ==============================

export const getMyTrips = async (
    req,
    res
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Not authorized",
            });
        }

        const trips = await Trip.find({
            user: req.user.id,
        }).sort({
            createdAt: -1,
        });

        return res.status(200).json({
            success: true,
            count: trips.length,
            trips,
        });

    } catch (error) {
        console.error(
            "Get trips error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to fetch trips",
        });
    }
};


// ==============================
// GET ONE TRIP
// GET /api/trips/:id
// ==============================

export const getTripById = async (
    req,
    res
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Not authorized",
            });
        }

        const trip = await Trip.findOne({
            _id: req.params.id,
            user: req.user.id,
        });

        if (!trip) {
            return res.status(404).json({
                success: false,
                message:
                    "Trip not found",
            });
        }

        return res.status(200).json({
            success: true,
            trip,
        });

    } catch (error) {
        console.error(
            "Get trip error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to fetch trip",
        });
    }
};


// ==============================
// DELETE TRIP
// DELETE /api/trips/:id
// ==============================

export const deleteTrip = async (
    req,
    res
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Not authorized",
            });
        }

        const trip = await Trip.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id,
        });

        if (!trip) {
            return res.status(404).json({
                success: false,
                message:
                    "Trip not found",
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Trip deleted successfully",
        });

    } catch (error) {
        console.error(
            "Delete trip error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to delete trip",
        });
    }
};


// ==============================
// UPDATE TRIP ITINERARY
// PUT /api/trips/:id
// ==============================

export const updateTripItinerary = async (
    req,
    res
) => {
    try {
        // ==========================
        // AUTH CHECK
        // ==========================

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Not authorized",
            });
        }

        // ==========================
        // GET UPDATED ITINERARY
        // ==========================

        const {
            itinerary,
        } = req.body;

        // ==========================
        // VALIDATION
        // ==========================

        if (
            !Array.isArray(itinerary) ||
            itinerary.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Please provide a valid itinerary",
            });
        }

        // Make sure every day is valid
        for (const day of itinerary) {

            if (
                !day ||
                day.day === undefined
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid itinerary day",
                });
            }

            // Validate morning
            if (
                !day.morning ||
                !day.morning.name ||
                !day.morning.name.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        `Please provide a morning place for Day ${day.day}`,
                });
            }

            // Validate afternoon
            if (
                !day.afternoon ||
                !day.afternoon.name ||
                !day.afternoon.name.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        `Please provide an afternoon place for Day ${day.day}`,
                });
            }

            // Validate evening
            if (
                !day.evening ||
                !day.evening.name ||
                !day.evening.name.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        `Please provide an evening place for Day ${day.day}`,
                });
            }
        }

        // ==========================
        // FIND USER'S TRIP
        // ==========================

        const trip = await Trip.findOne({
            _id: req.params.id,
            user: req.user.id,
        });

        if (!trip) {
            return res.status(404).json({
                success: false,
                message:
                    "Trip not found",
            });
        }

        // ==========================
        // UPDATE ITINERARY
        // ==========================

        trip.itinerary =
            itinerary.map((day) => ({
                ...day,

                morning: {
                    ...day.morning,
                    name:
                        day.morning.name.trim(),
                },

                afternoon: {
                    ...day.afternoon,
                    name:
                        day.afternoon.name.trim(),
                },

                evening: {
                    ...day.evening,
                    name:
                        day.evening.name.trim(),
                },
            }));

        await trip.save();

        // ==========================
        // SUCCESS
        // ==========================

        return res.status(200).json({
            success: true,

            message:
                "Trip itinerary updated successfully",

            trip,
        });

    } catch (error) {

        console.error(
            "Update trip itinerary error:",
            error
        );

        // Invalid MongoDB ID
        if (
            error.name ===
            "CastError"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid trip ID",
            });
        }

        return res.status(500).json({
            success: false,

            message:
                "Unable to update trip itinerary",
        });
    }
};