import type { ReactNode } from 'react';
import styles from './ExpandableSection.module.css';

type Props = {
  isOpen: boolean;
  children: ReactNode;
  className?: string;
};

/**
 * CSS Grid ベースの展開アニメーションコンポーネント
 */
export function ExpandableSection({ isOpen, children, className = '' }: Props) {
  return (
    <div
      className={`${styles.wrapper} ${className}`.trim()}
      style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
    >
      <div className={styles.inner}>{children}</div>
    </div>
  );
}
