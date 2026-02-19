import { useState, useCallback } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

const BASE = "/api/labs/privilege-escalation";

type LoginResult = {
  success: boolean;
  message: string;
  sessionId?: string;
  user?: { id: number; username: string; role: string };
};

type UsersResult = {
  success: boolean;
  message?: string;
  users?: Array<Record<string, unknown>>;
  _debug?: { message: string; currentUser: Record<string, unknown>; requiredRole?: string };
};

type SettingsResult = {
  success: boolean;
  message?: string;
  settings?: Record<string, unknown>;
  _debug?: { message: string; currentUser: Record<string, unknown> };
};

// --- ログインフォーム ---
function LoginForm({
  mode,
  loginResult,
  isLoading,
  onLogin,
}: {
  mode: "vulnerable" | "secure";
  loginResult: LoginResult | null;
  isLoading: boolean;
  onLogin: (mode: "vulnerable" | "secure", username: string, password: string) => void;
}) {
  const [username, setUsername] = useState("user1");
  const [password, setPassword] = useState("password1");

  const presets = [
    { label: "user1 (一般)", username: "user1", password: "password1" },
    { label: "admin (管理者)", username: "admin", password: "admin123" },
  ];

  return (
    <div className="mb-3">
      <div className="mb-1">
        <label className="text-[13px] block">ユーザー名:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="py-1 px-2 border border-[#ccc] rounded w-full"
        />
      </div>
      <div className="mb-1">
        <label className="text-[13px] block">パスワード:</label>
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="py-1 px-2 border border-[#ccc] rounded w-full"
        />
      </div>
      <FetchButton onClick={() => onLogin(mode, username, password)} disabled={isLoading}>
        ログイン
      </FetchButton>
      <div className="flex gap-1 flex-wrap mt-1">
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => { setUsername(p.username); setPassword(p.password); }}
            className="text-[11px] py-0.5 px-2 cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>
      {loginResult && (
        <div className={`mt-2 p-2 rounded text-xs ${loginResult.success ? "bg-[#e8f5e9]" : "bg-[#ffebee]"}`}>
          {loginResult.message}
          {loginResult.user && (
            <span className="ml-1">(role: <strong>{loginResult.user.role}</strong>)</span>
          )}
        </div>
      )}
    </div>
  );
}

