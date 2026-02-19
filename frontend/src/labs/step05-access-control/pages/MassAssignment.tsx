import { useState, useCallback } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

const BASE = "/api/labs/mass-assignment";

type RegisterResult = {
  success: boolean;
  message: string;
  user?: { id: number; username: string; email: string; role: string };
  _debug?: { message: string; receivedFields?: string[]; roleSource?: string; ignoredFields?: string[] };
};

type UpdateResult = {
  success: boolean;
  message: string;
  user?: { id: number; username: string; email: string; role: string };
  _debug?: { message: string; receivedFields?: string[]; allowedFields?: string[]; ignoredFields?: string[] };
};

type UsersResult = {
  users: Array<{ id: number; username: string; email: string; role: string }>;
};

// --- 登録フォーム ---
function RegisterForm({
  mode,
  result,
  isLoading,
  onRegister,
}: {
  mode: "vulnerable" | "secure";
  result: RegisterResult | null;
  isLoading: boolean;
  onRegister: (mode: "vulnerable" | "secure", data: Record<string, string>) => void;
}) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("pass123");
  const [addRole, setAddRole] = useState(false);

  return (
    <div>
      <div className="mb-1">
        <label className="text-[13px] block">ユーザー名:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="py-1 px-2 border border-[#ccc] rounded w-full"
          placeholder="hacker"
        />
      </div>
      <div className="mb-1">
        <label className="text-[13px] block">メール:</label>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="py-1 px-2 border border-[#ccc] rounded w-full"
          placeholder="hacker@evil.com"
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
      <div className="mb-2">
        <label className="text-[13px] flex items-center gap-1">
          <input
            type="checkbox"
            checked={addRole}
            onChange={(e) => setAddRole(e.target.checked)}
          />
          <span className="text-[#c00]">
            リクエストに <code>"role": "admin"</code> を追加する（Mass Assignment 攻撃）
          </span>
        </label>
      </div>
      <FetchButton
        onClick={() => {
          const data: Record<string, string> = { username, email, password };
          if (addRole) data.role = "admin";
          onRegister(mode, data);
        }}
        disabled={isLoading}
      >
        ユーザー登録
      </FetchButton>

      {result && (
        <div className={`mt-2 p-3 rounded ${result.success ? "bg-[#e8f5e9] border border-[#4caf50]" : "bg-[#ffebee] border border-[#f44336]"}`}>
          <div className={`font-bold text-sm ${result.success ? "text-[#2e7d32]" : "text-[#c62828]"}`}>
            {result.success ? "登録成功" : "登録失敗"}
          </div>
          <div className="text-[13px]">{result.message}</div>
          {result.user && (
            <div className="mt-2">
              <pre className="text-xs bg-[#f5f5f5] p-2 rounded overflow-auto">
                {JSON.stringify(result.user, null, 2)}
              </pre>
              <div className={`text-sm font-bold mt-1 ${result.user.role === "admin" ? "text-[#c00]" : "text-[#080]"}`}>
                role: {result.user.role}
                {result.user.role === "admin" && " — 管理者権限を取得！"}
              </div>
            </div>
          )}
          {result._debug && (
            <div className="mt-2 text-xs text-[#888] italic">
              <div>{result._debug.message}</div>
              {result._debug.receivedFields && (
                <div>受信フィールド: {result._debug.receivedFields.join(", ")}</div>
              )}
              {result._debug.roleSource && <div>role の出所: {result._debug.roleSource}</div>}
              {result._debug.ignoredFields && (
                <div>無視されたフィールド: {result._debug.ignoredFields.join(", ")}</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- メインコンポーネント ---
export function MassAssignment() {
  const [vulnRegister, setVulnRegister] = useState<RegisterResult | null>(null);
  const [secureRegister, setSecureRegister] = useState<RegisterResult | null>(null);
  const [users, setUsers] = useState<UsersResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = useCallback(async (mode: "vulnerable" | "secure", data: Record<string, string>) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result: RegisterResult = await res.json();
      if (mode === "vulnerable") setVulnRegister(result);
      else setSecureRegister(result);
    } catch (e) {
      const err = { success: false, message: (e as Error).message };
      if (mode === "vulnerable") setVulnRegister(err);
      else setSecureRegister(err);
    }
    setLoading(false);
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/users`);
      const data: UsersResult = await res.json();
      setUsers(data);
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  const resetData = useCallback(async () => {
    try {
      await fetch(`${BASE}/reset`, { method: "POST" });
      setVulnRegister(null);
      setSecureRegister(null);
      setUsers(null);
    } catch {
      // ignore
    }
  }, []);

  return (
    <LabLayout
      title="Mass Assignment"
      subtitle="リクエストに余計なフィールドを追加して権限を奪う"
      description="ユーザー登録やプロフィール更新のAPIに、本来送るべきでないフィールド（例: &quot;role&quot;: &quot;admin&quot;）を追加して送信するだけで、管理者権限を取得できてしまう脆弱性を体験します。"
    >
      <h3 className="mt-6">Step 1: ユーザー登録（Mass Assignment 攻撃）</h3>
      <p className="text-sm text-[#666]">
        ユーザー名とメールを入力し、<strong className="text-[#c00]">「role: admin を追加する」チェックボックス</strong>をONにして登録してみてください。
        脆弱版では管理者として登録され、安全版では role フィールドが無視されます。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <RegisterForm
            mode="vulnerable"
            result={vulnRegister}
            isLoading={loading}
            onRegister={handleRegister}
          />
        }
        secureContent={
          <RegisterForm
            mode="secure"
            result={secureRegister}
            isLoading={loading}
            onRegister={handleRegister}
          />
        }
      />

      <h3 className="mt-6">Step 2: 登録済みユーザーの確認</h3>
      <p className="text-sm text-[#666]">
        登録されたユーザーの一覧を確認し、role が正しく設定されているか比較してください。
      </p>
      <div className="flex gap-2 mb-3">
        <FetchButton onClick={fetchUsers} disabled={loading}>
          ユーザー一覧を表示
        </FetchButton>
        <button onClick={resetData} className="text-[11px] py-0.5 px-2 cursor-pointer text-[#888]">
          デモデータをリセット
        </button>
      </div>
      {users && (
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-[#f5f5f5]">
              <th className="p-1 border border-[#ddd] text-left">ID</th>
              <th className="p-1 border border-[#ddd] text-left">username</th>
              <th className="p-1 border border-[#ddd] text-left">email</th>
              <th className="p-1 border border-[#ddd] text-left">role</th>
            </tr>
          </thead>
          <tbody>
            {users.users.map((u) => (
              <tr key={u.id}>
                <td className="p-1 border border-[#ddd]">{u.id}</td>
                <td className="p-1 border border-[#ddd]">{u.username}</td>
                <td className="p-1 border border-[#ddd]">{u.email}</td>
                <td className={`p-1 border border-[#ddd] font-bold ${u.role === "admin" ? "text-[#c00]" : ""}`}>
                  {u.role}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <CheckpointBox>
        <ul>
          <li>脆弱版: <code>"role": "admin"</code> を追加して管理者として登録できるか</li>
          <li>安全版: 同じ攻撃を行っても role が <code>"user"</code> のままか</li>
          <li>フロントエンドのフォームにないフィールドでもAPIに送信できる理由を理解したか</li>
          <li>ホワイトリスト方式がなぜこの攻撃を防げるか説明できるか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
