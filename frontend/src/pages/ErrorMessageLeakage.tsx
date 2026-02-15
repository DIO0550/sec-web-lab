import { useState } from "react";

type FetchResult = {
  status: number;
  body: string;
} | null;

const TEST_INPUTS = [
  { id: "1", label: "正常 (id=1)", description: "正常なユーザーID" },
  { id: "abc", label: "文字列 (id=abc)", description: "型エラーを誘発" },
  { id: "'", label: "シングルクォート (id=')", description: "SQLエラーを誘発" },
  { id: "1 OR 1=1", label: "SQL Injection (1 OR 1=1)", description: "SQLインジェクション試行" },
];

export function ErrorMessageLeakage() {
  const [vulnerableResults, setVulnerableResults] = useState<Record<string, FetchResult>>({});
  const [secureResults, setSecureResults] = useState<Record<string, FetchResult>>({});
  const [customInput, setCustomInput] = useState("");
  const [customVulnResult, setCustomVulnResult] = useState<FetchResult>(null);
  const [customSecureResult, setCustomSecureResult] = useState<FetchResult>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const fetchEndpoint = async (url: string): Promise<FetchResult> => {
    const res = await fetch(url);
    const body = await res.text();
    return { status: res.status, body };
  };

  const handleTest = async (mode: "vulnerable" | "secure", inputId: string) => {
    const key = `${mode}-${inputId}`;
    setLoading(key);
    try {
      const result = await fetchEndpoint(
        `/api/labs/error-message-leakage/${mode}/users/${encodeURIComponent(inputId)}`
      );
      if (mode === "vulnerable") {
        setVulnerableResults((prev) => ({ ...prev, [inputId]: result }));
      } else {
        setSecureResults((prev) => ({ ...prev, [inputId]: result }));
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(null);
  };

  const handleCustomTest = async () => {
    if (!customInput.trim()) return;
    setLoading("custom");
    try {
      const [vulnRes, secureRes] = await Promise.all([
        fetchEndpoint(
          `/api/labs/error-message-leakage/vulnerable/users/${encodeURIComponent(customInput)}`
        ),
        fetchEndpoint(
          `/api/labs/error-message-leakage/secure/users/${encodeURIComponent(customInput)}`
        ),
      ]);
      setCustomVulnResult(vulnRes);
      setCustomSecureResult(secureRes);
    } catch (e) {
      console.error(e);
    }
    setLoading(null);
  };

  const renderResult = (result: FetchResult) => {
    if (!result) return null;
    const isError = result.status >= 400;
    let formattedBody: string;
    try {
      formattedBody = JSON.stringify(JSON.parse(result.body), null, 2);
    } catch {
      formattedBody = result.body;
    }
    return (
      <div style={{ marginTop: 4 }}>
        <span style={{ color: isError ? "#c00" : "#080", fontWeight: "bold", fontSize: 13 }}>
          {result.status}
        </span>
        <pre
          style={{
            background: "#1a1a2e",
            color: isError ? "#e94560" : "#4ecdc4",
            padding: 10,
            borderRadius: 4,
            overflow: "auto",
            fontSize: 12,
            maxHeight: 200,
          }}
        >
          {formattedBody}
        </pre>
      </div>
    );
  };

  return (
    <div>
      <h2>Error Message Leakage</h2>
      <p>エラーメッセージからの情報漏洩</p>
      <p style={{ color: "#666" }}>
        不正な入力でエラーを誘発すると、SQL文・テーブル名・スタックトレース等の内部情報が漏洩する脆弱性です。
      </p>

      {/* プリセットテスト */}
      <h3 style={{ marginTop: 24 }}>プリセットテスト</h3>
      <div style={{ display: "flex", gap: 24 }}>
        {/* 脆弱バージョン */}
        <div style={{ flex: 1 }}>
          <h4 style={{ color: "#c00" }}>脆弱バージョン</h4>
          {TEST_INPUTS.map((input) => (
            <div key={input.id} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  onClick={() => handleTest("vulnerable", input.id)}
                  disabled={loading !== null}
                  style={{ fontSize: 12, minWidth: 60 }}
                >
                  実行
                </button>
                <span style={{ fontSize: 13 }}>{input.label}</span>
                <span style={{ fontSize: 11, color: "#888" }}>— {input.description}</span>
              </div>
              {renderResult(vulnerableResults[input.id] ?? null)}
            </div>
          ))}
        </div>

        {/* 安全バージョン */}
        <div style={{ flex: 1 }}>
          <h4 style={{ color: "#080" }}>安全バージョン</h4>
          {TEST_INPUTS.map((input) => (
            <div key={input.id} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  onClick={() => handleTest("secure", input.id)}
                  disabled={loading !== null}
                  style={{ fontSize: 12, minWidth: 60 }}
                >
                  実行
                </button>
                <span style={{ fontSize: 13 }}>{input.label}</span>
                <span style={{ fontSize: 11, color: "#888" }}>— {input.description}</span>
              </div>
              {renderResult(secureResults[input.id] ?? null)}
            </div>
          ))}
        </div>
      </div>

      {/* カスタム入力 */}
      <div style={{ marginTop: 32, padding: 16, background: "#fff8e1", borderRadius: 4 }}>
        <h3>カスタム入力テスト</h3>
        <p style={{ fontSize: 13, color: "#666" }}>
          任意の入力でエラーを誘発してみてください。脆弱版と安全版を同時にテストします。
        </p>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <code>/api/labs/error-message-leakage/[mode]/users/</code>
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="入力値"
            style={{ padding: "4px 8px", border: "1px solid #ccc", borderRadius: 4 }}
          />
          <button onClick={handleCustomTest} disabled={loading !== null || !customInput.trim()}>
            テスト
          </button>
        </div>

        {(customVulnResult || customSecureResult) && (
          <div style={{ display: "flex", gap: 24, marginTop: 12 }}>
            <div style={{ flex: 1 }}>
              <strong style={{ color: "#c00" }}>脆弱版</strong>
              {renderResult(customVulnResult)}
            </div>
            <div style={{ flex: 1 }}>
              <strong style={{ color: "#080" }}>安全版</strong>
              {renderResult(customSecureResult)}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 32, padding: 16, background: "#f0f0f0", borderRadius: 4 }}>
        <h3>確認ポイント</h3>
        <ul>
          <li>脆弱版: エラーメッセージにテーブル名・SQL文・スタックトレースが含まれるか</li>
          <li>安全版: 汎用メッセージだけが返され、内部情報が漏洩していないか</li>
          <li>安全版: 不正な入力が <strong>バリデーション</strong> で弾かれているか</li>
          <li>注意: DBに接続していない場合、エラーメッセージの内容が異なる場合があります</li>
        </ul>
      </div>
    </div>
  );
}
