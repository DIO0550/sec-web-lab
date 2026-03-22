import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { Input } from '@site/src/components/lab-ui/Input';
import { Textarea } from '@site/src/components/lab-ui/Textarea';
import { PresetButtons } from '@site/src/components/lab-ui/PresetButtons';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import { Alert } from '@site/src/components/lab-ui/Alert';
import { postJson } from '@site/src/hooks/useLabFetch';
import styles from './MailHeaderInjectionLab.module.css';

const BASE = '/api/labs/mail-header-injection';

type SendResult = {
  success: boolean;
  message: string;
  generatedHeaders: string;
  sanitizedFrom?: string;
  sanitizedSubject?: string;
  _debug?: {
    fullMessage?: string;
    warning?: string;
    info?: string;
  };
};

const presets = [
  {
    label: '通常入力',
    from: 'user@example.com',
    subject: 'お問い合わせ',
    body: '製品について質問があります',
  },
  {
    label: '攻撃: Bcc追加',
    from: 'user@example.com',
    subject: 'お問い合わせ\r\nBcc: attacker@evil.com',
    body: '普通のお問い合わせです',
  },
];

/** メール送信フォーム（脆弱/安全の各タブ内で使用） */
function MailForm({
  mode,
  result,
  error,
  isLoading,
  onSend,
}: {
  mode: 'vulnerable' | 'secure';
  result: SendResult | null;
  error: string | null;
  isLoading: boolean;
  onSend: (mode: 'vulnerable' | 'secure', from: string, subject: string, body: string) => void;
}) {
  const [from, setFrom] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const applyPreset = (p: (typeof presets)[number]) => {
    setFrom(p.from);
    setSubject(p.subject);
    setBody(p.body);
  };

  return (
    <div>
      <div className={styles.inputGroup}>
        <Input
          label="送信元 (From):"
          type="text"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          placeholder="user@example.com"
        />
      </div>

      <div className={styles.inputGroup}>
        <Input
          label="件名 (Subject):"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="お問い合わせ"
        />
      </div>

      <div className={styles.inputGroup}>
        <Textarea
          label="本文 (Body):"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="お問い合わせ内容を入力してください"
          rows={3}
        />
      </div>

      <PresetButtons presets={presets} onSelect={applyPreset} className={styles.presets} />

      <FetchButton onClick={() => onSend(mode, from, subject, body)} disabled={isLoading}>
        送信
      </FetchButton>

      {error && (
        <div className={styles.resultAlert}>
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <ExpandableSection isOpen={!!result}>
        <div className={styles.resultAlert}>
          <Alert variant={result?.success ? 'success' : 'error'}>
            {result?.message}
          </Alert>

          {result?.generatedHeaders && (
            <>
              <Alert variant="info">生成されたメールヘッダー:</Alert>
              <pre className={styles.codeBlock}>{result.generatedHeaders}</pre>
            </>
          )}

          {result?.sanitizedSubject !== undefined && (
            <Alert variant="success">
              サニタイズ後の件名: {result.sanitizedSubject}
            </Alert>
          )}

          {result?._debug && (
            <Alert variant={mode === 'vulnerable' ? 'warning' : 'success'}>
              {result._debug.warning ?? result._debug.info}
            </Alert>
          )}
        </div>
      </ExpandableSection>
    </div>
  );
}

/**
 * メールヘッダーインジェクションラボUI
 *
 * メールの件名フィールドにCRLF（\r\n）を注入し、
 * Bccヘッダーを追加してスパムの踏み台にする脆弱性を体験する。
 */
export function MailHeaderInjectionLab() {
  const [vulnResult, setVulnResult] = useState<SendResult | null>(null);
  const [secureResult, setSecureResult] = useState<SendResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async (
    mode: 'vulnerable' | 'secure',
    from: string,
    subject: string,
    body: string,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const { body: resBody } = await postJson<SendResult>(`${BASE}/${mode}/send`, {
        from,
        subject,
        body,
      });
      if (mode === 'vulnerable') {
        setVulnResult(resBody);
      } else {
        setSecureResult(resBody);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
    setLoading(false);
  };

  return (
    <>
      <h3>お問い合わせフォーム（メール送信シミュレーション）</h3>
      <p className={styles.description}>
        件名に <code>{'お問い合わせ\\r\\nBcc: attacker@evil.com'}</code> を入力して送信し、
        脆弱版で Bcc ヘッダーが追加されることを確認してください。
      </p>

      <ComparisonPanel
        vulnerableContent={
          <MailForm
            mode="vulnerable"
            result={vulnResult}
            error={error}
            isLoading={loading}
            onSend={handleSend}
          />
        }
        secureContent={
          <MailForm
            mode="secure"
            result={secureResult}
            error={error}
            isLoading={loading}
            onSend={handleSend}
          />
        }
      />

      <CheckpointBox>
        <ul>
          <li>
            脆弱版: 生成されたヘッダーに <code>Bcc: attacker@evil.com</code> が独立したヘッダーとして追加されているか
          </li>
          <li>
            安全版: 改行コードが除去され、Bcc が件名の一部として扱われているか
          </li>
          <li>
            CRLF がメールプロトコルにおいてヘッダーの区切りとして機能する仕組みを理解したか
          </li>
        </ul>
      </CheckpointBox>
    </>
  );
}
