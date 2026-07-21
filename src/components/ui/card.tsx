import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-[1.75rem] border border-emerald-950/8 bg-white shadow-[0_24px_80px_rgba(15,81,50,.08)]',
        className,
      )}
      {...props}
    />
  ),
)
Card.displayName = 'Card'
