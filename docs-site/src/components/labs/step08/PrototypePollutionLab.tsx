import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import { Textarea } from '@site/src/components/lab-ui/Textarea';
import { Alert } from '@site/src/components/lab-ui/Alert';
import { PresetButtons } from '@site/src/components/lab-ui/PresetButtons';
import styles from './PrototypePollutionLab.module.css';

const BASE = '/api/labs/prototype-pollution';

type PollutionResult = {
  success: boolean;
  message?: string;
  config?: Record<string, unknown>;
  _debug?: { message: string; prototypeCheck?: { isAdmin: unknown; polluted: boolean }; hint?: string };
};

const presets = [
  { label: '通常データ', value: JSON.stringify({ theme: 'dark', lang: 'en' }, null, 2) },
  { label: '__proto__ 汚染', value: JSON.stringify({ __proto__: { isAdmin: true } }, null, 2) },
];

function PollutionPanel({
  mode,
  mergeResult,
  adminResult,
  isLoading,
  onMerge,
  onAdmin,
}: {
  mode: 'vulnerable' | 'secure';
  mergeResult: PollutionResult | null;
  adminResult: PollutionResult | null;
  isLoading: boolean;
  onMerge: (data: string) => void;
  onAdmin: () => void;
}) {
  const [data, setData] = useState(presets[0].value);

  return (
    <div>
      <Textarea label="マージするデータ:" value={data} onChange={(e) => setData(e.target.value)} mono rows={4} className={styles.inputArea} />
      <PresetButtons presets={presets} onSelect={(p) => setData(p.value)} className={styles.presets} />
      <div className={styles.buttonRow}>
        <FetchButton onClick={() => onMerge(data)} disabled={isLoading}>マージ実行</FetchButton>
        {mode === 'vulnerable' && <FetchButton onClick={onAdmin} disabled={isLoading}>管理者ページ確認</FetchButton>}
      </div>

      <ExpandableSection isOpen={!!mergeResult}>
        <Alert variant="info" title="マージ結果:" className={styles.resultAlert}>
          {mergeResult?.config && <pre className={styles.codeBlock}>{JSON.stringify(mergeResult.config, null, 2)}</pre>}
          {mergeResult?._debug && (
            <div className={styles.debugText}>
              {mergeResult._debug.message}
              {mergeResult._debug.prototypeCheck && (
                <div className={styles.protoCheck}>
                  isAdmin: {String(mergeResult._debug.prototypeCheck.isAdmin)} / 汚染: {String(mergeResult._debug.prototypeCheck.polluted)}
                </div>
              )}
            </div>
          )}
        </Alert>
      </ExpandableSection>

      <ExpandableSection isOpen={!!adminResult}>
        <Alert variant={adminResult?.success ? 'success' : 'error'} title={adminResult?.success ? '管理者アクセス成功（プロトタイプ汚染）' : 'アクセス拒否'} className={styles.resultAlert}>
          <div className={styles.smallText}>{adminResult?.message}</div>
        </Alert>
      </ExpandableSection>
    </div>
  );
}

/**
 * Prototype Pollution ラボUI
 *
 * __proto__経由でオブジェクトのプロトタイプを汚染し、
 * 権限チェックのバイパスを体験する。
 */
export function PrototypePollutionLab() {
  const [vulnMerge, setVulnMerge] = useState<PollutionResult | null>(null);
  const [secureMerge, setSecureMerge] = useState<PollutionResult | null>(null);
  const [vulnAdmin, setVulnAdmin] = useState<PollutionResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleMerge = async (mode: 'vulnerable' | 'secure', data: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/merge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: data,
      });
      const json: PollutionResult = await res.json();
      if (mode === 'vulnerable') {
        setVulnMerge(json);
      } else {
        setSecureMerge(json);
      }
    } catch (e) {
      const errResult: PollutionResult = { success: false, message: (e as Error).message };
      if (mode === 'vulnerable') {
        setVulnMerge(errResult);
      } else {
        setSecureMerge(errResult);
      }
    }
    setLoading(false);
  };

  const handleAdmin = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/vulnerable/admin`);
      const data: PollutionResult = await res.json();
      setVulnAdmin(data);
    } catch (e) {
      setVulnAdmin({ success: false, message: (e as Error).message });
    }
    setLoading(false);
  };

  return (
    <>
      <ComparisonPanel
        vulnerableContent={
          <PollutionPanel mode="vulnerable" mergeResult={vulnMerge} adminResult={vulnAdmin} isLoading={loading}
            onMerge={(d) => handleMerge('vulnerable', d)} onAdmin={handleAdmin} />
        }
        secureContent={
          <PollutionPanel mode="secure" mergeResult={secureMerge} adminResult={null} isLoading={loading}
            onMerge={(d) => handleMerge('secure', d)} onAdmin={() => {}} />
        }
      />

      <CheckpointBox>
        <ul>
          <li>{'脆弱版: {"__proto__": {"isAdmin": true}} で管理者アクセスが成功するか'}</li>
          <li>安全版: __proto__ キーが無視されるか</li>
          <li>Object.create(null) や Map の使用で防御できることを理解したか</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
