import { useState, useCallback } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

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

  const handleLogin = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: "alice", password: "alice123" }),
      });
      const data = await res.json();
      setLoginResult(data);
      setDocumentCookie(document.cookie);
    } catch (e) {
      setLoginResult({ success: false, message: (e as Error).message });
    }
    setLoading(false);
  }, [mode]);

  const handlePostComment = useCallback(async () => {
    setLoading(true);
    try {
      await fetch(`${BASE}/${mode}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: commentInput }),
      });
      // コメント一覧を再取得
      const res = await fetch(`${BASE}/${mode}/comments`, {
        credentials: "include",
      });
      const data = await res.json();
      setComments(data.comments || []);
    } catch {
      // ignore
    }
    setLoading(false);
  }, [mode, commentInput]);

  const handleLoadComments = useCallback(async () => {
    try {
      const res = await fetch(`${BASE}/${mode}/comments`, {
        credentials: "include",
      });
      const data = await res.json();
      setComments(data.comments || []);
    } catch {
      // ignore
    }
  }, [mode]);

  const handleCheckProfile = useCallback(async () => {
    try {
      const res = await fetch(`${BASE}/${mode}/profile`, {
        credentials: "include",
      });
      const data = await res.json();
      setProfileResult(data);
      setDocumentCookie(document.cookie);
    } catch {
      // ignore
    }
  }, [mode]);

  return (
    <div>
      {/* ログイン */}
      <FetchButton onClick={handleLogin} disabled={loading}>
        alice でログイン
      </FetchButton>

      {loginResult && (
        <div
          className={`mt-2 p-2 rounded text-xs ${
            loginResult.success
              ? "bg-[#e8f5e9] border border-[#4caf50]"
              : "bg-[#ffebee] border border-[#f44336]"
          }`}
        >
          {loginResult.message}
          {loginResult.sessionId && (
            <div className="font-mono text-[11px] text-[#666]">
              SessionID: {loginResult.sessionId}
            </div>
          )}
        </div>
      )}

      {/* document.cookie 確認 */}
      <div className="mt-2 p-2 bg-[#fff8e1] rounded text-xs">
        <strong>document.cookie:</strong>
        <pre className="m-0 mt-1 font-mono text-[11px] whitespace-pre-wrap break-all">
          {documentCookie || "(空)"}
        </pre>
        <button
          onClick={() => setDocumentCookie(document.cookie)}
          className="text-[11px] mt-1 cursor-pointer"
        >
          再取得
        </button>
      </div>

      {/* コメント投稿 (XSS テスト) */}
      {loginResult?.success && (
        <div className="mt-3">
          <label className="text-[13px] block">コメント (XSSペイロードを入力):</label>
          <textarea
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            className="py-1 px-2 border border-[#ccc] rounded w-full text-xs font-mono"
            rows={2}
          />
          <div className="flex gap-2 mt-1">
            <FetchButton onClick={handlePostComment} disabled={loading} size="small">
              投稿
            </FetchButton>
            <FetchButton onClick={handleLoadComments} disabled={loading} size="small">
              一覧を読込
            </FetchButton>
            <FetchButton onClick={handleCheckProfile} disabled={loading} size="small">
              プロフィール確認
            </FetchButton>
          </div>
        </div>
      )}

      {/* コメント一覧 */}
      {comments.length > 0 && (
        <div className="mt-3">
          <strong className="text-xs">コメント一覧:</strong>
          {comments.map((c) => (
            <div key={c.id} className="p-2 mt-1 bg-[#f5f5f5] rounded text-xs">
              <div className="font-bold">{c.username}</div>
              {mode === "vulnerable" ? (
                // ⚠️ 脆弱版: dangerouslySetInnerHTML で XSS が発動する
                <div dangerouslySetInnerHTML={{ __html: c.content }} />
              ) : (
                // ✅ 安全版: テキストとして表示（HTMLはエスケープ済み）
                <div>{c.content}</div>
              )}
              <div className="text-[11px] text-[#888]">{c.createdAt}</div>
            </div>
          ))}
        </div>
      )}

      {/* プロフィール結果 */}
      {profileResult && (
        <div className="mt-2 p-2 bg-[#f5f5f5] rounded text-xs">
          <strong>プロフィール:</strong>
          <pre className="m-0 mt-1 text-[11px]">
            {JSON.stringify(profileResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// --- メインコンポーネント ---
export function SessionHijacking() {
  const handleReset = useCallback(async () => {
    try {
      await fetch(`${BASE}/reset`, { method: "POST" });
    } catch {
      // ignore
    }
    window.location.reload();
  }, []);

  return (
    <LabLayout
      title="Session Hijacking"
      subtitle="XSSで盗んだセッションIDで他人になりすます"
      description="XSS脆弱性を利用してCookieからセッションIDを盗み出し、そのIDを使って被害者のアカウントに不正アクセスする攻撃です。HttpOnly属性がないCookieはJavaScriptから読み取り可能です。"
    >
      <div className="mt-2">
        <button onClick={handleReset} className="text-xs p-1 cursor-pointer">
          全データリセット
        </button>
      </div>

      <h3 className="mt-4">Lab: XSSによるセッションID窃取</h3>
      <p className="text-sm text-[#666]">
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
