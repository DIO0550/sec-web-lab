import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import { Button } from '@site/src/components/lab-ui/Button';
import { Alert } from '@site/src/components/lab-ui/Alert';
import styles from './WeakHashLab.module.css';

const BASE = '/api/labs/weak-hash';

type User = {
  id: number;
  username: string;
  password: string;
  email: string;
  role: string;
  hashAlgorithm: string;
};

type UsersResult = {
  users: User[];
  _debug?: { message: string; hint?: string };
  error?: string;
};

type CrackResult = {
  success: boolean;
  hash: string;
  password?: string;
  method?: string;
  message?: string;
  _debug?: { message?: string; hint?: string; reasons?: string[] };
};

// --- ユーザー一覧パネル ---
function UsersPanel({
  mode,
  result,
  isLoading,
  onFetch,
  onCrack,
}: {
  mode: 'vulnerable' | 'secure';
  result: UsersResult | null;
  isLoading: boolean;
  onFetch: () => void;
  onCrack: (hash: string) => void;
}) {
  return (
    <div>
      <FetchButton onClick={onFetch} disabled={isLoading}>
        ユーザー一覧を取得
      </FetchButton>

      {result?.error && (
        <pre className={styles.errorText}>{result.error}</pre>
      )}

      <ExpandableSection isOpen={!!result?.users}>
        <div className={styles.tableWrapper}>
          <table className={styles.resultTable}>
            <thead>
              <tr>
                <th className={styles.resultTh}>username</th>
                <th className={styles.resultTh}>password (hash)</th>
                <th className={styles.resultTh}>algorithm</th>
                <th className={styles.resultTh}>action</th>
              </tr>
            </thead>
            <tbody>
              {result?.users.map((u) => (
                <tr key={u.id}>
                  <td className={styles.resultTd}>{u.username}</td>
                  <td className={`${styles.resultTd} ${styles.mono} ${mode === 'vulnerable' ? styles.vulnCell : styles.secureCell}`}>
                    {u.password}
                  </td>
                  <td className={styles.resultTd}>{u.hashAlgorithm}</td>
                  <td className={styles.resultTd}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCrack(u.password)}
                    >
                      逆引き
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {result?._debug && (
            <div className={styles.debugInfo}>
              {result?._debug.message}
            </div>
          )}
        </div>
      </ExpandableSection>
    </div>
  );
}

// --- 逆引き結果パネル ---
function CrackPanel({
  result,
}: {
  result: CrackResult | null;
}) {
  if (!result) {
    return null;
  }

  return (
    <Alert
      variant={result.success ? 'error' : 'success'}
      title={result.success ? '逆引き成功（パスワード判明）' : '逆引き失敗（パスワード保護）'}
      className={styles.crackAlert}
    >
      <div className={styles.crackDetails}>
        <div>ハッシュ: <code className={styles.mono}>{result.hash}</code></div>
        {result.password && (
          <div>
            パスワード: <strong className={styles.crackPassword}>{result.password}</strong>
          </div>
        )}
        {result.method && <div>手法: {result.method}</div>}
        {result.message && <div style={{ opacity: 0.7 }}>{result.message}</div>}
        {result._debug?.reasons && (
          <ul className={styles.crackReasons}>
            {result._debug.reasons.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        )}
      </div>
    </Alert>
  );
}

/**
 * 弱いハッシュアルゴリズムラボUI
 *
 * MD5/SHA1でハッシュしても安全ではない理由を、レインボーテーブルによる逆引きで体験する。
 */
export function WeakHashLab() {
  const [vulnUsers, setVulnUsers] = useState<UsersResult | null>(null);
  const [secureUsers, setSecureUsers] = useState<UsersResult | null>(null);
  const [vulnCrack, setVulnCrack] = useState<CrackResult | null>(null);
  const [secureCrack, setSecureCrack] = useState<CrackResult | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async (mode: 'vulnerable' | 'secure') => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/users`);
      const data: UsersResult = await res.json();
      if (mode === 'vulnerable') {
        setVulnUsers(data);
      } else {
        setSecureUsers(data);
      }
    } catch (e) {
      const errorResult: UsersResult = { users: [], error: e instanceof Error ? e.message : String(e) };
      if (mode === 'vulnerable') {
        setVulnUsers(errorResult);
      } else {
        setSecureUsers(errorResult);
      }
    }
    setLoading(false);
  };

  const crack = async (mode: 'vulnerable' | 'secure', hash: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/crack?hash=${encodeURIComponent(hash)}`);
      const data: CrackResult = await res.json();
      if (mode === 'vulnerable') {
        setVulnCrack(data);
      } else {
        setSecureCrack(data);
      }
    } catch (e) {
      const errorResult: CrackResult = { success: false, hash, message: e instanceof Error ? e.message : String(e) };
      if (mode === 'vulnerable') {
        setVulnCrack(errorResult);
      } else {
        setSecureCrack(errorResult);
      }
    }
    setLoading(false);
  };

  return (
    <>
      <h3>Lab 1: ハッシュ値の確認と逆引き</h3>
      <p className={styles.description}>
        ユーザー一覧を取得し、各ユーザーのパスワードハッシュを確認してください。
        「逆引き」ボタンでレインボーテーブルによるハッシュ解読を体験できます。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <div>
            <UsersPanel
              mode="vulnerable"
              result={vulnUsers}
              isLoading={loading}
              onFetch={() => fetchUsers('vulnerable')}
              onCrack={(hash) => crack('vulnerable', hash)}
            />
            <CrackPanel result={vulnCrack} />
          </div>
        }
        secureContent={
          <div>
            <UsersPanel
              mode="secure"
              result={secureUsers}
              isLoading={loading}
              onFetch={() => fetchUsers('secure')}
              onCrack={(hash) => crack('secure', hash)}
            />
            <CrackPanel result={secureCrack} />
          </div>
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: MD5ハッシュがレインボーテーブルで即座に逆引きできるか</li>
          <li>安全版: bcryptハッシュが逆引きに失敗するか</li>
          <li>MD5が「高速すぎる」ことがなぜ問題なのか理解したか</li>
          <li>ソルトの役割（同じパスワードでも異なるハッシュ値）を理解したか</li>
          <li>コスト係数（ストレッチング）がGPU攻撃をどう防ぐか理解したか</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
