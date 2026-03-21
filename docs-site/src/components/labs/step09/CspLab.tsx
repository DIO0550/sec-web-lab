import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import { Input } from '@site/src/components/lab-ui/Input';
import { PresetButtons } from '@site/src/components/lab-ui/PresetButtons';
import styles from './CspLab.module.css';

const BASE = '/api/labs/csp';

type CspResult = {
  success: boolean;
  html?: string;
  cspHeader?: string;
  _debug?: { message: string; xssPayload?: string; risks?: string[] };
};

const presets = [
  { label: '通常', value: 'World' },
  { label: 'XSSペイロード', value: '<script>alert("XSS")</script>' },
  { label: 'imgタグ', value: '<img src=x onerror=alert(1)>' },
];

function CspPanel({
  mode,
  result,
  isLoading,
  onTest,
}: {
  mode: 'vulnerable' | 'secure';
  result: CspResult | null;
  isLoading: boolean;
  onTest: (name: string) => void;
}) {
  const [name, setName] = useState('World');

  return (
    <div>
      <Input
        label="名前（入力値）:"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={styles.inputRow}
      />
      <PresetButtons
        presets={presets}
        onSelect={(p) => setName(p.value)}
        className={styles.presetRow}
      />
      <FetchButton onClick={() => onTest(name)} disabled={isLoading}>
        ページ取得
      </FetchButton>

      <ExpandableSection isOpen={!!result}>
        <div className={styles.resultBox}>
          {result?.html && (
            <div>
              <div className={styles.label}>生成HTML:</div>
              <pre className={styles.codeBlock}>{result.html}</pre>
            </div>
          )}
          <div className={styles.sectionSpacing}>
            <div className={styles.label}>CSPヘッダー:</div>
            <pre className={styles.codeBlock}>
              {result?.cspHeader || '(未設定)'}
            </pre>
          </div>
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
        </div>
      </ExpandableSection>
    </div>
  );
}

/**
 * CSP (Content Security Policy) ラボUI
 *
 * CSPヘッダーの有無によるXSS防御効果の違いを体験する。
 */
export function CspLab() {
  const [vulnerable, setVulnerable] = useState<CspResult | null>(null);
  const [secure, setSecure] = useState<CspResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async (mode: 'vulnerable' | 'secure', name: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${BASE}/${mode}/page?name=${encodeURIComponent(name)}`,
      );
      const data: CspResult = await res.json();
      if (mode === 'vulnerable') {
        setVulnerable(data);
      } else {
        setSecure(data);
      }
    } catch {
      const errResult: CspResult = { success: false };
      if (mode === 'vulnerable') {
        setVulnerable(errResult);
      } else {
        setSecure(errResult);
      }
    }
    setLoading(false);
  };

  return (
    <>
      <h3>Lab: CSP によるXSS防御</h3>
      <p className={styles.description}>
        脆弱版ではCSPヘッダーが未設定でXSSペイロードが実行可能です。
        安全版ではCSPヘッダーが設定され、インラインスクリプトがブロックされます。
      </p>

      <ComparisonPanel
        vulnerableContent={
          <CspPanel
            mode="vulnerable"
            result={vulnerable}
            isLoading={loading}
            onTest={(n) => handleTest('vulnerable', n)}
          />
        }
        secureContent={
          <CspPanel
            mode="secure"
            result={secure}
            isLoading={loading}
            onTest={(n) => handleTest('secure', n)}
          />
        }
      />

      <CheckpointBox>
        <ul>
          <li>
            脆弱版: CSPヘッダーが未設定で、XSSペイロードが実行可能な状態か
          </li>
          <li>
            安全版: CSPヘッダーが設定され、インラインスクリプトがブロックされるか
          </li>
          <li>
            CSPはXSSの「緩和策」であり、根本対策（出力エスケープ）と併用すべきことを理解したか
          </li>
        </ul>
      </CheckpointBox>
    </>
  );
}
