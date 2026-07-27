import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { searchLocation } from "../../services/mapService";
import { getNearbyPlaces } from "../../services/PlaceService";
import { getWeather } from "../../services/weatherService";

import Map from "../../components/Map/Map";
import SearchBar from "../../components/SearchBar/SearchBar";
import NearbyPlaces from "../../components/NearbyPlaces/NearbyPlaces";
import TripPlanner from "../../components/TripPlanner/TripPlanner";

import "./Dashboard.css";

const getWeatherCondition = (code) => {
    if (code === 0) return "☀️ Clear Sky";
    if (code === 1 || code === 2) return "🌤️ Partly Cloudy";
    if (code === 3) return "☁️ Overcast";
    if (code === 45 || code === 48) return "🌫️ Foggy";
    if (code >= 51 && code <= 57) return "🌦️ Drizzle";
    if (code >= 61 && code <= 67) return "🌧️ Rain";
    if (code >= 71 && code <= 77) return "❄️ Snow";
    if (code >= 80 && code <= 82) return "🌧️ Rain Showers";
    if (code >= 85 && code <= 86) return "🌨️ Snow Showers";
    if (code >= 95) return "⛈️ Thunderstorm";
    return "Weather unavailable";
};

function Dashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    // STATES
    const [loading, setLoading] = useState(false);
    const [position, setPosition] = useState([12.9716, 77.5946]);
    const [places, setPlaces] = useState([]);
    const [weather, setWeather] = useState(null);
    const [category, setCategory] = useState("all");
    const [placeSearch, setPlaceSearch] = useState("");
    const [searchedCity, setSearchedCity] = useState("");
    
    // Toggle State for Smart Trip Planner Modal/Drawer
    const [showTripPlanner, setShowTripPlanner] = useState(false);

    const logout = () => {
        localStorage.removeItem("token");
localStorage.removeItem("user");

window.dispatchEvent(
    new Event("authChange")
);

navigate("/login");
    };

    const handlePlaceClick = (place) => {
        const lat = Number(place.lat);
        const lon = Number(place.lon);

        if (Number.isNaN(lat) || Number.isNaN(lon)) {
            alert("Location coordinates are unavailable.");
            return;
        }

        setPosition([lat, lon]);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSearch = async (city) => {
        if (loading) return;
        setLoading(true);

        try {
            const locationData = await searchLocation(city);

            if (!locationData || locationData.length === 0) {
                alert("Location not found.");
                return;
            }

            const lat = parseFloat(locationData[0].lat);
            const lon = parseFloat(locationData[0].lon);

            if (Number.isNaN(lat) || Number.isNaN(lon)) {
                alert("Invalid location coordinates.");
                return;
            }

            setSearchedCity(city);
            setPosition([lat, lon]);
            setPlaces([]);
            setWeather(null);
            setCategory("all");
            setPlaceSearch("");

            const weatherData = await getWeather(lat, lon);
            if (weatherData) setWeather(weatherData);

            const nearby = await getNearbyPlaces(lat, lon);

            if (!nearby || nearby.length === 0) {
                setPlaces([]);
                alert("No nearby places found. Please try again.");
                return;
            }

            const namedPlaces = nearby.filter((place) => place.tags?.name);
            const uniquePlaces = namedPlaces.filter((place, index, self) => {
                const currentName = place.tags?.name?.toLowerCase().trim();
                return (
                    index ===
                    self.findIndex(
                        (otherPlace) =>
                            otherPlace.tags?.name?.toLowerCase().trim() === currentName
                    )
                );
            });

            setPlaces(uniquePlaces);
        } catch (error) {
            console.error("Dashboard search error:", error);
            alert("Something went wrong while searching.");
        } finally {
            setLoading(false);
        }
    };

    const filteredPlaces = places.filter((place) => {
        const placeCategory = place.tags?.amenity || place.tags?.tourism || "";
        const placeName = place.tags?.name || "";

        const matchesCategory = category === "all" || placeCategory === category;
        const matchesSearch = placeName
            .toLowerCase()
            .includes(placeSearch.toLowerCase().trim());

        return matchesCategory && matchesSearch;
    });

    return (
        <div className="dashboard-wrapper">
            {/* TOP NAVIGATION / HEADER */}
            <header className="dashboard-header card">
                <div className="brand-welcome">
                    <h1>Welcome, {user?.name || "Explorer"} 👋</h1>
                    <p className="user-email">{user?.email}</p>
                </div>

                <div className="header-actions">
                    <button
                        className="btn btn-planner-toggle"
                        onClick={() => setShowTripPlanner(!showTripPlanner)}
                    >
                        🗺️ {showTripPlanner ? "Close Planner" : "Smart Trip Planner"}
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => navigate("/saved")}
                    >
                        ❤️ Saved Places
                    </button>
                    <button className="btn btn-danger" onClick={logout}>
                        Logout
                    </button>
                </div>
            </header>

            {/* COLLAPSIBLE TRIP PLANNER SECTION */}
            {showTripPlanner && (
                <div className="planner-modal-overlay">
                    <div className="planner-modal-card card">
                        <div className="modal-header">
                            <h2>🤖 Smart Trip Planner</h2>
                            <button
                                className="close-btn"
                                onClick={() => setShowTripPlanner(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <TripPlanner places={places} />
                    </div>
                </div>
            )}

            {/* MAIN DASHBOARD CONTENT */}
            <div className="dashboard-body">
                {/* LEFT MAIN PANEL */}
                <main className="dashboard-main">
                    {/* SEARCH SECTION */}
                    <section className="card search-section">
                        <h2>🌍 Explore Destination</h2>
                        <SearchBar onSearch={handleSearch} loading={loading} />

                        {searchedCity && (
                            <div className="city-tag">
                                📍 Showing results for: <span>{searchedCity}</span>
                            </div>
                        )}
                    </section>

                    {/* WEATHER SUMMARY BAR */}
                    {weather && (
                        <section className="card weather-card">
                            <div className="weather-header">
                                <h3>🌦️ Current Weather</h3>
                                <span className="badge">Live</span>
                            </div>
                            <div className="weather-metrics">
                                <div className="metric">
                                    <span className="label">Status</span>
                                    <span className="val highlight">
                                        {getWeatherCondition(weather.weather_code)}
                                    </span>
                                </div>
                                <div className="metric">
                                    <span className="label">Temp</span>
                                    <span className="val">{weather.temperature_2m}°C</span>
                                </div>
                                <div className="metric">
                                    <span className="label">Feels Like</span>
                                    <span className="val">{weather.apparent_temperature}°C</span>
                                </div>
                                <div className="metric">
                                    <span className="label">Wind</span>
                                    <span className="val">{weather.wind_speed_10m} km/h</span>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* NEARBY PLACES WITH FILTERS */}
                    <section className="card places-section">
                        <div className="places-header">
                            <h3>📍 Nearby Destinations</h3>
                            <span className="results-count">
                                <strong>{filteredPlaces.length}</strong> of{" "}
                                <strong>{places.length}</strong> places
                            </span>
                        </div>

                        {/* FILTER BAR */}
                        <div className="filter-bar">
                            <div className="filter-group">
                                <label htmlFor="cat-select">Category:</label>
                                <select
                                    id="cat-select"
                                    className="custom-select"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    <option value="all">All Categories</option>
                                    <option value="attraction">Attractions</option>
                                    <option value="museum">Museums</option>
                                    <option value="hotel">Hotels</option>
                                    <option value="restaurant">Restaurants</option>
                                    <option value="cafe">Cafes</option>
                                    <option value="place_of_worship">
                                        Temples & Worship
                                    </option>
                                </select>
                            </div>

                            <div className="filter-group search-fill">
                                <input
                                    type="text"
                                    className="custom-input"
                                    placeholder="Search nearby places..."
                                    value={placeSearch}
                                    onChange={(e) => setPlaceSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* NEARBY PLACES CONTENT */}
                        {places.length > 0 ? (
                            <div className="nearby-places-container">
                                <NearbyPlaces
                                    places={filteredPlaces}
                                    onSelectPlace={handlePlaceClick}
                                />
                            </div>
                        ) : (
                            <div className="empty-state">
                                ✈️ Search for a city above to discover places nearby.
                            </div>
                        )}
                    </section>
                </main>

                {/* RIGHT SIDEBAR (FIXED STICKY MAP) */}
                <aside className="dashboard-sidebar">
                    <div className="card map-card">
                        <h3>🗺️ Live Map View</h3>
                        <div className="map-frame">
                            <Map position={position} />
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

export default Dashboard;