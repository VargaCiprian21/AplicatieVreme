// --- ELEMENE DOM & STARE GLOBALĂ ---
const form = document.getElementById('weather-form');
const cityInput = document.getElementById('city-input');
const resultDiv = document.getElementById('weather-result');
const homeDashboard = document.getElementById('home-dashboard');
const geoBtn = document.getElementById('geo-btn');
const unitToggleBtn = document.getElementById('unit-toggle');
const scrollFavBtn = document.getElementById('scroll-fav-btn');
const suggestionsBox = document.getElementById('suggestions-box');
const favForm = document.getElementById('fav-form');
const favInput = document.getElementById('fav-input');
const favContainer = document.getElementById('favorites-container');

let useMetric = true; 
let lastLocation = null; 
let timeoutId;
let favoriteCities = JSON.parse(localStorage.getItem('meteo_favorites')) || ['Brașov', 'Londra'];

// --- METROPOLE HOME ---
const defaultCities = [
    { name: 'New York', lat: 40.7128, lon: -74.0060 },
    { name: 'Londra', lat: 51.5074, lon: -0.1278 },
    { name: 'Tokyo', lat: 35.6895, lon: 139.6917 },
    { name: 'Dubai', lat: 25.2048, lon: 55.2708 }
];

async function loadHomeDashboard() {
    const grid = document.getElementById('world-cities-grid');
    if (!grid) return;
    grid.innerHTML = ''; 

    const tempUnit = useMetric ? 'celsius' : 'fahrenheit';
    const tempSymbol = useMetric ? '°C' : '°F';

    for (const city of defaultCities) {
        try {
            const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true&temperature_unit=${tempUnit}`);
            const data = await response.json();
            const temp = Math.round(data.current_weather.temperature);
            
            const card = document.createElement('div');
            card.className = 'world-card';
            card.innerHTML = `<div class="world-city">${city.name}</div><div class="world-temp">${temp}${tempSymbol}</div>`;
            
            card.addEventListener('click', () => {
                fetchWeatherByCoords(city.lat, city.lon, city.name);
            });

            grid.appendChild(card);
        } catch (error) {
            console.error(`Eroare metropolă ${city.name}:`, error);
        }
    }
}

// Action Logou Home
document.getElementById('logo-home').addEventListener('click', () => {
    resultDiv.classList.add('hidden');
    homeDashboard.classList.remove('hidden');
    cityInput.value = '';
    loadHomeDashboard();
});

// --- CODE WMO & IMAGINI ---
function getWeatherDescription(code) {
    const weatherCodes = {
        0: { desc: 'Senin', emoji: '☀️' }, 1: { desc: 'Predominant senin', emoji: '🌤️' },
        2: { desc: 'Parțial noros', emoji: '⛅' }, 3: { desc: 'Noros', emoji: '☁️' },
        45: { desc: 'Ceață', emoji: '🌫️' }, 48: { desc: 'Ceață', emoji: '🌫️' },
        51: { desc: 'Averse slabe', emoji: '🌦️' }, 53: { desc: 'Averse moderate', emoji: '🌦️' },
        55: { desc: 'Averse dense', emoji: '🌧️' }, 61: { desc: 'Ploaie slabă', emoji: '🌧️' },
        63: { desc: 'Ploaie moderată', emoji: '🌧️' }, 65: { desc: 'Ploaie puternică', emoji: '🌧️' },
        71: { desc: 'Ninsoare slabă', emoji: '🌨️' }, 73: { desc: 'Ninsoare moderată', emoji: '❄️' },
        75: { desc: 'Ninsoare puternică', emoji: '❄️' }, 80: { desc: 'Averse', emoji: '🌦️' },
        81: { desc: 'Averse puternice', emoji: '🌧️' }, 82: { desc: 'Averse violente', emoji: '⛈️' },
        95: { desc: 'Furtună', emoji: '🌩️' }, 96: { desc: 'Furtună grindină', emoji: '⛈️' },
        99: { desc: 'Furtună puternică', emoji: '⛈️' }
    };
    return weatherCodes[code] || { desc: 'Condiții variabile', emoji: '🌡️' };
}

function updateBackgroundImage(code) {
    let imageUrl = 'https://images.unsplash.com/photo-1601297183305-6df142704ea2?auto=format&fit=crop&w=1920&q=80';
    if (code === 0 || code === 1) imageUrl = 'https://images.unsplash.com/photo-1601297183305-6df142704ea2?auto=format&fit=crop&w=1920&q=80';
    else if (code === 2 || code === 3) imageUrl = 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1920&q=80';
    else if (code === 45 || code === 48) imageUrl = 'https://images.unsplash.com/photo-1487621167305-5d248087c724?auto=format&fit=crop&w=1920&q=80';
    else if ((code >= 51 && code <= 65) || (code >= 80 && code <= 82)) imageUrl = 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=1920&q=80';
    else if (code >= 71 && code <= 75) imageUrl = 'https://images.unsplash.com/photo-1483664852095-d6cc6870702d?auto=format&fit=crop&w=1920&q=80';
    else if (code >= 95 && code <= 99) imageUrl = 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?auto=format&fit=crop&w=1920&q=80';
    
    document.body.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${imageUrl}')`;
}

// --- AFISARE VREME ---
async function fetchWeatherByCoords(latitude, longitude, locationName) {
    lastLocation = { latitude, longitude, locationName };
    homeDashboard.classList.add('hidden'); // Ascundem metropolele la afișarea rezultatului
    resultDiv.classList.remove('hidden');

    const tempUnit = useMetric ? 'celsius' : 'fahrenheit';
    const windUnit = useMetric ? 'kmh' : 'mph';
    const tempSymbol = useMetric ? '°C' : '°F';
    const windSymbol = useMetric ? 'km/h' : 'mph';

    try {
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset&temperature_unit=${tempUnit}&windspeed_unit=${windUnit}&timezone=auto`;
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        if (!weatherData.current_weather || !weatherData.daily) throw new Error('Nu s-au putut prelua datele.');

        const current = weatherData.current_weather;
        const daily = weatherData.daily;
        const weatherInfo = getWeatherDescription(current.weathercode);

        updateBackgroundImage(current.weathercode);

        const sunriseTime = daily.sunrise[0].split('T')[1];
        const sunsetTime = daily.sunset[0].split('T')[1];

        let forecastHtml = `
            <div class="forecast-container">
                <h3 class="forecast-title">Prognoză 5 Zile 📅</h3>
                <div class="forecast-cards">
        `;

        for (let i = 0; i < 5; i++) {
            const dateObj = new Date(daily.time[i]);
            const dayName = i === 0 ? 'Azi' : dateObj.toLocaleDateString('ro-RO', { weekday: 'short' });
            const dateFormatted = dateObj.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' });
            const dayInfo = getWeatherDescription(daily.weathercode[i]);

            forecastHtml += `
                <div class="forecast-card">
                    <span class="forecast-day">${dayName}</span>
                    <span class="forecast-date">${dateFormatted}</span>
                    <span class="forecast-emoji">${dayInfo.emoji}</span>
                    <span class="forecast-temp"><strong>${Math.round(daily.temperature_2m_max[i])}°</strong> / ${Math.round(daily.temperature_2m_min[i])}°</span>
                </div>
            `;
        }
        forecastHtml += `</div></div>`;

        // Verificăm dacă orașul este deja la favorite pentru a seta starea butonului
        const isFavorite = favoriteCities.includes(locationName);
        const favBtnText = isFavorite ? '⭐ Salvat' : '➕ Adaugă la favorite';
        const favBtnClass = isFavorite ? 'add-fav-btn added' : 'add-fav-btn';

        resultDiv.innerHTML = `
            <div class="city-header-wrapper">
                <h2 class="city-name" style="margin-bottom: 0;">${locationName}</h2>
                <button id="quick-add-fav" class="${favBtnClass}">${favBtnText}</button>
            </div>
            <div class="weather-desc">
                <span>${weatherInfo.emoji}</span> ${weatherInfo.desc}
            </div>
            <div class="temp">${Math.round(current.temperature)}${tempSymbol}</div>
            <div class="details">
                <div class="detail-item"><strong>Vânt:</strong> ${current.windspeed} ${windSymbol}</div>
                <div class="detail-item"><strong>Direcție:</strong> ${current.winddirection}°</div>
            </div>
            <div class="astro-details">
                <div class="astro-item">🌅 Răsărit: ${sunriseTime}</div>
                <div class="astro-item">🌇 Apus: ${sunsetTime}</div>
            </div>
            ${forecastHtml}
            
            <!-- Radarul de precipitații -->
            <div style="margin-top: 25px; border-top: 1px solid rgba(0,0,0,0.1); padding-top: 15px;">
                <h3 style="font-size: 1.2rem; color: #2c3e50; margin-bottom: 15px;">Radar Precipitații 🛰️</h3>
                <iframe src="https://www.rainviewer.com/map.html?loc=${latitude},${longitude},7&oParams=1,0,1&c=1&o=83&ac=0&g=0&be=0&bd=0&v=1" width="100%" height="320" frameborder="0" style="border: none; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);"></iframe>
            </div>
        `;

        // Activăm funcționalitatea butonului de adăugare/ștergere rapidă din favorite
        const quickFavBtn = document.getElementById('quick-add-fav');
        quickFavBtn.addEventListener('click', () => {
            if (!favoriteCities.includes(locationName)) {
                // Adaugă
                favoriteCities.push(locationName);
                localStorage.setItem('meteo_favorites', JSON.stringify(favoriteCities));
                quickFavBtn.innerHTML = '⭐ Salvat';
                quickFavBtn.classList.add('added');
            } else {
                // Șterge (dacă te-ai răzgândit și apeși din nou)
                favoriteCities = favoriteCities.filter(item => item !== locationName);
                localStorage.setItem('meteo_favorites', JSON.stringify(favoriteCities));
                quickFavBtn.innerHTML = '➕ Adaugă la favorite';
                quickFavBtn.classList.remove('added');
            }
            renderFavorites(); // Actualizăm grila de favorite de jos în timp real
        });
    } catch (error) {
        resultDiv.innerHTML = `<p class="error">❌ Eroare: ${error.message}</p>`;
    }
}

// --- EVENIMENTE CAUTARE & GEOLOCATIE ---
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (!city) return;
    
    try {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=ro&format=json`;
        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();
        if (!geoData.results || geoData.results.length === 0) throw new Error('Orașul nu a fost găsit!');
        const location = geoData.results[0];
        const displayName = `${location.name}${location.country ? `, ${location.country}` : ''}`;
        await fetchWeatherByCoords(location.latitude, location.longitude, displayName);
    } catch (error) {
        resultDiv.classList.remove('hidden');
        homeDashboard.classList.add('hidden');
        resultDiv.innerHTML = `<p class="error">❌ Eroare: ${error.message}</p>`;
    }
});

geoBtn.addEventListener('click', () => {
    if (!navigator.geolocation) return alert('Geolocația nu este suportată.');
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            await fetchWeatherByCoords(latitude, longitude, '📍 Locația ta curentă');
        },
        () => alert('Accesul la locație a fost respins.')
    );
});

