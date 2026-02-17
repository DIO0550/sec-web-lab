import { useState, useCallback } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

const BASE = "/api/labs/sql-injection";

type LoginResult = {
  success: boolean;
  message: string;
  user?: { id: number; username: string; email: string; role: string };
  _debug?: { query: string; rowCount: number };
  error?: string;
};

type SearchResult = {
  results: { title: string; content: string }[];
  count: number;
  _debug?: { query: string };
  error?: string;
};

// --- ログインフォーム ---
function LoginForm({
  mode,
  result,
  isLoading,
  onSubmit,
}: {
  mode: "vulnerable" | "secure";
  result: LoginResult | null;
  isLoading: boolean;
  onSubmit: (mode: "vulnerable" | "secure", username: string, password: string) => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const presets = [
    { label: "正常ログイン", username: "admin", password: "admin123" },
    { label: "' OR 1=1 --", username: "' OR 1=1 --", password: "anything" },
    { label: "admin' --", username: "admin' --", password: "wrong" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ marginBottom: 4 }}>
          <label style={{ fontSize: 13, display: "block" }}>ユーザー名:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ padding: "4px 8px", border: "1px solid #ccc", borderRadius: 4, width: "100%" }}
          />
        </div>
        <div style={{ marginBottom: 4 }}>
          <label style={{ fontSize: 13, display: "block" }}>パスワード:</label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: "4px 8px", border: "1px solid #ccc", borderRadius: 4, width: "100%" }}
          />
        </div>
        <FetchButton onClick={() => onSubmit(mode, username, password)} disabled={isLoading}>
          ログイン
        </FetchButton>
      </div>

      <div style={{ marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: "#888" }}>プリセット:</span>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => {
                setUsername(p.username);
                setPassword(p.password);
              }}
              style={{ fontSize: 11, padding: "2px 8px", cursor: "pointer" }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {result && (
        <div
          style={{
            marginTop: 8,
            padding: 12,
            borderRadius: 4,
            background: result.success ? "#e8f5e9" : "#ffebee",
            border: `1px solid ${result.success ? "#4caf50" : "#f44336"}`,
          }}
        >
          <div style={{ fontWeight: "bold", color: result.success ? "#2e7d32" : "#c62828" }}>
            {result.success ? "ログイン成功" : "ログイン失敗"}
          </div>
          <div style={{ fontSize: 13 }}>{result.message}</div>
          {result.user && (
            <pre style={{ fontSize: 12, background: "#f5f5f5", padding: 8, borderRadius: 4, marginTop: 8 }}>
              {JSON.stringify(result.user, null, 2)}
            </pre>
          )}
          {result._debug && (
            <details style={{ marginTop: 8 }}>
              <summary style={{ fontSize: 12, color: "#888", cursor: "pointer" }}>実行されたSQL</summary>
              <pre style={{ fontSize: 11, background: "#1a1a2e", color: "#e94560", padding: 8, borderRadius: 4 }}>
                {result._debug.query}
              </pre>
              <div style={{ fontSize: 11, color: "#888" }}>返却行数: {result._debug.rowCount}</div>
            </details>
          )}
          {result.error && (
            <pre style={{ fontSize: 11, color: "#c00", marginTop: 4 }}>{result.error}</pre>
          )}
        </div>
      )}
    </div>
  );
}

