import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = 'primary', size = 'md', loading = false, disabled, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-full font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60'

    const variantClasses: Record<ButtonVariant, string> = {
      primary:
        'bg-brand-600 text-white shadow-soft hover:bg-brand-500 focus-visible:outline-brand-600 active:scale-[0.99] dark:bg-brand-500 dark:text-neutral-50 dark:hover:bg-brand-400',
      secondary:
        'border border-brand-200 bg-white text-brand-700 shadow-sm hover:border-brand-300 hover:bg-brand-50 focus-visible:outline-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:border-brand-400 dark:hover:bg-neutral-700',
      ghost:
        'text-brand-700 hover:bg-brand-50 focus-visible:outline-brand-400 border border-transparent dark:text-brand-200 dark:hover:bg-brand-400/10',
    }

    const sizeClasses: Record<ButtonSize, string> = {
      md: 'px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 text-xs sm:text-sm',
      lg: 'px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base',
    }

    return (
      <button
        ref={ref}
        className={clsx(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="mr-2 inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-transparent dark:border-neutral-200/40" />
        )}
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
