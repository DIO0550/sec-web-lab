import { useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

const BASE = "/api/labs/deserialization";

type DeserResult = {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
  result?: string;
  _debug?: { message: string; executedCommand?: string; risks?: string[] };
};

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
  const normalJson = JSON.stringify({ name: "Taro", email: "taro@example.com", age: 25 }, null, 2);
  const maliciousJson = JSON.stringify({ __type: "Command", command: "cat /etc/passwd", name: "hacker" }, null, 2);
  const [data, setData] = useState(normalJson);

  return (
    <div>
      <div className="mb-2">
        <label className="text-[13px] block">JSONデータ:</label>
        <textarea value={data} onChange={(e) => setData(e.target.value)} className="py-1 px-2 border border-[#ccc] rounded w-full text-xs font-mono" rows={5} />
      </div>
      <div className="flex gap-1 flex-wrap mb-2">
        <button onClick={() => setData(normalJson)} className="text-[11px] py-0.5 px-2 cursor-pointer">通常データ</button>
        <button onClick={() => setData(maliciousJson)} className="text-[11px] py-0.5 px-2 cursor-pointer">悪意あるオブジェクト</button>
      </div>
      <FetchButton onClick={() => onDeserialize(data)} disabled={isLoading}>デシリアライズ</FetchButton>

      {result && (
        <div className={`mt-2 p-3 rounded ${result.success ? "bg-[#e8f5e9] border border-[#4caf50]" : "bg-[#ffebee] border border-[#f44336]"}`}>
          <div className="text-sm font-bold">{result.message}</div>
          {result.result && <pre className="text-xs bg-[#f5f5f5] p-2 rounded mt-2 overflow-auto">{result.result}</pre>}
          {result.data && <pre className="text-xs bg-[#f5f5f5] p-2 rounded mt-2 overflow-auto">{JSON.stringify(result.data, null, 2)}</pre>}
          {result._debug && <div className="mt-2 text-xs text-[#888] italic">{result._debug.message}</div>}
        </div>
      )}
    </div>
  );
}

export function Deserialization() {
  const [vulnResult, setVulnResult] = useState<DeserResult | null>(null);
  const [secureResult, setSecureResult] = useState<DeserResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDeserialize = async (mode: "vulnerable" | "secure", data: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/deserialize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: data,
      });
      const result: DeserResult = await res.json();
      if (mode === "vulnerable") setVulnResult(result);
      else setSecureResult(result);
    } catch (e) {
      const err = { success: false, message: (e as Error).message };
      if (mode === "vulnerable") setVulnResult(err);
      else setSecureResult(err);
    }
    setLoading(false);
  };

  return (
    <LabLayout
      title="安全でないデシリアライゼーション"
      subtitle="デシリアライズ時に悪意あるコードが実行される"
      description="デシリアライズ処理が入力を検証せずに実行すると、攻撃者が悪意あるオブジェクトを送信してリモートコード実行（RCE）が可能になる脆弱性を体験します。"
    >
      <ComparisonPanel
        vulnerableContent={<DeserPanel mode="vulnerable" result={vulnResult} isLoading={loading} onDeserialize={(d) => handleDeserialize("vulnerable", d)} />}
        secureContent={<DeserPanel mode="secure" result={secureResult} isLoading={loading} onDeserialize={(d) => handleDeserialize("secure", d)} />}
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
