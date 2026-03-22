import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import { Input } from '@site/src/components/lab-ui/Input';
import { Alert } from '@site/src/components/lab-ui/Alert';
import { PresetButtons } from '@site/src/components/lab-ui/PresetButtons';
import styles from './RedosLab.module.css';

const BASE = '/api/labs/redos';

type RedosResult = {
  success: boolean;
  message?: string;
  matched?: boolean;
  elapsed?: string;
  _debug?: { message: string; pattern?: string; inputLength?: number };
};

const presets = [
  { label: '通常(マッチ)', value: 'aaaaaa' },
  { label: '通常(不一致)', value: 'aaaaab' },
  { label: 'ReDoS(短)', value: 'aaaaaaaaaaaaaaab' },
  { label: 'ReDoS(長)', value: 'aaaaaaaaaaaaaaaaaaaaaaaaaab' },
];

function RedosPanel({
  mode,
  result,
  isLoading,
  onValidate,
}: {
  mode: 'vulnerable' | 'secure';
  result: RedosResult | null;
  isLoading: boolean;
  onValidate: (input: string) => void;
}) {
  const [input, setInput] = useState('aaaaaa');

  return (
    <div>
      <Input label="入力文字列:" type="text" value={input} onChange={(e) => setInput(e.target.value)} className={styles.inputField} />
      <PresetButtons presets={presets} onSelect={(p) => setInput(p.value)} className={styles.presets} />
      <FetchButton onClick={() => onValidate(input)} disabled={isLoading}>
        バリデーション実行
      </FetchButton>

      <ExpandableSection isOpen={!!result}>
        <Alert variant={result?.success ? 'success' : 'error'} className={styles.resultAlert}>
          <div className={styles.matchResult}>
            {result?.matched ? 'マッチ' : '不一致'} — {result?.elapsed}
          </div>
          {result?.message && <div className={styles.smallText}>{result.message}</div>}
          {result?._debug && (
            <div className={styles.debugText}>
              {result._debug.message}
              {result._debug.pattern && <div>パターン: {result._debug.pattern}</div>}
            </div>
          )}
        </Alert>
      </ExpandableSection>
    </div>
  );
}

/**
 * ReDoS (正規表現DoS) ラボUI
 *
 * 危険な正規表現パターンによるCPUリソース枯渇を体験する。
 */
export function RedosLab() {
  const [vulnResult, setVulnResult] = useState<RedosResult | null>(null);
  const [secureResult, setSecureResult] = useState<RedosResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleValidate = async (mode: 'vulnerable' | 'secure', input: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });
      const data: RedosResult = await res.json();
      if (mode === 'vulnerable') {
        setVulnResult(data);
      } else {
        setSecureResult(data);
      }
    } catch (e) {
      const errResult: RedosResult = { success: false, message: (e as Error).message };
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
        vulnerableContent={<RedosPanel mode="vulnerable" result={vulnResult} isLoading={loading} onValidate={(i) => handleValidate('vulnerable', i)} />}
        secureContent={<RedosPanel mode="secure" result={secureResult} isLoading={loading} onValidate={(i) => handleValidate('secure', i)} />}
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: "aaa...ab" の入力で処理時間が急増するか</li>
          <li>安全版: 同じ入力でも高速に処理されるか</li>
          <li>量指定子のネスト回避と入力長制限の重要性を理解したか</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
