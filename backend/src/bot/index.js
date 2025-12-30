const { Telegraf } = require('telegraf');
const axios = require('axios');
const User = require('../models/User');
const Trip = require('../models/Trip');
const recommendationService = require('../services/recommendationService');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Store user sessions
const userSessions = new Map();

// Start command
bot.start(async (ctx) => {
  const telegramId = ctx.from.id.toString();
  
  // Check if user exists
  let user = await User.findOne({ telegramId });
  
  if (!user) {
    // Create new user or link existing account
    ctx.reply(
      `👋 Welcome to AI Travel Planner!\n\n` +
      `I can help you plan your perfect trip. To get started:\n\n` +
      `1. Use /plan to create a new travel plan\n` +
      `2. Use /help to see all commands\n\n` +
      `Note: For full features, register at our web app first.`
    );
  } else {
    ctx.reply(
      `Welcome back, ${user.username}! 👋\n\n` +
      `Use /plan to create a new travel plan.`
    );
  }
});

// Help command
bot.help((ctx) => {
  ctx.reply(
    `📋 Available Commands:\n\n` +
    `/start - Start the bot\n` +
    `/plan - Create a new travel plan\n` +
    `/mytrips - View your saved trips\n` +
    `/help - Show this help message`
  );
});

// Plan trip command
bot.command('plan', (ctx) => {
  const userId = ctx.from.id.toString();
  
  // Initialize session
  userSessions.set(userId, {
    step: 'destination',
    data: {}
  });

  ctx.reply(
    `✈️ Let's plan your trip!\n\n` +
    `Please enter your destination:`
  );
});

// Handle text messages for trip planning
bot.on('text', async (ctx) => {
  const userId = ctx.from.id.toString();
  const session = userSessions.get(userId);

  if (!session) {
    return; // Not in planning mode
  }

  const text = ctx.message.text;

  switch (session.step) {
    case 'destination':
      session.data.destination = text;
      session.step = 'startDate';
      ctx.reply('📅 Enter your start date (YYYY-MM-DD):');
      break;

    case 'startDate':
      if (!isValidDate(text)) {
        ctx.reply('❌ Invalid date format. Please use YYYY-MM-DD:');
        return;
      }
      session.data.startDate = text;
      session.step = 'endDate';
      ctx.reply('📅 Enter your end date (YYYY-MM-DD):');
      break;

    case 'endDate':
      if (!isValidDate(text)) {
        ctx.reply('❌ Invalid date format. Please use YYYY-MM-DD:');
        return;
      }
      if (new Date(text) <= new Date(session.data.startDate)) {
        ctx.reply('❌ End date must be after start date. Please try again:');
        return;
      }
      session.data.endDate = text;
      session.step = 'budget';
      ctx.reply('💰 Enter your budget (in USD):');
      break;

    case 'budget':
      const budget = parseFloat(text);
      if (isNaN(budget) || budget <= 0) {
        ctx.reply('❌ Please enter a valid budget amount:');
        return;
      }
      session.data.budget = budget;
      session.step = 'interests';
      ctx.reply(
        '🎯 Enter your interests (comma-separated, e.g., "sightseeing, food, adventure"):\n' +
        'Or type "skip" to continue with default interests.'
      );
      break;

    case 'interests':
      session.data.interests = text.toLowerCase() === 'skip' 
        ? [] 
        : text.split(',').map(i => i.trim());
      session.step = 'generating';
      
      // Generate recommendations
      ctx.reply('🤖 Generating your personalized travel plan... This may take a moment.');
      
      try {
        await generateAndSendPlan(ctx, userId, session.data);
        userSessions.delete(userId);
      } catch (error) {
        console.error('Error generating plan:', error);
        ctx.reply('❌ Sorry, there was an error generating your plan. Please try again with /plan');
        userSessions.delete(userId);
      }
      break;
  }
});

