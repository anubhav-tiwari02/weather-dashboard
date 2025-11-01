const searchFormEl = document.querySelector('#search-form');
const searchInputEl = document.querySelector('#search-input');
const loaderEl = document.querySelector('#loader');
const errorContainerEl = document.querySelector('#error-container');
const cityNameEl = document.querySelector('#city-name-date');
const temperatureEl = document.querySelector('#temperature');
const humidityEl = document.querySelector('#humidity');
const windSpeedEl = document.querySelector('#wind-speed');
const forecastContainerEl = document.querySelector('#forecast-container');
const historyContainerEl = document.querySelector('#history-container');



// 🌤️ Display current weather
function displayCurrentWeather(data) {
  const currentDate = new Date().toLocaleDateString();
  cityNameEl.textContent = `${data.name} (${currentDate})`;
  temperatureEl.textContent = `Temperature: ${Math.round(data.main.temp)} °C`;
  humidityEl.textContent = `Humidity: ${data.main.humidity}%`;
  windSpeedEl.textContent = `Wind Speed: ${data.wind.speed} km/h`;

  // 🎨 Add weather icon dynamically (using Weather Icons)
  const existingIcon = document.querySelector('#weather-icon');
  if (!existingIcon) {
    const iconEl = document.createElement('i');
    iconEl.id = 'weather-icon';
    cityNameEl.insertAdjacentElement('afterend', iconEl);
  }

  const weatherIconEl = document.querySelector('#weather-icon');
  const iconMap = {
    '01d': 'wi-day-sunny',
    '01n': 'wi-night-clear',
    '02d': 'wi-day-cloudy',
    '02n': 'wi-night-alt-cloudy',
    '03d': 'wi-cloud',
    '03n': 'wi-cloud',
    '04d': 'wi-cloudy',
    '04n': 'wi-cloudy',
    '09d': 'wi-showers',
    '09n': 'wi-showers',
    '10d': 'wi-day-rain',
    '10n': 'wi-night-alt-rain',
    '11d': 'wi-thunderstorm',
    '11n': 'wi-thunderstorm',
    '13d': 'wi-snow',
    '13n': 'wi-snow',
    '50d': 'wi-fog',
    '50n': 'wi-fog'
  };

  const iconCode = data.weather[0].icon;
  weatherIconEl.className = `wi ${iconMap[iconCode] || 'wi-day-sunny'}`;
  weatherIconEl.style.fontSize = '60px';
  weatherIconEl.style.color = '#00b4d8';
  weatherIconEl.style.display = 'block';
  weatherIconEl.style.marginTop = '10px';
}

// 🌈 Display 5-day forecast
function displayForecast(forecastList) {
  forecastContainerEl.innerHTML = '';

  const iconMap = {
    '01d': 'wi-day-sunny',
    '01n': 'wi-night-clear',
    '02d': 'wi-day-cloudy',
    '02n': 'wi-night-alt-cloudy',
    '03d': 'wi-cloud',
    '03n': 'wi-cloud',
    '04d': 'wi-cloudy',
    '04n': 'wi-cloudy',
    '09d': 'wi-showers',
    '09n': 'wi-showers',
    '10d': 'wi-day-rain',
    '10n': 'wi-night-alt-rain',
    '11d': 'wi-thunderstorm',
    '11n': 'wi-thunderstorm',
    '13d': 'wi-snow',
    '13n': 'wi-snow',
    '50d': 'wi-fog',
    '50n': 'wi-fog'
  };

  for (let i = 0; i < forecastList.length; i += 8) {
    const dailyForecast = forecastList[i];
    const card = document.createElement('div');
    card.classList.add('forecast-card');

    const date = new Date(dailyForecast.dt_txt);
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    const dateEl = document.createElement('h3');
    dateEl.textContent = date.toLocaleDateString('en-GB', options);

    const iconCode = dailyForecast.weather[0].icon;
    const iconEl = document.createElement('i');
    iconEl.classList.add('wi', iconMap[iconCode] || 'wi-day-sunny');
    iconEl.style.fontSize = '48px';
    iconEl.style.color = '#00b4d8';

    const tempEl = document.createElement('p');
    tempEl.textContent = `Temp: ${Math.round(dailyForecast.main.temp)} °C`;
    tempEl.style.color = '#004aad';

    const humidityEl = document.createElement('p');
    humidityEl.textContent = `Humidity: ${dailyForecast.main.humidity}%`;
    humidityEl.style.color = '#004aad';

    card.append(dateEl, iconEl, tempEl, humidityEl);
    forecastContainerEl.append(card);
  }
}

