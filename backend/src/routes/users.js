const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// Get user preferences
router.get('/:id/preferences', authMiddleware, async (req, res) => {
  try {
    if (req.params.id !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      preferences: user.preferences || {
        interests: [],
        budgetRange: { min: 0, max: 0 },
        travelStyle: 'mid-range',
        preferredActivities: []
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user preferences
router.put('/:id/preferences', authMiddleware, async (req, res) => {
  try {
    if (req.params.id !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.preferences = { ...user.preferences, ...req.body };
    await user.save();

    res.json({
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Link Telegram account
router.post('/:id/telegram', authMiddleware, async (req, res) => {
  try {
    if (req.params.id !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { telegramId } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.telegramId = telegramId;
    await user.save();

    res.json({
      message: 'Telegram account linked successfully',
      telegramId: user.telegramId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


