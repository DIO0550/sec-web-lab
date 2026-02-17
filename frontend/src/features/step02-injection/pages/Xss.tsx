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
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 13, display: "block" }}>検索キーワード:</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ padding: "4px 8px", border: "1px solid #ccc", borderRadius: 4, flex: 1 }}
          />
          <FetchButton onClick={() => onSearch(mode, query)} disabled={isLoading}>
            検索
          </FetchButton>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: "#888" }}>プリセット:</span>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => setQuery(p.query)}
              style={{ fontSize: 11, padding: "2px 8px", cursor: "pointer" }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {result && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>
            サーバーからのHTMLレスポンス:
          </div>
          <pre
            style={{
              background: "#1a1a2e",
              color: mode === "vulnerable" ? "#e94560" : "#4ecdc4",
              padding: 12,
              borderRadius: 4,
              overflow: "auto",
              fontSize: 12,
              maxHeight: 200,
              whiteSpace: "pre-wrap",
            }}
          >
            {result.html}
          </pre>
          <div style={{ fontSize: 12, color: "#888", marginTop: 8, marginBottom: 4 }}>
            ブラウザでの描画結果 (dangerouslySetInnerHTML):
          </div>
          <div
            style={{
              border: `2px solid ${mode === "vulnerable" ? "#c00" : "#080"}`,
              padding: 12,
              borderRadius: 4,
              background: "#fff",
            }}
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
      <div style={{ marginBottom: 12 }}>
        <div style={{ marginBottom: 4 }}>
          <label style={{ fontSize: 13, display: "block" }}>タイトル:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ padding: "4px 8px", border: "1px solid #ccc", borderRadius: 4, width: "100%" }}
          />
        </div>
        <div style={{ marginBottom: 4 }}>
          <label style={{ fontSize: 13, display: "block" }}>内容:</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={2}
            style={{ padding: "4px 8px", border: "1px solid #ccc", borderRadius: 4, width: "100%" }}
          />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <FetchButton onClick={() => onPost(mode, title, content)} disabled={isLoading}>
            投稿
          </FetchButton>
          <FetchButton onClick={() => onRefresh(mode)} disabled={isLoading}>
            投稿一覧を取得
          </FetchButton>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: "#888" }}>プリセット:</span>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => {
                setTitle(p.title);
                setContent(p.content);
              }}
              style={{ fontSize: 11, padding: "2px 8px", cursor: "pointer" }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {posts && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>
            サーバーからのHTMLフラグメント:
          </div>
          <pre
            style={{
              background: "#1a1a2e",
              color: mode === "vulnerable" ? "#e94560" : "#4ecdc4",
              padding: 12,
              borderRadius: 4,
              overflow: "auto",
              fontSize: 12,
              maxHeight: 150,
              whiteSpace: "pre-wrap",
            }}
          >
            {posts.postsHtml}
          </pre>
          <div style={{ fontSize: 12, color: "#888", marginTop: 8, marginBottom: 4 }}>
            ブラウザでの描画結果 (dangerouslySetInnerHTML):
          </div>
          <div
            style={{
              border: `2px solid ${mode === "vulnerable" ? "#c00" : "#080"}`,
              padding: 12,
              borderRadius: 4,
              background: "#fff",
              maxHeight: 200,
              overflow: "auto",
            }}
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
      <h3 style={{ marginTop: 24 }}>Lab 1: Reflected XSS (反射型)</h3>
      <p style={{ fontSize: 14, color: "#666" }}>
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
      <h3 style={{ marginTop: 32 }}>Lab 2: Stored XSS (格納型)</h3>
      <p style={{ fontSize: 14, color: "#666" }}>
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
        <p style={{ fontSize: 13, color: "#666" }}>
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
