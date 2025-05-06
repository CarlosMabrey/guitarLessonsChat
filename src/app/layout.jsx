import { Inter } from 'next/font/google'
import '../styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Guitar Learning Chatbot',
  description: 'AI-powered guitar learning app for song breakdowns and practice.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-text-primary min-h-screen`}>
        {children}
      </body>
    </html>
  )
} 