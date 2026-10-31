// ========================================
// GITHUB PROJECTS INTEGRATION
// ========================================

async function loadGitHubProjects() {

    const projectsContainer = document.getElementById("github-projects");
    const status = document.getElementById("github-status");

    if (!projectsContainer || !status) return;

    try {

        status.textContent = "Loading GitHub projects...";

        const response = await fetch(
            "https://api.github.com/users/Areeba200411/repos?sort=updated&per_page=10"
        );

        if (!response.ok) {
            throw new Error("Unable to fetch GitHub repositories.");
        }

        const repositories = await response.json();

        if (repositories.length === 0) {
            status.textContent = "No public repositories found.";
            return;
        }

        projectsContainer.innerHTML = "";

        repositories.forEach(repo => {

            const card = document.createElement("article");
            card.className = "project-card";

            const title = document.createElement("h2");
            title.textContent = repo.name;

            const description = document.createElement("p");
            description.textContent =
                repo.description || "No description available.";

            const language = document.createElement("p");
            language.className = "project-status";
            language.textContent =
                "Language: " + (repo.language || "Not specified");

            const link = document.createElement("a");
            link.href = repo.html_url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.className = "project-link";
            link.textContent = "View on GitHub →";

            card.append(title, description, language, link);

            projectsContainer.appendChild(card);

        });

        status.textContent = "Latest public GitHub repositories";

    } catch (error) {

        status.textContent =
            "Unable to load projects. Please try again later.";

        console.error("GitHub API Error:", error);

    }
}

loadGitHubProjects();


// ========================================
// LIVE WEATHER API
// Current + Hourly + 7-Day Forecast
// ========================================

let weatherData = null;
let temperatureUnit = "C";


// ========================================
// SEARCH WEATHER BY CITY
// ========================================

async function loadWeather() {

    const cityInput = document.getElementById("city-input");
    const status = document.getElementById("weather-status");
    const result = document.getElementById("weather-result");

    if (!cityInput || !status || !result) return;

    const city = cityInput.value.trim();

    if (city === "") {

        status.textContent = "Please enter a city name.";
        return;

    }

    status.textContent = "Searching for city...";
    result.style.display = "none";

    try {

        // STEP 1: Search city

        const geoURL =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=5&language=en&format=json`;

        const geoResponse = await fetch(geoURL);

        if (!geoResponse.ok) {
            throw new Error("City search failed.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {

            status.textContent = "City not found. Try another city.";
            return;

        }

        const location = geoData.results[0];

        // STEP 2: Get weather data

        status.textContent = "Loading live weather...";

        const weatherURL =
            `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`;

        const weatherResponse = await fetch(weatherURL);

        if (!weatherResponse.ok) {
            throw new Error("Weather data could not be loaded.");
        }

        weatherData = await weatherResponse.json();

        if (!weatherData.current) {
            throw new Error("Weather information is unavailable.");
        }

        // STEP 3: Display city name

        document.getElementById("weather-city").textContent =
            location.name + ", " + (location.country || "");

        // STEP 4: Display weather

        refreshWeatherDisplay();

        result.style.display = "block";

        status.textContent = "Live weather updated successfully.";

    } catch (error) {

        console.error("Weather Error:", error);

        status.textContent =
            "Unable to load weather. Check your internet connection and try again.";

    }
}


// ========================================
// WEATHER USING CURRENT LOCATION
// ========================================

async function loadWeatherByLocation() {

    const status = document.getElementById("weather-status");
    const result = document.getElementById("weather-result");
    const locationButton = document.getElementById("location-weather-btn");

    if (!status || !result || !locationButton) return;

    if (!navigator.geolocation) {

        status.textContent =
            "Location is not supported by your browser.";

        return;

    }

    status.textContent = "Getting your location...";
    result.style.display = "none";
    locationButton.disabled = true;

    navigator.geolocation.getCurrentPosition(

        async function (position) {

            try {

                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                status.textContent = "Loading your local weather...";

                const weatherURL =
                    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`;

                const response = await fetch(weatherURL);

                if (!response.ok) {
                    throw new Error("Weather data could not be loaded.");
                }

                weatherData = await response.json();

                if (!weatherData.current) {
                    throw new Error("Weather information is unavailable.");
                }

                document.getElementById("weather-city").textContent =
                    "Your Current Location";

                refreshWeatherDisplay();

                result.style.display = "block";

                status.textContent =
                    "Your local weather updated successfully.";

            } catch (error) {

                console.error("Location Weather Error:", error);

                status.textContent =
                    "Unable to load local weather. Please try again.";

            } finally {

                locationButton.disabled = false;

            }

        },

        function (error) {

            locationButton.disabled = false;

            if (error.code === 1) {

                status.textContent =
                    "Location permission was denied.";

            } else if (error.code === 2) {

                status.textContent =
                    "Your location is unavailable.";

            } else {

                status.textContent =
                    "Location request timed out. Try again.";

            }

        },

        {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 300000
        }

    );
}


