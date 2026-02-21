import { useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

const BASE = "/api/labs/cache-control";

type CacheResult = {
  success: boolean;
  profile?: Record<string, string>;
  headers?: Record<string, string>;
  _debug?: { message: string; risks?: string[] };
};

function CachePanel({
  mode,
  result,
  isLoading,
  onTest,
}: {
  mode: "vulnerable" | "secure";
  result: CacheResult | null;
  isLoading: boolean;
  onTest: () => void;
}) {
  return (
    <div>
      <FetchButton onClick={onTest} disabled={isLoading}>
        プロフィール取得
      </FetchButton>

      {result && (
        <div className="mt-2 p-3 rounded bg-[#f5f5f5] border">
          {result.profile && (
            <div>
              <div className="text-xs font-bold mb-1">個人情報:</div>
              <pre className="text-xs overflow-auto bg-white p-2 rounded">
                {JSON.stringify(result.profile, null, 2)}
              </pre>
            </div>
          )}
          {result.headers && (
            <div className="mt-2">
              <div className="text-xs font-bold mb-1">キャッシュ制御ヘッダー:</div>
              <pre className="text-xs overflow-auto bg-white p-2 rounded">
                {Object.entries(result.headers).map(([k, v]) => `${k}: ${v}`).join("\n")}
              </pre>
            </div>
          )}
          {result._debug && (
            <div className="mt-2">
              <div className="text-xs text-[#888] italic">{result._debug.message}</div>
              {result._debug.risks && (
                <ul className="text-xs text-[#c62828] mt-1">
                  {result._debug.risks.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function CacheControl() {
  const [vulnResult, setVulnResult] = useState<CacheResult | null>(null);
  const [secureResult, setSecureResult] = useState<CacheResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async (mode: "vulnerable" | "secure") => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/profile`);
      const data: CacheResult = await res.json();
      if (mode === "vulnerable") setVulnResult(data);
      else setSecureResult(data);
    } catch (e) {
      const err = { success: false } as CacheResult;
      if (mode === "vulnerable") setVulnResult(err);
      else setSecureResult(err);
    }
    setLoading(false);
  };

  return (
    <LabLayout
      title="キャッシュ制御の不備"
      subtitle="機密データがキャッシュに残存する"
      description="Cache-Controlヘッダーが設定されていない場合、個人情報やクレジットカード情報がブラウザキャッシュやCDNに残存し、情報漏洩につながる脆弱性を体験します。"
    >
      <ComparisonPanel
        vulnerableContent={<CachePanel mode="vulnerable" result={vulnResult} isLoading={loading} onTest={() => handleTest("vulnerable")} />}
        secureContent={<CachePanel mode="secure" result={secureResult} isLoading={loading} onTest={() => handleTest("secure")} />}
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: Cache-Control ヘッダーが未設定か</li>
          <li>安全版: no-store, no-cache, must-revalidate, private が設定されているか</li>
          <li>共有PCやCDNでのキャッシュ残存リスクを理解したか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
