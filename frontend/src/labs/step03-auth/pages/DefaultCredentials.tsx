import { useState, useCallback } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

const BASE = "/api/labs/default-credentials";

type LoginResult = {
  success: boolean;
  message: string;
  user?: { id: number; username: string; email: string; role: string };
  requirePasswordChange?: boolean;
  _debug?: { message: string };
};

type ChangePasswordResult = {
  success: boolean;
  message: string;
};

type DefaultCred = {
  username: string;
  password: string;
  source: string;
};

type DefaultsResult = {
  message: string;
  credentials: DefaultCred[];
};

// --- ログインフォーム ---
function LoginForm({
  mode,
  result,
  isLoading,
  onSubmit,
}: {
  mode: "vulnerable" | "secure";
  result: LoginResult | null;
  isLoading: boolean;
  onSubmit: (mode: "vulnerable" | "secure", username: string, password: string) => void;
}) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");

  const presets = [
    { label: "admin / admin123", username: "admin", password: "admin123" },
    { label: "admin / admin", username: "admin", password: "admin" },
    { label: "admin / password", username: "admin", password: "password" },
  ];

  return (
    <div>
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
        <FetchButton onClick={() => onSubmit(mode, username, password)} disabled={isLoading}>
          ログイン
        </FetchButton>
      </div>

      <div className="mb-3">
        <span className="text-xs text-[#888]">よくあるデフォルト認証情報:</span>
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
      </div>

      {result && (
        <div className={`mt-2 p-3 rounded ${result.success ? "bg-[#e8f5e9] border border-[#4caf50]" : result.requirePasswordChange ? "bg-[#fff3e0] border border-[#ff9800]" : "bg-[#ffebee] border border-[#f44336]"}`}>
          <div className={`font-bold ${result.success ? "text-[#2e7d32]" : result.requirePasswordChange ? "text-[#e65100]" : "text-[#c62828]"}`}>
            {result.success ? "ログイン成功" : result.requirePasswordChange ? "パスワード変更が必要" : "ログイン失敗"}
          </div>
          <div className="text-[13px]">{result.message}</div>
          {result.user && (
            <pre className="text-xs bg-[#f5f5f5] p-2 rounded mt-2">
              {JSON.stringify(result.user, null, 2)}
            </pre>
          )}
          {result._debug && (
            <div className="mt-2 text-xs text-[#888] italic">
              {result._debug.message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- パスワード変更フォーム ---
function ChangePasswordForm({
  changeResult,
  isLoading,
  onChangePassword,
}: {
  changeResult: ChangePasswordResult | null;
  isLoading: boolean;
  onChangePassword: (username: string, currentPassword: string, newPassword: string) => void;
}) {
  const [username, setUsername] = useState("admin");
  const [currentPassword, setCurrentPassword] = useState("admin123");
  const [newPassword, setNewPassword] = useState("");

  return (
    <div className="mt-3 p-3 border border-[#e0e0e0] rounded bg-[#fafafa]">
      <h4 className="m-0 mb-2 text-sm">パスワード変更</h4>
      <div className="mb-1">
        <label className="text-xs block">ユーザー名:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="py-1 px-2 border border-[#ccc] rounded w-full text-xs"
        />
      </div>
      <div className="mb-1">
        <label className="text-xs block">現在のパスワード:</label>
        <input
          type="text"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="py-1 px-2 border border-[#ccc] rounded w-full text-xs"
        />
      </div>
      <div className="mb-1">
        <label className="text-xs block">新しいパスワード:</label>
        <input
          type="text"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="py-1 px-2 border border-[#ccc] rounded w-full text-xs"
        />
      </div>
      <FetchButton
        onClick={() => onChangePassword(username, currentPassword, newPassword)}
        disabled={isLoading}
        size="small"
      >
        パスワード変更
      </FetchButton>

      {changeResult && (
        <div className={`mt-2 p-2 rounded text-xs ${changeResult.success ? "bg-[#e8f5e9]" : "bg-[#ffebee]"}`}>
          {changeResult.message}
        </div>
      )}
    </div>
  );
}

// --- メインコンポーネント ---
export function DefaultCredentials() {
  const [vulnLogin, setVulnLogin] = useState<LoginResult | null>(null);
  const [secureLogin, setSecureLogin] = useState<LoginResult | null>(null);
  const [changeResult, setChangeResult] = useState<ChangePasswordResult | null>(null);
  const [defaults, setDefaults] = useState<DefaultsResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(async (mode: "vulnerable" | "secure", username: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (mode === "vulnerable") setVulnLogin(data);
      else setSecureLogin(data);
    } catch (e) {
      const err = { success: false, message: (e as Error).message };
      if (mode === "vulnerable") setVulnLogin(err);
      else setSecureLogin(err);
    }
    setLoading(false);
  }, []);

  const handleChangePassword = useCallback(async (username: string, currentPassword: string, newPassword: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/secure/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, currentPassword, newPassword }),
      });
      const data = await res.json();
      setChangeResult(data);
    } catch (e) {
      setChangeResult({ success: false, message: (e as Error).message });
    }
    setLoading(false);
  }, []);

  const fetchDefaults = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/vulnerable/defaults`);
      const data = await res.json();
      setDefaults(data);
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  const resetSecure = useCallback(async () => {
    try {
      await fetch(`${BASE}/secure/reset`, { method: "POST" });
      setSecureLogin(null);
      setChangeResult(null);
    } catch {
      // ignore
    }
  }, []);

  return (
    <LabLayout
      title="Default Credentials"
      subtitle="初期パスワードのまま運用されたシステムに侵入する"
      description="admin/admin123 等のデフォルト認証情報が変更されないまま運用されていると、攻撃者が公開情報からパスワードを入手して即座に管理者権限を取得できます。"
    >
      <h3 className="mt-6">Lab 1: デフォルト認証情報の確認</h3>
      <p className="text-sm text-[#666]">
        まず、攻撃者が入手可能なデフォルト認証情報のリストを確認してください。
      </p>
      <div className="mb-4">
        <FetchButton onClick={fetchDefaults} disabled={loading}>
          デフォルト認証情報を表示
        </FetchButton>
        {defaults && (
          <table className="w-full text-xs border-collapse mt-3">
            <thead>
              <tr className="bg-[#f5f5f5]">
                <th className="p-1 border border-[#ddd] text-left">username</th>
                <th className="p-1 border border-[#ddd] text-left">password</th>
                <th className="p-1 border border-[#ddd] text-left">情報源</th>
              </tr>
            </thead>
            <tbody>
              {defaults.credentials.map((cred, i) => (
                <tr key={i}>
                  <td className="p-1 border border-[#ddd]">{cred.username}</td>
                  <td className="p-1 border border-[#ddd] font-mono">{cred.password}</td>
                  <td className="p-1 border border-[#ddd] text-[11px]">{cred.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <h3 className="mt-6">Lab 2: デフォルトパスワードでログイン</h3>
      <p className="text-sm text-[#666]">
        デフォルトパスワード <code>admin123</code> でログインを試みてください。
        脆弱版ではそのままログインでき、安全版ではパスワード変更を求められます。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <LoginForm mode="vulnerable" result={vulnLogin} isLoading={loading} onSubmit={handleLogin} />
        }
        secureContent={
          <div>
            <LoginForm mode="secure" result={secureLogin} isLoading={loading} onSubmit={handleLogin} />
            {secureLogin?.requirePasswordChange && (
              <ChangePasswordForm
                changeResult={changeResult}
                isLoading={loading}
                onChangePassword={handleChangePassword}
              />
            )}
            <div className="mt-2">
              <button
                onClick={resetSecure}
                className="text-[11px] py-0.5 px-2 cursor-pointer text-[#888]"
              >
                デモ状態をリセット
              </button>
            </div>
          </div>
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: <code>admin / admin123</code> でそのまま管理者としてログインできるか</li>
          <li>安全版: 同じ認証情報でログインが拒否され、パスワード変更を求められるか</li>
          <li>パスワード変更後に新しいパスワードでログインできるか</li>
          <li>デフォルト認証情報が危険な理由（公開情報から入手可能）を理解したか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
