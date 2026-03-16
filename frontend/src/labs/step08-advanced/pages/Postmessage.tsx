import { useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";
import { ExpandableSection } from "../../../components/ExpandableSection";
import { Input } from "@/components/Input";
import { Alert } from "@/components/Alert";
import { PresetButtons } from "@/components/PresetButtons";
import { useComparisonFetch } from "../../../hooks/useComparisonFetch";

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

const originPresets = [
  { label: "正規サイト", value: "http://localhost:5173" },
  { label: "攻撃者サイト", value: "https://evil.example.com" },
];

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

  return (
    <div>
      <FetchButton onClick={onViewCode} disabled={isLoading}>ハンドラーコードを確認</FetchButton>

      {codeResult?.code && (
        <pre className="text-xs bg-bg-secondary p-2 rounded mt-2 overflow-auto max-h-[150px]">{codeResult.code}</pre>
      )}

      <Input label="送信元Origin:" type="text" value={origin} onChange={(e) => setOrigin(e.target.value)} className="mt-3 mb-2" />
      <PresetButtons presets={originPresets} onSelect={(p) => setOrigin(p.value)} className="mb-2" />
      <FetchButton onClick={() => onProcess(origin, { action: "redirect", url: "https://evil.example.com" })} disabled={isLoading}>
        メッセージ送信
      </FetchButton>

      <ExpandableSection isOpen={!!processResult}>
        <Alert variant={processResult?.success ? "success" : "error"} title={processResult?.success ? "メッセージ処理" : "拒否"} className="mt-2">
          {processResult?.message && <div className="text-sm mt-1">{processResult.message}</div>}
          {processResult?.receivedFrom && <div className="text-xs mt-1">From: {processResult.receivedFrom}</div>}
          {processResult?._debug && <div className="mt-2 text-xs italic opacity-70">{processResult._debug.message}</div>}
        </Alert>
      </ExpandableSection>
    </div>
  );
}

export function Postmessage() {
  const code = useComparisonFetch<MsgResult>(BASE);
  const process = useComparisonFetch<MsgResult>(BASE);

  const handleViewCode = async (mode: "vulnerable" | "secure") => {
    await code.run(mode, "/receiver", undefined, (e) => ({
      success: false,
      message: e.message,
    }));
  };

  const handleProcess = async (mode: "vulnerable" | "secure", origin: string, data: Record<string, unknown>) => {
    await process.postJson(mode, "/process-message", { origin, data }, (e) => ({
      success: false,
      message: e.message,
    }));
  };

  return (
    <LabLayout
      title="postMessage脆弱性"
      subtitle="window.postMessageのオリジン検証不備"
      description="window.postMessageのイベントハンドラーでevent.originを検証しない場合、攻撃者のサイトから任意のメッセージを注入してDOM操作やリダイレクトが可能になる脆弱性を体験します。"
    >
      <ComparisonPanel
        vulnerableContent={
          <MsgPanel mode="vulnerable" codeResult={code.vulnerable} processResult={process.vulnerable} isLoading={code.loading || process.loading}
            onViewCode={() => handleViewCode("vulnerable")} onProcess={(o, d) => handleProcess("vulnerable", o, d)} />
        }
        secureContent={
          <MsgPanel mode="secure" codeResult={code.secure} processResult={process.secure} isLoading={code.loading || process.loading}
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
