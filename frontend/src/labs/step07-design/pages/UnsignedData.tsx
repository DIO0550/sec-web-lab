import { useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

const BASE = "/api/labs/unsigned-data";

type AdminResult = {
  success: boolean;
  message: string;
  adminData?: Record<string, unknown>;
  _debug?: { message: string; currentRole?: string };
};

function UnsignedPanel({
  mode,
  result,
  isLoading,
  onTest,
}: {
  mode: "vulnerable" | "secure";
  result: AdminResult | null;
  isLoading: boolean;
  onTest: (role: string, sessionId?: string) => void;
}) {
  const [role, setRole] = useState("user");
  const [sessionId, setSessionId] = useState("demo-user-session");

  return (
    <div>
      {mode === "vulnerable" ? (
        <div className="mb-2">
          <label className="text-[13px] block">X-User-Role ヘッダー:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="py-1 px-2 border border-[#ccc] rounded">
            <option value="user">user</option>
            <option value="admin">admin（改ざん）</option>
          </select>
        </div>
      ) : (
        <div className="mb-2">
          <label className="text-[13px] block">セッションID:</label>
          <select value={sessionId} onChange={(e) => setSessionId(e.target.value)} className="py-1 px-2 border border-[#ccc] rounded">
            <option value="demo-user-session">一般ユーザー</option>
            <option value="demo-admin-session">管理者</option>
            <option value="invalid">無効なセッション</option>
          </select>
        </div>
      )}
      <FetchButton onClick={() => onTest(role, mode === "secure" ? sessionId : undefined)} disabled={isLoading}>
        管理者ページにアクセス
      </FetchButton>

      {result && (
        <div className={`mt-2 p-3 rounded ${result.success ? "bg-[#e8f5e9] border border-[#4caf50]" : "bg-[#ffebee] border border-[#f44336]"}`}>
          <div className={`font-bold text-sm ${result.success ? "text-[#2e7d32]" : "text-[#c62828]"}`}>
            {result.success ? "アクセス成功" : "アクセス拒否"}
          </div>
          <div className="text-[13px] mt-1">{result.message}</div>
          {result.adminData && (
            <pre className="text-xs bg-[#f5f5f5] p-2 rounded mt-2 overflow-auto">
              {JSON.stringify(result.adminData, null, 2)}
            </pre>
          )}
          {result._debug && <div className="mt-2 text-xs text-[#888] italic">{result._debug.message}</div>}
        </div>
      )}
    </div>
  );
}

export function UnsignedData() {
  const [vulnResult, setVulnResult] = useState<AdminResult | null>(null);
  const [secureResult, setSecureResult] = useState<AdminResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async (mode: "vulnerable" | "secure", role: string, sessionId?: string) => {
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (mode === "vulnerable") headers["X-User-Role"] = role;
      if (sessionId) headers["X-Session-Id"] = sessionId;
      const res = await fetch(`${BASE}/${mode}/admin`, { headers });
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
    <LabLayout
      title="署名なしデータの信頼"
      subtitle="クライアントデータを署名なしで信頼してしまう"
      description="HTTPヘッダーやCookieの値を署名なしでそのまま信頼すると、攻撃者がヘッダーを改ざんするだけで権限昇格やデータ改ざんが可能になります。"
    >
      <ComparisonPanel
        vulnerableContent={<UnsignedPanel mode="vulnerable" result={vulnResult} isLoading={loading} onTest={(role) => handleTest("vulnerable", role)} />}
        secureContent={<UnsignedPanel mode="secure" result={secureResult} isLoading={loading} onTest={(_, sid) => handleTest("secure", "", sid)} />}
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: X-User-Role を admin に変えるだけで管理者アクセスできるか</li>
          <li>安全版: サーバー側セッションで権限を検証しているか</li>
          <li>クライアントデータを信頼しない原則を理解したか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
