// ========================================
// Elements
// ========================================

const searchInput =
    document.getElementById("searchInput");

const searchBtn =
    document.getElementById("searchBtn");

const locationBtn =
    document.getElementById("locationBtn");

const loading =
    document.getElementById("loading");

const errorMessage =
    document.getElementById("errorMessage");

const errorText =
    document.getElementById("errorText");

const suggestions =
    document.getElementById("suggestions");

const currentWeather =
    document.getElementById("currentWeather");

const cityName =
    document.getElementById("cityName");

const countryName =
    document.getElementById("countryName");

const currentDate =
    document.getElementById("currentDate");

const weatherIcon =
    document.getElementById("weatherIcon");

const temperature =
    document.getElementById("temperature");

const temperatureUnit =
    document.querySelector(".temperature-unit");

const weatherDescription =
    document.getElementById("weatherDescription");

const maxTemp =
    document.getElementById("maxTemp");

const minTemp =
    document.getElementById("minTemp");

const humidity =
    document.getElementById("humidity");

const wind =
    document.getElementById("wind");

const feelsLike =
    document.getElementById("feelsLike");

const pressure =
    document.getElementById("pressure");

const visibility =
    document.getElementById("visibility");

const uvIndex =
    document.getElementById("uvIndex");

const forecastSection =
    document.getElementById("forecastSection");

const forecastContainer =
    document.getElementById("forecastContainer");

const unitSection =
    document.getElementById("unitSection");

const themeBtn =
    document.getElementById("themeBtn");

const celsiusBtn =
    document.getElementById("celsiusBtn");

const fahrenheitBtn =
    document.getElementById("fahrenheitBtn");


// ========================================
// Variables
// ========================================

let currentWeatherData = null;

let currentUnit = "celsius";

let searchTimeout = null;

let suggestionRequestId = 0;


// ========================================
// Weather Codes
// ========================================

const weatherCodes = {

    0: {
        description: "Clear Sky",
        icon: "☀️"
    },

    1: {
        description: "Mainly Clear",
        icon: "🌤️"
    },

    2: {
        description: "Partly Cloudy",
        icon: "⛅"
    },

    3: {
        description: "Overcast",
        icon: "☁️"
    },

    45: {
        description: "Fog",
        icon: "🌫️"
    },

    48: {
        description: "Rime Fog",
        icon: "🌫️"
    },

    51: {
        description: "Light Drizzle",
        icon: "🌦️"
    },

    53: {
        description: "Moderate Drizzle",
        icon: "🌦️"
    },

    55: {
        description: "Dense Drizzle",
        icon: "🌧️"
    },

    61: {
        description: "Light Rain",
        icon: "🌦️"
    },

    63: {
        description: "Moderate Rain",
        icon: "🌧️"
    },

    65: {
        description: "Heavy Rain",
        icon: "🌧️"
    },

    71: {
        description: "Light Snow",
        icon: "🌨️"
    },

    73: {
        description: "Moderate Snow",
        icon: "❄️"
    },

    75: {
        description: "Heavy Snow",
        icon: "❄️"
    },

    80: {
        description: "Rain Showers",
        icon: "🌦️"
    },

    81: {
        description: "Moderate Rain Showers",
        icon: "🌧️"
    },

    82: {
        description: "Heavy Rain Showers",
        icon: "⛈️"
    },

    85: {
        description: "Snow Showers",
        icon: "🌨️"
    },

    86: {
        description: "Heavy Snow Showers",
        icon: "❄️"
    },

    95: {
        description: "Thunderstorm",
        icon: "⛈️"
    },

    96: {
        description: "Thunderstorm With Hail",
        icon: "⛈️"
    },

    99: {
        description: "Heavy Thunderstorm",
        icon: "⛈️"
    }

};


// ========================================
// Search City
// ========================================

