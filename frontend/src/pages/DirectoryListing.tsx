import { useState } from "react";

type FetchResult = {
  status: number;
  contentType: string;
  body: string;
} | null;

export function DirectoryListing() {
  const [vulnerableListing, setVulnerableListing] = useState<FetchResult>(null);
  const [secureListing, setSecureListing] = useState<FetchResult>(null);
  const [fileResult, setFileResult] = useState<FetchResult>(null);
  const [secureFileResult, setSecureFileResult] = useState<FetchResult>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const fetchUrl = async (url: string): Promise<FetchResult> => {
    const res = await fetch(url);
    const body = await res.text();
    return {
      status: res.status,
      contentType: res.headers.get("content-type") ?? "",
      body,
    };
  };

  const handleFetchListing = async (mode: "vulnerable" | "secure") => {
    setLoading(`listing-${mode}`);
    try {
      const result = await fetchUrl(`/api/labs/directory-listing/${mode}/static/`);
      if (mode === "vulnerable") {
        setVulnerableListing(result);
      } else {
        setSecureListing(result);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(null);
  };

  const handleFetchFile = async (mode: "vulnerable" | "secure", filename: string) => {
    setLoading(`file-${mode}-${filename}`);
    try {
      const result = await fetchUrl(`/api/labs/directory-listing/${mode}/static/${filename}`);
      if (mode === "vulnerable") {
        setFileResult(result);
      } else {
        setSecureFileResult(result);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(null);
  };

  const renderResult = (result: FetchResult, isHtml = false) => {
    if (!result) return null;
    const isError = result.status >= 400;
    return (
      <div style={{ marginTop: 8 }}>
        <div style={{ fontSize: 13 }}>
          Status:{" "}
          <span style={{ color: isError ? "#c00" : "#080", fontWeight: "bold" }}>
            {result.status}
          </span>
          {" | "}Content-Type: <code>{result.contentType}</code>
        </div>
        {isHtml && !isError ? (
          <div
            style={{
              background: "#fff",
              border: "1px solid #ccc",
              padding: 12,
              borderRadius: 4,
              marginTop: 4,
              maxHeight: 300,
              overflow: "auto",
            }}
            dangerouslySetInnerHTML={{ __html: result.body }}
          />
        ) : (
          <pre
            style={{
              background: isError ? "#2e1a1a" : "#1a1a2e",
              color: isError ? "#ff6b6b" : "#4ecdc4",
              padding: 12,
              borderRadius: 4,
              overflow: "auto",
              fontSize: 12,
              maxHeight: 300,
            }}
          >
            {result.body}
          </pre>
        )}
      </div>
    );
  };

  return (
    <div>
      <h2>Directory Listing</h2>
      <p>ディレクトリリスティングによる情報漏洩</p>
      <p style={{ color: "#666" }}>
        ディレクトリにアクセスするとファイル一覧が表示され、バックアップファイルや機密ファイルの存在が判明する脆弱性です。
      </p>

      <div style={{ display: "flex", gap: 24, marginTop: 24 }}>
        {/* 脆弱バージョン */}
        <div style={{ flex: 1 }}>
          <h3 style={{ color: "#c00" }}>脆弱バージョン</h3>

          <div style={{ marginBottom: 16 }}>
            <h4>1. ディレクトリ一覧の取得</h4>
            <p style={{ fontSize: 13 }}><code>GET /api/labs/directory-listing/vulnerable/static/</code></p>
            <button onClick={() => handleFetchListing("vulnerable")} disabled={loading !== null}>
              ディレクトリ一覧を取得
            </button>
            {renderResult(vulnerableListing, true)}
          </div>

          <div>
            <h4>2. 機密ファイルの取得</h4>
            <p style={{ fontSize: 13 }}>一覧で見つけたファイルにアクセス:</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["config.bak", "database.sql", ".htpasswd", ".env.backup"].map((f) => (
                <button
                  key={f}
                  onClick={() => handleFetchFile("vulnerable", f)}
                  disabled={loading !== null}
                  style={{ fontSize: 12 }}
                >
                  {f}
                </button>
              ))}
            </div>
            {renderResult(fileResult)}
          </div>
        </div>

        {/* 安全バージョン */}
        <div style={{ flex: 1 }}>
          <h3 style={{ color: "#080" }}>安全バージョン</h3>

          <div style={{ marginBottom: 16 }}>
            <h4>1. ディレクトリ一覧の取得</h4>
            <p style={{ fontSize: 13 }}><code>GET /api/labs/directory-listing/secure/static/</code></p>
            <button onClick={() => handleFetchListing("secure")} disabled={loading !== null}>
              ディレクトリ一覧を取得
            </button>
            {renderResult(secureListing)}
          </div>

          <div>
            <h4>2. 機密ファイルの取得</h4>
            <p style={{ fontSize: 13 }}>機密ファイルへのアクセスを試行:</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["config.bak", "database.sql", ".htpasswd", ".env.backup"].map((f) => (
                <button
                  key={f}
                  onClick={() => handleFetchFile("secure", f)}
                  disabled={loading !== null}
                  style={{ fontSize: 12 }}
                >
                  {f}
                </button>
              ))}
            </div>
            {renderResult(secureFileResult)}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 32, padding: 16, background: "#f0f0f0", borderRadius: 4 }}>
        <h3>確認ポイント</h3>
        <ul>
          <li>脆弱版: ディレクトリ一覧が表示され、全ファイルの存在が丸見えか</li>
          <li>脆弱版: <code>config.bak</code> や <code>database.sql</code> の中身が取得できるか</li>
          <li>安全版: ディレクトリ一覧が <strong>403 Forbidden</strong> で拒否されるか</li>
          <li>安全版: ドットファイルやバックアップファイルも <strong>403</strong> で拒否されるか</li>
        </ul>
      </div>
    </div>
  );
}
