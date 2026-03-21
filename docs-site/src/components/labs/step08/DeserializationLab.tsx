import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import { Textarea } from '@site/src/components/lab-ui/Textarea';
import { Alert } from '@site/src/components/lab-ui/Alert';
import { PresetButtons } from '@site/src/components/lab-ui/PresetButtons';
import styles from './DeserializationLab.module.css';

const BASE = '/api/labs/deserialization';

type DeserResult = {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
  result?: string;
  _debug?: { message: string; executedCommand?: string; risks?: string[] };
};

const presets = [
  { label: '通常データ', value: JSON.stringify({ name: 'Taro', email: 'taro@example.com', age: 25 }, null, 2) },
  { label: '悪意あるオブジェクト', value: JSON.stringify({ __type: 'Command', command: 'cat /etc/passwd', name: 'hacker' }, null, 2) },
];

function DeserPanel({
  mode,
  result,
  isLoading,
  onDeserialize,
}: {
  mode: 'vulnerable' | 'secure';
  result: DeserResult | null;
  isLoading: boolean;
  onDeserialize: (data: string) => void;
}) {
  const [data, setData] = useState(presets[0].value);

  return (
    <div>
      <Textarea label="JSONデータ:" value={data} onChange={(e) => setData(e.target.value)} mono rows={5} className={styles.inputArea} />
      <PresetButtons presets={presets} onSelect={(p) => setData(p.value)} className={styles.presets} />
      <FetchButton onClick={() => onDeserialize(data)} disabled={isLoading}>デシリアライズ</FetchButton>

      <ExpandableSection isOpen={!!result}>
        <Alert variant={result?.success ? 'success' : 'error'} title={result?.message ?? ''} className={styles.resultAlert}>
          {result?.result && <pre className={styles.codeBlock}>{result.result}</pre>}
          {result?.data && <pre className={styles.codeBlock}>{JSON.stringify(result.data, null, 2)}</pre>}
          {result?._debug && <div className={styles.debugText}>{result._debug.message}</div>}
        </Alert>
      </ExpandableSection>
    </div>
  );
}

/**
 * 安全でないデシリアライゼーション ラボUI
 *
 * デシリアライズ処理が入力を検証せずに実行すると、
 * 攻撃者が悪意あるオブジェクトを送信してRCEが可能になる脆弱性を体験する。
 */
export function DeserializationLab() {
  const [vulnResult, setVulnResult] = useState<DeserResult | null>(null);
  const [secureResult, setSecureResult] = useState<DeserResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDeserialize = async (mode: 'vulnerable' | 'secure', data: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/deserialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: data,
      });
      const json: DeserResult = await res.json();
      if (mode === 'vulnerable') {
        setVulnResult(json);
      } else {
        setSecureResult(json);
      }
    } catch (e) {
      const errResult: DeserResult = { success: false, message: (e as Error).message };
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
        vulnerableContent={
          <DeserPanel mode="vulnerable" result={vulnResult} isLoading={loading} onDeserialize={(d) => handleDeserialize('vulnerable', d)} />
        }
        secureContent={
          <DeserPanel mode="secure" result={secureResult} isLoading={loading} onDeserialize={(d) => handleDeserialize('secure', d)} />
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: __type: Command でコマンド実行がシミュレートされるか</li>
          <li>安全版: 危険なプロパティが検出されて拒否されるか</li>
          <li>ホワイトリスト方式でデシリアライズを制限する重要性を理解したか</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
