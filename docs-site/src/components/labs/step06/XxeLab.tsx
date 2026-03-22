import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { PresetButtons } from '@site/src/components/lab-ui/PresetButtons';
import { Textarea } from '@site/src/components/lab-ui/Textarea';
import { Alert } from '@site/src/components/lab-ui/Alert';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import styles from './XxeLab.module.css';

const BASE = '/api/labs/xxe';

type XxeResult = {
  success: boolean;
  message?: string;
  parsed?: { name: string; email: string };
  _debug?: { message: string; entityDetected?: boolean; entityValue?: string };
};

const normalXml = `<?xml version="1.0"?>
<user>
  <name>Taro</name>
  <email>taro@example.com</email>
</user>`;

const maliciousXml = `<?xml version="1.0"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<user>
  <name>&xxe;</name>
  <email>test@example.com</email>
</user>`;

const presets = [
  { label: '通常XML', value: normalXml },
  { label: 'XXEペイロード', value: maliciousXml },
];

function XxePanel({
  mode,
  result,
  isLoading,
  onSubmit,
}: {
  mode: 'vulnerable' | 'secure';
  result: XxeResult | null;
  isLoading: boolean;
  onSubmit: (xml: string) => void;
}) {
  const [xml, setXml] = useState(normalXml);

  return (
    <div>
      <div className={`${styles.textareaGroup} ${styles.monoTextarea}`}>
        <Textarea
          label="XMLデータ:"
          value={xml}
          onChange={(e) => setXml(e.target.value)}
          rows={8}
        />
      </div>
      <PresetButtons presets={presets} onSelect={(p) => setXml(p.value)} className={styles.presets} />
      <FetchButton onClick={() => onSubmit(xml)} disabled={isLoading}>
        XMLインポート
      </FetchButton>

      <ExpandableSection isOpen={!!result}>
        <Alert
          variant={result?.success ? 'success' : 'error'}
          title={result?.success ? 'パース成功' : '拒否'}
          className={styles.resultAlert}
        >
          {result?.message && <div className={styles.smallText}>{result.message}</div>}
          {result?.parsed && (
            <pre className={styles.codeBlock}>
              {JSON.stringify(result.parsed, null, 2)}
            </pre>
          )}
          {result?._debug && (
            <div className={styles.debugInfo}>{result._debug.message}</div>
          )}
        </Alert>
      </ExpandableSection>
    </div>
  );
}

/**
 * XXEラボUI
 *
 * XML外部エンティティによるファイル読み取り攻撃を体験する。
 */
export function XxeLab() {
  const [vulnResult, setVulnResult] = useState<XxeResult | null>(null);
  const [secureResult, setSecureResult] = useState<XxeResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (mode: 'vulnerable' | 'secure', xml: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/xml' },
        body: xml,
      });
      const data: XxeResult = await res.json();
      if (mode === 'vulnerable') {
        setVulnResult(data);
      } else {
        setSecureResult(data);
      }
    } catch (e) {
      const errorResult: XxeResult = {
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
      <h3>Lab: XXE (XML External Entity)</h3>
      <p className={styles.description}>
        脆弱版ではXXEペイロードで/etc/passwdの内容が表示されます。
        安全版ではDOCTYPE宣言を含むXMLが拒否されます。
      </p>

      <ComparisonPanel
        vulnerableContent={
          <XxePanel
            mode="vulnerable"
            result={vulnResult}
            isLoading={loading}
            onSubmit={(xml) => handleSubmit('vulnerable', xml)}
          />
        }
        secureContent={
          <XxePanel
            mode="secure"
            result={secureResult}
            isLoading={loading}
            onSubmit={(xml) => handleSubmit('secure', xml)}
          />
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: XXEペイロードで /etc/passwd の内容が表示されるか</li>
          <li>安全版: DOCTYPE宣言を含むXMLが拒否されるか</li>
          <li>XMLパーサーの外部エンティティ解決を無効にすることの重要性を理解したか</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
