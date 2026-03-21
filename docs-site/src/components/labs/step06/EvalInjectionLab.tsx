import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { PresetButtons } from '@site/src/components/lab-ui/PresetButtons';
import { Input } from '@site/src/components/lab-ui/Input';
import { Alert } from '@site/src/components/lab-ui/Alert';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import styles from './EvalInjectionLab.module.css';

const BASE = '/api/labs/eval-injection';

type CalcResult = {
  success: boolean;
  message?: string;
  expression?: string;
  result?: string;
  _debug?: { message: string; type?: string };
};

const presets = [
  { label: '通常の計算', value: '1 + 2 * 3' },
  { label: '環境変数', value: 'JSON.stringify(process.env)' },
  { label: 'コード実行', value: "require('child_process').execSync('whoami').toString()" },
  { label: 'ファイル読取', value: "require('fs').readFileSync('/etc/hostname','utf8')" },
];

function CalcPanel({
  mode,
  result,
  isLoading,
  onCalc,
}: {
  mode: 'vulnerable' | 'secure';
  result: CalcResult | null;
  isLoading: boolean;
  onCalc: (expression: string) => void;
}) {
  const [expression, setExpression] = useState('1 + 2 * 3');

  return (
    <div>
      <Input
        label="数式 / コード:"
        value={expression}
        onChange={(e) => setExpression(e.target.value)}
        className={styles.inputGroup}
      />
      <PresetButtons presets={presets} onSelect={(p) => setExpression(p.value)} className={styles.presets} />
      <FetchButton onClick={() => onCalc(expression)} disabled={isLoading}>
        計算実行
      </FetchButton>

      <ExpandableSection isOpen={!!result}>
        <Alert
          variant={result?.success ? 'success' : 'error'}
          title={result?.success ? '実行結果' : 'エラー'}
          className={styles.resultAlert}
        >
          {result?.expression && (
            <div className={styles.secondaryText}>式: {result.expression}</div>
          )}
          {result?.result && (
            <pre className={styles.codeBlock}>{result.result}</pre>
          )}
          {result?.message && <div className={styles.smallText}>{result.message}</div>}
          {result?._debug && (
            <div className={styles.debugInfo}>{result._debug.message}</div>
          )}
        </Alert>
      </ExpandableSection>
    </div>
  );
}

/**
 * evalインジェクションラボUI
 *
 * ユーザー入力をコードとして実行してしまう脆弱性を体験する。
 */
export function EvalInjectionLab() {
  const [vulnResult, setVulnResult] = useState<CalcResult | null>(null);
  const [secureResult, setSecureResult] = useState<CalcResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCalc = async (mode: 'vulnerable' | 'secure', expression: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expression }),
      });
      const data: CalcResult = await res.json();
      if (mode === 'vulnerable') {
        setVulnResult(data);
      } else {
        setSecureResult(data);
      }
    } catch (e) {
      const errorResult: CalcResult = {
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
      <h3>Lab: evalインジェクション</h3>
      <p className={styles.description}>
        脆弱版ではprocess.envやファイル読み取りなど任意のコードが実行できます。
        安全版では数式以外の入力が拒否されます。
      </p>

      <ComparisonPanel
        vulnerableContent={
          <CalcPanel
            mode="vulnerable"
            result={vulnResult}
            isLoading={loading}
            onCalc={(e) => handleCalc('vulnerable', e)}
          />
        }
        secureContent={
          <CalcPanel
            mode="secure"
            result={secureResult}
            isLoading={loading}
            onCalc={(e) => handleCalc('secure', e)}
          />
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: process.env やファイル読み取りが実行できるか</li>
          <li>安全版: 数式以外の入力が拒否されるか</li>
          <li>eval()の危険性と、安全な代替手段を理解したか</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
