import { useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

const BASE = "/api/labs/http-methods";

type MethodResult = {
  success: boolean;
  message?: string;
  user?: Record<string, unknown>;
  method?: string;
  headers?: Record<string, string>;
  _debug?: { message: string };
};

function MethodPanel({
  mode,
  results,
  isLoading,
  onRequest,
}: {
  mode: "vulnerable" | "secure";
  results: MethodResult[];
  isLoading: boolean;
  onRequest: (method: string) => void;
}) {
  const methods = ["GET", "PUT", "DELETE", "TRACE"];

  return (
    <div>
      <div className="flex gap-2 flex-wrap mb-2">
        {methods.map((m) => (
          <FetchButton key={m} onClick={() => onRequest(m)} disabled={isLoading}>
            {m}
          </FetchButton>
        ))}
      </div>

      {results.length > 0 && (
        <div className="mt-2 max-h-[300px] overflow-auto">
          {results.map((r, i) => (
            <div key={i} className={`text-xs p-2 mb-1 rounded ${r.success ? "bg-[#e8f5e9]" : "bg-[#ffebee]"}`}>
              <span className="font-bold">{r.method || ""}</span>: {r.message}
              {r._debug && <div className="text-[#888] italic mt-1">{r._debug.message}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function HttpMethods() {
  const [vulnResults, setVulnResults] = useState<MethodResult[]>([]);
  const [secureResults, setSecureResults] = useState<MethodResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleRequest = async (mode: "vulnerable" | "secure", method: string) => {
    setLoading(true);
    try {
      const options: RequestInit = { method };
      if (method === "PUT") {
        options.headers = { "Content-Type": "application/json" };
        options.body = JSON.stringify({ name: "hacked", role: "admin" });
      }
      const res = await fetch(`${BASE}/${mode}/users/2`, options);
      const data: MethodResult = await res.json();
      data.method = method;
      if (mode === "vulnerable") setVulnResults((prev) => [...prev, data]);
      else setSecureResults((prev) => [...prev, data]);
    } catch (e) {
      const err = { success: false, message: (e as Error).message, method };
      if (mode === "vulnerable") setVulnResults((prev) => [...prev, err]);
      else setSecureResults((prev) => [...prev, err]);
    }
    setLoading(false);
  };

  return (
    <LabLayout
      title="不要なHTTPメソッド許可"
      subtitle="PUT/DELETE/TRACE等の不要メソッドが許可されている"
      description="app.all()で全HTTPメソッドを受け付けると、PUT/DELETEでリソース改ざん・削除、TRACEでヘッダー情報漏洩が可能になります。"
    >
      <ComparisonPanel
        vulnerableContent={<MethodPanel mode="vulnerable" results={vulnResults} isLoading={loading} onRequest={(m) => handleRequest("vulnerable", m)} />}
        secureContent={<MethodPanel mode="secure" results={secureResults} isLoading={loading} onRequest={(m) => handleRequest("secure", m)} />}
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: PUT/DELETE/TRACE メソッドが成功するか</li>
          <li>安全版: 不要なメソッドに 405 が返されるか</li>
          <li>必要最小限のメソッドのみ許可する原則を理解したか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
