import Link from 'next/link';

export default function DebugPage() {
  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '2rem',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{ 
        fontSize: '2rem', 
        fontWeight: 'bold', 
        marginBottom: '1rem' 
      }}>
        Debug Page (Pages Router)
      </h1>
      
      <div style={{ 
        padding: '1rem', 
        background: '#dbeafe', 
        borderRadius: '0.5rem', 
        marginBottom: '2rem'
      }}>
        <p><strong>Success!</strong> This page is being served from the Pages Router (/pages/debug.js)</p>
      </div>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Navigation:
        </h2>
        <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>
            <Link href="/" style={{ color: 'blue', textDecoration: 'underline' }}>
              Home
            </Link>
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <Link href="/dashboard" style={{ color: 'blue', textDecoration: 'underline' }}>
              Dashboard
            </Link>
          </li>
        </ul>
      </div>
      
      <div style={{ fontSize: '0.875rem', color: '#666' }}>
        <p>Note: This is a fallback page. Ideally, you would access the debug page via the App Router.</p>
      </div>
    </div>
  );
} 