// --- AUTOCOMPLETE ---
cityInput.addEventListener('input', (e) => {
    clearTimeout(timeoutId);
    const query = e.target.value.trim();
    
    if (query.length < 3) {
        suggestionsBox.classList.add('hidden');
        return;
    }

    timeoutId = setTimeout(async () => {
        try {
            const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=ro&format=json`);
            const data = await response.json();
            suggestionsBox.innerHTML = '';

            if (data.results && data.results.length > 0) {
                data.results.forEach(city => {
                    const li = document.createElement('li');
                    li.textContent = `${city.name}, ${city.country || ''}`;
                    li.addEventListener('click', () => {
                        cityInput.value = city.name;
                        suggestionsBox.classList.add('hidden');
                        fetchWeatherByCoords(city.latitude, city.longitude, `${city.name}, ${city.country || ''}`);
                    });
                    suggestionsBox.appendChild(li);
                });
                suggestionsBox.classList.remove('hidden');
            } else {
                suggestionsBox.classList.add('hidden');
            }
        } catch (error) {
            console.error('Eroare sugestii:', error);
        }
    }, 300); 
});

document.addEventListener('click', (e) => {
    if (!cityInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
        suggestionsBox.classList.add('hidden');
    }
});

// --- FAVORITE & COMUTATOR UNITĂȚI ---
unitToggleBtn.addEventListener('click', () => {
    useMetric = !useMetric;
    unitToggleBtn.textContent = useMetric ? '°C' : '°F';
    if (lastLocation) fetchWeatherByCoords(lastLocation.latitude, lastLocation.longitude, lastLocation.locationName);
    loadHomeDashboard();
    renderFavorites(); 
});

scrollFavBtn.addEventListener('click', () => {
    const favSection = document.querySelector('.favorites-section');
    if (favSection) {
        favSection.classList.toggle('hidden');
        if (!favSection.classList.contains('hidden')) {
            favSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
});

async function renderFavorites() {
    favContainer.innerHTML = '';
    const tempUnit = useMetric ? 'celsius' : 'fahrenheit';
    const tempSymbol = useMetric ? '°C' : '°F';

    for (const city of favoriteCities) {
        try {
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&format=json`);
            const geoData = await geoRes.json();
            if (!geoData.results) continue;

            const { latitude, longitude, name } = geoData.results[0];
            const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=${tempUnit}`);
            const weatherData = await weatherRes.json();
            
            const current = weatherData.current_weather;
            const info = getWeatherDescription(current.weathercode);

            const card = document.createElement('div');
            card.className = 'fav-card';
            card.innerHTML = `
                <button class="remove-fav" title="Șterge">&times;</button>
                <div class="fav-title">${name}</div>
                <div>${info.emoji}</div>
                <div class="fav-temp">${Math.round(current.temperature)}${tempSymbol}</div>
            `;

            card.addEventListener('click', (e) => {
                if (e.target.classList.contains('remove-fav')) return;
                fetchWeatherByCoords(latitude, longitude, name);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });

            card.querySelector('.remove-fav').addEventListener('click', () => {
                favoriteCities = favoriteCities.filter(item => item !== city);
                localStorage.setItem('meteo_favorites', JSON.stringify(favoriteCities));
                renderFavorites();
            });

            favContainer.appendChild(card);
        } catch (err) {
            console.error('Eroare favorite:', err);
        }
    }
}

favForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newCity = favInput.value.trim();
    if (!newCity) return;

    if (!favoriteCities.includes(newCity)) {
        favoriteCities.push(newCity);
        localStorage.setItem('meteo_favorites', JSON.stringify(favoriteCities));
        renderFavorites();
    }
    favInput.value = ''; 
});

// --- INIȚIALIZARE ---
window.addEventListener('DOMContentLoaded', () => {
    loadHomeDashboard();
    renderFavorites();
});