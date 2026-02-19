import { useState, useCallback } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

const BASE = "/api/labs/csrf";

type ApiResult = {
  success: boolean;
  message: string;
  sessionId?: string;
  username?: string;
  email?: string;
  currentPassword?: string;
  csrfToken?: string;
};

// --- 脆弱バージョン ---
function VulnerableDemo() {
  const [loginResult, setLoginResult] = useState<ApiResult | null>(null);
  const [profileResult, setProfileResult] = useState<ApiResult | null>(null);
  const [changeResult, setChangeResult] = useState<ApiResult | null>(null);
  const [newPassword, setNewPassword] = useState("hacked123");
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/vulnerable/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: "alice", password: "alice123" }),
      });
      const data = await res.json();
      setLoginResult(data);
      setProfileResult(null);
      setChangeResult(null);
    } catch (e) {
      setLoginResult({ success: false, message: (e as Error).message });
    }
    setLoading(false);
  }, []);

  const handleProfile = useCallback(async () => {
    try {
      const res = await fetch(`${BASE}/vulnerable/profile`, {
        credentials: "include",
      });
      const data = await res.json();
      setProfileResult(data);
    } catch {
      // ignore
    }
  }, []);

  // ⚠️ CSRF攻撃をシミュレート: 外部サイトからのリクエストを模倣
  const handleCsrfAttack = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/vulnerable/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      setChangeResult(data);
      // プロフィールを再取得してパスワードが変わったことを確認
      handleProfile();
    } catch (e) {
      setChangeResult({ success: false, message: (e as Error).message });
    }
    setLoading(false);
  }, [newPassword, handleProfile]);

  return (
    <div>
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
        </div>
      )}

      {loginResult?.success && (
        <>
          <div className="mt-3">
            <FetchButton onClick={handleProfile} disabled={loading} size="small">
              プロフィール確認
            </FetchButton>
            {profileResult && (
              <div className="mt-1 p-2 bg-[#f5f5f5] rounded text-xs">
                <div>ユーザー: {profileResult.username}</div>
                <div>メール: {profileResult.email}</div>
                <div>現在のパスワード: <code>{profileResult.currentPassword}</code></div>
              </div>
            )}
          </div>

          <div className="mt-3 p-3 bg-[#fff3e0] border border-[#ff9800] rounded">
            <div className="text-xs font-bold text-[#e65100] mb-1">
              CSRF攻撃シミュレーション（罠ページからのリクエスト）
            </div>
            <div className="mb-2">
              <label className="text-[11px] block">攻撃者が変更するパスワード:</label>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="py-1 px-2 border border-[#ccc] rounded w-full text-xs"
              />
            </div>
            <FetchButton onClick={handleCsrfAttack} disabled={loading} size="small">
              CSRF攻撃を実行（CSRFトークンなし）
            </FetchButton>

            {changeResult && (
              <div
                className={`mt-2 p-2 rounded text-xs ${
                  changeResult.success
                    ? "bg-[#ffebee] border border-[#f44336]"
                    : "bg-[#e8f5e9] border border-[#4caf50]"
                }`}
              >
                <div className="font-bold">
                  {changeResult.success ? "攻撃成功!" : "攻撃失敗"}
                </div>
                <div>{changeResult.message}</div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// --- 安全バージョン ---
function SecureDemo() {
  const [loginResult, setLoginResult] = useState<ApiResult | null>(null);
  const [csrfToken, setCsrfToken] = useState("");
  const [changeResult, setChangeResult] = useState<ApiResult | null>(null);
  const [attackResult, setAttackResult] = useState<ApiResult | null>(null);
  const [newPassword, setNewPassword] = useState("newpassword123");
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/secure/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: "alice", password: "alice123" }),
      });
      const data = await res.json();
      setLoginResult(data);
      setChangeResult(null);
      setAttackResult(null);
      setCsrfToken("");
    } catch (e) {
      setLoginResult({ success: false, message: (e as Error).message });
    }
    setLoading(false);
  }, []);

  const handleGetToken = useCallback(async () => {
    try {
      const res = await fetch(`${BASE}/secure/csrf-token`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.csrfToken) setCsrfToken(data.csrfToken);
    } catch {
      // ignore
    }
  }, []);

  // ✅ 正規のパスワード変更（CSRFトークン付き）
  const handleLegitChange = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/secure/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ newPassword, csrfToken }),
      });
      const data = await res.json();
      setChangeResult(data);
    } catch (e) {
      setChangeResult({ success: false, message: (e as Error).message });
    }
    setLoading(false);
  }, [newPassword, csrfToken]);

  // ⚠️ CSRF攻撃を試みる（トークンなし）
  const handleCsrfAttack = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/secure/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ newPassword: "hacked123" }),
      });
      const data = await res.json();
      setAttackResult(data);
    } catch (e) {
      setAttackResult({ success: false, message: (e as Error).message });
    }
    setLoading(false);
  }, []);

  return (
    <div>
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
        </div>
      )}

      {loginResult?.success && (
        <>
          {/* 正規のパスワード変更フロー */}
          <div className="mt-3 p-3 bg-[#e8f5e9] border border-[#4caf50] rounded">
            <div className="text-xs font-bold text-[#2e7d32] mb-1">
              正規のパスワード変更（CSRFトークン付き）
            </div>
            <div className="flex gap-2 mb-2">
              <FetchButton onClick={handleGetToken} disabled={loading} size="small">
                CSRFトークンを取得
              </FetchButton>
            </div>
            {csrfToken && (
              <div className="p-1 bg-[#f5f5f5] rounded text-[11px] font-mono mb-2 break-all">
                Token: {csrfToken}
              </div>
            )}
            <div className="mb-2">
              <label className="text-[11px] block">新しいパスワード:</label>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="py-1 px-2 border border-[#ccc] rounded w-full text-xs"
              />
            </div>
            <FetchButton
              onClick={handleLegitChange}
              disabled={loading || !csrfToken}
              size="small"
            >
              パスワード変更（トークン付き）
            </FetchButton>
            {changeResult && (
              <div
                className={`mt-2 p-2 rounded text-xs ${
                  changeResult.success
                    ? "bg-[#e8f5e9] border border-[#4caf50]"
                    : "bg-[#ffebee] border border-[#f44336]"
                }`}
              >
                {changeResult.message}
              </div>
            )}
          </div>

          {/* CSRF攻撃の試行 */}
          <div className="mt-3 p-3 bg-[#fff3e0] border border-[#ff9800] rounded">
            <div className="text-xs font-bold text-[#e65100] mb-1">
              CSRF攻撃シミュレーション（トークンなし）
            </div>
            <FetchButton onClick={handleCsrfAttack} disabled={loading} size="small">
              CSRF攻撃を実行（トークンなしで送信）
            </FetchButton>
            {attackResult && (
              <div
                className={`mt-2 p-2 rounded text-xs ${
                  attackResult.success
                    ? "bg-[#ffebee] border border-[#f44336]"
                    : "bg-[#e8f5e9] border border-[#4caf50]"
                }`}
              >
                <div className="font-bold">
                  {attackResult.success ? "攻撃成功（問題あり）" : "攻撃失敗（防御成功）"}
                </div>
                <div>{attackResult.message}</div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// --- メインコンポーネント ---
export function Csrf() {
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
      title="Cross-Site Request Forgery (CSRF)"
      subtitle="被害者のブラウザを使って勝手にリクエストを送る"
      description="ログイン中のユーザーが攻撃者の用意した罠ページを開くだけで、パスワード変更などの操作が本人の意図なく実行されてしまう脆弱性です。CSRFトークンによるリクエスト検証で防御します。"
    >
      <div className="mt-2">
        <button onClick={handleReset} className="text-xs p-1 cursor-pointer">
          全データリセット
        </button>
      </div>

      <h3 className="mt-4">Lab: CSRF攻撃によるパスワード変更</h3>
      <p className="text-sm text-[#666]">
        脆弱版ではCSRFトークンなしでパスワード変更が成功します（外部サイトからのリクエストでも成功する）。
        安全版ではCSRFトークンが必要で、トークンなしのリクエストは拒否されます。
      </p>

      <ComparisonPanel
        vulnerableContent={<VulnerableDemo />}
        secureContent={<SecureDemo />}
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: CSRFトークンなしでパスワード変更が成功するか</li>
          <li>安全版: CSRFトークンなしだと403エラーで拒否されるか</li>
          <li>安全版: CSRFトークン付きなら正常に変更できるか</li>
          <li>CSRF攻撃が成立するための3つの条件を説明できるか</li>
          <li>CSRFトークンが攻撃を無効化する仕組みを理解したか</li>
          <li><code>SameSite=Strict</code> がCSRF防御に有効な理由を理解したか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
