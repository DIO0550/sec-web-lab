import { useState, useCallback } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Alert } from "@/components/Alert";

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
        <Input
          label="ユーザー名"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mb-1"
        />
        <Input
          label="パスワード"
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-1"
        />
        <FetchButton onClick={() => onSubmit(mode, username, password)} disabled={isLoading}>
          ログイン
        </FetchButton>
      </div>

      <div className="mb-3">
        <span className="text-xs text-text-secondary">よくあるデフォルト認証情報:</span>
        <div className="flex gap-1 flex-wrap mt-1">
          {presets.map((p) => (
            <Button
              key={p.label}
              variant="ghost"
              size="sm"
              onClick={() => { setUsername(p.username); setPassword(p.password); }}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      {result && (
        <Alert
          variant={result.success ? "success" : result.requirePasswordChange ? "warning" : "error"}
          title={result.success ? "ログイン成功" : result.requirePasswordChange ? "パスワード変更が必要" : "ログイン失敗"}
          className="mt-2"
        >
          <div className="text-[13px]">{result.message}</div>
          {result.user && (
            <pre className="text-xs bg-bg-secondary p-2 rounded mt-2">
              {JSON.stringify(result.user, null, 2)}
            </pre>
          )}
          {result._debug && (
            <div className="mt-2 text-xs opacity-70 italic">
              {result._debug.message}
            </div>
          )}
        </Alert>
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
    <div className="mt-3 p-3 border border-border-light rounded bg-bg-secondary">
      <h4 className="m-0 mb-2 text-sm">パスワード変更</h4>
      <Input
        label="ユーザー名"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="mb-1"
      />
      <Input
        label="現在のパスワード"
        type="text"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        className="mb-1"
      />
      <Input
        label="新しいパスワード"
        type="text"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="mb-1"
      />
      <FetchButton
        onClick={() => onChangePassword(username, currentPassword, newPassword)}
        disabled={isLoading}
        size="small"
      >
        パスワード変更
      </FetchButton>

      {changeResult && (
        <Alert
          variant={changeResult.success ? "success" : "error"}
          className="mt-2 text-xs"
        >
          {changeResult.message}
        </Alert>
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
              <Button variant="secondary" size="sm" onClick={resetSecure}>
                デモ状態をリセット
              </Button>
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
