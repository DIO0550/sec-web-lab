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
        <pre className="text-[11px] text-[#c00] mt-2">{result.error}</pre>
      )}

      {result?.users && (
        <div className="mt-3">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-[#f5f5f5]">
                <th className="p-1 border border-[#ddd] text-left">username</th>
                <th className="p-1 border border-[#ddd] text-left">password</th>
                <th className="p-1 border border-[#ddd] text-left">email</th>
                <th className="p-1 border border-[#ddd] text-left">role</th>
              </tr>
            </thead>
            <tbody>
              {result.users.map((u) => (
                <tr key={u.id}>
                  <td className="p-1 border border-[#ddd]">{u.username}</td>
                  <td className={`p-1 border border-[#ddd] font-mono text-[11px] break-all ${mode === "vulnerable" ? "bg-[#ffebee]" : "bg-[#e8f5e9]"}`}>
                    {u.password}
                  </td>
                  <td className="p-1 border border-[#ddd]">{u.email}</td>
                  <td className="p-1 border border-[#ddd]">{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
        <span className="text-xs text-[#888]">プリセット:</span>
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
        <div className={`mt-2 p-3 rounded ${result.success ? "bg-[#e8f5e9] border border-[#4caf50]" : "bg-[#ffebee] border border-[#f44336]"}`}>
          <div className={`font-bold ${result.success ? "text-[#2e7d32]" : "text-[#c62828]"}`}>
            {result.success ? "ログイン成功" : "ログイン失敗"}
          </div>
          <div className="text-[13px]">{result.message}</div>
          {result.user && (
            <pre className="text-xs bg-[#f5f5f5] p-2 rounded mt-2">
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
      <h3 className="mt-6">Lab 1: DB内のパスワード確認</h3>
      <p className="text-sm text-[#666]">
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

      <h3 className="mt-8">Lab 2: パスワードでログイン</h3>
      <p className="text-sm text-[#666]">
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
