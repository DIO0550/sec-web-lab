import { useState, useCallback } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

const BASE = "/api/labs/xss";

type SearchResult = {
  query: string;
  html: string;
};

type PostsResult = {
  posts: { id: number; title: string; content: string; created_at: string }[];
  postsHtml: string;
};

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

  const presets = [
    { label: "通常テキスト", query: "セキュリティ" },
    { label: "<script>alert</script>", query: "<script>alert('XSS')</script>" },
    { label: "<img onerror>", query: '<img src=x onerror=alert("XSS")>' },
    { label: "<b>太字</b>", query: "<b>太字テスト</b>" },
  ];

  return (
    <div>
      <div className="mb-3">
        <label className="text-[13px] block">検索キーワード:</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="py-1 px-2 border border-[#ccc] rounded flex-1"
          />
          <FetchButton onClick={() => onSearch(mode, query)} disabled={isLoading}>
            検索
          </FetchButton>
        </div>
      </div>

      <div className="mb-3">
        <span className="text-xs text-[#888]">プリセット:</span>
        <div className="flex gap-1 flex-wrap mt-1">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => setQuery(p.query)}
              className="text-[11px] py-0.5 px-2 cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {result && (
        <div className="mt-2">
          <div className="text-xs text-[#888] mb-1">
            サーバーからのHTMLレスポンス:
          </div>
          <pre
            className={`bg-vuln-bg p-3 rounded overflow-auto text-xs max-h-[200px] whitespace-pre-wrap ${mode === "vulnerable" ? "text-vuln-text" : "text-secure-text"}`}
          >
            {result.html}
          </pre>
          <div className="text-xs text-[#888] mt-2 mb-1">
            ブラウザでの描画結果 (dangerouslySetInnerHTML):
          </div>
          <div
            className={`border-2 p-3 rounded bg-white ${mode === "vulnerable" ? "border-[#c00]" : "border-[#080]"}`}
            dangerouslySetInnerHTML={{ __html: result.html }}
          />
        </div>
      )}
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

  const presets = [
    { label: "通常投稿", title: "テスト投稿", content: "これは通常の投稿です" },
    {
      label: "<img onerror>",
      title: "画像テスト",
      content: '<img src=x onerror=alert("Stored XSS!")>',
    },
    {
      label: "<script>",
      title: "スクリプトテスト",
      content: "<script>alert('Stored XSS')</script>",
    },
  ];

  return (
    <div>
      <div className="mb-3">
        <div className="mb-1">
          <label className="text-[13px] block">タイトル:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="py-1 px-2 border border-[#ccc] rounded w-full"
          />
        </div>
        <div className="mb-1">
          <label className="text-[13px] block">内容:</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={2}
            className="py-1 px-2 border border-[#ccc] rounded w-full"
          />
        </div>
        <div className="flex gap-2">
          <FetchButton onClick={() => onPost(mode, title, content)} disabled={isLoading}>
            投稿
          </FetchButton>
          <FetchButton onClick={() => onRefresh(mode)} disabled={isLoading}>
            投稿一覧を取得
          </FetchButton>
        </div>
      </div>

      <div className="mb-3">
        <span className="text-xs text-[#888]">プリセット:</span>
        <div className="flex gap-1 flex-wrap mt-1">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => {
                setTitle(p.title);
                setContent(p.content);
              }}
              className="text-[11px] py-0.5 px-2 cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {posts && (
        <div className="mt-2">
          <div className="text-xs text-[#888] mb-1">
            サーバーからのHTMLフラグメント:
          </div>
          <pre
            className={`bg-vuln-bg p-3 rounded overflow-auto text-xs max-h-[150px] whitespace-pre-wrap ${mode === "vulnerable" ? "text-vuln-text" : "text-secure-text"}`}
          >
            {posts.postsHtml}
          </pre>
          <div className="text-xs text-[#888] mt-2 mb-1">
            ブラウザでの描画結果 (dangerouslySetInnerHTML):
          </div>
          <div
            className={`border-2 p-3 rounded bg-white max-h-[200px] overflow-auto ${mode === "vulnerable" ? "border-[#c00]" : "border-[#080]"}`}
            dangerouslySetInnerHTML={{ __html: posts.postsHtml }}
          />
        </div>
      )}
    </div>
  );
}

// --- メインコンポーネント ---

export function Xss() {
  const [vulnSearch, setVulnSearch] = useState<SearchResult | null>(null);
  const [secureSearch, setSecureSearch] = useState<SearchResult | null>(null);
  const [vulnPosts, setVulnPosts] = useState<PostsResult | null>(null);
  const [securePosts, setSecurePosts] = useState<PostsResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(async (mode: "vulnerable" | "secure", query: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (mode === "vulnerable") setVulnSearch(data);
      else setSecureSearch(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  const handlePost = useCallback(async (mode: "vulnerable" | "secure", title: string, content: string) => {
    setLoading(true);
    try {
      await fetch(`${BASE}/${mode}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      // 投稿後に一覧を更新
      const res = await fetch(`${BASE}/${mode}/api/posts`);
      const data = await res.json();
      if (mode === "vulnerable") setVulnPosts(data);
      else setSecurePosts(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  const handleRefresh = useCallback(async (mode: "vulnerable" | "secure") => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/api/posts`);
      const data = await res.json();
      if (mode === "vulnerable") setVulnPosts(data);
      else setSecurePosts(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  return (
    <LabLayout
      title="Cross-Site Scripting (XSS)"
      subtitle="クロスサイトスクリプティング — Webページにスクリプトを埋め込む"
      description="ユーザー入力がHTMLとしてブラウザに解釈されることで、任意のJavaScriptが実行される脆弱性です。"
    >
      {/* Reflected XSS */}
      <h3 className="mt-6">Lab 1: Reflected XSS (反射型)</h3>
      <p className="text-sm text-[#666]">
        URLパラメータの値がHTMLレスポンスにそのまま反映されます。
        <code>&lt;script&gt;alert(1)&lt;/script&gt;</code> を入力してみてください。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <ReflectedXssTest mode="vulnerable" result={vulnSearch} isLoading={loading} onSearch={handleSearch} />
        }
        secureContent={
          <ReflectedXssTest mode="secure" result={secureSearch} isLoading={loading} onSearch={handleSearch} />
        }
      />

      {/* Stored XSS */}
      <h3 className="mt-8">Lab 2: Stored XSS (格納型)</h3>
      <p className="text-sm text-[#666]">
        掲示板にスクリプトを含む投稿を行い、他のユーザーが閲覧した際にスクリプトが実行されることを確認します。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <StoredXssTest
            mode="vulnerable"
            posts={vulnPosts}
            isLoading={loading}
            onPost={handlePost}
            onRefresh={handleRefresh}
          />
        }
        secureContent={
          <StoredXssTest
            mode="secure"
            posts={securePosts}
            isLoading={loading}
            onPost={handlePost}
            onRefresh={handleRefresh}
          />
        }
      />

      <CheckpointBox variant="warning" title="注意">
        <p className="text-[13px] text-[#666]">
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
