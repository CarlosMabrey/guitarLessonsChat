import { clsx } from 'clsx';

export default function Card({ children, className, ...props }) {
  return (
    <div
      className={clsx(
        'bg-card hover:bg-card-hover border border-border rounded-lg shadow-card transition-all duration-300',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div 
      className={clsx('flex items-center justify-between p-5 pb-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }) {
  return (
    <h3 
      className={clsx('text-lg font-medium text-text-primary', className)} 
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardContent({ children, className, ...props }) {
  return (
    <div 
      className={clsx('px-5 pb-5', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }) {
  return (
    <div 
      className={clsx('flex items-center justify-between px-5 py-4 border-t border-border', className)}
      {...props}
    >
      {children}
    </div>
  );
}