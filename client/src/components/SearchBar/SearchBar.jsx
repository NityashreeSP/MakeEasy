import { useState } from "react";

function SearchBar({ onSearch, loading }) {
    const [city, setCity] = useState("");

    const handleSearch = () => {
        if (!city.trim()) return;

        onSearch(city);
        setCity("");
    };

    return (
        <div
            style={{
                display: "flex",
                gap: "10px",
                marginBottom: "20px",
            }}
        >
            <input
                type="text"
                placeholder="Search any city..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        handleSearch();
                    }
                }}
                style={{
                    flex: 1,
                    padding: "10px",
                    fontSize: "16px",
                }}
            />

            <button
                onClick={handleSearch}
                disabled={loading}
                style={{
                    padding: "10px 20px",
                    cursor: loading ? "not-allowed" : "pointer",
                }}
            >
                {loading ? "Searching..." : "Search"}
            </button>
        </div>
    );
}

export default SearchBar;