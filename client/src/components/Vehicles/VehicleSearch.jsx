import {
    getVehicleRecommendation,
    buildVehicleSearchQuery,
} from "../../services/vehicleService";

function VehicleSearch({
    destination = "",
    travellers = 1,
    days = 1,
    budgetLevel = "moderate",
    transportBudget = 0,
}) {
    // =========================
    // VEHICLE RECOMMENDATION
    // =========================

    const recommendation =
        getVehicleRecommendation({
            travellers,
            budgetLevel,
            days,
        });

    // =========================
    // SEARCH RENTAL / CAB
    // =========================

    const handleVehicleSearch = () => {
        if (!destination.trim()) {
            alert(
                "Trip destination is unavailable."
            );
            return;
        }

        const query =
            buildVehicleSearchQuery({
                destination,
                vehicle:
                    recommendation.vehicle,
            });

        window.open(
            `https://www.google.com/search?q=${query}`,
            "_blank",
            "noopener,noreferrer"
        );
    };

    // =========================
    // SEARCH CAB
    // =========================

    const handleCabSearch = () => {
        if (!destination.trim()) {
            alert(
                "Trip destination is unavailable."
            );
            return;
        }

        const query =
            encodeURIComponent(
                `cab taxi service in ${destination}`
            );

        window.open(
            `https://www.google.com/search?q=${query}`,
            "_blank",
            "noopener,noreferrer"
        );
    };

    // =========================
    // SEARCH SELF DRIVE
    // =========================

    const handleSelfDriveSearch = () => {
        if (!destination.trim()) {
            alert(
                "Trip destination is unavailable."
            );
            return;
        }

        const query =
            encodeURIComponent(
                `self drive car rental in ${destination}`
            );

        window.open(
            `https://www.google.com/search?q=${query}`,
            "_blank",
            "noopener,noreferrer"
        );
    };

    // =========================
    // TRANSPORT BUDGET
    // =========================

    const budgetPerDay =
        Number(days) > 0
            ? Math.round(
                  Number(transportBudget) /
                      Number(days)
              )
            : 0;

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
                🚕 Vehicle Search & Recommendation
            </h2>

            <p>
                <strong>
                    📍 Destination:
                </strong>{" "}
                {destination ||
                    "Not available"}
            </p>

            <p>
                <strong>
                    👥 Travellers:
                </strong>{" "}
                {travellers}
            </p>

            <p>
                <strong>
                    🗓️ Trip Duration:
                </strong>{" "}
                {days} Days
            </p>

            {/* ========================= */}
            {/* SMART RECOMMENDATION */}
            {/* ========================= */}

            <div
                style={{
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "15px",
                    marginTop: "20px",
                }}
            >
                <h3>
                    🧠 Smart Vehicle Recommendation
                </h3>

                <p>
                    <strong>
                        Recommended Vehicle:
                    </strong>{" "}
                    {
                        recommendation
                            .vehicle
                    }
                </p>

                <p>
                    <strong>
                        Rental Type:
                    </strong>{" "}
                    {
                        recommendation
                            .rentalType
                    }
                </p>

                <p>
                    💡{" "}
                    {
                        recommendation
                            .reason
                    }
                </p>
            </div>

            {/* ========================= */}
            {/* TRANSPORT BUDGET */}
            {/* ========================= */}

            <div
                style={{
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "15px",
                    marginTop: "20px",
                }}
            >
                <h3>
                    💰 Vehicle Budget Guidance
                </h3>

                <p>
                    <strong>
                        Total Transport Budget:
                    </strong>{" "}
                    ₹{transportBudget}
                </p>

                <p>
                    <strong>
                        Approx. Transport Budget
                        Per Day:
                    </strong>{" "}
                    ₹{budgetPerDay}
                </p>

                <p>
                    💡{" "}
                    {
                        recommendation
                            .budgetAdvice
                    }
                </p>

                <p>
                    <small>
                        This is your trip's
                        estimated transport
                        allocation, not a live
                        vehicle rental price.
                    </small>
                </p>
            </div>

            {/* ========================= */}
            {/* BOOKING / SEARCH */}
            {/* ========================= */}

            <div
                style={{
                    marginTop: "20px",
                }}
            >
                <h3>
                    🔎 Find Vehicle Options
                </h3>

                <button
                    type="button"
                    onClick={
                        handleVehicleSearch
                    }
                >
                    🚗 Search Recommended Vehicle
                </button>

                <button
                    type="button"
                    onClick={
                        handleCabSearch
                    }
                    style={{
                        marginLeft: "10px",
                    }}
                >
                    🚕 Search Cabs
                </button>

                <button
                    type="button"
                    onClick={
                        handleSelfDriveSearch
                    }
                    style={{
                        marginLeft: "10px",
                    }}
                >
                    🚙 Search Self Drive
                </button>
            </div>

            <div
                style={{
                    marginTop: "20px",
                }}
            >
                <p>
                    <small>
                        Vehicle availability and
                        actual prices are provided
                        by external rental/cab
                        services. The planner does
                        not make the booking
                        directly.
                    </small>
                </p>
            </div>
        </div>
    );
}

export default VehicleSearch;