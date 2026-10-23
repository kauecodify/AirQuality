/**
 * AirQuality Monitor - Frontend JavaScript
 * Handles data fetching, chart rendering, form validation, and UI interactions
 */

// DOM Elements
const API_BASE = window.location.origin || 'http://localhost:3000';

// Chart reference
let co2Chart = null;

// Sensor locations for the map
const sensorLocations = [
    { lat: -23.5505, lon: -46.6333, name: 'Centro de São Paulo' },
    { lat: -23.5614, lon: -46.6558, name: 'Avenida Paulista' },
    { lat: -23.5729, lon: -46.6436, name: 'Jardins' },
    { lat: -23.5422, lon: -46.6758, name: 'Lapa' },
    { lat: -23.5849, lon: -46.6550, name: 'Itaim Bibi' },
    { lat: -23.5333, lon: -46.6944, name: 'Pinheiros' },
    { lat: -23.5958, lon: -46.6808, name: 'Vila Olímpia' },
    { lat: -23.5186, lon: -46.6742, name: 'Santana' }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeMobileMenu();
    initializeForm();
    fetchAndDisplayData();
    fetchWeatherData();
    fetchAirQualityIndex();
    fetchStatistics();
    
    // Refresh data every 30 seconds
    setInterval(fetchAndDisplayData, 30000);
    setInterval(fetchWeatherData, 300000); // Refresh weather every 5 minutes
    setInterval(fetchStatistics, 60000);
});

/**
 * Mobile Menu Toggle
 */
function initializeMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
            mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
            mobileMenu.setAttribute('aria-expanded', !isExpanded);
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                mobileMenu.setAttribute('aria-expanded', 'false');
            }
        });
        
        // Close menu when clicking on a link
        const mobileLinks = mobileMenu.querySelectorAll('.mobile-nav-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                mobileMenu.setAttribute('aria-expanded', 'false');
            });
        });
    }
}

/**
 * Form Validation and Submission
 */
function initializeForm() {
    const form = document.getElementById('newReadingForm');
    const co2Input = document.getElementById('co2');
    const umidadeInput = document.getElementById('umidade');
    const temperaturaInput = document.getElementById('temperatura');
    const latitudeInput = document.getElementById('latitude');
    const longitudeInput = document.getElementById('longitude');
    const submitBtn = document.getElementById('submitBtn');
    const formSuccess = document.getElementById('form-success');
    
    if (!form) return;

    // Real-time validation
    [co2Input, umidadeInput, temperaturaInput].forEach(input => {
        if (input) {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => clearError(input));
        }
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate all fields
        const isCo2Valid = validateField(co2Input);
        const isUmidadeValid = validateField(umidadeInput);
        const isTemperaturaValid = validateField(temperaturaInput);
        
        if (!isCo2Valid || !isUmidadeValid || !isTemperaturaValid) {
            return;
        }
        
        // Prepare data
        const formData = {
            co2: parseFloat(co2Input.value),
            umidade: parseFloat(umidadeInput.value),
            temperatura: parseFloat(temperaturaInput.value)
        };
        
        // Add location if provided
        if (latitudeInput && longitudeInput && latitudeInput.value && longitudeInput.value) {
            formData.localizacao = {
                type: 'Point',
                coordinates: [
                    parseFloat(longitudeInput.value),
                    parseFloat(latitudeInput.value)
                ]
            };
        }
        
        // Disable submit button
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
        
        try {
            // Submit to API
            const response = await fetch(`${API_BASE}/api/leituras`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || data.message || 'Erro ao enviar dados');
            }
            
            // Show success message
            formSuccess.textContent = 'Leitura adicionada com sucesso!';
            formSuccess.style.display = 'block';
            
            // Reset form
            form.reset();
            
            // Refresh data
            fetchAndDisplayData();
            fetchStatistics();
            
            // Hide success message after 3 seconds
            setTimeout(() => {
                formSuccess.style.display = 'none';
            }, 3000);
            
        } catch (error) {
            console.error('Error submitting form:', error);
            formSuccess.textContent = `Erro: ${error.message}`;
            formSuccess.style.display = 'block';
            formSuccess.style.background = '#f8d7da';
            formSuccess.style.color = '#721c24';
            formSuccess.style.borderColor = '#f5c6cb';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Adicionar Leitura';
        }
    });
}

