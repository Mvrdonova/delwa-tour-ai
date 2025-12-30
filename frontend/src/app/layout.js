import './globals.css'

export const metadata = {
  title: 'AI Travel Planner',
  description: 'Plan your perfect trip with AI-powered recommendations',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}


