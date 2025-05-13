export async function GET() {
  return new Response(JSON.stringify({
    message: 'API route is working',
    time: new Date().toISOString(),
    appRouter: true
  }), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
} 