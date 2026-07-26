import axios from "axios";

// ==========================================
// GEOAPIFY CONFIG
// ==========================================

const GEOAPIFY_URL =
    "https://api.geoapify.com/v2/places";

// ==========================================
// SIMPLE IN-MEMORY CACHE
// ==========================================

const placeCache = new Map();

// Cache places for 1 hour
const CACHE_DURATION =
    60 * 60 * 1000;


// ==========================================
// CATEGORY MAPPING
// ==========================================

const getCategoryTags = (categories = []) => {
    const tags = {};

    // --------------------------
    // TEMPLES / WORSHIP
    // --------------------------

    if (
        categories.some((category) =>
            category.includes(
                "religion.place_of_worship"
            )
        )
    ) {
        tags.amenity =
            "place_of_worship";

        if (
            categories.some((category) =>
                category.includes(
                    "hinduism"
                )
            )
        ) {
            tags.religion =
                "hindu";
        }
    }

    // --------------------------
    // RESTAURANTS
    // --------------------------

    if (
        categories.some((category) =>
            category.includes(
                "catering.restaurant"
            )
        )
    ) {
        tags.amenity =
            "restaurant";
    }

    // --------------------------
    // CAFES
    // --------------------------

    if (
        categories.some((category) =>
            category.includes(
                "catering.cafe"
            )
        )
    ) {
        tags.amenity =
            "cafe";
    }

    // --------------------------
    // MUSEUMS
    // --------------------------

    if (
        categories.some((category) =>
            category.includes(
                "museum"
            )
        )
    ) {
        tags.tourism =
            "museum";
    }

    // --------------------------
    // HOTELS
    // --------------------------

    if (
        categories.some((category) =>
            category.includes(
                "accommodation.hotel"
            )
        )
    ) {
        tags.tourism =
            "hotel";
    }

    // --------------------------
    // TOURIST ATTRACTIONS
    // --------------------------

    if (
        categories.some(
            (category) =>
                category.startsWith(
                    "tourism"
                ) &&
                !category.includes(
                    "museum"
                )
        )
    ) {
        tags.tourism =
            tags.tourism ||
            "attraction";
    }

    // --------------------------
    // PARKS / NATURE
    // --------------------------

    if (
        categories.some(
            (category) =>
                category.includes(
                    "leisure.park"
                ) ||
                category.includes(
                    "leisure.garden"
                )
        )
    ) {
        tags.leisure =
            "park";
    }

    // --------------------------
    // SHOPPING
    // --------------------------

    if (
        categories.some((category) =>
            category.startsWith(
                "commercial"
            )
        )
    ) {
        tags.shop =
            "mall";
    }

    return tags;
};


// ==========================================
// NORMALIZE GEOAPIFY PLACE
// ==========================================

const normalizePlace = (feature) => {
    const properties =
        feature?.properties || {};

    const coordinates =
        feature?.geometry?.coordinates ||
        [];

    const lon =
        Number(
            properties.lon ??
            coordinates[0]
        );

    const lat =
        Number(
            properties.lat ??
            coordinates[1]
        );

    if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lon)
    ) {
        return null;
    }

    const categoryTags =
        getCategoryTags(
            properties.categories || []
        );

    return {
        id:
            properties.place_id ||
            `${lat}-${lon}-${properties.name || "place"}`,

        lat,
        lon,

        tags: {
            name:
                properties.name ||
                properties.address_line1 ||
                "Unnamed Place",

            ...categoryTags,

            address:
                properties.formatted ||
                properties.address_line2 ||
                "",

            city:
                properties.city ||
                properties.county ||
                "",

            website:
                properties.website ||
                "",

            phone:
                properties.contact?.phone ||
                "",

            categories:
                properties.categories ||
                [],
        },

        distance:
            properties.distance ?? null,

        source:
            "geoapify",
    };
};


// ==========================================
// REMOVE DUPLICATES
// ==========================================

const removeDuplicatePlaces =
    (places) => {

        const seen =
            new Set();

        return places.filter(
            (place) => {

                const name =
                    place.tags?.name
                        ?.trim()
                        .toLowerCase();

                if (!name) {
                    return false;
                }

                const key =
                    `${name}-${place.lat.toFixed(
                        4
                    )}-${place.lon.toFixed(
                        4
                    )}`;

                if (
                    seen.has(key)
                ) {
                    return false;
                }

                seen.add(key);

                return true;
            }
        );
    };


// ==========================================
// GET NEARBY PLACES
// GET /api/places/nearby
// ==========================================

