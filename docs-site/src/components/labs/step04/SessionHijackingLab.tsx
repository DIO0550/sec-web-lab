import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { Button } from '@site/src/components/lab-ui/Button';
import { Textarea } from '@site/src/components/lab-ui/Textarea';
import { Alert } from '@site/src/components/lab-ui/Alert';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import styles from './SessionHijackingLab.module.css';

const BASE = '/api/labs/session-hijacking';

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
};

type Comment = {
  id: number;
  username: string;
  content: string;
  createdAt: string;
};

type ProfileResult = {
  success: boolean;
  message?: string;
  username?: string;
  sessionId?: string;
  warning?: string;
  info?: string;
};

// --- ログイン + コメント投稿 + XSS テスト ---
function HijackingDemo({ mode }: { mode: 'vulnerable' | 'secure' }) {
  const [loginResult, setLoginResult] = useState<LoginResult | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState(
    '<img src=x onerror="alert(document.cookie)">',
  );
  const [profileResult, setProfileResult] = useState<ProfileResult | null>(null);
  const [documentCookie, setDocumentCookie] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const data = await postWithCredentials<LoginResult>(
        `${BASE}/${mode}/login`,
        { username: 'alice', password: 'alice123' },
      );
      setLoginResult(data);
      setDocumentCookie(document.cookie);
    } catch (e) {
      setLoginResult({ success: false, message: (e as Error).message });
    }
    setLoading(false);
  };

  const handlePostComment = async () => {
    setLoading(true);
    try {
      await postWithCredentials(`${BASE}/${mode}/comment`, { content: commentInput });
      const data = await getWithCredentials<{ comments?: Comment[] }>(`${BASE}/${mode}/comments`);
      setComments(data.comments ?? []);
    } catch {
      // ignore
    }
    setLoading(false);
  };

  const handleLoadComments = async () => {
    try {
      const data = await getWithCredentials<{ comments?: Comment[] }>(`${BASE}/${mode}/comments`);
      setComments(data.comments ?? []);
    } catch {
      // ignore
    }
  };

  const handleCheckProfile = async () => {
    try {
      const data = await getWithCredentials<ProfileResult>(`${BASE}/${mode}/profile`);
      setProfileResult(data);
      setDocumentCookie(document.cookie);
    } catch {
      // ignore
    }
  };

  return (
    <div>
      {/* ログイン */}
      <FetchButton onClick={handleLogin} disabled={loading}>
        alice でログイン
      </FetchButton>

      <ExpandableSection isOpen={!!loginResult}>
        <Alert
          variant={loginResult?.success ? 'success' : 'error'}
          className={styles.resultAlert}
        >
          <div className={styles.smallText}>{loginResult?.message}</div>
          {loginResult?.sessionId && (
            <div className={styles.sessionId}>SessionID: {loginResult.sessionId}</div>
          )}
        </Alert>
      </ExpandableSection>

      {/* document.cookie 確認 */}
      <div className={styles.documentCookieBox}>
        <strong>document.cookie:</strong>
        <pre className={styles.documentCookiePre}>{documentCookie || '(空)'}</pre>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDocumentCookie(document.cookie)}
          className={styles.refreshBtn}
        >
          再取得
        </Button>
      </div>

      {/* コメント投稿 (XSS テスト) */}
      {loginResult?.success && (
        <div className={styles.commentSection}>
          <Textarea
            label="コメント (XSSペイロードを入力)"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            rows={2}
          />
          <div className={styles.buttonRow}>
            <FetchButton onClick={handlePostComment} disabled={loading}>
              投稿
            </FetchButton>
            <FetchButton onClick={handleLoadComments} disabled={loading}>
              一覧を読込
            </FetchButton>
            <FetchButton onClick={handleCheckProfile} disabled={loading}>
              プロフィール確認
            </FetchButton>
          </div>
        </div>
      )}

      {/* コメント一覧 */}
      <ExpandableSection isOpen={comments.length > 0}>
        <div className={styles.commentList}>
          <strong className={styles.smallText}>コメント一覧:</strong>
          {comments.map((c) => (
            <div key={c.id} className={styles.commentItem}>
              <div className={styles.commentAuthor}>{c.username}</div>
              {mode === 'vulnerable' ? (
                // ⚠️ 脆弱版: dangerouslySetInnerHTML で XSS が発動する
                <div dangerouslySetInnerHTML={{ __html: c.content }} />
              ) : (
                // ✅ 安全版: テキストとして表示（HTMLはエスケープ済み）
                <div>{c.content}</div>
              )}
              <div className={styles.commentDate}>{c.createdAt}</div>
            </div>
          ))}
        </div>
      </ExpandableSection>

      {/* プロフィール結果 */}
      <ExpandableSection isOpen={!!profileResult}>
        <div className={styles.profileBox}>
          <strong>プロフィール:</strong>
          <pre className={styles.profilePre}>
            {JSON.stringify(profileResult, null, 2)}
          </pre>
        </div>
      </ExpandableSection>
    </div>
  );
}

/**
 * セッションハイジャックラボUI
 *
 * XSSでCookieからセッションIDを盗み出し、被害者になりすます攻撃を体験する。
 */
export function SessionHijackingLab() {
  const handleReset = async () => {
    try {
      await fetch(`${BASE}/reset`, { method: 'POST' });
    } catch {
      // ignore
    }
    window.location.reload();
  };

  return (
    <>
      <div className={styles.resetRow}>
        <Button variant="secondary" size="sm" onClick={handleReset}>
          全データリセット
        </Button>
      </div>

      <h3>Lab: XSSによるセッションID窃取</h3>
      <p className={styles.description}>
        ログイン後、XSSペイロードをコメントとして投稿してください。
        脆弱版では <code>document.cookie</code> でセッションIDが読み取れ、
        XSS経由で窃取可能です。安全版では <code>HttpOnly</code> によりJavaScriptからアクセスできません。
      </p>

      <ComparisonPanel
        vulnerableContent={<HijackingDemo mode="vulnerable" />}
        secureContent={<HijackingDemo mode="secure" />}
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: <code>document.cookie</code> にセッションIDが表示されるか</li>
          <li>脆弱版: XSSペイロードが実行されるか（alertが表示されるか）</li>
          <li>安全版: <code>document.cookie</code> にセッションIDが含まれないか</li>
          <li>安全版: XSSペイロードがエスケープされて無害化されているか</li>
          <li>HttpOnly属性がセッションID窃取を防ぐ仕組みを理解したか</li>
          <li>HttpOnlyだけでは不十分で、XSS自体の防止が最重要であることを理解したか</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
