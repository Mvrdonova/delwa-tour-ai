const axios = require('axios');
const NodeCache = require('node-cache');
const hotelCache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

// Dummy hotel data (fallback when APIs are unavailable)
const dummyHotels = require('../../data/dummyHotels.json');

// Get hotel recommendations
async function getRecommendations({ destination, budget, checkIn, checkOut, preferences = {} }) {
  try {
    const cacheKey = `hotels_${destination}_${budget}`;
    const cached = hotelCache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    // Try to fetch from Booking.com API (if available)
    // For now, we'll use dummy data
    let hotels = [];

    // Filter dummy hotels by destination
    hotels = dummyHotels
      .filter(hotel => 
        hotel.destinations.includes(destination.toLowerCase()) ||
        hotel.destinations.includes('all')
      )
      .map(hotel => ({
        name: hotel.name,
        price: calculatePrice(hotel.basePrice, budget, preferences),
        rating: hotel.rating,
        location: hotel.location,
        amenities: hotel.amenities,
        bookingUrl: hotel.bookingUrl || `https://booking.com/hotel/${hotel.id}`,
        source: hotel.source || 'booking.com',
        image: hotel.image
      }))
      .filter(hotel => hotel.price <= budget * 0.4) // Hotels should be max 40% of budget
      .sort((a, b) => {
        // Sort by rating and price relevance
        if (preferences.travelStyle === 'luxury') {
          return b.rating - a.rating;
        } else if (preferences.travelStyle === 'budget') {
          return a.price - b.price;
        }
        return (b.rating * 2) - (a.price / 100);
      });

    // Cache results
    hotelCache.set(cacheKey, hotels);

    return hotels;
  } catch (error) {
    console.error('Error fetching hotels:', error);
    // Return filtered dummy data as fallback
    return dummyHotels
      .filter(h => h.destinations.includes(destination.toLowerCase()) || h.destinations.includes('all'))
      .slice(0, 10)
      .map(h => ({
        name: h.name,
        price: h.basePrice,
        rating: h.rating,
        location: h.location,
        amenities: h.amenities,
        bookingUrl: h.bookingUrl,
        source: h.source
      }));
  }
}

// Calculate price based on budget and preferences
function calculatePrice(basePrice, budget, preferences) {
  let price = basePrice;

  if (preferences.travelStyle === 'luxury') {
    price = basePrice * 1.5;
  } else if (preferences.travelStyle === 'budget') {
    price = basePrice * 0.7;
  }

  // Ensure price doesn't exceed budget constraints
  const maxPrice = budget * 0.4;
  return Math.min(price, maxPrice);
}

// Search hotels by name or location
async function searchHotels(query, destination) {
  const hotels = await getRecommendations({ destination, budget: 1000 });
  return hotels.filter(hotel =>
    hotel.name.toLowerCase().includes(query.toLowerCase()) ||
    hotel.location.toLowerCase().includes(query.toLowerCase())
  );
}

module.exports = {
  getRecommendations,
  searchHotels
};


