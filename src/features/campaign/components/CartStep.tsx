import type { ChangeEvent } from 'react';
import { Button } from '../../../shared/ui/Button';
import { PRODUCTS } from '../model/config';
import { calculateCart, formatKip } from '../model/math';
import type { CartLine, Locale } from '../model/types';
import { translate } from '../model/translations';
import shared from './FlowShared.module.css';
import styles from './CartStep.module.css';

interface CartStepProps {
  locale: Locale;
  cart: CartLine[];
  saving: boolean;
  onQuantityChange: (productId: string, quantity: number) => void;
  onBack: () => void;
  onSend: () => Promise<void>;
  onSkip: () => void;
}

export function CartStep({ locale, cart, saving, onQuantityChange, onBack, onSend, onSkip }: CartStepProps) {
  const t = (key: string) => translate(locale, key);
  const summary = calculateCart(cart);

  return (
    <div>
      <header className={shared.header}>
        <h2>{t('cart.title')}</h2>
        <p>{t('cart.description')}</p>
      </header>
      <div className={styles.layout}>
        <div className={styles.items}>
          {PRODUCTS.map((product) => {
            const quantity = cart.find((line) => line.productId === product.id)?.quantity ?? 0;
            return (
              <article className={styles.item} key={product.id}>
                <img src={product.image} alt="" width="64" height="58" />
                <div>
                  <h3>{product.name}</h3>
                  <p>{formatKip(product.priceKip, locale)} · {locale === 'vi' ? product.packVi : product.packLo}</p>
                </div>
                <div className={styles.qty} aria-label={`${product.name} quantity`}>
                  <button type="button" onClick={() => onQuantityChange(product.id, quantity - 1)} aria-label="Decrease">−</button>
                  <input
                    value={quantity}
                    inputMode="numeric"
                    aria-label="Quantity"
                    onChange={(event: ChangeEvent<HTMLInputElement>) => onQuantityChange(product.id, Number(event.target.value || 0))}
                  />
                  <button type="button" onClick={() => onQuantityChange(product.id, quantity + 1)} aria-label="Increase">+</button>
                </div>
              </article>
            );
          })}
          {summary.items.length === 0 && (
            <div className={styles.empty}>{locale === 'vi' ? 'Chưa có sản phẩm trong đơn nháp. Có thể bỏ qua bước này.' : 'ຍັງບໍ່ມີສິນຄ້າໃນບິນຮ່າງ. ສາມາດຂ້າມໄດ້.'}</div>
          )}
        </div>

        <aside className={styles.summary}>
          <h3>{locale === 'vi' ? 'Tổng quan đơn nháp' : 'ສະຫຼຸບບິນຮ່າງ'}</h3>
          <div className={styles.rows}>
            <div className={styles.row}><span>{t('cart.subtotal')}</span><strong>{formatKip(summary.subtotalKip, locale)}</strong></div>
            <div className={styles.row}><span>{t('cart.discount')}</span><strong>− {formatKip(summary.immediateDiscountKip, locale)}</strong></div>
            <div className={`${styles.row} ${styles.total}`}><span>{t('cart.payable')}</span><strong>{formatKip(summary.estimatedPayableKip, locale)}</strong></div>
          </div>
          <div className={styles.tier}>
            {summary.tier
              ? `${locale === 'vi' ? summary.tier.nameVi : summary.tier.nameLo} · ${summary.tier.totalBenefitPercent}%`
              : locale === 'vi'
                ? 'Chưa đạt ngưỡng Bậc 1 (2.000.000 KIP)'
                : 'ຍັງບໍ່ເຖິງຂັ້ນ 1 (2.000.000 KIP)'}
          </div>
          <div className={styles.actions}>
            <Button type="button" fullWidth disabled={saving} onClick={() => void onSend()}>{saving ? '…' : t('cart.send')}</Button>
            <Button type="button" variant="secondary" fullWidth onClick={onSkip}>{t('cart.skip')}</Button>
          </div>
        </aside>
      </div>
      <div className={shared.actions}>
        <Button type="button" variant="ghost" onClick={onBack}>{t('common.back')}</Button>
      </div>
    </div>
  );
}
