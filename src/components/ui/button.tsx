import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-emerald-700 text-white shadow-[0_12px_30px_rgba(21,128,61,.22)] hover:-translate-y-0.5 hover:bg-emerald-800',
        secondary:
          'border border-emerald-900/10 bg-white text-emerald-950 shadow-sm hover:border-emerald-700/30 hover:bg-emerald-50',
        ghost: 'text-emerald-950 hover:bg-emerald-50',
        gold: 'bg-amber-400 text-emerald-950 shadow-lg hover:-translate-y-0.5 hover:bg-amber-300',
      },
      size: {
        sm: 'min-h-9 px-4 text-xs',
        md: 'min-h-11 px-5',
        lg: 'min-h-13 px-7 text-base',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
)
Button.displayName = 'Button'
