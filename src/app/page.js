export default function Home() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        Welcome to Guitar Coach
      </h1>
      <p style={{ marginBottom: '2rem' }}>Your guitar learning journey starts here</p>
      <div>
        <a href="/dashboard" style={{ 
          backgroundColor: 'blue', 
          color: 'white', 
          padding: '0.5rem 1rem', 
          borderRadius: '0.25rem',
          textDecoration: 'none',
          marginRight: '0.5rem'
        }}>
          Dashboard
        </a>
        <a href="/songs" style={{ 
          backgroundColor: 'green', 
          color: 'white', 
          padding: '0.5rem 1rem', 
          borderRadius: '0.25rem',
          textDecoration: 'none',
          marginRight: '0.5rem'
        }}>
          Songs
        </a>
        <a href="/practice" style={{ 
          backgroundColor: 'purple', 
          color: 'white', 
          padding: '0.5rem 1rem', 
          borderRadius: '0.25rem',
          textDecoration: 'none'
        }}>
          Practice
        </a>
      </div>
    </div>
  );
} 