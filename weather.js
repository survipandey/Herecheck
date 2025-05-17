const API_KEY = "8011f844fdd1d6e4608f0a46072d7d16";

const form = document.querySelector("form");
const search = document.querySelector("#search");
const weather = document.querySelector("#weather");
const petalContainer = document.getElementById('petal-container');

function createPetal(color) {
  const petal = document.createElement('div');
  petal.classList.add('petal');
  petal.style.background = color;
  petal.style.left = Math.random() * 100 + 'vw';  // random horizontal start
  petal.style.animationDuration = (4 + Math.random() * 4) + 's';  // random speed
  petal.style.animationDelay = (Math.random() * 6) + 's'; // random delay
  petalContainer.appendChild(petal);

  // Remove petal after animation finishes to avoid overflow
  setTimeout(() => {
    petal.remove();
  }, 10000);
}

function showPetals(weatherType) {
  // Clear old petals
  petalContainer.innerHTML = '';

  let color = 'pink';  // default

  // Set petal color depending on weather type
  switch (weatherType.toLowerCase()) {
    case 'clear':
    case 'sunny':
      color = '#FFD700'; // golden yellow petals for sun
      break;
    case 'rain':
    case 'rainy':
      color = '#00BFFF'; // blue petals for rain
      break;
    case 'clouds':
    case 'cloudy':
      color = '#ccc'; // gray petals for clouds
      break;
    case 'snow':
      color = '#fff'; // white petals for snow
      break;
    default:
      color = 'pink'; // generic petals
  }

  // Create multiple petals every 300ms, total 15 petals
  let count = 0;
  const maxPetals = 15;
  const interval = setInterval(() => {
    createPetal(color);
    count++;
    if (count >= maxPetals) clearInterval(interval);
  }, 300);
}

const getWeathername = async (city) => {
    weather.innerHTML=`<h2>Loading....</h2>`
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

  const response = await fetch(url);
  const data = await response.json();
   console.log("API response data:", data);

  if (response.status === 404 || data.cod === "404") {
    weather.innerHTML = `<h2>City not found</h2>`;
    petalContainer.innerHTML = '';  // clear petals if city not found
    return;
  }

  showWeather(data);
};
function updateBackground(weatherType) {
  const body = document.body;
  switch (weatherType.toLowerCase()) {
    case 'clear':
      body.style.background = 'linear-gradient(135deg, #fceabb, #f8b500)';
      break;
    case 'rain':
      body.style.background = 'linear-gradient(135deg, #3a6073, #16222a)';
      break;
    case 'clouds':
      body.style.background = 'linear-gradient(135deg, #d7d2cc, #304352)';
      break;
    case 'snow':
      body.style.background = 'linear-gradient(135deg, #e6dada, #274046)';
      break;
    default:
      body.style.background = 'linear-gradient(135deg, #74ebd5, #9face6)';
  }
}
async function showHourlyForecast(lat, lon) {
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  const res = await fetch(forecastUrl);
  const data = await res.json();

  const hours = data.list.slice(0, 12).map(item => {
    const date = new Date(item.dt * 1000);
    return date.getHours() + ":00";
  });

  const temps = data.list.slice(0, 12).map(item => item.main.temp);

  const ctx = document.getElementById('forecastChart').getContext('2d');
  if (window.weatherChart) {
    window.weatherChart.destroy(); // clear previous chart
  }

  window.weatherChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: hours,
      datasets: [{
        label: 'Temperature (°C)',
        data: temps,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: '#e67e22',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: "#2c3e50", font: { size: 14 } }
        }
      },
      scales: {
        x: {
          ticks: { color: "#34495e" }
        },
        y: {
          beginAtZero: false,
          ticks: { color: "#34495e" }
        }
      }
    }
  });
}

const showWeather = (data) => {
  updateBackground(data.weather[0].main);

  if (data.cod == "404") {
    weather.innerHTML = `<h2> City Not Found</h2>`;
    petalContainer.innerHTML = '';
    return;
  }

  weather.innerHTML = `
    <div>
      <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather Icon" />
    </div>
    <div>
      <h2>${data.main.temp.toFixed(1)}°C</h2>
      <h4>${data.weather[0].description}</h4>
      <p><strong>Feels like:</strong> ${data.main.feels_like.toFixed(1)}°C</p>
      <p><strong>Location:</strong> ${data.name}, ${data.sys.country}</p>
 
    </div>
  `;

  showPetals(data.weather[0].main);
};


window.addEventListener("load", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;

        weather.innerHTML = `<h2>Loading...</h2>`;

        try {
          const response = await fetch(url);
          const data = await response.json();
          showWeather(data);
        } catch (error) {
          weather.innerHTML = `<h2>Location Fetch Failed</h2>`;
          console.error(error);
        }
      },
      () => {
        weather.innerHTML = `<h2>Location Access Denied</h2>`;
      }
    );
  } else {
    weather.innerHTML = `<h2>Geolocation Not Supported</h2>`;
  }
});

form.addEventListener("submit", function (event) {
  getWeathername(search.value.trim());
  event.preventDefault();
});
