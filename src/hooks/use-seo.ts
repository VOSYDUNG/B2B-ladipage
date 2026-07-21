import { useEffect } from 'react';
import type { AppLanguage, LandingVariant } from '@/types';
import { safeContent } from '@/content/content';

export function useSeo(lang: AppLanguage, variant: LandingVariant) {
  useEffect(() => {
    // 1. Update Title
    const title = variant === 'medical-preview'
      ? (lang === 'vi' ? 'DỰ THẢO CLAIM — VG-5 × Ker Mao Khang' : 'ຮ່າງຂໍ້ອ້າງອິງ — VG-5 × Ker Mao Khang')
      : (lang === 'vi' ? 'Chương trình đối tác — VG-5 × Ker Mao Khang' : 'ໂຄງການຄູ່ຮ່ວມງານ — VG-5 × Ker Mao Khang');
    
    document.title = title;

    // 2. Update HTML Lang
    document.documentElement.lang = lang;

    // 3. Update Robots
    const metaRobots = document.querySelector('meta[name="robots"]');
    if (variant === 'medical-preview') {
      if (metaRobots) {
        metaRobots.setAttribute('content', 'noindex,nofollow');
      } else {
        const meta = document.createElement('meta');
        meta.name = 'robots';
        meta.content = 'noindex,nofollow';
        document.head.appendChild(meta);
      }
    } else {
      if (metaRobots) metaRobots.setAttribute('content', 'index,follow');
    }

    // 4. Update Meta Description
    const metaDesc = document.querySelector('meta[name="description"]');
    const descContent = safeContent[lang].subheadline;
    if (metaDesc) {
      metaDesc.setAttribute('content', descContent);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = descContent;
      document.head.appendChild(meta);
    }

  }, [lang, variant]);
}
