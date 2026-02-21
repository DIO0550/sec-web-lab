import { useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

const BASE = "/api/labs/xxe";

type XxeResult = {
  success: boolean;
  message?: string;
  parsed?: { name: string; email: string };
  _debug?: { message: string; entityDetected?: boolean; entityValue?: string };
};

function XxePanel({
  mode,
  result,
  isLoading,
  onSubmit,
}: {
  mode: "vulnerable" | "secure";
  result: XxeResult | null;
  isLoading: boolean;
  onSubmit: (xml: string) => void;
}) {
  const normalXml = `<?xml version="1.0"?>
<user>
  <name>Taro</name>
  <email>taro@example.com</email>
</user>`;

  const maliciousXml = `<?xml version="1.0"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<user>
  <name>&xxe;</name>
  <email>test@example.com</email>
</user>`;

  const [xml, setXml] = useState(normalXml);

  return (
    <div>
      <div className="mb-2">
        <label className="text-[13px] block">XMLデータ:</label>
        <textarea
          value={xml}
          onChange={(e) => setXml(e.target.value)}
          className="py-1 px-2 border border-[#ccc] rounded w-full text-xs font-mono"
          rows={8}
        />
      </div>
      <div className="flex gap-1 flex-wrap mb-2">
        <button onClick={() => setXml(normalXml)} className="text-[11px] py-0.5 px-2 cursor-pointer">
          通常XML
        </button>
        <button onClick={() => setXml(maliciousXml)} className="text-[11px] py-0.5 px-2 cursor-pointer">
          XXEペイロード
        </button>
      </div>
      <FetchButton onClick={() => onSubmit(xml)} disabled={isLoading}>
        XMLインポート
      </FetchButton>

      {result && (
        <div className={`mt-2 p-3 rounded ${result.success ? "bg-[#e8f5e9] border border-[#4caf50]" : "bg-[#ffebee] border border-[#f44336]"}`}>
          <div className={`font-bold text-sm ${result.success ? "text-[#2e7d32]" : "text-[#c62828]"}`}>
            {result.success ? "パース成功" : "拒否"}
          </div>
          {result.message && <div className="text-[13px] mt-1">{result.message}</div>}
          {result.parsed && (
            <pre className="text-xs bg-[#f5f5f5] p-2 rounded mt-2 overflow-auto">
              {JSON.stringify(result.parsed, null, 2)}
            </pre>
          )}
          {result._debug && (
            <div className="mt-2 text-xs text-[#888] italic">{result._debug.message}</div>
          )}
        </div>
      )}
    </div>
  );
}

export function Xxe() {
  const [vulnResult, setVulnResult] = useState<XxeResult | null>(null);
  const [secureResult, setSecureResult] = useState<XxeResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (mode: "vulnerable" | "secure", xml: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/import`, {
        method: "POST",
        headers: { "Content-Type": "application/xml" },
        body: xml,
      });
      const data: XxeResult = await res.json();
      if (mode === "vulnerable") setVulnResult(data);
      else setSecureResult(data);
    } catch (e) {
      const err = { success: false, message: (e as Error).message };
      if (mode === "vulnerable") setVulnResult(err);
      else setSecureResult(err);
    }
    setLoading(false);
  };

  return (
    <LabLayout
      title="XXE (XML External Entity)"
      subtitle="XML外部エンティティによるファイル読み取り"
      description="XMLパーサーが外部エンティティ参照を解決する設定の場合、file:// スキームでサーバー上のファイルを読み取れる脆弱性を体験します。"
    >
      <ComparisonPanel
        vulnerableContent={
          <XxePanel mode="vulnerable" result={vulnResult} isLoading={loading} onSubmit={(xml) => handleSubmit("vulnerable", xml)} />
        }
        secureContent={
          <XxePanel mode="secure" result={secureResult} isLoading={loading} onSubmit={(xml) => handleSubmit("secure", xml)} />
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: XXEペイロードで /etc/passwd の内容が表示されるか</li>
          <li>安全版: DOCTYPE宣言を含むXMLが拒否されるか</li>
          <li>XMLパーサーの外部エンティティ解決を無効にすることの重要性を理解したか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
