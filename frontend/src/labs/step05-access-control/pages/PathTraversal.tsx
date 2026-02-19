import { useState, useCallback } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

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

  const presets = [
    { label: "sample.txt", value: "sample.txt" },
    { label: "report.txt", value: "report.txt" },
    { label: "../../../etc/passwd", value: "../../../etc/passwd" },
    { label: "../../.env", value: "../../.env" },
  ];

  return (
    <div>
      <div className="mb-1">
        <label className="text-[13px] block">ファイル名:</label>
        <input
          type="text"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          className="py-1 px-2 border border-[#ccc] rounded w-full font-mono text-sm"
        />
      </div>
      <div className="flex gap-1 flex-wrap mb-2">
        {presets.map((p) => (
          <button
            key={p.value}
            onClick={() => setFileName(p.value)}
            className={`text-[11px] py-0.5 px-2 cursor-pointer ${p.value.includes("..") ? "text-[#c00]" : ""}`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <FetchButton onClick={() => onFetch(fileName)} disabled={isLoading}>
        ファイル取得
      </FetchButton>

      {result && (
        <div className={`mt-2 p-3 rounded ${result.success ? "bg-[#e8f5e9] border border-[#4caf50]" : "bg-[#ffebee] border border-[#f44336]"}`}>
          <div className={`font-bold text-sm ${result.success ? "text-[#2e7d32]" : "text-[#c62828]"}`}>
            {result.success ? "ファイル取得成功" : "取得失敗"}
          </div>
          {result.message && <div className="text-[13px]">{result.message}</div>}
          {result.content && (
            <pre className="text-xs bg-[#f5f5f5] p-2 rounded mt-2 overflow-auto max-h-[200px] whitespace-pre-wrap">
              {result.content}
            </pre>
          )}
          {result._debug && (
            <div className="mt-2 text-xs text-[#888] italic">
              <div>{result._debug.message}</div>
              <div>解決パス: <code>{result._debug.resolvedPath}</code></div>
              <div>ベースDir: <code>{result._debug.baseDir}</code></div>
              {result._debug.check && <div>検証: <code>{result._debug.check}</code></div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- メインコンポーネント ---
export function PathTraversal() {
  const [vulnResult, setVulnResult] = useState<FileResult | null>(null);
  const [secureResult, setSecureResult] = useState<FileResult | null>(null);
  const [fileList, setFileList] = useState<FileListResult | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchFile = useCallback(async (mode: "vulnerable" | "secure", fileName: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/files?name=${encodeURIComponent(fileName)}`);
      const data: FileResult = await res.json();
      if (mode === "vulnerable") setVulnResult(data);
      else setSecureResult(data);
    } catch (e) {
      const err = { success: false, message: (e as Error).message };
      if (mode === "vulnerable") setVulnResult(err);
      else setSecureResult(err);
    }
    setLoading(false);
  }, []);

  const fetchFileList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/vulnerable/list`);
      const data: FileListResult = await res.json();
      setFileList(data);
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  return (
    <LabLayout
      title="Path Traversal"
      subtitle="../ でサーバーの秘密ファイルを読み取る"
      description="ファイルを取得するAPIのパスに ../ を挿入することで、本来公開されていないサーバー上の任意のファイル（/etc/passwd 等）を読み取れてしまう脆弱性を体験します。"
    >
      <h3 className="mt-6">Step 1: 公開ファイルの確認</h3>
      <p className="text-sm text-[#666]">
        まず、公開ディレクトリ（uploads/）にあるファイル一覧を確認してください。
      </p>
      <div className="mb-4">
        <FetchButton onClick={fetchFileList} disabled={loading}>
          ファイル一覧を表示
        </FetchButton>
        {fileList && (
          <div className="mt-2 p-2 bg-[#f5f5f5] rounded text-xs">
            <strong>uploads/ 内のファイル:</strong>
            <ul className="m-0 pl-4">
              {fileList.files.map((f) => (
                <li key={f} className="font-mono">{f}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <h3 className="mt-6">Step 2: パストラバーサル攻撃</h3>
      <p className="text-sm text-[#666]">
        正規のファイル名（sample.txt）を指定した後、<code>../../../etc/passwd</code> を指定してみてください。
        脆弱版ではサーバーのシステムファイルが読み取れ、安全版ではアクセスが拒否されます。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <FileForm
            mode="vulnerable"
            result={vulnResult}
            isLoading={loading}
            onFetch={(name) => fetchFile("vulnerable", name)}
          />
        }
        secureContent={
          <FileForm
            mode="secure"
            result={secureResult}
            isLoading={loading}
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
