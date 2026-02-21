import { useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

const BASE = "/api/labs/cors-misconfiguration";

type CorsResult = {
  success: boolean;
  message?: string;
  profile?: { name: string; email: string; role: string };
  _debug?: { message: string; reflectedOrigin?: string; corsHeaders?: Record<string, string> };
};

function CorsPanel({
  mode,
  result,
  isLoading,
  onTest,
}: {
  mode: "vulnerable" | "secure";
  result: CorsResult | null;
  isLoading: boolean;
  onTest: (origin: string) => void;
}) {
  const [origin, setOrigin] = useState("https://evil.example.com");

  const presets = [
    { label: "正規サイト", value: "http://localhost:5173" },
    { label: "攻撃者サイト", value: "https://evil.example.com" },
    { label: "類似ドメイン", value: "https://example.com.evil.com" },
  ];

  return (
    <div>
      <div className="mb-2">
        <label className="text-[13px] block">Originヘッダー:</label>
        <input
          type="text"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          className="py-1 px-2 border border-[#ccc] rounded w-full text-sm"
        />
      </div>
      <div className="flex gap-1 flex-wrap mb-2">
        {presets.map((p) => (
          <button key={p.label} onClick={() => setOrigin(p.value)} className="text-[11px] py-0.5 px-2 cursor-pointer">
            {p.label}
          </button>
        ))}
      </div>
      <FetchButton onClick={() => onTest(origin)} disabled={isLoading}>
        プロフィール取得
      </FetchButton>

      {result && (
        <div className={`mt-2 p-3 rounded ${result.success ? "bg-[#e8f5e9] border border-[#4caf50]" : "bg-[#ffebee] border border-[#f44336]"}`}>
          <div className={`font-bold text-sm ${result.success ? "text-[#2e7d32]" : "text-[#c62828]"}`}>
            {result.success ? "データ取得成功" : "アクセス拒否"}
          </div>
          {result.profile && (
            <pre className="text-xs bg-[#f5f5f5] p-2 rounded mt-2 overflow-auto">
              {JSON.stringify(result.profile, null, 2)}
            </pre>
          )}
          {result._debug && (
            <div className="mt-2 text-xs text-[#888] italic">
              {result._debug.message}
              {result._debug.corsHeaders && (
                <pre className="mt-1">{JSON.stringify(result._debug.corsHeaders, null, 2)}</pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function CorsMisconfiguration() {
  const [vulnResult, setVulnResult] = useState<CorsResult | null>(null);
  const [secureResult, setSecureResult] = useState<CorsResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async (mode: "vulnerable" | "secure", origin: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/profile?userId=1`, {
        headers: { Origin: origin },
      });
      const data: CorsResult = await res.json();
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
      title="CORS設定ミス"
      subtitle="オリジン間リソース共有の設定不備による認証データ窃取"
      description="Access-Control-Allow-Originヘッダーにリクエストのオリジンをそのまま反映すると、攻撃者のサイトから認証付きリクエストでデータを窃取できる脆弱性を体験します。"
    >
      <ComparisonPanel
        vulnerableContent={
          <CorsPanel mode="vulnerable" result={vulnResult} isLoading={loading} onTest={(o) => handleTest("vulnerable", o)} />
        }
        secureContent={
          <CorsPanel mode="secure" result={secureResult} isLoading={loading} onTest={(o) => handleTest("secure", o)} />
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: 攻撃者サイトのOriginでもAccess-Control-Allow-Originが反映されるか</li>
          <li>安全版: ホワイトリストにないOriginではCORSヘッダーが返されないか</li>
          <li>credentials: true と Origin反映の組み合わせの危険性を理解したか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