export const getNearbyPlaces =
    async (req, res) => {

        try {

            const {
                lat,
                lon,
                radius = 5000,
            } = req.query;


            // ==================================
            // VALIDATION
            // ==================================

            if (!lat || !lon) {

                return res
                    .status(400)
                    .json({
                        success: false,

                        message:
                            "Latitude and longitude are required",

                        places: [],
                    });
            }


            const latitude =
                Number(lat);

            const longitude =
                Number(lon);

            const searchRadius =
                Number(radius);


            if (
                !Number.isFinite(
                    latitude
                ) ||
                !Number.isFinite(
                    longitude
                )
            ) {

                return res
                    .status(400)
                    .json({
                        success: false,

                        message:
                            "Invalid latitude or longitude",

                        places: [],
                    });
            }


            if (
                !Number.isFinite(
                    searchRadius
                ) ||
                searchRadius < 500 ||
                searchRadius > 20000
            ) {

                return res
                    .status(400)
                    .json({
                        success: false,

                        message:
                            "Radius must be between 500 and 20000 metres",

                        places: [],
                    });
            }


            // ==================================
            // CHECK API KEY
            // ==================================

            if (
                !process.env
                    .GEOAPIFY_API_KEY
            ) {

                console.error(
                    "❌ GEOAPIFY_API_KEY is missing"
                );

                return res
                    .status(500)
                    .json({
                        success: false,

                        message:
                            "Places service is not configured",

                        places: [],
                    });
            }


            // ==================================
            // CACHE KEY
            // ==================================

            const cacheKey =
                `${latitude.toFixed(
                    3
                )}-${longitude.toFixed(
                    3
                )}-${searchRadius}`;


            const cached =
                placeCache.get(
                    cacheKey
                );


            if (
                cached &&
                Date.now() -
                    cached.timestamp <
                    CACHE_DURATION
            ) {

                console.log(
                    "⚡ Returning Geoapify cached places:",
                    cacheKey
                );

                return res
                    .status(200)
                    .json({
                        success: true,

                        cached: true,

                        provider:
                            "geoapify",

                        count:
                            cached.places
                                .length,

                        places:
                            cached.places,
                    });
            }


            // ==================================
            // GEOAPIFY CATEGORIES
            // ==================================

            const categories = [
                "tourism",
                "entertainment.museum",

                "religion.place_of_worship",
                "religion.place_of_worship.hinduism",

                "catering.restaurant",
                "catering.cafe",

                "leisure.park",
                

                "commercial",

                "accommodation.hotel",
            ].join(",");


            // ==================================
            // CALL GEOAPIFY
            // ==================================

            console.log(
                "🌍 Fetching places from Geoapify..."
            );


            const response =
                await axios.get(
                    GEOAPIFY_URL,
                    {
                        params: {
                            categories,

                            filter:
                                `circle:${longitude},${latitude},${searchRadius}`,

                            bias:
                                `proximity:${longitude},${latitude}`,

                            limit: 500,

                            apiKey:
                                process.env
                                    .GEOAPIFY_API_KEY,
                        },

                        timeout: 20000,
                    }
                );


            // ==================================
            // NORMALIZE RESULTS
            // ==================================

            const features =
                response.data
                    ?.features || [];


            console.log(
                `📍 Geoapify returned ${features.length} raw places`
            );


            const normalizedPlaces =
                features
                    .map(
                        normalizePlace
                    )
                    .filter(Boolean);


            const places =
                removeDuplicatePlaces(
                    normalizedPlaces
                );


            console.log(
                `✅ ${places.length} usable places after normalization`
            );


            // ==================================
            // NO RESULTS
            // ==================================

            if (
                places.length === 0
            ) {

                return res
                    .status(200)
                    .json({
                        success: true,

                        cached: false,

                        provider:
                            "geoapify",

                        count: 0,

                        places: [],
                    });
            }


            // ==================================
            // CACHE RESULTS
            // ==================================

            placeCache.set(
                cacheKey,
                {
                    timestamp:
                        Date.now(),

                    places,
                }
            );


            // ==================================
            // SUCCESS
            // ==================================

            return res
                .status(200)
                .json({
                    success: true,

                    cached: false,

                    provider:
                        "geoapify",

                    count:
                        places.length,

                    places,
                });


        } catch (error) {

            console.error(
                "❌ Geoapify places error:"
            );

            console.error(
                "Status:",
                error.response?.status
            );

            console.error(
                "Message:",
                error.response?.data ||
                error.message
            );


            // ==================================
            // GEOAPIFY AUTH ERROR
            // ==================================

            if (
                error.response?.status ===
                    401 ||
                error.response?.status ===
                    403
            ) {

                return res
                    .status(502)
                    .json({
                        success: false,

                        message:
                            "Places API authentication failed",

                        places: [],
                    });
            }


            // ==================================
            // RATE LIMIT
            // ==================================

            if (
                error.response?.status ===
                429
            ) {

                return res
                    .status(503)
                    .json({
                        success: false,

                        message:
                            "Places request limit reached. Please try again later.",

                        places: [],
                    });
            }


            return res
                .status(502)
                .json({
                    success: false,

                    message:
                        "Unable to fetch nearby places right now",

                    places: [],
                });
        }
    };

    // ==========================================
// GET HOTELS
// GET /api/places/hotels
// ==========================================

