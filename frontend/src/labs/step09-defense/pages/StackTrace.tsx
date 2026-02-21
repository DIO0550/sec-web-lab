import { useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

const BASE = "/api/labs/stack-trace";

type StackResult = { success: boolean; message?: string; error?: string; stack?: string; errorId?: string; debug?: Record<string, unknown>; _debug?: { message: string; risks?: string[] } };

function StackPanel({ mode, results, isLoading, onTest }: { mode: "vulnerable" | "secure"; results: StackResult[]; isLoading: boolean; onTest: (endpoint: string) => void }) {
  return (
    <div>
      <div className="flex gap-2 mb-2">
        <FetchButton onClick={() => onTest("error")} disabled={isLoading}>エラー発生</FetchButton>
        <FetchButton onClick={() => onTest("debug")} disabled={isLoading}>デバッグ情報</FetchButton>
      </div>
      {results.length > 0 && (
        <div className="mt-2 max-h-[300px] overflow-auto">
          {results.map((r, i) => (
            <div key={i} className="text-xs p-2 mb-1 rounded bg-[#ffebee]">
              {r.error && <div className="font-bold">{r.error}</div>}
              {r.message && <div>{r.message}</div>}
              {r.errorId && <div className="text-[#666]">Error ID: {r.errorId}</div>}
              {r.stack && <pre className="text-[10px] mt-1 overflow-auto max-h-[100px] bg-[#f5f5f5] p-1 rounded">{r.stack}</pre>}
              {r.debug && <pre className="text-[10px] mt-1 overflow-auto bg-[#f5f5f5] p-1 rounded">{JSON.stringify(r.debug, null, 2)}</pre>}
              {r._debug && <div className="text-[#888] italic mt-1">{r._debug.message}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function StackTrace() {
  const [vulnResults, setVulnResults] = useState<StackResult[]>([]);
  const [secureResults, setSecureResults] = useState<StackResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleTest = async (mode: "vulnerable" | "secure", endpoint: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/${endpoint}`);
      const data: StackResult = await res.json();
      if (mode === "vulnerable") setVulnResults((prev) => [...prev, data]);
      else setSecureResults((prev) => [...prev, data]);
    } catch (e) {
      const err = { success: false, message: (e as Error).message };
      if (mode === "vulnerable") setVulnResults((prev) => [...prev, err]);
      else setSecureResults((prev) => [...prev, err]);
    }
    setLoading(false);
  };

  return (
    <LabLayout title="スタックトレース漏洩" subtitle="スタックトレースやデバッグ情報がレスポンスに露出" description="スタックトレースにはファイルパス、行番号、使用ライブラリの情報が含まれます。デバッグ情報にはNode.jsバージョン、環境変数、APIキーが含まれる場合があります。">
      <ComparisonPanel
        vulnerableContent={<StackPanel mode="vulnerable" results={vulnResults} isLoading={loading} onTest={(e) => handleTest("vulnerable", e)} />}
        secureContent={<StackPanel mode="secure" results={secureResults} isLoading={loading} onTest={(e) => handleTest("secure", e)} />}
      />
      <CheckpointBox>
        <ul>
          <li>脆弱版: スタックトレースやデバッグ情報がレスポンスに含まれるか</li>
          <li>安全版: エラーIDのみ返され内部情報が隠蔽されているか</li>
          <li>NODE_ENV=production でのエラーハンドリング設計を理解したか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
