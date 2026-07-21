import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-emerald-900/10 bg-white/75 px-3 py-1 text-xs font-bold text-emerald-950 backdrop-blur',
        className,
      )}
      {...props}
    />
  )
}