async function searchCity(city) {

    city = city.trim();

    if (!city) {

        showError("Please enter a city name.");

        return;
    }

    hideError();

    hideSuggestions();

    showLoading();

    clearWeather();

    try {

        // Create URL safely
        const url =
            new URL(
                "https://geocoding-api.open-meteo.com/v1/search"
            );

        url.searchParams.set("name", city);

        url.searchParams.set("count", "1");

        url.searchParams.set("language", "en");

        url.searchParams.set("format", "json");


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "Unable to search for this city."
            );
        }


        const data =
            await response.json();


        if (
            !data.results ||
            data.results.length === 0
        ) {

            throw new Error(
                "City not found."
            );
        }


        const location =
            data.results[0];


        searchInput.value =
            location.name;


        await getWeather(

            location.latitude,

            location.longitude,

            location.name,

            location.country

        );

    }

    catch (error) {

        console.error(error);

        clearWeather();

        showError(
            error.message ||
            "Something went wrong."
        );

    }

    finally {

        hideLoading();

    }
}


// ========================================
// Get Weather
// ========================================

async function getWeather(
    latitude,
    longitude,
    city,
    country
) {

    const url =
        new URL(
            "https://api.open-meteo.com/v1/forecast"
        );


    // Location

    url.searchParams.set(
        "latitude",
        latitude
    );

    url.searchParams.set(
        "longitude",
        longitude
    );


    // Current Weather

    url.searchParams.set(
        "current",
        [
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "is_day",
            "weather_code",
            "pressure_msl",
            "wind_speed_10m",
            "visibility"
        ].join(",")
    );


    // Daily Forecast

    url.searchParams.set(
        "daily",
        [
            "weather_code",
            "temperature_2m_max",
            "temperature_2m_min",
            "uv_index_max"
        ].join(",")
    );


    url.searchParams.set(
        "timezone",
        "auto"
    );


    url.searchParams.set(
        "forecast_days",
        "5"
    );


    const response =
        await fetch(url);


    if (!response.ok) {

        throw new Error(
            "Unable to get weather data."
        );
    }


    const data =
        await response.json();


    if (!data.current) {

        throw new Error(
            "Weather data is unavailable."
        );
    }


    currentWeatherData = data;


    cityName.textContent =
        city;


    countryName.textContent =
        country || "";


    currentWeather.hidden =
        false;


    forecastSection.hidden =
        false;


    unitSection.hidden =
        false;


    updateCurrentWeather(data);

    updateForecast(data);

}


// ========================================
// Update Current Weather
// ========================================

function updateCurrentWeather(data) {

    const current =
        data.current;


    let temp =
        current.temperature_2m;


    let feels =
        current.apparent_temperature;


    let max =
        data.daily.temperature_2m_max[0];


    let min =
        data.daily.temperature_2m_min[0];


    if (
        currentUnit === "fahrenheit"
    ) {

        temp =
            celsiusToFahrenheit(temp);

        feels =
            celsiusToFahrenheit(feels);

        max =
            celsiusToFahrenheit(max);

        min =
            celsiusToFahrenheit(min);

    }


    temperature.textContent =
        Math.round(temp);


    temperatureUnit.textContent =
        currentUnit === "celsius"
            ? "°C"
            : "°F";


    const weatherInfo =
        weatherCodes[
            current.weather_code
        ] || {

            description: "Unknown",

            icon: "🌤️"

        };


    weatherIcon.textContent =
        weatherInfo.icon;


    weatherDescription.textContent =
        weatherInfo.description;


    maxTemp.textContent =
        `${Math.round(max)}°`;


    minTemp.textContent =
        `${Math.round(min)}°`;


    humidity.textContent =
        `${current.relative_humidity_2m}%`;


    wind.textContent =
        `${Math.round(
            current.wind_speed_10m
        )} km/h`;


    feelsLike.textContent =
        `${Math.round(feels)}°${
            currentUnit === "celsius"
                ? "C"
                : "F"
        }`;


    pressure.textContent =
        `${Math.round(
            current.pressure_msl
        )} hPa`;


    visibility.textContent =
        `${(
            current.visibility / 1000
        ).toFixed(1)} km`;


    uvIndex.textContent =
        Math.round(
            data.daily.uv_index_max[0]
        );


    updateDate(
        current.time
    );

}


// ========================================
// Celsius To Fahrenheit
// ========================================

function celsiusToFahrenheit(
    value
) {

    return (
        value * 9 / 5
    ) + 32;

}


// ========================================
// Date
// ========================================

function updateDate(
    dateString
) {

    const date =
        new Date(dateString);


    currentDate.textContent =
        date.toLocaleDateString(
            "en-US",
            {
                weekday: "long",

                month: "long",

                day: "numeric"
            }
        );

}


