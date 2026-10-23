const axios = require('axios');

// Get weather data from OpenWeatherMap API
const getClimaData = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    // Default coordinates for Sao Paulo, Brazil
    const latitude = lat || -23.5505;
    const longitude = lon || -46.6333;

    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'Chave da API OpenWeatherMap não configurada'
      });
    }

    // Fetch weather data
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=pt_br`
    );

    const weatherData = response.data;

    // Extract relevant information
    const climaInfo = {
      city: weatherData.name,
      country: weatherData.sys.country,
      temperature: weatherData.main.temp,
      feelsLike: weatherData.main.feels_like,
      humidity: weatherData.main.humidity,
      pressure: weatherData.main.pressure,
      windSpeed: weatherData.wind.speed,
      windDirection: weatherData.wind.deg,
      weather: {
        description: weatherData.weather[0].description,
        icon: weatherData.weather[0].icon
      },
      coordinates: {
        lat: weatherData.coord.lat,
        lon: weatherData.coord.lon
      },
      timestamp: new Date(weatherData.dt * 1000)
    };

    res.status(200).json({
      success: true,
      data: climaInfo
    });
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      return res.status(error.response.status).json({
        success: false,
        error: 'Erro ao buscar dados climáticos',
        message: error.response.data.message || 'API retornou um erro'
      });
    } else if (error.request) {
      // The request was made but no response was received
      return res.status(503).json({
        success: false,
        error: 'Serviço de clima indisponível',
        message: 'Não foi possível conectar à API OpenWeatherMap'
      });
    } else {
      // Something happened in setting up the request
      return res.status(500).json({
        success: false,
        error: 'Erro ao processar solicitação',
        message: error.message
      });
    }
  }
};

// Get forecast data
const getClimaForecast = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    const latitude = lat || -23.5505;
    const longitude = lon || -46.6333;

    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'Chave da API OpenWeatherMap não configurada'
      });
    }

    // Fetch 5-day forecast
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=pt_br`
    );

    const forecastData = response.data;

    // Group forecast by day
    const dailyForecast = {};
    forecastData.list.forEach(item => {
      const date = new Date(item.dt * 1000).toLocaleDateString('pt-BR');
      if (!dailyForecast[date]) {
        dailyForecast[date] = {
          date,
          temps: [],
          humidity: [],
          weather: []
        };
      }
      dailyForecast[date].temps.push(item.main.temp);
      dailyForecast[date].humidity.push(item.main.humidity);
      dailyForecast[date].weather.push(item.weather[0].description);
    });

    // Calculate daily averages
    const processedForecast = Object.values(dailyForecast).map(day => ({
      date: day.date,
      avgTemp: (day.temps.reduce((a, b) => a + b, 0) / day.temps.length).toFixed(1),
      avgHumidity: (day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length).toFixed(1),
      mostCommonWeather: day.weather.sort((a, b) => 
        day.weather.filter(v => v === a).length - day.weather.filter(v => v === b).length
      )[0]
    }));

    res.status(200).json({
      success: true,
      data: processedForecast
    });
  } catch (error) {
    console.error('Error fetching forecast data:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar previsão do tempo',
      message: error.message
    });
  }
};

// Get air quality index (simulated)
const getAirQualityIndex = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    // Simulate air quality index based on CO2 levels
    // In a real implementation, this would come from an actual API
    const simulatedAQI = {
      aqi: Math.floor(Math.random() * 500) + 1, // Random AQI between 1-500
      level: ['Bom', 'Moderado', 'Ruim', 'Muito Ruim', 'Péssimo'][Math.floor(Math.random() * 5)],
      pollutants: {
        co: Math.random() * 10,
        no2: Math.random() * 100,
        o3: Math.random() * 200,
        pm2_5: Math.random() * 100,
        pm10: Math.random() * 200
      },
      recommendations: [
        'Mantenha janelas fechadas',
        'Evite exercícios ao ar livre',
        'Use máscara em ambientes externos',
        'Monitore grupos sensíveis'
      ][Math.floor(Math.random() * 4)],
      timestamp: new Date()
    };

    res.status(200).json({
      success: true,
      data: simulatedAQI
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro ao calcular índice de qualidade do ar',
      message: error.message
    });
  }
};

module.exports = {
  getClimaData,
  getClimaForecast,
  getAirQualityIndex
};
