import { redirect } from 'next/navigation';

// This redirects the home page to the dashboard page using the App Router
export default function HomePage() {
  redirect('/dashboard');
} 