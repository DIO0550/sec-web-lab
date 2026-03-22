import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { PresetButtons } from '@site/src/components/lab-ui/PresetButtons';
import { Input } from '@site/src/components/lab-ui/Input';
import { Alert } from '@site/src/components/lab-ui/Alert';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import styles from './FileUploadLab.module.css';

const BASE = '/api/labs/file-upload';

type UploadResult = {
  success: boolean;
  message?: string;
  file?: { id: string; originalName: string; savedName: string; size: number; mimeType: string };
  _debug?: { message: string; risks?: string[] };
};

const presets = [
  { label: '画像', fileName: 'photo.jpg', mimeType: 'image/jpeg' },
  { label: 'PHPシェル', fileName: 'shell.php', mimeType: 'application/x-php' },
  { label: 'JSファイル', fileName: 'backdoor.js', mimeType: 'application/javascript' },
  { label: 'パストラバーサル', fileName: '../../etc/cron.d/backdoor', mimeType: 'text/plain' },
];

function UploadPanel({
  mode,
  result,
  isLoading,
  onUpload,
}: {
  mode: 'vulnerable' | 'secure';
  result: UploadResult | null;
  isLoading: boolean;
  onUpload: (fileName: string, content: string, mimeType: string) => void;
}) {
  const [fileName, setFileName] = useState('photo.jpg');
  const [content] = useState('(ファイルコンテンツ)');
  const [mimeType, setMimeType] = useState('image/jpeg');

  return (
    <div>
      <Input
        label="ファイル名:"
        value={fileName}
        onChange={(e) => setFileName(e.target.value)}
        className={styles.inputGroup}
      />
      <Input
        label="MIMEタイプ:"
        value={mimeType}
        onChange={(e) => setMimeType(e.target.value)}
        className={styles.inputGroup}
      />
      <PresetButtons
        presets={presets}
        onSelect={(p) => {
          setFileName(p.fileName);
          setMimeType(p.mimeType);
        }}
        className={styles.presets}
      />
      <FetchButton onClick={() => onUpload(fileName, content, mimeType)} disabled={isLoading}>
        アップロード
      </FetchButton>

      <ExpandableSection isOpen={!!result}>
        <Alert
          variant={result?.success ? 'success' : 'error'}
          title={result?.success ? 'アップロード成功' : 'アップロード拒否'}
          className={styles.resultAlert}
        >
          {result?.message && <div className={styles.smallText}>{result.message}</div>}
          {result?.file && (
            <pre className={styles.codeBlock}>
              {JSON.stringify(result.file, null, 2)}
            </pre>
          )}
          {result?._debug && (
            <div className={styles.debugInfo}>
              {result._debug.message}
              {result._debug.risks && (
                <ul className={styles.riskList}>
                  {result._debug.risks.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </Alert>
      </ExpandableSection>
    </div>
  );
}

/**
 * ファイルアップロード攻撃ラボUI
 *
 * ファイルアップロード検証不備によるWebシェル実行を体験する。
 */
export function FileUploadLab() {
  const [vulnResult, setVulnResult] = useState<UploadResult | null>(null);
  const [secureResult, setSecureResult] = useState<UploadResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (
    mode: 'vulnerable' | 'secure',
    fileName: string,
    content: string,
    mimeType: string,
  ) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName, content, mimeType }),
      });
      const data: UploadResult = await res.json();
      if (mode === 'vulnerable') {
        setVulnResult(data);
      } else {
        setSecureResult(data);
      }
    } catch (e) {
      const errorResult: UploadResult = {
        success: false,
        message: e instanceof Error ? e.message : String(e),
      };
      if (mode === 'vulnerable') {
        setVulnResult(errorResult);
      } else {
        setSecureResult(errorResult);
      }
    }
    setLoading(false);
  };

  return (
    <>
      <h3>Lab: ファイルアップロード攻撃</h3>
      <p className={styles.description}>
        脆弱版では.phpや.jsファイルがアップロードできます。
        安全版では許可されたファイル形式以外が拒否されます。
      </p>

      <ComparisonPanel
        vulnerableContent={
          <UploadPanel
            mode="vulnerable"
            result={vulnResult}
            isLoading={loading}
            onUpload={(f, c, m) => handleUpload('vulnerable', f, c, m)}
          />
        }
        secureContent={
          <UploadPanel
            mode="secure"
            result={secureResult}
            isLoading={loading}
            onUpload={(f, c, m) => handleUpload('secure', f, c, m)}
          />
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: .php や .js ファイルがアップロードできるか</li>
          <li>安全版: 許可されたファイル形式以外が拒否されるか</li>
          <li>ファイル名がランダム化されパストラバーサルが防止されているか</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
