import { useState } from "react";
import { searchLocation } from "../../services/mapService";

function TransportPreference({
    destination = "",
    travellers = 1,
    budgetLevel = "moderate",
}) {
    // =========================
    // STATES
    // =========================

    const [startingLocation, setStartingLocation] =
        useState("");

    const [intercityPreference, setIntercityPreference] =
        useState("No Preference");

    const [localPreference, setLocalPreference] =
        useState("No Preference");

    const [distance, setDistance] =
        useState(null);

    const [loadingDistance, setLoadingDistance] =
        useState(false);

    const [transportError, setTransportError] =
        useState("");


    // =========================
    // OPTIONS
    // =========================

    const intercityOptions = [
        "No Preference",
        "Bus",
        "Train",
        "Car",
        "Cab / Taxi",
    ];

    const localOptions = [
        "No Preference",
        "Public Transport",
        "Auto / Cab",
        "Self Drive",
        "Rental Vehicle",
    ];


    // =========================
    // HAVERSINE DISTANCE
    // =========================

    const calculateDistance = (
        lat1,
        lon1,
        lat2,
        lon2
    ) => {
        const toRadians = (degree) =>
            degree * (Math.PI / 180);

        const earthRadius = 6371;

        const dLat = toRadians(
            lat2 - lat1
        );

        const dLon = toRadians(
            lon2 - lon1
        );

        const a =
            Math.sin(dLat / 2) *
                Math.sin(dLat / 2) +
            Math.cos(
                toRadians(lat1)
            ) *
                Math.cos(
                    toRadians(lat2)
                ) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);

        const c =
            2 *
            Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1 - a)
            );

        return earthRadius * c;
    };


    // =========================
    // CALCULATE TRIP DISTANCE
    // =========================

    const handleCalculateDistance =
        async () => {

            if (!startingLocation.trim()) {
                setTransportError(
                    "Please enter your starting location."
                );

                return;
            }

            if (!destination.trim()) {
                setTransportError(
                    "Trip destination is unavailable."
                );

                return;
            }

            setLoadingDistance(true);
            setTransportError("");
            setDistance(null);

            try {
                // Starting location

                const startData =
                    await searchLocation(
                        startingLocation.trim()
                    );

                if (
                    !startData ||
                    startData.length === 0
                ) {
                    setTransportError(
                        "Starting location not found."
                    );

                    return;
                }

                // Destination

                const destinationData =
                    await searchLocation(
                        destination.trim()
                    );

                if (
                    !destinationData ||
                    destinationData.length === 0
                ) {
                    setTransportError(
                        "Destination location not found."
                    );

                    return;
                }

                const startLat =
                    parseFloat(
                        startData[0].lat
                    );

                const startLon =
                    parseFloat(
                        startData[0].lon
                    );

                const destinationLat =
                    parseFloat(
                        destinationData[0].lat
                    );

                const destinationLon =
                    parseFloat(
                        destinationData[0].lon
                    );

                if (
                    !Number.isFinite(startLat) ||
                    !Number.isFinite(startLon) ||
                    !Number.isFinite(
                        destinationLat
                    ) ||
                    !Number.isFinite(
                        destinationLon
                    )
                ) {
                    setTransportError(
                        "Unable to determine location coordinates."
                    );

                    return;
                }

                const calculatedDistance =
                    calculateDistance(
                        startLat,
                        startLon,
                        destinationLat,
                        destinationLon
                    );

                setDistance(
                    Math.round(
                        calculatedDistance
                    )
                );

                console.log(
                    "Starting Location:",
                    startingLocation
                );

                console.log(
                    "Destination:",
                    destination
                );

                console.log(
                    "Approximate Distance:",
                    calculatedDistance
                );

            } catch (error) {

                console.error(
                    "Transport distance error:",
                    error
                );

                setTransportError(
                    "Unable to calculate the distance right now."
                );

            } finally {

                setLoadingDistance(false);

            }
        };


    // =========================
    // INTERCITY RECOMMENDATION
    // =========================

    const getIntercityRecommendation =
        () => {

            const people =
                Number(travellers);

            // Distance hasn't been
            // calculated yet

            if (distance === null) {
                return {
                    transport:
                        "Calculate distance first",

                    reason:
                        "Enter your starting location and calculate the distance to receive a smarter recommendation.",
                };
            }


            // =========================
            // BELOW 50 KM
            // =========================

            if (distance < 50) {

                if (
                    budgetLevel ===
                    "budget"
                ) {
                    return {
                        transport:
                            "Bus",

                        reason:
                            "For a short-distance budget trip, a bus is generally economical and practical.",
                    };
                }

                if (people >= 5) {
                    return {
                        transport:
                            "Car / Rental Vehicle",

                        reason:
                            "For a larger group and short journey, travelling together by car or rental vehicle can be convenient.",
                    };
                }

                return {
                    transport:
                        "Car / Cab",

                    reason:
                        "For a short journey, a car or cab provides convenient point-to-point travel.",
                };
            }


            // =========================
            // 50 - 200 KM
            // =========================

            if (distance < 200) {

                if (
                    budgetLevel ===
                    "budget"
                ) {
                    return {
                        transport:
                            "Bus / Train",

                        reason:
                            "For this distance, bus or train can help keep travel expenses lower.",
                    };
                }

                if (people >= 5) {
                    return {
                        transport:
                            "Car / Rental Vehicle",

                        reason:
                            "Travelling together by car or rental vehicle can be practical for a larger group over this distance.",
                    };
                }

                return {
                    transport:
                        "Bus / Car / Train",

                    reason:
                        "For a medium-distance journey, bus, car and train are all practical options depending on availability and convenience.",
                };
            }


            // =========================
            // 200 - 700 KM
            // =========================

            if (distance < 700) {

                if (
                    budgetLevel ===
                    "premium"
                ) {
                    return {
                        transport:
                            "Train / Car",

                        reason:
                            "For this longer journey, train or private car can provide a good balance of comfort and convenience.",
                    };
                }

                return {
                    transport:
                        "Train / Bus",

                    reason:
                        "For a longer intercity journey, train or bus is generally more suitable and economical than using a private cab for the entire distance.",
                };
            }


            // =========================
            // 700+ KM
            // =========================

            if (
                budgetLevel ===
                "budget"
            ) {
                return {
                    transport:
                        "Train",

                    reason:
                        "For a long-distance budget trip, train travel is generally more economical where a suitable connection is available.",
                };
            }

            if (
                budgetLevel ===
                "premium"
            ) {
                return {
                    transport:
                        "Flight / Train",

                    reason:
                        "For a long-distance trip, compare flights and trains based on travel time, availability and convenience.",
                };
            }

            return {
                transport:
                    "Train / Flight",

                reason:
                    "For a long journey, train or flight is generally more practical than travelling the entire distance by road.",
            };
        };


    // =========================
    // LOCAL RECOMMENDATION
    // =========================

    const getLocalRecommendation =
        () => {

            const people =
                Number(travellers);

            if (people >= 6) {
                return {
                    transport:
                        "Rental Vehicle",

                    reason:
                        "A rental vehicle can make travelling between multiple attractions easier for a larger group.",
                };
            }

            if (
                budgetLevel ===
                "budget"
            ) {
                return {
                    transport:
                        "Public Transport / Auto",

                    reason:
                        "Public transport and autos can help reduce local travel expenses during a budget trip.",
                };
            }

            if (
                budgetLevel ===
                "premium"
            ) {
                return {
                    transport:
                        "Cab / Taxi",

                    reason:
                        "Cabs provide convenient point-to-point travel between your hotel, attractions and restaurants.",
                };
            }

            return {
                transport:
                    "Auto / Cab",

                reason:
                    "For a small or medium-sized group, autos and cabs provide a good balance between convenience and cost.",
            };
        };


    const intercityRecommendation =
        getIntercityRecommendation();

    const localRecommendation =
        getLocalRecommendation();


    // =========================
    // UI
    // =========================

    return (
        <div
            style={{
                border:
                    "1px solid #ddd",
                borderRadius: "10px",
                padding: "20px",
                marginTop: "25px",
            }}
        >
            <h2>
                🚗 Transport Planner
            </h2>


            {/* ========================= */}
            {/* ROUTE */}
            {/* ========================= */}

            <div
                style={{
                    marginBottom: "25px",
                }}
            >
                <h3>
                    📍 Your Journey
                </h3>

                <label>
                    <strong>
                        🏠 Starting Location
                    </strong>
                </label>

                <br />
                <br />

                <input
                    type="text"
                    placeholder="Example: Honnali"
                    value={
                        startingLocation
                    }
                    onChange={(e) => {
                        setStartingLocation(
                            e.target.value
                        );

                        // Previous distance
                        // becomes invalid when
                        // origin changes.
                        setDistance(null);
                        setTransportError("");
                    }}
                />

                <br />
                <br />

                <p>
                    <strong>
                        📍 Destination:
                    </strong>{" "}
                    {destination ||
                        "Not available"}
                </p>

                <button
                    type="button"
                    onClick={
                        handleCalculateDistance
                    }
                    disabled={
                        loadingDistance
                    }
                >
                    {loadingDistance
                        ? "⏳ Calculating..."
                        : "📏 Calculate Distance"}
                </button>


                {transportError && (
                    <p>
                        ❌{" "}
                        {transportError}
                    </p>
                )}


                {distance !== null && (
                    <div
                        style={{
                            marginTop:
                                "15px",
                        }}
                    >
                        <p>
                            📏{" "}
                            <strong>
                                Approximate Distance:
                            </strong>{" "}
                            {distance} km
                        </p>

                        <p>
                            <small>
                                This is an approximate
                                straight-line distance,
                                not the actual road
                                distance.
                            </small>
                        </p>
                    </div>
                )}
            </div>


            <hr />


            {/* ========================= */}
            {/* INTERCITY */}
            {/* ========================= */}

            <div
                style={{
                    marginTop: "25px",
                }}
            >
                <h3>
                    🛣️ Travel to{" "}
                    {destination ||
                        "Destination"}
                </h3>

                <label>
                    <strong>
                        Preferred Transport:
                    </strong>
                </label>

                <br />
                <br />

                <select
                    value={
                        intercityPreference
                    }
                    onChange={(e) =>
                        setIntercityPreference(
                            e.target.value
                        )
                    }
                >
                    {intercityOptions.map(
                        (option) => (
                            <option
                                key={option}
                                value={
                                    option
                                }
                            >
                                {option}
                            </option>
                        )
                    )}
                </select>


                <div
                    style={{
                        marginTop: "20px",
                        padding: "15px",
                        border:
                            "1px solid #ddd",
                        borderRadius:
                            "8px",
                    }}
                >
                    <h4>
                        🧠 Smart Intercity
                        Recommendation
                    </h4>

                    <p>
                        <strong>
                            Your Preference:
                        </strong>{" "}
                        {
                            intercityPreference
                        }
                    </p>

                    <p>
                        <strong>
                            Recommended:
                        </strong>{" "}
                        {
                            intercityRecommendation
                                .transport
                        }
                    </p>

                    <p>
                        💡{" "}
                        {
                            intercityRecommendation
                                .reason
                        }
                    </p>


                    {intercityPreference !==
                        "No Preference" &&
                        distance !== null &&
                        !intercityRecommendation
                            .transport
                            .includes(
                                intercityPreference
                            ) && (
                            <p>
                                Your selected{" "}
                                <strong>
                                    {
                                        intercityPreference
                                    }
                                </strong>{" "}
                                preference is still
                                your choice. The smart
                                recommendation is based
                                on approximate distance,
                                group size and budget.
                            </p>
                        )}
                </div>
            </div>


            <hr
                style={{
                    margin: "30px 0",
                }}
            />


            {/* ========================= */}
            {/* LOCAL */}
            {/* ========================= */}

            <div>
                <h3>
                    🚕 Travel Inside{" "}
                    {destination ||
                        "Destination"}
                </h3>

                <p>
                    Choose how you would
                    prefer to travel between
                    your hotel, attractions
                    and other places.
                </p>

                <label>
                    <strong>
                        Local Transport
                        Preference:
                    </strong>
                </label>

                <br />
                <br />

                <select
                    value={
                        localPreference
                    }
                    onChange={(e) =>
                        setLocalPreference(
                            e.target.value
                        )
                    }
                >
                    {localOptions.map(
                        (option) => (
                            <option
                                key={option}
                                value={
                                    option
                                }
                            >
                                {option}
                            </option>
                        )
                    )}
                </select>


                <div
                    style={{
                        marginTop: "20px",
                        padding: "15px",
                        border:
                            "1px solid #ddd",
                        borderRadius:
                            "8px",
                    }}
                >
                    <h4>
                        🧠 Smart Local
                        Recommendation
                    </h4>

                    <p>
                        <strong>
                            Your Preference:
                        </strong>{" "}
                        {localPreference}
                    </p>

                    <p>
                        <strong>
                            Recommended:
                        </strong>{" "}
                        {
                            localRecommendation
                                .transport
                        }
                    </p>

                    <p>
                        💡{" "}
                        {
                            localRecommendation
                                .reason
                        }
                    </p>
                </div>
            </div>
        </div>
    );
}

export default TransportPreference;