/**
 * Field validation
 */
function validateField(input) {
    const errorElement = document.getElementById(`${input.id}-error`);
    let isValid = true;
    let errorMessage = '';
    
    if (!input.value) {
        errorMessage = 'Este campo é obrigatório';
        isValid = false;
    } else if (input.id === 'co2') {
        const value = parseFloat(input.value);
        if (isNaN(value)) {
            errorMessage = 'Valor inválido';
            isValid = false;
        } else if (value < 0 || value > 5000) {
            errorMessage = 'O valor deve estar entre 0 e 5000 ppm';
            isValid = false;
        }
    } else if (input.id === 'umidade') {
        const value = parseFloat(input.value);
        if (isNaN(value)) {
            errorMessage = 'Valor inválido';
            isValid = false;
        } else if (value < 0 || value > 100) {
            errorMessage = 'O valor deve estar entre 0 e 100%';
            isValid = false;
        }
    } else if (input.id === 'temperatura') {
        const value = parseFloat(input.value);
        if (isNaN(value)) {
            errorMessage = 'Valor inválido';
            isValid = false;
        } else if (value < -50 || value > 100) {
            errorMessage = 'O valor deve estar entre -50 e 100°C';
            isValid = false;
        }
    }
    
    if (errorElement) {
        errorElement.textContent = errorMessage;
    }
    
    // Update input validity state
    if (isValid) {
        input.setCustomValidity('');
        clearError(input);
    } else {
        input.setCustomValidity(errorMessage);
    }
    
    return isValid;
}

/**
 * Clear error for a field
 */
function clearError(input) {
    const errorElement = document.getElementById(`${input.id}-error`);
    if (errorElement) {
        errorElement.textContent = '';
    }
    input.classList.remove('error');
}

/**
 * Fetch and display all data
 */
