import { useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";
import { ExpandableSection } from "../../../components/ExpandableSection";
import { Input } from "@/components/Input";
import { Alert } from "@/components/Alert";
import { useComparisonFetch } from "../../../hooks/useComparisonFetch";
import { PresetButtons } from "@/components/PresetButtons";

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

const loginPresets = [
  { label: "admin / admin123", username: "admin", password: "admin123" },
  { label: "user1 / password1", username: "user1", password: "password1" },
];

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
        <pre className="text-[11px] text-status-ng mt-2">{result.error}</pre>
      )}

      <ExpandableSection isOpen={!!result?.users}>
        <div className="mt-3">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-code-bg">
                <th className="p-1 border border-table-border text-left">username</th>
                <th className="p-1 border border-table-border text-left">password</th>
                <th className="p-1 border border-table-border text-left">email</th>
                <th className="p-1 border border-table-border text-left">role</th>
              </tr>
            </thead>
            <tbody>
              {result?.users.map((u) => (
                <tr key={u.id}>
                  <td className="p-1 border border-table-border">{u.username}</td>
                  <td className={`p-1 border border-table-border font-mono text-[11px] break-all ${mode === "vulnerable" ? "bg-error-bg-light" : "bg-success-bg"}`}>
                    {u.password}
                  </td>
                  <td className="p-1 border border-table-border">{u.email}</td>
                  <td className="p-1 border border-table-border">{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {result?._debug && (
            <div className="mt-2 text-xs text-text-muted italic">
              {result?._debug.message}
            </div>
          )}
        </div>
      </ExpandableSection>
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

      <PresetButtons
        presets={loginPresets}
        onSelect={(p) => { setUsername(p.username); setPassword(p.password); }}
        className="mb-3"
      />

      <ExpandableSection isOpen={!!result}>
        <Alert
          variant={result?.success ? "success" : "error"}
          title={result?.success ? "ログイン成功" : "ログイン失敗"}
          className="mt-2"
        >
          <div className="text-[13px]">{result?.message}</div>
          {result?.user && (
            <pre className="text-xs bg-bg-secondary p-2 rounded mt-2">
              {JSON.stringify(result?.user, null, 2)}
            </pre>
          )}
        </Alert>
      </ExpandableSection>
    </div>
  );
}

// --- メインコンポーネント ---
export function PlaintextPassword() {
  const users = useComparisonFetch<UsersResult>(BASE);
  const login = useComparisonFetch<LoginResult>(BASE);

  const fetchUsers = async (mode: "vulnerable" | "secure") => {
    await users.run(mode, "/users", undefined, (e) => ({
      users: [],
      error: e.message,
    }));
  };

  const handleLogin = async (mode: "vulnerable" | "secure", username: string, password: string) => {
    await login.postJson(mode, "/login", { username, password }, (e) => ({
      success: false,
      message: e.message,
    }));
  };

  const isLoading = users.loading || login.loading;

  return (
    <LabLayout
      title="Plaintext Password Storage"
      subtitle="パスワードを平文で保存する危険性"
      description="パスワードをハッシュ化せず平文でDBに保存していると、データベースが漏洩した瞬間に全ユーザーのパスワードが丸見えになります。"
    >
      <h3 className="mt-6">Lab 1: DB内のパスワード確認</h3>
      <p className="text-sm text-text-secondary">
        ユーザー一覧を取得して、パスワードの保存形式を比較してください。
        脆弱版では平文、安全版ではbcryptハッシュが表示されます。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <UsersPanel mode="vulnerable" result={users.vulnerable} isLoading={isLoading} onFetch={() => fetchUsers("vulnerable")} />
        }
        secureContent={
          <UsersPanel mode="secure" result={users.secure} isLoading={isLoading} onFetch={() => fetchUsers("secure")} />
        }
      />

      <h3 className="mt-8">Lab 2: パスワードでログイン</h3>
      <p className="text-sm text-text-secondary">
        上で確認したパスワードを使ってログインしてみてください。
        平文保存の場合、漏洩したパスワードでそのままログインできます。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <LoginForm mode="vulnerable" result={login.vulnerable} isLoading={isLoading} onSubmit={handleLogin} />
        }
        secureContent={
          <LoginForm mode="secure" result={login.secure} isLoading={isLoading} onSubmit={handleLogin} />
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
