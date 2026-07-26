import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyTrips, deleteTrip, updateTripItinerary } from "../../services/tripService";

function MyTrips() {
    const navigate = useNavigate();

    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    // Edit itinerary state
    const [editingTripId, setEditingTripId] = useState(null);
    const [editedItinerary, setEditedItinerary] = useState([]);
    const [savingId, setSavingId] = useState(null);

    // ==============================
    // LOAD TRIPS
    // ==============================
    const loadTrips = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getMyTrips();

            if (response?.success) {
                setTrips(response.trips || []);
            }
        } catch (err) {
            console.error("Unable to load trips:", err);

            if (err.response?.status === 401) {
                setError("Your login session has expired. Please login again.");
            } else {
                setError(
                    err.response?.data?.message ||
                    "Unable to load your saved trips."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTrips();
    }, []);

    // ==============================
    // DELETE TRIP
    // ==============================
    const handleDelete = async (tripId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this trip?"
        );

        if (!confirmed) return;

        try {
            setDeletingId(tripId);

            const response = await deleteTrip(tripId);

            if (response?.success) {
                setTrips((previousTrips) =>
                    previousTrips.filter((trip) => trip._id !== tripId)
                );

                if (selectedTrip?._id === tripId) {
                    setSelectedTrip(null);
                }
            }
        } catch (err) {
            console.error("Delete trip error:", err);
            alert(
                err.response?.data?.message || "Unable to delete trip."
            );
        } finally {
            setDeletingId(null);
        }
    };

    // ==============================
    // EDIT TRIP ITINERARY
    // ==============================
    const handleStartEdit = (trip) => {
        const editableCopy = (trip.itinerary || []).map((dayPlan, index) => ({
            ...dayPlan,
            day: dayPlan.day || index + 1,
            morning: {
                ...(dayPlan.morning || {}),
                name: getPlaceName(dayPlan.morning),
            },
            afternoon: {
                ...(dayPlan.afternoon || {}),
                name: getPlaceName(dayPlan.afternoon),
            },
            evening: {
                ...(dayPlan.evening || {}),
                name: getPlaceName(dayPlan.evening),
            },
        }));

        setEditingTripId(trip._id);
        setEditedItinerary(editableCopy);
    };

    const handleCancelEdit = () => {
        setEditingTripId(null);
        setEditedItinerary([]);
    };

    const handlePlaceChange = (dayIndex, timeSlot, value) => {
        setEditedItinerary((previous) =>
            previous.map((dayPlan, index) =>
                index === dayIndex
                    ? {
                          ...dayPlan,
                          [timeSlot]: {
                              ...(dayPlan[timeSlot] || {}),
                              name: value,
                          },
                      }
                    : dayPlan
            )
        );
    };

    const handleSaveChanges = async (tripId) => {
        const hasEmptyPlace = editedItinerary.some(
            (dayPlan) =>
                !dayPlan.morning?.name?.trim() ||
                !dayPlan.afternoon?.name?.trim() ||
                !dayPlan.evening?.name?.trim()
        );

        if (hasEmptyPlace) {
            alert("Morning, afternoon and evening places cannot be empty.");
            return;
        }

        try {
            setSavingId(tripId);

            const response = await updateTripItinerary(
                tripId,
                editedItinerary
            );

            if (response?.success) {
                const updatedTrip = response.trip;

                setTrips((previousTrips) =>
                    previousTrips.map((trip) =>
                        trip._id === tripId ? updatedTrip : trip
                    )
                );

                setSelectedTrip(updatedTrip);
                setEditingTripId(null);
                setEditedItinerary([]);

                alert("Trip itinerary updated successfully! 🎉");
            }
        } catch (err) {
            console.error("Update trip itinerary error:", err);

            if (err.response?.status === 401) {
                alert("Your login session has expired. Please login again.");
            } else {
                alert(
                    err.response?.data?.message ||
                    "Unable to update the trip itinerary."
                );
            }
        } finally {
            setSavingId(null);
        }
    };


    // ==============================
    // UTILITY FUNCTIONS
    // ==============================
    const formatDate = (date) => {
        if (!date) return "Not available";

        const parsedDate = new Date(`${date}T00:00:00`);

        if (Number.isNaN(parsedDate.getTime())) {
            return date;
        }

        return parsedDate.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const getPlaceName = (place) => {
        if (!place) return "Free time / Local exploration";

        return (
            place.tags?.name ||
            place.name ||
            "Local exploration"
        );
    };

    // Inline Styles Definition
    const styles = {
        container: {
            padding: "30px 20px",
            maxWidth: "1000px",
            margin: "0 auto",
            fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        },
        headerRow: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
        },
        backBtn: {
            padding: "8px 16px",
            fontSize: "14px",
            fontWeight: "600",
            color: "#475569",
            backgroundColor: "#f1f5f9",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            cursor: "pointer",
        },
        title: {
            fontSize: "28px",
            fontWeight: "700",
            color: "#0f172a",
            margin: "0 0 8px 0",
        },
        subtitle: {
            fontSize: "15px",
            color: "#64748b",
            margin: "0 0 25px 0",
        },
        errorBanner: {
            padding: "12px 16px",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "6px",
            color: "#dc2626",
            marginBottom: "20px",
        },
        emptyCard: {
            border: "1px dashed #cbd5e1",
            borderRadius: "10px",
            padding: "35px",
            textAlign: "center",
            backgroundColor: "#f8fafc",
            color: "#64748b",
        },
        tripCard: {
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "24px",
            marginBottom: "20px",
            backgroundColor: "#ffffff",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
        },
        tripTitle: {
            fontSize: "22px",
            fontWeight: "700",
            color: "#1e293b",
            margin: "0 0 15px 0",
        },
        infoGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px",
            marginBottom: "20px",
            backgroundColor: "#f8fafc",
            padding: "15px",
            borderRadius: "8px",
        },
        infoItem: {
            margin: 0,
            fontSize: "14px",
            color: "#334155",
        },
        badgeList: {
            display: "flex",
            flexWrap: "wrap",
            gap: "6px",
            marginTop: "4px",
        },
        badge: {
            backgroundColor: "#e0f2fe",
            color: "#0369a1",
            padding: "2px 8px",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: "600",
        },
        actionRow: {
            display: "flex",
            gap: "10px",
            alignItems: "center",
        },
        viewBtn: {
            padding: "9px 18px",
            fontSize: "14px",
            fontWeight: "600",
            color: "#ffffff",
            backgroundColor: "#2563eb",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
        },
        deleteBtn: {
            padding: "9px 18px",
            fontSize: "14px",
            fontWeight: "600",
            color: "#ef4444",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "6px",
            cursor: "pointer",
        },
        editBtn: {
            padding: "9px 18px",
            fontSize: "14px",
            fontWeight: "600",
            color: "#7c3aed",
            backgroundColor: "#f5f3ff",
            border: "1px solid #ddd6fe",
            borderRadius: "6px",
            cursor: "pointer",
        },
        editInput: {
            width: "100%",
            padding: "10px 12px",
            marginTop: "6px",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            fontSize: "14px",
            backgroundColor: "#ffffff",
            outline: "none",
        },
        editField: {
            marginBottom: "12px",
        },
        editActions: {
            display: "flex",
            gap: "10px",
            marginTop: "15px",
            flexWrap: "wrap",
        },
        saveBtn: {
            padding: "9px 18px",
            fontSize: "14px",
            fontWeight: "600",
            color: "#ffffff",
            backgroundColor: "#16a34a",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
        },
        cancelBtn: {
            padding: "9px 18px",
            fontSize: "14px",
            fontWeight: "600",
            color: "#475569",
            backgroundColor: "#f1f5f9",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            cursor: "pointer",
        },
        expandedSection: {
            marginTop: "25px",
            borderTop: "1px solid #e2e8f0",
            paddingTop: "20px",
        },
        dayCard: {
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "12px",
            backgroundColor: "#f8fafc",
        },
        budgetGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "10px",
            marginTop: "12px",
            padding: "15px",
            backgroundColor: "#ecfdf5",
            borderRadius: "8px",
            border: "1px solid #a7f3d0",
        },
    };

    if (loading) {
        return (
            <div style={{ padding: "40px", textAlign: "center", color: "#475569" }}>
                <h2>🧳 My Trips</h2>
                <p>⏳ Loading your saved trips...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.headerRow}>
                <button
                    style={styles.backBtn}
                    onClick={() => navigate("/dashboard")}
                >
                    ← Back to Dashboard
                </button>
            </div>

            <h1 style={styles.title}>🧳 My Saved Trips</h1>
            <p style={styles.subtitle}>View and manage your custom travel plans.</p>

            {error && <div style={styles.errorBanner}>{error}</div>}

            {!error && trips.length === 0 && (
                <div style={styles.emptyCard}>
                    <h3 style={{ margin: "0 0 10px 0", color: "#334155" }}>
                        No saved trips yet
                    </h3>
                    <p style={{ margin: 0 }}>
                        Generate a smart trip plan and click "Save This Trip" to access it here anytime!
                    </p>
                </div>
            )}

            {/* ========================= */}
            {/* TRIP CARDS LIST           */}
            {/* ========================= */}
            {trips.map((trip) => {
                const isSelected = selectedTrip?._id === trip._id;
                const isEditing = editingTripId === trip._id;

                return (
                    <div key={trip._id} style={styles.tripCard}>
                        <h2 style={styles.tripTitle}>✈️ {trip.destination}</h2>

                        <div style={styles.infoGrid}>
                            <p style={styles.infoItem}>
                                📅 <strong>Start Date:</strong> {formatDate(trip.startDate)}
                            </p>
                            <p style={styles.infoItem}>
                                🗓️ <strong>Duration:</strong> {trip.days} Days
                            </p>
                            <p style={styles.infoItem}>
                                👥 <strong>Travellers:</strong> {trip.travellers}
                            </p>
                            <p style={styles.infoItem}>
                                💰 <strong>Total Budget:</strong> ₹
                                {Number(trip.totalBudget || 0).toLocaleString("en-IN")}
                            </p>
                        </div>

                        {trip.interests?.length > 0 && (
                            <div style={{ marginBottom: "15px" }}>
                                <span style={{ fontSize: "13px", fontWeight: "600", color: "#64748b" }}>
                                    INTERESTS:
                                </span>
                                <div style={styles.badgeList}>
                                    {trip.interests.map((interest, idx) => (
                                        <span key={idx} style={styles.badge}>
                                            {interest}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={styles.actionRow}>
                            <button
                                type="button"
                                style={styles.viewBtn}
                                onClick={() => setSelectedTrip(isSelected ? null : trip)}
                            >
                                {isSelected ? "🔼 Hide Details" : "👁️ View Full Itinerary"}
                            </button>

                            <button
                                type="button"
                                style={styles.deleteBtn}
                                onClick={() => handleDelete(trip._id)}
                                disabled={deletingId === trip._id}
                            >
                                {deletingId === trip._id ? "Deleting..." : "🗑️ Delete"}
                            </button>
                        </div>

                        {/* ========================= */}
                        {/* EXPANDED DETAILS PANEL    */}
                        {/* ========================= */}
                        {isSelected && (
                            <div style={styles.expandedSection}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <h3 style={{ margin: "0 0 15px 0", color: "#0f172a" }}>
                                        📅 Day-wise Itinerary
                                    </h3>
                                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                        {!isEditing && (
                                            <button
                                                type="button"
                                                onClick={() => handleStartEdit(trip)}
                                                style={styles.editBtn}
                                            >
                                                ✏️ Edit Itinerary
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => window.print()}
                                            style={{
                                                padding: "6px 12px",
                                                fontSize: "12px",
                                                cursor: "pointer",
                                                backgroundColor: "#f1f5f9",
                                                border: "1px solid #cbd5e1",
                                                borderRadius: "4px",
                                            }}
                                        >
                                            🖨️ Print / Save PDF
                                        </button>
                                    </div>
                                </div>

                                {(isEditing ? editedItinerary : trip.itinerary)?.length > 0 ? (
                                    (isEditing ? editedItinerary : trip.itinerary).map((dayPlan, index) => (
                                        <div
                                            key={dayPlan.day || index}
                                            style={styles.dayCard}
                                        >
                                            <h4 style={{ margin: "0 0 10px 0", color: "#1e293b" }}>
                                                Day {dayPlan.day || index + 1}
                                            </h4>

                                            {dayPlan.weather && (
                                                <p style={{ fontSize: "13px", color: "#0284c7", margin: "0 0 10px 0" }}>
                                                    🌦️ {dayPlan.weather.condition || dayPlan.weather.description || "Weather info available"}
                                                </p>
                                            )}

                                            {isEditing ? (
                                                <>
                                                    <div style={styles.editField}>
                                                        <label style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>
                                                            🌅 Morning
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={dayPlan.morning?.name || ""}
                                                            onChange={(event) =>
                                                                handlePlaceChange(
                                                                    index,
                                                                    "morning",
                                                                    event.target.value
                                                                )
                                                            }
                                                            style={styles.editInput}
                                                            placeholder="Enter morning place"
                                                        />
                                                    </div>

                                                    <div style={styles.editField}>
                                                        <label style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>
                                                            ☀️ Afternoon
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={dayPlan.afternoon?.name || ""}
                                                            onChange={(event) =>
                                                                handlePlaceChange(
                                                                    index,
                                                                    "afternoon",
                                                                    event.target.value
                                                                )
                                                            }
                                                            style={styles.editInput}
                                                            placeholder="Enter afternoon place"
                                                        />
                                                    </div>

                                                    <div style={styles.editField}>
                                                        <label style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>
                                                            🌆 Evening
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={dayPlan.evening?.name || ""}
                                                            onChange={(event) =>
                                                                handlePlaceChange(
                                                                    index,
                                                                    "evening",
                                                                    event.target.value
                                                                )
                                                            }
                                                            style={styles.editInput}
                                                            placeholder="Enter evening place"
                                                        />
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <p style={{ margin: "4px 0", fontSize: "14px" }}>
                                                        🌅 <strong>Morning:</strong> {getPlaceName(dayPlan.morning)}
                                                    </p>
                                                    <p style={{ margin: "4px 0", fontSize: "14px" }}>
                                                        ☀️ <strong>Afternoon:</strong> {getPlaceName(dayPlan.afternoon)}
                                                    </p>
                                                    <p style={{ margin: "4px 0", fontSize: "14px" }}>
                                                        🌆 <strong>Evening:</strong> {getPlaceName(dayPlan.evening)}
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p style={{ color: "#64748b" }}>
                                        Itinerary information is unavailable.
                                    </p>
                                )}

                                {isEditing && (
                                    <div style={styles.editActions}>
                                        <button
                                            type="button"
                                            style={styles.cancelBtn}
                                            onClick={handleCancelEdit}
                                            disabled={savingId === trip._id}
                                        >
                                            ❌ Cancel
                                        </button>

                                        <button
                                            type="button"
                                            style={styles.saveBtn}
                                            onClick={() => handleSaveChanges(trip._id)}
                                            disabled={savingId === trip._id}
                                        >
                                            {savingId === trip._id
                                                ? "⏳ Saving..."
                                                : "💾 Save Changes"}
                                        </button>
                                    </div>
                                )}

                                {/* ========================= */}
                                {/* BUDGET BREAKDOWN          */}
                                {/* ========================= */}
                                {trip.budgetBreakdown && (
                                    <div style={{ marginTop: "20px" }}>
                                        <h3 style={{ margin: "0 0 10px 0", color: "#0f172a" }}>
                                            💰 Estimated Budget Breakdown
                                        </h3>
                                        <div style={styles.budgetGrid}>
                                            <div>
                                                <span style={{ fontSize: "12px", color: "#047857" }}>ACCOMMODATION</span>
                                                <div style={{ fontWeight: "700" }}>
                                                    ₹{Number(trip.budgetBreakdown.accommodation || 0).toLocaleString("en-IN")}
                                                </div>
                                            </div>
                                            <div>
                                                <span style={{ fontSize: "12px", color: "#047857" }}>FOOD</span>
                                                <div style={{ fontWeight: "700" }}>
                                                    ₹{Number(trip.budgetBreakdown.food || 0).toLocaleString("en-IN")}
                                                </div>
                                            </div>
                                            <div>
                                                <span style={{ fontSize: "12px", color: "#047857" }}>TRANSPORT</span>
                                                <div style={{ fontWeight: "700" }}>
                                                    ₹{Number(trip.budgetBreakdown.transport || 0).toLocaleString("en-IN")}
                                                </div>
                                            </div>
                                            <div>
                                                <span style={{ fontSize: "12px", color: "#047857" }}>ACTIVITIES</span>
                                                <div style={{ fontWeight: "700" }}>
                                                    ₹{Number(trip.budgetBreakdown.activities || 0).toLocaleString("en-IN")}
                                                </div>
                                            </div>
                                            <div>
                                                <span style={{ fontSize: "12px", color: "#047857" }}>RESERVE</span>
                                                <div style={{ fontWeight: "700" }}>
                                                    ₹{Number(trip.budgetBreakdown.reserve || 0).toLocaleString("en-IN")}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default MyTrips;