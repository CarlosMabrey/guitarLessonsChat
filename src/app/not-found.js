export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="mb-6">The page you are looking for does not exist.</p>
      <a href="/" className="px-4 py-2 bg-blue-500 text-white rounded-md">
        Go Home
      </a>
    </div>
  )
} 