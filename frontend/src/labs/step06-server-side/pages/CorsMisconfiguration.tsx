import { useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Alert } from "@/components/Alert";

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
      <Input label="Originヘッダー:" value={origin} onChange={(e) => setOrigin(e.target.value)} className="mb-2" />
      <div className="flex gap-1 flex-wrap mb-2">
        {presets.map((p) => (
          <Button key={p.label} variant="ghost" size="sm" onClick={() => setOrigin(p.value)}>
            {p.label}
          </Button>
        ))}
      </div>
      <FetchButton onClick={() => onTest(origin)} disabled={isLoading}>
        プロフィール取得
      </FetchButton>

      {result && (
        <Alert variant={result.success ? "success" : "error"} title={result.success ? "データ取得成功" : "アクセス拒否"} className="mt-2">
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
        </Alert>
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
