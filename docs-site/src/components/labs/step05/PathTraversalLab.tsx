import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import { Input } from '@site/src/components/lab-ui/Input';
import { Alert } from '@site/src/components/lab-ui/Alert';
import { PresetButtons } from '@site/src/components/lab-ui/PresetButtons';
import styles from './PathTraversalLab.module.css';

const BASE = '/api/labs/path-traversal';

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
  { label: 'sample.txt', value: 'sample.txt' },
  { label: 'report.txt', value: 'report.txt' },
  { label: '../../../etc/passwd', value: '../../../etc/passwd' },
  { label: '../../.env', value: '../../.env' },
];

// --- ファイル取得フォーム ---
function FileForm({
  mode,
  result,
  isLoading,
  onFetch,
}: {
  mode: 'vulnerable' | 'secure';
  result: FileResult | null;
  isLoading: boolean;
  onFetch: (fileName: string) => void;
}) {
  const [fileName, setFileName] = useState('sample.txt');

  return (
    <div>
      <Input
        label="ファイル名:"
        value={fileName}
        onChange={(e) => setFileName(e.target.value)}
        className={styles.inputGroup}
      />
      <PresetButtons
        presets={presets}
        onSelect={(p) => setFileName(p.value)}
        className={styles.presetRow}
      />
      <FetchButton onClick={() => onFetch(fileName)} disabled={isLoading}>
        ファイル取得
      </FetchButton>

      <ExpandableSection isOpen={!!result}>
        <Alert
          variant={result?.success ? 'success' : 'error'}
          title={result?.success ? 'ファイル取得成功' : '取得失敗'}
          className={styles.resultAlert}
        >
          {result?.message && <div className={styles.smallText}>{result.message}</div>}
          {result?.content && (
            <pre className={styles.codeBlock}>
              {result.content}
            </pre>
          )}
          {result?._debug && (
            <div className={styles.debugInfo}>
              <div>{result._debug.message}</div>
              <div>解決パス: <code>{result._debug.resolvedPath}</code></div>
              <div>ベースDir: <code>{result._debug.baseDir}</code></div>
              {result._debug.check && <div>検証: <code>{result._debug.check}</code></div>}
            </div>
          )}
        </Alert>
      </ExpandableSection>
    </div>
  );
}

// --- メインコンポーネント ---
export function PathTraversalLab() {
  // file fetch state
  const [vulnFileResult, setVulnFileResult] = useState<FileResult | null>(null);
  const [secureFileResult, setSecureFileResult] = useState<FileResult | null>(null);
  const [fileLoading, setFileLoading] = useState(false);

  // file list state
  const [fileList, setFileList] = useState<FileListResult | null>(null);
  const [listLoading, setListLoading] = useState(false);

  const fetchFile = async (mode: 'vulnerable' | 'secure', fileName: string) => {
    setFileLoading(true);
    try {
      const res = await fetch(
        `${BASE}/${mode}/files?name=${encodeURIComponent(fileName)}`,
      );
      const data: FileResult = await res.json();
      if (mode === 'vulnerable') {
        setVulnFileResult(data);
      } else {
        setSecureFileResult(data);
      }
    } catch (e) {
      const errResult: FileResult = {
        success: false,
        message: e instanceof Error ? e.message : String(e),
      };
      if (mode === 'vulnerable') {
        setVulnFileResult(errResult);
      } else {
        setSecureFileResult(errResult);
      }
    } finally {
      setFileLoading(false);
    }
  };

  const fetchFileList = async () => {
    setListLoading(true);
    try {
      const res = await fetch(`${BASE}/vulnerable/list`);
      const data: FileListResult = await res.json();
      setFileList(data);
    } catch {
      // ignore
    }
    setListLoading(false);
  };

  return (
    <>
      <h3 className={styles.sectionTitle}>Step 1: 公開ファイルの確認</h3>
      <p className={styles.description}>
        まず、公開ディレクトリ（uploads/）にあるファイル一覧を確認してください。
      </p>
      <div className={styles.fileListSection}>
        <FetchButton onClick={fetchFileList} disabled={listLoading}>
          ファイル一覧を表示
        </FetchButton>
        <ExpandableSection isOpen={!!fileList}>
          <div className={styles.fileListBox}>
            <span className={styles.fileListTitle}>uploads/ 内のファイル:</span>
            <ul className={styles.fileList}>
              {fileList?.files.map((f) => (
                <li key={f} className={styles.fileListItem}>{f}</li>
              ))}
            </ul>
          </div>
        </ExpandableSection>
      </div>

      <h3 className={styles.sectionTitle}>Step 2: パストラバーサル攻撃</h3>
      <p className={styles.description}>
        正規のファイル名（sample.txt）を指定した後、<code>../../../etc/passwd</code> を指定してみてください。
        脆弱版ではサーバーのシステムファイルが読み取れ、安全版ではアクセスが拒否されます。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <FileForm
            mode="vulnerable"
            result={vulnFileResult}
            isLoading={fileLoading}
            onFetch={(name) => fetchFile('vulnerable', name)}
          />
        }
        secureContent={
          <FileForm
            mode="secure"
            result={secureFileResult}
            isLoading={fileLoading}
            onFetch={(name) => fetchFile('secure', name)}
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
    </>
  );
}
