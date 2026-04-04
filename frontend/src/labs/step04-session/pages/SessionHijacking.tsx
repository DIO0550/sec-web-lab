import { useState } from "react";
import { LabLayout } from "@/components/LabLayout";
import { ComparisonPanel } from "@/components/ComparisonPanel";
import { FetchButton } from "@/components/FetchButton";
import { CheckpointBox } from "@/components/CheckpointBox";
import { Button } from "@/components/Button";
import { Textarea } from "@/components/Textarea";
import { Alert } from "@/components/Alert";
import { ExpandableSection } from "@/components/ExpandableSection";
import { postJsonWithCredentials, getJson } from "@/utils/api";

const BASE = "/api/labs/session-hijacking";

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
function HijackingDemo({
  mode,
}: {
  mode: "vulnerable" | "secure";
}) {
  const [loginResult, setLoginResult] = useState<LoginResult | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState(
    mode === "vulnerable"
      ? '<img src=x onerror="alert(document.cookie)">'
      : '<img src=x onerror="alert(document.cookie)">'
  );
  const [profileResult, setProfileResult] = useState<ProfileResult | null>(null);
  const [documentCookie, setDocumentCookie] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const data = await postJsonWithCredentials<LoginResult>(
        `${BASE}/${mode}/login`,
        { username: "alice", password: "alice123" },
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
      await postJsonWithCredentials(`${BASE}/${mode}/comment`, { content: commentInput });
      // コメント一覧を再取得
      const data = await getJson<{ comments?: Comment[] }>(`${BASE}/${mode}/comments`, {
        credentials: "include",
      });
      setComments(data.comments || []);
    } catch {
      // ignore
    }
    setLoading(false);
  };

  const handleLoadComments = async () => {
    try {
      const data = await getJson<{ comments?: Comment[] }>(`${BASE}/${mode}/comments`, {
        credentials: "include",
      });
      setComments(data.comments || []);
    } catch {
      // ignore
    }
  };

  const handleCheckProfile = async () => {
    try {
      const data = await getJson<ProfileResult>(`${BASE}/${mode}/profile`, {
        credentials: "include",
      });
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
          variant={loginResult?.success ? "success" : "error"}
          className="mt-2 text-xs"
        >
          {loginResult?.message}
          {loginResult?.sessionId && (
            <div className="font-mono text-xs opacity-70">
              SessionID: {loginResult?.sessionId}
            </div>
          )}
        </Alert>
      </ExpandableSection>

      {/* document.cookie 確認 */}
      <div className="mt-2 p-2 bg-warning-bg rounded text-xs">
        <strong>document.cookie:</strong>
        <pre className="m-0 mt-1 font-mono text-xs whitespace-pre-wrap break-all">
          {documentCookie || "(空)"}
        </pre>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDocumentCookie(document.cookie)}
          className="mt-1"
        >
          再取得
        </Button>
      </div>

      {/* コメント投稿 (XSS テスト) */}
      {loginResult?.success && (
        <div className="mt-3">
          <Textarea
            label="コメント (XSSペイロードを入力)"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            rows={2}
            mono
          />
          <div className="flex gap-2 mt-1">
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
        <div className="mt-3">
          <strong className="text-xs">コメント一覧:</strong>
          {comments.map((c) => (
            <div key={c.id} className="p-2 mt-1 bg-code-bg text-code-text rounded text-xs">
              <div className="font-bold">{c.username}</div>
              {mode === "vulnerable" ? (
                // ⚠️ 脆弱版: dangerouslySetInnerHTML で XSS が発動する
                <div dangerouslySetInnerHTML={{ __html: c.content }} />
              ) : (
                // ✅ 安全版: テキストとして表示（HTMLはエスケープ済み）
                <div>{c.content}</div>
              )}
              <div className="text-xs text-text-muted">{c.createdAt}</div>
            </div>
          ))}
        </div>
      </ExpandableSection>

      {/* プロフィール結果 */}
      <ExpandableSection isOpen={!!profileResult}>
        <div className="mt-2 p-2 bg-code-bg text-code-text rounded text-xs">
          <strong>プロフィール:</strong>
          <pre className="m-0 mt-1 text-xs">
            {JSON.stringify(profileResult, null, 2)}
          </pre>
        </div>
      </ExpandableSection>
    </div>
  );
}

// --- メインコンポーネント ---
export function SessionHijacking() {
  const handleReset = async () => {
    try {
      await fetch(`${BASE}/reset`, { method: "POST" });
    } catch {
      // ignore
    }
    window.location.reload();
  };

  return (
    <LabLayout
      title="Session Hijacking"
      subtitle="XSSで盗んだセッションIDで他人になりすます"
      description="XSS脆弱性を利用してCookieからセッションIDを盗み出し、そのIDを使って被害者のアカウントに不正アクセスする攻撃です。HttpOnly属性がないCookieはJavaScriptから読み取り可能です。"
    >
      <div className="mt-2">
        <Button variant="secondary" size="sm" onClick={handleReset}>
          全データリセット
        </Button>
      </div>

      <h3 className="mt-4">Lab: XSSによるセッションID窃取</h3>
      <p className="text-sm text-text-secondary">
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
    </LabLayout>
  );
}
