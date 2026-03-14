import { useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";
import { ExpandableSection } from "../../../components/ExpandableSection";
import { Textarea } from "@/components/Textarea";
import { Alert } from "@/components/Alert";
import { PresetButtons } from "@/components/PresetButtons";
import { useComparisonFetch } from "../../../hooks/useComparisonFetch";
import { getJson } from "../../../utils/api";

const BASE = "/api/labs/prototype-pollution";

type PollutionResult = {
  success: boolean;
  message?: string;
  config?: Record<string, unknown>;
  _debug?: { message: string; prototypeCheck?: { isAdmin: unknown; polluted: boolean }; hint?: string };
};

const presets = [
  { label: "通常データ", value: JSON.stringify({ theme: "dark", lang: "en" }, null, 2) },
  { label: "__proto__ 汚染", value: JSON.stringify({ __proto__: { isAdmin: true } }, null, 2) },
];

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
  const [data, setData] = useState(presets[0].value);

  return (
    <div>
      <Textarea label="マージするデータ:" value={data} onChange={(e) => setData(e.target.value)} mono rows={4} className="mb-2" />
      <PresetButtons presets={presets} onSelect={(p) => setData(p.value)} className="mb-2" />
      <div className="flex gap-2 mb-2">
        <FetchButton onClick={() => onMerge(data)} disabled={isLoading}>マージ実行</FetchButton>
        {mode === "vulnerable" && <FetchButton onClick={onAdmin} disabled={isLoading}>管理者ページ確認</FetchButton>}
      </div>

      <ExpandableSection isOpen={!!mergeResult}>
        <Alert variant="info" title="マージ結果:" className="mt-2">
          {mergeResult?.config && <pre className="text-xs mt-1 overflow-auto">{JSON.stringify(mergeResult.config, null, 2)}</pre>}
          {mergeResult?._debug && (
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
      </ExpandableSection>

      <ExpandableSection isOpen={!!adminResult}>
        <Alert variant={adminResult?.success ? "success" : "error"} title={adminResult?.success ? "管理者アクセス成功（プロトタイプ汚染）" : "アクセス拒否"} className="mt-2">
          <div className="text-[13px] mt-1">{adminResult?.message}</div>
        </Alert>
      </ExpandableSection>
    </div>
  );
}

export function PrototypePollution() {
  const merge = useComparisonFetch<PollutionResult>(BASE);
  const [vulnAdmin, setVulnAdmin] = useState<PollutionResult | null>(null);
  const [adminLoading, setAdminLoading] = useState(false);

  const handleMerge = async (mode: "vulnerable" | "secure", data: string) => {
    await merge.run(mode, "/merge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: data,
    }, (e) => ({ success: false, message: e.message }));
  };

  const handleAdmin = async () => {
    setAdminLoading(true);
    try {
      const result = await getJson<PollutionResult>(`${BASE}/vulnerable/admin`);
      setVulnAdmin(result);
    } catch (e) {
      setVulnAdmin({ success: false, message: (e as Error).message });
    }
    setAdminLoading(false);
  };

  return (
    <LabLayout
      title="Prototype Pollution"
      subtitle="__proto__経由でオブジェクトのプロトタイプを汚染"
      description="深いオブジェクトマージで__proto__プロパティが処理されると、すべてのオブジェクトのプロトタイプチェーンが汚染され、権限チェックのバイパスやRCEにつながる脆弱性を体験します。"
    >
      <ComparisonPanel
        vulnerableContent={
          <PollutionPanel mode="vulnerable" mergeResult={merge.vulnerable} adminResult={vulnAdmin} isLoading={merge.loading || adminLoading}
            onMerge={(d) => handleMerge("vulnerable", d)} onAdmin={handleAdmin} />
        }
        secureContent={
          <PollutionPanel mode="secure" mergeResult={merge.secure} adminResult={null} isLoading={merge.loading || adminLoading}
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
