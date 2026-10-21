const form = document.getElementById('weather-form');
const cityInput = document.getElementById('city-input');
const resultDiv = document.getElementById('weather-result');
const geoBtn = document.getElementById('geo-btn');

// Dicționar pentru codurile meteo WMO
function getWeatherDescription(code) {
    const weatherCodes = {
        0: { desc: 'Senin', emoji: '☀️' },
        1: { desc: 'Predominant senin', emoji: '🌤️' },
        2: { desc: 'Parțial noros', emoji: '⛅' },
        3: { desc: 'Noros', emoji: '☁️' },
        45: { desc: 'Ceață', emoji: '🌫️' },
        48: { desc: 'Ceață depusă', emoji: '🌫️' },
        51: { desc: 'Averse slabe de ploaie', emoji: '🌦️' },
        53: { desc: 'Averse moderate de ploaie', emoji: '🌦️' },
        55: { desc: 'Averse dense de ploaie', emoji: '🌧️' },
        61: { desc: 'Ploaie slabă', emoji: '🌧️' },
        63: { desc: 'Ploaie moderată', emoji: '🌧️' },
        65: { desc: 'Ploaie puternică', emoji: '🌧️' },
        71: { desc: 'Ninsoare slabă', emoji: '🌨️' },
        73: { desc: 'Ninsoare moderată', emoji: '❄️' },
        75: { desc: 'Ninsoare puternică', emoji: '❄️' },
        80: { desc: 'Averse de ploaie', emoji: '🌦️' },
        81: { desc: 'Averse puternice de ploaie', emoji: '🌧️' },
        82: { desc: 'Averse violente de ploaie', emoji: '⛈️' },
        95: { desc: 'Furtună', emoji: '🌩️' },
        96: { desc: 'Furtună cu grindină slabă', emoji: '⛈️' },
        99: { desc: 'Furtună cu grindină puternică', emoji: '⛈️' }
    };

    return weatherCodes[code] || { desc: 'Condiții variabile', emoji: '🌡️' };
}

// Funcție principală care aduce vremea și radarul folosind Latitudinea și Longitudinea
async function fetchWeatherByCoords(latitude, longitude, locationName) {
    try {
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        if (!weatherData.current_weather) {
            throw new Error('Nu s-au putut prelua datele meteo.');
        }

        const current = weatherData.current_weather;
        const weatherInfo = getWeatherDescription(current.weathercode);
updateBackgroundImage(current.weathercode);
        // Generăm afișarea vremii + Radarul Meteoblue
        resultDiv.innerHTML = `
            <h2 class="city-name">${locationName}</h2>
            <div class="weather-desc">
                <span>${weatherInfo.emoji}</span> ${weatherInfo.desc}
            </div>
            <div class="temp">${Math.round(current.temperature)}°C</div>
            <div class="details">
                <div class="detail-item">
                    <strong>Vânt:</strong> ${current.windspeed} km/h
                </div>
                <div class="detail-item">
                    <strong>Direcție vânt:</strong> ${current.winddirection}°
                </div>
            </div>

            <!-- Radar Meteo (Rain) -->
            <div style="margin-top: 25px; border-top: 1px solid #eee; padding-top: 15px;">
                <h3 style="font-size: 1.2rem; color: #2c3e50; margin-bottom: 15px;">Radar Precipitații 🛰️</h3>
                <iframe 
                    src="https://www.rainviewer.com/map.html?loc=${latitude},${longitude},7&oParams=1,0,1&c=1&o=83&ac=0&g=0&be=0&bd=0&v=1" 
                    width="100%" 
                    height="320" 
                    frameborder="0" 
                    style="border: none; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                </iframe>
            </div>
        `;
    } catch (error) {
        resultDiv.innerHTML = `<p class="error">❌ Eroare: ${error.message}</p>`;
    }
}
// Funcție care schimbă poza de fundal în funcție de vreme
function updateBackgroundImage(code) {
    let imageUrl = '';

    // 1. Senin / Soare
    if (code === 0 || code === 1) {
        imageUrl = 'https://images.unsplash.com/photo-1601297183305-6df142704ea2?auto=format&fit=crop&w=1920&q=80';
    } 
    // 2. Noros / Parțial noros
    else if (code === 2 || code === 3) {
        imageUrl = 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1920&q=80';
    } 
    // 3. Ceață
    else if (code === 45 || code === 48) {
        imageUrl = 'https://images.unsplash.com/photo-1487621167305-5d248087c724?auto=format&fit=crop&w=1920&q=80';
    } 
    // 4. Ploaie / Averse
    else if ((code >= 51 && code <= 65) || (code >= 80 && code <= 82)) {
        imageUrl = 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=1920&q=80';
    } 
    // 5. Ninsoare
    else if (code >= 71 && code <= 75) {
        imageUrl = 'https://images.unsplash.com/photo-1483664852095-d6cc6870702d?auto=format&fit=crop&w=1920&q=80';
    } 
    // 6. Furtună
    else if (code >= 95 && code <= 99) {
        imageUrl = 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?auto=format&fit=crop&w=1920&q=80';
    } 
    // Implicit
    else {
        imageUrl = 'https://images.unsplash.com/photo-1601297183305-6df142704ea2?auto=format&fit=crop&w=1920&q=80';
    }

    // Schimbăm poza de fundal menținând filtrul semi-transparent
    document.body.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)), url('${imageUrl}')`;
}
// 1. Căutare după numele orașului
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (!city) return;

    resultDiv.classList.remove('hidden');
    resultDiv.innerHTML = '<p class="loading">Se caută datele meteo...</p>';

    try {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=ro&format=json`;
        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error('Orașul nu a fost găsit!');
        }

        const location = geoData.results[0];
        const displayName = `${location.name}${location.country ? `, ${location.country}` : ''}`;
        
        await fetchWeatherByCoords(location.latitude, location.longitude, displayName);
    } catch (error) {
        resultDiv.innerHTML = `<p class="error">❌ Eroare: ${error.message}</p>`;
    }
});

// 2. Căutare după geolocația curentă (GPS)
geoBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
        alert('Geolocația nu este suportată de browserul tău.');
        return;
    }

    resultDiv.classList.remove('hidden');
    resultDiv.innerHTML = '<p class="loading">Obținem locația ta...</p>';

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            await fetchWeatherByCoords(latitude, longitude, '📍 Locația ta curentă');
        },
        (error) => {
            resultDiv.innerHTML = `<p class="error">❌ Nu s-a putut accesa locația. Verifică permisiunile browserului.</p>`;
        }
    );
});