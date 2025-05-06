import { clsx } from 'clsx';

export default function Card({ children, className, ...props }) {
  return (
    <div 
      className={clsx('card p-5', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div 
      className={clsx('flex items-center justify-between mb-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }) {
  return (
    <h3 
      className={clsx('sub-heading', className)} 
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardContent({ children, className, ...props }) {
  return (
    <div 
      className={clsx('', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }) {
  return (
    <div 
      className={clsx('flex items-center justify-between mt-4 pt-4 border-t border-border', className)}
      {...props}
    >
      {children}
    </div>
  );
} 