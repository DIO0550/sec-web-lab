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

const BASE = "/api/labs/deserialization";

type DeserResult = {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
  result?: string;
  _debug?: { message: string; executedCommand?: string; risks?: string[] };
};

const presets = [
  { label: "通常データ", value: JSON.stringify({ name: "Taro", email: "taro@example.com", age: 25 }, null, 2) },
  { label: "悪意あるオブジェクト", value: JSON.stringify({ __type: "Command", command: "cat /etc/passwd", name: "hacker" }, null, 2) },
];

function DeserPanel({
  mode,
  result,
  isLoading,
  onDeserialize,
}: {
  mode: "vulnerable" | "secure";
  result: DeserResult | null;
  isLoading: boolean;
  onDeserialize: (data: string) => void;
}) {
  const [data, setData] = useState(presets[0].value);

  return (
    <div>
      <Textarea label="JSONデータ:" value={data} onChange={(e) => setData(e.target.value)} mono rows={5} className="mb-2" />
      <PresetButtons presets={presets} onSelect={(p) => setData(p.value)} className="mb-2" />
      <FetchButton onClick={() => onDeserialize(data)} disabled={isLoading}>デシリアライズ</FetchButton>

      <ExpandableSection isOpen={!!result}>
        <Alert variant={result?.success ? "success" : "error"} title={result?.message ?? ""} className="mt-2">
          {result?.result && <pre className="text-xs bg-bg-secondary p-2 rounded mt-2 overflow-auto">{result.result}</pre>}
          {result?.data && <pre className="text-xs bg-bg-secondary p-2 rounded mt-2 overflow-auto">{JSON.stringify(result.data, null, 2)}</pre>}
          {result?._debug && <div className="mt-2 text-xs italic opacity-70">{result._debug.message}</div>}
        </Alert>
      </ExpandableSection>
    </div>
  );
}

export function Deserialization() {
  const deser = useComparisonFetch<DeserResult>(BASE);

  const handleDeserialize = async (mode: "vulnerable" | "secure", data: string) => {
    await deser.run(mode, "/deserialize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: data,
    }, (e) => ({ success: false, message: e.message }));
  };

  return (
    <LabLayout
      title="安全でないデシリアライゼーション"
      subtitle="デシリアライズ時に悪意あるコードが実行される"
      description="デシリアライズ処理が入力を検証せずに実行すると、攻撃者が悪意あるオブジェクトを送信してリモートコード実行（RCE）が可能になる脆弱性を体験します。"
    >
      <ComparisonPanel
        vulnerableContent={<DeserPanel mode="vulnerable" result={deser.vulnerable} isLoading={deser.loading} onDeserialize={(d) => handleDeserialize("vulnerable", d)} />}
        secureContent={<DeserPanel mode="secure" result={deser.secure} isLoading={deser.loading} onDeserialize={(d) => handleDeserialize("secure", d)} />}
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: __type: Command でコマンド実行がシミュレートされるか</li>
          <li>安全版: 危険なプロパティが検出されて拒否されるか</li>
          <li>ホワイトリスト方式でデシリアライズを制限する重要性を理解したか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
