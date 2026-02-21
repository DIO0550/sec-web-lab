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
    labCount: 5,
    path: "/step03",
  },
  {
    id: "step04",
    name: "Step 04: Session (セッション管理)",
    description: "セッション管理の脆弱性を悪用した攻撃",
    labCount: 4,
    path: "/step04",
  },
  {
    id: "step05",
    name: "Step 05: Access Control (アクセス制御)",
    description: "アクセス制御の不備を悪用した攻撃",
    labCount: 4,
    path: "/step05",
  },
  {
    id: "step06",
    name: "Step 06: Server-Side (サーバーサイド攻撃)",
    description: "SSRF, XXE, ファイルアップロード等のサーバーサイド脆弱性を体験",
    labCount: 6,
    path: "/step06",
  },
  {
    id: "step07",
    name: "Step 07: Design & Logic (設計とロジック)",
    description: "レート制限、ビジネスロジック、セキュリティヘッダー等の設計上の問題",
    labCount: 10,
    path: "/step07",
  },
  {
    id: "step08",
    name: "Step 08: Advanced (高度な攻撃)",
    description: "JWT改ざん、SSTI、レースコンディション、Prototype Pollution等の高度な手法",
    labCount: 7,
    path: "/step08",
  },
  {
    id: "step09",
    name: "Step 09: Defense (守りを固める)",
    description: "エラーハンドリング、ログ管理、CSP、入力バリデーション等の防御手法",
    labCount: 7,
    path: "/step09",
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
        {STEPS.map((step) => (
            <div
              key={step.id}
              className="border rounded p-4 mb-3 flex justify-between items-center border-[#333]"
            >
              <div>
                <h3 className="m-0 mb-1">
                  <Link to={step.path} className="no-underline">
                    {step.name}
                  </Link>
                </h3>
                <p className="m-0 text-[#666] text-sm">{step.description}</p>
              </div>
              <div className="text-right min-w-[100px]">
                <span className="text-xs text-[#888]">
                  {`${step.labCount} labs`}
                </span>
                <br />
                <Link
                  to={step.path}
                  className="inline-block mt-1 px-3 py-1 bg-[#333] text-white rounded no-underline text-[13px]"
                >
                  Start
                </Link>
              </div>
            </div>
        ))}
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
