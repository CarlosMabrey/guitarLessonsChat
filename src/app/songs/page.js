export default function SongsPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Songs</h1>
      <p>This is a simple songs page.</p>
      
      <div style={{ marginTop: '2rem' }}>
        <a href="/" style={{ 
          backgroundColor: 'blue', 
          color: 'white', 
          padding: '0.5rem 1rem', 
          borderRadius: '0.25rem',
          textDecoration: 'none',
          marginRight: '0.5rem'
        }}>
          Back to Home
        </a>
        <a href="/dashboard" style={{ 
          backgroundColor: 'green', 
          color: 'white', 
          padding: '0.5rem 1rem', 
          borderRadius: '0.25rem',
          textDecoration: 'none'
        }}>
          Dashboard
        </a>
      </div>
    </div>
  );
} 