// ========================================
// Forecast
// ========================================

function updateForecast(data) {

    forecastContainer.innerHTML =
        "";


    const daily =
        data.daily;


    for (
        let i = 0;
        i < daily.time.length;
        i++
    ) {

        const date =
            new Date(
                daily.time[i]
            );


        const day =
            date.toLocaleDateString(
                "en-US",
                {
                    weekday: "short"
                }
            );


        const weatherInfo =
            weatherCodes[
                daily.weather_code[i]
            ] || {

                description: "Unknown",

                icon: "🌤️"

            };


        let max =
            daily.temperature_2m_max[i];


        if (
            currentUnit === "fahrenheit"
        ) {

            max =
                celsiusToFahrenheit(max);

        }


        const card =
            document.createElement(
                "div"
            );


        card.className =
            "forecast-card";


        card.innerHTML = `

            <p class="forecast-day">
                ${day}
            </p>

            <div class="forecast-icon">
                ${weatherInfo.icon}
            </div>

            <strong class="forecast-temp">
                ${Math.round(max)}°
            </strong>

            <span class="forecast-description">
                ${weatherInfo.description}
            </span>

        `;


        forecastContainer.appendChild(
            card
        );

    }

}


// ========================================
// Autocomplete
// ========================================

searchInput.addEventListener(
    "input",
    () => {

        const value =
            searchInput.value.trim();


        clearTimeout(
            searchTimeout
        );


        hideError();


        if (
            value.length < 2
        ) {

            hideSuggestions();

            return;

        }


        searchTimeout =
            setTimeout(
                () => {

                    getSuggestions(value);

                },
                350
            );

    }
);


// ========================================
// Get Suggestions
// ========================================

async function getSuggestions(
    query
) {

    const requestId =
        ++suggestionRequestId;


    try {

        const url =
            new URL(
                "https://geocoding-api.open-meteo.com/v1/search"
            );


        url.searchParams.set(
            "name",
            query
        );


        url.searchParams.set(
            "count",
            "10"
        );


        url.searchParams.set(
            "language",
            "en"
        );


        url.searchParams.set(
            "format",
            "json"
        );


        const response =
            await fetch(url);


        if (
            requestId !==
            suggestionRequestId
        ) {

            return;

        }


        if (!response.ok) {

            hideSuggestions();

            return;

        }


        const data =
            await response.json();


        if (
            !data.results ||
            data.results.length === 0
        ) {

            showNoSuggestions();

            return;

        }


        displaySuggestions(
            data.results
        );

    }

    catch (error) {

        console.error(
            "Suggestions Error:",
            error
        );

        hideSuggestions();

    }

}


// ========================================
// Display Suggestions
// ========================================

function displaySuggestions(
    results
) {

    suggestions.innerHTML =
        "";


    results.forEach(
        (location) => {

            const item =
                document.createElement(
                    "button"
                );


            item.type =
                "button";


            item.className =
                "suggestion-item";


            const admin =
                location.admin1
                    ? `, ${location.admin1}`
                    : "";


            item.innerHTML = `

                <span class="suggestion-icon">

                    <i class="fa-solid fa-location-dot"></i>

                </span>


                <span class="suggestion-info">

                    <span class="suggestion-city">
                        ${escapeHTML(
                            location.name
                        )}
                    </span>


                    <span class="suggestion-location">
                        ${escapeHTML(
                            location.country || ""
                        )}${escapeHTML(admin)}
                    </span>

                </span>

            `;


            item.addEventListener(
                "click",
                () => {

                    selectSuggestion(
                        location
                    );

                }
            );


            suggestions.appendChild(
                item
            );

        }
    );


    suggestions.hidden =
        false;

}


// ========================================
// Select Suggestion
// ========================================

async function selectSuggestion(
    location
) {

    searchInput.value =
        location.name;


    hideSuggestions();

    hideError();

    showLoading();

    clearWeather();


    try {

        await getWeather(

            location.latitude,

            location.longitude,

            location.name,

            location.country

        );

    }

    catch (error) {

        console.error(error);

        clearWeather();

        showError(
            "Unable to get weather data."
        );

    }

    finally {

        hideLoading();

    }

}


