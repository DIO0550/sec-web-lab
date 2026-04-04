import { useEffect, useState } from "react";
import { NAVIGATION } from "@/data/navigation";
import { Card } from "@/components/Card";

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
      <div className="bg-bg-primary rounded-xl p-8 mb-10 shadow-sm border border-border-light">
        <h1 className="text-3xl font-semibold text-accent m-0">sec-web-lab</h1>
        <p className="text-lg text-text-secondary mt-2 mb-0">Web Security Hands-on Laboratory</p>
        <p className="mt-3 mb-0">
          Webセキュリティの脆弱性をステップごとに体験して学びます。
          各ステップには複数のラボがあり、<strong>脆弱バージョン</strong>と
          <strong>安全バージョン</strong>の両方を試せます。
        </p>
      </div>

      <h2 className="text-xl font-semibold border-l-4 border-accent pl-3">Learning Steps</h2>

      <div className="mt-6">
        {NAVIGATION.map((step) => (
            <Card
              key={step.id}
              variant="bordered"
              to={step.path}
              className="mb-3 flex justify-between items-center"
            >
              <div>
                <h3 className="m-0 mb-1">{step.name}</h3>
                <p className="m-0 text-text-secondary text-sm">{step.description}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-text-muted">
                  {`${step.labs.length} labs`}
                </span>
              </div>
            </Card>
        ))}
      </div>

      <h3 className="mt-8 text-lg font-semibold">Server Status</h3>
      {error && <p className="text-error-text-light">Error: {error}</p>}
      {health ? (
        <pre className="bg-bg-primary p-4 rounded-xl border border-border-light">
          {JSON.stringify(health, null, 2)}
        </pre>
      ) : (
        !error && <p>Loading...</p>
      )}
    </div>
  );
}
