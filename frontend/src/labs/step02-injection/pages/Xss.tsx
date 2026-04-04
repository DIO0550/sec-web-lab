import { useState } from "react";
import { LabLayout } from "@/components/LabLayout";
import { ComparisonPanel } from "@/components/ComparisonPanel";
import { FetchButton } from "@/components/FetchButton";
import { CheckpointBox } from "@/components/CheckpointBox";
import { Input } from "@/components/Input";
import { Textarea } from "@/components/Textarea";
import { PresetButtons } from "@/components/PresetButtons";
import { useComparisonFetch } from "@/hooks/useComparisonFetch";
import { getJson } from "@/utils/api";
import { ExpandableSection } from "@/components/ExpandableSection";

const BASE = "/api/labs/xss";

type SearchResult = {
  query: string;
  html: string;
};

type PostsResult = {
  posts: { id: number; title: string; content: string; created_at: string }[];
  postsHtml: string;
};

const reflectedPresets = [
  { label: "通常テキスト", query: "セキュリティ" },
  { label: "<script>alert</script>", query: "<script>alert('XSS')</script>" },
  { label: "<img onerror>", query: '<img src=x onerror=alert("XSS")>' },
  { label: "<b>太字</b>", query: "<b>太字テスト</b>" },
];

const storedPresets = [
  { label: "通常投稿", title: "テスト投稿", content: "これは通常の投稿です" },
  { label: "<img onerror>", title: "画像テスト", content: '<img src=x onerror=alert("Stored XSS!")>' },
  { label: "<script>", title: "スクリプトテスト", content: "<script>alert('Stored XSS')</script>" },
];

