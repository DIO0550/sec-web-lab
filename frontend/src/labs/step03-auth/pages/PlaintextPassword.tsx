import { useState, useCallback } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

const BASE = "/api/labs/plaintext-password";

type User = {
  id: number;
  username: string;
  password: string;
  email: string;
  role: string;
};

type UsersResult = {
  users: User[];
  _debug?: { message: string };
  error?: string;
};

type LoginResult = {
  success: boolean;
  message: string;
  user?: { id: number; username: string; email: string; role: string };
};

// --- ユーザー一覧パネル ---
function UsersPanel({
  mode,
  result,
  isLoading,
  onFetch,
}: {
  mode: "vulnerable" | "secure";
  result: UsersResult | null;
  isLoading: boolean;
  onFetch: () => void;
}) {
  return (
    <div>
      <FetchButton onClick={onFetch} disabled={isLoading}>
        ユーザー一覧を取得
      </FetchButton>

      {result?.error && (
        <pre style={{ fontSize: 11, color: "#c00", marginTop: 8 }}>{result.error}</pre>
      )}

      {result?.users && (
        <div style={{ marginTop: 12 }}>
          <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={{ padding: 4, border: "1px solid #ddd", textAlign: "left" }}>username</th>
                <th style={{ padding: 4, border: "1px solid #ddd", textAlign: "left" }}>password</th>
                <th style={{ padding: 4, border: "1px solid #ddd", textAlign: "left" }}>email</th>
                <th style={{ padding: 4, border: "1px solid #ddd", textAlign: "left" }}>role</th>
              </tr>
            </thead>
            <tbody>
              {result.users.map((u) => (
                <tr key={u.id}>
                  <td style={{ padding: 4, border: "1px solid #ddd" }}>{u.username}</td>
                  <td style={{
                    padding: 4,
                    border: "1px solid #ddd",
                    fontFamily: "monospace",
                    fontSize: 11,
                    background: mode === "vulnerable" ? "#ffebee" : "#e8f5e9",
                    wordBreak: "break-all",
                  }}>
                    {u.password}
                  </td>
                  <td style={{ padding: 4, border: "1px solid #ddd" }}>{u.email}</td>
                  <td style={{ padding: 4, border: "1px solid #ddd" }}>{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const presets = [
    { label: "admin / admin123", username: "admin", password: "admin123" },
    { label: "user1 / password1", username: "user1", password: "password1" },
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
        <span style={{ fontSize: 12, color: "#888" }}>プリセット:</span>
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
          background: result.success ? "#e8f5e9" : "#ffebee",
          border: `1px solid ${result.success ? "#4caf50" : "#f44336"}`,
        }}>
          <div style={{ fontWeight: "bold", color: result.success ? "#2e7d32" : "#c62828" }}>
            {result.success ? "ログイン成功" : "ログイン失敗"}
          </div>
          <div style={{ fontSize: 13 }}>{result.message}</div>
          {result.user && (
            <pre style={{ fontSize: 12, background: "#f5f5f5", padding: 8, borderRadius: 4, marginTop: 8 }}>
              {JSON.stringify(result.user, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

// --- メインコンポーネント ---
export function PlaintextPassword() {
  const [vulnUsers, setVulnUsers] = useState<UsersResult | null>(null);
  const [secureUsers, setSecureUsers] = useState<UsersResult | null>(null);
  const [vulnLogin, setVulnLogin] = useState<LoginResult | null>(null);
  const [secureLogin, setSecureLogin] = useState<LoginResult | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async (mode: "vulnerable" | "secure") => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/users`);
      const data = await res.json();
      if (mode === "vulnerable") setVulnUsers(data);
      else setSecureUsers(data);
    } catch (e) {
      const err = { users: [], error: (e as Error).message };
      if (mode === "vulnerable") setVulnUsers(err);
      else setSecureUsers(err);
    }
    setLoading(false);
  }, []);

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

  return (
    <LabLayout
      title="Plaintext Password Storage"
      subtitle="パスワードを平文で保存する危険性"
      description="パスワードをハッシュ化せず平文でDBに保存していると、データベースが漏洩した瞬間に全ユーザーのパスワードが丸見えになります。"
    >
      <h3 style={{ marginTop: 24 }}>Lab 1: DB内のパスワード確認</h3>
      <p style={{ fontSize: 14, color: "#666" }}>
        ユーザー一覧を取得して、パスワードの保存形式を比較してください。
        脆弱版では平文、安全版ではbcryptハッシュが表示されます。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <UsersPanel mode="vulnerable" result={vulnUsers} isLoading={loading} onFetch={() => fetchUsers("vulnerable")} />
        }
        secureContent={
          <UsersPanel mode="secure" result={secureUsers} isLoading={loading} onFetch={() => fetchUsers("secure")} />
        }
      />

      <h3 style={{ marginTop: 32 }}>Lab 2: パスワードでログイン</h3>
      <p style={{ fontSize: 14, color: "#666" }}>
        上で確認したパスワードを使ってログインしてみてください。
        平文保存の場合、漏洩したパスワードでそのままログインできます。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <LoginForm mode="vulnerable" result={vulnLogin} isLoading={loading} onSubmit={handleLogin} />
        }
        secureContent={
          <LoginForm mode="secure" result={secureLogin} isLoading={loading} onSubmit={handleLogin} />
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: ユーザー一覧にパスワードが平文で表示されるか</li>
          <li>安全版: パスワードが <code>$2a$12$...</code> のようなbcryptハッシュで表示されるか</li>
          <li>同じパスワード（admin123）でも、安全版ではユーザーごとに異なるハッシュ値になっているか</li>
          <li>bcryptの不可逆性（ハッシュから元のパスワードを復元できない）を理解したか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
