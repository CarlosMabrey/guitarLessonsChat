'use client';

export default function AppRouterIndicator({ pageName }) {
  return (
    <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center">
      <div className="w-3 h-3 bg-white rounded-full mr-2 animate-pulse"></div>
      <span>App Router: {pageName} Page</span>
    </div>
  );
} 