// 💾 Save search history
function saveCityToHistory(city) {
  const historyString = localStorage.getItem('weatherHistory') || '[]';
  let history = JSON.parse(historyString);

  history = history.filter(
    (existingCity) => existingCity.toLowerCase() !== city.toLowerCase()
  );
  history.unshift(city);
  if (history.length > 10) history = history.slice(0, 10);

  localStorage.setItem('weatherHistory', JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem('weatherHistory') || '[]');
  historyContainerEl.innerHTML = '';
  for (const city of history) {
    const btn = document.createElement('button');
    btn.textContent = city;
    btn.classList.add('history-btn');
    btn.dataset.city = city;
    historyContainerEl.append(btn);
  }
}

// 🌍 Fetch weather by city
async function fetchWeather(city) {
  try {
    errorContainerEl.classList.add('hidden');
    loaderEl.classList.remove('hidden');

    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;

    const responses = await Promise.all([
      fetch(currentWeatherUrl),
      fetch(forecastUrl),
    ]);

    for (const response of responses) {
      if (!response.ok) throw new Error('City not found. Try again.');
    }

    const [currentWeather, forecast] = await Promise.all(
      responses.map((r) => r.json())
    );

    displayCurrentWeather(currentWeather);
    displayForecast(forecast.list);
    saveCityToHistory(currentWeather.name);
  } catch (error) {
    console.error('Error fetching weather:', error);
    errorContainerEl.textContent = error.message;
    errorContainerEl.classList.remove('hidden');
  } finally {
    loaderEl.classList.add('hidden');
  }
}

// 🔍 Search & history buttons
searchFormEl.addEventListener('submit', (e) => {
  e.preventDefault();
  const city = searchInputEl.value.trim();
  if (city) {
    fetchWeather(city);
    searchInputEl.value = '';
  }
});

historyContainerEl.addEventListener('click', (e) => {
  if (e.target.matches('.history-btn')) {
    fetchWeather(e.target.dataset.city);
  }
});

// 📍 Auto fetch weather using location
async function fetchWeatherByCoords(lat, lon) {
  try {
    errorContainerEl.classList.add('hidden');
    loaderEl.classList.remove('hidden');

    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

    const responses = await Promise.all([
      fetch(currentWeatherUrl),
      fetch(forecastUrl),
    ]);

    for (const response of responses) {
      if (!response.ok)
        throw new Error('Could not fetch weather data for your location.');
    }

    const [currentWeather, forecast] = await Promise.all(
      responses.map((r) => r.json())
    );

    displayCurrentWeather(currentWeather);
    displayForecast(forecast.list);
    saveCityToHistory(currentWeather.name);
  } catch (error) {
    console.error(error);
    errorContainerEl.textContent =
      'Failed to fetch weather for your location. Please search manually.';
    errorContainerEl.classList.remove('hidden');
  } finally {
    loaderEl.classList.add('hidden');
  }
}

// 🧭 Initialize
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
    },
    (err) => {
      console.warn('Location access denied, showing default city.');
      fetchWeather('London');
    }
  );
} else {
  fetchWeather('London');
}

renderHistory();

// 🌗 Theme toggle
const themeToggle = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('theme');

if (currentTheme === 'dark') {
  document.body.classList.add('dark-mode');
  themeToggle.textContent = '☀️ Light Mode';
}

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const isDarkMode = document.body.classList.contains('dark-mode');
  themeToggle.textContent = isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode';
  localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
});

