const OpenAI = require('openai');
const hotelService = require('./hotelService');
const tourService = require('./tourService');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Generate AI-powered itinerary
async function generateItinerary({ destination, startDate, endDate, budget, interests }) {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    const prompt = `Create a ${days}-day travel itinerary for ${destination} with a budget of $${budget}. 
    Interests: ${interests.join(', ') || 'general sightseeing'}. 
    Provide a day-by-day plan with activities, times, locations, and estimated costs. 
    Format as JSON with this structure:
    [
      {
        "day": 1,
        "date": "${startDate}",
        "activities": [
          {
            "time": "09:00",
            "activity": "Activity name",
            "location": "Location",
            "cost": 50,
            "description": "Description"
          }
        ]
      }
    ]`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a travel planning expert. Always respond with valid JSON only, no additional text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const responseText = completion.choices[0].message.content.trim();
    // Remove markdown code blocks if present
    const jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const itinerary = JSON.parse(jsonText);

    return itinerary;
  } catch (error) {
    console.error('Error generating itinerary:', error);
    // Fallback to default itinerary if AI fails
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return generateDefaultItinerary(destination, startDate, endDate, days);
  }
}

// Generate complete recommendations (itinerary + hotels + tours)
async function generateRecommendations({ destination, startDate, endDate, budget, interests }) {
  try {
    // Generate itinerary
    const itinerary = await generateItinerary({ destination, startDate, endDate, budget, interests });

    // Get hotel recommendations
    const hotels = await hotelService.getRecommendations({
      destination,
      budget,
      checkIn: startDate,
      checkOut: endDate
    });

    // Get tour recommendations
    const tours = await tourService.getRecommendations({
      destination,
      budget,
      interests
    });

    // Calculate cost estimate
    const costEstimate = calculateCostEstimate(itinerary, hotels, tours, budget);

    return {
      itinerary,
      hotels: hotels.slice(0, 5), // Top 5 hotels
      tours: tours.slice(0, 5), // Top 5 tours
      costEstimate
    };
  } catch (error) {
    console.error('Error generating recommendations:', error);
    throw error;
  }
}

// Calculate cost estimate
function calculateCostEstimate(itinerary, hotels, tours, budget) {
  let hotelsCost = 0;
  let toursCost = 0;
  let activitiesCost = 0;
  let transportationCost = 0;
  let foodCost = 0;

  // Calculate from itinerary activities
  if (itinerary && Array.isArray(itinerary)) {
    itinerary.forEach(day => {
      if (day.activities && Array.isArray(day.activities)) {
        day.activities.forEach(activity => {
          activitiesCost += activity.cost || 0;
        });
      }
    });
  }

  // Calculate hotel costs (average of recommended hotels)
  if (hotels && hotels.length > 0) {
    const avgHotelPrice = hotels.reduce((sum, h) => sum + (h.price || 0), 0) / hotels.length;
    const nights = itinerary ? itinerary.length : 3;
    hotelsCost = avgHotelPrice * nights;
  }

  // Calculate tour costs
  if (tours && tours.length > 0) {
    toursCost = tours.slice(0, 3).reduce((sum, t) => sum + (t.price || 0), 0);
  }

  // Estimate transportation (10% of budget)
  transportationCost = budget * 0.1;

  // Estimate food (20% of budget)
  foodCost = budget * 0.2;

  const total = hotelsCost + toursCost + activitiesCost + transportationCost + foodCost;

  return {
    hotels: Math.round(hotelsCost),
    tours: Math.round(toursCost),
    activities: Math.round(activitiesCost),
    transportation: Math.round(transportationCost),
    food: Math.round(foodCost),
    total: Math.round(total)
  };
}

// Generate default itinerary if AI fails
function generateDefaultItinerary(destination, startDate, endDate, days) {
  const itinerary = [];
  const start = new Date(startDate);

  for (let i = 0; i < days; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);

    itinerary.push({
      day: i + 1,
      date: date.toISOString().split('T')[0],
      activities: [
        {
          time: '09:00',
          activity: 'Breakfast',
          location: 'Hotel',
          cost: 15,
          description: 'Start your day with breakfast'
        },
        {
          time: '10:30',
          activity: 'City Tour',
          location: destination,
          cost: 50,
          description: 'Explore the main attractions'
        },
        {
          time: '14:00',
          activity: 'Lunch',
          location: 'Local Restaurant',
          cost: 25,
          description: 'Enjoy local cuisine'
        },
        {
          time: '16:00',
          activity: 'Free Time',
          location: destination,
          cost: 0,
          description: 'Explore at your own pace'
        },
        {
          time: '19:00',
          activity: 'Dinner',
          location: 'Restaurant',
          cost: 40,
          description: 'Evening meal'
        }
      ]
    });
  }

  return itinerary;
}

module.exports = {
  generateItinerary,
  generateRecommendations
};