// Generate and send travel plan
async function generateAndSendPlan(ctx, userId, tripData) {
  try {
    // Find or create user
    let user = await User.findOne({ telegramId: userId });
    
    if (!user) {
      // Create a basic user for Telegram
      user = new User({
        username: `telegram_${userId}`,
        email: `telegram_${userId}@telegram.local`,
        password: Math.random().toString(36), // Random password
        telegramId: userId
      });
      await user.save();
    }

    // Generate recommendations
    const recommendations = await recommendationService.generateRecommendations(tripData);

    // Create trip
    const trip = new Trip({
      userId: user._id,
      ...tripData,
      itinerary: recommendations.itinerary,
      recommendedHotels: recommendations.hotels,
      recommendedTours: recommendations.tours,
      costEstimate: recommendations.costEstimate,
      status: 'planned'
    });
    await trip.save();

    // Send summary
    let message = `✨ Your Travel Plan is Ready!\n\n`;
    message += `📍 Destination: ${tripData.destination}\n`;
    message += `📅 Dates: ${tripData.startDate} to ${tripData.endDate}\n`;
    message += `💰 Budget: $${tripData.budget}\n\n`;
    message += `💵 Cost Estimate:\n`;
    message += `  Hotels: $${recommendations.costEstimate.hotels}\n`;
    message += `  Tours: $${recommendations.costEstimate.tours}\n`;
    message += `  Activities: $${recommendations.costEstimate.activities}\n`;
    message += `  Transportation: $${recommendations.costEstimate.transportation}\n`;
    message += `  Food: $${recommendations.costEstimate.food}\n`;
    message += `  Total: $${recommendations.costEstimate.total}\n\n`;

    // Send itinerary summary
    if (recommendations.itinerary && recommendations.itinerary.length > 0) {
      message += `📋 Itinerary Preview (Day 1):\n`;
      const day1 = recommendations.itinerary[0];
      if (day1.activities && day1.activities.length > 0) {
        day1.activities.slice(0, 3).forEach(activity => {
          message += `  ${activity.time} - ${activity.activity}\n`;
        });
      }
    }

    ctx.reply(message);

    // Send top hotels
    if (recommendations.hotels && recommendations.hotels.length > 0) {
      let hotelsMsg = `🏨 Top Hotels:\n\n`;
      recommendations.hotels.slice(0, 3).forEach((hotel, idx) => {
        hotelsMsg += `${idx + 1}. ${hotel.name}\n`;
        hotelsMsg += `   💰 $${hotel.price}/night | ⭐ ${hotel.rating}\n`;
        hotelsMsg += `   📍 ${hotel.location}\n\n`;
      });
      ctx.reply(hotelsMsg);
    }

    // Send top tours
    if (recommendations.tours && recommendations.tours.length > 0) {
      let toursMsg = `🎯 Top Tours:\n\n`;
      recommendations.tours.slice(0, 3).forEach((tour, idx) => {
        toursMsg += `${idx + 1}. ${tour.name}\n`;
        toursMsg += `   💰 $${tour.price} | ⏱ ${tour.duration}\n\n`;
      });
      ctx.reply(toursMsg);
    }

    ctx.reply(
      `✅ Your trip has been saved!\n\n` +
      `View full details and manage your trips at our web app.`
    );

  } catch (error) {
    console.error('Error in generateAndSendPlan:', error);
    throw error;
  }
}

// My trips command
bot.command('mytrips', async (ctx) => {
  const telegramId = ctx.from.id.toString();
  
  try {
    const user = await User.findOne({ telegramId });
    
    if (!user) {
      ctx.reply('❌ No account found. Please use /plan to create your first trip.');
      return;
    }

    const trips = await Trip.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    if (trips.length === 0) {
      ctx.reply('📭 You don\'t have any saved trips yet. Use /plan to create one!');
      return;
    }

    let message = `📋 Your Recent Trips:\n\n`;
    trips.forEach((trip, idx) => {
      message += `${idx + 1}. ${trip.destination}\n`;
      message += `   ${trip.startDate.toISOString().split('T')[0]} - ${trip.endDate.toISOString().split('T')[0]}\n`;
      message += `   Budget: $${trip.budget}\n\n`;
    });

    ctx.reply(message);
  } catch (error) {
    console.error('Error fetching trips:', error);
    ctx.reply('❌ Error fetching your trips. Please try again.');
  }
});

// Helper function to validate date
function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

// Error handling
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('❌ An error occurred. Please try again.');
});

// Start bot
if (process.env.TELEGRAM_BOT_TOKEN) {
  bot.launch()
    .then(() => {
      console.log('✅ Telegram bot is running');
    })
    .catch((error) => {
      console.error('❌ Telegram bot error:', error);
    });

  // Graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
} else {
  console.log('⚠️ Telegram bot token not provided. Bot will not start.');
}

module.exports = bot;


