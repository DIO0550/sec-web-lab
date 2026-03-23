import { useState } from "react";
import { LabLayout } from "@/components/LabLayout";
import { ComparisonPanel } from "@/components/ComparisonPanel";
import { FetchButton } from "@/components/FetchButton";
import { CheckpointBox } from "@/components/CheckpointBox";
import { ExpandableSection } from "@/components/ExpandableSection";
import { Button } from "@/components/Button";
import { CredentialsFields } from "@/components/CredentialsFields";
import { Input } from "@/components/Input";
import { Alert } from "@/components/Alert";
import { ResultTable } from "@/components/ResultTable";
import { useComparisonFetch } from "@/hooks/useComparisonFetch";
import { PresetButtons } from "@/components/PresetButtons";
import { postJson, getJson } from "@/utils/api";

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

const loginPresets = [
  { label: "admin / admin123", username: "admin", password: "admin123" },
  { label: "admin / admin", username: "admin", password: "admin" },
  { label: "admin / password", username: "admin", password: "password" },
];

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

  return (
    <div>
      <div className="mb-3">
        <CredentialsFields
          username={username}
          password={password}
          onUsernameChange={setUsername}
          onPasswordChange={setPassword}
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
          variant={result?.success ? "success" : result?.requirePasswordChange ? "warning" : "error"}
          title={result?.success ? "ログイン成功" : result?.requirePasswordChange ? "パスワード変更が必要" : "ログイン失敗"}
          className="mt-2"
        >
          <div className="text-sm">{result?.message}</div>
          {result?.user && (
            <pre className="text-xs bg-bg-secondary p-2 rounded mt-2">
              {JSON.stringify(result?.user, null, 2)}
            </pre>
          )}
          {result?._debug && (
            <div className="mt-2 text-xs opacity-70 italic">
              {result?._debug.message}
            </div>
          )}
        </Alert>
      </ExpandableSection>
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
      >
        パスワード変更
      </FetchButton>

      <ExpandableSection isOpen={!!changeResult}>
        <Alert
          variant={changeResult?.success ? "success" : "error"}
          className="mt-2 text-xs"
        >
          {changeResult?.message}
        </Alert>
      </ExpandableSection>
    </div>
  );
}

// --- メインコンポーネント ---
export function DefaultCredentials() {
  const login = useComparisonFetch<LoginResult>(BASE);
  const [changeResult, setChangeResult] = useState<ChangePasswordResult | null>(null);
  const [defaults, setDefaults] = useState<DefaultsResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (mode: "vulnerable" | "secure", username: string, password: string) => {
    await login.postJson(mode, "/login", { username, password }, (e) => ({
      success: false,
      message: e.message,
    }));
  };

  const handleChangePassword = async (username: string, currentPassword: string, newPassword: string) => {
    setLoading(true);
    try {
      const data = await postJson<ChangePasswordResult>(`${BASE}/secure/change-password`, {
        username,
        currentPassword,
        newPassword,
      });
      setChangeResult(data);
    } catch (e) {
      setChangeResult({ success: false, message: (e as Error).message });
    }
    setLoading(false);
  };

  const fetchDefaults = async () => {
    setLoading(true);
    try {
      const data = await getJson<DefaultsResult>(`${BASE}/vulnerable/defaults`);
      setDefaults(data);
    } catch {
      // ignore
    }
    setLoading(false);
  };

  const resetSecure = async () => {
    try {
      await fetch(`${BASE}/secure/reset`, { method: "POST" });
      login.reset();
      setChangeResult(null);
    } catch {
      // ignore
    }
  };

  const isLoading = login.loading || loading;

  return (
    <LabLayout
      title="Default Credentials"
      subtitle="初期パスワードのまま運用されたシステムに侵入する"
      description="admin/admin123 等のデフォルト認証情報が変更されないまま運用されていると、攻撃者が公開情報からパスワードを入手して即座に管理者権限を取得できます。"
    >
      <h3 className="mt-6">Lab 1: デフォルト認証情報の確認</h3>
      <p className="text-sm text-text-secondary">
        まず、攻撃者が入手可能なデフォルト認証情報のリストを確認してください。
      </p>
      <div className="mb-4">
        <FetchButton onClick={fetchDefaults} disabled={isLoading}>
          デフォルト認証情報を表示
        </FetchButton>
        <ExpandableSection isOpen={!!defaults}>
          <ResultTable<DefaultCred>
            columns={[
              { key: "username", label: "username" },
              { key: "password", label: "password" },
              { key: "source", label: "情報源" },
            ]}
            data={defaults?.credentials ?? []}
            className="text-xs mt-3"
            getCellClassName={(col) =>
              col.key === "password" ? "font-mono" : ""
            }
          />
        </ExpandableSection>
      </div>

      <h3 className="mt-6">Lab 2: デフォルトパスワードでログイン</h3>
      <p className="text-sm text-text-secondary">
        デフォルトパスワード <code>admin123</code> でログインを試みてください。
        脆弱版ではそのままログインでき、安全版ではパスワード変更を求められます。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <LoginForm mode="vulnerable" result={login.vulnerable} isLoading={isLoading} onSubmit={handleLogin} />
        }
        secureContent={
          <div>
            <LoginForm mode="secure" result={login.secure} isLoading={isLoading} onSubmit={handleLogin} />
            {login.secure?.requirePasswordChange && (
              <ChangePasswordForm
                changeResult={changeResult}
                isLoading={isLoading}
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
