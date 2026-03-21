import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import { Button } from '@site/src/components/lab-ui/Button';
import { Input } from '@site/src/components/lab-ui/Input';
import { Alert } from '@site/src/components/lab-ui/Alert';
import { PresetButtons } from '@site/src/components/lab-ui/PresetButtons';
import { postJson } from '@site/src/hooks/useLabFetch';
import styles from './WeakPasswordPolicyLab.module.css';

const BASE = '/api/labs/weak-password-policy';

type RegisterResult = {
  success: boolean;
  message?: string;
  _debug?: { passwordLength: number; message: string };
};

type StrengthResult = {
  password: string;
  length: number;
  valid: boolean;
  reason?: string;
};

const weakPresets = [
  { label: '123456', password: '123456' },
  { label: 'password', password: 'password' },
  { label: 'a', password: 'a' },
  { label: 'admin123', password: 'admin123' },
];

const strongPreset = { label: 'MyStr0ngPass!', password: 'MyStr0ngPass!' };

const testPasswords = [
  { label: '123456' },
  { label: 'password' },
  { label: 'abc' },
  { label: '12345678' },
  { label: 'Password1' },
  { label: 'MyStr0ng!' },
  { label: 'MyStr0ngPass!' },
];

// --- 登録フォーム ---
function RegisterForm({
  mode,
  result,
  isLoading,
  onSubmit,
}: {
  mode: 'vulnerable' | 'secure';
  result: RegisterResult | null;
  isLoading: boolean;
  onSubmit: (mode: 'vulnerable' | 'secure', username: string, password: string) => void;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div>
      <div className={styles.formFields}>
        <Input
          label="ユーザー名"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="testuser"
        />
        <Input
          label="パスワード"
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <FetchButton onClick={() => onSubmit(mode, username, password)} disabled={isLoading}>
          登録
        </FetchButton>
      </div>

      <div className={styles.presets}>
        <span className={styles.presetLabel}>弱いパスワード:</span>
        <div className={styles.presetRow}>
          {weakPresets.map((p) => (
            <Button
              key={p.label}
              variant="ghost"
              size="sm"
              onClick={() => setPassword(p.password)}
              className={styles.weakButton}
            >
              {p.label}
            </Button>
          ))}
        </div>
        <div className={styles.strongRow}>
          <span className={styles.presetLabel}>強いパスワード:</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPassword(strongPreset.password)}
            className={styles.strongButton}
          >
            {strongPreset.label}
          </Button>
        </div>
      </div>

      <ExpandableSection isOpen={!!result}>
        <Alert
          variant={result?.success ? 'success' : 'error'}
          title={result?.success ? '登録成功' : '登録失敗'}
          className={styles.resultAlert}
        >
          <div className={styles.resultMessage}>{result?.message}</div>
          {result?._debug && (
            <div className={styles.debugInfo}>
              {result?._debug.message}
            </div>
          )}
        </Alert>
      </ExpandableSection>
    </div>
  );
}

// --- パスワード強度チェッカー ---
function StrengthChecker({
  results,
  isLoading,
  onCheck,
}: {
  results: StrengthResult[];
  isLoading: boolean;
  onCheck: (password: string) => void;
}) {
  const [password, setPassword] = useState('');

  return (
    <div>
      <div className={styles.inputRow}>
        <Input
          label="パスワードを入力"
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.inputFlex}
        />
        <FetchButton onClick={() => onCheck(password)} disabled={isLoading}>
          チェック
        </FetchButton>
      </div>

      <PresetButtons
        presets={testPasswords}
        onSelect={(p) => { setPassword(p.label); onCheck(p.label); }}
        className={styles.presets}
      />

      <ExpandableSection isOpen={results.length > 0}>
        <div className={styles.tableWrapper}>
          <table className={styles.resultTable}>
            <thead>
              <tr>
                <th className={styles.resultTh}>パスワード</th>
                <th className={styles.resultTh}>長さ</th>
                <th className={styles.resultTh}>判定</th>
                <th className={styles.resultTh}>理由</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} className={r.valid ? styles.validRow : styles.invalidRow}>
                  <td className={`${styles.resultTd} ${styles.mono}`}>{r.password}</td>
                  <td className={styles.resultTd}>{r.length}</td>
                  <td className={styles.resultTd}>
                    {r.valid ? <span className={styles.okText}>OK</span> : <span className={styles.ngText}>NG</span>}
                  </td>
                  <td className={styles.resultTd}>{r.reason ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ExpandableSection>
    </div>
  );
}

/**
 * 弱いパスワードポリシーラボUI
 *
 * パスワード強度チェックがないと弱いパスワードが登録でき、辞書攻撃で突破される危険性を体験する。
 */
export function WeakPasswordPolicyLab() {
  const [vulnResult, setVulnResult] = useState<RegisterResult | null>(null);
  const [secureResult, setSecureResult] = useState<RegisterResult | null>(null);
  const [strengthResults, setStrengthResults] = useState<StrengthResult[]>([]);
  const [loading, setLoading] = useState(false);

  // ユーザー名にタイムスタンプを付与して重複を回避
  const generateUsername = (base: string, mode: string) => `${base}_${mode}_${Date.now()}`;

  const handleRegister = async (mode: 'vulnerable' | 'secure', username: string, password: string) => {
    setLoading(true);
    const uniqueUsername = username || generateUsername('test', mode);
    try {
      const { body } = await postJson<RegisterResult>(`${BASE}/${mode}/register`, {
        username: uniqueUsername,
        password,
      });
      if (mode === 'vulnerable') {
        setVulnResult(body);
      } else {
        setSecureResult(body);
      }
    } catch (e) {
      const errorResult: RegisterResult = { success: false, message: e instanceof Error ? e.message : String(e) };
      if (mode === 'vulnerable') {
        setVulnResult(errorResult);
      } else {
        setSecureResult(errorResult);
      }
    }
    setLoading(false);
  };

  const checkStrength = async (password: string) => {
    setLoading(true);
    try {
      const { body } = await postJson<StrengthResult>(`${BASE}/secure/check-strength`, { password });
      setStrengthResults((prev) => [body, ...prev]);
    } catch {
      // ignore
    }
    setLoading(false);
  };

  return (
    <>
      <h3>Lab 1: パスワード登録テスト</h3>
      <p className={styles.description}>
        弱いパスワード（<code>123456</code>, <code>a</code> 等）で登録を試みてください。
        脆弱版は何でも受け付けますが、安全版は強度チェックで拒否します。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <RegisterForm mode="vulnerable" result={vulnResult} isLoading={loading} onSubmit={handleRegister} />
        }
        secureContent={
          <RegisterForm mode="secure" result={secureResult} isLoading={loading} onSubmit={handleRegister} />
        }
      />

      <h3 className={styles.lab2Heading}>Lab 2: パスワード強度チェッカー</h3>
      <p className={styles.description}>
        様々なパスワードの強度をチェックしてみてください。
        安全版では8文字以上・大文字小文字数字・ブラックリスト照合の3段階チェックが行われます。
      </p>
      <StrengthChecker results={strengthResults} isLoading={loading} onCheck={checkStrength} />

      <CheckpointBox>
        <ul>
          <li>脆弱版: <code>123456</code> や <code>a</code> がそのまま登録できるか</li>
          <li>安全版: 弱いパスワードが具体的な理由とともに拒否されるか</li>
          <li>「8文字以上」だけでは <code>password</code> を防げないことを理解したか</li>
          <li>ブラックリスト照合がなぜ必要か理解したか</li>
          <li>強いパスワード（<code>MyStr0ngPass!</code>等）が安全版で登録できるか</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
