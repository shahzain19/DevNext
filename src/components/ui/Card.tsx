import { type HTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glass' | 'gradient';
    hover?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ children, variant = 'default', hover = false, padding = 'md', className, ...props }, ref) => {
        const baseStyles = 'rounded-xl transition-all duration-300';

        const variants = {
            default: 'bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm',
            glass: 'bg-white/80 backdrop-blur-xl border border-white/20 shadow-sm',
            gradient: 'bg-gradient-to-br from-white to-slate-50 border border-[var(--border-color)]',
        };

        const paddings = {
            none: '',
            sm: 'p-4',
            md: 'p-6',
            lg: 'p-8',
        };

        const hoverStyles = hover ? 'hover-lift hover:border-[var(--border-hover)] hover:shadow-xl cursor-pointer' : '';

        return (
            <div
                ref={ref}
                className={clsx(
                    baseStyles,
                    variants[variant],
                    paddings[padding],
                    hoverStyles,
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';

export default Card;
