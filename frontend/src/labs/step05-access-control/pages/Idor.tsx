import { useState } from "react";
import { LabLayout } from "@/components/LabLayout";
import { ComparisonPanel } from "@/components/ComparisonPanel";
import { FetchButton } from "@/components/FetchButton";
import { CheckpointBox } from "@/components/CheckpointBox";
import { ExpandableSection } from "@/components/ExpandableSection";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Alert } from "@/components/Alert";
import { PresetButtons } from "@/components/PresetButtons";
import { useComparisonFetch } from "@/hooks/useComparisonFetch";

const BASE = "/api/labs/idor";

type LoginResult = {
  success: boolean;
  message: string;
  sessionId?: string;
  user?: { id: number; username: string };
};

type ProfileResult = {
  success: boolean;
  message?: string;
  profile?: Record<string, unknown>;
  _debug?: { message: string; currentUserId: number; requestedId: number };
};

const loginPresets = [
  { label: "user1 / password1", username: "user1", password: "password1" },
  { label: "user2 / password2", username: "user2", password: "password2" },
  { label: "admin / admin123", username: "admin", password: "admin123" },
];

const loginErrorResult = (e: Error): LoginResult => ({
  success: false,
  message: e.message,
});

const profileErrorResult = (e: Error): ProfileResult => ({
  success: false,
  message: e.message,
});

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

  return (
    <div className="mb-3">
      <Input label="ユーザー名:" value={username} onChange={(e) => setUsername(e.target.value)} className="mb-1" />
      <Input label="パスワード:" value={password} onChange={(e) => setPassword(e.target.value)} className="mb-1" />
      <FetchButton onClick={() => onLogin(mode, username, password)} disabled={isLoading}>
        ログイン
      </FetchButton>
      <PresetButtons
        presets={loginPresets}
        onSelect={(p) => { setUsername(p.username); setPassword(p.password); }}
        className="mt-1"
      />
      <ExpandableSection isOpen={!!loginResult}>
        <Alert variant={loginResult?.success ? "success" : "error"} className="mt-2 text-xs">
          {loginResult?.message}
          {loginResult?.user && <span className="ml-1">(ID: {loginResult?.user.id})</span>}
        </Alert>
      </ExpandableSection>
    </div>
  );
}

// --- プロフィール取得フォーム ---
function ProfileForm({
  sessionId,
  result,
  isLoading,
  onFetch,
}: {
  sessionId: string | null;
  result: ProfileResult | null;
  isLoading: boolean;
  onFetch: (targetId: string) => void;
}) {
  const [targetId, setTargetId] = useState("1");

  return (
    <div className="mb-3">
      <Input label="取得するユーザーID:" type="number" value={targetId} onChange={(e) => setTargetId(e.target.value)} min="1" className="mb-1" />
      <div className="flex gap-1 mb-1">
        {["1", "2", "3"].map((id) => (
          <Button key={id} variant="ghost" size="sm" onClick={() => setTargetId(id)}>
            ID={id}
          </Button>
        ))}
      </div>
      <FetchButton onClick={() => onFetch(targetId)} disabled={isLoading || !sessionId}>
        プロフィール取得
      </FetchButton>
      {!sessionId && <p className="text-xs text-text-muted mt-1">先にログインしてください</p>}

      <ExpandableSection isOpen={!!result}>
        <Alert variant={result?.success ? "success" : "error"} title={result?.success ? "データ取得成功" : "アクセス拒否"} className="mt-2">
          {result?.message && <div className="text-sm">{result?.message}</div>}
          {result?.profile && (
            <pre className="text-xs bg-code-bg p-2 rounded mt-2 overflow-auto">
              {JSON.stringify(result?.profile, null, 2)}
            </pre>
          )}
          {result?._debug && (
            <div className="mt-2 text-xs text-text-muted italic">
              {result?._debug.message}
              <br />
              ログインユーザーID: {result?._debug.currentUserId} / リクエストID: {result?._debug.requestedId}
            </div>
          )}
        </Alert>
      </ExpandableSection>
    </div>
  );
}

// --- メインコンポーネント ---
export function Idor() {
  const [vulnSession, setVulnSession] = useState<string | null>(null);
  const [secureSession, setSecureSession] = useState<string | null>(null);
  const loginFetch = useComparisonFetch<LoginResult>(BASE);
  const profileFetch = useComparisonFetch<ProfileResult>(BASE);

  const handleLogin = async (mode: "vulnerable" | "secure", username: string, password: string) => {
    const data = await loginFetch.postJson(mode, "/login", { username, password }, loginErrorResult);
    if (data.sessionId) {
      if (mode === "vulnerable") {
        setVulnSession(data.sessionId);
      } else {
        setSecureSession(data.sessionId);
      }
    }
  };

  const fetchProfile = async (mode: "vulnerable" | "secure", targetId: string) => {
    const sessionId = mode === "vulnerable" ? vulnSession : secureSession;
    if (!sessionId) {
      return;
    }

    await profileFetch.run(
      mode,
      `/users/${targetId}/profile`,
      { headers: { "X-Session-Id": sessionId } },
      profileErrorResult
    );
  };

  return (
    <LabLayout
      title="IDOR (Insecure Direct Object Reference)"
      subtitle="IDを書き換えるだけで他人のデータが見える"
      description="URLやリクエストに含まれるユーザーIDを別の値に変えるだけで、本来アクセスできないはずの他人のデータを閲覧できてしまう脆弱性を体験します。"
    >
      <h3 className="mt-6">Step 1: ログイン</h3>
      <p className="text-sm text-text-secondary">
        まず user1 (ID=2) としてログインしてください。その後、IDを書き換えて他ユーザーのプロフィールにアクセスしてみましょう。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <LoginForm mode="vulnerable" loginResult={loginFetch.vulnerable} isLoading={loginFetch.loading} onLogin={handleLogin} />
        }
        secureContent={
          <LoginForm mode="secure" loginResult={loginFetch.secure} isLoading={loginFetch.loading} onLogin={handleLogin} />
        }
      />

      <h3 className="mt-6">Step 2: 他ユーザーのプロフィールにアクセス</h3>
      <p className="text-sm text-text-secondary">
        ログインしたユーザーとは異なるIDを指定して、プロフィールを取得してみてください。
        脆弱版では他ユーザーのデータが取得でき、安全版ではアクセスが拒否されます。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <ProfileForm
            sessionId={vulnSession}
            result={profileFetch.vulnerable}
            isLoading={profileFetch.loading}
            onFetch={(id) => fetchProfile("vulnerable", id)}
          />
        }
        secureContent={
          <ProfileForm
            sessionId={secureSession}
            result={profileFetch.secure}
            isLoading={profileFetch.loading}
            onFetch={(id) => fetchProfile("secure", id)}
          />
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: user1 でログインした状態で、ID=1（admin）のプロフィールを取得できるか</li>
          <li>安全版: 同じ操作を行うと 403 エラーで拒否されるか</li>
          <li>認証（誰がログインしたか）と認可（何にアクセスしてよいか）の違いを理解したか</li>
          <li>安全な実装がセッションIDとリクエストIDの照合でどう機能するか説明できるか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
