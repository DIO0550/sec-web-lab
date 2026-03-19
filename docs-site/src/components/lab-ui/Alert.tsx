import type { ReactNode } from 'react';
import styles from './Alert.module.css';

type Props = {
  variant: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  children?: ReactNode;
  className?: string;
};

/**
 * アラートコンポーネント
 */
export function Alert({ variant, title, children, className = '' }: Props) {
  return (
    <div className={`${styles.alert} ${styles[variant]} ${className}`.trim()}>
      {title && <div className={styles.title}>{title}</div>}
      {children}
    </div>
  );
}
