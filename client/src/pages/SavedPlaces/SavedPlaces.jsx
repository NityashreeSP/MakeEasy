import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getSavedPlaces,
    deleteSavedPlace,
} from "../../services/savedPlaceService";

function SavedPlaces() {
    const navigate = useNavigate();

    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load saved places
    useEffect(() => {
        const loadPlaces = async () => {
            try {
                const data = await getSavedPlaces();
                console.log("Saved places API response:", data);
                
                // Defensive check to ensure we always set an array
                setPlaces(data?.savedPlaces || []);
            } catch (error) {
                console.error("Failed to load saved places:", error);
            } finally {
                setLoading(false);
            }
        };

        loadPlaces();
    }, []);

    // Remove saved place
    const handleRemove = async (placeId) => {
        const confirmDelete = window.confirm("Are you sure you want to remove this saved place?");
        if (!confirmDelete) return;

        try {
            await deleteSavedPlace(placeId);

            setPlaces((previousPlaces) =>
                previousPlaces.filter((place) => place.placeId !== placeId)
            );
        } catch (error) {
            console.error("Failed to remove place:", error);
            alert("Failed to remove place. Please try again.");
        }
    };

    // Open location in Google Maps
    const handleOpenMap = (lat, lon) => {
        if (!lat || !lon) {
            alert("Coordinates are not available for this place.");
            return;
        }
        const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
        window.open(url, "_blank");
    };

    // Inline Styles Definition
    const styles = {
        container: {
            maxWidth: "900px",
            margin: "30px auto",
            padding: "20px",
            fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        },
        headerRow: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "25px",
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
            transition: "all 0.2s ease",
        },
        title: {
            fontSize: "26px",
            fontWeight: "700",
            color: "#0f172a",
            margin: "0 0 20px 0",
        },
        emptyCard: {
            textAlign: "center",
            padding: "40px 20px",
            backgroundColor: "#f8fafc",
            borderRadius: "10px",
            border: "1px dashed #cbd5e1",
            color: "#64748b",
        },
        listGrid: {
            display: "flex",
            flexDirection: "column",
            gap: "15px",
        },
        card: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "18px 20px",
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.04)",
            flexWrap: "wrap",
            gap: "15px",
        },
        placeInfo: {
            flex: "1",
            minWidth: "240px",
        },
        placeName: {
            margin: "0 0 6px 0",
            fontSize: "18px",
            fontWeight: "600",
            color: "#1e293b",
        },
        badge: {
            display: "inline-block",
            padding: "3px 8px",
            fontSize: "12px",
            fontWeight: "600",
            color: "#2563eb",
            backgroundColor: "#eff6ff",
            borderRadius: "4px",
            textTransform: "capitalize",
            marginBottom: "8px",
        },
        coords: {
            margin: 0,
            fontSize: "13px",
            color: "#64748b",
        },
        actionGroup: {
            display: "flex",
            gap: "10px",
            alignItems: "center",
        },
        mapBtn: {
            padding: "8px 14px",
            fontSize: "13px",
            fontWeight: "600",
            color: "#ffffff",
            backgroundColor: "#10b981",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
        },
        deleteBtn: {
            padding: "8px 14px",
            fontSize: "13px",
            fontWeight: "600",
            color: "#ef4444",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "6px",
            cursor: "pointer",
        },
        loadingState: {
            textAlign: "center",
            marginTop: "50px",
            color: "#475569",
        }
    };

    if (loading) {
        return (
            <div style={styles.loadingState}>
                <h2>⏳ Loading saved places...</h2>
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

            <h1 style={styles.title}>❤️ My Saved Places</h1>

            {places.length === 0 ? (
                <div style={styles.emptyCard}>
                    <p style={{ fontSize: "16px", margin: 0 }}>
                        You haven't saved any places yet.
                    </p>
                </div>
            ) : (
                <div style={styles.listGrid}>
                    {places.map((place, index) => {
                        const targetId = place.placeId || place._id || index;

                        return (
                            <div key={targetId} style={styles.card}>
                                <div style={styles.placeInfo}>
                                    <h3 style={styles.placeName}>{place.name}</h3>

                                    {place.category && (
                                        <span style={styles.badge}>
                                            {place.category}
                                        </span>
                                    )}

                                    <p style={styles.coords}>
                                        📍 Lat: {place.lat} | Lon: {place.lon}
                                    </p>
                                </div>

                                <div style={styles.actionGroup}>
                                    <button
                                        style={styles.mapBtn}
                                        onClick={() => handleOpenMap(place.lat, place.lon)}
                                    >
                                        🗺️ View Map
                                    </button>

                                    <button
                                        style={styles.deleteBtn}
                                        onClick={() => handleRemove(place.placeId || place._id)}
                                    >
                                        🗑️ Remove
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default SavedPlaces;