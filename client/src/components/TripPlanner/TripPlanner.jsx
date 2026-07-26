import { useState } from "react";
import { searchLocation } from "../../services/mapService";
import { getNearbyPlaces } from "../../services/placeService";
import { getWeather } from "../../services/weatherService";
import TransportPreference from "../Transport/TransportPreference";
import HotelSearch from "../Hotels/HotelSearch";
import VehicleSearch from "../Vehicles/VehicleSearch";
import SaveTripButton from "./SaveTripButton";
import { validateTripForm } from "../../utils/tripValidation";

function TripPlanner() {
    // =========================
    // STATES
    // =========================

    const [destination, setDestination] = useState("");
    const [startDate, setStartDate] = useState("");
    const [days, setDays] = useState("");
    const [travellers, setTravellers] = useState("");
    const [budget, setBudget] = useState("");
    const [interests, setInterests] = useState([]);
    const [tripPlan, setTripPlan] = useState(null);
    const [generating, setGenerating] = useState(false);

    // =========================
    // INTEREST OPTIONS
    // =========================

    const interestOptions = [
        "Attractions",
        "Temples",
        "Food",
        "Nature",
        "Museums",
        "Shopping",
    ];

    // =========================
    // HANDLE INTEREST
    // =========================

    const handleInterestChange = (interest) => {
        setInterests((previous) => {
            if (previous.includes(interest)) {
                return previous.filter((item) => item !== interest);
            }
            return [...previous, interest];
        });
    };

    // =========================
    // DIRECTIONS
    // =========================

    const handleDirections = (place) => {
        if (!place?.lat || !place?.lon) {
            alert("Location coordinates are unavailable.");
            return;
        }

        const url = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`;
        window.open(url, "_blank");
    };

    // =========================
    // DISTANCE CALCULATION (Haversine Formula)
    // =========================

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
            return Infinity;
        }

        const toRadians = (degree) => degree * (Math.PI / 180);
        const earthRadius = 6371;

        const dLat = toRadians(Number(lat2) - Number(lat1));
        const dLon = toRadians(Number(lon2) - Number(lon1));

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(Number(lat1))) *
                Math.cos(toRadians(Number(lat2))) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return earthRadius * c;
    };

    // =========================
    // PLACE CATEGORY
    // =========================

    const getPlaceCategory = (place) => {
        const tourism = place.tags?.tourism;
        const amenity = place.tags?.amenity;
        const leisure = place.tags?.leisure;
        const shop = place.tags?.shop;

        if (amenity === "place_of_worship") return "temple";
        if (tourism === "museum") return "museum";
        if (tourism === "attraction") return "attraction";
        if (amenity === "restaurant" || amenity === "cafe") return "food";
        if (leisure === "park" || leisure === "garden" || tourism === "viewpoint") return "nature";
        if (amenity === "marketplace" || shop === "mall") return "shopping";

        return "other";
    };

    // =========================
    // BASE QUALITY SCORE
    // =========================

    const getQualityScore = (place) => {
        let score = 0;
        const tags = place.tags || {};
        const category = getPlaceCategory(place);

        if (tags.name) score += 20;
        if (category === "attraction") score += 25;
        if (category === "museum") score += 25;
        if (category === "temple") score += 20;
        if (category === "nature") score += 18;
        if (category === "food") score += 12;
        if (category === "shopping") score += 12;

        if (tags.wikipedia) score += 35;
        if (tags.wikidata) score += 30;
        if (tags.website || tags["contact:website"]) score += 10;
        if (tags.opening_hours) score += 8;
        if (tags["addr:street"] || tags["addr:full"] || tags["addr:city"]) score += 5;
        if (tags.historic) score += 15;
        if (tags.heritage || tags["heritage:operator"]) score += 20;

        if (category === "temple") {
            if (tags.religion === "hindu") score += 15;
            if (tags.name?.toLowerCase().includes("temple")) score += 10;
        }

        return score;
    };

    // =========================
    // TIME SLOT SCORE
    // =========================

    const getTimeSlotScore = (place, timeSlot) => {
        const category = getPlaceCategory(place);
        let score = 0;

        if (timeSlot === "morning") {
            if (category === "temple") score += 40;
            if (category === "attraction") score += 30;
            if (category === "museum") score += 25;
            if (category === "nature") score += 20;
            if (category === "food") score -= 15;
        }

        if (timeSlot === "afternoon") {
            if (category === "attraction") score += 40;
            if (category === "museum") score += 35;
            if (category === "nature") score += 30;
            if (category === "shopping") score += 20;
            if (category === "temple") score += 10;
        }

        if (timeSlot === "evening") {
            if (category === "food") score += 40;
            if (category === "shopping") score += 30;
            if (category === "nature") score += 20;
            if (category === "attraction") score += 10;
        }

        return score;
    };

    // =========================
    // INTEREST SCORE
    // =========================

    const getInterestScore = (place) => {
        const category = getPlaceCategory(place);
        let score = 0;

        if (interests.includes("Temples") && category === "temple") score += 35;
        if (interests.includes("Attractions") && category === "attraction") score += 30;
        if (interests.includes("Museums") && category === "museum") score += 30;
        if (interests.includes("Nature") && category === "nature") score += 30;
        if (interests.includes("Food") && category === "food") score += 25;
        if (interests.includes("Shopping") && category === "shopping") score += 25;

        return score;
    };

    // =========================
    // WEATHER HELPERS
    // =========================

    const getWeatherLabel = (weatherCode) => {
        if (weatherCode == null) return "Forecast unavailable";
        if (weatherCode === 0) return "Clear sky";
        if ([1, 2, 3].includes(weatherCode)) return "Partly cloudy";
        if ([45, 48].includes(weatherCode)) return "Foggy";
        if ([51, 53, 55, 56, 57].includes(weatherCode)) return "Drizzle";
        if ([61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) return "Rainy";
        if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) return "Snowy";
        if ([95, 96, 99].includes(weatherCode)) return "Thunderstorm";

        return "Mixed weather";
    };

    const getWeatherScore = (place, weatherDay) => {
        if (!weatherDay) return 0;

        const category = getPlaceCategory(place);
        const code = weatherDay.weatherCode;
        const precipitation = Number(weatherDay.precipitation || 0);
        const maxTemp = Number(weatherDay.maxTemperature);
        const windSpeed = Number(weatherDay.maxWindSpeed || 0);

        const rainy =
            [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code) ||
            precipitation >= 3;

        const pleasant =
            [0, 1, 2].includes(code) &&
            precipitation < 1 &&
            (!Number.isFinite(maxTemp) || maxTemp <= 32);

        const veryHot = Number.isFinite(maxTemp) && maxTemp >= 35;
        const veryWindy = windSpeed >= 35;

        let score = 0;

        if (rainy) {
            if (category === "museum") score += 35;
            if (category === "shopping") score += 25;
            if (category === "food") score += 20;
            if (category === "nature") score -= 30;
            if (category === "attraction") score -= 10;
        }

        if (pleasant) {
            if (category === "nature") score += 30;
            if (category === "attraction") score += 20;
            if (category === "temple") score += 15;
        }

        if (veryHot) {
            if (category === "museum") score += 20;
            if (category === "shopping") score += 15;
            if (category === "food") score += 10;
            if (category === "nature") score -= 15;
        }

        if (veryWindy && category === "nature") {
            score -= 10;
        }

        return score;
    };

    // =========================
    // SMART PLACE SCORE
    // =========================

    const calculatePlaceScore = (
        place,
        timeSlot,
        previousPlace = null,
        weatherDay = null
    ) => {
        let score = 0;

        score += getQualityScore(place);
        score += getTimeSlotScore(place, timeSlot);
        score += getInterestScore(place);
        score += getWeatherScore(place, weatherDay);

        if (previousPlace) {
            const distance = calculateDistance(
                previousPlace.lat,
                previousPlace.lon,
                place.lat,
                place.lon
            );

            if (distance <= 1) score += 30;
            else if (distance <= 3) score += 25;
            else if (distance <= 5) score += 20;
            else if (distance <= 8) score += 10;
            else if (distance <= 12) score += 5;
            else score -= 10;
        }

        return score;
    };

    // =========================
    // CLEAN FETCHED PLACES
    // =========================

    const getCleanedPlaces = (rawPlaces) => {
        const named = rawPlaces.filter((place) => place.tags?.name);
        const withValidCoords = named.filter((place) => {
            const lat = parseFloat(place.lat);
            const lon = parseFloat(place.lon);
            return !isNaN(lat) && !isNaN(lon);
        });

        const unique = withValidCoords.filter((place, index, self) => {
            const name = place.tags.name.toLowerCase().trim();
            return index === self.findIndex((other) => other.tags?.name?.toLowerCase().trim() === name);
        });

        return unique;
    };

    // =========================
    // GENERATE TRIP
    // =========================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (generating) return;

        // SMART VALIDATION
        const validation = validateTripForm({
            destination,
            startDate,
            days,
            travellers,
            budget,
            interests,
        });

        if (!validation.isValid) {
            alert(validation.errors.join("\n"));
            return;
        }

        if (validation.warnings.length > 0) {
            const warningMessage = validation.warnings.join("\n\n");
            const continueTrip = window.confirm(
                `⚠️ Trip Warning\n\n${warningMessage}\n\nDo you still want to generate this trip?`
            );
            if (!continueTrip) return;
        }

        setGenerating(true);

        try {
            // GEOCODE
            const locationData = await searchLocation(destination.trim());
            if (!locationData || locationData.length === 0) {
                alert("Destination not found. Please enter a valid destination.");
                return;
            }

            const lat = parseFloat(locationData[0].lat);
            const lon = parseFloat(locationData[0].lon);

            if (isNaN(lat) || isNaN(lon)) {
                alert("Could not determine destination coordinates.");
                return;
            }

            // FETCH PLACES
            const nearbyPlaces = await getNearbyPlaces(lat, lon);
            if (!nearbyPlaces || nearbyPlaces.length === 0) {
                alert("No nearby places were found for this destination. Please try again.");
                return;
            }

            // FETCH WEATHER
            const weatherData = await getWeather(lat, lon, startDate, Number(days));

            // CLEAN PLACES
            const cleanedPlaces = getCleanedPlaces(nearbyPlaces);

            const interestMap = {
                Attractions: ["attraction"],
                Temples: ["place_of_worship"],
                Food: ["restaurant", "cafe"],
                Nature: ["park", "viewpoint", "garden"],
                Museums: ["museum"],
                Shopping: ["marketplace", "mall"],
            };

            const matchingPlaces = cleanedPlaces.filter((place) => {
                const categories = [
                    place.tags?.tourism,
                    place.tags?.amenity,
                    place.tags?.leisure,
                    place.tags?.shop,
                ].filter(Boolean);

                return interests.some((interest) => {
                    const allowed = interestMap[interest] || [];
                    return categories.some((category) => allowed.includes(category));
                });
            });

            const uniquePlaces = matchingPlaces;

            if (uniquePlaces.length === 0) {
                alert("No places matching your selected interests were found.");
                return;
            }

            const usedPlaceIds = new Set();

            const getBestPlace = (
                timeSlot,
                previousPlace = null,
                preferredCategories = [],
                weatherDay = null
            ) => {
                let availablePlaces = uniquePlaces.filter((place) => !usedPlaceIds.has(place.id));

                if (preferredCategories.length > 0) {
                    const preferredPlaces = availablePlaces.filter((place) =>
                        preferredCategories.includes(getPlaceCategory(place))
                    );
                    if (preferredPlaces.length > 0) {
                        availablePlaces = preferredPlaces;
                    }
                }

                if (availablePlaces.length === 0) return null;

                const scoredPlaces = availablePlaces.map((place) => ({
                    place,
                    score: calculatePlaceScore(place, timeSlot, previousPlace, weatherDay),
                }));

                scoredPlaces.sort((a, b) => b.score - a.score);
                const winner = scoredPlaces[0];

                if (!winner) return null;

                usedPlaceIds.add(winner.place.id);
                return winner.place;
            };

            // GENERATE ITINERARY
            const generatedDays = [];
            let previousDayLastPlace = null;

            for (let day = 1; day <= Number(days); day++) {
                const weatherDay =
                    weatherData?.daily?.find(
                        (item) =>
                            item.date ===
                            new Date(new Date(`${startDate}T00:00:00`).getTime() + (day - 1) * 86400000)
                                .toISOString()
                                .split("T")[0]
                    ) || null;

                let morningPreferences = ["attraction", "museum", "nature"];
                if (interests.includes("Temples")) {
                    morningPreferences =
                        day % 2 === 1
                            ? ["temple", "attraction", "museum", "nature"]
                            : ["attraction", "museum", "temple", "nature"];
                }

                const morning = getBestPlace("morning", previousDayLastPlace, morningPreferences, weatherDay);
                const afternoon = getBestPlace("afternoon", morning, ["attraction", "museum", "nature", "shopping"], weatherDay);
                const evening = getBestPlace("evening", afternoon, ["food", "shopping", "nature", "attraction"], weatherDay);

                generatedDays.push({
                    day,
                    weather: weatherDay,
                    morning,
                    afternoon,
                    evening,
                });

                previousDayLastPlace = evening || afternoon || morning;
            }

            // BUDGET CALCULATIONS
            const totalBudget = Number(budget);
            const travellerCount = Number(travellers);
            const dayCount = Number(days);

            const budgetPerPerson = Math.round(totalBudget / travellerCount);
            const budgetPerDay = Math.round(totalBudget / dayCount);
            const budgetPerPersonPerDay = Math.round(totalBudget / (travellerCount * dayCount));

            let budgetLevel, budgetLabel, budgetRecommendation, allocation;

            if (budgetPerPersonPerDay < 2000) {
                budgetLevel = "budget";
                budgetLabel = "💵 Budget Trip";
                budgetRecommendation =
                    "Prefer budget stays, local restaurants, public transport and mostly free or low-cost attractions.";
                allocation = { accommodation: 0.30, food: 0.25, transport: 0.20, activities: 0.15, reserve: 0.10 };
            } else if (budgetPerPersonPerDay < 6000) {
                budgetLevel = "moderate";
                budgetLabel = "💰 Moderate Trip";
                budgetRecommendation =
                    "Choose comfortable stays, a mix of local and popular restaurants, convenient local transport and paid attractions where worthwhile.";
                allocation = { accommodation: 0.35, food: 0.25, transport: 0.18, activities: 0.12, reserve: 0.10 };
            } else {
                budgetLevel = "premium";
                budgetLabel = "✨ Premium Trip";
                budgetRecommendation =
                    "Your budget allows premium stays, private or app-based transport, higher-end dining and more paid experiences.";
                allocation = { accommodation: 0.40, food: 0.22, transport: 0.15, activities: 0.13, reserve: 0.10 };
            }

            const accommodation = Math.round(totalBudget * allocation.accommodation);
            const food = Math.round(totalBudget * allocation.food);
            const transport = Math.round(totalBudget * allocation.transport);
            const activities = Math.round(totalBudget * allocation.activities);
            const reserve = totalBudget - accommodation - food - transport - activities;

            const generatedTrip = {
                destination: destination.trim(),
                destinationCoordinates: { lat, lon },
                startDate,
                days: Number(days),
                travellers: Number(travellers),
                budget: totalBudget,
                budgetPerPerson,
                budgetPerDay,
                budgetPerPersonPerDay,
                budgetLevel,
                budgetLabel,
                budgetRecommendation,
                weather: weatherData || null,
                interests,
                itinerary: generatedDays,
                budgetBreakdown: { accommodation, food, transport, activities, reserve },
            };

            setTripPlan(generatedTrip);
        } catch (error) {
            console.error("Error generating trip:", error);
            alert("Unable to generate the trip right now. Please try again.");
        } finally {
            setGenerating(false);
        }
    };

    // =========================
    // UI STYLES
    // =========================

    const styles = {
        container: {
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "24px",
            marginTop: "30px",
            backgroundColor: "#ffffff",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            maxWidth: "900px",
            margin: "30px auto",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        },
        title: { fontSize: "24px", fontWeight: "700", color: "#1e293b", marginBottom: "20px" },
        grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "15px" },
        fieldGroup: { display: "flex", flexDirection: "column", gap: "6px" },
        label: { fontSize: "14px", fontWeight: "600", color: "#475569" },
        input: {
            padding: "10px 12px",
            borderRadius: "6px",
            border: "1px solid #cbd5e1",
            fontSize: "14px",
            outline: "none",
        },
        interestGrid: { display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "8px" },
        chip: (selected) => ({
            padding: "6px 14px",
            borderRadius: "20px",
            border: selected ? "1px solid #2563eb" : "1px solid #cbd5e1",
            backgroundColor: selected ? "#ebf5ff" : "#f8fafc",
            color: selected ? "#2563eb" : "#475569",
            cursor: "pointer",
            fontWeight: selected ? "600" : "normal",
            fontSize: "13px",
            transition: "all 0.2s ease",
        }),
        button: {
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#2563eb",
            color: "#ffffff",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            marginTop: "15px",
        },
        planCard: {
            marginTop: "30px",
            padding: "20px",
            backgroundColor: "#f8fafc",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
        },
        dayCard: {
            backgroundColor: "#ffffff",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "15px",
            border: "1px solid #cbd5e1",
        },
        slot: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 0",
            borderBottom: "1px dashed #e2e8f0",
        },
        dirBtn: {
            padding: "4px 10px",
            fontSize: "12px",
            borderRadius: "4px",
            border: "none",
            backgroundColor: "#10b981",
            color: "#fff",
            cursor: "pointer",
        },
    };

    // =========================
    // RENDER UI
    // =========================

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>✈️ Smart Trip Planner</h2>

            <form onSubmit={handleSubmit}>
                <div style={styles.grid}>
                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Destination</label>
                        <input
                            type="text"
                            placeholder="e.g., Kyoto, Jaipur"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>

                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>

                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Duration (Days)</label>
                        <input
                            type="number"
                            min="1"
                            max="14"
                            placeholder="3"
                            value={days}
                            onChange={(e) => setDays(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>

                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Travellers</label>
                        <input
                            type="number"
                            min="1"
                            placeholder="2"
                            value={travellers}
                            onChange={(e) => setTravellers(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>

                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Total Budget (₹)</label>
                        <input
                            type="number"
                            min="500"
                            placeholder="15000"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>
                </div>

                <div style={styles.fieldGroup}>
                    <label style={styles.label}>Select Interests</label>
                    <div style={styles.interestGrid}>
                        {interestOptions.map((interest) => {
                            const isSelected = interests.includes(interest);
                            return (
                                <button
                                    type="button"
                                    key={interest}
                                    style={styles.chip(isSelected)}
                                    onClick={() => handleInterestChange(interest)}
                                >
                                    {interest}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={generating}
                    style={{
                        ...styles.button,
                        backgroundColor: generating ? "#94a3b8" : "#2563eb",
                    }}
                >
                    {generating ? "Generating Smart Itinerary..." : "Build Trip Plan"}
                </button>
            </form>

            {/* GENERATED TRIP PLAN OVERVIEW */}
            {tripPlan && (
                <div style={styles.planCard}>
                    <h3>📍 {tripPlan.destination} Trip Plan</h3>
                    <p>
                        <strong>Type:</strong> {tripPlan.budgetLabel} | <strong>Recommendation:</strong>{" "}
                        {tripPlan.budgetRecommendation}
                    </p>

                    <h4>💰 Estimated Budget Breakdown</h4>
                    <p>
                        🏨 Stays: ₹{tripPlan.budgetBreakdown.accommodation} | 🍲 Food: ₹
                        {tripPlan.budgetBreakdown.food} | 🚕 Transport: ₹{tripPlan.budgetBreakdown.transport} | 🎟️
                        Activities: ₹{tripPlan.budgetBreakdown.activities} | 🛡️ Emergency Reserve: ₹
                        {tripPlan.budgetBreakdown.reserve}
                    </p>

                    <hr style={{ margin: "20px 0", borderColor: "#cbd5e1" }} />

                    <h4>📅 Day-By-Day Itinerary</h4>
                    {tripPlan.itinerary.map((d) => (
                        <div key={d.day} style={styles.dayCard}>
                            <h5>
                                Day {d.day}{" "}
                                {d.weather ? `• Weather: ${getWeatherLabel(d.weather.weatherCode)}` : ""}
                            </h5>

                            <div style={styles.slot}>
                                <span>
                                    <strong>🌅 Morning:</strong> {d.morning?.tags?.name || "Free exploration"}
                                </span>
                                {d.morning && (
                                    <button style={styles.dirBtn} onClick={() => handleDirections(d.morning)}>
                                        Get Directions
                                    </button>
                                )}
                            </div>

                            <div style={styles.slot}>
                                <span>
                                    <strong>☀️ Afternoon:</strong> {d.afternoon?.tags?.name || "Free exploration"}
                                </span>
                                {d.afternoon && (
                                    <button style={styles.dirBtn} onClick={() => handleDirections(d.afternoon)}>
                                        Get Directions
                                    </button>
                                )}
                            </div>

                            <div style={styles.slot}>
                                <span>
                                    <strong>🌙 Evening:</strong> {d.evening?.tags?.name || "Rest or local walk"}
                                </span>
                                {d.evening && (
                                    <button style={styles.dirBtn} onClick={() => handleDirections(d.evening)}>
                                        Get Directions
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    <hr style={{ margin: "20px 0", borderColor: "#cbd5e1" }} />

                    {/* AUXILIARY ACTION SERVICES */}
                    <h4>🚗 Travel & Booking Logistics</h4>
                    <div
    style={{
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        marginTop: "10px"
    }}
>
    <TransportPreference
        destination={tripPlan.destination}
    />

    <HotelSearch
        destination={tripPlan.destination}
        travellers={tripPlan.travellers}
        days={tripPlan.days}
        budgetLevel={tripPlan.budgetLevel}
        accommodationBudget={
            tripPlan.budgetBreakdown?.accommodation || 0
        }
    />

    <VehicleSearch
        destination={tripPlan.destination}
        travellers={tripPlan.travellers}
        days={tripPlan.days}
        budgetLevel={tripPlan.budgetLevel}
        transportBudget={
            tripPlan.budgetBreakdown?.transport || 0
        }
    />

    <SaveTripButton
        tripPlan={tripPlan}
    />
</div>
                </div>
            )}
        </div>
    );
}

export default TripPlanner;