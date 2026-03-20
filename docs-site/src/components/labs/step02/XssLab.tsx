import { useState } from 'react';
import { ComparisonPanel } from '@site/src/components/lab-ui/ComparisonPanel';
import { FetchButton } from '@site/src/components/lab-ui/FetchButton';
import { CheckpointBox } from '@site/src/components/lab-ui/CheckpointBox';
import { Input } from '@site/src/components/lab-ui/Input';
import { Textarea } from '@site/src/components/lab-ui/Textarea';
import { PresetButtons } from '@site/src/components/lab-ui/PresetButtons';
import { ExpandableSection } from '@site/src/components/lab-ui/ExpandableSection';
import { Alert } from '@site/src/components/lab-ui/Alert';
import { fetchText, postJson } from '@site/src/hooks/useLabFetch';
import styles from './XssLab.module.css';

const BASE = '/api/labs/xss';

type SearchResult = {
  query: string;
  html: string;
};

type PostsResult = {
  posts: { id: number; title: string; content: string; created_at: string }[];
  postsHtml: string;
};

const reflectedPresets = [
  { label: '通常テキスト', query: 'セキュリティ' },
  { label: '<script>alert</script>', query: "<script>alert('XSS')</script>" },
  { label: '<img onerror>', query: '<img src=x onerror=alert("XSS")>' },
  { label: '<b>太字</b>', query: '<b>太字テスト</b>' },
];

const storedPresets = [
  { label: '通常投稿', title: 'テスト投稿', content: 'これは通常の投稿です' },
  {
    label: '<img onerror>',
    title: '画像テスト',
    content: '<img src=x onerror=alert("Stored XSS!")>',
  },
  {
    label: '<script>',
    title: 'スクリプトテスト',
    content: "<script>alert('Stored XSS')</script>",
  },
];

/**
 * HTML描画プレビュー
 *
 * サーバーから返されたHTMLソースと、dangerouslySetInnerHTMLによるブラウザ描画結果を表示する。
 * XSSの動作を体験するために、意図的にHTMLを直接描画している。
 */
