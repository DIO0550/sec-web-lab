import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { Input } from '@site/src/components/lab-ui/Input';
import { PresetButtons } from '@site/src/components/lab-ui/PresetButtons';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import { Alert } from '@site/src/components/lab-ui/Alert';
import { postJson } from '@site/src/hooks/useLabFetch';
import styles from './SqlInjectionLab.module.css';

const BASE = '/api/labs/sql-injection';

type LoginResult = {
  success: boolean;
  message: string;
  user?: { id: number; username: string; email: string; role: string };
  _debug?: { query: string; rowCount: number };
  error?: string;
};

type SearchResult = {
  results: { title: string; content: string }[];
  count: number;
  _debug?: { query: string };
  error?: string;
};

const loginPresets = [
  { label: '正常ログイン', username: 'admin', password: 'admin123' },
  { label: "' OR 1=1 --", username: "' OR 1=1 --", password: 'anything' },
  { label: "admin' --", username: "admin' --", password: 'wrong' },
];

const searchPresets = [
  { label: '正常検索', query: 'Welcome' },
  { label: 'UNION (user情報)', query: "' UNION SELECT username, password FROM users --" },
];

/** ログインフォーム（脆弱/安全の各タブ内で使用） */
function LoginForm({
  mode,
  result,
  error,
  isLoading,
  onSubmit,
}: {
  mode: 'vulnerable' | 'secure';
  result: LoginResult | null;
  error: string | null;
  isLoading: boolean;
  onSubmit: (mode: 'vulnerable' | 'secure', username: string, password: string) => void;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div>
      <div className={styles.formFields}>
        <Input
          label="ユーザー名:"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          label="パスワード:"
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <FetchButton onClick={() => onSubmit(mode, username, password)} disabled={isLoading}>
          ログイン
        </FetchButton>
      </div>

      <PresetButtons
        presets={loginPresets}
        onSelect={(p) => {
          setUsername(p.username);
          setPassword(p.password);
        }}
        className={styles.presets}
      />

      {error && <Alert variant="error">{error}</Alert>}

      <ExpandableSection isOpen={!!result}>
        <Alert
          variant={result?.success ? 'success' : 'error'}
          title={result?.success ? 'ログイン成功' : 'ログイン失敗'}
          className={styles.resultAlert}
        >
          <div className={styles.resultMessage}>{result?.message}</div>
          {result?.user && (
            <pre className={styles.userJson}>{JSON.stringify(result.user, null, 2)}</pre>
          )}
          {/* DebugInfo: 実行されたSQLをインラインで表示 */}
          {result?._debug && (
            <details className={styles.debugDetails}>
              <summary className={styles.debugSummary}>実行されたSQL</summary>
              <code className={styles.debugCode}>{result._debug.query}</code>
            </details>
          )}
          {result?.error && <pre className={styles.errorText}>{result.error}</pre>}
        </Alert>
      </ExpandableSection>
    </div>
  );
}