// ========================================
// TEMPERATURE CONVERSION
// ========================================

function convertTemperature(celsius) {

    if (temperatureUnit === "F") {

        return (celsius * 9 / 5) + 32;

    }

    return celsius;

}


function formatTemperature(celsius) {

    return Math.round(convertTemperature(celsius)) + "°" + temperatureUnit;

}


// ========================================
// CURRENT WEATHER
// ========================================

function displayCurrentWeather(current) {

    document.getElementById("weather-temperature").textContent =
        formatTemperature(current.temperature_2m);

    document.getElementById("weather-condition").innerHTML =
        getWeatherCondition(current.weather_code);

    document.getElementById("weather-humidity").textContent =
        current.relative_humidity_2m + "%";

    document.getElementById("weather-wind").textContent =
        current.wind_speed_10m;

}


// ========================================
// HOURLY FORECAST
// ========================================

function displayHourlyForecast(hourly) {

    const container = document.getElementById("weather-hourly");

    if (!container) return;

    container.innerHTML = "";

    if (!hourly || !hourly.time) {

        container.textContent = "Hourly forecast unavailable.";
        return;

    }

    // Get current hour and next 12 hours

    const now = new Date();

    let startIndex = hourly.time.findIndex(time => {

        return new Date(time) >= now;

    });

    if (startIndex === -1) startIndex = 0;

    const endIndex = Math.min(startIndex + 12, hourly.time.length);

    for (let i = startIndex; i < endIndex; i++) {

        const date = new Date(hourly.time[i]);

        const time = date.toLocaleTimeString("en-US", {

            hour: "numeric",
            minute: "2-digit"

        });

        const card = document.createElement("div");

        card.className = "hourly-card";

        card.innerHTML = `

            <p class="hourly-time">${time}</p>

            <p class="hourly-condition">
                ${getWeatherCondition(hourly.weather_code[i])}
            </p>

            <h4>${formatTemperature(hourly.temperature_2m[i])}</h4>

            <p class="hourly-rain">
                Rain: ${hourly.precipitation_probability[i] ?? 0}%
            </p>

        `;

        container.appendChild(card);

    }

}


// ========================================
// 7-DAY FORECAST
// ========================================

function displayWeeklyForecast(daily) {

    const container = document.getElementById("weather-forecast");

    if (!container) return;

    container.innerHTML = "";

    if (!daily || !daily.time) {

        container.textContent = "Weekly forecast unavailable.";
        return;

    }

    daily.time.forEach((dateString, index) => {

        const date = new Date(dateString + "T12:00:00");

        let dayName;

        if (index === 0) {

            dayName = "Today";

        } else if (index === 1) {

            dayName = "Tomorrow";

        } else {

            dayName = date.toLocaleDateString("en-US", {

                weekday: "long"

            });

        }

        const formattedDate = date.toLocaleDateString("en-US", {

            day: "numeric",
            month: "short"

        });

        const card = document.createElement("div");

        card.className = "forecast-card";

        card.innerHTML = `

            <div>

                <p class="forecast-day">${dayName}</p>

                <p class="forecast-date">${formattedDate}</p>

            </div>

            <p class="forecast-condition">

                ${getWeatherCondition(daily.weather_code[index])}

            </p>

            <p class="forecast-temperature">

                ${formatTemperature(daily.temperature_2m_max[index])} /
                ${formatTemperature(daily.temperature_2m_min[index])}

            </p>

        `;

        container.appendChild(card);

    });

}


