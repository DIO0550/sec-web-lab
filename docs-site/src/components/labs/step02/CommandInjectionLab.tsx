import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { Input } from '@site/src/components/lab-ui/Input';
import { PresetButtons } from '@site/src/components/lab-ui/PresetButtons';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import { Alert } from '@site/src/components/lab-ui/Alert';
import { postJson } from '@site/src/hooks/useLabFetch';
import styles from './CommandInjectionLab.module.css';

const BASE = '/api/labs/command-injection';

type PingResult = {
  success: boolean;
  output: string;
  stderr?: string;
  message?: string;
  _debug?: { command: string };
};

const presets = [
  { label: '正常 (127.0.0.1)', host: '127.0.0.1' },
  { label: '; cat /etc/passwd', host: '127.0.0.1; cat /etc/passwd' },
  { label: '&& whoami', host: '127.0.0.1 && whoami' },
  { label: '$(id)', host: '$(id)' },
];

/** Pingフォーム（脆弱/安全の各タブ内で使用） */
function PingForm({
  mode,
  result,
  error,
  isLoading,
  onPing,
}: {
  mode: 'vulnerable' | 'secure';
  result: PingResult | null;
  error: string | null;
  isLoading: boolean;
  onPing: (mode: 'vulnerable' | 'secure', host: string) => void;
}) {
  const [host, setHost] = useState('');

  return (
    <div>
      <div className={styles.inputRow}>
        <Input
          label="ホスト名 / IPアドレス:"
          type="text"
          value={host}
          onChange={(e) => setHost(e.target.value)}
          placeholder="127.0.0.1"
          className={styles.inputFlex}
        />
        <FetchButton onClick={() => onPing(mode, host)} disabled={isLoading}>
          Ping
        </FetchButton>
      </div>

      <PresetButtons presets={presets} onSelect={(p) => setHost(p.host)} className={styles.presets} />

      {error && <Alert variant="error">{error}</Alert>}

      <ExpandableSection isOpen={!!result}>
        <div className={styles.resultArea}>
          <div className={result?.success ? styles.statusOk : styles.statusNg}>
            {result?.success ? '実行成功' : '実行失敗'}
            {result?.message && ` — ${result.message}`}
          </div>

          {result?.output && (
            <pre
              className={`${styles.output} ${mode === 'vulnerable' ? styles.outputVuln : styles.outputSecure}`}
            >
              {result.output}
            </pre>
          )}

          {result?.stderr && (
            <pre className={styles.stderr}>stderr: {result.stderr}</pre>
          )}

          {/* DebugInfo: 実行されたコマンドをインラインで表示 */}
          {result?._debug && (
            <details className={styles.debugDetails}>
              <summary className={styles.debugSummary}>実行されたコマンド</summary>
              <code className={styles.debugCode}>{result._debug.command}</code>
            </details>
          )}
        </div>
      </ExpandableSection>
    </div>
  );
}

/**
 * OSコマンドインジェクションラボUI
 *
 * ping ツールの入力欄にシェルのメタ文字を注入し、
 * サーバー上で意図しないOSコマンドを実行させる脆弱性を体験する。
 */
export function CommandInjectionLab() {
  const [vulnResult, setVulnResult] = useState<PingResult | null>(null);
  const [secureResult, setSecureResult] = useState<PingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePing = async (mode: 'vulnerable' | 'secure', host: string) => {
    setLoading(true);
    setError(null);
    try {
      const { body } = await postJson<PingResult>(`${BASE}/${mode}/ping`, { host });
      if (mode === 'vulnerable') {
        setVulnResult(body);
      } else {
        setSecureResult(body);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
    setLoading(false);
  };

  return (
    <>
      <h3>ネットワーク診断ツール (ping)</h3>
      <p className={styles.description}>
        ホスト名に <code>127.0.0.1; cat /etc/passwd</code> を入力して、
        <code>;</code>{' '}
        でコマンドを連結することでサーバー上のファイルを読み取れることを確認してください。
      </p>

      <ComparisonPanel
        vulnerableContent={
          <PingForm
            mode="vulnerable"
            result={vulnResult}
            error={error}
            isLoading={loading}
            onPing={handlePing}
          />
        }
        secureContent={
          <PingForm
            mode="secure"
            result={secureResult}
            error={error}
            isLoading={loading}
            onPing={handlePing}
          />
        }
      />

      <CheckpointBox variant="warning" title="シェルメタ文字の一覧">
        <table className={styles.metaTable}>
          <thead>
            <tr>
              <th className={styles.metaTh}>文字</th>
              <th className={styles.metaTh}>意味</th>
              <th className={styles.metaTh}>例</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={styles.metaTd}><code>;</code></td>
              <td className={styles.metaTd}>コマンド区切り</td>
              <td className={styles.metaTd}><code>ping 127.0.0.1; cat /etc/passwd</code></td>
            </tr>
            <tr>
              <td className={styles.metaTd}><code>&&</code></td>
              <td className={styles.metaTd}>前のコマンドが成功したら実行</td>
              <td className={styles.metaTd}><code>ping 127.0.0.1 && whoami</code></td>
            </tr>
            <tr>
              <td className={styles.metaTd}><code>||</code></td>
              <td className={styles.metaTd}>前のコマンドが失敗したら実行</td>
              <td className={styles.metaTd}><code>ping invalid || whoami</code></td>
            </tr>
            <tr>
              <td className={styles.metaTd}><code>|</code></td>
              <td className={styles.metaTd}>パイプ</td>
              <td className={styles.metaTd}><code>ping 127.0.0.1 | head -1</code></td>
            </tr>
            <tr>
              <td className={styles.metaTd}><code>$()</code></td>
              <td className={styles.metaTd}>コマンド置換</td>
              <td className={styles.metaTd}><code>ping $(whoami)</code></td>
            </tr>
          </tbody>
        </table>
      </CheckpointBox>

      <CheckpointBox>
        <ul>
          <li>
            脆弱版: <code>;</code> でコマンドを連結して <code>/etc/passwd</code> が読めるか
          </li>
          <li>安全版: 同じペイロードがバリデーションで弾かれるか</li>
          <li>
            <code>exec()</code> と <code>execFile()</code>{' '}
            の違い（シェルの介在有無）を理解したか
          </li>
          <li>
            SQLインジェクションとの共通パターン（入力がコードとして解釈される）を認識したか
          </li>
        </ul>
      </CheckpointBox>
    </>
  );
}
