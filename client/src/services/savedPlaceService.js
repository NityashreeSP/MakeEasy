import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/places`;

// Save a place
export const savePlace = async (place) => {
    const token = localStorage.getItem("token");

    const placeData = {
        placeId: String(place.id),

        name: place.tags?.name,

        category:
            place.tags?.amenity ||
            place.tags?.tourism ||
            "place",

        lat: Number(place.lat),
        lon: Number(place.lon),
    };

    const response = await axios.post(
        `${API_URL}/save`,
        placeData,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};


// Get all saved places
export const getSavedPlaces = async () => {
    const token = localStorage.getItem("token");

    const response = await axios.get(
        `${API_URL}/saved`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};


// Delete saved place
export const deleteSavedPlace = async (placeId) => {
    const token = localStorage.getItem("token");

    const response = await axios.delete(
        `${API_URL}/${placeId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};