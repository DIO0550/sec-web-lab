import { useState, useCallback } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import styles from './LoggingLab.module.css';

const BASE = '/api/labs/logging';

type LogEntry = {
  timestamp: string;
  level: string;
  message: string;
  mode: string;
};

function LogPanel({
  mode,
  logs,
  isLoading,
  onLogin,
  onViewLogs,
}: {
  mode: 'vulnerable' | 'secure';
  logs: LogEntry[];
  isLoading: boolean;
  onLogin: () => void;
  onViewLogs: () => void;
}) {
  return (
    <div>
      <div className={styles.buttonRow}>
        <FetchButton onClick={onLogin} disabled={isLoading}>
          ログイン試行
        </FetchButton>
        <FetchButton onClick={onViewLogs} disabled={isLoading}>
          ログ閲覧
        </FetchButton>
      </div>
      <ExpandableSection isOpen={logs.length > 0}>
        <div className={styles.logList}>
          {logs.map((log, i) => (
            <div
              key={i}
              className={
                log.level === 'WARN'
                  ? styles.logEntryWarn
                  : styles.logEntryInfo
              }
            >
              [{log.timestamp.substring(11, 19)}] [{log.level}] {log.message}
            </div>
          ))}
        </div>
      </ExpandableSection>
    </div>
  );
}

/**
 * 不適切なログ記録ラボUI
 *
 * セキュリティイベントのログ記録の有無による違いを体験する。
 */
export function LoggingLab() {
  const [vulnLogs, setVulnLogs] = useState<LogEntry[]>([]);
  const [secureLogs, setSecureLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(
    async (mode: 'vulnerable' | 'secure') => {
      setLoading(true);
      try {
        await fetch(`${BASE}/${mode}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'admin',
            password: 'admin123',
          }),
        });
      } catch {
        // ignore
      }
      setLoading(false);
    },
    [],
  );

  const handleViewLogs = useCallback(
    async (mode: 'vulnerable' | 'secure') => {
      try {
        const res = await fetch(`${BASE}/logs`);
        const data: { logs: LogEntry[] } = await res.json();
        const filtered = data.logs.filter((l) => l.mode === mode);
        if (mode === 'vulnerable') {
          setVulnLogs(filtered);
        } else {
          setSecureLogs(filtered);
        }
      } catch {
        // ignore
      }
    },
    [],
  );

  return (
    <>
      <h3>Lab: 不適切なログ記録</h3>
      <p className={styles.description}>
        脆弱版ではログにパスワードとトークンが平文で記録されます。
        安全版ではパスワードがマスクされ、トークンが記録されません。
      </p>

      <ComparisonPanel
        vulnerableContent={
          <LogPanel
            mode="vulnerable"
            logs={vulnLogs}
            isLoading={loading}
            onLogin={() => handleLogin('vulnerable')}
            onViewLogs={() => handleViewLogs('vulnerable')}
          />
        }
        secureContent={
          <LogPanel
            mode="secure"
            logs={secureLogs}
            isLoading={loading}
            onLogin={() => handleLogin('secure')}
            onViewLogs={() => handleViewLogs('secure')}
          />
        }
      />

      <CheckpointBox>
        <ul>
          <li>
            脆弱版: ログにパスワードとトークンが平文で記録されているか
          </li>
          <li>
            安全版: パスワードが *** でマスクされ、トークンが記録されていないか
          </li>
          <li>ログに記録してはいけない情報の一覧を理解したか</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
