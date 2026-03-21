import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import { Input } from '@site/src/components/lab-ui/Input';
import { Alert } from '@site/src/components/lab-ui/Alert';
import { PresetButtons } from '@site/src/components/lab-ui/PresetButtons';
import styles from './PostmessageLab.module.css';

const BASE = '/api/labs/postmessage';

type MsgResult = {
  success: boolean;
  message?: string;
  description?: string;
  code?: string;
  processed?: boolean;
  receivedFrom?: string;
  data?: Record<string, unknown>;
  _debug?: { message: string; risks?: string[] };
};

const originPresets = [
  { label: '正規サイト', value: 'http://localhost:5173' },
  { label: '攻撃者サイト', value: 'https://evil.example.com' },
];

function MsgPanel({
  mode,
  codeResult,
  processResult,
  isLoading,
  onViewCode,
  onProcess,
}: {
  mode: 'vulnerable' | 'secure';
  codeResult: MsgResult | null;
  processResult: MsgResult | null;
  isLoading: boolean;
  onViewCode: () => void;
  onProcess: (origin: string, data: Record<string, unknown>) => void;
}) {
  const [origin, setOrigin] = useState('https://evil.example.com');

  return (
    <div>
      <FetchButton onClick={onViewCode} disabled={isLoading}>ハンドラーコードを確認</FetchButton>

      {codeResult?.code && (
        <pre className={styles.codeBlock}>{codeResult.code}</pre>
      )}

      <Input label="送信元Origin:" type="text" value={origin} onChange={(e) => setOrigin(e.target.value)} className={styles.originInput} />
      <PresetButtons presets={originPresets} onSelect={(p) => setOrigin(p.value)} className={styles.presets} />
      <FetchButton onClick={() => onProcess(origin, { action: 'redirect', url: 'https://evil.example.com' })} disabled={isLoading}>
        メッセージ送信
      </FetchButton>

      <ExpandableSection isOpen={!!processResult}>
        <Alert variant={processResult?.success ? 'success' : 'error'} title={processResult?.success ? 'メッセージ処理' : '拒否'} className={styles.resultAlert}>
          {processResult?.message && <div className={styles.smallText}>{processResult.message}</div>}
          {processResult?.receivedFrom && <div className={styles.fromText}>From: {processResult.receivedFrom}</div>}
          {processResult?._debug && <div className={styles.debugText}>{processResult._debug.message}</div>}
        </Alert>
      </ExpandableSection>
    </div>
  );
}

/**
 * postMessage脆弱性 ラボUI
 *
 * window.postMessageのオリジン検証不備による攻撃を体験する。
 */
export function PostmessageLab() {
  const [vulnCode, setVulnCode] = useState<MsgResult | null>(null);
  const [secureCode, setSecureCode] = useState<MsgResult | null>(null);
  const [vulnProcess, setVulnProcess] = useState<MsgResult | null>(null);
  const [secureProcess, setSecureProcess] = useState<MsgResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleViewCode = async (mode: 'vulnerable' | 'secure') => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/receiver`);
      const data: MsgResult = await res.json();
      if (mode === 'vulnerable') {
        setVulnCode(data);
      } else {
        setSecureCode(data);
      }
    } catch (e) {
      const errResult: MsgResult = { success: false, message: (e as Error).message };
      if (mode === 'vulnerable') {
        setVulnCode(errResult);
      } else {
        setSecureCode(errResult);
      }
    }
    setLoading(false);
  };

  const handleProcess = async (mode: 'vulnerable' | 'secure', origin: string, data: Record<string, unknown>) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/process-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, data }),
      });
      const json: MsgResult = await res.json();
      if (mode === 'vulnerable') {
        setVulnProcess(json);
      } else {
        setSecureProcess(json);
      }
    } catch (e) {
      const errResult: MsgResult = { success: false, message: (e as Error).message };
      if (mode === 'vulnerable') {
        setVulnProcess(errResult);
      } else {
        setSecureProcess(errResult);
      }
    }
    setLoading(false);
  };

  return (
    <>
      <ComparisonPanel
        vulnerableContent={
          <MsgPanel mode="vulnerable" codeResult={vulnCode} processResult={vulnProcess} isLoading={loading}
            onViewCode={() => handleViewCode('vulnerable')} onProcess={(o, d) => handleProcess('vulnerable', o, d)} />
        }
        secureContent={
          <MsgPanel mode="secure" codeResult={secureCode} processResult={secureProcess} isLoading={loading}
            onViewCode={() => handleViewCode('secure')} onProcess={(o, d) => handleProcess('secure', o, d)} />
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: 攻撃者Originからのメッセージが処理されるか</li>
          <li>安全版: 許可リストにないOriginが拒否されるか</li>
          <li>event.origin の検証の重要性を理解したか</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
