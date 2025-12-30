const express = require('express');
const router = express.Router();
const recommendationService = require('../services/recommendationService');
const hotelService = require('../services/hotelService');
const tourService = require('../services/tourService');

// Generate AI itinerary
router.post('/itinerary', async (req, res) => {
  try {
    const { destination, startDate, endDate, budget, interests } = req.body;

    const itinerary = await recommendationService.generateItinerary({
      destination,
      startDate,
      endDate,
      budget,
      interests: interests || []
    });

    res.json({ itinerary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get hotel recommendations
router.post('/hotels', async (req, res) => {
  try {
    const { destination, budget, checkIn, checkOut, preferences } = req.body;

    const hotels = await hotelService.getRecommendations({
      destination,
      budget,
      checkIn,
      checkOut,
      preferences: preferences || {}
    });

    res.json({ hotels });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get tour recommendations
router.post('/tours', async (req, res) => {
  try {
    const { destination, budget, interests, duration } = req.body;

    const tours = await tourService.getRecommendations({
      destination,
      budget,
      interests: interests || [],
      duration
    });

    res.json({ tours });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


