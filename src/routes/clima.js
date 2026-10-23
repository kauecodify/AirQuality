const express = require('express');
const router = express.Router();
const climaController = require('../controllers/climaController');

// GET /api/clima - Get current weather data
router.get('/', climaController.getClimaData);

// GET /api/clima/forecast - Get 5-day forecast
router.get('/forecast', climaController.getClimaForecast);

// GET /api/clima/air-quality - Get air quality index
router.get('/air-quality', climaController.getAirQualityIndex);

module.exports = router;
