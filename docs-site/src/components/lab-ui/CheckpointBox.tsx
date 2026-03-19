import type { ReactNode } from 'react';
import styles from './CheckpointBox.module.css';

type Props = {
  title?: string;
  children: ReactNode;
  variant?: 'default' | 'warning';
};

/**
 * 確認ポイントや注意事項を表示するボックス
 */
export function CheckpointBox({ title = '確認ポイント', children, variant = 'default' }: Props) {
  return (
    <div className={`${styles.box} ${styles[variant]}`}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}
