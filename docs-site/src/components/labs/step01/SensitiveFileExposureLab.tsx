import { useMultiTest, fetchText } from '@site/src/hooks/useLabFetch';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { TextViewer } from '@site/src/components/lab-ui/ResponseViewer';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { Tabs } from '@site/src/components/lab-ui/Tabs';
import { Alert } from '@site/src/components/lab-ui/Alert';

const TARGET_FILES = [
  { path: '.env', label: '.env (環境変数)' },
  { path: '.git/HEAD', label: '.git/HEAD (Git情報)' },
  { path: '.git/config', label: '.git/config (Git設定)' },
  { path: 'robots.txt', label: 'robots.txt' },
];

const FILE_PATHS = TARGET_FILES.map((f) => f.path);

function FileTestList({
  mode,
  results,
  isLoading,
  onFetch,
  onFetchAll,
}: {
  mode: 'vulnerable' | 'secure';
  results: Record<string, { status: number; contentType: string; body: string }>;
  isLoading: boolean;
  onFetch: (mode: 'vulnerable' | 'secure', path: string) => void;
  onFetchAll: (mode: 'vulnerable' | 'secure') => void;
}) {
  return (
    <>
      <FetchButton onClick={() => onFetchAll(mode)} disabled={isLoading}>
        全ファイル取得
      </FetchButton>

      <Tabs
        tabs={TARGET_FILES.map((file) => ({
          id: file.path,
          label: file.label,
          content: (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <FetchButton onClick={() => onFetch(mode, file.path)} disabled={isLoading}>
                  取得
                </FetchButton>
              </div>
              <TextViewer result={results[file.path] ?? null} />
            </div>
          ),
        }))}
        keepMounted
        className=""
      />
    </>
  );
}

/**
 * Sensitive File Exposure ラボ UI
 *
 * パターンB: useMultiTest + fetchText
 */
export function SensitiveFileExposureLab() {
  const { vulnerableResults, secureResults, isLoading, error, runTest, runAll } =
    useMultiTest('/api/labs/sensitive-file-exposure', fetchText, FILE_PATHS);

  return (
    <>
      {error && <Alert variant="error">{error}</Alert>}

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
    </>
  );
}
