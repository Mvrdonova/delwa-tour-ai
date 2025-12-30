'use client'

import { useState } from 'react'
import TravelPlannerForm from '@/components/TravelPlannerForm'
import TripResults from '@/components/TripResults'
import Header from '@/components/Header'

export default function Home() {
  const [tripData, setTripData] = useState(null)
  const [loading, setLoading] = useState(false)

  const handlePlanTrip = async (formData) => {
    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/recommendations/itinerary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to generate travel plan')
      }

      const data = await response.json()
      setTripData(data)
    } catch (error) {
      console.error('Error planning trip:', error)
      alert('Error generating travel plan. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              AI Travel Planner
            </h1>
            <p className="text-gray-600">
              Plan your perfect trip with AI-powered recommendations
            </p>
          </div>

          <TravelPlannerForm onSubmit={handlePlanTrip} loading={loading} />
          
          {tripData && <TripResults data={tripData} />}
        </div>
      </div>
    </main>
  )
}


