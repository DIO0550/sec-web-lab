import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import styles from './ClickjackingLab.module.css';

const BASE = '/api/labs/clickjacking';

type ClickResult = {
  success: boolean;
  message?: string;
  _debug?: { message: string; headers?: Record<string, string> };
  protectedHeaders?: Record<string, string>;
};

function ClickPanel({
  result,
  isLoading,
  onTest,
}: {
  result: ClickResult | null;
  isLoading: boolean;
  onTest: () => void;
}) {
  return (
    <div>
      <FetchButton onClick={onTest} disabled={isLoading}>
        ヘッダー確認
      </FetchButton>

      <ExpandableSection isOpen={!!result}>
        <div className={styles.resultBox}>
          <div className={styles.sectionTitle}>レスポンスヘッダー</div>
          {result?._debug?.headers && (
            <pre className={styles.pre}>
              {Object.entries(result._debug.headers)
                .map(([k, v]) => `${k}: ${v}`)
                .join('\n')}
            </pre>
          )}
          {result?.protectedHeaders && (
            <pre className={styles.pre}>
              {Object.entries(result.protectedHeaders)
                .map(([k, v]) => `${k}: ${v}`)
                .join('\n')}
            </pre>
          )}
          {result?._debug && (
            <div className={styles.debugMessage}>
              {result._debug.message}
            </div>
          )}
        </div>
      </ExpandableSection>

      <div className={styles.attackSim}>
        <div className={styles.attackSimTitle}>攻撃シミュレーション</div>
        <p className={styles.attackSimDesc}>
          攻撃者は透明なiframeの下にボタンを配置します。ユーザーは「当選しました！」と書かれたボタンをクリックしますが、
          実際には裏のiframeの「送金実行」ボタンをクリックしています。
        </p>
        <div className={styles.attackDemo}>
          <div className={styles.attackDemoText}>
            おめでとうございます！当選しました！
          </div>
          <button className={styles.attackDemoButton}>賞品を受け取る</button>
          <div className={styles.attackDemoNote}>
            (実際には裏の iframe で「送金実行」が押される)
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * クリックジャッキングラボUI
 *
 * X-Frame-Optionsヘッダー未設定による透明iframe攻撃を体験する。
 */
export function ClickjackingLab() {
  const [vulnerable, setVulnerable] = useState<ClickResult | null>(null);
  const [secure, setSecure] = useState<ClickResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async (mode: 'vulnerable' | 'secure') => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/target`);
      const data: ClickResult = await res.json();
      if (mode === 'vulnerable') {
        setVulnerable(data);
      } else {
        setSecure(data);
      }
    } catch (e) {
      const fallback: ClickResult = {
        success: false,
        message: (e as Error).message,
      };
      if (mode === 'vulnerable') {
        setVulnerable(fallback);
      } else {
        setSecure(fallback);
      }
    }
    setLoading(false);
  };

  return (
    <>
      <ComparisonPanel
        vulnerableContent={
          <ClickPanel
            result={vulnerable}
            isLoading={loading}
            onTest={() => handleTest('vulnerable')}
          />
        }
        secureContent={
          <ClickPanel
            result={secure}
            isLoading={loading}
            onTest={() => handleTest('secure')}
          />
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: X-Frame-Options ヘッダーが設定されていないか</li>
          <li>
            安全版: X-Frame-Options: DENY と CSP frame-ancestors
            が設定されているか
          </li>
          <li>クリックジャッキングの攻撃手法と対策を理解したか</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
