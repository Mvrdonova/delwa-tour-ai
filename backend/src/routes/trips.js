const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const authMiddleware = require('../middleware/auth');
const recommendationService = require('../services/recommendationService');

// Create a new travel plan
router.post('/plan', authMiddleware, async (req, res) => {
  try {
    const { destination, startDate, endDate, budget, interests } = req.body;
    const userId = req.userId;

    // Create trip
    const trip = new Trip({
      userId,
      destination,
      startDate,
      endDate,
      budget,
      interests: interests || [],
      status: 'draft'
    });

    await trip.save();

    // Generate recommendations
    const recommendations = await recommendationService.generateRecommendations({
      destination,
      startDate,
      endDate,
      budget,
      interests
    });

    // Update trip with recommendations
    trip.itinerary = recommendations.itinerary;
    trip.recommendedHotels = recommendations.hotels;
    trip.recommendedTours = recommendations.tours;
    trip.costEstimate = recommendations.costEstimate;
    trip.status = 'planned';

    await trip.save();

    res.status(201).json({
      message: 'Travel plan created successfully',
      trip
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get trip by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id).populate('userId', 'username email');
    
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    // Check if user owns this trip
    if (trip.userId._id.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all trips for a user
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    // Check if user is accessing their own trips
    if (req.params.userId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const trips = await Trip.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });

    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update trip
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    if (trip.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    Object.assign(trip, req.body);
    await trip.save();

    res.json({ message: 'Trip updated successfully', trip });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete trip
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    if (trip.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Trip.findByIdAndDelete(req.params.id);

    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


