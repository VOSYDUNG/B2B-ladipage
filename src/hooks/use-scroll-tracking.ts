import { useEffect, useRef } from 'react';
import { trackEvent, campaignParams } from '@/lib/analytics';
import type { LandingVariant, AppLanguage } from '@/types';

export function useScrollTracking(
  variant: LandingVariant,
  lang: AppLanguage,
  campaignId = 'VG5_KMK_LAO_2026',
  landingId = 'vg5-kmk',
  landingVersion = 1,
) {
  const trackedDepths = useRef(new Set<number>());

  useEffect(() => {
    // Reset tracker on variant or language change if we want fresh tracking
    // For this context, it's a single page session so we don't reset the Set.

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;

      // Calculate max scrollable area
      const scrollableHeight = scrollHeight - clientHeight;
      if (scrollableHeight <= 0) return;

      const percent = (scrollTop / scrollableHeight) * 100;

      const milestones = [25, 50, 75, 90];

      milestones.forEach(milestone => {
        if (percent >= milestone && !trackedDepths.current.has(milestone)) {
          trackedDepths.current.add(milestone);
          
          void trackEvent('scroll_depth', {
            ...campaignParams(variant, lang, campaignId, landingId, landingVersion),
            language: lang,
            scroll_percent: milestone
          });
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Check initial scroll in case user loaded halfway down
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [variant, lang, campaignId, landingId, landingVersion]);
}
