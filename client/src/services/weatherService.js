import axios from "axios";

export const getWeather = async (
    lat,
    lon,
    startDate = null,
    days = 1
) => {
    try {
        const params = {
            latitude: lat,
            longitude: lon,

            current:
                "temperature_2m,apparent_temperature,weather_code,wind_speed_10m",

            daily:
                "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max",

            timezone: "auto",

            // Open-Meteo supports forecast data
            // for upcoming days
            forecast_days: 16,
        };

        const response = await axios.get(
            "https://api.open-meteo.com/v1/forecast",
            {
                params,
            }
        );

        const data = response.data;

        // =========================
        // CURRENT WEATHER
        // =========================

        const current = data.current
            ? {
                  temperature:
                      data.current.temperature_2m,

                  apparentTemperature:
                      data.current.apparent_temperature,

                  weatherCode:
                      data.current.weather_code,

                  windSpeed:
                      data.current.wind_speed_10m,
              }
            : null;

        // =========================
        // DAILY FORECAST
        // =========================

        const allDaily =
            data.daily?.time?.map(
                (date, index) => ({
                    date,

                    weatherCode:
                        data.daily.weather_code?.[
                            index
                        ],

                    maxTemperature:
                        data.daily
                            .temperature_2m_max?.[
                            index
                        ],

                    minTemperature:
                        data.daily
                            .temperature_2m_min?.[
                            index
                        ],

                    precipitation:
                        data.daily
                            .precipitation_sum?.[
                            index
                        ] ?? 0,

                    precipitationProbability:
                        data.daily
                            .precipitation_probability_max?.[
                            index
                        ] ?? 0,

                    maxWindSpeed:
                        data.daily
                            .wind_speed_10m_max?.[
                            index
                        ] ?? 0,
                })
            ) || [];

        // =========================
        // FILTER TRIP DATES
        // =========================

        let daily = allDaily;

        if (startDate) {
            const requestedDates = new Set();

            for (
                let i = 0;
                i < Number(days);
                i++
            ) {
                const date = new Date(
                    `${startDate}T00:00:00`
                );

                date.setDate(
                    date.getDate() + i
                );

                requestedDates.add(
                    date
                        .toISOString()
                        .split("T")[0]
                );
            }

            daily = allDaily.filter(
                (item) =>
                    requestedDates.has(
                        item.date
                    )
            );
        }

        // =========================
        // RETURN WEATHER DATA
        // =========================

        return {
            current,

            daily,

            forecastAvailable:
                daily.length > 0,
        };

    } catch (error) {
        console.error(
            "Weather API error:",
            error
        );

        return null;
    }
};