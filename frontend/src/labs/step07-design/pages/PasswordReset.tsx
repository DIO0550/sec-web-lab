import { useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

const BASE = "/api/labs/password-reset";

type ResetResult = {
  success: boolean;
  message: string;
  _debug?: { message: string; token?: string; totalTokens?: number };
  _demo?: { token: string };
};

function ResetPanel({
  mode,
  results,
  isLoading,
  onRequest,
  onBruteForce,
}: {
  mode: "vulnerable" | "secure";
  results: ResetResult[];
  isLoading: boolean;
  onRequest: () => void;
  onBruteForce: () => void;
}) {
  const [token, setToken] = useState("");

  return (
    <div>
      <FetchButton onClick={onRequest} disabled={isLoading}>
        リセットリクエスト送信
      </FetchButton>
      {mode === "vulnerable" && (
        <FetchButton onClick={onBruteForce} disabled={isLoading}>
          トークン推測攻撃
        </FetchButton>
      )}

      <div className="mt-2 mb-2">
        <label className="text-[13px] block">トークン:</label>
        <input type="text" value={token} onChange={(e) => setToken(e.target.value)} className="py-1 px-2 border border-[#ccc] rounded w-full text-sm font-mono" />
      </div>

      {results.length > 0 && (
        <div className="mt-2 max-h-[200px] overflow-auto">
          {results.map((r, i) => (
            <div key={i} className={`text-xs p-1 mb-1 rounded ${r.success ? "bg-[#e8f5e9]" : "bg-[#ffebee]"}`}>
              {r.message}
              {r._debug?.token && <span className="font-mono ml-1">[token: {r._debug.token}]</span>}
              {r._demo?.token && <span className="font-mono ml-1">[token: {r._demo.token.substring(0, 8)}...]</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function PasswordReset() {
  const [vulnResults, setVulnResults] = useState<ResetResult[]>([]);
  const [secureResults, setSecureResults] = useState<ResetResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleRequest = async (mode: "vulnerable" | "secure") => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/reset-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "victim@example.com" }),
      });
      const data: ResetResult = await res.json();
      if (mode === "vulnerable") setVulnResults((prev) => [...prev, data]);
      else setSecureResults((prev) => [...prev, data]);
    } catch (e) {
      const err = { success: false, message: (e as Error).message };
      if (mode === "vulnerable") setVulnResults((prev) => [...prev, err]);
      else setSecureResults((prev) => [...prev, err]);
    }
    setLoading(false);
  };

  const handleBruteForce = async () => {
    setLoading(true);
    // 連番トークンを推測
    for (let i = 1; i <= 10; i++) {
      const token = String(i).padStart(4, "0");
      try {
        const res = await fetch(`${BASE}/vulnerable/reset-confirm`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, newPassword: "hacked123" }),
        });
        const data: ResetResult = await res.json();
        data.message = `token=${token}: ${data.message}`;
        setVulnResults((prev) => [...prev, data]);
        if (data.success) break;
      } catch {
        break;
      }
    }
    setLoading(false);
  };

  return (
    <LabLayout
      title="推測可能なパスワードリセット"
      subtitle="パスワードリセットトークンが連番で推測可能"
      description="パスワードリセットトークンが連番や短い値で生成される場合、攻撃者がトークンを推測してアカウントを乗っ取ることが可能です。"
    >
      <ComparisonPanel
        vulnerableContent={<ResetPanel mode="vulnerable" results={vulnResults} isLoading={loading} onRequest={() => handleRequest("vulnerable")} onBruteForce={handleBruteForce} />}
        secureContent={<ResetPanel mode="secure" results={secureResults} isLoading={loading} onRequest={() => handleRequest("secure")} onBruteForce={() => {}} />}
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: トークンが連番で推測でき、アカウント乗っ取りが可能か</li>
          <li>安全版: crypto.randomUUID() で推測不可能なトークンが生成されているか</li>
          <li>有効期限と使い回し防止の重要性を理解したか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
