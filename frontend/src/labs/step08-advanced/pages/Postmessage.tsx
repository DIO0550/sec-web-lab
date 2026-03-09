import { useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Alert } from "@/components/Alert";

const BASE = "/api/labs/postmessage";

type MsgResult = {
  success: boolean;
  message?: string;
  description?: string;
  code?: string;
  processed?: boolean;
  receivedFrom?: string;
  data?: Record<string, unknown>;
  _debug?: { message: string; risks?: string[] };
};

function MsgPanel({
  mode,
  codeResult,
  processResult,
  isLoading,
  onViewCode,
  onProcess,
}: {
  mode: "vulnerable" | "secure";
  codeResult: MsgResult | null;
  processResult: MsgResult | null;
  isLoading: boolean;
  onViewCode: () => void;
  onProcess: (origin: string, data: Record<string, unknown>) => void;
}) {
  const [origin, setOrigin] = useState("https://evil.example.com");

  const presets = [
    { label: "正規サイト", origin: "http://localhost:5173" },
    { label: "攻撃者サイト", origin: "https://evil.example.com" },
  ];

  return (
    <div>
      <FetchButton onClick={onViewCode} disabled={isLoading}>ハンドラーコードを確認</FetchButton>

      {codeResult?.code && (
        <pre className="text-[10px] bg-bg-secondary p-2 rounded mt-2 overflow-auto max-h-[150px]">{codeResult.code}</pre>
      )}

      <Input label="送信元Origin:" type="text" value={origin} onChange={(e) => setOrigin(e.target.value)} className="mt-3 mb-2" />
      <div className="flex gap-1 flex-wrap mb-2">
        {presets.map((p) => (
          <Button key={p.label} variant="ghost" size="sm" onClick={() => setOrigin(p.origin)}>{p.label}</Button>
        ))}
      </div>
      <FetchButton onClick={() => onProcess(origin, { action: "redirect", url: "https://evil.example.com" })} disabled={isLoading}>
        メッセージ送信
      </FetchButton>

      {processResult && (
        <Alert variant={processResult.success ? "success" : "error"} title={processResult.success ? "メッセージ処理" : "拒否"} className="mt-2">
          {processResult.message && <div className="text-[13px] mt-1">{processResult.message}</div>}
          {processResult.receivedFrom && <div className="text-xs mt-1">From: {processResult.receivedFrom}</div>}
          {processResult._debug && <div className="mt-2 text-xs italic opacity-70">{processResult._debug.message}</div>}
        </Alert>
      )}
    </div>
  );
}

export function Postmessage() {
  const [vulnCode, setVulnCode] = useState<MsgResult | null>(null);
  const [secureCode, setSecureCode] = useState<MsgResult | null>(null);
  const [vulnProcess, setVulnProcess] = useState<MsgResult | null>(null);
  const [secureProcess, setSecureProcess] = useState<MsgResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleViewCode = async (mode: "vulnerable" | "secure") => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/receiver`);
      const data: MsgResult = await res.json();
      if (mode === "vulnerable") setVulnCode(data);
      else setSecureCode(data);
    } catch (e) {
      const err = { success: false, message: (e as Error).message };
      if (mode === "vulnerable") setVulnCode(err);
      else setSecureCode(err);
    }
    setLoading(false);
  };

  const handleProcess = async (mode: "vulnerable" | "secure", origin: string, data: Record<string, unknown>) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/process-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin, data }),
      });
      const result: MsgResult = await res.json();
      if (mode === "vulnerable") setVulnProcess(result);
      else setSecureProcess(result);
    } catch (e) {
      const err = { success: false, message: (e as Error).message };
      if (mode === "vulnerable") setVulnProcess(err);
      else setSecureProcess(err);
    }
    setLoading(false);
  };

  return (
    <LabLayout
      title="postMessage脆弱性"
      subtitle="window.postMessageのオリジン検証不備"
      description="window.postMessageのイベントハンドラーでevent.originを検証しない場合、攻撃者のサイトから任意のメッセージを注入してDOM操作やリダイレクトが可能になる脆弱性を体験します。"
    >
      <ComparisonPanel
        vulnerableContent={
          <MsgPanel mode="vulnerable" codeResult={vulnCode} processResult={vulnProcess} isLoading={loading}
            onViewCode={() => handleViewCode("vulnerable")} onProcess={(o, d) => handleProcess("vulnerable", o, d)} />
        }
        secureContent={
          <MsgPanel mode="secure" codeResult={secureCode} processResult={secureProcess} isLoading={loading}
            onViewCode={() => handleViewCode("secure")} onProcess={(o, d) => handleProcess("secure", o, d)} />
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: 攻撃者Originからのメッセージが処理されるか</li>
          <li>安全版: 許可リストにないOriginが拒否されるか</li>
          <li>event.origin の検証の重要性を理解したか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
