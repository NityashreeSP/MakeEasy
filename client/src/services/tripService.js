import axios from "axios";

const API_URL = "http://localhost:5000/api/trips";

// ==============================
// GET TOKEN
// ==============================

const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};


// ==============================
// SAVE TRIP
// ==============================

export const saveTrip = async (tripData) => {
    try {
        const response = await axios.post(
            API_URL,
            tripData,
            getAuthConfig()
        );

        return response.data;

    } catch (error) {
        console.error(
            "Save trip error:",
            error
        );

        throw error;
    }
};


// ==============================
// GET MY TRIPS
// ==============================

export const getMyTrips = async () => {
    try {
        const response = await axios.get(
            API_URL,
            getAuthConfig()
        );

        return response.data;

    } catch (error) {
        console.error(
            "Get my trips error:",
            error
        );

        throw error;
    }
};


// ==============================
// GET SINGLE TRIP
// ==============================

export const getTripById = async (tripId) => {
    try {
        const response = await axios.get(
            `${API_URL}/${tripId}`,
            getAuthConfig()
        );

        return response.data;

    } catch (error) {
        console.error(
            "Get trip error:",
            error
        );

        throw error;
    }
};

// ==============================
// UPDATE TRIP ITINERARY
// ==============================

export const updateTripItinerary = async (
    tripId,
    itinerary
) => {
    try {
        const response = await axios.put(
            `${API_URL}/${tripId}`,
            {
                itinerary,
            },
            getAuthConfig()
        );

        return response.data;

    } catch (error) {
        console.error(
            "Update trip itinerary error:",
            error
        );

        throw error;
    }
};

// ==============================
// DELETE TRIP
// ==============================

export const deleteTrip = async (tripId) => {
    try {
        const response = await axios.delete(
            `${API_URL}/${tripId}`,
            getAuthConfig()
        );

        return response.data;

    } catch (error) {
        console.error(
            "Delete trip error:",
            error
        );

        throw error;
    }
};