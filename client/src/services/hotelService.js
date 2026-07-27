import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/places`;

// ==============================
// GET HOTELS
// ==============================

export const getHotels = async (
    lat,
    lon
) => {
    try {
        console.log(
            "🏨 Requesting hotels from backend..."
        );

        const response =
            await axios.get(
                `${API_URL}/hotels`,
                {
                    params: {
                        lat,
                        lon,
                        radius: 5000,
                    },

                    timeout: 30000,
                }
            );

        const hotels =
            response.data?.hotels || [];

        console.log(
            `✅ ${hotels.length} hotels received`
        );

        if (response.data?.cached) {
            console.log(
                "⚡ Hotels loaded from backend cache"
            );
        }

        return hotels;

    } catch (error) {
        console.error(
            "❌ Hotel service error:",
            error.response?.data
                ?.message ||
                error.message
        );

        return [];
    }
};