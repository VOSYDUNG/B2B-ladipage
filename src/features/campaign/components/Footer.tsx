import type { Locale } from '../model/types';
import { translate } from '../model/translations';
import styles from './Footer.module.css';

export function Footer({ locale }: { locale: Locale }) {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <img src="/images/nnc-logo-160.webp" alt="" width="32" height="32" loading="lazy" />
          <span>NNC PHARMA</span>
        </div>
        <p className={styles.note}>{translate(locale, 'footer.note')} · {locale === 'vi' ? 'Giá, quà và điều kiện được xác nhận thủ công.' : 'ລາຄາ, ຂອງຂວັນ ແລະ ເງື່ອນໄຂຢືນຢັນແບບຄູ່ມື.'}</p>
      </div>
    </footer>
  );
}
