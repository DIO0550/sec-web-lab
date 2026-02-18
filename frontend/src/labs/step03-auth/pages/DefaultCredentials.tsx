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
      <div style={{ marginBottom: 12 }}>
        <div style={{ marginBottom: 4 }}>
          <label style={{ fontSize: 13, display: "block" }}>ユーザー名:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ padding: "4px 8px", border: "1px solid #ccc", borderRadius: 4, width: "100%" }}
          />
        </div>
        <div style={{ marginBottom: 4 }}>
          <label style={{ fontSize: 13, display: "block" }}>パスワード:</label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: "4px 8px", border: "1px solid #ccc", borderRadius: 4, width: "100%" }}
          />
        </div>
        <FetchButton onClick={() => onSubmit(mode, username, password)} disabled={isLoading}>
          ログイン
        </FetchButton>
      </div>

      <div style={{ marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: "#888" }}>よくあるデフォルト認証情報:</span>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => { setUsername(p.username); setPassword(p.password); }}
              style={{ fontSize: 11, padding: "2px 8px", cursor: "pointer" }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {result && (
        <div style={{
          marginTop: 8,
          padding: 12,
          borderRadius: 4,
          background: result.success ? "#e8f5e9" : result.requirePasswordChange ? "#fff3e0" : "#ffebee",
          border: `1px solid ${result.success ? "#4caf50" : result.requirePasswordChange ? "#ff9800" : "#f44336"}`,
        }}>
          <div style={{
            fontWeight: "bold",
            color: result.success ? "#2e7d32" : result.requirePasswordChange ? "#e65100" : "#c62828",
          }}>
            {result.success ? "ログイン成功" : result.requirePasswordChange ? "パスワード変更が必要" : "ログイン失敗"}
          </div>
          <div style={{ fontSize: 13 }}>{result.message}</div>
          {result.user && (
            <pre style={{ fontSize: 12, background: "#f5f5f5", padding: 8, borderRadius: 4, marginTop: 8 }}>
              {JSON.stringify(result.user, null, 2)}
            </pre>
          )}
          {result._debug && (
            <div style={{ marginTop: 8, fontSize: 12, color: "#888", fontStyle: "italic" }}>
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
    <div style={{ marginTop: 12, padding: 12, border: "1px solid #e0e0e0", borderRadius: 4, background: "#fafafa" }}>
      <h4 style={{ margin: "0 0 8px 0", fontSize: 14 }}>パスワード変更</h4>
      <div style={{ marginBottom: 4 }}>
        <label style={{ fontSize: 12, display: "block" }}>ユーザー名:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ padding: "4px 8px", border: "1px solid #ccc", borderRadius: 4, width: "100%", fontSize: 12 }}
        />
      </div>
      <div style={{ marginBottom: 4 }}>
        <label style={{ fontSize: 12, display: "block" }}>現在のパスワード:</label>
        <input
          type="text"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          style={{ padding: "4px 8px", border: "1px solid #ccc", borderRadius: 4, width: "100%", fontSize: 12 }}
        />
      </div>
      <div style={{ marginBottom: 4 }}>
        <label style={{ fontSize: 12, display: "block" }}>新しいパスワード:</label>
        <input
          type="text"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          style={{ padding: "4px 8px", border: "1px solid #ccc", borderRadius: 4, width: "100%", fontSize: 12 }}
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
        <div style={{
          marginTop: 8,
          padding: 8,
          borderRadius: 4,
          background: changeResult.success ? "#e8f5e9" : "#ffebee",
          fontSize: 12,
        }}>
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
      <h3 style={{ marginTop: 24 }}>Lab 1: デフォルト認証情報の確認</h3>
      <p style={{ fontSize: 14, color: "#666" }}>
        まず、攻撃者が入手可能なデフォルト認証情報のリストを確認してください。
      </p>
      <div style={{ marginBottom: 16 }}>
        <FetchButton onClick={fetchDefaults} disabled={loading}>
          デフォルト認証情報を表示
        </FetchButton>
        {defaults && (
          <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse", marginTop: 12 }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={{ padding: 4, border: "1px solid #ddd", textAlign: "left" }}>username</th>
                <th style={{ padding: 4, border: "1px solid #ddd", textAlign: "left" }}>password</th>
                <th style={{ padding: 4, border: "1px solid #ddd", textAlign: "left" }}>情報源</th>
              </tr>
            </thead>
            <tbody>
              {defaults.credentials.map((cred, i) => (
                <tr key={i}>
                  <td style={{ padding: 4, border: "1px solid #ddd" }}>{cred.username}</td>
                  <td style={{ padding: 4, border: "1px solid #ddd", fontFamily: "monospace" }}>{cred.password}</td>
                  <td style={{ padding: 4, border: "1px solid #ddd", fontSize: 11 }}>{cred.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <h3 style={{ marginTop: 24 }}>Lab 2: デフォルトパスワードでログイン</h3>
      <p style={{ fontSize: 14, color: "#666" }}>
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
            <div style={{ marginTop: 8 }}>
              <button
                onClick={resetSecure}
                style={{ fontSize: 11, padding: "2px 8px", cursor: "pointer", color: "#888" }}
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
