import { useState } from "react";

type FetchResult = {
  status: number;
  contentType: string;
  body: string;
} | null;

const TARGET_FILES = [
  { path: ".env", label: ".env (環境変数)" },
  { path: ".git/HEAD", label: ".git/HEAD (Git情報)" },
  { path: ".git/config", label: ".git/config (Git設定)" },
  { path: "robots.txt", label: "robots.txt" },
];

export function SensitiveFileExposure() {
  const [vulnerableResults, setVulnerableResults] = useState<Record<string, FetchResult>>({});
  const [secureResults, setSecureResults] = useState<Record<string, FetchResult>>({});
  const [loading, setLoading] = useState<string | null>(null);

  const fetchFile = async (url: string): Promise<FetchResult> => {
    const res = await fetch(url);
    const body = await res.text();
    return {
      status: res.status,
      contentType: res.headers.get("content-type") ?? "",
      body,
    };
  };

  const handleFetchVulnerable = async (filePath: string) => {
    setLoading(`vulnerable-${filePath}`);
    try {
      const result = await fetchFile(`/api/labs/sensitive-file-exposure/vulnerable/${filePath}`);
      setVulnerableResults((prev) => ({ ...prev, [filePath]: result }));
    } catch (e) {
      console.error(e);
    }
    setLoading(null);
  };

  const handleFetchSecure = async (filePath: string) => {
    setLoading(`secure-${filePath}`);
    try {
      const result = await fetchFile(`/api/labs/sensitive-file-exposure/secure/${filePath}`);
      setSecureResults((prev) => ({ ...prev, [filePath]: result }));
    } catch (e) {
      console.error(e);
    }
    setLoading(null);
  };

  const handleFetchAll = async (mode: "vulnerable" | "secure") => {
    setLoading(`all-${mode}`);
    for (const file of TARGET_FILES) {
      try {
        const result = await fetchFile(
          `/api/labs/sensitive-file-exposure/${mode}/${file.path}`
        );
        if (mode === "vulnerable") {
          setVulnerableResults((prev) => ({ ...prev, [file.path]: result }));
        } else {
          setSecureResults((prev) => ({ ...prev, [file.path]: result }));
        }
      } catch (e) {
        console.error(e);
      }
    }
    setLoading(null);
  };

  const renderResult = (result: FetchResult) => {
    if (!result) return null;
    const isError = result.status >= 400;
    return (
      <div style={{ marginTop: 8 }}>
        <div>
          Status:{" "}
          <span style={{ color: isError ? "#c00" : "#080", fontWeight: "bold" }}>
            {result.status}
          </span>
        </div>
        <pre
          style={{
            background: isError ? "#2e1a1a" : "#1a1a2e",
            color: isError ? "#ff6b6b" : "#e94560",
            padding: 12,
            borderRadius: 4,
            overflow: "auto",
            fontSize: 13,
            maxHeight: 200,
          }}
        >
          {result.body}
        </pre>
      </div>
    );
  };

  return (
    <div>
      <h2>Sensitive File Exposure</h2>
      <p>機密ファイルの露出 (.env / .git / robots.txt)</p>
      <p style={{ color: "#666" }}>
        <code>.env</code> や <code>.git/</code> 等の機密ファイルがWebから直接アクセスできる脆弱性です。
      </p>

      <div style={{ display: "flex", gap: 24, marginTop: 24 }}>
        {/* 脆弱バージョン */}
        <div style={{ flex: 1 }}>
          <h3 style={{ color: "#c00" }}>脆弱バージョン</h3>
          <button onClick={() => handleFetchAll("vulnerable")} disabled={loading !== null}>
            {loading === "all-vulnerable" ? "取得中..." : "全ファイル取得"}
          </button>

          {TARGET_FILES.map((file) => (
            <div key={file.path} style={{ marginTop: 16, borderBottom: "1px solid #ddd", paddingBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <code>{file.label}</code>
                <button
                  onClick={() => handleFetchVulnerable(file.path)}
                  disabled={loading !== null}
                  style={{ fontSize: 12 }}
                >
                  取得
                </button>
              </div>
              {renderResult(vulnerableResults[file.path] ?? null)}
            </div>
          ))}
        </div>

        {/* 安全バージョン */}
        <div style={{ flex: 1 }}>
          <h3 style={{ color: "#080" }}>安全バージョン</h3>
          <button onClick={() => handleFetchAll("secure")} disabled={loading !== null}>
            {loading === "all-secure" ? "取得中..." : "全ファイル取得"}
          </button>

          {TARGET_FILES.map((file) => (
            <div key={file.path} style={{ marginTop: 16, borderBottom: "1px solid #ddd", paddingBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <code>{file.label}</code>
                <button
                  onClick={() => handleFetchSecure(file.path)}
                  disabled={loading !== null}
                  style={{ fontSize: 12 }}
                >
                  取得
                </button>
              </div>
              {renderResult(secureResults[file.path] ?? null)}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 32, padding: 16, background: "#f0f0f0", borderRadius: 4 }}>
        <h3>確認ポイント</h3>
        <ul>
          <li>脆弱版: <code>.env</code> のDB接続情報やAPIキーが取得できるか</li>
          <li>脆弱版: <code>.git/HEAD</code> からリポジトリの存在が確認できるか</li>
          <li>安全版: ドットファイルへのアクセスが <strong>403 Forbidden</strong> で拒否されるか</li>
          <li>ターミナルで <code>curl http://localhost:3000/api/labs/sensitive-file-exposure/vulnerable/.env</code> も試してみよう</li>
        </ul>
      </div>
    </div>
  );
}
