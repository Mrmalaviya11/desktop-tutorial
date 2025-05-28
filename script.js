// API key for OpenWeatherMap
const API_KEY = "4d8fb5b93d4af21d66a2948710284366"; // Replace with your own API key

// DOM elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const cityElement = document.getElementById('city');
const countryElement = document.getElementById('country');
const tempElement = document.getElementById('temp');
const weatherIconElement = document.getElementById('weather-icon');
const descriptionElement = document.getElementById('description');
const windElement = document.getElementById('wind');
const humidityElement = document.getElementById('humidity');
const pressureElement = document.getElementById('pressure');
const timeElement = document.getElementById('time');
const dateElement = document.getElementById('date');
const timezoneElement = document.getElementById('timezone');

// Default city
let currentCity = "London";

// Event listeners
searchBtn.addEventListener('click', () => {
    if (searchInput.value.trim() !== '') {
        currentCity = searchInput.value.trim();
        fetchWeatherData();
    }
});

searchInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter' && searchInput.value.trim() !== '') {
        currentCity = searchInput.value.trim();
        fetchWeatherData();
    }
});
1234
// Fetch weather data from API
async function fetchWeatherData() {
    try {
        cityElement.textContent = "Loading...";
        
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${currentCity}&units=metric&appid=${API_KEY}`);
        
        if (!response.ok) {
            throw new Error("City not found");
        }
        
        const data = await response.json();
        
        // Update UI with weather data
        updateWeatherUI(data);
        
        // Update time based on timezone
        updateTime(data.timezone);
        
    } catch (error) {
        cityElement.textContent = "City not found";
        countryElement.textContent = "";
        console.error("Error fetching weather data:", error);
    }
}

// Update weather UI elements
function updateWeatherUI(data) {
    cityElement.textContent = data.name;
    countryElement.textContent = data.sys.country;
    tempElement.textContent = Math.round(data.main.temp);
    descriptionElement.textContent = data.weather[0].description;
    
    // Weather icon
    const iconCode = data.weather[0].icon;
    weatherIconElement.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    weatherIconElement.alt = data.weather[0].description;
    
    // Add weather-specific class for animations
    const weatherType = data.weather[0].main.toLowerCase();
    weatherIconElement.parentElement.className = `weather-icon ${weatherType}`;
    
    windElement.textContent = `${data.wind.speed} km/h`;
    humidityElement.textContent = `${data.main.humidity}%`;
    pressureElement.textContent = `${data.main.pressure} hPa`;
}

// Update time based on timezone
function updateTime(timezone) {
    // Get timezone offset in hours
    const timezoneOffsetHours = timezone / 3600;
    const sign = timezoneOffsetHours >= 0 ? '+' : '-';
    const absoluteOffset = Math.abs(timezoneOffsetHours);
    const hours = Math.floor(absoluteOffset);
    const minutes = Math.floor((absoluteOffset - hours) * 60);
    
    timezoneElement.textContent = `UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    // Clear any existing interval to prevent multiple timers
    if (window.timeInterval) {
        clearInterval(window.timeInterval);
    }
    
    // Update time immediately
    updateCurrentTime(timezone);
    
    // Then update time every second
    window.timeInterval = setInterval(() => updateCurrentTime(timezone), 1000);
}

// Update current time function with improved formatting
function updateCurrentTime(timezone) {
    const now = new Date();
    
    // Adjust for timezone
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const localTime = new Date(utc + (timezone * 1000));
    
    // Format hours, minutes, and seconds with leading zeros
    const hours = localTime.getHours().toString().padStart(2, '0');
    const minutes = localTime.getMinutes().toString().padStart(2, '0');
    const seconds = localTime.getSeconds().toString().padStart(2, '0');
    
    // Create time string with separator spans for animation
    const timeString = `${hours}<span class="separator">:</span>${minutes}<span class="separator">:</span>${seconds}`;
    
    // Format date
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    const dateString = localTime.toLocaleDateString(undefined, options);
    
    // Update DOM
    timeElement.innerHTML = timeString;
    dateElement.textContent = dateString;
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    fetchWeatherData();
    initGlobe();
});

// Initialize the interactive globe
function initGlobe() {
    const globeContainer = document.querySelector('.globe-container');
    const closeGlobeBtn = document.querySelector('.close-globe');
    const cityMarkers = document.querySelectorAll('.city-marker');
    const popularCityItems = document.querySelectorAll('.popular-cities li');
    
    // Toggle globe expansion
    globeContainer.addEventListener('click', function(e) {
        if (e.target === this || e.target.classList.contains('globe')) {
            this.classList.toggle('expanded');
        }
    });
    
    // Close globe when clicking the close button
    closeGlobeBtn.addEventListener('click', function() {
        globeContainer.classList.remove('expanded');
    });
    
    // Handle city marker clicks
    cityMarkers.forEach(marker => {
        marker.addEventListener('click', function(e) {
            e.stopPropagation();
            const city = this.getAttribute('data-city');
            selectCity(city);
        });
    });
    
    // Handle popular cities list clicks
    popularCityItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.stopPropagation();
            const city = this.getAttribute('data-city');
            selectCity(city);
        });
    });
    
    // Add drag functionality to rotate the globe manually
    let isDragging = false;
    let startX;
    let startPos;
    
    const globe = document.querySelector('.globe');
    
    globe.addEventListener('mousedown', function(e) {
        if (globeContainer.classList.contains('expanded')) {
            isDragging = true;
            startX = e.clientX;
            const computedStyle = window.getComputedStyle(globe);
            startPos = parseInt(computedStyle.backgroundPosition.split(' ')[0]);
            globe.style.animationPlayState = 'paused';
        }
    });
    
    document.addEventListener('mousemove', function(e) {
        if (isDragging) {
            const diff = e.clientX - startX;
            const newPos = startPos + diff;
            globe.style.backgroundPosition = `${newPos}px 0`;
        }
    });
    
    document.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            globe.style.animationPlayState = 'running';
        }
    });
}

// Select a city and update weather
function selectCity(city) {
    currentCity = city;
    fetchWeatherData();
    
    // Close the globe view
    document.querySelector('.globe-container').classList.remove('expanded');
    
    // Add visual feedback
    const searchInput = document.getElementById('search-input');
    searchInput.value = city;
    searchInput.classList.add('highlight');
    
    setTimeout(() => {
        searchInput.classList.remove('highlight');
    }, 1500);
}