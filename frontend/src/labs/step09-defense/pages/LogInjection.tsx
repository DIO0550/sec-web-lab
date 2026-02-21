import { useState, useCallback } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

const BASE = "/api/labs/log-injection";

type LogEntry = { timestamp: string; message: string; mode: string };

function LogInjPanel({ mode, logs, isLoading, onLogin, onViewLogs }: { mode: "vulnerable" | "secure"; logs: LogEntry[]; isLoading: boolean; onLogin: (username: string) => void; onViewLogs: () => void }) {
  const [username, setUsername] = useState("user1");

  const presets = [
    { label: "通常", value: "user1" },
    { label: "ログ偽装", value: "user1\n[INFO] Login success: username=admin" },
    { label: "ログ消去", value: "user1\n\n\n\n\n[INFO] System clean" },
  ];

  return (
    <div>
      <div className="mb-2">
        <label className="text-[13px] block">ユーザー名:</label>
        <textarea value={username} onChange={(e) => setUsername(e.target.value)} className="py-1 px-2 border border-[#ccc] rounded w-full text-sm font-mono" rows={2} />
      </div>
      <div className="flex gap-1 flex-wrap mb-2">
        {presets.map((p) => (
          <button key={p.label} onClick={() => setUsername(p.value)} className="text-[11px] py-0.5 px-2 cursor-pointer">{p.label}</button>
        ))}
      </div>
      <div className="flex gap-2 mb-2">
        <FetchButton onClick={() => onLogin(username)} disabled={isLoading}>ログイン試行</FetchButton>
        <FetchButton onClick={onViewLogs} disabled={isLoading}>ログ閲覧</FetchButton>
      </div>
      {logs.length > 0 && (
        <div className="mt-2 max-h-[250px] overflow-auto bg-[#1a1a1a] p-2 rounded">
          {logs.map((log, i) => (
            <div key={i} className="text-[10px] text-[#0f0] font-mono">{log.timestamp.substring(11, 19)} | {log.message}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export function LogInjection() {
  const [vulnLogs, setVulnLogs] = useState<LogEntry[]>([]);
  const [secureLogs, setSecureLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(async (mode: "vulnerable" | "secure", username: string) => {
    setLoading(true);
    try {
      await fetch(`${BASE}/${mode}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password: "wrongpass" }),
      });
    } catch {}
    setLoading(false);
  }, []);

  const handleViewLogs = useCallback(async (mode: "vulnerable" | "secure") => {
    const res = await fetch(`${BASE}/logs`);
    const data = await res.json();
    const filtered = (data.logs as LogEntry[]).filter((l) => l.mode === mode);
    if (mode === "vulnerable") setVulnLogs(filtered);
    else setSecureLogs(filtered);
  }, []);

  return (
    <LabLayout title="ログインジェクション" subtitle="ユーザー入力に改行コードを含めてログを改ざん" description="ユーザー名に改行コードを含めることで、偽のログ行を作成してログ分析を妨害したり、成功したログインに見せかけることができる攻撃を体験します。">
      <ComparisonPanel
        vulnerableContent={<LogInjPanel mode="vulnerable" logs={vulnLogs} isLoading={loading} onLogin={(u) => handleLogin("vulnerable", u)} onViewLogs={() => handleViewLogs("vulnerable")} />}
        secureContent={<LogInjPanel mode="secure" logs={secureLogs} isLoading={loading} onLogin={(u) => handleLogin("secure", u)} onViewLogs={() => handleViewLogs("secure")} />}
      />
      <CheckpointBox>
        <ul>
          <li>脆弱版: 偽のログ行が作成されて正規のログインに見えるか</li>
          <li>安全版: 改行コードが除去されて1行のログになるか</li>
          <li>ログインジェクションがフォレンジック調査を妨害する危険性を理解したか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
