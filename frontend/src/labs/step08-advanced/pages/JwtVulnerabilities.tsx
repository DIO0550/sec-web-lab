import { useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";
import { ExpandableSection } from "../../../components/ExpandableSection";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Textarea } from "@/components/Textarea";
import { Alert } from "@/components/Alert";
import { useComparisonFetch } from "../../../hooks/useComparisonFetch";

const BASE = "/api/labs/jwt-vulnerabilities";

type JwtResult = {
  success: boolean;
  message: string;
  token?: string;
  profile?: Record<string, unknown>;
  _debug?: { message: string; algorithm?: string };
};

function JwtPanel({
  mode,
  loginResult,
  profileResult,
  isLoading,
  onLogin,
  onProfile,
  onAlgNone,
}: {
  mode: "vulnerable" | "secure";
  loginResult: JwtResult | null;
  profileResult: JwtResult | null;
  isLoading: boolean;
  onLogin: (u: string, p: string) => void;
  onProfile: (token: string) => void;
  onAlgNone: () => void;
}) {
  const [token, setToken] = useState("");

  return (
    <div>
      <div className="mb-3">
        <FetchButton onClick={() => onLogin("user1", "password1")} disabled={isLoading}>
          user1 でログイン
        </FetchButton>
        {loginResult?.token && (
          <div className="mt-1">
            <Input
              label="取得トークン:"
              type="text"
              value={loginResult.token}
              readOnly
              onClick={() => setToken(loginResult.token || "")}
            />
            <Button variant="ghost" size="sm" onClick={() => setToken(loginResult.token || "")}>
              トークンをコピー
            </Button>
          </div>
        )}
      </div>

      <div className="mb-3">
        <Textarea
          label="トークン（改ざん可能）:"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          mono
          rows={3}
        />
        <div className="flex gap-1 mt-1">
          <FetchButton onClick={() => onProfile(token)} disabled={isLoading}>
            プロフィール取得
          </FetchButton>
          {mode === "vulnerable" && (
            <FetchButton onClick={onAlgNone} disabled={isLoading}>
              alg=none 攻撃
            </FetchButton>
          )}
        </div>
      </div>

      <ExpandableSection isOpen={!!profileResult}>
        <Alert variant={profileResult?.success ? "success" : "error"} title={profileResult?.success ? "認証成功" : "認証失敗"} className="mt-2">
          <div className="text-sm mt-1">{profileResult?.message}</div>
          {profileResult?.profile && (
            <pre className="text-xs bg-bg-secondary p-2 rounded mt-2 overflow-auto">
              {JSON.stringify(profileResult.profile, null, 2)}
            </pre>
          )}
          {profileResult?._debug && <div className="mt-2 text-xs italic opacity-70">{profileResult._debug.message}</div>}
        </Alert>
      </ExpandableSection>
    </div>
  );
}

export function JwtVulnerabilities() {
  const login = useComparisonFetch<JwtResult>(BASE);
  const profile = useComparisonFetch<JwtResult>(BASE);

  const handleLogin = async (mode: "vulnerable" | "secure", username: string, password: string) => {
    await login.postJson(mode, "/login", { username, password }, (e) => ({
      success: false,
      message: e.message,
    }));
  };

  const handleProfile = async (mode: "vulnerable" | "secure", token: string) => {
    await profile.run(mode, "/profile", {
      headers: { Authorization: `Bearer ${token}` },
    }, (e) => ({ success: false, message: e.message }));
  };

  const handleAlgNone = async () => {
    // alg=none でadminになりすまし
    const header = btoa(JSON.stringify({ alg: "none", typ: "JWT" })).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    const payload = btoa(JSON.stringify({ sub: "admin", role: "admin" })).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    const fakeToken = `${header}.${payload}.`;
    await handleProfile("vulnerable", fakeToken);
  };

  return (
    <LabLayout
      title="JWT脆弱性"
      subtitle="JWT署名検証不備による認証バイパス"
      description="JWTのアルゴリズム(alg)フィールドを'none'に変更して署名検証をスキップし、任意のユーザーになりすませる脆弱性を体験します。"
    >
      <ComparisonPanel
        vulnerableContent={
          <JwtPanel mode="vulnerable" loginResult={login.vulnerable} profileResult={profile.vulnerable} isLoading={login.loading || profile.loading}
            onLogin={(u, p) => handleLogin("vulnerable", u, p)} onProfile={(t) => handleProfile("vulnerable", t)} onAlgNone={handleAlgNone} />
        }
        secureContent={
          <JwtPanel mode="secure" loginResult={login.secure} profileResult={profile.secure} isLoading={login.loading || profile.loading}
            onLogin={(u, p) => handleLogin("secure", u, p)} onProfile={(t) => handleProfile("secure", t)} onAlgNone={() => {}} />
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: alg=none でadminになりすませるか</li>
          <li>安全版: alg=none トークンが拒否されるか</li>
          <li>JWTのアルゴリズム固定と署名検証の重要性を理解したか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
