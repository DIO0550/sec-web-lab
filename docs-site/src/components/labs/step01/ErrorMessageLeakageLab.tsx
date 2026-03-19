import { useState } from 'react';
import { fetchText } from '@site/src/hooks/useLabFetch';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { JsonTextViewer } from '@site/src/components/lab-ui/ResponseViewer';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { Tabs } from '@site/src/components/lab-ui/Tabs';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import { EndpointUrl } from '@site/src/components/lab-ui/EndpointUrl';
import { Alert } from '@site/src/components/lab-ui/Alert';
import styles from './ErrorMessageLeakageLab.module.css';

type FetchResult = { status: number; body: string } | null;

const BASE = '/api/labs/error-message-leakage';

const TEST_INPUTS = [
  { id: '1', label: '正常 (id=1)', description: '正常なユーザーID' },
  { id: 'abc', label: '文字列 (id=abc)', description: '型エラーを誘発' },
  { id: "'", label: "シングルクォート (id=')", description: 'SQLエラーを誘発' },
  { id: '1 OR 1=1', label: 'SQL Injection (1 OR 1=1)', description: 'SQLインジェクション試行' },
];

function TestCaseList({
  mode,
  results,
  isLoading,
  onTest,
}: {
  mode: 'vulnerable' | 'secure';
  results: Record<string, FetchResult>;
  isLoading: boolean;
  onTest: (mode: 'vulnerable' | 'secure', id: string) => void;
}) {
  return (
    <>
      <h4 className={mode === 'vulnerable' ? styles.presetHeadingVuln : styles.presetHeadingSecure}>
        {mode === 'vulnerable' ? '脆弱バージョン' : '安全バージョン'}
      </h4>
      <Tabs
        tabs={TEST_INPUTS.map((input) => ({
          id: input.id,
          label: input.label,
          content: (
            <div>
              <div className={styles.testActions}>
                <FetchButton onClick={() => onTest(mode, input.id)} disabled={isLoading}>
                  実行
                </FetchButton>
                <span className={styles.testDescription}>{input.description}</span>
              </div>
              <JsonTextViewer result={results[input.id] ?? null} />
            </div>
          ),
        }))}
        keepMounted
      />
    </>
  );
}

/**
 * Error Message Leakage ラボ UI
 *
 * パターンC: useState + fetchText (カスタム状態管理)
 */
export function ErrorMessageLeakageLab() {
  const [vulnerableResults, setVulnerableResults] = useState<Record<string, FetchResult>>({});
  const [secureResults, setSecureResults] = useState<Record<string, FetchResult>>({});
  const [customInput, setCustomInput] = useState('');
  const [customVulnResult, setCustomVulnResult] = useState<FetchResult>(null);
  const [customSecureResult, setCustomSecureResult] = useState<FetchResult>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isLoading = loading !== null;

  const handleTest = async (mode: 'vulnerable' | 'secure', inputId: string) => {
    setLoading(`${mode}-${inputId}`);
    setError(null);
    try {
      const result = await fetchText(`${BASE}/${mode}/users/${encodeURIComponent(inputId)}`);
      const setter = mode === 'vulnerable' ? setVulnerableResults : setSecureResults;
      setter((prev) => ({ ...prev, [inputId]: result }));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(`テストに失敗しました: ${msg}`);
    }
    setLoading(null);
  };

  const handleCustomTest = async () => {
    if (!customInput.trim()) return;
    setLoading('custom');
    setError(null);
    try {
      const [vulnRes, secureRes] = await Promise.all([
        fetchText(`${BASE}/vulnerable/users/${encodeURIComponent(customInput)}`),
        fetchText(`${BASE}/secure/users/${encodeURIComponent(customInput)}`),
      ]);
      setCustomVulnResult(vulnRes);
      setCustomSecureResult(secureRes);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(`テストに失敗しました: ${msg}`);
    }
    setLoading(null);
  };

  return (
    <>
      {error && <Alert variant="error">{error}</Alert>}

      {/* プリセットテスト */}
      <h3>プリセットテスト</h3>
      <ComparisonPanel
        vulnerableContent={
          <TestCaseList mode="vulnerable" results={vulnerableResults} isLoading={isLoading} onTest={handleTest} />
        }
        secureContent={
          <TestCaseList mode="secure" results={secureResults} isLoading={isLoading} onTest={handleTest} />
        }
      />

      {/* カスタム入力 */}
      <CheckpointBox title="カスタム入力テスト" variant="warning">
        <p className={styles.customHint}>
          任意の入力でエラーを誘発してみてください。脆弱版と安全版を同時にテストします。
        </p>
        <EndpointUrl
          method="GET"
          action={
            <FetchButton onClick={handleCustomTest} disabled={isLoading || !customInput.trim()}>
              テスト
            </FetchButton>
          }
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            /api/labs/error-message-leakage/[mode]/users/
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="入力値"
              className={styles.customInputInline}
            />
          </span>
        </EndpointUrl>

        <ExpandableSection isOpen={!!(customVulnResult || customSecureResult)}>
          <div className={styles.customResults}>
            <div className={styles.customResultCol}>
              <strong className={styles.labelVuln}>脆弱版</strong>
              <JsonTextViewer result={customVulnResult} />
            </div>
            <div className={styles.customResultCol}>
              <strong className={styles.labelSecure}>安全版</strong>
              <JsonTextViewer result={customSecureResult} />
            </div>
          </div>
        </ExpandableSection>
      </CheckpointBox>

      <CheckpointBox>
        <ul>
          <li>脆弱版: エラーメッセージにテーブル名・SQL文・スタックトレースが含まれるか</li>
          <li>安全版: 汎用メッセージだけが返され、内部情報が漏洩していないか</li>
          <li>安全版: 不正な入力が <strong>バリデーション</strong> で弾かれているか</li>
          <li>注意: DBに接続していない場合、エラーメッセージの内容が異なる場合があります</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
