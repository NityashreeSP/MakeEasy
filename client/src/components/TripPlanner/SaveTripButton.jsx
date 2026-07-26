import { useState } from "react";
import { saveTrip } from "../../services/tripService";

function SaveTripButton({ tripPlan }) {
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [message, setMessage] = useState("");

    const handleSaveTrip = async () => {
        if (!tripPlan) {
            setMessage("No trip available to save.");
            return;
        }

        if (saved) {
            return;
        }

        try {
            setSaving(true);
            setMessage("");

            // ==========================================
            // CONVERT GENERATED TRIP TO BACKEND FORMAT
            // ==========================================

            const tripData = {
                destination: tripPlan.destination,
                startDate: tripPlan.startDate,
                days: tripPlan.days,
                travellers: tripPlan.travellers,

                // TripPlanner uses "budget", Backend expects "totalBudget"
                totalBudget: tripPlan.budget,

                budgetPerPerson: tripPlan.budgetPerPerson,
                budgetPerDay: tripPlan.budgetPerDay,
                budgetPerPersonPerDay: tripPlan.budgetPerPersonPerDay,
                budgetLevel: tripPlan.budgetLevel,
                budgetLabel: tripPlan.budgetLabel,
                budgetRecommendation: tripPlan.budgetRecommendation,
                budgetBreakdown: tripPlan.budgetBreakdown,
                interests: tripPlan.interests || [],
                itinerary: tripPlan.itinerary || [],
                weather: tripPlan.weather || null,
            };

            console.log("TRIP DATA SENT TO BACKEND:", tripData);

            // ==========================================
            // SAVE API CALL
            // ==========================================

            const response = await saveTrip(tripData);

            if (response?.success) {
                setSaved(true);
                setMessage("Trip saved successfully! 🎉");
                console.log("SAVED TRIP:", response.trip);
            }
        } catch (error) {
            console.error("Save trip error:", error);
            console.error("Backend response:", error.response?.data);

            if (error.response?.status === 401) {
                setMessage("Your login session has expired. Please login again.");
            } else {
                setMessage(
                    error.response?.data?.message || "Unable to save trip."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    // Dynamic style values based on state
    const getButtonStyle = () => {
        let backgroundColor = "#2563eb"; // Blue (default)
        if (saving) backgroundColor = "#94a3b8"; // Slate Gray (saving)
        if (saved) backgroundColor = "#10b981"; // Emerald Green (saved)

        return {
            padding: "10px 20px",
            fontSize: "15px",
            fontWeight: "600",
            color: "#ffffff",
            backgroundColor: backgroundColor,
            border: "none",
            borderRadius: "6px",
            cursor: saving || saved ? "not-allowed" : "pointer",
            transition: "background-color 0.2s ease",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        };
    };

    return (
        <div style={{ marginTop: "25px", marginBottom: "20px" }}>
            <button
                type="button"
                onClick={handleSaveTrip}
                disabled={saving || saved}
                style={getButtonStyle()}
            >
                {saving
                    ? "⏳ Saving Trip..."
                    : saved
                    ? "✅ Trip Saved"
                    : "💾 Save This Trip"}
            </button>

            {message && (
                <p
                    style={{
                        marginTop: "10px",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: saved ? "#059669" : "#dc2626",
                    }}
                >
                    {message}
                </p>
            )}
        </div>
    );
}

export default SaveTripButton;