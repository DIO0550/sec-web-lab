import { useState } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

const BASE = "/api/labs/file-upload";

type UploadResult = {
  success: boolean;
  message?: string;
  file?: { id: string; originalName: string; savedName: string; size: number; mimeType: string };
  _debug?: { message: string; risks?: string[] };
};

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
  const [content, setContent] = useState("(ファイルコンテンツ)");
  const [mimeType, setMimeType] = useState("image/jpeg");

  const presets = [
    { label: "画像", fileName: "photo.jpg", mimeType: "image/jpeg" },
    { label: "PHPシェル", fileName: "shell.php", mimeType: "application/x-php" },
    { label: "JSファイル", fileName: "backdoor.js", mimeType: "application/javascript" },
    { label: "パストラバーサル", fileName: "../../etc/cron.d/backdoor", mimeType: "text/plain" },
  ];

  return (
    <div>
      <div className="mb-2">
        <label className="text-[13px] block">ファイル名:</label>
        <input
          type="text"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          className="py-1 px-2 border border-[#ccc] rounded w-full text-sm"
        />
      </div>
      <div className="mb-2">
        <label className="text-[13px] block">MIMEタイプ:</label>
        <input
          type="text"
          value={mimeType}
          onChange={(e) => setMimeType(e.target.value)}
          className="py-1 px-2 border border-[#ccc] rounded w-full text-sm"
        />
      </div>
      <div className="flex gap-1 flex-wrap mb-2">
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => { setFileName(p.fileName); setMimeType(p.mimeType); }}
            className="text-[11px] py-0.5 px-2 cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>
      <FetchButton onClick={() => onUpload(fileName, content, mimeType)} disabled={isLoading}>
        アップロード
      </FetchButton>

      {result && (
        <div className={`mt-2 p-3 rounded ${result.success ? "bg-[#e8f5e9] border border-[#4caf50]" : "bg-[#ffebee] border border-[#f44336]"}`}>
          <div className={`font-bold text-sm ${result.success ? "text-[#2e7d32]" : "text-[#c62828]"}`}>
            {result.success ? "アップロード成功" : "アップロード拒否"}
          </div>
          {result.message && <div className="text-[13px] mt-1">{result.message}</div>}
          {result.file && (
            <pre className="text-xs bg-[#f5f5f5] p-2 rounded mt-2 overflow-auto">
              {JSON.stringify(result.file, null, 2)}
            </pre>
          )}
          {result._debug && (
            <div className="mt-2 text-xs text-[#888] italic">
              {result._debug.message}
              {result._debug.risks && (
                <ul className="mt-1">{result._debug.risks.map((r, i) => <li key={i}>{r}</li>)}</ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function FileUpload() {
  const [vulnResult, setVulnResult] = useState<UploadResult | null>(null);
  const [secureResult, setSecureResult] = useState<UploadResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (mode: "vulnerable" | "secure", fileName: string, content: string, mimeType: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, content, mimeType }),
      });
      const data: UploadResult = await res.json();
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
      title="ファイルアップロード攻撃"
      subtitle="ファイルアップロード検証不備によるWebシェル実行"
      description="ファイルの拡張子・MIMEタイプ・コンテンツの検証が不十分な場合、実行可能ファイル（Webシェル等）をアップロードしてサーバー上で任意のコードを実行できる脆弱性を体験します。"
    >
      <ComparisonPanel
        vulnerableContent={
          <UploadPanel mode="vulnerable" result={vulnResult} isLoading={loading} onUpload={(f, c, m) => handleUpload("vulnerable", f, c, m)} />
        }
        secureContent={
          <UploadPanel mode="secure" result={secureResult} isLoading={loading} onUpload={(f, c, m) => handleUpload("secure", f, c, m)} />
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
