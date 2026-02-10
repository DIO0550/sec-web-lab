import { useEffect, useState } from "react";

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
      <h2>Labs</h2>
      <p>各ラボを選択して脆弱性を体験してください。</p>

      <ul>
        <li>SQL Injection - <em>coming soon</em></li>
        <li>XSS (Cross-Site Scripting) - <em>coming soon</em></li>
        <li>CSRF (Cross-Site Request Forgery) - <em>coming soon</em></li>
        <li>Broken Authentication - <em>coming soon</em></li>
        <li>IDOR (Insecure Direct Object Reference) - <em>coming soon</em></li>
      </ul>

      <h3>Server Status</h3>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {health ? (
        <pre>{JSON.stringify(health, null, 2)}</pre>
      ) : (
        !error && <p>Loading...</p>
      )}
    </div>
  );
}
