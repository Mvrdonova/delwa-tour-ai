# AI Travel Planner

**Author:** Mardonova Nigora  
**GitHub:** [https://github.com/mvrdonova](https://github.com/mvrdonova)

---

## Project Overview

AI Travel Planner is a comprehensive travel planning platform that leverages **artificial intelligence** and **real-time travel data** to provide personalized recommendations. Users input their **destination, travel dates, and budget**, and the system generates:

- Optimal **itinerary** based on duration and interests  
- Recommended **hotels** from platforms like Booking.com and other accommodation providers  
- Suggested **tour packages** from travel websites  
- Real-time **cost estimation** tailored to user budget  
- Dynamic **user preferences** tracking for future trips  

Additionally, the system integrates with a **Telegram bot**, allowing users to plan trips and receive recommendations directly within Telegram.

---

## Purpose

The goal of this project is to **simplify travel planning** while making it more personalized and intelligent. It solves the problem of:

- Users not knowing where to go or which packages/hotels are suitable  
- Budget and schedule constraints  
- Manual searching across multiple booking platforms  

By using AI, the platform provides **optimized and actionable travel plans**.

---

## Technologies Used

- **Frontend:** React, Next.js, Tailwind CSS  
- **Backend:** Node.js, Express  
- **Database:** MongoDB  
- **AI & NLP:** OpenAI API  
- **APIs:** Booking.com API, Expedia/Tripadvisor APIs (with dummy JSON data for prototyping)  
- **Telegram Bot:** Node.js + Telegraf.js for real-time interaction  
- **Other Tools:** Axios for API requests, server-side caching for performance  

---

## Key Features

1. **AI-Powered Recommendations** – Suggests destinations, hotels, and tour packages based on budget and preferences.  
2. **Dynamic Itinerary Generation** – AI creates optimized day-by-day travel plans.  
3. **Budget and Cost Estimation** – Calculates estimated costs, including hotel, tours, and transportation.  
4. **Multi-Platform Integration** – Fetches data from Booking.com, Expedia, Tripadvisor, and other travel websites.  
5. **User Preference Learning** – System adapts recommendations based on user history.  
6. **Telegram Bot Access** – Users can receive AI travel recommendations directly on Telegram.  

---

## Challenges & Solutions

**Challenge:** Accessing real-time hotel and tour data from multiple platforms.  
**Solution:** Integrated APIs where available; for restricted APIs, used dummy data structures and web scraping (if allowed) for prototyping.  

**Challenge:** Generating personalized itineraries for users with different budgets and preferences.  
**Solution:** Developed AI recommendation algorithms that optimize activities and packages based on inputs.  

**Challenge:** Integrating AI with both web frontend and Telegram bot.  
**Solution:** Created a unified backend service to handle AI requests, user data, and API calls, providing responses to both platforms.

---

## Learning Outcomes

- AI integration in multi-platform web applications  
- Working with external APIs and handling rate limits  
- Personalized recommendation systems and user preference tracking  
- Telegram bot development and real-time notifications  
- Budget-aware travel planning algorithms  

---

## Installation & Setup

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- OpenAI API key
- Telegram Bot Token (optional, for bot functionality)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/mvrdonova/delwa-tour-ai.git
cd delwa-tour-ai
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Set up environment variables:

**Backend (.env):**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-travel-planner
OPENAI_API_KEY=your_openai_api_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

5. Start MongoDB (if running locally):
```bash
mongod
```

6. Start the backend server:
```bash
cd backend
npm run dev
```

7. Start the frontend development server:
```bash
cd frontend
npm run dev
```

8. Start the Telegram bot (optional):
```bash
cd backend
npm run bot
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Telegram Bot: Active once started

---

## Project Structure

```
delwa-tour-ai/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # Next.js app router pages
│   │   ├── components/      # React components
│   │   ├── lib/             # Utility functions
│   │   └── styles/          # Global styles
│   ├── public/              # Static assets
│   └── package.json
├── backend/                  # Express backend server
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic (AI, APIs)
│   │   ├── middleware/      # Custom middleware
│   │   ├── bot/             # Telegram bot handlers
│   │   └── utils/           # Utility functions
│   ├── data/                # Dummy data for hotels/tours
│   └── package.json
└── README.md
```

---

## API Endpoints

### Travel Planning
- `POST /api/trips/plan` - Create a new travel plan
- `GET /api/trips/:id` - Get trip details
- `GET /api/trips/user/:userId` - Get user's trips

### Recommendations
- `POST /api/recommendations/itinerary` - Generate AI itinerary
- `POST /api/recommendations/hotels` - Get hotel recommendations
- `POST /api/recommendations/tours` - Get tour recommendations

### User Management
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/users/:id/preferences` - Get user preferences

---

## Usage Examples

### Web Application
1. Navigate to the homepage
2. Enter destination, travel dates, and budget
3. Select interests and preferences
4. View AI-generated itinerary and recommendations
5. Save trip for future reference

### Telegram Bot
1. Start a conversation with the bot
2. Use `/start` to begin
3. Follow prompts to enter trip details
4. Receive AI-generated recommendations
5. Save and manage trips via bot commands

---

## Contributing

This is a personal project, but suggestions and feedback are welcome!

---

## License

MIT License

---

## Contact

- **Author:** Mardonova Nigora
- **GitHub:** [@mvrdonova](https://github.com/mvrdonova)

---

**Built with ❤️ for intelligent travel planning**

