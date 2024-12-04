const express = require('express');
const router = express.Router();
const historicalDataController = require('../controllers/historicalData.controller');

router.get('/historicalData', historicalDataController.getHistoricalData);

module.exports = router;