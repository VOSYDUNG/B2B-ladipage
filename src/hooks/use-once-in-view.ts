import { useEffect, useRef } from 'react'

export function useOnceInView<T extends HTMLElement>(onVisible: () => void, threshold = 0.5) {
  const ref = useRef<T | null>(null)
  const fired = useRef(false)

  useEffect(() => {
    const node = ref.current
    if (!node || fired.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fired.current) {
          fired.current = true
          onVisible()
          observer.disconnect()
        }
      },
      { threshold },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [onVisible, threshold])

  return ref
}
