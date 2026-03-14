import { useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";
import { PresetButtons } from "@/components/PresetButtons";
import { Textarea } from "@/components/Textarea";
import { Alert } from "@/components/Alert";
import { ExpandableSection } from "../../../components/ExpandableSection";
import { useComparisonFetch } from "../../../hooks/useComparisonFetch";

const BASE = "/api/labs/xxe";

type XxeResult = {
  success: boolean;
  message?: string;
  parsed?: { name: string; email: string };
  _debug?: { message: string; entityDetected?: boolean; entityValue?: string };
};

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

const presets = [
  { label: "通常XML", value: normalXml },
  { label: "XXEペイロード", value: maliciousXml },
];

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
  const [xml, setXml] = useState(normalXml);

  return (
    <div>
      <Textarea label="XMLデータ:" value={xml} onChange={(e) => setXml(e.target.value)} rows={8} mono className="mb-2" />
      <PresetButtons presets={presets} onSelect={(p) => setXml(p.value)} className="mb-2" />
      <FetchButton onClick={() => onSubmit(xml)} disabled={isLoading}>
        XMLインポート
      </FetchButton>

      <ExpandableSection isOpen={!!result}>
        <Alert variant={result?.success ? "success" : "error"} title={result?.success ? "パース成功" : "拒否"} className="mt-2">
          {result?.message && <div className="text-[13px] mt-1">{result?.message}</div>}
          {result?.parsed && (
            <pre className="text-xs bg-code-bg p-2 rounded mt-2 overflow-auto">
              {JSON.stringify(result?.parsed, null, 2)}
            </pre>
          )}
          {result?._debug && (
            <div className="mt-2 text-xs text-text-muted italic">{result?._debug.message}</div>
          )}
        </Alert>
      </ExpandableSection>
    </div>
  );
}

export function Xxe() {
  const result = useComparisonFetch<XxeResult>(BASE);

  const handleSubmit = async (mode: "vulnerable" | "secure", xml: string) => {
    await result.run(mode, "/import", {
      method: "POST",
      headers: { "Content-Type": "application/xml" },
      body: xml,
    }, (e) => ({
      success: false,
      message: e.message,
    }));
  };

  return (
    <LabLayout
      title="XXE (XML External Entity)"
      subtitle="XML外部エンティティによるファイル読み取り"
      description="XMLパーサーが外部エンティティ参照を解決する設定の場合、file:// スキームでサーバー上のファイルを読み取れる脆弱性を体験します。"
    >
      <ComparisonPanel
        vulnerableContent={
          <XxePanel mode="vulnerable" result={result.vulnerable} isLoading={result.loading} onSubmit={(xml) => handleSubmit("vulnerable", xml)} />
        }
        secureContent={
          <XxePanel mode="secure" result={result.secure} isLoading={result.loading} onSubmit={(xml) => handleSubmit("secure", xml)} />
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
