const axios = require('axios');
const NodeCache = require('node-cache');
const tourCache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

// Dummy tour data (fallback when APIs are unavailable)
const dummyTours = require('../../data/dummyTours.json');

// Get tour recommendations
async function getRecommendations({ destination, budget, interests = [], duration }) {
  try {
    const cacheKey = `tours_${destination}_${budget}_${interests.join('_')}`;
    const cached = tourCache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    // Try to fetch from TripAdvisor/Expedia API (if available)
    // For now, we'll use dummy data
    let tours = [];

    // Filter dummy tours by destination and interests
    tours = dummyTours
      .filter(tour => {
        const matchesDestination = 
          tour.destinations.includes(destination.toLowerCase()) ||
          tour.destinations.includes('all');
        
        const matchesInterests = interests.length === 0 ||
          tour.categories.some(cat => 
            interests.some(interest => 
              cat.toLowerCase().includes(interest.toLowerCase())
            )
          );

        return matchesDestination && matchesInterests;
      })
      .map(tour => ({
        name: tour.name,
        price: calculatePrice(tour.basePrice, budget),
        duration: tour.duration,
        description: tour.description,
        bookingUrl: tour.bookingUrl || `https://tripadvisor.com/tour/${tour.id}`,
        source: tour.source || 'tripadvisor',
        rating: tour.rating,
        image: tour.image,
        categories: tour.categories
      }))
      .filter(tour => tour.price <= budget * 0.3) // Tours should be max 30% of budget
      .sort((a, b) => {
        // Sort by rating and price relevance
        return (b.rating * 2) - (a.price / 50);
      });

    // Cache results
    tourCache.set(cacheKey, tours);

    return tours;
  } catch (error) {
    console.error('Error fetching tours:', error);
    // Return filtered dummy data as fallback
    return dummyTours
      .filter(t => 
        t.destinations.includes(destination.toLowerCase()) || 
        t.destinations.includes('all')
      )
      .slice(0, 10)
      .map(t => ({
        name: t.name,
        price: t.basePrice,
        duration: t.duration,
        description: t.description,
        bookingUrl: t.bookingUrl,
        source: t.source,
        rating: t.rating
      }));
  }
}

// Calculate price based on budget
function calculatePrice(basePrice, budget) {
  const maxPrice = budget * 0.3;
  return Math.min(basePrice, maxPrice);
}

// Search tours by name or category
async function searchTours(query, destination) {
  const tours = await getRecommendations({ destination, budget: 1000 });
  return tours.filter(tour =>
    tour.name.toLowerCase().includes(query.toLowerCase()) ||
    tour.categories.some(cat => cat.toLowerCase().includes(query.toLowerCase()))
  );
}

module.exports = {
  getRecommendations,
  searchTours
};


