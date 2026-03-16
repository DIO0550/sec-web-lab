import { useState, useEffect } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";
import { ExpandableSection } from "../../../components/ExpandableSection";
import { useComparisonFetch } from "../../../hooks/useComparisonFetch";
import { getJson, postJson } from "../../../utils/api";

const BASE = "/api/labs/fail-open";

type AdminResult = { success: boolean; message: string; data?: Record<string, unknown>; _debug?: { message: string } };

function FailPanel({ mode, result, authDown, isLoading, onAccess, onToggle }: { mode: "vulnerable" | "secure"; result: AdminResult | null; authDown: boolean; isLoading: boolean; onAccess: () => void; onToggle: () => void }) {
  return (
    <div>
      <div className={`text-xs p-2 rounded mb-2 ${authDown ? "bg-error-bg-light text-error-text-light" : "bg-success-bg text-success-text"}`}>
        認証サービス: {authDown ? "停止中" : "稼働中"}
      </div>
      <div className="flex gap-2 mb-2">
        <FetchButton onClick={onToggle} disabled={isLoading}>認証サービス ON/OFF</FetchButton>
        <FetchButton onClick={onAccess} disabled={isLoading}>管理者ページにアクセス</FetchButton>
      </div>

      <ExpandableSection isOpen={!!result}>
        <div className={`mt-2 p-3 rounded ${result?.success ? "bg-success-bg border border-success-border" : "bg-error-bg-light border border-error-border"}`}>
          <div className={`font-bold text-sm ${result?.success ? "text-success-text" : "text-error-text-light"}`}>
            {result?.success ? "アクセス成功" : "アクセス拒否"}
          </div>
          <div className="text-sm mt-1">{result?.message}</div>
          {result?.data && <pre className="text-xs bg-code-bg p-2 rounded mt-2 overflow-auto">{JSON.stringify(result.data, null, 2)}</pre>}
          {result?._debug && <div className="mt-2 text-xs text-text-muted italic">{result._debug.message}</div>}
        </div>
      </ExpandableSection>
    </div>
  );
}

export function FailOpen() {
  const access = useComparisonFetch<AdminResult>(BASE);
  const [authDown, setAuthDown] = useState(false);

  useEffect(() => {
    getJson<{ authServiceDown: boolean }>(`${BASE}/auth-service-status`).then((d) => setAuthDown(d.authServiceDown));
  }, []);

  const handleToggle = async () => {
    const data = await postJson<{ authServiceDown: boolean }>(`${BASE}/toggle-auth-service`, {});
    setAuthDown(data.authServiceDown);
  };

  const handleAccess = async (mode: "vulnerable" | "secure") => {
    await access.run(mode, "/admin", {
      headers: { Authorization: "Bearer invalid-token" },
    }, (e) => ({ success: false, message: e.message }));
  };

  return (
    <LabLayout title="Fail-Open" subtitle="認証サービス障害時にアクセスを許可してしまう" description="認証・認可の処理でエラーが発生した場合に、デフォルトでアクセスを許可（Fail-Open）してしまうか、拒否（Fail-Closed）するかの違いを体験します。">
      <ComparisonPanel
        vulnerableContent={<FailPanel mode="vulnerable" result={access.vulnerable} authDown={authDown} isLoading={access.loading} onAccess={() => handleAccess("vulnerable")} onToggle={handleToggle} />}
        secureContent={<FailPanel mode="secure" result={access.secure} authDown={authDown} isLoading={access.loading} onAccess={() => handleAccess("secure")} onToggle={handleToggle} />}
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
