import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type HealthStatus = {
  status: string;
  db: string;
  time: string;
} | null;

const STEPS = [
  {
    id: "step01",
    name: "Step 01: Recon (偵察フェーズ)",
    description: "攻撃者がターゲットの情報を収集するフェーズで悪用される脆弱性を体験",
    labCount: 5,
    path: "/step01",
  },
  {
    id: "step02",
    name: "Step 02: Injection (インジェクション)",
    description: "SQL Injection, XSS 等の入力値を悪用した攻撃",
    labCount: 0,
    path: "/step02",
    comingSoon: true,
  },
  {
    id: "step03",
    name: "Step 03: Auth (認証)",
    description: "認証の欠陥を悪用した攻撃",
    labCount: 0,
    path: "/step03",
    comingSoon: true,
  },
  {
    id: "step04",
    name: "Step 04: Session (セッション管理)",
    description: "セッション管理の脆弱性を悪用した攻撃",
    labCount: 0,
    path: "/step04",
    comingSoon: true,
  },
  {
    id: "step05",
    name: "Step 05: Access Control (アクセス制御)",
    description: "アクセス制御の不備を悪用した攻撃",
    labCount: 0,
    path: "/step05",
    comingSoon: true,
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
      <h2>Learning Steps</h2>
      <p>
        Webセキュリティの脆弱性をステップごとに体験して学びます。
        各ステップには複数のラボがあり、<strong>脆弱バージョン</strong>と
        <strong>安全バージョン</strong>の両方を試せます。
      </p>

      <div style={{ marginTop: 24 }}>
        {STEPS.map((step) => {
          const isAvailable = !step.comingSoon;
          return (
            <div
              key={step.id}
              style={{
                border: `1px solid ${isAvailable ? "#333" : "#ddd"}`,
                borderRadius: 4,
                padding: 16,
                marginBottom: 12,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                opacity: isAvailable ? 1 : 0.5,
              }}
            >
              <div>
                <h3 style={{ margin: "0 0 4px 0" }}>
                  {isAvailable ? (
                    <Link to={step.path} style={{ textDecoration: "none" }}>
                      {step.name}
                    </Link>
                  ) : (
                    step.name
                  )}
                </h3>
                <p style={{ margin: 0, color: "#666", fontSize: 14 }}>{step.description}</p>
              </div>
              <div style={{ textAlign: "right", minWidth: 100 }}>
                <span style={{ fontSize: 12, color: "#888" }}>
                  {step.labCount > 0 ? `${step.labCount} labs` : "coming soon"}
                </span>
                <br />
                {isAvailable && (
                  <Link
                    to={step.path}
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
                )}
              </div>
            </div>
          );
        })}
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
