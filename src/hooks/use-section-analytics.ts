import { useEffect } from 'react'
import {
  ANALYTICS_EVENT_CHANNEL,
  trackEvent,
  type AnalyticsPayload,
} from '@/lib/analytics'

const SECTION_SELECTOR = '[data-analytics-section]'
const CTA_EVENTS = new Set([
  'click_posm',
  'download_catalog',
  'hero_cta_click',
  'order_cta_click',
  'question_start',
  'referral_share',
  'sample_request_open',
  'select_promotion',
  'whatsapp_click',
])

type InternalAnalyticsEvent = CustomEvent<{
  name?: string
  params?: Record<string, string | number | boolean>
}>

export function useSectionAnalytics(params: AnalyticsPayload) {
  useEffect(() => {
    const sections = new Set<HTMLElement>()

    const startedAt = performance.now()
    const sectionStartedAt = new Map<string, number>()
    const viewedSections = new Set<string>()
    let deepestSectionId = 'top'
    let deepestSectionOrder = 0
    let maxScrollPercent = 0
    let ctaClicked = false
    let formStarted = false
    let summarySent = false

    const sectionContext = (section: HTMLElement) => ({
      section_id: section.dataset.analyticsSection || 'unknown',
      section_order: Number(section.dataset.sectionOrder || 0),
    })

    const stopSectionTimer = (section: HTMLElement) => {
      const context = sectionContext(section)
      const enteredAt = sectionStartedAt.get(context.section_id)
      if (enteredAt === undefined) return

      sectionStartedAt.delete(context.section_id)
      const dwellMs = Math.round(performance.now() - enteredAt)
      if (dwellMs < 250) return
      void trackEvent('section_engagement', {
        ...params,
        ...context,
        dwell_ms: dwellMs,
      })
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const section = entry.target as HTMLElement
          const context = sectionContext(section)

          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            if (!viewedSections.has(context.section_id)) {
              viewedSections.add(context.section_id)
              void trackEvent('section_view', {
                ...params,
                ...context,
                visibility_percent: 50,
              })
            }
            if (!sectionStartedAt.has(context.section_id)) {
              sectionStartedAt.set(context.section_id, performance.now())
            }
            if (context.section_order >= deepestSectionOrder) {
              deepestSectionOrder = context.section_order
              deepestSectionId = context.section_id
            }
          } else {
            stopSectionTimer(section)
          }
        })
      },
      { threshold: [0, 0.5] },
    )

    const observeSection = (section: HTMLElement) => {
      if (sections.has(section)) return
      sections.add(section)
      observer.observe(section)
    }

    document.querySelectorAll<HTMLElement>(SECTION_SELECTOR).forEach(observeSection)

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return
          if (node.matches(SECTION_SELECTOR)) observeSection(node)
          node.querySelectorAll<HTMLElement>(SECTION_SELECTOR).forEach(observeSection)
        })
        mutation.removedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return
          const removed = [
            ...(node.matches(SECTION_SELECTOR) ? [node] : []),
            ...node.querySelectorAll<HTMLElement>(SECTION_SELECTOR),
          ]
          removed.forEach((section) => {
            stopSectionTimer(section)
            observer.unobserve(section)
            sections.delete(section)
          })
        })
      })
    })
    mutationObserver.observe(document.body, { childList: true, subtree: true })

    const updateScrollDepth = () => {
      const scrollableHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight
      if (scrollableHeight <= 0) {
        maxScrollPercent = 100
        return
      }
      const percent = Math.round(
        ((window.scrollY || document.documentElement.scrollTop) / scrollableHeight) * 100,
      )
      maxScrollPercent = Math.max(maxScrollPercent, Math.min(100, percent))
    }

    const handleInternalEvent = (event: Event) => {
      const detail = (event as InternalAnalyticsEvent).detail
      if (!detail?.name) return
      if (detail.name === 'form_start') formStarted = true
      if (CTA_EVENTS.has(detail.name)) ctaClicked = true
    }

    const flushVisibleSections = () => {
      sections.forEach(stopSectionTimer)
    }

    const sendSummary = () => {
      if (summarySent) return
      const engagedTimeMs = Math.round(performance.now() - startedAt)
      if (engagedTimeMs < 1000) return

      summarySent = true
      updateScrollDepth()
      flushVisibleSections()
      void trackEvent('page_engagement_summary', {
        ...params,
        max_scroll_percent: maxScrollPercent,
        deepest_section_id: deepestSectionId,
        engaged_time_ms: engagedTimeMs,
        sections_viewed: viewedSections.size,
        cta_clicked: ctaClicked,
        form_started: formStarted,
      })
    }

    updateScrollDepth()
    window.addEventListener('scroll', updateScrollDepth, { passive: true })
    window.addEventListener(ANALYTICS_EVENT_CHANNEL, handleInternalEvent)
    window.addEventListener('pagehide', sendSummary)

    return () => {
      mutationObserver.disconnect()
      observer.disconnect()
      window.removeEventListener('scroll', updateScrollDepth)
      window.removeEventListener(ANALYTICS_EVENT_CHANNEL, handleInternalEvent)
      window.removeEventListener('pagehide', sendSummary)
      sendSummary()
    }
  }, [params])
}
