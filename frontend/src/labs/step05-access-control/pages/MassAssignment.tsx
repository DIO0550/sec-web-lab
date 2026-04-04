import { useState } from "react";
import { LabLayout } from "@/components/LabLayout";
import { ComparisonPanel } from "@/components/ComparisonPanel";
import { FetchButton } from "@/components/FetchButton";
import { CheckpointBox } from "@/components/CheckpointBox";
import { ExpandableSection } from "@/components/ExpandableSection";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Alert } from "@/components/Alert";
import { ResultTable } from "@/components/ResultTable";
import { useComparisonFetch } from "@/hooks/useComparisonFetch";
import { getJson } from "@/utils/api";

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
      <Input label="ユーザー名:" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="hacker" className="mb-1" />
      <Input label="メール:" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hacker@evil.com" className="mb-1" />
      <Input label="パスワード:" value={password} onChange={(e) => setPassword(e.target.value)} className="mb-1" />
      <div className="mb-2">
        <label className="text-sm flex items-center gap-1">
          <input
            type="checkbox"
            checked={addRole}
            onChange={(e) => setAddRole(e.target.checked)}
          />
          <span className="text-status-ng">
            リクエストに <code>"role": "admin"</code> を追加する（Mass Assignment 攻撃）
          </span>
        </label>
      </div>
      <FetchButton
        onClick={() => {
          const data: Record<string, string> = { username, email, password };
          if (addRole) {
            data.role = "admin";
          }
          onRegister(mode, data);
        }}
        disabled={isLoading}
      >
        ユーザー登録
      </FetchButton>

      <ExpandableSection isOpen={!!result}>
        <Alert variant={result?.success ? "success" : "error"} title={result?.success ? "登録成功" : "登録失敗"} className="mt-2">
          <div className="text-sm">{result?.message}</div>
          {result?.user && (
            <div className="mt-2">
              <pre className="text-xs bg-code-bg text-code-text p-2 rounded overflow-auto">
                {JSON.stringify(result?.user, null, 2)}
              </pre>
              <div className={`text-sm font-bold mt-1 ${result?.user.role === "admin" ? "text-status-ng" : "text-status-ok"}`}>
                role: {result?.user.role}
                {result?.user.role === "admin" && " -- 管理者権限を取得！"}
              </div>
            </div>
          )}
          {result?._debug && (
            <div className="mt-2 text-xs text-text-muted italic">
              <div>{result?._debug.message}</div>
              {result?._debug.receivedFields && (
                <div>受信フィールド: {result?._debug.receivedFields.join(", ")}</div>
              )}
              {result?._debug.roleSource && <div>role の出所: {result?._debug.roleSource}</div>}
              {result?._debug.ignoredFields && (
                <div>無視されたフィールド: {result?._debug.ignoredFields.join(", ")}</div>
              )}
            </div>
          )}
        </Alert>
      </ExpandableSection>
    </div>
  );
}

// --- メインコンポーネント ---
export function MassAssignment() {
  const register = useComparisonFetch<RegisterResult>(BASE);
  const [users, setUsers] = useState<UsersResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (mode: "vulnerable" | "secure", data: Record<string, string>) => {
    await register.postJson(
      mode,
      "/register",
      data,
      (e) => ({ success: false, message: e.message }),
    );
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getJson<UsersResult>(`${BASE}/users`);
      setUsers(data);
    } catch {
      // ignore
    }
    setLoading(false);
  };

  const resetData = async () => {
    try {
      await fetch(`${BASE}/reset`, { method: "POST" });
      register.reset();
      setUsers(null);
    } catch {
      // ignore
    }
  };

  return (
    <LabLayout
      title="Mass Assignment"
      subtitle="リクエストに余計なフィールドを追加して権限を奪う"
      description="ユーザー登録やプロフィール更新のAPIに、本来送るべきでないフィールド（例: &quot;role&quot;: &quot;admin&quot;）を追加して送信するだけで、管理者権限を取得できてしまう脆弱性を体験します。"
    >
      <h3 className="mt-6">Step 1: ユーザー登録（Mass Assignment 攻撃）</h3>
      <p className="text-sm text-text-secondary">
        ユーザー名とメールを入力し、<strong className="text-status-ng">「role: admin を追加する」チェックボックス</strong>をONにして登録してみてください。
        脆弱版では管理者として登録され、安全版では role フィールドが無視されます。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <RegisterForm
            mode="vulnerable"
            result={register.vulnerable}
            isLoading={register.loading}
            onRegister={handleRegister}
          />
        }
        secureContent={
          <RegisterForm
            mode="secure"
            result={register.secure}
            isLoading={register.loading}
            onRegister={handleRegister}
          />
        }
      />

      <h3 className="mt-6">Step 2: 登録済みユーザーの確認</h3>
      <p className="text-sm text-text-secondary">
        登録されたユーザーの一覧を確認し、role が正しく設定されているか比較してください。
      </p>
      <div className="flex gap-2 mb-3">
        <FetchButton onClick={fetchUsers} disabled={loading}>
          ユーザー一覧を表示
        </FetchButton>
        <Button variant="secondary" size="sm" onClick={resetData}>
          デモデータをリセット
        </Button>
      </div>
      <ExpandableSection isOpen={!!users}>
        <ResultTable<{ id: number; username: string; email: string; role: string }>
          columns={[
            { key: "id", label: "ID" },
            { key: "username", label: "username" },
            { key: "email", label: "email" },
            { key: "role", label: "role" },
          ]}
          data={users?.users ?? []}
          className="text-xs"
          rowKey="id"
          getCellClassName={(col, row) =>
            col.key === "role"
              ? `font-bold ${row.role === "admin" ? "text-status-ng" : ""}`
              : ""
          }
        />
      </ExpandableSection>

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
