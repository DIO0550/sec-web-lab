import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { Input } from '@site/src/components/lab-ui/Input';
import { Textarea } from '@site/src/components/lab-ui/Textarea';
import { PresetButtons } from '@site/src/components/lab-ui/PresetButtons';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import { Alert } from '@site/src/components/lab-ui/Alert';
import { postJson, fetchText } from '@site/src/hooks/useLabFetch';
import styles from './CsvInjectionLab.module.css';

const BASE = '/api/labs/csv-injection';

type FeedbackResult = {
  success: boolean;
  message: string;
  count?: number;
};

type ExportResult = {
  success: boolean;
  csv: string;
  feedbacks: { name: string; comment: string; date: string }[];
  _debug?: { warning?: string; info?: string };
};

const presets = [
  {
    label: '通常入力',
    name: 'テスト太郎',
    comment: 'よいサービスです',
  },
  {
    label: '攻撃: HYPERLINK',
    name: '攻撃者',
    comment: '=HYPERLINK("http://evil.com","Click")',
  },
  {
    label: '攻撃: CMD',
    name: '攻撃者2',
    comment: "=CMD|'/C calc'!A0",
  },
];

/** フィードバック登録 + CSVエクスポートフォーム（脆弱/安全の各タブ内で使用） */
function CsvForm({
  mode,
  feedbackResult,
  exportResult,
  error,
  isLoading,
  onRegister,
  onExport,
}: {
  mode: 'vulnerable' | 'secure';
  feedbackResult: FeedbackResult | null;
  exportResult: ExportResult | null;
  error: string | null;
  isLoading: boolean;
  onRegister: (mode: 'vulnerable' | 'secure', name: string, comment: string) => void;
  onExport: (mode: 'vulnerable' | 'secure') => void;
}) {
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');

  const applyPreset = (p: (typeof presets)[number]) => {
    setName(p.name);
    setComment(p.comment);
  };

  return (
    <div>
      <div className={styles.inputGroup}>
        <Input
          label="名前:"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="テスト太郎"
        />
      </div>

      <div className={styles.inputGroup}>
        <Textarea
          label="コメント:"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="よいサービスです"
          rows={3}
        />
      </div>

      <PresetButtons presets={presets} onSelect={applyPreset} className={styles.presets} />

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <FetchButton onClick={() => onRegister(mode, name, comment)} disabled={isLoading}>
          登録
        </FetchButton>
        <FetchButton onClick={() => onExport(mode)} disabled={isLoading}>
          CSVエクスポート
        </FetchButton>
      </div>

      {error && (
        <div className={styles.resultAlert}>
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <ExpandableSection isOpen={!!feedbackResult}>
        <div className={styles.resultAlert}>
          <Alert variant={feedbackResult?.success ? 'success' : 'error'}>
            {feedbackResult?.message}
            {feedbackResult?.count !== undefined && ` (登録数: ${feedbackResult.count})`}
          </Alert>
        </div>
      </ExpandableSection>

      <ExpandableSection isOpen={!!exportResult}>
        <div className={styles.resultAlert}>
          <Alert variant="info">CSVエクスポート結果:</Alert>
          <pre className={styles.codeBlock}>{exportResult?.csv}</pre>
          {exportResult?._debug && (
            <Alert variant={mode === 'vulnerable' ? 'warning' : 'success'}>
              {exportResult._debug.warning ?? exportResult._debug.info}
            </Alert>
          )}
        </div>
      </ExpandableSection>
    </div>
  );
}

/**
 * CSV InジェクションラボUI
 *
 * ユーザー入力値をサニタイズせずにCSVエクスポートに含めることで、
 * スプレッドシートの数式として実行される脆弱性を体験する。
 */
export function CsvInjectionLab() {
  const [vulnFeedback, setVulnFeedback] = useState<FeedbackResult | null>(null);
  const [secureFeedback, setSecureFeedback] = useState<FeedbackResult | null>(null);
  const [vulnExport, setVulnExport] = useState<ExportResult | null>(null);
  const [secureExport, setSecureExport] = useState<ExportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (
    mode: 'vulnerable' | 'secure',
    name: string,
    comment: string,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const { body } = await postJson<FeedbackResult>(`${BASE}/${mode}/feedback`, {
        name,
        comment,
      });
      if (mode === 'vulnerable') {
        setVulnFeedback(body);
      } else {
        setSecureFeedback(body);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
    setLoading(false);
  };

  const handleExport = async (mode: 'vulnerable' | 'secure') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE}/${mode}/export`);
      const data: ExportResult = await res.json();
      if (mode === 'vulnerable') {
        setVulnExport(data);
      } else {
        setSecureExport(data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
    setLoading(false);
  };

  return (
    <>
      <h3>フィードバック登録 & CSVエクスポート</h3>
      <p className={styles.description}>
        コメント欄に <code>=HYPERLINK("http://evil.com","Click")</code> のような数式を入力し、
        CSVエクスポートで数式がエスケープされずに出力されることを確認してください。
      </p>

      <ComparisonPanel
        vulnerableContent={
          <CsvForm
            mode="vulnerable"
            feedbackResult={vulnFeedback}
            exportResult={vulnExport}
            error={error}
            isLoading={loading}
            onRegister={handleRegister}
            onExport={handleExport}
          />
        }
        secureContent={
          <CsvForm
            mode="secure"
            feedbackResult={secureFeedback}
            exportResult={secureExport}
            error={error}
            isLoading={loading}
            onRegister={handleRegister}
            onExport={handleExport}
          />
        }
      />

      <CheckpointBox>
        <ul>
          <li>
            脆弱版: CSVエクスポートで <code>=HYPERLINK(...)</code> や <code>=CMD|...</code> がそのまま出力されるか
          </li>
          <li>
            安全版: 先頭の <code>=</code>, <code>+</code>, <code>-</code>, <code>@</code> にシングルクォートが付加されているか
          </li>
          <li>
            エスケープ前後のCSVを比較し、スプレッドシートでの挙動の違いを理解したか
          </li>
        </ul>
      </CheckpointBox>
    </>
  );
}
