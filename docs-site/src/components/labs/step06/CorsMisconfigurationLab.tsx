import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { PresetButtons } from '@site/src/components/lab-ui/PresetButtons';
import { Input } from '@site/src/components/lab-ui/Input';
import { Alert } from '@site/src/components/lab-ui/Alert';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import styles from './CorsMisconfigurationLab.module.css';

const BASE = '/api/labs/cors-misconfiguration';

type CorsResult = {
  success: boolean;
  message?: string;
  profile?: { name: string; email: string; role: string };
  _debug?: { message: string; reflectedOrigin?: string; corsHeaders?: Record<string, string> };
};

const presets = [
  { label: '正規サイト', value: 'http://localhost:5173' },
  { label: '攻撃者サイト', value: 'https://evil.example.com' },
  { label: '類似ドメイン', value: 'https://example.com.evil.com' },
];

function CorsPanel({
  mode,
  result,
  isLoading,
  onTest,
}: {
  mode: 'vulnerable' | 'secure';
  result: CorsResult | null;
  isLoading: boolean;
  onTest: (origin: string) => void;
}) {
  const [origin, setOrigin] = useState('https://evil.example.com');

  return (
    <div>
      <Input
        label="Originヘッダー:"
        value={origin}
        onChange={(e) => setOrigin(e.target.value)}
        className={styles.inputGroup}
      />
      <PresetButtons presets={presets} onSelect={(p) => setOrigin(p.value)} className={styles.presets} />
      <FetchButton onClick={() => onTest(origin)} disabled={isLoading}>
        プロフィール取得
      </FetchButton>

      <ExpandableSection isOpen={!!result}>
        <Alert
          variant={result?.success ? 'success' : 'error'}
          title={result?.success ? 'データ取得成功' : 'アクセス拒否'}
          className={styles.resultAlert}
        >
          {result?.profile && (
            <pre className={styles.codeBlock}>
              {JSON.stringify(result.profile, null, 2)}
            </pre>
          )}
          {result?._debug && (
            <div className={styles.debugInfo}>
              {result._debug.message}
              {result._debug.corsHeaders && (
                <pre className={styles.codeBlock}>{JSON.stringify(result._debug.corsHeaders, null, 2)}</pre>
              )}
            </div>
          )}
        </Alert>
      </ExpandableSection>
    </div>
  );
}

/**
 * CORS設定ミスラボUI
 *
 * オリジン間リソース共有の設定不備による認証データ窃取を体験する。
 */
export function CorsMisconfigurationLab() {
  const [vulnResult, setVulnResult] = useState<CorsResult | null>(null);
  const [secureResult, setSecureResult] = useState<CorsResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async (mode: 'vulnerable' | 'secure', origin: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/profile?userId=1`, {
        headers: { Origin: origin },
      });
      const data: CorsResult = await res.json();
      if (mode === 'vulnerable') {
        setVulnResult(data);
      } else {
        setSecureResult(data);
      }
    } catch (e) {
      const errorResult: CorsResult = {
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
      <h3>Lab: CORS設定ミスによるデータ窃取</h3>
      <p className={styles.description}>
        脆弱版では攻撃者サイトのOriginでもAccess-Control-Allow-Originが反映されます。
        安全版ではホワイトリストにないOriginではCORSヘッダーが返されません。
      </p>

      <ComparisonPanel
        vulnerableContent={
          <CorsPanel
            mode="vulnerable"
            result={vulnResult}
            isLoading={loading}
            onTest={(o) => handleTest('vulnerable', o)}
          />
        }
        secureContent={
          <CorsPanel
            mode="secure"
            result={secureResult}
            isLoading={loading}
            onTest={(o) => handleTest('secure', o)}
          />
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: 攻撃者サイトのOriginでもAccess-Control-Allow-Originが反映されるか</li>
          <li>安全版: ホワイトリストにないOriginではCORSヘッダーが返されないか</li>
          <li>credentials: true と Origin反映の組み合わせの危険性を理解したか</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
