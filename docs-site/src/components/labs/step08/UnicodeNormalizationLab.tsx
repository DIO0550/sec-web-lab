import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { PresetButtons } from '@site/src/components/lab-ui/PresetButtons';
import { Textarea } from '@site/src/components/lab-ui/Textarea';
import { Alert } from '@site/src/components/lab-ui/Alert';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import styles from './UnicodeNormalizationLab.module.css';

const BASE = '/api/labs/unicode-normalization';

type CommentResult = {
  success: boolean;
  message?: string;
  original?: string;
  normalized?: string;
  sanitized?: string;
  _debug?: { message: string; blockedWord?: string; filterPassed?: boolean };
};

type CommentsListResult = {
  success: boolean;
  comments?: { original: string; normalized: string; sanitized?: string; timestamp: number }[];
};

const presets = [
  { label: '通常テキスト', value: 'こんにちは' },
  { label: '全角script', value: '\uFF1C\uFF53\uFF43\uFF52\uFF49\uFF50\uFF54\uFF1Ealert(1)\uFF1C\uFF0F\uFF53\uFF43\uFF52\uFF49\uFF50\uFF54\uFF1E' },
  { label: '全角javascript:', value: '\uFF4A\uFF41\uFF56\uFF41\uFF53\uFF43\uFF52\uFF49\uFF50\uFF54\uFF1Aalert(1)' },
];

function CommentPanel({
  mode,
  result,
  commentsList,
  isLoading,
  onPost,
  onFetchComments,
}: {
  mode: 'vulnerable' | 'secure';
  result: CommentResult | null;
  commentsList: CommentsListResult | null;
  isLoading: boolean;
  onPost: (body: string) => void;
  onFetchComments: () => void;
}) {
  const [body, setBody] = useState('こんにちは');

  return (
    <div>
      <Textarea
        label="コメント:"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        className={styles.inputGroup}
      />
      <PresetButtons
        presets={presets}
        onSelect={(p) => setBody(p.value)}
        className={styles.presets}
      />
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <FetchButton onClick={() => onPost(body)} disabled={isLoading}>
          投稿
        </FetchButton>
        <FetchButton onClick={onFetchComments} disabled={isLoading}>
          一覧取得
        </FetchButton>
      </div>

      <ExpandableSection isOpen={!!result}>
        <Alert
          variant={result?.success ? 'success' : 'error'}
          title={result?.success ? '投稿成功' : '投稿ブロック'}
          className={styles.resultAlert}
        >
          {result?.message && <div>{result.message}</div>}
          {result?.original && (
            <div style={{ marginTop: '0.25rem' }}>
              <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>元の文字列:</div>
              <pre className={styles.codeBlock}>{result.original}</pre>
            </div>
          )}
          {result?.normalized && (
            <div style={{ marginTop: '0.25rem' }}>
              <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>正規化後:</div>
              <pre className={styles.codeBlock}>{result.normalized}</pre>
            </div>
          )}
          {result?.sanitized && (
            <div style={{ marginTop: '0.25rem' }}>
              <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>サニタイズ後:</div>
              <pre className={styles.codeBlock}>{result.sanitized}</pre>
            </div>
          )}
          {result?._debug && (
            <div style={{ fontSize: '0.75rem', color: 'var(--lab-text-muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>
              {result._debug.message}
            </div>
          )}
        </Alert>
      </ExpandableSection>

      {commentsList && commentsList.comments && commentsList.comments.length > 0 && (
        <div style={{ marginTop: '0.5rem' }}>
          <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>コメント一覧:</div>
          <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
            {commentsList.comments.map((cm, i) => (
              <Alert key={i} variant="info" className={styles.resultAlert}>
                <div style={{ fontSize: '0.75rem' }}>
                  <div>元: {cm.original}</div>
                  <div>正規化後: {cm.normalized}</div>
                  {cm.sanitized && <div>サニタイズ後: {cm.sanitized}</div>}
                </div>
              </Alert>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Unicode NormalizationラボUI
 *
 * 全角文字を使ってブロックリストを回避し、NFKC正規化後に危険な文字列が生成されることを体験する。
 */
export function UnicodeNormalizationLab() {
  const [vulnResult, setVulnResult] = useState<CommentResult | null>(null);
  const [secureResult, setSecureResult] = useState<CommentResult | null>(null);
  const [vulnComments, setVulnComments] = useState<CommentsListResult | null>(null);
  const [secureComments, setSecureComments] = useState<CommentsListResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePost = async (mode: 'vulnerable' | 'secure', body: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      });
      const data: CommentResult = await res.json();
      if (mode === 'vulnerable') {
        setVulnResult(data);
      } else {
        setSecureResult(data);
      }
    } catch (e) {
      const errorResult: CommentResult = {
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

  const handleFetchComments = async (mode: 'vulnerable' | 'secure') => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/comments`);
      const data: CommentsListResult = await res.json();
      if (mode === 'vulnerable') {
        setVulnComments(data);
      } else {
        setSecureComments(data);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  };

  return (
    <>
      <h3>Lab: Unicode Normalization Bypass</h3>
      <p className={styles.description}>
        脆弱版ではフィルタ(ブロックリスト)の後にNFKC正規化を行います。
        全角文字(＜ｓｃｒｉｐｔ＞)がフィルタを通過し、正規化後に{'<script>'}に変換されることを確認してください。
      </p>

      <ComparisonPanel
        vulnerableContent={
          <CommentPanel
            mode="vulnerable"
            result={vulnResult}
            commentsList={vulnComments}
            isLoading={loading}
            onPost={(body) => handlePost('vulnerable', body)}
            onFetchComments={() => handleFetchComments('vulnerable')}
          />
        }
        secureContent={
          <CommentPanel
            mode="secure"
            result={secureResult}
            commentsList={secureComments}
            isLoading={loading}
            onPost={(body) => handlePost('secure', body)}
            onFetchComments={() => handleFetchComments('secure')}
          />
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: 全角文字がフィルタを通過し、正規化後に危険な文字列に変換されるか</li>
          <li>安全版: 正規化を先に行うことで全角文字もブロックリストで検出されるか</li>
          <li>フィルタと正規化の処理順序が脆弱性に直結することを理解したか</li>
        </ul>
      </CheckpointBox>
    </>
  );
}
