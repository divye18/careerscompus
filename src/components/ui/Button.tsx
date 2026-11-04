import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-base disabled:pointer-events-none disabled:opacity-50';
    
    const variants = {
      primary: 'bg-primary-brand text-white hover:opacity-90',
      secondary: 'bg-slate-100 text-text-primary hover:bg-slate-200',
      outline: 'border border-border-default bg-transparent hover:bg-slate-50 text-text-primary',
      ghost: 'hover:bg-slate-100 hover:text-text-primary text-text-primary bg-transparent',
      link: 'text-accent-base underline-offset-4 hover:underline bg-transparent',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 py-2 text-sm',
      lg: 'h-12 px-8 text-base',
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
