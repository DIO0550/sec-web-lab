import { useState, useCallback } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";

const BASE = "/api/labs/logging";

type LogEntry = { timestamp: string; level: string; message: string; mode: string };

function LogPanel({ mode, logs, isLoading, onLogin, onViewLogs }: { mode: "vulnerable" | "secure"; logs: LogEntry[]; isLoading: boolean; onLogin: () => void; onViewLogs: () => void }) {
  return (
    <div>
      <div className="flex gap-2 mb-2">
        <FetchButton onClick={onLogin} disabled={isLoading}>ログイン試行</FetchButton>
        <FetchButton onClick={onViewLogs} disabled={isLoading}>ログ閲覧</FetchButton>
      </div>
      {logs.length > 0 && (
        <div className="mt-2 max-h-[250px] overflow-auto">
          {logs.map((log, i) => (
            <div key={i} className={`text-[10px] p-1 mb-1 rounded font-mono ${log.level === "WARN" ? "bg-[#fff3e0]" : "bg-[#f5f5f5]"}`}>
              [{log.timestamp.substring(11, 19)}] [{log.level}] {log.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Logging() {
  const [vulnLogs, setVulnLogs] = useState<LogEntry[]>([]);
  const [secureLogs, setSecureLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(async (mode: "vulnerable" | "secure") => {
    setLoading(true);
    try {
      await fetch(`${BASE}/${mode}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "admin", password: "admin123" }),
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
    <LabLayout title="不適切なログ記録" subtitle="パスワードやトークンがログに平文で記録される" description="ログにパスワード、セッショントークン、APIキー等の機密情報が平文で記録されると、ログアクセス権を持つ人やログ管理サービスに漏洩する脆弱性を体験します。">
      <ComparisonPanel
        vulnerableContent={<LogPanel mode="vulnerable" logs={vulnLogs} isLoading={loading} onLogin={() => handleLogin("vulnerable")} onViewLogs={() => handleViewLogs("vulnerable")} />}
        secureContent={<LogPanel mode="secure" logs={secureLogs} isLoading={loading} onLogin={() => handleLogin("secure")} onViewLogs={() => handleViewLogs("secure")} />}
      />
      <CheckpointBox>
        <ul>
          <li>脆弱版: ログにパスワードとトークンが平文で記録されているか</li>
          <li>安全版: パスワードが *** でマスクされ、トークンが記録されていないか</li>
          <li>ログに記録してはいけない情報の一覧を理解したか</li>
        </ul>
      </CheckpointBox>
    </LabLayout>
  );
}
