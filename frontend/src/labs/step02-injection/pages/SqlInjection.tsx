import { useState } from "react";
import { LabLayout } from "@/components/LabLayout";
import { ComparisonPanel } from "@/components/ComparisonPanel";
import { FetchButton } from "@/components/FetchButton";
import { CheckpointBox } from "@/components/CheckpointBox";
import { CredentialsFields } from "@/components/CredentialsFields";
import { Input } from "@/components/Input";
import { Alert } from "@/components/Alert";
import { PresetButtons } from "@/components/PresetButtons";
import { DebugInfo } from "@/components/DebugInfo";
import { ResultTable } from "@/components/ResultTable";
import { useComparisonFetch } from "@/hooks/useComparisonFetch";
import { ExpandableSection } from "@/components/ExpandableSection";

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

const loginPresets = [
  { label: "正常ログイン", username: "admin", password: "admin123" },
  { label: "' OR 1=1 --", username: "' OR 1=1 --", password: "anything" },
  { label: "admin' --", username: "admin' --", password: "wrong" },
];

const searchPresets = [
  { label: "正常検索", query: "Welcome" },
  { label: "UNION (user情報)", query: "' UNION SELECT username, password FROM users --" },
];

const searchColumns = [
  { key: "title" as const, label: "title" },
  { key: "content" as const, label: "content" },
];

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

  return (
    <div>
      <div className="mb-3">
        <CredentialsFields
          username={username}
          password={password}
          onUsernameChange={setUsername}
          onPasswordChange={setPassword}
          usernameLabel="ユーザー名:"
          passwordLabel="パスワード:"
        />
        <FetchButton onClick={() => onSubmit(mode, username, password)} disabled={isLoading}>
          ログイン
        </FetchButton>
      </div>

      <PresetButtons
        presets={loginPresets}
        onSelect={(p) => {
          setUsername(p.username);
          setPassword(p.password);
        }}
        className="mb-3"
      />

      <ExpandableSection isOpen={!!result}>
        <Alert
          variant={result?.success ? "success" : "error"}
          title={result?.success ? "ログイン成功" : "ログイン失敗"}
          className="mt-2"
        >
          <div className="text-sm">{result?.message}</div>
          {result?.user && (
            <pre className="text-xs bg-code-bg text-code-text p-2 rounded mt-2">
              {JSON.stringify(result.user, null, 2)}
            </pre>
          )}
          <DebugInfo debug={result?._debug ?? null} summary="実行されたSQL" codeField="query" />
          {result?.error && (
            <pre className="text-xs text-status-ng mt-1">{result.error}</pre>
          )}
        </Alert>
      </ExpandableSection>
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
        presets={searchPresets}
        onSelect={(p) => setQuery(p.query)}
        className="mb-3"
      />

      <ExpandableSection isOpen={!!result}>
        <div className="mt-2">
          <div className="text-sm text-text-muted">{result?.count} 件の結果</div>
          <ResultTable columns={searchColumns} data={result?.results ?? []} className="mt-1" />
          <DebugInfo debug={result?._debug ?? null} summary="実行されたSQL" codeField="query" />
          {result?.error && (
            <pre className="text-xs text-status-ng mt-1">{result.error}</pre>
          )}
        </div>
      </ExpandableSection>
    </div>
  );
}

// --- メインコンポーネント ---

export function SqlInjection() {
  const login = useComparisonFetch<LoginResult>(BASE);
  const search = useComparisonFetch<SearchResult>(BASE);

  const handleLogin = async (mode: "vulnerable" | "secure", username: string, password: string) => {
    await login.postJson(mode, "/login", { username, password }, (e) => ({
      success: false,
      message: e.message,
      results: [],
      count: 0,
    }));
  };

  const handleSearch = async (mode: "vulnerable" | "secure", query: string) => {
    await search.run(mode, `/search?q=${encodeURIComponent(query)}`, undefined, (e) => ({
      results: [],
      count: 0,
      error: e.message,
    }));
  };

  return (
    <LabLayout
      title="SQL Injection"
      subtitle="SQLインジェクション — 認証バイパス & データ抽出"
      description="ユーザー入力がSQL文に直接埋め込まれることで、認証のバイパスや他テーブルのデータ抽出が可能になる脆弱性です。"
    >
      {/* 認証バイパス */}
      <h3 className="mt-6">Lab 1: 認証バイパス</h3>
      <p className="text-sm text-text-secondary">
        ユーザー名に <code>{`' OR 1=1 --`}</code> を入力して、パスワードなしでログインを試みてください。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <LoginForm mode="vulnerable" result={login.vulnerable} isLoading={login.loading} onSubmit={handleLogin} />
        }
        secureContent={
          <LoginForm mode="secure" result={login.secure} isLoading={login.loading} onSubmit={handleLogin} />
        }
      />

      {/* データ抽出 */}
      <h3 className="mt-8">Lab 2: データ抽出 (UNION)</h3>
      <p className="text-sm text-text-secondary">
        検索欄に <code>{`' UNION SELECT username, password FROM users --`}</code> を入力して、
        ユーザーテーブルの内容を抽出してみてください。
      </p>
      <ComparisonPanel
        vulnerableContent={
          <SearchForm mode="vulnerable" result={search.vulnerable} isLoading={search.loading} onSearch={handleSearch} />
        }
        secureContent={
          <SearchForm mode="secure" result={search.secure} isLoading={search.loading} onSearch={handleSearch} />
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
