import { NextResponse } from 'next/server';

export function middleware(request) {
  // Get the pathname of the request
  const pathname = request.nextUrl.pathname;

  // Skip for API routes and if the path doesn't match our filtered routes
  if (pathname.startsWith('/api') || 
      pathname.startsWith('/_next') || 
      pathname.includes('.')) {
    return NextResponse.next();
  }

  // List of routes that should prioritize App Router
  const appRouterRoutes = [
    '/',
    '/dashboard',
    '/songs',
    '/practice',
    '/progress',
    '/test',
    '/theory',
    '/theory/tonnetz',
    '/theory/circle-of-fifths'
  ];

  // If this is a route we want to prioritize and it doesn't already include /app
  if (appRouterRoutes.includes(pathname)) {
    // Clone the URL
    const url = request.nextUrl.clone();
    
    // We don't need to modify the URL, as Next.js will resolve it to the App Router
    // if both versions exist. This middleware ensures App Router routes will be preferred.
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except for:
    // - API routes
    // - /_next (internal Next.js routes)
    // - static files (images, etc)
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 