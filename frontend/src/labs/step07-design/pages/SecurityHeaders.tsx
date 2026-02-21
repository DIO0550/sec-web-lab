import { useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

const BASE = "/api/labs/security-headers";

type HeaderResult = {
  success: boolean;
  content?: string;
  headers?: Record<string, string>;
  _debug?: { message: string; missingHeaders?: string[] };
};

function HeaderPanel({
  mode,
  result,
  isLoading,
  onTest,
}: {
  mode: "vulnerable" | "secure";
  result: HeaderResult | null;
  isLoading: boolean;
  onTest: () => void;
}) {
  return (
    <div>
      <FetchButton onClick={onTest} disabled={isLoading}>
        ヘッダー確認
      </FetchButton>

      {result && (
        <div className="mt-2 p-3 rounded bg-[#f5f5f5] border">
          <div className="font-bold text-sm mb-2">レスポンス情報</div>
          {result.headers && (
            <div>
              <div className="text-xs font-bold mb-1">設定されたヘッダー:</div>
              <pre className="text-xs overflow-auto bg-white p-2 rounded">
                {Object.entries(result.headers).map(([k, v]) => `${k}: ${v}`).join("\n")}
              </pre>
            </div>
          )}
          {result._debug?.missingHeaders && (
            <div className="mt-2">
              <div className="text-xs font-bold mb-1 text-[#c62828]">未設定のヘッダー:</div>
              <ul className="text-xs text-[#c62828]">
                {result._debug.missingHeaders.map((h) => <li key={h}>{h}</li>)}
              </ul>
            </div>
          )}
          {result._debug && <div className="mt-2 text-xs text-[#888] italic">{result._debug.message}</div>}
        </div>
      )}
    </div>
  );
}

export function SecurityHeaders() {
  const [vulnResult, setVulnResult] = useState<HeaderResult | null>(null);
  const [secureResult, setSecureResult] = useState<HeaderResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async (mode: "vulnerable" | "secure") => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/page`);
      const data: HeaderResult = await res.json();
      if (mode === "vulnerable") setVulnResult(data);
      else setSecureResult(data);
    } catch (e) {
      const err = { success: false } as HeaderResult;
      if (mode === "vulnerable") setVulnResult(err);
      else setSecureResult(err);
    }
    setLoading(false);
  };

  return (
    <LabLayout
      title="セキュリティヘッダー未設定"
      subtitle="セキュリティレスポンスヘッダの未設定・設定ミス"
      description="Content-Security-Policy、X-Content-Type-Options、X-Frame-Options等のセキュリティヘッダーが設定されていない場合の多層防御の欠如を体験します。"
    >
      <ComparisonPanel
        vulnerableContent={<HeaderPanel mode="vulnerable" result={vulnResult} isLoading={loading} onTest={() => handleTest("vulnerable")} />}
        secureContent={<HeaderPanel mode="secure" result={secureResult} isLoading={loading} onTest={() => handleTest("secure")} />}
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: セキュリティヘッダーが一切返されていないか</li>
          <li>安全版: CSP, HSTS, X-Frame-Options 等が設定されているか</li>
          <li>各ヘッダーがどの攻撃を防ぐか理解したか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
