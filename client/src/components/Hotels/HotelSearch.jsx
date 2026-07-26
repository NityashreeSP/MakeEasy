import { useEffect, useState } from "react";
import { searchLocation } from "../../services/mapService";
import { getHotels } from "../../services/hotelService";

function HotelSearch({
    destination = "",
    travellers = 1,
    days = 1,
    accommodationBudget = 0,
    budgetLevel = "moderate",
}) {
    // =========================
    // STATES
    // =========================

    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [searched, setSearched] = useState(false);

    // =========================
    // BUDGET RECOMMENDATION
    // =========================

    const getHotelRecommendation = () => {
        const totalBudget = Number(accommodationBudget);
        const tripDays = Math.max(Number(days), 1);
        const people = Math.max(Number(travellers), 1);

        const approximatePerDay =
            Math.round(totalBudget / tripDays);

        if (budgetLevel === "budget") {
            return {
                type: "Budget Hotel / Hostel / Guest House",
                reason:
                    "Your trip is budget-oriented, so economical stays can help preserve more money for food, transport and activities.",
                approximatePerDay,
            };
        }

        if (budgetLevel === "premium") {
            return {
                type: "Premium Hotel",
                reason:
                    "Your trip budget allows you to consider more comfortable or premium accommodation options.",
                approximatePerDay,
            };
        }

        return {
            type: "Comfortable Mid-range Hotel",
            reason:
                "A mid-range hotel provides a good balance between accommodation comfort and the rest of your trip expenses.",
            approximatePerDay,
            people,
        };
    };

    const recommendation =
        getHotelRecommendation();

    // =========================
    // SEARCH HOTELS
    // =========================

    const handleSearchHotels = async () => {
        if (!destination.trim()) {
            setError(
                "Trip destination is unavailable."
            );
            return;
        }

        setLoading(true);
        setError("");
        setHotels([]);
        setSearched(true);

        try {
            // Get destination coordinates

            const locationData =
                await searchLocation(
                    destination.trim()
                );

            if (
                !locationData ||
                locationData.length === 0
            ) {
                setError(
                    "Destination not found."
                );
                return;
            }

            const lat = parseFloat(
                locationData[0].lat
            );

            const lon = parseFloat(
                locationData[0].lon
            );

            if (
                !Number.isFinite(lat) ||
                !Number.isFinite(lon)
            ) {
                setError(
                    "Unable to determine destination coordinates."
                );
                return;
            }

            console.log(
                "Searching hotels for:",
                destination
            );

            console.log(
                "Hotel coordinates:",
                lat,
                lon
            );

            // Fetch real mapped hotels

            const hotelData =
                await getHotels(lat, lon);

            console.log(
                "Hotels returned to component:",
                hotelData.length
            );

            setHotels(hotelData);

        } catch (error) {
            console.error(
                "Hotel search error:",
                error
            );

            setError(
                "Unable to search hotels right now. Please try again."
            );

        } finally {
            setLoading(false);
        }
    };

    // =========================
    // DIRECTIONS
    // =========================

    const handleDirections = (hotel) => {
        if (
            hotel.lat == null ||
            hotel.lon == null
        ) {
            alert(
                "Hotel coordinates are unavailable."
            );
            return;
        }

        const url =
            `https://www.google.com/maps/dir/?api=1&destination=${hotel.lat},${hotel.lon}`;

        window.open(
            url,
            "_blank",
            "noopener,noreferrer"
        );
    };

    // =========================
    // BOOK / SEARCH HOTEL
    // =========================

    const handleBookingSearch = (hotel) => {
        /*
            We do NOT have live hotel inventory,
            room rates or availability from OSM.

            Therefore this button opens a Google
            hotel search for the real hotel instead
            of pretending that a booking was made.
        */

        const query = encodeURIComponent(
            `${hotel.name} ${destination} hotel booking`
        );

        window.open(
            `https://www.google.com/search?q=${query}`,
            "_blank",
            "noopener,noreferrer"
        );
    };

    // =========================
    // HOTEL TYPE LABEL
    // =========================

    const getTypeLabel = (type) => {
        if (type === "hostel") {
            return "Hostel";
        }

        if (type === "guest_house") {
            return "Guest House";
        }

        return "Hotel";
    };

    // =========================
    // OPTIONAL AUTO RESET
    // =========================

    useEffect(() => {
        setHotels([]);
        setError("");
        setSearched(false);
    }, [destination]);

    // =========================
    // UI
    // =========================

    return (
        <div
            style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "20px",
                marginTop: "25px",
            }}
        >
            <h2>
                🏨 Hotel Search
            </h2>

            <p>
                <strong>
                    Destination:
                </strong>{" "}
                {destination ||
                    "Not available"}
            </p>

            <p>
                <strong>
                    Travellers:
                </strong>{" "}
                {travellers}
            </p>

            <p>
                <strong>
                    Trip Duration:
                </strong>{" "}
                {days} Days
            </p>

            {/* ========================= */}
            {/* SMART HOTEL BUDGET */}
            {/* ========================= */}

            <div
                style={{
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "15px",
                    marginTop: "15px",
                }}
            >
                <h3>
                    🧠 Accommodation Recommendation
                </h3>

                <p>
                    <strong>
                        Accommodation Budget:
                    </strong>{" "}
                    ₹{accommodationBudget}
                </p>

                <p>
                    <strong>
                        Approx. Budget Per Day:
                    </strong>{" "}
                    ₹
                    {
                        recommendation
                            .approximatePerDay
                    }
                </p>

                <p>
                    <strong>
                        Suggested Stay:
                    </strong>{" "}
                    {
                        recommendation
                            .type
                    }
                </p>

                <p>
                    💡{" "}
                    {
                        recommendation
                            .reason
                    }
                </p>

                <p>
                    <small>
                        Hotel prices shown by external
                        booking services may differ.
                        The accommodation budget here
                        is your trip-planning estimate,
                        not a live room rate.
                    </small>
                </p>
            </div>

            {/* ========================= */}
            {/* SEARCH BUTTON */}
            {/* ========================= */}

            <button
                type="button"
                onClick={
                    handleSearchHotels
                }
                disabled={loading}
                style={{
                    marginTop: "20px",
                }}
            >
                {loading
                    ? "⏳ Searching Hotels..."
                    : `🔎 Find Hotels in ${
                          destination ||
                          "Destination"
                      }`}
            </button>

            {/* ERROR */}

            {error && (
                <p
                    style={{
                        marginTop: "15px",
                    }}
                >
                    ❌ {error}
                </p>
            )}

            {/* NO HOTELS */}

            {!loading &&
                searched &&
                !error &&
                hotels.length === 0 && (
                    <p
                        style={{
                            marginTop:
                                "15px",
                        }}
                    >
                        No mapped hotels were
                        found near this
                        destination.
                    </p>
                )}

            {/* ========================= */}
            {/* HOTEL RESULTS */}
            {/* ========================= */}

            {hotels.length > 0 && (
                <div
                    style={{
                        marginTop: "25px",
                    }}
                >
                    <h3>
                        🏨 Hotels Found (
                        {hotels.length})
                    </h3>

                    {hotels
                        .slice(0, 15)
                        .map((hotel) => (
                            <div
                                key={
                                    hotel.id
                                }
                                style={{
                                    border:
                                        "1px solid #ddd",
                                    borderRadius:
                                        "8px",
                                    padding:
                                        "15px",
                                    marginBottom:
                                        "15px",
                                }}
                            >
                                <h3>
                                    🏨{" "}
                                    {
                                        hotel.name
                                    }
                                </h3>

                                <p>
                                    <strong>
                                        Type:
                                    </strong>{" "}
                                    {getTypeLabel(
                                        hotel.type
                                    )}
                                </p>

                                {hotel.stars && (
                                    <p>
                                        <strong>
                                            Stars:
                                        </strong>{" "}
                                        {
                                            hotel.stars
                                        }{" "}
                                        ⭐
                                    </p>
                                )}

                                {hotel.address && (
                                    <p>
                                        <strong>
                                            Address:
                                        </strong>{" "}
                                        {
                                            hotel.address
                                        }
                                    </p>
                                )}

                                {hotel.phone && (
                                    <p>
                                        <strong>
                                            Phone:
                                        </strong>{" "}
                                        {
                                            hotel.phone
                                        }
                                    </p>
                                )}

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleDirections(
                                            hotel
                                        )
                                    }
                                >
                                    🧭 Directions
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleBookingSearch(
                                            hotel
                                        )
                                    }
                                    style={{
                                        marginLeft:
                                            "10px",
                                    }}
                                >
                                    🔎 Check Booking
                                </button>

                                {hotel.website && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            window.open(
                                                hotel.website,
                                                "_blank",
                                                "noopener,noreferrer"
                                            )
                                        }
                                        style={{
                                            marginLeft:
                                                "10px",
                                        }}
                                    >
                                        🌐 Website
                                    </button>
                                )}
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}

export default HotelSearch;