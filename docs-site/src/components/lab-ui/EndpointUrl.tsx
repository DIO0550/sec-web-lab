import type { ReactNode } from 'react';
import styles from './EndpointUrl.module.css';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

type Props = {
  method?: HttpMethod;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
};

const BADGE_CLASS: Record<HttpMethod, string> = {
  GET: styles.badgeGET,
  POST: styles.badgePOST,
  PUT: styles.badgePUT,
  DELETE: styles.badgeDELETE,
  PATCH: styles.badgePATCH,
};

/**
 * HTTPエンドポイントURL表示コンポーネント
 */
export function EndpointUrl({ method = 'GET', children, action, className = '' }: Props) {
  return (
    <div className={`${styles.wrapper} ${className}`.trim()}>
      <span className={styles.urlGroup}>
        <span className={`${styles.badge} ${BADGE_CLASS[method]}`}>
          {method}
        </span>
        <span className={styles.urlText}>{children}</span>
      </span>
      {action && <span className={styles.action}>{action}</span>}
    </div>
  );
}
