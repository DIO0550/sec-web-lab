import type { ReactNode } from 'react';
import { Tabs } from './Tabs';
import styles from './ComparisonPanel.module.css';

type Props = {
  vulnerableContent: ReactNode;
  secureContent: ReactNode;
};

/**
 * 脆弱バージョン / 安全バージョンのタブ切り替え比較レイアウト
 */
export function ComparisonPanel({ vulnerableContent, secureContent }: Props) {
  return (
    <div className={styles.wrapper}>
      <Tabs
        keepMounted
        tabs={[
          {
            id: 'vulnerable',
            label: <span className={styles.vulnLabel}>脆弱バージョン</span>,
            content: vulnerableContent,
          },
          {
            id: 'secure',
            label: <span className={styles.secureLabel}>安全バージョン</span>,
            content: secureContent,
          },
        ]}
      />
    </div>
  );
}
