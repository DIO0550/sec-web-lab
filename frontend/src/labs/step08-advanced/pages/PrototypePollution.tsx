import { useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

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
      <div className="mb-2">
        <label className="text-[13px] block">マージするデータ:</label>
        <textarea value={data} onChange={(e) => setData(e.target.value)} className="py-1 px-2 border border-[#ccc] rounded w-full text-xs font-mono" rows={4} />
      </div>
      <div className="flex gap-1 flex-wrap mb-2">
        <button onClick={() => setData(normalJson)} className="text-[11px] py-0.5 px-2 cursor-pointer">通常データ</button>
        <button onClick={() => setData(pollutionJson)} className="text-[11px] py-0.5 px-2 cursor-pointer">__proto__ 汚染</button>
      </div>
      <div className="flex gap-2 mb-2">
        <FetchButton onClick={() => onMerge(data)} disabled={isLoading}>マージ実行</FetchButton>
        {mode === "vulnerable" && <FetchButton onClick={onAdmin} disabled={isLoading}>管理者ページ確認</FetchButton>}
      </div>

      {mergeResult && (
        <div className={`mt-2 p-3 rounded bg-[#f5f5f5] border`}>
          <div className="text-xs font-bold">マージ結果:</div>
          {mergeResult.config && <pre className="text-xs mt-1 overflow-auto">{JSON.stringify(mergeResult.config, null, 2)}</pre>}
          {mergeResult._debug && (
            <div className="mt-2 text-xs text-[#888] italic">
              {mergeResult._debug.message}
              {mergeResult._debug.prototypeCheck && (
                <div className="mt-1">
                  isAdmin: {String(mergeResult._debug.prototypeCheck.isAdmin)} / 汚染: {String(mergeResult._debug.prototypeCheck.polluted)}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {adminResult && (
        <div className={`mt-2 p-3 rounded ${adminResult.success ? "bg-[#e8f5e9] border border-[#4caf50]" : "bg-[#ffebee] border border-[#f44336]"}`}>
          <div className={`font-bold text-sm ${adminResult.success ? "text-[#2e7d32]" : "text-[#c62828]"}`}>
            {adminResult.success ? "管理者アクセス成功（プロトタイプ汚染）" : "アクセス拒否"}
          </div>
          <div className="text-[13px] mt-1">{adminResult.message}</div>
        </div>
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
