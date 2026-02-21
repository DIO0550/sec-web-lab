import { useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

const BASE = "/api/labs/rate-limiting";

type LoginResult = {
  success: boolean;
  message: string;
  locked?: boolean;
  attemptsRemaining?: number;
  attemptsUsed?: number;
  _debug?: { message: string; totalAttempts?: number };
};

function LoginPanel({
  mode,
  results,
  isLoading,
  onLogin,
  onBruteForce,
}: {
  mode: "vulnerable" | "secure";
  results: LoginResult[];
  isLoading: boolean;
  onLogin: (username: string, password: string) => void;
  onBruteForce: () => void;
}) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("wrongpass");

  return (
    <div>
      <div className="mb-2">
        <label className="text-[13px] block">ユーザー名:</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="py-1 px-2 border border-[#ccc] rounded w-full" />
      </div>
      <div className="mb-2">
        <label className="text-[13px] block">パスワード:</label>
        <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} className="py-1 px-2 border border-[#ccc] rounded w-full" />
      </div>
      <div className="flex gap-2 mb-2">
        <FetchButton onClick={() => onLogin(username, password)} disabled={isLoading}>ログイン試行</FetchButton>
        <FetchButton onClick={onBruteForce} disabled={isLoading}>連続10回試行</FetchButton>
      </div>

      {results.length > 0 && (
        <div className="mt-2 max-h-[250px] overflow-auto">
          {results.map((r, i) => (
            <div key={i} className={`text-xs p-1 mb-1 rounded ${r.success ? "bg-[#e8f5e9]" : r.locked ? "bg-[#fff3e0]" : "bg-[#ffebee]"}`}>
              #{i + 1}: {r.message}
              {r.attemptsRemaining !== undefined && ` (残り${r.attemptsRemaining}回)`}
              {r._debug && <span className="text-[#888]"> [{r._debug.totalAttempts}回目]</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function RateLimiting() {
  const [vulnResults, setVulnResults] = useState<LoginResult[]>([]);
  const [secureResults, setSecureResults] = useState<LoginResult[]>([]);
  const [loading, setLoading] = useState(false);

  const doLogin = async (mode: "vulnerable" | "secure", username: string, password: string) => {
    const res = await fetch(`${BASE}/${mode}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    return res.json() as Promise<LoginResult>;
  };

  const handleLogin = async (mode: "vulnerable" | "secure", username: string, password: string) => {
    setLoading(true);
    try {
      const data = await doLogin(mode, username, password);
      if (mode === "vulnerable") setVulnResults((prev) => [...prev, data]);
      else setSecureResults((prev) => [...prev, data]);
    } catch (e) {
      const err = { success: false, message: (e as Error).message };
      if (mode === "vulnerable") setVulnResults((prev) => [...prev, err]);
      else setSecureResults((prev) => [...prev, err]);
    }
    setLoading(false);
  };

  const handleBruteForce = async (mode: "vulnerable" | "secure") => {
    setLoading(true);
    const passwords = ["123456", "password", "admin", "letmein", "welcome", "monkey", "master", "qwerty", "abc123", "secretpass"];
    for (const pw of passwords) {
      try {
        const data = await doLogin(mode, "admin", pw);
        if (mode === "vulnerable") setVulnResults((prev) => [...prev, data]);
        else setSecureResults((prev) => [...prev, data]);
        if (data.success || data.locked) break;
      } catch (e) {
        break;
      }
    }
    setLoading(false);
  };

  return (
    <LabLayout
      title="レート制限なし"
      subtitle="APIにレート制限がなくブルートフォース攻撃が可能"
      description="ログインAPIにレート制限がない場合、攻撃者はパスワード辞書を使って無制限にログイン試行（ブルートフォース攻撃）が可能です。"
    >
      <ComparisonPanel
        vulnerableContent={
          <LoginPanel mode="vulnerable" results={vulnResults} isLoading={loading} onLogin={(u, p) => handleLogin("vulnerable", u, p)} onBruteForce={() => handleBruteForce("vulnerable")} />
        }
        secureContent={
          <LoginPanel mode="secure" results={secureResults} isLoading={loading} onLogin={(u, p) => handleLogin("secure", u, p)} onBruteForce={() => handleBruteForce("secure")} />
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: 10回連続で試行できるか（最後にパスワードが当たる）</li>
          <li>安全版: 5回目以降でアカウントロックされるか</li>
          <li>レート制限とアカウントロックの違いを理解したか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