// --- メインコンポーネント ---
export function PrivilegeEscalation() {
  const [vulnSession, setVulnSession] = useState<string | null>(null);
  const [secureSession, setSecureSession] = useState<string | null>(null);
  const [vulnLogin, setVulnLogin] = useState<LoginResult | null>(null);
  const [secureLogin, setSecureLogin] = useState<LoginResult | null>(null);
  const [vulnUsers, setVulnUsers] = useState<UsersResult | null>(null);
  const [secureUsers, setSecureUsers] = useState<UsersResult | null>(null);
  const [vulnSettings, setVulnSettings] = useState<SettingsResult | null>(null);
  const [secureSettings, setSecureSettings] = useState<SettingsResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(async (mode: "vulnerable" | "secure", username: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data: LoginResult = await res.json();
      if (mode === "vulnerable") {
        setVulnLogin(data);
        if (data.sessionId) setVulnSession(data.sessionId);
      } else {
        setSecureLogin(data);
        if (data.sessionId) setSecureSession(data.sessionId);
      }
    } catch (e) {
      const err = { success: false, message: (e as Error).message };
      if (mode === "vulnerable") setVulnLogin(err);
      else setSecureLogin(err);
    }
    setLoading(false);
  }, []);

  const fetchUsers = useCallback(async (mode: "vulnerable" | "secure") => {
    const sessionId = mode === "vulnerable" ? vulnSession : secureSession;
    if (!sessionId) return;

    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/admin/users`, {
        headers: { "X-Session-Id": sessionId },
      });
      const data: UsersResult = await res.json();
      if (mode === "vulnerable") setVulnUsers(data);
      else setSecureUsers(data);
    } catch (e) {
      const err = { success: false, message: (e as Error).message };
      if (mode === "vulnerable") setVulnUsers(err);
      else setSecureUsers(err);
    }
    setLoading(false);
  }, [vulnSession, secureSession]);

  const changeSettings = useCallback(async (mode: "vulnerable" | "secure") => {
    const sessionId = mode === "vulnerable" ? vulnSession : secureSession;
    if (!sessionId) return;

    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/admin/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-Session-Id": sessionId },
        body: JSON.stringify({ maintenance_mode: true }),
      });
      const data: SettingsResult = await res.json();
      if (mode === "vulnerable") setVulnSettings(data);
      else setSecureSettings(data);
    } catch (e) {
      const err = { success: false, message: (e as Error).message };
      if (mode === "vulnerable") setVulnSettings(err);
      else setSecureSettings(err);
    }
    setLoading(false);
  }, [vulnSession, secureSession]);

  const renderResult = (result: UsersResult | SettingsResult | null, type: "users" | "settings") => {
    if (!result) return null;
    return (
      <div className={`mt-2 p-3 rounded ${result.success ? "bg-[#e8f5e9] border border-[#4caf50]" : "bg-[#ffebee] border border-[#f44336]"}`}>
        <div className={`font-bold text-sm ${result.success ? "text-[#2e7d32]" : "text-[#c62828]"}`}>
          {result.success ? (type === "users" ? "ユーザー一覧取得成功" : "設定変更成功") : "アクセス拒否"}
        </div>
        {result.message && <div className="text-[13px]">{result.message}</div>}
        {type === "users" && "users" in result && result.users && (
          <pre className="text-xs bg-[#f5f5f5] p-2 rounded mt-2 overflow-auto max-h-[200px]">
            {JSON.stringify(result.users, null, 2)}
          </pre>
        )}
        {type === "settings" && "settings" in result && result.settings && (
          <pre className="text-xs bg-[#f5f5f5] p-2 rounded mt-2 overflow-auto">
            {JSON.stringify(result.settings, null, 2)}
          </pre>
        )}
        {result._debug && (
          <div className="mt-2 text-xs text-[#888] italic">
            {result._debug.message}
          </div>
        )}
      </div>
    );
  };

  return (
    <LabLayout
      title="Privilege Escalation"
      subtitle="一般ユーザーが管理者の操作を実行する"
      description="管理者用APIにロール検証がない場合、一般ユーザーが直接URLを叩くだけで管理者限定の操作（ユーザー一覧取得、設定変更等）を実行できてしまう脆弱性を体験します。"
    >
      <h3 className="mt-6">Step 1: 一般ユーザーでログイン</h3>
      <p className="text-sm text-[#666]">
        まず <code>user1</code>（一般ユーザー、role: user）としてログインしてください。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <LoginForm mode="vulnerable" loginResult={vulnLogin} isLoading={loading} onLogin={handleLogin} />
        }
        secureContent={
          <LoginForm mode="secure" loginResult={secureLogin} isLoading={loading} onLogin={handleLogin} />
        }
      />

      <h3 className="mt-6">Step 2: 管理者用APIにアクセス</h3>
      <p className="text-sm text-[#666]">
        一般ユーザーのセッションで、管理者用のユーザー一覧APIにアクセスしてみてください。
        脆弱版では全ユーザー情報が取得でき、安全版では 403 エラーが返されます。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <div>
            <FetchButton onClick={() => fetchUsers("vulnerable")} disabled={loading || !vulnSession}>
              管理者用ユーザー一覧を取得
            </FetchButton>
            {!vulnSession && <p className="text-xs text-[#888] mt-1">先にログインしてください</p>}
            {renderResult(vulnUsers, "users")}
          </div>
        }
        secureContent={
          <div>
            <FetchButton onClick={() => fetchUsers("secure")} disabled={loading || !secureSession}>
              管理者用ユーザー一覧を取得
            </FetchButton>
            {!secureSession && <p className="text-xs text-[#888] mt-1">先にログインしてください</p>}
            {renderResult(secureUsers, "users")}
          </div>
        }
      />

      <h3 className="mt-6">Step 3: 管理者設定を変更</h3>
      <p className="text-sm text-[#666]">
        さらに、管理者用のシステム設定変更API（メンテナンスモード有効化）を実行してみてください。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <div>
            <FetchButton onClick={() => changeSettings("vulnerable")} disabled={loading || !vulnSession}>
              メンテナンスモードを有効化
            </FetchButton>
            {renderResult(vulnSettings, "settings")}
          </div>
        }
        secureContent={
          <div>
            <FetchButton onClick={() => changeSettings("secure")} disabled={loading || !secureSession}>
              メンテナンスモードを有効化
            </FetchButton>
            {renderResult(secureSettings, "settings")}
          </div>
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: 一般ユーザーで管理者APIにアクセスし、ユーザー一覧の取得と設定変更ができるか</li>
          <li>安全版: 同じ操作で 403 エラーが返されるか</li>
          <li>フロントエンドのUI制御（メニュー非表示）だけではセキュリティにならない理由を理解したか</li>
          <li>ミドルウェアによるロール検証のメリット（チェック漏れ防止）を説明できるか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
