// Configuration
const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// DOM Elements
const elements = {
    cityInput: document.getElementById('cityInput'),
    searchBtn: document.getElementById('searchBtn'),
    cityName: document.getElementById('cityName'),
    currentDate: document.getElementById('currentDate'),
    temperature: document.getElementById('temperature'),
    weatherDescription: document.getElementById('weatherDescription'),
    weatherIcon: document.getElementById('weatherIcon'),
    humidity: document.getElementById('humidity'),
    windSpeed: document.getElementById('windSpeed'),
    pressure: document.getElementById('pressure'),
    forecastContainer: document.getElementById('forecastContainer'),
    airQualityLevel: document.getElementById('airQualityLevel'),
    airQualityDescription: document.getElementById('airQualityDescription'),
    uvIndex: document.getElementById('uvIndex'),
    uvDescription: document.getElementById('uvDescription')
};

// Event Listeners
elements.searchBtn.addEventListener('click', performSearch);
elements.cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
});

// Search Function
function performSearch() {
    const city = elements.cityInput.value.trim();
    if (city) {
        fetchWeatherData(city);
    }
}

// Fetch Weather Data
async function fetchWeatherData(city) {
    try {
        // Current Weather
        const weatherResponse = await fetch(`${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const weatherData = await weatherResponse.json();

        // Get Coordinates
        const { lat, lon } = weatherData.coord;

        // Parallel API Calls
        const [forecastResponse, airQualityResponse, uvResponse] = await Promise.all([
            fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`),
            fetch(`${BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`),
            fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${API_KEY}`)
        ]);

        const forecastData = await forecastResponse.json();
        const airQualityData = await airQualityResponse.json();
        const uvData = await uvResponse.json();

        updateCurrentWeather(weatherData);
        updateForecast(forecastData);
        updateAirQuality(airQualityData);
        updateUVIndex(uvData);
    } catch (error) {
        console.error('Weather Fetch Error:', error);
        handleError();
    }
}

// Update Current Weather
function updateCurrentWeather(data) {
    elements.cityName.textContent = `${data.name}, ${data.sys.country}`;
    elements.currentDate.textContent = formatDate(new Date());
    elements.temperature.textContent = `${Math.round(data.main.temp)}°