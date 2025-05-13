import { Inter } from 'next/font/google'
import '../styles/globals-fixed.css'
import { ThemeProvider } from "../components/ui/ThemeContext";

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Guitar Learning Chatbot',
  description: 'AI-powered guitar learning app for song breakdowns and practice.',
}

export default function RootLayout({ children }) {
  return (
    // initialize html with default glassmorphism theme
    <html lang="en" className="theme-glassmorphism">  
      <body className={`${inter.className} bg-background text-text-primary min-h-screen`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}