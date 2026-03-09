import { useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";
import { Button } from "@/components/Button";
import { Textarea } from "@/components/Textarea";
import { Alert } from "@/components/Alert";

const BASE = "/api/labs/prototype-pollution";

type PollutionResult = {
  success: boolean;
  message?: string;
  config?: Record<string, unknown>;
  _debug?: { message: string; prototypeCheck?: { isAdmin: unknown; polluted: boolean }; hint?: string };
};

function PollutionPanel({
  mode,
  mergeResult,
  adminResult,
  isLoading,
  onMerge,
  onAdmin,
}: {
  mode: "vulnerable" | "secure";
  mergeResult: PollutionResult | null;
  adminResult: PollutionResult | null;
  isLoading: boolean;
  onMerge: (data: string) => void;
  onAdmin: () => void;
}) {
  const normalJson = JSON.stringify({ theme: "dark", lang: "en" }, null, 2);
  const pollutionJson = JSON.stringify({ __proto__: { isAdmin: true } }, null, 2);
  const [data, setData] = useState(normalJson);

  return (
    <div>
      <Textarea label="マージするデータ:" value={data} onChange={(e) => setData(e.target.value)} mono rows={4} className="mb-2" />
      <div className="flex gap-1 flex-wrap mb-2">
        <Button variant="ghost" size="sm" onClick={() => setData(normalJson)}>通常データ</Button>
        <Button variant="ghost" size="sm" onClick={() => setData(pollutionJson)}>__proto__ 汚染</Button>
      </div>
      <div className="flex gap-2 mb-2">
        <FetchButton onClick={() => onMerge(data)} disabled={isLoading}>マージ実行</FetchButton>
        {mode === "vulnerable" && <FetchButton onClick={onAdmin} disabled={isLoading}>管理者ページ確認</FetchButton>}
      </div>

      {mergeResult && (
        <Alert variant="info" title="マージ結果:" className="mt-2">
          {mergeResult.config && <pre className="text-xs mt-1 overflow-auto">{JSON.stringify(mergeResult.config, null, 2)}</pre>}
          {mergeResult._debug && (
            <div className="mt-2 text-xs italic opacity-70">
              {mergeResult._debug.message}
              {mergeResult._debug.prototypeCheck && (
                <div className="mt-1">
                  isAdmin: {String(mergeResult._debug.prototypeCheck.isAdmin)} / 汚染: {String(mergeResult._debug.prototypeCheck.polluted)}
                </div>
              )}
            </div>
          )}
        </Alert>
      )}

      {adminResult && (
        <Alert variant={adminResult.success ? "success" : "error"} title={adminResult.success ? "管理者アクセス成功（プロトタイプ汚染）" : "アクセス拒否"} className="mt-2">
          <div className="text-[13px] mt-1">{adminResult.message}</div>
        </Alert>
      )}
    </div>
  );
}

export function PrototypePollution() {
  const [vulnMerge, setVulnMerge] = useState<PollutionResult | null>(null);
  const [secureMerge, setSecureMerge] = useState<PollutionResult | null>(null);
  const [vulnAdmin, setVulnAdmin] = useState<PollutionResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleMerge = async (mode: "vulnerable" | "secure", data: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/merge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: data,
      });
      const result: PollutionResult = await res.json();
      if (mode === "vulnerable") setVulnMerge(result);
      else setSecureMerge(result);
    } catch (e) {
      const err = { success: false, message: (e as Error).message };
      if (mode === "vulnerable") setVulnMerge(err);
      else setSecureMerge(err);
    }
    setLoading(false);
  };

  const handleAdmin = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/vulnerable/admin`);
      const result: PollutionResult = await res.json();
      setVulnAdmin(result);
    } catch (e) {
      setVulnAdmin({ success: false, message: (e as Error).message });
    }
    setLoading(false);
  };

  return (
    <LabLayout
      title="Prototype Pollution"
      subtitle="__proto__経由でオブジェクトのプロトタイプを汚染"
      description="深いオブジェクトマージで__proto__プロパティが処理されると、すべてのオブジェクトのプロトタイプチェーンが汚染され、権限チェックのバイパスやRCEにつながる脆弱性を体験します。"
    >
      <ComparisonPanel
        vulnerableContent={
          <PollutionPanel mode="vulnerable" mergeResult={vulnMerge} adminResult={vulnAdmin} isLoading={loading}
            onMerge={(d) => handleMerge("vulnerable", d)} onAdmin={handleAdmin} />
        }
        secureContent={
          <PollutionPanel mode="secure" mergeResult={secureMerge} adminResult={null} isLoading={loading}
            onMerge={(d) => handleMerge("secure", d)} onAdmin={() => {}} />
        }
      />

      <CheckpointBox>
        <ul>
          <li>{'脆弱版: {"__proto__": {"isAdmin": true}} で管理者アクセスが成功するか'}</li>
          <li>安全版: __proto__ キーが無視されるか</li>
          <li>Object.create(null) や Map の使用で防御できることを理解したか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
