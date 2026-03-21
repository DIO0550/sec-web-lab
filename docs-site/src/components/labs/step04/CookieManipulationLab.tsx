import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { Input } from '@site/src/components/lab-ui/Input';
import { Alert } from '@site/src/components/lab-ui/Alert';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import styles from './CookieManipulationLab.module.css';

const BASE = '/api/labs/cookie-manipulation';

// credentials: 'include' 付きの POST ヘルパー
async function postWithCredentials<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  return res.json() as Promise<T>;
}

// credentials: 'include' 付きの GET ヘルパー
async function getWithCredentials<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: 'include' });
  return res.json() as Promise<T>;
}

type LoginResult = {
  success: boolean;
  message: string;
  sessionId?: string;
  cookieAttributes?: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: string;
  };
};

type CookieInfoResult = {
  success: boolean;
  message?: string;
  username?: string;
  sessionId?: string;
  vulnerabilities?: string[];
  protections?: string[];
};

// --- ログインフォーム ---
function LoginForm({
  mode,
  result,
  isLoading,
  onSubmit,
  onCheckCookie,
  cookieInfo,
  documentCookie,
}: {
  mode: 'vulnerable' | 'secure';
  result: LoginResult | null;
  isLoading: boolean;
  onSubmit: (mode: 'vulnerable' | 'secure', username: string, password: string) => void;
  onCheckCookie: (mode: 'vulnerable' | 'secure') => void;
  cookieInfo: CookieInfoResult | null;
  documentCookie: string;
}) {
  const [username, setUsername] = useState('alice');
  const [password, setPassword] = useState('alice123');

  return (
    <div>
      <div className={styles.formFields}>
        <Input
          label="ユーザー名"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          label="パスワード"
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <FetchButton onClick={() => onSubmit(mode, username, password)} disabled={isLoading}>
          ログイン
        </FetchButton>
      </div>

      <ExpandableSection isOpen={!!result}>
        <Alert
          variant={result?.success ? 'success' : 'error'}
          title={result?.success ? 'ログイン成功' : 'ログイン失敗'}
          className={styles.resultAlert}
        >
          <div className={styles.resultMessage}>{result?.message}</div>
          {result?.cookieAttributes && (
            <div className={styles.cookieAttrs}>
              <div><strong>Cookie属性:</strong></div>
              <div>HttpOnly: {result.cookieAttributes.httpOnly ? '✅ 有効' : '❌ 無効'}</div>
              <div>Secure: {result.cookieAttributes.secure ? '✅ 有効' : '❌ 無効'}</div>
              <div>SameSite: {result.cookieAttributes.sameSite}</div>
            </div>
          )}
        </Alert>
      </ExpandableSection>

      {result?.success && (
        <div className={styles.cookieSection}>
          <FetchButton onClick={() => onCheckCookie(mode)} disabled={isLoading}>
            Cookie情報を確認
          </FetchButton>

          <ExpandableSection isOpen={!!cookieInfo}>
            <div className={styles.cookieInfoBox}>
              {cookieInfo?.vulnerabilities && (
                <div>
                  <strong className={styles.vulnLabel}>脆弱性:</strong>
                  <ul className={styles.infoList}>
                    {cookieInfo.vulnerabilities.map((v, i) => (
                      <li key={i}>{v}</li>
                    ))}
                  </ul>
                </div>
              )}
              {cookieInfo?.protections && (
                <div>
                  <strong className={styles.protectLabel}>保護:</strong>
                  <ul className={styles.infoList}>
                    {cookieInfo.protections.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </ExpandableSection>

          <div className={styles.documentCookieBox}>
            <strong>document.cookie の値:</strong>
            <pre className={styles.documentCookiePre}>
              {documentCookie || '(空 — HttpOnly の Cookie は表示されません)'}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Cookie操作ラボUI
 *
 * Cookie属性（HttpOnly, Secure, SameSite）の有無による脆弱性を体験する。
 */
export function CookieManipulationLab() {
  const [vulnResult, setVulnResult] = useState<LoginResult | null>(null);
  const [secureResult, setSecureResult] = useState<LoginResult | null>(null);
  const [vulnCookieInfo, setVulnCookieInfo] = useState<CookieInfoResult | null>(null);
  const [secureCookieInfo, setSecureCookieInfo] = useState<CookieInfoResult | null>(null);
  const [documentCookie, setDocumentCookie] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (mode: 'vulnerable' | 'secure', username: string, password: string) => {
    setLoading(true);
    if (mode === 'vulnerable') {
      setVulnCookieInfo(null);
    } else {
      setSecureCookieInfo(null);
    }
    try {
      const data = await postWithCredentials<LoginResult>(`${BASE}/${mode}/login`, { username, password });
      if (mode === 'vulnerable') {
        setVulnResult(data);
      } else {
        setSecureResult(data);
      }
      setDocumentCookie(document.cookie);
    } catch (e) {
      const errorResult: LoginResult = { success: false, message: e instanceof Error ? e.message : String(e) };
      if (mode === 'vulnerable') {
        setVulnResult(errorResult);
      } else {
        setSecureResult(errorResult);
      }
    }
    setLoading(false);
  };

  const handleCheckCookie = async (mode: 'vulnerable' | 'secure') => {
    try {
      const data = await getWithCredentials<CookieInfoResult>(`${BASE}/${mode}/cookie-info`);
      if (mode === 'vulnerable') {
        setVulnCookieInfo(data);
      } else {
        setSecureCookieInfo(data);
      }
      setDocumentCookie(document.cookie);
    } catch {
      // ignore
    }
  };

  return (
    <>
      <h3>Lab: ログインしてCookie属性を比較</h3>
      <p className={styles.description}>
        両方のバージョンでログインし、発行されるCookieの属性の違いを確認してください。
        脆弱版では <code>document.cookie</code> でセッションIDが読み取れますが、
        安全版では <code>HttpOnly</code> により読み取れません。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <LoginForm
            mode="vulnerable"
            result={vulnResult}
            isLoading={loading}
            onSubmit={handleLogin}
            onCheckCookie={handleCheckCookie}
            cookieInfo={vulnCookieInfo}
            documentCookie={documentCookie}
          />
        }
        secureContent={
          <LoginForm
            mode="secure"
            result={secureResult}
            isLoading={loading}
            onSubmit={handleLogin}
            onCheckCookie={handleCheckCookie}
            cookieInfo={secureCookieInfo}
            documentCookie={documentCookie}
          />
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: <code>document.cookie</code> でセッションIDが表示されるか</li>
          <li>安全版: <code>document.cookie</code> にセッションIDが含まれないか</li>
          <li>DevTools → Application → Cookies でHttpOnly列を確認したか</li>
          <li>HttpOnly・Secure・SameSite のそれぞれが防ぐ攻撃は何か説明できるか</li>
          <li>3つの属性をすべて設定する必要がある理由を理解したか</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
