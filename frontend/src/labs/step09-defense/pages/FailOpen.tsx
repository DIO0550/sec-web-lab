import { useState, useEffect } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

const BASE = "/api/labs/fail-open";

type AdminResult = { success: boolean; message: string; data?: Record<string, unknown>; _debug?: { message: string } };

function FailPanel({ mode, result, authDown, isLoading, onAccess, onToggle }: { mode: "vulnerable" | "secure"; result: AdminResult | null; authDown: boolean; isLoading: boolean; onAccess: () => void; onToggle: () => void }) {
  return (
    <div>
      <div className={`text-xs p-2 rounded mb-2 ${authDown ? "bg-[#ffebee] text-[#c62828]" : "bg-[#e8f5e9] text-[#2e7d32]"}`}>
        認証サービス: {authDown ? "停止中" : "稼働中"}
      </div>
      <div className="flex gap-2 mb-2">
        <FetchButton onClick={onToggle} disabled={isLoading}>認証サービス ON/OFF</FetchButton>
        <FetchButton onClick={onAccess} disabled={isLoading}>管理者ページにアクセス</FetchButton>
      </div>

      {result && (
        <div className={`mt-2 p-3 rounded ${result.success ? "bg-[#e8f5e9] border border-[#4caf50]" : "bg-[#ffebee] border border-[#f44336]"}`}>
          <div className={`font-bold text-sm ${result.success ? "text-[#2e7d32]" : "text-[#c62828]"}`}>
            {result.success ? "アクセス成功" : "アクセス拒否"}
          </div>
          <div className="text-[13px] mt-1">{result.message}</div>
          {result.data && <pre className="text-xs bg-[#f5f5f5] p-2 rounded mt-2 overflow-auto">{JSON.stringify(result.data, null, 2)}</pre>}
          {result._debug && <div className="mt-2 text-xs text-[#888] italic">{result._debug.message}</div>}
        </div>
      )}
    </div>
  );
}

export function FailOpen() {
  const [vulnResult, setVulnResult] = useState<AdminResult | null>(null);
  const [secureResult, setSecureResult] = useState<AdminResult | null>(null);
  const [authDown, setAuthDown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${BASE}/auth-service-status`).then((r) => r.json()).then((d) => setAuthDown(d.authServiceDown));
  }, []);

  const handleToggle = async () => {
    const res = await fetch(`${BASE}/toggle-auth-service`, { method: "POST" });
    const data = await res.json();
    setAuthDown(data.authServiceDown);
  };

  const handleAccess = async (mode: "vulnerable" | "secure") => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/admin`, {
        headers: { Authorization: "Bearer invalid-token" },
      });
      const data: AdminResult = await res.json();
      if (mode === "vulnerable") setVulnResult(data);
      else setSecureResult(data);
    } catch (e) {
      const err = { success: false, message: (e as Error).message };
      if (mode === "vulnerable") setVulnResult(err);
      else setSecureResult(err);
    }
    setLoading(false);
  };

  return (
    <LabLayout title="Fail-Open" subtitle="認証サービス障害時にアクセスを許可してしまう" description="認証・認可の処理でエラーが発生した場合に、デフォルトでアクセスを許可（Fail-Open）してしまうか、拒否（Fail-Closed）するかの違いを体験します。">
      <ComparisonPanel
        vulnerableContent={<FailPanel mode="vulnerable" result={vulnResult} authDown={authDown} isLoading={loading} onAccess={() => handleAccess("vulnerable")} onToggle={handleToggle} />}
        secureContent={<FailPanel mode="secure" result={secureResult} authDown={authDown} isLoading={loading} onAccess={() => handleAccess("secure")} onToggle={handleToggle} />}
      />
      <CheckpointBox>
        <ul>
          <li>認証サービス停止時: 脆弱版はアクセスが許可されるか</li>
          <li>認証サービス停止時: 安全版は 503 でアクセスが拒否されるか</li>
          <li>Fail-Closed 設計の原則を理解したか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
