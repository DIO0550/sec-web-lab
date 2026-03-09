import { useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";
import { Select } from "@/components/Select";
import { Alert } from "@/components/Alert";

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
        <Select
          label="X-User-Role ヘッダー:"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          options={[
            { value: "user", label: "user" },
            { value: "admin", label: "admin（改ざん）" },
          ]}
          className="mb-2"
        />
      ) : (
        <Select
          label="セッションID:"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          options={[
            { value: "demo-user-session", label: "一般ユーザー" },
            { value: "demo-admin-session", label: "管理者" },
            { value: "invalid", label: "無効なセッション" },
          ]}
          className="mb-2"
        />
      )}
      <FetchButton onClick={() => onTest(role, mode === "secure" ? sessionId : undefined)} disabled={isLoading}>
        管理者ページにアクセス
      </FetchButton>

      {result && (
        <Alert variant={result.success ? "success" : "error"} title={result.success ? "アクセス成功" : "アクセス拒否"} className="mt-2">
          <div className="text-[13px] mt-1">{result.message}</div>
          {result.adminData && (
            <pre className="text-xs bg-bg-secondary p-2 rounded mt-2 overflow-auto">
              {JSON.stringify(result.adminData, null, 2)}
            </pre>
          )}
          {result._debug && <div className="mt-2 text-xs italic opacity-70">{result._debug.message}</div>}
        </Alert>
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
