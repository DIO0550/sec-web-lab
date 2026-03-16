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
import { getJson } from "../../../utils/api";

const BASE = "/api/labs/path-traversal";

type FileResult = {
  success: boolean;
  message?: string;
  fileName?: string;
  content?: string;
  _debug?: {
    message: string;
    resolvedPath: string;
    baseDir: string;
    check?: string;
  };
};

type FileListResult = {
  success: boolean;
  files: string[];
  message?: string;
};

const presets = [
  { label: "sample.txt", value: "sample.txt" },
  { label: "report.txt", value: "report.txt" },
  { label: "../../../etc/passwd", value: "../../../etc/passwd" },
  { label: "../../.env", value: "../../.env" },
];

// --- ファイル取得フォーム ---
function FileForm({
  mode,
  result,
  isLoading,
  onFetch,
}: {
  mode: "vulnerable" | "secure";
  result: FileResult | null;
  isLoading: boolean;
  onFetch: (fileName: string) => void;
}) {
  const [fileName, setFileName] = useState("sample.txt");

  return (
    <div>
      <Input label="ファイル名:" value={fileName} onChange={(e) => setFileName(e.target.value)} className="mb-1" />
      <PresetButtons
        presets={presets}
        onSelect={(p) => setFileName(p.value)}
        className="mb-2"
      />
      <FetchButton onClick={() => onFetch(fileName)} disabled={isLoading}>
        ファイル取得
      </FetchButton>

      <ExpandableSection isOpen={!!result}>
        <Alert variant={result?.success ? "success" : "error"} title={result?.success ? "ファイル取得成功" : "取得失敗"} className="mt-2">
          {result?.message && <div className="text-sm">{result?.message}</div>}
          {result?.content && (
            <pre className="text-xs bg-code-bg p-2 rounded mt-2 overflow-auto max-h-[200px] whitespace-pre-wrap">
              {result?.content}
            </pre>
          )}
          {result?._debug && (
            <div className="mt-2 text-xs text-text-muted italic">
              <div>{result?._debug.message}</div>
              <div>解決パス: <code>{result?._debug.resolvedPath}</code></div>
              <div>ベースDir: <code>{result?._debug.baseDir}</code></div>
              {result?._debug.check && <div>検証: <code>{result?._debug.check}</code></div>}
            </div>
          )}
        </Alert>
      </ExpandableSection>
    </div>
  );
}

// --- メインコンポーネント ---
export function PathTraversal() {
  const fileFetch = useComparisonFetch<FileResult>(BASE);
  const [fileList, setFileList] = useState<FileListResult | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchFile = async (mode: "vulnerable" | "secure", fileName: string) => {
    await fileFetch.run(
      mode,
      `/files?name=${encodeURIComponent(fileName)}`,
      undefined,
      (e) => ({ success: false, message: e.message }),
    );
  };

  const fetchFileList = async () => {
    setLoading(true);
    try {
      const data = await getJson<FileListResult>(`${BASE}/vulnerable/list`);
      setFileList(data);
    } catch {
      // ignore
    }
    setLoading(false);
  };

  return (
    <LabLayout
      title="Path Traversal"
      subtitle="../ でサーバーの秘密ファイルを読み取る"
      description="ファイルを取得するAPIのパスに ../ を挿入することで、本来公開されていないサーバー上の任意のファイル（/etc/passwd 等）を読み取れてしまう脆弱性を体験します。"
    >
      <h3 className="mt-6">Step 1: 公開ファイルの確認</h3>
      <p className="text-sm text-text-secondary">
        まず、公開ディレクトリ（uploads/）にあるファイル一覧を確認してください。
      </p>
      <div className="mb-4">
        <FetchButton onClick={fetchFileList} disabled={loading}>
          ファイル一覧を表示
        </FetchButton>
        <ExpandableSection isOpen={!!fileList}>
          <div className="mt-2 p-2 bg-code-bg rounded text-xs">
            <strong>uploads/ 内のファイル:</strong>
            <ul className="m-0 pl-4">
              {fileList?.files.map((f) => (
                <li key={f} className="font-mono">{f}</li>
              ))}
            </ul>
          </div>
        </ExpandableSection>
      </div>

      <h3 className="mt-6">Step 2: パストラバーサル攻撃</h3>
      <p className="text-sm text-text-secondary">
        正規のファイル名（sample.txt）を指定した後、<code>../../../etc/passwd</code> を指定してみてください。
        脆弱版ではサーバーのシステムファイルが読み取れ、安全版ではアクセスが拒否されます。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <FileForm
            mode="vulnerable"
            result={fileFetch.vulnerable}
            isLoading={fileFetch.loading}
            onFetch={(name) => fetchFile("vulnerable", name)}
          />
        }
        secureContent={
          <FileForm
            mode="secure"
            result={fileFetch.secure}
            isLoading={fileFetch.loading}
            onFetch={(name) => fetchFile("secure", name)}
          />
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: <code>../../../etc/passwd</code> でシステムファイルが読み取れるか</li>
          <li>安全版: 同じ入力で 403 エラーが返されるか</li>
          <li><code>../</code> がファイルシステムでどう解決され、なぜ公開ディレクトリ外にアクセスできるか理解したか</li>
          <li><code>path.resolve()</code> + <code>startsWith()</code> がなぜこの攻撃を防げるか説明できるか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
