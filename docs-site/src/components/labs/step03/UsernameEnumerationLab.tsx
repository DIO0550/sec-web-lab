import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { Input } from '@site/src/components/lab-ui/Input';
import { PresetButtons } from '@site/src/components/lab-ui/PresetButtons';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import { Alert } from '@site/src/components/lab-ui/Alert';
import { postJson } from '@site/src/hooks/useLabFetch';
import styles from './UsernameEnumerationLab.module.css';

const BASE = '/api/labs/username-enumeration';

type LoginResult = {
  error?: string;
  message?: string;
  user?: { username: string; email: string };
};

type AttemptResult = {
  response: LoginResult;
  elapsed: number;
  status: number;
};

const PRESETS = [
  { label: 'admin / wrong', username: 'admin', password: 'wrong' },
  { label: 'nonexistent / wrong', username: 'nonexistent', password: 'wrong' },
  { label: 'alice / wrong', username: 'alice', password: 'wrong' },
];

function LoginPanel({
  mode,
}: {
  mode: 'vulnerable' | 'secure';
}) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('wrong');
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const start = performance.now();
    try {
      const { status, body } = await postJson<LoginResult>(`${BASE}/${mode}/login`, {
        username,
        password,
      });
      const elapsed = Math.round(performance.now() - start);
      setResult({ response: body, elapsed, status });
    } catch (e) {
      const elapsed = Math.round(performance.now() - start);
      setResult({
        response: { error: e instanceof Error ? e.message : String(e) },
        elapsed,
        status: 0,
      });
    }
    setLoading(false);
  };

  return (
    <div>
      <div className={styles.presets}>
        <PresetButtons
          presets={PRESETS}
          onSelect={(p) => {
            setUsername(p.username);
            setPassword(p.password);
          }}
        />
      </div>
      <div className={styles.inputGroup}>
        <Input
          label="ユーザー名"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div className={styles.inputGroup}>
        <Input
          label="パスワード"
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <FetchButton onClick={handleLogin} disabled={loading}>
        ログイン
      </FetchButton>

      <ExpandableSection isOpen={!!result}>
        <Alert
          variant={result?.response?.message ? 'success' : 'error'}
          title={result?.response?.message ? 'ログイン成功' : 'ログイン失敗'}
          className={styles.resultAlert}
        >
          <div>{result?.response?.error || result?.response?.message}</div>
          <div className={styles.responseTime}>
            レスポンス時間: {result?.elapsed}ms / ステータス: {result?.status}
          </div>
        </Alert>
      </ExpandableSection>
    </div>
  );
}

/**
 * ユーザー名列挙ラボUI
 *
 * エラーメッセージの違いとレスポンス時間の差からユーザー名の存在を推測する攻撃を体験する。
 */
export function UsernameEnumerationLab() {
  return (
    <>
      <h3>Lab: ユーザー名列挙の検証</h3>
      <p className={styles.description}>
        異なるユーザー名でログインを試み、エラーメッセージとレスポンス時間の違いを観察してください。
        脆弱版ではユーザーの存在有無で異なるメッセージが返り、レスポンス時間にも差があります。
        安全版ではメッセージが統一され、ダミー処理によりタイミング差が最小化されます。
      </p>

      <ComparisonPanel
        vulnerableContent={<LoginPanel mode="vulnerable" />}
        secureContent={<LoginPanel mode="secure" />}
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: 存在するユーザーと存在しないユーザーでエラーメッセージが異なるか</li>
          <li>脆弱版: レスポンス時間に差があるか（存在するユーザーは遅い）</li>
          <li>安全版: どちらのケースでも同じエラーメッセージが返るか</li>
          <li>安全版: レスポンス時間がほぼ同じになるか</li>
          <li>エラーメッセージとレスポンス時間の差でユーザーの存在を推測できるか</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
