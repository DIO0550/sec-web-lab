import { useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";
import { Button } from "@/components/Button";
import { Textarea } from "@/components/Textarea";
import { Alert } from "@/components/Alert";

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
      <Textarea label="XMLデータ:" value={xml} onChange={(e) => setXml(e.target.value)} rows={8} mono className="mb-2" />
      <div className="flex gap-1 flex-wrap mb-2">
        <Button variant="ghost" size="sm" onClick={() => setXml(normalXml)}>
          通常XML
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setXml(maliciousXml)}>
          XXEペイロード
        </Button>
      </div>
      <FetchButton onClick={() => onSubmit(xml)} disabled={isLoading}>
        XMLインポート
      </FetchButton>

      {result && (
        <Alert variant={result.success ? "success" : "error"} title={result.success ? "パース成功" : "拒否"} className="mt-2">
          {result.message && <div className="text-[13px] mt-1">{result.message}</div>}
          {result.parsed && (
            <pre className="text-xs bg-[#f5f5f5] p-2 rounded mt-2 overflow-auto">
              {JSON.stringify(result.parsed, null, 2)}
            </pre>
          )}
          {result._debug && (
            <div className="mt-2 text-xs text-[#888] italic">{result._debug.message}</div>
          )}
        </Alert>
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
