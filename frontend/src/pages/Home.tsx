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
    description: "SQL Injection, XSS, コマンドインジェクション等の入力値を悪用した攻撃",
    labCount: 4,
    path: "/step02",
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

      <div className="mt-6">
        {STEPS.map((step) => {
          const isAvailable = !step.comingSoon;
          return (
            <div
              key={step.id}
              className={`border rounded p-4 mb-3 flex justify-between items-center ${isAvailable ? "border-[#333]" : "border-[#ddd] opacity-50"}`}
            >
              <div>
                <h3 className="m-0 mb-1">
                  {isAvailable ? (
                    <Link to={step.path} className="no-underline">
                      {step.name}
                    </Link>
                  ) : (
                    step.name
                  )}
                </h3>
                <p className="m-0 text-[#666] text-sm">{step.description}</p>
              </div>
              <div className="text-right min-w-[100px]">
                <span className="text-xs text-[#888]">
                  {step.labCount > 0 ? `${step.labCount} labs` : "coming soon"}
                </span>
                <br />
                {isAvailable && (
                  <Link
                    to={step.path}
                    className="inline-block mt-1 px-3 py-1 bg-[#333] text-white rounded no-underline text-[13px]"
                  >
                    Start
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <h3 className="mt-8">Server Status</h3>
      {error && <p className="text-red-600">Error: {error}</p>}
      {health ? (
        <pre className="bg-[#f5f5f5] p-3 rounded">
          {JSON.stringify(health, null, 2)}
        </pre>
      ) : (
        !error && <p>Loading...</p>
      )}
    </div>
  );
}
