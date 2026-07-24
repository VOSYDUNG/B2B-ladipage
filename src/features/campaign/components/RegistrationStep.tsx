import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Button } from '../../../shared/ui/Button';
import type { Locale, RegistrationData } from '../model/types';
import { translate } from '../model/translations';
import styles from './FlowShared.module.css';

interface RegistrationStepProps {
  locale: Locale;
  initialValue: RegistrationData | null;
  saving: boolean;
  onSubmit: (value: RegistrationData) => Promise<void>;
}

export function RegistrationStep({ locale, initialValue, saving, onSubmit }: RegistrationStepProps) {
  const t = (key: string) => translate(locale, key);
  const [error, setError] = useState('');
  const [value, setValue] = useState<RegistrationData>(
    initialValue ?? {
      role: 'pharmacy',
      fullName: '',
      phone: '',
      businessName: '',
      referralCode: new URLSearchParams(window.location.search).get('ref') ?? '',
      consent: false,
    },
  );

  const update = <K extends keyof RegistrationData>(key: K, next: RegistrationData[K]) => {
    setValue((current) => ({ ...current, [key]: next }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (!value.fullName.trim() || !value.phone.trim() || !value.businessName.trim()) {
      setError(locale === 'vi' ? 'Vui lòng điền đủ họ tên, số điện thoại và tên cơ sở.' : 'ກະລຸນາຕື່ມຊື່, ເບີໂທ ແລະ ຊື່ສະຖານປະກອບການ.');
      return;
    }
    if (!/^\+?[0-9\s.-]{8,18}$/.test(value.phone)) {
      setError(locale === 'vi' ? 'Số điện thoại chưa đúng định dạng.' : 'ຮູບແບບເບີໂທບໍ່ຖືກຕ້ອງ.');
      return;
    }
    if (!value.consent) {
      setError(locale === 'vi' ? 'Cần xác nhận đồng ý liên hệ để tiếp tục.' : 'ກະລຸນາຍິນຍອມໃຫ້ຕິດຕໍ່.');
      return;
    }
    await onSubmit(value);
  };

  return (
    <div>
      <header className={styles.header}>
        <h2>{t('form.title')}</h2>
        <p>{t('form.description')}</p>
      </header>
      <form onSubmit={submit} noValidate>
        <div className={styles.form}>
          <label className={styles.field}>
            <span className={styles.label}>{t('form.role')}</span>
            <select className={styles.select} value={value.role} onChange={(event: ChangeEvent<HTMLSelectElement>) => update('role', event.target.value as RegistrationData['role'])}>
              <option value="pharmacy">{t('form.role.pharmacy')}</option>
              <option value="clinic">{t('form.role.clinic')}</option>
              <option value="dealer">{t('form.role.dealer')}</option>
              <option value="doctor">{t('form.role.doctor')}</option>
            </select>
          </label>
          <label className={styles.field}>
            <span className={styles.label}>{t('form.fullName')}</span>
            <input className={styles.input} value={value.fullName} onChange={(event: ChangeEvent<HTMLInputElement>) => update('fullName', event.target.value)} autoComplete="name" />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>{t('form.phone')}</span>
            <input className={styles.input} value={value.phone} onChange={(event: ChangeEvent<HTMLInputElement>) => update('phone', event.target.value)} inputMode="tel" autoComplete="tel" />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>{t('form.business')}</span>
            <input className={styles.input} value={value.businessName} onChange={(event: ChangeEvent<HTMLInputElement>) => update('businessName', event.target.value)} autoComplete="organization" />
          </label>
          <label className={`${styles.field} ${styles.fieldFull}`}>
            <span className={styles.label}>{t('form.referral')}</span>
            <input className={styles.input} value={value.referralCode} onChange={(event: ChangeEvent<HTMLInputElement>) => update('referralCode', event.target.value)} />
          </label>
          <label className={`${styles.checkbox} ${styles.fieldFull}`}>
            <input type="checkbox" checked={value.consent} onChange={(event: ChangeEvent<HTMLInputElement>) => update('consent', event.target.checked)} />
            <span>{t('form.consent')}</span>
          </label>
        </div>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <div className={styles.actions}>
          <span className={styles.notice}>{locale === 'vi' ? 'Không yêu cầu thanh toán tại bước này.' : 'ບໍ່ມີການຊຳລະເງິນໃນຂັ້ນຕອນນີ້.'}</span>
          <Button type="submit" disabled={saving}>{saving ? '…' : t('form.submit')}</Button>
        </div>
      </form>
    </div>
  );
}
