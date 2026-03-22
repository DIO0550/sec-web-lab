import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { PresetButtons } from '@site/src/components/lab-ui/PresetButtons';
import { Input } from '@site/src/components/lab-ui/Input';
import { Alert } from '@site/src/components/lab-ui/Alert';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import styles from './ZipSlipLab.module.css';

const BASE = '/api/labs/zip-slip';

type Entry = { name: string; content: string };

type ExtractResult = {
  success: boolean;
  message?: string;
  extractDir?: string;
  extracted?: { name: string; path: string; status: string }[];
  blocked?: { name: string; reason: string }[];
  _debug?: { message: string };
};

const presetNormal: Entry[] = [
  { name: 'readme.txt', content: 'Hello World' },
  { name: 'data/info.json', content: '{"key": "value"}' },
  { name: 'images/photo.txt', content: 'image data' },
];

const presetAttack: Entry[] = [
  { name: 'readme.txt', content: 'Hello World' },
  { name: '../../../tmp/pwned.txt', content: 'hacked!' },
  { name: '../../etc/malicious.conf', content: 'evil config' },
];

function ExtractPanel({
  mode,
  result,
  isLoading,
  onExtract,
}: {
  mode: 'vulnerable' | 'secure';
  result: ExtractResult | null;
  isLoading: boolean;
  onExtract: (entries: Entry[]) => void;
}) {
  const [entries, setEntries] = useState<Entry[]>([
    { name: 'readme.txt', content: 'Hello World' },
  ]);
  const [newName, setNewName] = useState('');
  const [newContent, setNewContent] = useState('');

  const addEntry = () => {
    if (newName.trim()) {
      setEntries([...entries, { name: newName.trim(), content: newContent }]);
      setNewName('');
      setNewContent('');
    }
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div style={{ marginBottom: '0.5rem', fontSize: '0.8rem' }}>
        {entries.map((entry, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
            <code style={{ flex: 1, fontSize: '0.75rem' }}>{entry.name}</code>
            <button onClick={() => removeEntry(i)} style={{ fontSize: '0.7rem', cursor: 'pointer' }}>x</button>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' }}>
        <Input
          label=""
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="ファイル名"
          className={styles.inputGroup}
        />
        <Input
          label=""
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="内容"
          className={styles.inputGroup}
        />
        <FetchButton onClick={addEntry} disabled={!newName.trim()}>
          追加
        </FetchButton>
      </div>

      <PresetButtons
        presets={[
          { label: '正常ファイル3つ', value: 'normal' },
          { label: '攻撃ファイル(../)', value: 'attack' },
        ]}
        onSelect={(p) => {
          if (p.value === 'normal') setEntries([...presetNormal]);
          if (p.value === 'attack') setEntries([...presetAttack]);
        }}
        className={styles.presets}
      />

      <FetchButton onClick={() => onExtract(entries)} disabled={isLoading || entries.length === 0}>
        展開実行
      </FetchButton>

      <ExpandableSection isOpen={!!result}>
        <Alert
          variant={result?.blocked && result.blocked.length > 0 ? 'warning' : result?.success ? 'success' : 'error'}
          title={result?.message || '結果'}
          className={styles.resultAlert}
        >
          {result?.extracted && result.extracted.length > 0 && (
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>展開済み:</div>
              <pre className={styles.codeBlock}>
                {result.extracted.map((e) => `${e.name} -> ${e.path} [${e.status}]`).join('\n')}
              </pre>
            </div>
          )}
          {result?.blocked && result.blocked.length > 0 && (
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--lab-text-warning)' }}>ブロック済み:</div>
              <pre className={styles.codeBlock}>
                {result.blocked.map((b) => `${b.name} -> ${b.reason}`).join('\n')}
              </pre>
            </div>
          )}
          {result?._debug && (
            <div style={{ fontSize: '0.75rem', color: 'var(--lab-text-muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>
              {result._debug.message}
            </div>
          )}
        </Alert>
      </ExpandableSection>
    </div>
  );
}

/**
 * Zip SlipラボUI
 *
 * ZIPエントリのパストラバーサルによりディレクトリ外への展開をシミュレーションする。
 */
export function ZipSlipLab() {
  const [vulnResult, setVulnResult] = useState<ExtractResult | null>(null);
  const [secureResult, setSecureResult] = useState<ExtractResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleExtract = async (mode: 'vulnerable' | 'secure', entries: Entry[]) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries }),
      });
      const data: ExtractResult = await res.json();
      if (mode === 'vulnerable') {
        setVulnResult(data);
      } else {
        setSecureResult(data);
      }
    } catch (e) {
      const errorResult: ExtractResult = {
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
      <h3>Lab: Zip Slip</h3>
      <p className={styles.description}>
        脆弱版ではZIPエントリのファイル名に含まれる "../" を検証しません。
        攻撃プリセットで展開先ディレクトリ(/uploads)外へのパスが生成されることを確認してください。
      </p>

      <ComparisonPanel
        vulnerableContent={
          <ExtractPanel
            mode="vulnerable"
            result={vulnResult}
            isLoading={loading}
            onExtract={(entries) => handleExtract('vulnerable', entries)}
          />
        }
        secureContent={
          <ExtractPanel
            mode="secure"
            result={secureResult}
            isLoading={loading}
            onExtract={(entries) => handleExtract('secure', entries)}
          />
        }
      />

      <CheckpointBox>
        <ul>
          <li>{'脆弱版: "../../../tmp/pwned.txt" が /tmp/pwned.txt に展開されるか'}</li>
          <li>安全版: パストラバーサルを含むエントリがブロックされるか</li>
          <li>path.resolve + startsWith によるプレフィックス検証の仕組みを理解したか</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