export const getHotels = async (req, res) => {
    try {
        const {
            lat,
            lon,
            radius = 5000,
        } = req.query;

        // ==============================
        // VALIDATION
        // ==============================

        if (!lat || !lon) {
            return res.status(400).json({
                success: false,
                message:
                    "Latitude and longitude are required",
                hotels: [],
            });
        }

        const latitude = Number(lat);
        const longitude = Number(lon);
        const searchRadius = Number(radius);

        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid latitude or longitude",
                hotels: [],
            });
        }

        if (
            !Number.isFinite(searchRadius) ||
            searchRadius < 500 ||
            searchRadius > 20000
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Radius must be between 500 and 20000 metres",
                hotels: [],
            });
        }

        // ==============================
        // API KEY
        // ==============================

        if (!process.env.GEOAPIFY_API_KEY) {
            console.error(
                "❌ GEOAPIFY_API_KEY is missing"
            );

            return res.status(500).json({
                success: false,
                message:
                    "Hotel service is not configured",
                hotels: [],
            });
        }

        // ==============================
        // HOTEL CACHE
        // ==============================

        const cacheKey =
            `hotels-${latitude.toFixed(3)}-${longitude.toFixed(3)}-${searchRadius}`;

        const cached =
            placeCache.get(cacheKey);

        if (
            cached &&
            Date.now() - cached.timestamp <
                CACHE_DURATION
        ) {
            console.log(
                "⚡ Returning cached hotels:",
                cacheKey
            );

            return res.status(200).json({
                success: true,
                cached: true,
                provider: "geoapify",
                count: cached.hotels.length,
                hotels: cached.hotels,
            });
        }

        // ==============================
        // GEOAPIFY HOTEL REQUEST
        // ==============================

        console.log(
            "🏨 Fetching hotels from Geoapify..."
        );

        const response = await axios.get(
            GEOAPIFY_URL,
            {
                params: {
                    categories:
                        "accommodation.hotel",

                    filter:
                        `circle:${longitude},${latitude},${searchRadius}`,

                    bias:
                        `proximity:${longitude},${latitude}`,

                    limit: 100,

                    apiKey:
                        process.env
                            .GEOAPIFY_API_KEY,
                },

                timeout: 20000,
            }
        );

        const features =
            response.data?.features || [];

        // ==============================
        // NORMALIZE HOTELS
        // ==============================

        const hotels = features
            .map((feature) => {
                const properties =
                    feature?.properties || {};

                const coordinates =
                    feature?.geometry
                        ?.coordinates || [];

                const hotelLon = Number(
                    properties.lon ??
                        coordinates[0]
                );

                const hotelLat = Number(
                    properties.lat ??
                        coordinates[1]
                );

                if (
                    !Number.isFinite(hotelLat) ||
                    !Number.isFinite(hotelLon)
                ) {
                    return null;
                }

                return {
                    id:
                        properties.place_id ||
                        `${hotelLat}-${hotelLon}`,

                    name:
                        properties.name ||
                        properties.address_line1 ||
                        null,

                    type: "hotel",

                    lat: hotelLat,
                    lon: hotelLon,

                    stars:
                        properties.datasource
                            ?.raw?.stars ||
                        null,

                    website:
                        properties.website ||
                        null,

                    phone:
                        properties.contact
                            ?.phone ||
                        null,

                    address:
                        properties.formatted ||
                        properties.address_line2 ||
                        null,

                    categories:
                        properties.categories ||
                        [],

                    distance:
                        properties.distance ??
                        null,

                    source: "geoapify",
                };
            })

            // Remove invalid / unnamed hotels
            .filter(
                (hotel) =>
                    hotel &&
                    hotel.name &&
                    hotel.lat != null &&
                    hotel.lon != null
            );

        // ==============================
        // REMOVE DUPLICATES
        // ==============================

        const seen = new Set();

        const uniqueHotels =
            hotels.filter((hotel) => {
                const key =
                    hotel.name
                        .trim()
                        .toLowerCase();

                if (seen.has(key)) {
                    return false;
                }

                seen.add(key);

                return true;
            });

        console.log(
            `✅ ${uniqueHotels.length} hotels received from Geoapify`
        );

        // ==============================
        // CACHE
        // ==============================

        if (uniqueHotels.length > 0) {
            placeCache.set(cacheKey, {
                timestamp: Date.now(),
                hotels: uniqueHotels,
            });
        }

        // ==============================
        // SUCCESS
        // ==============================

        return res.status(200).json({
            success: true,
            cached: false,
            provider: "geoapify",
            count: uniqueHotels.length,
            hotels: uniqueHotels,
        });

    } catch (error) {
        console.error(
            "❌ Geoapify hotel error:",
            error.response?.data ||
                error.message
        );

        if (
            error.response?.status === 401 ||
            error.response?.status === 403
        ) {
            return res.status(502).json({
                success: false,
                message:
                    "Hotel API authentication failed",
                hotels: [],
            });
        }

        if (
            error.response?.status === 429
        ) {
            return res.status(503).json({
                success: false,
                message:
                    "Hotel request limit reached. Please try again later.",
                hotels: [],
            });
        }

        return res.status(502).json({
            success: false,
            message:
                "Unable to fetch hotels right now",
            hotels: [],
        });
    }
};