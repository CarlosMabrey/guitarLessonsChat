export default function TestPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
      <div className="max-w-md w-full">
        <h1 className="text-3xl font-bold text-text-primary mb-6">Tailwind CSS Test Page (Pages Router)</h1>
        
        <div className="bg-card p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Style Testing</h2>
          <p className="text-text-secondary mb-4">This paragraph should have secondary text color.</p>
          <p className="text-text-muted mb-4">This paragraph should have muted text color.</p>
          
          <div className="flex space-x-4 mb-4">
            <button className="btn btn-primary">Primary Button</button>
            <button className="btn btn-secondary">Secondary Button</button>
            <button className="btn btn-ghost">Ghost Button</button>
          </div>
          
          <div className="flex space-x-4">
            <div className="w-12 h-12 bg-primary rounded-md"></div>
            <div className="w-12 h-12 bg-secondary rounded-md"></div>
            <div className="w-12 h-12 bg-border rounded-md"></div>
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-md text-blue-700 border border-blue-200">
          <p className="font-medium">If you can see proper styling above, Tailwind CSS is working correctly in the Pages Router.</p>
        </div>
      </div>
    </div>
  );
} 