// --- HTMLレスポンス表示 ---
function HtmlPreview({
  html,
  mode,
}: {
  html: string;
  mode: "vulnerable" | "secure";
}) {
  return (
    <div className="mt-2">
      <div className="text-xs text-text-muted mb-1">サーバーからのHTMLレスポンス:</div>
      <pre
        className={`bg-vuln-bg p-3 rounded overflow-auto text-xs max-h-[200px] whitespace-pre-wrap ${mode === "vulnerable" ? "text-vuln-text" : "text-secure-text"}`}
      >
        {html}
      </pre>
      <div className="text-xs text-text-muted mt-2 mb-1">ブラウザでの描画結果 (dangerouslySetInnerHTML):</div>
      <div
        className={`border-2 p-3 rounded bg-bg-primary ${mode === "vulnerable" ? "border-error-border" : "border-success-border"}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

// --- Reflected XSS テスト ---
function ReflectedXssTest({
  mode,
  result,
  isLoading,
  onSearch,
}: {
  mode: "vulnerable" | "secure";
  result: SearchResult | null;
  isLoading: boolean;
  onSearch: (mode: "vulnerable" | "secure", query: string) => void;
}) {
  const [query, setQuery] = useState("");

  return (
    <div>
      <div className="mb-3">
        <label className="text-sm block">検索キーワード:</label>
        <div className="flex gap-2">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          <FetchButton onClick={() => onSearch(mode, query)} disabled={isLoading}>
            検索
          </FetchButton>
        </div>
      </div>

      <PresetButtons
        presets={reflectedPresets}
        onSelect={(p) => setQuery(p.query)}
        className="mb-3"
      />

      <ExpandableSection isOpen={!!result}>
        {result && <HtmlPreview html={result.html} mode={mode} />}
      </ExpandableSection>
    </div>
  );
}

// --- Stored XSS テスト ---
function StoredXssTest({
  mode,
  posts,
  isLoading,
  onPost,
  onRefresh,
}: {
  mode: "vulnerable" | "secure";
  posts: PostsResult | null;
  isLoading: boolean;
  onPost: (mode: "vulnerable" | "secure", title: string, content: string) => void;
  onRefresh: (mode: "vulnerable" | "secure") => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  return (
    <div>
      <div className="mb-3">
        <Input
          label="タイトル:"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-1"
        />
        <Textarea
          label="内容:"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={2}
          className="mb-1"
        />
        <div className="flex gap-2">
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
        className="mb-3"
      />

      <ExpandableSection isOpen={!!posts}>
        <div className="mt-2">
          <div className="text-xs text-text-muted mb-1">サーバーからのHTMLフラグメント:</div>
          <pre
            className={`bg-vuln-bg p-3 rounded overflow-auto text-xs max-h-[150px] whitespace-pre-wrap ${mode === "vulnerable" ? "text-vuln-text" : "text-secure-text"}`}
          >
            {posts?.postsHtml}
          </pre>
          <div className="text-xs text-text-muted mt-2 mb-1">ブラウザでの描画結果 (dangerouslySetInnerHTML):</div>
          <div
            className={`border-2 p-3 rounded bg-bg-primary max-h-[200px] overflow-auto ${mode === "vulnerable" ? "border-error-border" : "border-success-border"}`}
            dangerouslySetInnerHTML={{ __html: posts?.postsHtml ?? "" }}
          />
        </div>
      </ExpandableSection>
    </div>
  );
}

// --- メインコンポーネント ---

export function Xss() {
  const searchFetch = useComparisonFetch<SearchResult>(BASE);
  const postsFetch = useComparisonFetch<PostsResult>(BASE);

  const handleSearch = async (mode: "vulnerable" | "secure", query: string) => {
    await searchFetch.run(mode, `/api/search?q=${encodeURIComponent(query)}`);
  };

  const handlePost = async (mode: "vulnerable" | "secure", title: string, content: string) => {
    await postsFetch.postJson(mode, "/posts", { title, content });
    // 投稿後に一覧を更新
    const data = await getJson<PostsResult>(`${BASE}/${mode}/api/posts`);
    postsFetch.setResult(mode, data);
  };

  const handleRefresh = async (mode: "vulnerable" | "secure") => {
    const data = await getJson<PostsResult>(`${BASE}/${mode}/api/posts`);
    postsFetch.setResult(mode, data);
  };

  return (
    <LabLayout
      title="Cross-Site Scripting (XSS)"
      subtitle="クロスサイトスクリプティング — Webページにスクリプトを埋め込む"
      description="ユーザー入力がHTMLとしてブラウザに解釈されることで、任意のJavaScriptが実行される脆弱性です。"
    >
      {/* Reflected XSS */}
      <h3 className="mt-6">Lab 1: Reflected XSS (反射型)</h3>
      <p className="text-sm text-text-secondary">
        URLパラメータの値がHTMLレスポンスにそのまま反映されます。
        <code>&lt;script&gt;alert(1)&lt;/script&gt;</code> を入力してみてください。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <ReflectedXssTest mode="vulnerable" result={searchFetch.vulnerable} isLoading={searchFetch.loading} onSearch={handleSearch} />
        }
        secureContent={
          <ReflectedXssTest mode="secure" result={searchFetch.secure} isLoading={searchFetch.loading} onSearch={handleSearch} />
        }
      />

      {/* Stored XSS */}
      <h3 className="mt-8">Lab 2: Stored XSS (格納型)</h3>
      <p className="text-sm text-text-secondary">
        掲示板にスクリプトを含む投稿を行い、他のユーザーが閲覧した際にスクリプトが実行されることを確認します。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <StoredXssTest
            mode="vulnerable"
            posts={postsFetch.vulnerable}
            isLoading={postsFetch.loading}
            onPost={handlePost}
            onRefresh={handleRefresh}
          />
        }
        secureContent={
          <StoredXssTest
            mode="secure"
            posts={postsFetch.secure}
            isLoading={postsFetch.loading}
            onPost={handlePost}
            onRefresh={handleRefresh}
          />
        }
      />

      <CheckpointBox variant="warning" title="注意">
        <p className="text-sm text-text-secondary">
          脆弱版の「ブラウザでの描画結果」では、<code>dangerouslySetInnerHTML</code> を使用してHTMLを描画しています。
          実際のブラウザでは <code>&lt;script&gt;</code> タグは innerHTML 経由では実行されませんが、
          <code>&lt;img onerror&gt;</code> や <code>&lt;svg onload&gt;</code> は実行されます。
        </p>
      </CheckpointBox>

      <CheckpointBox>
        <ul>
          <li>脆弱版: HTMLタグがそのまま描画・実行されるか</li>
          <li>安全版: HTMLタグがエスケープされてテキストとして表示されるか</li>
          <li>Reflected XSS と Stored XSS の違い（攻撃の持続性）を理解したか</li>
          <li><code>escapeHtml()</code> による <code>&lt;</code> → <code>&amp;lt;</code> 変換の効果を確認したか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
