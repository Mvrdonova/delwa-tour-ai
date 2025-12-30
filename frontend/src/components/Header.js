'use client'

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">✈️</span>
            <h1 className="text-xl font-bold text-gray-900">AI Travel Planner</h1>
          </div>
          <nav className="flex space-x-4">
            <a href="/" className="text-gray-600 hover:text-gray-900">Home</a>
            <a href="/trips" className="text-gray-600 hover:text-gray-900">My Trips</a>
            <a href="/login" className="text-gray-600 hover:text-gray-900">Login</a>
          </nav>
        </div>
      </div>
    </header>
  )
}


