const form = document.getElementById('weather-form');
const cityInput = document.getElementById('city-input');
const resultDiv = document.getElementById('weather-result');

// Dicționar coduri meteo
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

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (!city) return;


    resultDiv.classList.remove('hidden');
    resultDiv.innerHTML = '<p class="loading">Se caută datele meteo...</p>';

    try {
        //  Coordonatele locatiei
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=ro&format=json`;
        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error('Orașul nu a fost găsit!');
        }

        const location = geoData.results[0];
        const { latitude, longitude, name, country } = location;

        // PASUL 2: Preluăm vremea actuală folosind coordonatele obținute
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        if (!weatherData.current_weather) {
            throw new Error('Nu s-au putut prelua datele meteo.');
        }

        const current = weatherData.current_weather;
        const weatherInfo = getWeatherDescription(current.weathercode);

        // PASUL 3: Afișăm rezultatele în interfață
        resultDiv.innerHTML = `
            <h2 class="city-name">${name}${country ? `, ${country}` : ''}</h2>
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
        `;

    } catch (error) {
        resultDiv.innerHTML = `<p class="error">❌ Eroare: ${error.message}</p>`;
    }
});