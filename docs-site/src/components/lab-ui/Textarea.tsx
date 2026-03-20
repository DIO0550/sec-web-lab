import type { ComponentProps } from 'react';
import styles from './Textarea.module.css';

type Props = {
  label?: string;
  className?: string;
} & ComponentProps<'textarea'>;

/**
 * ラベル付きテキストエリアコンポーネント
 *
 * Input と同様のスタイルパターンを適用する。
 */
export function Textarea({ label, className = '', rows = 4, ...rest }: Props) {
  return (
    <div className={className}>
      {label && <label className={styles.label}>{label}</label>}
      <textarea rows={rows} {...rest} className={styles.textarea} />
    </div>
  );
}
