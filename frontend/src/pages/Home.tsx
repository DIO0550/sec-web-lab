import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type HealthStatus = {
  status: string;
  db: string;
  time: string;
} | null;

const LABS = [
  {
    id: "header-leakage",
    name: "HTTPヘッダー情報漏洩",
    description: "X-Powered-By, Server 等のヘッダーから技術スタックが特定される",
    difficulty: 1,
    path: "/labs/header-leakage",
  },
  {
    id: "sensitive-file-exposure",
    name: "機密ファイルの露出",
    description: ".env, .git/, robots.txt 等の機密ファイルがWebからアクセス可能",
    difficulty: 1,
    path: "/labs/sensitive-file-exposure",
  },
  {
    id: "error-message-leakage",
    name: "エラーメッセージ情報漏洩",
    description: "エラーメッセージにSQL文やスタックトレース等の内部情報が含まれる",
    difficulty: 1,
    path: "/labs/error-message-leakage",
  },
  {
    id: "directory-listing",
    name: "ディレクトリリスティング",
    description: "ディレクトリ一覧が表示され、ファイル構成が外部から丸見えになる",
    difficulty: 1,
    path: "/labs/directory-listing",
  },
  {
    id: "header-exposure",
    name: "セキュリティヘッダー欠如",
    description: "セキュリティヘッダーが未設定でブラウザの保護機能が無効のまま",
    difficulty: 1,
    path: "/labs/header-exposure",
  },
];

export function Home() {
  const [health, setHealth] = useState<HealthStatus>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then(setHealth)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div>
      <h2>Step 01: Recon (偵察フェーズ)</h2>
      <p>
        攻撃者がターゲットの情報を収集するフェーズで悪用される脆弱性を体験します。
        各ラボには<strong>脆弱バージョン</strong>と<strong>安全バージョン</strong>があり、
        攻撃と防御の両方を学べます。
      </p>

      <div style={{ marginTop: 24 }}>
        {LABS.map((lab) => (
          <div
            key={lab.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 4,
              padding: 16,
              marginBottom: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h3 style={{ margin: "0 0 4px 0" }}>
                <Link to={lab.path} style={{ textDecoration: "none" }}>
                  {lab.name}
                </Link>
              </h3>
              <p style={{ margin: 0, color: "#666", fontSize: 14 }}>{lab.description}</p>
            </div>
            <div style={{ textAlign: "right", minWidth: 80 }}>
              <span style={{ fontSize: 12, color: "#888" }}>
                {"★".repeat(lab.difficulty)}{"☆".repeat(3 - lab.difficulty)}
              </span>
              <br />
              <Link
                to={lab.path}
                style={{
                  display: "inline-block",
                  marginTop: 4,
                  padding: "4px 12px",
                  background: "#333",
                  color: "#fff",
                  borderRadius: 4,
                  textDecoration: "none",
                  fontSize: 13,
                }}
              >
                Start
              </Link>
            </div>
          </div>
        ))}
      </div>

      <h3 style={{ marginTop: 32 }}>Server Status</h3>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {health ? (
        <pre style={{ background: "#f5f5f5", padding: 12, borderRadius: 4 }}>
          {JSON.stringify(health, null, 2)}
        </pre>
      ) : (
        !error && <p>Loading...</p>
      )}
    </div>
  );
}
