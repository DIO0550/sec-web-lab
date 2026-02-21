import { useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

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
        <pre className="text-[10px] bg-[#f5f5f5] p-2 rounded mt-2 overflow-auto max-h-[150px]">{codeResult.code}</pre>
      )}

      <div className="mt-3 mb-2">
        <label className="text-[13px] block">送信元Origin:</label>
        <input type="text" value={origin} onChange={(e) => setOrigin(e.target.value)} className="py-1 px-2 border border-[#ccc] rounded w-full text-sm" />
      </div>
      <div className="flex gap-1 flex-wrap mb-2">
        {presets.map((p) => (
          <button key={p.label} onClick={() => setOrigin(p.origin)} className="text-[11px] py-0.5 px-2 cursor-pointer">{p.label}</button>
        ))}
      </div>
      <FetchButton onClick={() => onProcess(origin, { action: "redirect", url: "https://evil.example.com" })} disabled={isLoading}>
        メッセージ送信
      </FetchButton>

      {processResult && (
        <div className={`mt-2 p-3 rounded ${processResult.success ? "bg-[#e8f5e9] border border-[#4caf50]" : "bg-[#ffebee] border border-[#f44336]"}`}>
          <div className={`font-bold text-sm ${processResult.success ? "text-[#2e7d32]" : "text-[#c62828]"}`}>
            {processResult.success ? "メッセージ処理" : "拒否"}
          </div>
          {processResult.message && <div className="text-[13px] mt-1">{processResult.message}</div>}
          {processResult.receivedFrom && <div className="text-xs mt-1">From: {processResult.receivedFrom}</div>}
          {processResult._debug && <div className="mt-2 text-xs text-[#888] italic">{processResult._debug.message}</div>}
        </div>
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