// --- 検索フォーム ---
function SearchForm({
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
    { label: "正常検索", query: "Welcome" },
    { label: "UNION (user情報)", query: "' UNION SELECT username, password FROM users --" },
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
          <div style={{ fontSize: 13, color: "#888" }}>{result.count} 件の結果</div>
          {result.results.length > 0 && (
            <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse", marginTop: 4 }}>
              <thead>
                <tr style={{ background: "#f5f5f5" }}>
                  <th style={{ padding: 4, border: "1px solid #ddd", textAlign: "left" }}>title</th>
                  <th style={{ padding: 4, border: "1px solid #ddd", textAlign: "left" }}>content</th>
                </tr>
              </thead>
              <tbody>
                {result.results.map((r, i) => (
                  <tr key={i}>
                    <td style={{ padding: 4, border: "1px solid #ddd" }}>{r.title}</td>
                    <td style={{ padding: 4, border: "1px solid #ddd" }}>{r.content}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {result._debug && (
            <details style={{ marginTop: 8 }}>
              <summary style={{ fontSize: 12, color: "#888", cursor: "pointer" }}>実行されたSQL</summary>
              <pre style={{ fontSize: 11, background: "#1a1a2e", color: "#e94560", padding: 8, borderRadius: 4 }}>
                {result._debug.query}
              </pre>
            </details>
          )}
          {result.error && (
            <pre style={{ fontSize: 11, color: "#c00", marginTop: 4 }}>{result.error}</pre>
          )}
        </div>
      )}
    </div>
  );
}

// --- メインコンポーネント ---

export function SqlInjection() {
  const [vulnLogin, setVulnLogin] = useState<LoginResult | null>(null);
  const [secureLogin, setSecureLogin] = useState<LoginResult | null>(null);
  const [vulnSearch, setVulnSearch] = useState<SearchResult | null>(null);
  const [secureSearch, setSecureSearch] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(async (mode: "vulnerable" | "secure", username: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (mode === "vulnerable") setVulnLogin(data);
      else setSecureLogin(data);
    } catch (e) {
      const err = { success: false, message: (e as Error).message };
      if (mode === "vulnerable") setVulnLogin(err);
      else setSecureLogin(err);
    }
    setLoading(false);
  }, []);

  const handleSearch = useCallback(async (mode: "vulnerable" | "secure", query: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${mode}/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (mode === "vulnerable") setVulnSearch(data);
      else setSecureSearch(data);
    } catch (e) {
      const err = { results: [], count: 0, error: (e as Error).message };
      if (mode === "vulnerable") setVulnSearch(err);
      else setSecureSearch(err);
    }
    setLoading(false);
  }, []);

  return (
    <LabLayout
      title="SQL Injection"
      subtitle="SQLインジェクション — 認証バイパス & データ抽出"
      description="ユーザー入力がSQL文に直接埋め込まれることで、認証のバイパスや他テーブルのデータ抽出が可能になる脆弱性です。"
    >
      {/* 認証バイパス */}
      <h3 style={{ marginTop: 24 }}>Lab 1: 認証バイパス</h3>
      <p style={{ fontSize: 14, color: "#666" }}>
        ユーザー名に <code>{`' OR 1=1 --`}</code> を入力して、パスワードなしでログインを試みてください。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <LoginForm mode="vulnerable" result={vulnLogin} isLoading={loading} onSubmit={handleLogin} />
        }
        secureContent={
          <LoginForm mode="secure" result={secureLogin} isLoading={loading} onSubmit={handleLogin} />
        }
      />

      {/* データ抽出 */}
      <h3 style={{ marginTop: 32 }}>Lab 2: データ抽出 (UNION)</h3>
      <p style={{ fontSize: 14, color: "#666" }}>
        検索欄に <code>{`' UNION SELECT username, password FROM users --`}</code> を入力して、
        ユーザーテーブルの内容を抽出してみてください。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <SearchForm mode="vulnerable" result={vulnSearch} isLoading={loading} onSearch={handleSearch} />
        }
        secureContent={
          <SearchForm mode="secure" result={secureSearch} isLoading={loading} onSearch={handleSearch} />
        }
      />

      <CheckpointBox>
        <ul>
          <li>脆弱版: <code>{`' OR 1=1 --`}</code> でadminとしてログインできるか</li>
          <li>安全版: 同じペイロードでログインが失敗するか</li>
          <li>脆弱版: UNION SELECT でusersテーブルのデータが検索結果に混入するか</li>
          <li>安全版: UNION SELECT が文字列として検索されるだけか</li>
          <li>パラメータ化クエリ (<code>$1</code>) と文字列結合の違いを理解したか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