function HtmlPreview({ html, mode }: { html: string; mode: 'vulnerable' | 'secure' }) {
  return (
    <div className={styles.htmlPreviewWrapper}>
      <div className={styles.previewLabel}>サーバーからのHTMLレスポンス:</div>
      <pre className={`${styles.htmlSource} ${mode === 'vulnerable' ? styles.htmlSourceVuln : styles.htmlSourceSecure}`}>
        {html}
      </pre>
      <div className={styles.previewLabel}>ブラウザでの描画結果 (dangerouslySetInnerHTML):</div>
      {/* 意図的にHTMLを直接描画している（XSSの動作を体験するための学習用コンポーネント） */}
      <div
        className={`${styles.htmlPreview} ${mode === 'vulnerable' ? styles.htmlPreviewVuln : styles.htmlPreviewSecure}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

/** Reflected XSS テスト（脆弱/安全の各タブ内で使用） */
function ReflectedXssTest({
  mode,
  result,
  error,
  isLoading,
  onSearch,
}: {
  mode: 'vulnerable' | 'secure';
  result: SearchResult | null;
  error: string | null;
  isLoading: boolean;
  onSearch: (mode: 'vulnerable' | 'secure', query: string) => void;
}) {
  const [query, setQuery] = useState('');

  return (
    <div>
      <div className={styles.inputRow}>
        <Input
          label="検索キーワード:"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={styles.inputFlex}
        />
        <FetchButton onClick={() => onSearch(mode, query)} disabled={isLoading}>
          検索
        </FetchButton>
      </div>

      <PresetButtons
        presets={reflectedPresets}
        onSelect={(p) => setQuery(p.query)}
        className={styles.presets}
      />

      {error && <Alert variant="error">{error}</Alert>}

      <ExpandableSection isOpen={!!result}>
        {result && <HtmlPreview html={result.html} mode={mode} />}
      </ExpandableSection>
    </div>
  );
}

/** Stored XSS テスト（脆弱/安全の各タブ内で使用） */
function StoredXssTest({
  mode,
  posts,
  error,
  isLoading,
  onPost,
  onRefresh,
}: {
  mode: 'vulnerable' | 'secure';
  posts: PostsResult | null;
  error: string | null;
  isLoading: boolean;
  onPost: (mode: 'vulnerable' | 'secure', title: string, content: string) => void;
  onRefresh: (mode: 'vulnerable' | 'secure') => void;
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  return (
    <div>
      <div className={styles.formFields}>
        <Input
          label="タイトル:"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Textarea
          label="内容:"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={2}
        />
        <div className={styles.buttonRow}>
          <FetchButton onClick={() => onPost(mode, title, content)} disabled={isLoading}>
            投稿
          </FetchButton>
          <FetchButton onClick={() => onRefresh(mode)} disabled={isLoading}>
            投稿一覧を取得
          </FetchButton>
        </div>
      </div>

      <PresetButtons
        presets={storedPresets}
        onSelect={(p) => {
          setTitle(p.title);
          setContent(p.content);
        }}
        className={styles.presets}
      />

      {error && <Alert variant="error">{error}</Alert>}

      <ExpandableSection isOpen={!!posts}>
        <div className={styles.htmlPreviewWrapper}>
          <div className={styles.previewLabel}>サーバーからのHTMLフラグメント:</div>
          <pre
            className={`${styles.htmlSource} ${mode === 'vulnerable' ? styles.htmlSourceVuln : styles.htmlSourceSecure}`}
          >
            {posts?.postsHtml}
          </pre>
          <div className={styles.previewLabel}>
            ブラウザでの描画結果 (dangerouslySetInnerHTML):
          </div>
          {/* 意図的にHTMLを直接描画している（XSSの動作を体験するための学習用コンポーネント） */}
          <div
            className={`${styles.htmlPreview} ${styles.postsPreview} ${mode === 'vulnerable' ? styles.htmlPreviewVuln : styles.htmlPreviewSecure}`}
            dangerouslySetInnerHTML={{ __html: posts?.postsHtml ?? '' }}
          />
        </div>
      </ExpandableSection>
    </div>
  );
}

/**
 * XSSラボUI（Reflected + Stored）
 *
 * ユーザー入力がHTMLとしてブラウザに解釈されることで、
 * 任意のJavaScriptが実行される脆弱性を体験する。
 */
export function XssLab() {
  // Reflected XSS の状態
  const [reflectedVuln, setReflectedVuln] = useState<SearchResult | null>(null);
  const [reflectedSecure, setReflectedSecure] = useState<SearchResult | null>(null);
  const [reflectedLoading, setReflectedLoading] = useState(false);
  const [reflectedError, setReflectedError] = useState<string | null>(null);

  // Stored XSS の状態
  const [storedVuln, setStoredVuln] = useState<PostsResult | null>(null);
  const [storedSecure, setStoredSecure] = useState<PostsResult | null>(null);
  const [storedLoading, setStoredLoading] = useState(false);
  const [storedError, setStoredError] = useState<string | null>(null);

  const handleSearch = async (mode: 'vulnerable' | 'secure', query: string) => {
    setReflectedLoading(true);
    setReflectedError(null);
    try {
      const params = new URLSearchParams({ q: query });
      const res = await fetchText(`${BASE}/${mode}/api/search?${params}`);
      // レスポンスをJSONとしてパース
      const data: SearchResult = JSON.parse(res.body);
      if (mode === 'vulnerable') {
        setReflectedVuln(data);
      } else {
        setReflectedSecure(data);
      }
    } catch (e) {
      setReflectedError(e instanceof Error ? e.message : String(e));
    }
    setReflectedLoading(false);
  };

  const handlePost = async (
    mode: 'vulnerable' | 'secure',
    title: string,
    content: string,
  ) => {
    setStoredLoading(true);
    setStoredError(null);
    try {
      const { status, body } = await postJson<{ success?: boolean; message?: string }>(
        `${BASE}/${mode}/posts`,
        { title, content },
      );
      // 投稿成功時 (status < 400 かつ body.success === true) のみ自動一覧再取得
      if (status < 400 && body.success === true) {
        const postsRes = await fetch(`${BASE}/${mode}/api/posts`);
        const postsData: PostsResult = await postsRes.json();
        if (mode === 'vulnerable') {
          setStoredVuln(postsData);
        } else {
          setStoredSecure(postsData);
        }
      } else {
        // 投稿失敗時はエラー表示、再取得しない
        setStoredError(body.message ?? `投稿に失敗しました (HTTP ${status})`);
      }
    } catch (e) {
      setStoredError(e instanceof Error ? e.message : String(e));
    }
    setStoredLoading(false);
  };

  const handleRefresh = async (mode: 'vulnerable' | 'secure') => {
    setStoredLoading(true);
    setStoredError(null);
    try {
      const res = await fetch(`${BASE}/${mode}/api/posts`);
      const data: PostsResult = await res.json();
      if (mode === 'vulnerable') {
        setStoredVuln(data);
      } else {
        setStoredSecure(data);
      }
    } catch (e) {
      setStoredError(e instanceof Error ? e.message : String(e));
    }
    setStoredLoading(false);
  };

  return (
    <>
      {/* Reflected XSS */}
      <h3>Lab 1: Reflected XSS (反射型)</h3>
      <p className={styles.description}>
        URLパラメータの値がHTMLレスポンスにそのまま反映されます。
        <code>&lt;script&gt;alert(1)&lt;/script&gt;</code> を入力してみてください。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <ReflectedXssTest
            mode="vulnerable"
            result={reflectedVuln}
            error={reflectedError}
            isLoading={reflectedLoading}
            onSearch={handleSearch}
          />
        }
        secureContent={
          <ReflectedXssTest
            mode="secure"
            result={reflectedSecure}
            error={reflectedError}
            isLoading={reflectedLoading}
            onSearch={handleSearch}
          />
        }
      />

      {/* Stored XSS */}
      <h3 className={styles.lab2Heading}>Lab 2: Stored XSS (格納型)</h3>
      <p className={styles.description}>
        掲示板にスクリプトを含む投稿を行い、他のユーザーが閲覧した際にスクリプトが実行されることを確認します。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <StoredXssTest
            mode="vulnerable"
            posts={storedVuln}
            error={storedError}
            isLoading={storedLoading}
            onPost={handlePost}
            onRefresh={handleRefresh}
          />
        }
        secureContent={
          <StoredXssTest
            mode="secure"
            posts={storedSecure}
            error={storedError}
            isLoading={storedLoading}
            onPost={handlePost}
            onRefresh={handleRefresh}
          />
        }
      />

      <CheckpointBox variant="warning" title="注意">
        <p className={styles.checkpointText}>
          脆弱版の「ブラウザでの描画結果」では、<code>dangerouslySetInnerHTML</code>{' '}
          を使用してHTMLを描画しています。
          実際のブラウザでは <code>&lt;script&gt;</code> タグは innerHTML 経由では実行されませんが、
          <code>&lt;img onerror&gt;</code> や <code>&lt;svg onload&gt;</code> は実行されます。
        </p>
      </CheckpointBox>

      <CheckpointBox>
        <ul>
          <li>脆弱版: HTMLタグがそのまま描画・実行されるか</li>
          <li>安全版: HTMLタグがエスケープされてテキストとして表示されるか</li>
          <li>Reflected XSS と Stored XSS の違い（攻撃の持続性）を理解したか</li>
          <li>
            <code>escapeHtml()</code> による <code>&lt;</code> → <code>&amp;lt;</code>{' '}
            変換の効果を確認したか
          </li>
        </ul>
      </CheckpointBox>
    </>
  );
}