// ========================================
// No Suggestions
// ========================================

function showNoSuggestions() {

    suggestions.innerHTML = `

        <div class="no-results">
            No cities found
        </div>

    `;


    suggestions.hidden =
        false;

}


// ========================================
// Hide Suggestions
// ========================================

function hideSuggestions() {

    suggestions.innerHTML =
        "";

    suggestions.hidden =
        true;

}


// ========================================
// Search Button
// ========================================

searchBtn.addEventListener(
    "click",
    () => {

        searchCity(
            searchInput.value
        );

    }
);


// ========================================
// Enter
// ========================================

searchInput.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Enter"
        ) {

            // Defensive guard: stops this key press from ever
            // triggering a native form submit / page reload,
            // even if the input is later wrapped in a <form>.
            event.preventDefault();

            hideSuggestions();

            searchCity(
                searchInput.value
            );

        }

    }
);


// ========================================
// Click Outside
// ========================================

document.addEventListener(
    "click",
    (event) => {

        if (
            !event.target.closest(
                ".search-section"
            )
        ) {

            hideSuggestions();

        }

    }
);


// ========================================
// Current Location
// ========================================

locationBtn.addEventListener(
    "click",
    () => {

        if (
            !navigator.geolocation
        ) {

            showError(
                "Geolocation is not supported by your browser."
            );

            return;

        }


        showLoading();

        hideError();

        hideSuggestions();

        clearWeather();


        navigator.geolocation.getCurrentPosition(

            async (position) => {

                try {

                    const latitude =
                        position.coords.latitude;


                    const longitude =
                        position.coords.longitude;


                    await getWeather(

                        latitude,

                        longitude,

                        "Current Location",

                        ""

                    );

                }

                catch (error) {

                    console.error(error);

                    clearWeather();

                    showError(
                        "Unable to get weather data."
                    );

                }

                finally {

                    hideLoading();

                }

            },


            () => {

                hideLoading();

                showError(
                    "Please allow location access."
                );

            }

        );

    }
);


// ========================================
// Dark Mode
// ========================================

themeBtn.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "dark-mode"
        );


        const icon =
            themeBtn.querySelector("i");


        if (
            document.body.classList.contains(
                "dark-mode"
            )
        ) {

            icon.classList.remove(
                "fa-moon"
            );

            icon.classList.add(
                "fa-sun"
            );

        }

        else {

            icon.classList.remove(
                "fa-sun"
            );

            icon.classList.add(
                "fa-moon"
            );

        }

    }
);


// ========================================
// Celsius
// ========================================

celsiusBtn.addEventListener(
    "click",
    () => {

        if (
            !currentWeatherData
        ) {

            return;

        }


        currentUnit =
            "celsius";


        celsiusBtn.classList.add(
            "active"
        );


        fahrenheitBtn.classList.remove(
            "active"
        );


        updateCurrentWeather(
            currentWeatherData
        );


        updateForecast(
            currentWeatherData
        );

    }
);


// ========================================
// Fahrenheit
// ========================================

fahrenheitBtn.addEventListener(
    "click",
    () => {

        if (
            !currentWeatherData
        ) {

            return;

        }


        currentUnit =
            "fahrenheit";


        fahrenheitBtn.classList.add(
            "active"
        );


        celsiusBtn.classList.remove(
            "active"
        );


        updateCurrentWeather(
            currentWeatherData
        );


        updateForecast(
            currentWeatherData
        );

    }
);


// ========================================
// Clear Weather
// ========================================

function clearWeather() {

    currentWeatherData =
        null;


    currentWeather.hidden =
        true;


    forecastSection.hidden =
        true;


    unitSection.hidden =
        true;


    forecastContainer.innerHTML =
        "";

}


// ========================================
// Loading
// ========================================

function showLoading() {

    loading.hidden =
        false;

}


function hideLoading() {

    loading.hidden =
        true;

}


// ========================================
// Error
// ========================================

function showError(
    message
) {

    errorText.textContent =
        message;


    errorMessage.hidden =
        false;

}


function hideError() {

    errorMessage.hidden =
        true;

}


// ========================================
// Escape HTML
// ========================================

function escapeHTML(
    value
) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ========================================
// Start App
// ========================================

