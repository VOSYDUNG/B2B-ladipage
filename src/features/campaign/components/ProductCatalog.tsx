import { Section } from '../../../shared/ui/Section';
import { PRODUCTS } from '../model/config';
import { formatKip } from '../model/math';
import type { Locale } from '../model/types';
import { translate } from '../model/translations';
import styles from './ProductCatalog.module.css';

interface ProductCatalogProps {
  locale: Locale;
  onAddProduct: (productId: string) => void;
}

export function ProductCatalog({ locale, onAddProduct }: ProductCatalogProps) {
  const t = (key: string) => translate(locale, key);
  return (
    <Section
      id="products"
      tone="surface"
      eyebrow={t('products.eyebrow')}
      title={t('products.title')}
      description={t('products.description')}
    >
      <div className={styles.grid}>
        {PRODUCTS.map((product) => (
          <article className={styles.card} key={product.id}>
            <div className={styles.media}>
              <img src={product.image} alt={product.name} width="420" height="320" loading="lazy" />
            </div>
            <div className={styles.body}>
              <h3 className={styles.name}>{product.name}</h3>
              <p className={styles.pack}>{locale === 'vi' ? product.packVi : product.packLo}</p>
              <div className={styles.footer}>
                <span className={styles.price}>{formatKip(product.priceKip, locale)}</span>
                <button
                  className={styles.add}
                  type="button"
                  aria-label={`${t('products.add')}: ${product.name}`}
                  onClick={() => onAddProduct(product.id)}
                >
                  +
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
