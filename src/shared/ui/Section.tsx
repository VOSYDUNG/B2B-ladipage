import type { ReactNode } from 'react';
import styles from './Section.module.css';

interface SectionProps {
  id?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  tone?: 'canvas' | 'surface' | 'soft';
  children: ReactNode;
}

export function Section({
  id,
  eyebrow,
  title,
  description,
  tone = 'canvas',
  children,
}: SectionProps) {
  return (
    <section id={id} className={`${styles.section} ${tone !== 'canvas' ? styles[tone] : ''}`}>
      <div className="container">
        {(eyebrow || title || description) && (
          <header className={styles.header}>
            {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
            {title && <h2 className={styles.title}>{title}</h2>}
            {description && <p className={styles.description}>{description}</p>}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
