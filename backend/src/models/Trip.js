const mongoose = require('mongoose');

const itineraryDaySchema = new mongoose.Schema({
  day: Number,
  date: Date,
  activities: [{
    time: String,
    activity: String,
    location: String,
    cost: Number,
    description: String
  }]
});

const tripSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  budget: {
    type: Number,
    required: true
  },
  interests: [String],
  itinerary: [itineraryDaySchema],
  recommendedHotels: [{
    name: String,
    price: Number,
    rating: Number,
    location: String,
    amenities: [String],
    bookingUrl: String,
    source: String // 'booking.com', 'expedia', etc.
  }],
  recommendedTours: [{
    name: String,
    price: Number,
    duration: String,
    description: String,
    bookingUrl: String,
    source: String
  }],
  costEstimate: {
    hotels: Number,
    tours: Number,
    transportation: Number,
    food: Number,
    total: Number
  },
  status: {
    type: String,
    enum: ['draft', 'planned', 'completed'],
    default: 'draft'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Trip', tripSchema);