// ========================================
// WEATHER CONDITION AND ICONS
// ========================================

function getWeatherCondition(code) {

    if (code === 0) {

        return '<i class="fas fa-sun weather-icon sunny"></i> Clear Sky';

    }

    if ([1, 2, 3].includes(code)) {

        return '<i class="fas fa-cloud-sun weather-icon cloudy"></i> Partly Cloudy';

    }

    if ([45, 48].includes(code)) {

        return '<i class="fas fa-smog weather-icon"></i> Foggy';

    }

    if ([51, 53, 55, 56, 57].includes(code)) {

        return '<i class="fas fa-cloud-rain weather-icon rainy"></i> Drizzle';

    }

    if ([61, 63, 65, 66, 67].includes(code)) {

        return '<i class="fas fa-cloud-showers-heavy weather-icon rainy"></i> Rainy';

    }

    if ([71, 73, 75, 77].includes(code)) {

        return '<i class="fas fa-snowflake weather-icon"></i> Snowy';

    }

    if ([80, 81, 82].includes(code)) {

        return '<i class="fas fa-cloud-rain weather-icon rainy"></i> Rain Showers';

    }

    if ([85, 86].includes(code)) {

        return '<i class="fas fa-snowflake weather-icon"></i> Snow Showers';

    }

    if ([95, 96, 99].includes(code)) {

        return '<i class="fas fa-bolt weather-icon stormy"></i> Thunderstorm';

    }

    return "Weather information unavailable";

}


// ========================================
// REFRESH WEATHER DISPLAY
// ========================================

function refreshWeatherDisplay() {

    if (!weatherData) return;

    displayCurrentWeather(weatherData.current);

    displayHourlyForecast(weatherData.hourly);

    displayWeeklyForecast(weatherData.daily);

}


// ========================================
// DOM CONTENT LOADED
// ALL WEATHER BUTTONS
// ========================================

document.addEventListener("DOMContentLoaded", function () {

    const weatherButton = document.getElementById("weather-btn");

    const cityInput = document.getElementById("city-input");

    const locationButton =
        document.getElementById("location-weather-btn");

    const celsiusButton =
        document.getElementById("celsius-btn");

    const fahrenheitButton =
        document.getElementById("fahrenheit-btn");

    const weatherToggle =
        document.getElementById("weather-toggle");

    const weatherWidget =
        document.getElementById("weather-widget");

    const weatherClose =
        document.getElementById("weather-close");


    // CITY SEARCH BUTTON

    if (weatherButton && cityInput) {

        weatherButton.addEventListener("click", loadWeather);

        cityInput.addEventListener("keydown", function (event) {

            if (event.key === "Enter") {

                loadWeather();

            }

        });

    }


    // USE MY LOCATION BUTTON

    if (locationButton) {

        locationButton.addEventListener(
            "click",
            loadWeatherByLocation
        );

    }


    // CELSIUS BUTTON

    if (celsiusButton && fahrenheitButton) {

        celsiusButton.addEventListener("click", function () {

            temperatureUnit = "C";

            celsiusButton.classList.add("active");

            fahrenheitButton.classList.remove("active");

            refreshWeatherDisplay();

        });


        // FAHRENHEIT BUTTON

        fahrenheitButton.addEventListener("click", function () {

            temperatureUnit = "F";

            fahrenheitButton.classList.add("active");

            celsiusButton.classList.remove("active");

            refreshWeatherDisplay();

        });

    }


    // OPEN AND CLOSE WEATHER POPUP

    if (weatherToggle && weatherWidget) {

        weatherToggle.addEventListener("click", function () {

            weatherWidget.classList.toggle("show");

            const isOpen =
                weatherWidget.classList.contains("show");

            weatherToggle.setAttribute("aria-expanded", isOpen);

        });

    }


    // CLOSE BUTTON

    if (weatherClose && weatherWidget && weatherToggle) {

        weatherClose.addEventListener("click", function () {

            weatherWidget.classList.remove("show");

            weatherToggle.setAttribute("aria-expanded", "false");

        });

    }

});