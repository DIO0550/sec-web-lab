import { useState, useCallback } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import { Textarea } from '@site/src/components/lab-ui/Textarea';
import { PresetButtons } from '@site/src/components/lab-ui/PresetButtons';
import styles from './LogInjectionLab.module.css';

const BASE = '/api/labs/log-injection';

type LogEntry = { timestamp: string; message: string; mode: string };

const presets = [
  { label: '通常', value: 'user1' },
  {
    label: 'ログ偽装',
    value: 'user1\n[INFO] Login success: username=admin',
  },
  {
    label: 'ログ消去',
    value: 'user1\n\n\n\n\n[INFO] System clean',
  },
];

function LogInjPanel({
  mode,
  logs,
  isLoading,
  onLogin,
  onViewLogs,
}: {
  mode: 'vulnerable' | 'secure';
  logs: LogEntry[];
  isLoading: boolean;
  onLogin: (username: string) => void;
  onViewLogs: () => void;
}) {
  const [username, setUsername] = useState('user1');

  return (
    <div>
      <Textarea
        label="ユーザー名:"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        mono
        rows={2}
        className={styles.textareaRow}
      />
      <PresetButtons
        presets={presets}
        onSelect={(p) => setUsername(p.value)}
        className={styles.presetRow}
      />
      <div className={styles.buttonRow}>
        <FetchButton onClick={() => onLogin(username)} disabled={isLoading}>
          ログイン試行
        </FetchButton>
        <FetchButton onClick={onViewLogs} disabled={isLoading}>
          ログ閲覧
        </FetchButton>
      </div>
      <ExpandableSection isOpen={logs.length > 0}>
        <div className={styles.terminal}>
          {logs.map((log, i) => (
            <div key={i} className={styles.logLine}>
              {log.timestamp.substring(11, 19)} | {log.message}
            </div>
          ))}
        </div>
      </ExpandableSection>
    </div>
  );
}

/**
 * ログインジェクションラボUI
 *
 * 改行コードを含むユーザー入力でログを改ざんする攻撃を体験する。
 */
export function LogInjectionLab() {
  const [vulnLogs, setVulnLogs] = useState<LogEntry[]>([]);
  const [secureLogs, setSecureLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(
    async (mode: 'vulnerable' | 'secure', username: string) => {
      setLoading(true);
      try {
        await fetch(`${BASE}/${mode}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password: 'wrongpass' }),
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
      <h3>Lab: ログインジェクション</h3>
      <p className={styles.description}>
        脆弱版では改行コードを含むユーザー名で偽のログ行が作成されます。
        安全版では改行コードが除去されて1行のログになります。
      </p>

      <ComparisonPanel
        vulnerableContent={
          <LogInjPanel
            mode="vulnerable"
            logs={vulnLogs}
            isLoading={loading}
            onLogin={(u) => handleLogin('vulnerable', u)}
            onViewLogs={() => handleViewLogs('vulnerable')}
          />
        }
        secureContent={
          <LogInjPanel
            mode="secure"
            logs={secureLogs}
            isLoading={loading}
            onLogin={(u) => handleLogin('secure', u)}
            onViewLogs={() => handleViewLogs('secure')}
          />
        }
      />

      <CheckpointBox>
        <ul>
          <li>
            脆弱版: 偽のログ行が作成されて正規のログインに見えるか
          </li>
          <li>安全版: 改行コードが除去されて1行のログになるか</li>
          <li>
            ログインジェクションがフォレンジック調査を妨害する危険性を理解したか
          </li>
        </ul>
      </CheckpointBox>
    </>
  );
}
