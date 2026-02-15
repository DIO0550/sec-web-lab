import { useMultiTest, fetchText } from "../hooks/useLabFetch";
import { LabLayout } from "../components/LabLayout";
import { ComparisonPanel } from "../components/ComparisonPanel";
import { TextViewer } from "../components/ResponseViewer";
import { FetchButton } from "../components/FetchButton";
import { CheckpointBox } from "../components/CheckpointBox";

const TARGET_FILES = [
  { path: ".env", label: ".env (環境変数)" },
  { path: ".git/HEAD", label: ".git/HEAD (Git情報)" },
  { path: ".git/config", label: ".git/config (Git設定)" },
  { path: "robots.txt", label: "robots.txt" },
];

const FILE_PATHS = TARGET_FILES.map((f) => f.path);

function FileTestList({
  mode,
  results,
  isLoading,
  onFetch,
  onFetchAll,
}: {
  mode: "vulnerable" | "secure";
  results: Record<string, { status: number; contentType: string; body: string }>;
  isLoading: boolean;
  onFetch: (mode: "vulnerable" | "secure", path: string) => void;
  onFetchAll: (mode: "vulnerable" | "secure") => void;
}) {
  return (
    <>
      <FetchButton onClick={() => onFetchAll(mode)} disabled={isLoading}>
        全ファイル取得
      </FetchButton>

      {TARGET_FILES.map((file) => (
        <div key={file.path} style={{ marginTop: 16, borderBottom: "1px solid #ddd", paddingBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <code>{file.label}</code>
            <FetchButton onClick={() => onFetch(mode, file.path)} disabled={isLoading} size="small">
              取得
            </FetchButton>
          </div>
          <TextViewer result={results[file.path] ?? null} />
        </div>
      ))}
    </>
  );
}

export function SensitiveFileExposure() {
  const { vulnerableResults, secureResults, isLoading, runTest, runAll } =
    useMultiTest("/api/labs/sensitive-file-exposure", fetchText, FILE_PATHS);

  return (
    <LabLayout
      title="Sensitive File Exposure"
      subtitle="機密ファイルの露出 (.env / .git / robots.txt)"
      description=".env や .git/ 等の機密ファイルがWebから直接アクセスできる脆弱性です。"
    >
      <ComparisonPanel
        vulnerableContent={
          <FileTestList
            mode="vulnerable"
            results={vulnerableResults}
            isLoading={isLoading}
            onFetch={runTest}
            onFetchAll={runAll}
          />
        }
        secureContent={
          <FileTestList
            mode="secure"
            results={secureResults}
            isLoading={isLoading}
            onFetch={runTest}
            onFetchAll={runAll}
          />
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: <code>.env</code> のDB接続情報やAPIキーが取得できるか</li>
          <li>脆弱版: <code>.git/HEAD</code> からリポジトリの存在が確認できるか</li>
          <li>安全版: ドットファイルへのアクセスが <strong>403 Forbidden</strong> で拒否されるか</li>
          <li>ターミナルで <code>curl http://localhost:3000/api/labs/sensitive-file-exposure/vulnerable/.env</code> も試してみよう</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
