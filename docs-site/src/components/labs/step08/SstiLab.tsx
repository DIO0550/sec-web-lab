import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import { Input } from '@site/src/components/lab-ui/Input';
import { Textarea } from '@site/src/components/lab-ui/Textarea';
import { Alert } from '@site/src/components/lab-ui/Alert';
import { PresetButtons } from '@site/src/components/lab-ui/PresetButtons';
import styles from './SstiLab.module.css';

const BASE = '/api/labs/ssti';

type SstiResult = {
  success: boolean;
  message?: string;
  rendered?: string;
  warning?: string;
  _debug?: { message: string };
};

const presets = [
  { label: '通常', template: 'Hello, {{name}}! Today is {{date}}.', name: 'Taro' },
  { label: 'コード実行', template: 'Result: {{7*7}}', name: 'test' },
  { label: '環境変数', template: '{{JSON.stringify(process.env).substring(0,200)}}', name: 'test' },
];

function SstiPanel({
  mode,
  result,
  isLoading,
  onRender,
}: {
  mode: 'vulnerable' | 'secure';
  result: SstiResult | null;
  isLoading: boolean;
  onRender: (template: string, name: string) => void;
}) {
  const [template, setTemplate] = useState('Hello, {{name}}! Today is {{date}}.');
  const [name, setName] = useState('Taro');

  return (
    <div>
      <Textarea label="テンプレート:" value={template} onChange={(e) => setTemplate(e.target.value)} mono rows={3} className={styles.inputArea} />
      <Input label="name変数:" type="text" value={name} onChange={(e) => setName(e.target.value)} className={styles.inputField} />
      <PresetButtons
        presets={presets}
        onSelect={(p) => { setTemplate(p.template); setName(p.name); }}
        className={styles.presets}
      />
      <FetchButton onClick={() => onRender(template, name)} disabled={isLoading}>
        レンダリング
      </FetchButton>

      <ExpandableSection isOpen={!!result}>
        <Alert variant={result?.success ? 'success' : 'error'} className={styles.resultAlert}>
          {result?.rendered && (
            <div>
              <div className={styles.renderLabel}>レンダリング結果:</div>
              <pre className={styles.codeBlock}>{result.rendered}</pre>
            </div>
          )}
          {result?.warning && <div className={styles.warningText}>{result.warning}</div>}
          {result?.message && <div className={styles.smallText}>{result.message}</div>}
          {result?._debug && <div className={styles.debugText}>{result._debug.message}</div>}
        </Alert>
      </ExpandableSection>
    </div>
  );
}

/**
 * SSTI (Server-Side Template Injection) ラボUI
 *
 * テンプレートエンジンでユーザー入力が実行される脆弱性を体験する。
 */
export function SstiLab() {
  const [vulnResult, setVulnResult] = useState<SstiResult | null>(null);
  const [secureResult, setSecureResult] = useState<SstiResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRender = async (mode: 'vulnerable' | 'secure', template: string, name: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/render`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template, name }),
      });
      const data: SstiResult = await res.json();
      if (mode === 'vulnerable') {
        setVulnResult(data);
      } else {
        setSecureResult(data);
      }
    } catch (e) {
      const errResult: SstiResult = { success: false, message: (e as Error).message };
      if (mode === 'vulnerable') {
        setVulnResult(errResult);
      } else {
        setSecureResult(errResult);
      }
    }
    setLoading(false);
  };

  return (
    <>
      <ComparisonPanel
        vulnerableContent={<SstiPanel mode="vulnerable" result={vulnResult} isLoading={loading} onRender={(t, n) => handleRender('vulnerable', t, n)} />}
        secureContent={<SstiPanel mode="secure" result={secureResult} isLoading={loading} onRender={(t, n) => handleRender('secure', t, n)} />}
      />

      <CheckpointBox>
        <ul>
          <li>{'脆弱版: {{7*7}} で 49 が表示されるか'}</li>
          <li>安全版: テンプレート式の実行が拒否されるか</li>
          <li>ユーザー入力をテンプレートの「データ」として扱う重要性を理解したか</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
