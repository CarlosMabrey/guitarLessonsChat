export default function Dashboard() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Dashboard</h1>
      <p>This is a simple dashboard page without any complex imports or components.</p>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '1rem',
        marginTop: '2rem'
      }}>
        <div style={{ 
          padding: '1.5rem', 
          backgroundColor: '#f0f9ff', 
          borderRadius: '0.5rem',
          border: '1px solid #bfdbfe'
        }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Songs Added</h2>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>15</p>
        </div>
        
        <div style={{ 
          padding: '1.5rem', 
          backgroundColor: '#f0fdf4', 
          borderRadius: '0.5rem',
          border: '1px solid #bbf7d0'
        }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>In Progress</h2>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>8</p>
        </div>
        
        <div style={{ 
          padding: '1.5rem', 
          backgroundColor: '#faf5ff', 
          borderRadius: '0.5rem',
          border: '1px solid #e9d5ff'
        }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Mastered</h2>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>3</p>
        </div>
      </div>
      
      <div style={{ marginTop: '2rem' }}>
        <a href="/" style={{ 
          backgroundColor: 'blue', 
          color: 'white', 
          padding: '0.5rem 1rem', 
          borderRadius: '0.25rem',
          textDecoration: 'none'
        }}>
          Back to Home
        </a>
      </div>
    </div>
  );
} 