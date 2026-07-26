import User from "../models/User.js";

export const savePlace = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            placeId,
            name,
            category,
            lat,
            lon
        } = req.body;

        const user = await User.findById(userId);

        const alreadySaved = user.savedPlaces.some(
            (place) => place.placeId === String(placeId)
        );

        if (alreadySaved) {
            return res.status(400).json({
                success: false,
                message: "Place already saved",
            });
        }

        user.savedPlaces.push({
            placeId: String(placeId),
            name,
            category,
            lat,
            lon,
        });

        await user.save();

        res.status(200).json({
            success: true,
            message: "Place saved successfully",
            savedPlaces: user.savedPlaces,
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to save place",
        });
    }
};

export const getSavedPlaces = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            savedPlaces: user.savedPlaces,
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to get saved places",
        });
    }
};

export const deleteSavedPlace = async (req, res) => {
    try {
        const userId = req.user.id;
        const { placeId } = req.params;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const placeExists = user.savedPlaces.some(
            (place) => place.placeId === placeId
        );

        if (!placeExists) {
            return res.status(404).json({
                success: false,
                message: "Saved place not found",
            });
        }

        user.savedPlaces = user.savedPlaces.filter(
            (place) => place.placeId !== placeId
        );

        await user.save();

        res.status(200).json({
            success: true,
            message: "Place removed successfully",
            savedPlaces: user.savedPlaces,
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to remove saved place",
        });
    }
};