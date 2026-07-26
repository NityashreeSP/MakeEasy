import axios from "axios";

const API_URL =
    "http://localhost:5000/api/places";

// ==============================
// GET NEARBY PLACES
// ==============================

export const getNearbyPlaces = async (
    lat,
    lon,
    radius = 5000
) => {
    try {
        console.log(
            "📍 Requesting nearby places from backend..."
        );

        const response = await axios.get(
            `${API_URL}/nearby`,
            {
                params: {
                    lat,
                    lon,
                    radius,
                },
                timeout: 70000,
            }
        );

        const places =
            response.data?.places || [];

        console.log(
            "✅ Nearby places received from backend:",
            places.length
        );

        if (response.data?.cached) {
            console.log(
                "⚡ Places loaded from backend cache"
            );
        }

        return places;

    } catch (error) {
        console.error(
            "❌ Nearby places backend error:",
            error.response?.data?.message ||
            error.message
        );

        return [];
    }
};