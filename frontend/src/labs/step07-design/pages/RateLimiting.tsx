import { useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";
import { Input } from "@/components/Input";
import { Alert } from "@/components/Alert";
import { postJson } from "../../../utils/api";

const BASE = "/api/labs/rate-limiting";

type LoginResult = {
  success: boolean;
  message: string;
  locked?: boolean;
  attemptsRemaining?: number;
  attemptsUsed?: number;
  _debug?: { message: string; totalAttempts?: number };
};

const BRUTE_FORCE_PASSWORDS = [
  "123456", "password", "admin", "letmein", "welcome",
  "monkey", "master", "qwerty", "abc123", "secretpass",
];

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
      <Input label="ユーザー名:" type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="mb-2" />
      <Input label="パスワード:" type="text" value={password} onChange={(e) => setPassword(e.target.value)} className="mb-2" />
      <div className="flex gap-2 mb-2">
        <FetchButton onClick={() => onLogin(username, password)} disabled={isLoading}>ログイン試行</FetchButton>
        <FetchButton onClick={onBruteForce} disabled={isLoading}>連続10回試行</FetchButton>
      </div>

      {results.length > 0 && (
        <div className="mt-2 max-h-[250px] overflow-auto">
          {results.map((r, i) => (
            <Alert key={i} variant={r.success ? "success" : r.locked ? "warning" : "error"} className="text-xs mb-1">
              #{i + 1}: {r.message}
              {r.attemptsRemaining !== undefined && ` (残り${r.attemptsRemaining}回)`}
              {r._debug && <span className="opacity-70"> [{r._debug.totalAttempts}回目]</span>}
            </Alert>
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

  /** 結果をモードに応じて追加する */
  const appendResult = (mode: "vulnerable" | "secure", data: LoginResult) => {
    if (mode === "vulnerable") setVulnResults((prev) => [...prev, data]);
    else setSecureResults((prev) => [...prev, data]);
  };

  const handleLogin = async (mode: "vulnerable" | "secure", username: string, password: string) => {
    setLoading(true);
    try {
      const data = await postJson<LoginResult>(`${BASE}/${mode}/login`, { username, password });
      appendResult(mode, data);
    } catch (e) {
      appendResult(mode, { success: false, message: (e as Error).message });
    }
    setLoading(false);
  };

  const handleBruteForce = async (mode: "vulnerable" | "secure") => {
    setLoading(true);
    for (const pw of BRUTE_FORCE_PASSWORDS) {
      try {
        const data = await postJson<LoginResult>(`${BASE}/${mode}/login`, { username: "admin", password: pw });
        appendResult(mode, data);
        if (data.success || data.locked) break;
      } catch {
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
