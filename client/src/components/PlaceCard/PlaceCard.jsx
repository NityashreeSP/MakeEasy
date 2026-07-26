import { useState } from "react";
import { savePlace } from "../../services/savedPlaceService";

function PlaceCard({ place, onSelectPlace }) {
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [message, setMessage] = useState("");

    const name = place.tags?.name || "Unnamed Place";

    const category =
        place.tags?.amenity ||
        place.tags?.tourism ||
        "Place";


        const handleDirections = () => {
    const lat = place.lat;
    const lon = place.lon;

    if (!lat || !lon) {
        alert("Location coordinates are not available.");
        return;
    }

    const url =
        `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;

    window.open(url, "_blank");
};


    const handleSave = async () => {
        if (saving || saved) return;

        try {
            setSaving(true);
            setMessage("");

            const data = await savePlace(place);

            console.log("Saved place:", data);

            setSaved(true);
            setMessage("Place saved successfully!");
        } catch (error) {
            console.error("Save place error:", error);

            if (error.response?.status === 401) {
                setMessage("Please login again.");
            } else if (
                error.response?.data?.message === "Place already saved"
            ) {
                setSaved(true);
                setMessage("Place already saved.");
            } else {
                setMessage(
                    error.response?.data?.message ||
                    "Failed to save place."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "15px",
                marginBottom: "12px",
            }}
        >
            <h3>{name}</h3>

            <p>{category}</p>

            <div
                style={{
                    display: "flex",
                    gap: "10px",
                }}
            >
                <button onClick={() => onSelectPlace(place)}>
                    See Location
                </button>

                <button
                    onClick={handleSave}
                    disabled={saving || saved}
                >
                    {saving
                        ? "Saving..."
                        : saved
                        ? "❤️ Saved"
                        : "♡ Save"}
                </button>

                <button onClick={handleDirections}>
    🧭 Directions
</button>

            </div>

            {message && (
                <p style={{ marginTop: "10px" }}>
                    {message}
                </p>
            )}
        </div>
    );
}

export default PlaceCard;