async function fetchAndDisplayData() {
    try {
        const response = await fetch(`${API_BASE}/api/leituras`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            displayLatestReading(data.data[0]);
            displayReadingsTable(data.data);
            updateCO2Chart(data.data);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        // Display error in UI
        const latestReadingContent = document.getElementById('latestReading');
        if (latestReadingContent) {
            latestReadingContent.innerHTML = `
                <p style="color: #e74c3c;">Erro ao carregar dados: ${error.message}</p>
                <button onclick="fetchAndDisplayData()" style="margin-top: 10px; padding: 8px 16px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Tentar Novamente
                </button>
            `;
        }
    }
}

/**
 * Display latest reading
 */
function displayLatestReading(reading) {
    const latestReadingContent = document.getElementById('latestReading');
    
    if (!latestReadingContent) return;
    
    if (!reading) {
        latestReadingContent.innerHTML = '<p>Nenhuma leitura disponível</p>';
        return;
    }
    
    const date = new Date(reading.dataHora || reading.createdAt);
    const formattedDate = date.toLocaleString('pt-BR');
    
    latestReadingContent.innerHTML = `
        <div class="reading-item">
            <span class="reading-label">Data/Hora:</span>
            <span class="reading-value">${formattedDate}</span>
        </div>
        <div class="reading-item">
            <span class="reading-label">CO₂:</span>
            <span class="reading-value">${reading.co2.toFixed(1)}<span class="reading-unit">ppm</span></span>
        </div>
        <div class="reading-item">
            <span class="reading-label">Umidade:</span>
            <span class="reading-value">${reading.umidade.toFixed(1)}<span class="reading-unit">%</span></span>
        </div>
        <div class="reading-item">
            <span class="reading-label">Temperatura:</span>
            <span class="reading-value">${reading.temperatura.toFixed(1)}<span class="reading-unit">°C</span></span>
        </div>
        ${reading.localizacao && reading.localizacao.coordinates ? `
        <div class="reading-item">
            <span class="reading-label">Localização:</span>
            <span class="reading-value">
                ${reading.localizacao.coordinates[1].toFixed(4)}, ${reading.localizacao.coordinates[0].toFixed(4)}
            </span>
        </div>
        ` : ''}
    `;
}

/**
 * Display readings in table
 */
function displayReadingsTable(readings) {
    const tableBody = document.getElementById('readingsTableBody');
    
    if (!tableBody) return;
    
    if (!readings || readings.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5">Nenhuma leitura encontrada</td></tr>';
        return;
    }
    
    // Sort by date descending
    readings.sort((a, b) => new Date(b.dataHora || b.createdAt) - new Date(a.dataHora || a.createdAt));
    
    // Take only the first 10 readings
    const recentReadings = readings.slice(0, 10);
    
    tableBody.innerHTML = recentReadings.map(reading => {
        const date = new Date(reading.dataHora || reading.createdAt);
        const formattedDate = date.toLocaleString('pt-BR');
        
        return `
            <tr tabindex="0">
                <td>${formattedDate}</td>
                <td>${reading.co2.toFixed(1)}</td>
                <td>${reading.umidade.toFixed(1)}%</td>
                <td>${reading.temperatura.toFixed(1)}°C</td>
                <td>
                    <button class="action-btn delete" onclick="deleteReading('${reading._id}')" aria-label="Deletar leitura">
                        Deletar
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Delete a reading
 */
async function deleteReading(id) {
    if (!confirm('Tem certeza que deseja deletar esta leitura?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/leituras/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Erro ao deletar leitura');
        }
        
        // Refresh data
        fetchAndDisplayData();
        fetchStatistics();
        
    } catch (error) {
        console.error('Error deleting reading:', error);
        alert(`Erro ao deletar leitura: ${error.message}`);
    }
}

/**
 * Update CO2 Chart
 */
function updateCO2Chart(readings) {
    const chartCanvas = document.getElementById('co2Chart');
    
    if (!chartCanvas) return;
    
    // Sort by date
    readings.sort((a, b) => new Date(a.dataHora || a.createdAt) - new Date(b.dataHora || b.createdAt));
    
    // Extract data
    const labels = readings.map(reading => {
        const date = new Date(reading.dataHora || reading.createdAt);
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    });
    
    const data = readings.map(reading => reading.co2);
    
    // CO2 quality thresholds
    const backgroundColors = readings.map(reading => {
        if (reading.co2 < 400) return '#27ae60'; // Good
        if (reading.co2 < 1000) return '#f39c12'; // Moderate
        if (reading.co2 < 2000) return '#e67e22'; // Unhealthy
        return '#e74c3c'; // Very Unhealthy
    });
    
    // Destroy previous chart if exists
    if (co2Chart) {
        co2Chart.destroy();
    }
    
    // Create new chart
    co2Chart = new Chart(chartCanvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Nível de CO₂ (ppm)',
                data: data,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 2,
                pointBackgroundColor: backgroundColors,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#2c3e50',
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `CO₂: ${context.parsed.y.toFixed(1)} ppm`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'CO₂ (ppm)',
                        color: '#2c3e50'
                    },
                    ticks: {
                        color: '#7f8c8d'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Hora',
                        color: '#2c3e50'
                    },
                    ticks: {
                        color: '#7f8c8d',
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: {
                        display: false
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
    });
}

/**
 * Fetch weather data
 */
async function fetchWeatherData() {
    try {
        const response = await fetch(`${API_BASE}/api/clima`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            displayCurrentWeather(data.data);
            displayWeatherForecast();
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
        const currentWeatherContent = document.getElementById('currentWeather');
        if (currentWeatherContent) {
            currentWeatherContent.innerHTML = `
                <p style="color: #e74c3c;">Erro ao carregar dados climáticos: ${error.message}</p>
                <button onclick="fetchWeatherData()" style="margin-top: 10px; padding: 8px 16px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Tentar Novamente
                </button>
            `;
        }
    }
}

/**
 * Display current weather
 */
function displayCurrentWeather(weather) {
    const currentWeatherContent = document.getElementById('currentWeather');
    
    if (!currentWeatherContent) return;
    
    const date = new Date(weather.timestamp);
    const formattedDate = date.toLocaleString('pt-BR');
    
    currentWeatherContent.innerHTML = `
        <div class="weather-icon">
            <img src="https://openweathermap.org/img/wn/${weather.weather.icon}@2x.png" 
                 alt="${weather.weather.description}" 
                 style="width: 80px; height: 80px;"
                 loading="lazy">
        </div>
        <div class="weather-temp">${weather.temperature.toFixed(1)}°C</div>
        <div class="weather-description">${weather.weather.description}</div>
        <div style="font-size: 1.1rem; color: #7f8c8d; margin-bottom: 15px;">
            ${weather.city}, ${weather.country}
        </div>
        <div class="weather-details">
            <div class="weather-detail">
                <span class="weather-detail-label">Sensação:</span>
                <span class="weather-detail-value">${weather.feelsLike.toFixed(1)}°C</span>
            </div>
            <div class="weather-detail">
                <span class="weather-detail-label">Umidade:</span>
                <span class="weather-detail-value">${weather.humidity}%</span>
            </div>
            <div class="weather-detail">
                <span class="weather-detail-label">Pressão:</span>
                <span class="weather-detail-value">${weather.pressure}hPa</span>
            </div>
            <div class="weather-detail">
                <span class="weather-detail-label">Vento:</span>
                <span class="weather-detail-value">${weather.windSpeed}m/s</span>
            </div>
        </div>
        <div style="font-size: 0.8rem; color: #7f8c8d; margin-top: 10px;">
            Atualizado: ${formattedDate}
        </div>
    `;
}

/**
 * Display weather forecast
 */
async function displayWeatherForecast() {
    try {
        const response = await fetch(`${API_BASE}/api/clima/forecast`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            const forecastContent = document.getElementById('weatherForecast');
            
            if (forecastContent) {
                forecastContent.innerHTML = data.data.map(day => `
                    <div class="forecast-day">
                        <div class="forecast-date">${day.date}</div>
                        <div class="forecast-temp">${day.avgTemp}°C</div>
                        <div class="forecast-weather">${day.mostCommonWeather}</div>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error fetching forecast:', error);
    }
}

/**
 * Fetch air quality index
 */
async function fetchAirQualityIndex() {
    try {
        const response = await fetch(`${API_BASE}/api/clima/air-quality`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            displayAirQualityIndex(data.data);
        }
    } catch (error) {
        console.error('Error fetching AQI:', error);
    }
}

/**
 * Display air quality index
 */
function displayAirQualityIndex(aqi) {
    const aqiContent = document.getElementById('airQualityIndex');
    
    if (!aqiContent) return;
    
    // Determine AQI level color
    let levelColor = '#27ae60'; // Green
    if (aqi.aqi > 100) levelColor = '#f39c12'; // Orange
    if (aqi.aqi > 200) levelColor = '#e67e22'; // Dark Orange
    if (aqi.aqi > 300) levelColor = '#e74c3c'; // Red
    if (aqi.aqi > 400) levelColor = '#9b59b6'; // Purple
    
    const date = new Date(aqi.timestamp);
    const formattedDate = date.toLocaleString('pt-BR');
    
    aqiContent.innerHTML = `
        <div class="aqi-value" style="color: ${levelColor}">${aqi.aqi}</div>
        <div class="aqi-level" style="background: ${levelColor}; color: white;">${aqi.level}</div>
        <div class="aqi-recommendation">${aqi.recommendations}</div>
        <div style="font-size: 0.8rem; color: #7f8c8d; margin-top: 10px;">
            Atualizado: ${formattedDate}
        </div>
        <div style="margin-top: 15px; width: 100%;">
            <h5 style="margin-bottom: 10px; color: #2c3e50;">Principais Poluentes:</h5>
            <div class="weather-details">
                <div class="weather-detail">
                    <span class="weather-detail-label">CO:</span>
                    <span class="weather-detail-value">${aqi.pollutants.co.toFixed(2)} ppm</span>
                </div>
                <div class="weather-detail">
                    <span class="weather-detail-label">NO₂:</span>
                    <span class="weather-detail-value">${aqi.pollutants.no2.toFixed(2)} ppm</span>
                </div>
                <div class="weather-detail">
                    <span class="weather-detail-label">O₃:</span>
                    <span class="weather-detail-value">${aqi.pollutants.o3.toFixed(2)} ppm</span>
                </div>
                <div class="weather-detail">
                    <span class="weather-detail-label">PM2.5:</span>
                    <span class="weather-detail-value">${aqi.pollutants.pm2_5.toFixed(2)} µg/m³</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Fetch statistics
 */
async function fetchStatistics() {
    try {
        const response = await fetch(`${API_BASE}/api/leituras/stats`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data.statistics) {
            displayStatistics(data.data);
        }
    } catch (error) {
        console.error('Error fetching statistics:', error);
    }
}

/**
 * Display statistics
 */
function displayStatistics(data) {
    const stats = data.statistics;
    const latest = data.latest;
    
    // Update CO2 stats
    if (stats.avgCO2 !== undefined) {
        document.getElementById('avgCO2').textContent = stats.avgCO2.toFixed(1);
        document.getElementById('maxCO2').textContent = (stats.maxCO2 || 0).toFixed(1);
        document.getElementById('minCO2').textContent = (stats.minCO2 || 0).toFixed(1);
    }
    
    // Update Umidade stats
    if (stats.avgUmidade !== undefined) {
        document.getElementById('avgUmidade').textContent = stats.avgUmidade.toFixed(1);
        document.getElementById('maxUmidade').textContent = (stats.maxUmidade || 0).toFixed(1);
        document.getElementById('minUmidade').textContent = (stats.minUmidade || 0).toFixed(1);
    }
    
    // Update Temperatura stats
    if (stats.avgTemperatura !== undefined) {
        document.getElementById('avgTemperatura').textContent = stats.avgTemperatura.toFixed(1);
        document.getElementById('maxTemperatura').textContent = (stats.maxTemperatura || 0).toFixed(1);
        document.getElementById('minTemperatura').textContent = (stats.minTemperatura || 0).toFixed(1);
    }
    
    // Update total readings
    if (stats.count !== undefined) {
        document.getElementById('totalReadings').textContent = stats.count;
    }
}

/**
 * Initialize the sensor map
 * This is a placeholder for a real map implementation
 */
function initializeMap() {
    const sensorMap = document.getElementById('sensorMap');
    
    if (!sensorMap) return;
    
    // In a real implementation, you would use Leaflet, Google Maps, or Mapbox
    // For now, we'll create a simple visualization
    sensorMap.innerHTML = `
        <svg viewBox="0 0 800 400" style="width: 100%; height: 100%; background: #f5f5f5;">
            ${sensorLocations.map((loc, index) => {
                // Scale coordinates to fit the SVG
                const x = ((loc.lon + 46.7) / 0.1) * 800;
                const y = ((-23.5 + loc.lat) / 0.1) * 400;
                return `
                    <circle cx="${x}" cy="${y}" r="8" fill="#e74c3c" opacity="0.7">
                        <title>${loc.name}: Sensor de Qualidade do Ar</title>
                    </circle>
                    <text x="${x + 15}" y="${y}" font-size="12" fill="#2c3e50">${loc.name}</text>
                `;
            }).join('')}
        </svg>
    `;
}

// Initialize map when DOM is loaded
window.addEventListener('load', initializeMap);

// Make functions globally available for onclick handlers
window.deleteReading = deleteReading;