/** 検索フォーム（脆弱/安全の各タブ内で使用） */
function SearchForm({
  mode,
  result,
  error,
  isLoading,
  onSearch,
}: {
  mode: 'vulnerable' | 'secure';
  result: SearchResult | null;
  error: string | null;
  isLoading: boolean;
  onSearch: (mode: 'vulnerable' | 'secure', query: string) => void;
}) {
  const [query, setQuery] = useState('');

  return (
    <div>
      <div className={styles.inputRow}>
        <Input
          label="検索キーワード:"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={styles.inputFlex}
        />
        <FetchButton onClick={() => onSearch(mode, query)} disabled={isLoading}>
          検索
        </FetchButton>
      </div>

      <PresetButtons
        presets={searchPresets}
        onSelect={(p) => setQuery(p.query)}
        className={styles.presets}
      />

      {error && <Alert variant="error">{error}</Alert>}

      <ExpandableSection isOpen={!!result}>
        <div className={styles.resultArea}>
          <div className={styles.resultCount}>{result?.count} 件の結果</div>
          {/* ResultTable: 検索結果テーブルをインラインで表示 */}
          {result?.results && result.results.length > 0 && (
            <table className={styles.resultTable}>
              <thead>
                <tr>
                  <th className={styles.resultTh}>title</th>
                  <th className={styles.resultTh}>content</th>
                </tr>
              </thead>
              <tbody>
                {result.results.map((row, i) => (
                  <tr key={i}>
                    <td className={styles.resultTd}>{row.title}</td>
                    <td className={styles.resultTd}>{row.content}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {/* DebugInfo: 実行されたSQLをインラインで表示 */}
          {result?._debug && (
            <details className={styles.debugDetails}>
              <summary className={styles.debugSummary}>実行されたSQL</summary>
              <code className={styles.debugCode}>{result._debug.query}</code>
            </details>
          )}
          {result?.error && <pre className={styles.errorText}>{result.error}</pre>}
        </div>
      </ExpandableSection>
    </div>
  );
}

/**
 * SQLインジェクションラボUI
 *
 * ユーザー入力がSQL文に直接埋め込まれることで、認証のバイパスや
 * 他テーブルのデータ抽出が可能になる脆弱性を体験する。
 */
export function SqlInjectionLab() {
  const [loginVuln, setLoginVuln] = useState<LoginResult | null>(null);
  const [loginSecure, setLoginSecure] = useState<LoginResult | null>(null);
  const [searchVuln, setSearchVuln] = useState<SearchResult | null>(null);
  const [searchSecure, setSearchSecure] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleLogin = async (
    mode: 'vulnerable' | 'secure',
    username: string,
    password: string,
  ) => {
    setLoading(true);
    setLoginError(null);
    try {
      const { body } = await postJson<LoginResult>(`${BASE}/${mode}/login`, {
        username,
        password,
      });
      if (mode === 'vulnerable') {
        setLoginVuln(body);
      } else {
        setLoginSecure(body);
      }
    } catch (e) {
      setLoginError(e instanceof Error ? e.message : String(e));
    }
    setLoading(false);
  };

  const handleSearch = async (mode: 'vulnerable' | 'secure', query: string) => {
    setLoading(true);
    setSearchError(null);
    try {
      const params = new URLSearchParams({ q: query });
      const res = await fetch(`${BASE}/${mode}/search?${params}`);
      const data: SearchResult = await res.json();
      if (mode === 'vulnerable') {
        setSearchVuln(data);
      } else {
        setSearchSecure(data);
      }
    } catch (e) {
      setSearchError(e instanceof Error ? e.message : String(e));
    }
    setLoading(false);
  };

  return (
    <>
      {/* 認証バイパス */}
      <h3>Lab 1: 認証バイパス</h3>
      <p className={styles.description}>
        ユーザー名に <code>{`' OR 1=1 --`}</code>{' '}
        を入力して、パスワードなしでログインを試みてください。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <LoginForm
            mode="vulnerable"
            result={loginVuln}
            error={loginError}
            isLoading={loading}
            onSubmit={handleLogin}
          />
        }
        secureContent={
          <LoginForm
            mode="secure"
            result={loginSecure}
            error={loginError}
            isLoading={loading}
            onSubmit={handleLogin}
          />
        }
      />

      {/* データ抽出 */}
      <h3 className={styles.lab2Heading}>Lab 2: データ抽出 (UNION)</h3>
      <p className={styles.description}>
        検索欄に <code>{`' UNION SELECT username, password FROM users --`}</code>{' '}
        を入力して、ユーザーテーブルの内容を抽出してみてください。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <SearchForm
            mode="vulnerable"
            result={searchVuln}
            error={searchError}
            isLoading={loading}
            onSearch={handleSearch}
          />
        }
        secureContent={
          <SearchForm
            mode="secure"
            result={searchSecure}
            error={searchError}
            isLoading={loading}
            onSearch={handleSearch}
          />
        }
      />

      <CheckpointBox>
        <ul>
          <li>
            脆弱版: <code>{`' OR 1=1 --`}</code> でadminとしてログインできるか
          </li>
          <li>安全版: 同じペイロードでログインが失敗するか</li>
          <li>脆弱版: UNION SELECT でusersテーブルのデータが検索結果に混入するか</li>
          <li>安全版: UNION SELECT が文字列として検索されるだけか</li>
          <li>
            パラメータ化クエリ (<code>$1</code>) と文字列結合の違いを理解したか
          </li>
        </ul>
      </CheckpointBox>
    </>
  );
}
