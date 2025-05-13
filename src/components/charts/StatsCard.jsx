import { clsx } from 'clsx';

// Map of color names to their corresponding Tailwind classes
const colorMap = {
  primary: 'bg-primary',
  info: 'bg-info',
  success: 'bg-success',
  danger: 'bg-danger',
  warning: 'bg-warning',
};

export default function StatsCard({ title, value, icon, color = 'primary', className, ...props }) {
  // Use the color map to get the appropriate class, with a fallback
  const colorClass = colorMap[color] || colorMap.primary;
  
  return (
    <div 
      className={clsx(
        'flex flex-col items-center p-4 rounded-lg bg-card border border-border',
        className
      )}
      {...props}
    >
      <div className={clsx('w-full h-1 rounded-full mb-4 bg-background-light overflow-hidden')}>
        <div 
          className={clsx('h-full rounded-full', colorClass)} 
          style={{ width: '100%' }}
        />
      </div>
      
      <div className="text-4xl font-bold">{value}</div>
      <div className="text-text-secondary text-sm mt-1">{title}</div>
    </div>
  );
} 