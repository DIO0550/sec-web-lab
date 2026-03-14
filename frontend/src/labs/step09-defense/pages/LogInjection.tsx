import { useState, useCallback } from "react";
import { LabLayout } from "../../../components/LabLayout";
import { ComparisonPanel } from "../../../components/ComparisonPanel";
import { FetchButton } from "../../../components/FetchButton";
import { CheckpointBox } from "../../../components/CheckpointBox";
import { ExpandableSection } from "../../../components/ExpandableSection";
import { Textarea } from "@/components/Textarea";
import { PresetButtons } from "@/components/PresetButtons";
import { postJson, getJson } from "../../../utils/api";

const BASE = "/api/labs/log-injection";

type LogEntry = { timestamp: string; message: string; mode: string };

const presets = [
  { label: "通常", value: "user1" },
  { label: "ログ偽装", value: "user1\n[INFO] Login success: username=admin" },
  { label: "ログ消去", value: "user1\n\n\n\n\n[INFO] System clean" },
];

function LogInjPanel({ mode, logs, isLoading, onLogin, onViewLogs }: { mode: "vulnerable" | "secure"; logs: LogEntry[]; isLoading: boolean; onLogin: (username: string) => void; onViewLogs: () => void }) {
  const [username, setUsername] = useState("user1");

  return (
    <div>
      <Textarea label="ユーザー名:" value={username} onChange={(e) => setUsername(e.target.value)} mono rows={2} className="mb-2" />
      <PresetButtons presets={presets} onSelect={(p) => setUsername(p.value)} className="mb-2" />
      <div className="flex gap-2 mb-2">
        <FetchButton onClick={() => onLogin(username)} disabled={isLoading}>ログイン試行</FetchButton>
        <FetchButton onClick={onViewLogs} disabled={isLoading}>ログ閲覧</FetchButton>
      </div>
      <ExpandableSection isOpen={logs.length > 0}>
        <div className="mt-2 max-h-[250px] overflow-auto bg-terminal-bg p-2 rounded">
          {logs.map((log, i) => (
            <div key={i} className="text-[10px] text-terminal-text font-mono">{log.timestamp.substring(11, 19)} | {log.message}</div>
          ))}
        </div>
      </ExpandableSection>
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
      await postJson(`${BASE}/${mode}/login`, { username, password: "wrongpass" });
    } catch {}
    setLoading(false);
  }, []);

  const handleViewLogs = useCallback(async (mode: "vulnerable" | "secure") => {
    const data = await getJson<{ logs: LogEntry[] }>(`${BASE}/logs`);
    const filtered = data.logs.filter((l) => l.mode === mode);
    if (mode === "vulnerable") {
      setVulnLogs(filtered);
    } else {
      setSecureLogs(filtered);
    }
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
