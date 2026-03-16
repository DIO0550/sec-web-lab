import { useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";
import { PresetButtons } from "@/components/PresetButtons";
import { Input } from "@/components/Input";
import { Alert } from "@/components/Alert";
import { ExpandableSection } from "../../../components/ExpandableSection";
import { useComparisonFetch } from "../../../hooks/useComparisonFetch";

const BASE = "/api/labs/file-upload";

type UploadResult = {
  success: boolean;
  message?: string;
  file?: { id: string; originalName: string; savedName: string; size: number; mimeType: string };
  _debug?: { message: string; risks?: string[] };
};

const presets = [
  { label: "画像", fileName: "photo.jpg", mimeType: "image/jpeg" },
  { label: "PHPシェル", fileName: "shell.php", mimeType: "application/x-php" },
  { label: "JSファイル", fileName: "backdoor.js", mimeType: "application/javascript" },
  { label: "パストラバーサル", fileName: "../../etc/cron.d/backdoor", mimeType: "text/plain" },
];

function UploadPanel({
  mode,
  result,
  isLoading,
  onUpload,
}: {
  mode: "vulnerable" | "secure";
  result: UploadResult | null;
  isLoading: boolean;
  onUpload: (fileName: string, content: string, mimeType: string) => void;
}) {
  const [fileName, setFileName] = useState("photo.jpg");
  const [content] = useState("(ファイルコンテンツ)");
  const [mimeType, setMimeType] = useState("image/jpeg");

  return (
    <div>
      <Input label="ファイル名:" value={fileName} onChange={(e) => setFileName(e.target.value)} className="mb-2" />
      <Input label="MIMEタイプ:" value={mimeType} onChange={(e) => setMimeType(e.target.value)} className="mb-2" />
      <PresetButtons
        presets={presets}
        onSelect={(p) => { setFileName(p.fileName); setMimeType(p.mimeType); }}
        className="mb-2"
      />
      <FetchButton onClick={() => onUpload(fileName, content, mimeType)} disabled={isLoading}>
        アップロード
      </FetchButton>

      <ExpandableSection isOpen={!!result}>
        <Alert variant={result?.success ? "success" : "error"} title={result?.success ? "アップロード成功" : "アップロード拒否"} className="mt-2">
          {result?.message && <div className="text-sm mt-1">{result?.message}</div>}
          {result?.file && (
            <pre className="text-xs bg-code-bg p-2 rounded mt-2 overflow-auto">
              {JSON.stringify(result?.file, null, 2)}
            </pre>
          )}
          {result?._debug && (
            <div className="mt-2 text-xs text-text-muted italic">
              {result?._debug.message}
              {result?._debug.risks && (
                <ul className="mt-1">{result?._debug.risks.map((r, i) => <li key={i}>{r}</li>)}</ul>
              )}
            </div>
          )}
        </Alert>
      </ExpandableSection>
    </div>
  );
}

export function FileUpload() {
  const result = useComparisonFetch<UploadResult>(BASE);

  const handleUpload = async (mode: "vulnerable" | "secure", fileName: string, content: string, mimeType: string) => {
    await result.postJson(mode, "/upload", { fileName, content, mimeType }, (e) => ({
      success: false,
      message: e.message,
    }));
  };

  return (
    <LabLayout
      title="ファイルアップロード攻撃"
      subtitle="ファイルアップロード検証不備によるWebシェル実行"
      description="ファイルの拡張子・MIMEタイプ・コンテンツの検証が不十分な場合、実行可能ファイル（Webシェル等）をアップロードしてサーバー上で任意のコードを実行できる脆弱性を体験します。"
    >
      <ComparisonPanel
        vulnerableContent={
          <UploadPanel mode="vulnerable" result={result.vulnerable} isLoading={result.loading} onUpload={(f, c, m) => handleUpload("vulnerable", f, c, m)} />
        }
        secureContent={
          <UploadPanel mode="secure" result={result.secure} isLoading={result.loading} onUpload={(f, c, m) => handleUpload("secure", f, c, m)} />
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: .php や .js ファイルがアップロードできるか</li>
          <li>安全版: 許可されたファイル形式以外が拒否されるか</li>
          <li>ファイル名がランダム化されパストラバーサルが防止されているか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
