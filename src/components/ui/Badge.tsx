import { type HTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
    size?: 'sm' | 'md' | 'lg';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
    ({ children, variant = 'default', size = 'md', className, ...props }, ref) => {
        const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full';

        const variants = {
            default: 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-color)]',
            success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
            warning: 'bg-amber-50 text-amber-700 border border-amber-200',
            error: 'bg-red-50 text-red-700 border border-red-200',
            info: 'bg-blue-50 text-blue-700 border border-blue-200',
        };

        const sizes = {
            sm: 'px-2 py-0.5 text-xs',
            md: 'px-3 py-1 text-sm',
            lg: 'px-4 py-1.5 text-base',
        };

        return (
            <span
                ref={ref}
                className={clsx(
                    baseStyles,
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {children}
            </span>
        );
    }
);

Badge.displayName = 'Badge';

export default Badge;
