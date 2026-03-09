import { useState, useCallback } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Alert } from "@/components/Alert";

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

type PostsResult = {
  success: boolean;
  message?: string;
  posts?: Array<Record<string, unknown>>;
  _debug?: { message: string; currentUserId: number; requestedUserId: number };
};

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

  const presets = [
    { label: "user1 / password1", username: "user1", password: "password1" },
    { label: "user2 / password2", username: "user2", password: "password2" },
    { label: "admin / admin123", username: "admin", password: "admin123" },
  ];

  return (
    <div className="mb-3">
      <Input label="ユーザー名:" value={username} onChange={(e) => setUsername(e.target.value)} className="mb-1" />
      <Input label="パスワード:" value={password} onChange={(e) => setPassword(e.target.value)} className="mb-1" />
      <FetchButton onClick={() => onLogin(mode, username, password)} disabled={isLoading}>
        ログイン
      </FetchButton>
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
      {loginResult && (
        <Alert variant={loginResult.success ? "success" : "error"} className="mt-2 text-xs">
          {loginResult.message}
          {loginResult.user && <span className="ml-1">(ID: {loginResult.user.id})</span>}
        </Alert>
      )}
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
      {!sessionId && <p className="text-xs text-[#888] mt-1">先にログインしてください</p>}

      {result && (
        <Alert variant={result.success ? "success" : "error"} title={result.success ? "データ取得成功" : "アクセス拒否"} className="mt-2">
          {result.message && <div className="text-[13px]">{result.message}</div>}
          {result.profile && (
            <pre className="text-xs bg-[#f5f5f5] p-2 rounded mt-2 overflow-auto">
              {JSON.stringify(result.profile, null, 2)}
            </pre>
          )}
          {result._debug && (
            <div className="mt-2 text-xs text-[#888] italic">
              {result._debug.message}
              <br />
              ログインユーザーID: {result._debug.currentUserId} / リクエストID: {result._debug.requestedId}
            </div>
          )}
        </Alert>
      )}
    </div>
  );
}

// --- メインコンポーネント ---
export function Idor() {
  const [vulnSession, setVulnSession] = useState<string | null>(null);
  const [secureSession, setSecureSession] = useState<string | null>(null);
  const [vulnLogin, setVulnLogin] = useState<LoginResult | null>(null);
  const [secureLogin, setSecureLogin] = useState<LoginResult | null>(null);
  const [vulnProfile, setVulnProfile] = useState<ProfileResult | null>(null);
  const [secureProfile, setSecureProfile] = useState<ProfileResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(async (mode: "vulnerable" | "secure", username: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data: LoginResult = await res.json();
      if (mode === "vulnerable") {
        setVulnLogin(data);
        if (data.sessionId) setVulnSession(data.sessionId);
      } else {
        setSecureLogin(data);
        if (data.sessionId) setSecureSession(data.sessionId);
      }
    } catch (e) {
      const err = { success: false, message: (e as Error).message };
      if (mode === "vulnerable") setVulnLogin(err);
      else setSecureLogin(err);
    }
    setLoading(false);
  }, []);

  const fetchProfile = useCallback(async (mode: "vulnerable" | "secure", targetId: string) => {
    const sessionId = mode === "vulnerable" ? vulnSession : secureSession;
    if (!sessionId) return;

    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/users/${targetId}/profile`, {
        headers: { "X-Session-Id": sessionId },
      });
      const data: ProfileResult = await res.json();
      if (mode === "vulnerable") setVulnProfile(data);
      else setSecureProfile(data);
    } catch (e) {
      const err = { success: false, message: (e as Error).message };
      if (mode === "vulnerable") setVulnProfile(err);
      else setSecureProfile(err);
    }
    setLoading(false);
  }, [vulnSession, secureSession]);

  return (
    <LabLayout
      title="IDOR (Insecure Direct Object Reference)"
      subtitle="IDを書き換えるだけで他人のデータが見える"
      description="URLやリクエストに含まれるユーザーIDを別の値に変えるだけで、本来アクセスできないはずの他人のデータを閲覧できてしまう脆弱性を体験します。"
    >
      <h3 className="mt-6">Step 1: ログイン</h3>
      <p className="text-sm text-[#666]">
        まず user1 (ID=2) としてログインしてください。その後、IDを書き換えて他ユーザーのプロフィールにアクセスしてみましょう。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <LoginForm mode="vulnerable" loginResult={vulnLogin} isLoading={loading} onLogin={handleLogin} />
        }
        secureContent={
          <LoginForm mode="secure" loginResult={secureLogin} isLoading={loading} onLogin={handleLogin} />
        }
      />

      <h3 className="mt-6">Step 2: 他ユーザーのプロフィールにアクセス</h3>
      <p className="text-sm text-[#666]">
        ログインしたユーザーとは異なるIDを指定して、プロフィールを取得してみてください。
        脆弱版では他ユーザーのデータが取得でき、安全版ではアクセスが拒否されます。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <ProfileForm
            sessionId={vulnSession}
            result={vulnProfile}
            isLoading={loading}
            onFetch={(id) => fetchProfile("vulnerable", id)}
          />
        }
        secureContent={
          <ProfileForm
            sessionId={secureSession}
            result={secureProfile}
            isLoading={loading}
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
