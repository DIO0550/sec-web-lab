import { useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";
import { Button } from "@/components/Button";
import { Textarea } from "@/components/Textarea";
import { Alert } from "@/components/Alert";

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
      <Textarea label="JSONデータ:" value={data} onChange={(e) => setData(e.target.value)} mono rows={5} className="mb-2" />
      <div className="flex gap-1 flex-wrap mb-2">
        <Button variant="ghost" size="sm" onClick={() => setData(normalJson)}>通常データ</Button>
        <Button variant="ghost" size="sm" onClick={() => setData(maliciousJson)}>悪意あるオブジェクト</Button>
      </div>
      <FetchButton onClick={() => onDeserialize(data)} disabled={isLoading}>デシリアライズ</FetchButton>

      {result && (
        <Alert variant={result.success ? "success" : "error"} title={result.message} className="mt-2">
          {result.result && <pre className="text-xs bg-bg-secondary p-2 rounded mt-2 overflow-auto">{result.result}</pre>}
          {result.data && <pre className="text-xs bg-bg-secondary p-2 rounded mt-2 overflow-auto">{JSON.stringify(result.data, null, 2)}</pre>}
          {result._debug && <div className="mt-2 text-xs italic opacity-70">{result._debug.message}</div>}
        </Alert>
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
