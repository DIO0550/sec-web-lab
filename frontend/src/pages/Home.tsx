import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { NAVIGATION } from "@/data/navigation";

type HealthStatus = {
  status: string;
  db: string;
  time: string;
} | null;

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
        {NAVIGATION.map((step) => (
            <div
              key={step.id}
              className="border rounded p-4 mb-3 flex justify-between items-center border-border dark:border-border"
            >
              <div>
                <h3 className="m-0 mb-1">
                  <Link to={step.path} className="no-underline">
                    {step.name}
                  </Link>
                </h3>
                <p className="m-0 text-text-secondary dark:text-text-secondary text-sm">{step.description}</p>
              </div>
              <div className="text-right min-w-[100px]">
                <span className="text-xs text-text-muted dark:text-text-muted">
                  {`${step.labs.length} labs`}
                </span>
                <br />
                <Link
                  to={step.path}
                  className="inline-block mt-1 px-3 py-1 bg-accent dark:bg-accent text-white rounded no-underline text-[13px] hover:bg-accent-hover dark:hover:bg-accent-hover"
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
        <pre className="bg-bg-secondary dark:bg-bg-secondary p-3 rounded">
          {JSON.stringify(health, null, 2)}
        </pre>
      ) : (
        !error && <p>Loading...</p>
      )}
    </div>
  );
}
