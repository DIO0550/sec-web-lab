import type { ComponentProps } from 'react';
import styles from './Input.module.css';

type Props = {
  label?: string;
  error?: string;
  className?: string;
} & ComponentProps<'input'>;

/**
 * ラベル・エラー表示付きの入力コンポーネント
 */
export function Input({ label, error, className = '', ...rest }: Props) {
  return (
    <div className={className}>
      {label && <label className={styles.label}>{label}</label>}
      <input {...rest} className={styles.input} />
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
