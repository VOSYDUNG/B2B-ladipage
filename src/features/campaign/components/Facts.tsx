import type { Locale } from '../model/types';
import { translate } from '../model/translations';
import styles from './Facts.module.css';

export function Facts({ locale }: { locale: Locale }) {
  const t = (key: string) => translate(locale, key);
  const facts = [
    ['facts.products', locale === 'vi' ? 'Áp dụng chung một chương trình' : 'ນັບຮວມໃນໂຄງການດຽວ'],
    ['facts.immediate', locale === 'vi' ? 'Trên hóa đơn đủ điều kiện' : 'ສຳລັບບິນທີ່ຜ່ານເງື່ອນໄຂ'],
    ['facts.quarter', locale === 'vi' ? 'Theo tổng doanh số cộng dồn' : 'ຕາມຍອດສະສົມ'],
    ['facts.period', locale === 'vi' ? 'Thời gian chương trình' : 'ໄລຍະໂຄງການ'],
  ];
  return (
    <div className={styles.wrap}>
      <div className={`container ${styles.grid}`}>
        {facts.map(([key, note]) => (
          <div className={styles.item} key={key}>
            <strong>{t(key)}</strong>
            <span>{note}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
