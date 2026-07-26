import axios from "axios";

export const searchLocation = async (city) => {
    try {
        const response = await axios.get(
            "https://nominatim.openstreetmap.org/search",
            {
                params: {
                    q: city,
                    format: "json",
                    limit: 1,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error("Error searching location:", error);
        return [];
    }
};