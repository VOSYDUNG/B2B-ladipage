import { cn } from '@/lib/utils'
import { SafeText } from '@/components/ui/safe-text'

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  className,
}: {
  eyebrow: string
  title: string
  description?: string
  align?: 'left' | 'center'
  className?: string
}) {
  return (
    <div className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center', className)}>
      <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.22em] text-emerald-700">{eyebrow}</p>
      <h2 className="text-balance text-3xl font-extrabold tracking-[-0.04em] text-emerald-950 sm:text-4xl lg:text-5xl">
        <SafeText text={title} />
      </h2>
      {description && (
        <p className="mt-5 text-pretty text-base leading-7 text-slate-600 sm:text-lg"><SafeText text={description} /></p>
      )}
    </div>
  )
}
