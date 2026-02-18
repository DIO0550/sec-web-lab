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
      <div className="mb-3">
        <div className="mb-1">
          <label className="text-[13px] block">ユーザー名:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="py-1 px-2 border border-[#ccc] rounded w-full"
          />
        </div>
        <div className="mb-1">
          <label className="text-[13px] block">パスワード:</label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="py-1 px-2 border border-[#ccc] rounded w-full"
          />
        </div>
        <FetchButton onClick={() => onSubmit(mode, username, password)} disabled={isLoading}>
          ログイン
        </FetchButton>
      </div>

      <div className="mb-3">
        <span className="text-xs text-[#888]">プリセット:</span>
        <div className="flex gap-1 flex-wrap mt-1">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => {
                setUsername(p.username);
                setPassword(p.password);
              }}
              className="text-[11px] py-0.5 px-2 cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {result && (
        <div
          className={`mt-2 p-3 rounded ${result.success ? "bg-[#e8f5e9] border border-[#4caf50]" : "bg-[#ffebee] border border-[#f44336]"}`}
        >
          <div className={`font-bold ${result.success ? "text-[#2e7d32]" : "text-[#c62828]"}`}>
            {result.success ? "ログイン成功" : "ログイン失敗"}
          </div>
          <div className="text-[13px]">{result.message}</div>
          {result.user && (
            <pre className="text-xs bg-[#f5f5f5] p-2 rounded mt-2">
              {JSON.stringify(result.user, null, 2)}
            </pre>
          )}
          {result._debug && (
            <details className="mt-2">
              <summary className="text-xs text-[#888] cursor-pointer">実行されたSQL</summary>
              <pre className="text-[11px] bg-vuln-bg text-vuln-text p-2 rounded">
                {result._debug.query}
              </pre>
              <div className="text-[11px] text-[#888]">返却行数: {result._debug.rowCount}</div>
            </details>
          )}
          {result.error && (
            <pre className="text-[11px] text-[#c00] mt-1">{result.error}</pre>
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
          <div className="text-[13px] text-[#888]">{result.count} 件の結果</div>
          {result.results.length > 0 && (
            <table className="w-full text-xs border-collapse mt-1">
              <thead>
                <tr className="bg-[#f5f5f5]">
                  <th className="p-1 border border-[#ddd] text-left">title</th>
                  <th className="p-1 border border-[#ddd] text-left">content</th>
                </tr>
              </thead>
              <tbody>
                {result.results.map((r, i) => (
                  <tr key={i}>
                    <td className="p-1 border border-[#ddd]">{r.title}</td>
                    <td className="p-1 border border-[#ddd]">{r.content}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {result._debug && (
            <details className="mt-2">
              <summary className="text-xs text-[#888] cursor-pointer">実行されたSQL</summary>
              <pre className="text-[11px] bg-vuln-bg text-vuln-text p-2 rounded">
                {result._debug.query}
              </pre>
            </details>
          )}
          {result.error && (
            <pre className="text-[11px] text-[#c00] mt-1">{result.error}</pre>
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
      <h3 className="mt-6">Lab 1: 認証バイパス</h3>
      <p className="text-sm text-[#666]">
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
      <h3 className="mt-8">Lab 2: データ抽出 (UNION)</h3>
      <p className="text-sm text-[#666]">
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
