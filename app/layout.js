import '../src/styles/globals.css'
import Navbar from './components/Navbar'

export const metadata = {
  title: 'Guitar Learning App',
  description: 'Learn guitar with interactive tools',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <Navbar />
        <main>
          {children}
        </main>
      </body>
    </html>
  )
} 