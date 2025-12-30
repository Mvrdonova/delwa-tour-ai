'use client'

export default function TripResults({ data }) {
  if (!data || !data.itinerary) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4">Your Travel Itinerary</h2>
      
      {data.itinerary.map((day, index) => (
        <div key={index} className="mb-6 pb-6 border-b last:border-b-0">
          <h3 className="text-xl font-semibold text-primary-700 mb-3">
            Day {day.day} - {new Date(day.date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          
          <div className="space-y-3">
            {day.activities && day.activities.map((activity, actIndex) => (
              <div key={actIndex} className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-16 text-sm font-medium text-primary-600">
                  {activity.time}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{activity.activity}</h4>
                  <p className="text-sm text-gray-600">{activity.location}</p>
                  {activity.description && (
                    <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                  )}
                </div>
                <div className="flex-shrink-0 text-sm font-medium text-gray-700">
                  ${activity.cost || 0}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="mt-6 p-4 bg-primary-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">Quick Tips</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Book hotels in advance for better rates</li>
          <li>• Check local weather forecasts before your trip</li>
          <li>• Keep some buffer time between activities</li>
          <li>• Save this itinerary for easy access during your trip</li>
        </ul>
      </div>
    </div>
  )
}


